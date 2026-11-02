import { siteConfig } from "@/lib/site-config";
import { generatePosts, generateReply, suggestTopics } from "./ai";
import { accountPosts, createContainer, followerCount, postInsights, postReplies, publishContainer, recentAccountPosts, refreshToken, threadsConfigured } from "./api";
import {
  acquireLock, claimReply, getPost, getSettings, getState, insertPosts, leadCountsBySource, postsWithStatus, repliesWithStatus, rest, setState, updatePost, updateReply, type ThreadsPost,
} from "./db";
import { chooseFocus, focusBrief, median, type AccountPost } from "./metrics";
import { containsKeyword, fitsThreads, hasLink, looksComplete, planStages, upcomingSlots, type ThreadsSettings } from "./schedule";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
// Meta recommends waiting about 30 seconds between creating a container and publishing it.
const CONTAINER_WAIT_MS = Number(process.env.THREADS_CONTAINER_WAIT_MS ?? 30_000);
const QUEUED = ["draft", "scheduled"];

const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 500);
const ready = (at: string | null) => Boolean(at) && Date.now() - Date.parse(at as string) >= CONTAINER_WAIT_MS;

async function elapsed(key: string, ms: number) {
  return Date.now() - Number((await getState(key)) ?? 0) >= ms;
}
const stamp = (key: string) => setState(key, String(Date.now()));

const topPosts = (posts: AccountPost[], count: number) => posts.filter((post) => post.text).sort((a, b) => b.views - a.views).slice(0, count);

function freeSlots(settings: ThreadsSettings, queue: ThreadsPost[], days: number) {
  const taken = new Set(queue.map((post) => Date.parse(post.scheduled_at)));
  return upcomingSlots(new Date(), settings.postTimes, days).filter((slot) => !taken.has(Date.parse(slot)));
}

export async function fillQueue(force = false) {
  if (!process.env.ANTHROPIC_API_KEY) return 0;
  // A double click or a cron run at the same moment must not fill the same post times twice.
  if (!(await acquireLock("generate_lock", 5 * MINUTE))) return 0;
  try {
    return await generateQueue(force);
  } finally {
    await setState("generate_lock", null);
  }
}

async function generateQueue(force: boolean) {
  const settings = await getSettings();
  const queue = await postsWithStatus(QUEUED);
  const target = settings.postsPerDay * 3;
  const future = queue.filter((post) => Date.parse(post.scheduled_at) > Date.now());
  if (!force && (future.length >= target || !(await elapsed("last_generate", 6 * HOUR)))) return 0;
  const slots = freeSlots(settings, queue, 7).slice(0, force ? target : target - future.length);
  if (slots.length === 0) return 0;
  await stamp("last_generate");

  const position = Number((await getState("funnel_position")) ?? 0);
  const snapshot = await accountSnapshot();
  const focus = await currentFocus(snapshot?.posts ?? []);
  const stages = planStages(slots.length, settings.strategy === "auto" ? focus.mix : settings.mix, position);
  const [published, leads] = await Promise.all([postsWithStatus(["published"], "posted_at.desc", 50), leadCountsBySource()]);
  const winners = [
    ...[...published].filter((post) => leads.has(`threads-${post.id}`)).sort((a, b) => (leads.get(`threads-${b.id}`) ?? 0) - (leads.get(`threads-${a.id}`) ?? 0)).slice(0, 5).map((post) => post.text),
    ...topPosts(snapshot?.posts ?? [], 8).map((post) => post.text),
  ];
  const earlier = threadsConfigured() ? await recentAccountPosts() : published.map((post) => post.text);
  const proven = await topicSuggestions(snapshot?.posts ?? []);
  const middle = median(published.map((post) => post.views));
  const panelTopics = (keep: (views: number) => boolean) => [...new Set(published.filter((post) => post.topic && keep(post.views)).map((post) => post.topic as string))].slice(0, 8);
  const posts = await generatePosts(stages, settings, [...earlier, ...queue.map((post) => post.text)], winners, {
    brief: focusBrief(settings.strategy === "auto" ? focus.focus : "steady"),
    topics: proven.map((item) => item.topic),
    goodTopics: published.length >= 6 ? panelTopics((views) => views > middle) : [],
    weakTopics: published.length >= 6 ? panelTopics((views) => views < middle) : [],
    weakest: [...(snapshot?.posts ?? [])].filter((post) => post.text).sort((a, b) => a.views - b.views).slice(0, 5).map((post) => post.text),
  });
  if (posts.length) {
    await insertPosts(posts.map((post, index) => ({
      text: post.text, stage: post.stage, topic: post.topic,
      status: settings.mode === "auto" ? "scheduled" : "draft",
      scheduled_at: slots[index],
    })));
    await setState("funnel_position", String(position + stages.length));
  }
  return posts.length;
}

/** Moves queued posts onto the next free post times, keeping their order. */
export async function rescheduleQueue(settings: ThreadsSettings, onlyOverdue: boolean) {
  const queue = await postsWithStatus(QUEUED);
  const cutoff = Date.now() - 2 * HOUR;
  const moving = onlyOverdue ? queue.filter((post) => Date.parse(post.scheduled_at) < cutoff) : queue;
  if (moving.length === 0) return;
  const staying = queue.filter((post) => !moving.includes(post));
  const days = Math.ceil(moving.length / settings.postTimes.length) + 8;
  const slots = freeSlots(settings, staying, days);
  await Promise.all(moving.map((post, index) => updatePost(post.id, QUEUED, { scheduled_at: slots[index] })));
}

export async function nextFreeSlot(settings: ThreadsSettings) {
  const queue = await postsWithStatus(QUEUED);
  return freeSlots(settings, queue, 30)[0];
}

async function advancePosts() {
  // Runs that fail after this point are never retried automatically, so a post cannot go out twice.
  const [container] = await postsWithStatus(["container"], "container_at.asc", 1);
  if (container?.container_id && ready(container.container_at)) {
    const claimed = await updatePost(container.id, ["container"], { status: "publishing" });
    if (!claimed) return;
    try {
      const externalId = await publishContainer(container.container_id);
      await updatePost(container.id, ["publishing"], { status: "published", external_id: externalId, posted_at: new Date().toISOString(), error: null });
      if (container.stage === "offer") await claimReply({ reply_id: `self-${container.id}`, post_id: container.id, status: "pending", kind: "self", reply_to: externalId });
    } catch (error) {
      await updatePost(container.id, ["publishing"], { status: "failed", error: message(error) });
    }
    return;
  }
  if (container) return;

  const [due] = await rest<ThreadsPost[]>(`threads_posts?status=eq.scheduled&scheduled_at=lte.${new Date().toISOString()}&order=scheduled_at.asc&limit=1`);
  if (!due) return;
  const claimed = await updatePost(due.id, ["scheduled"], { status: "container" });
  if (!claimed) return;
  try {
    const id = await createContainer(due.text);
    await updatePost(due.id, ["container"], { container_id: id, container_at: new Date().toISOString() });
  } catch (error) {
    await updatePost(due.id, ["container"], { status: "failed", error: message(error) });
  }
}

async function advanceReplies(settings: ThreadsSettings) {
  for (const reply of await repliesWithStatus("container")) {
    if (!reply.container_id || !ready(reply.container_at)) continue;
    if (!(await updateReply(reply.reply_id, "container", { status: "publishing" }))) continue;
    try {
      await publishContainer(reply.container_id);
      await updateReply(reply.reply_id, "publishing", { status: "done" });
    } catch (error) {
      await updateReply(reply.reply_id, "publishing", { status: "failed", error: message(error) });
    }
  }
  for (const reply of await repliesWithStatus("pending")) {
    if (!(await updateReply(reply.reply_id, "pending", { status: "container" }))) continue;
    try {
      const post = await getPost(reply.post_id);
      const replyText = reply.kind === "conversation"
        ? await generateReply(reply.comment_text ?? "", post?.text ?? "", settings.keyword)
        : settings.replyText.replace("{link}", `${siteConfig.url}/?src=threads-${reply.post_id}#contact`);
      if (replyText === null) {
        await updateReply(reply.reply_id, "container", { status: "ignored" });
        continue;
      }
      if (!fitsThreads(replyText) || !looksComplete(replyText) || (reply.kind === "conversation" && hasLink(replyText))) throw new Error("The reply could not be sent safely.");
      const id = await createContainer(replyText, reply.reply_to ?? reply.reply_id);
      await updateReply(reply.reply_id, "container", { reply_text: replyText });
      await updateReply(reply.reply_id, "container", { container_id: id, container_at: new Date().toISOString() });
    } catch (error) {
      await updateReply(reply.reply_id, "container", { status: "failed", error: message(error) });
    }
  }
}

const recentPublished = () =>
  rest<ThreadsPost[]>(`threads_posts?status=eq.published&posted_at=gte.${new Date(Date.now() - 14 * 24 * HOUR).toISOString()}&order=posted_at.desc&limit=100`);

async function scanReplies(settings: ThreadsSettings) {
  await stamp("last_replies");
  if (!settings.autoReply) return;
  for (const post of await recentPublished()) {
    if (!post.external_id) continue;
    for (const reply of await postReplies(post.external_id)) {
      if (reply.is_reply_owned_by_me || !reply.text) continue;
      const kind = hasLink(reply.text) ? "ignored" : containsKeyword(reply.text, settings.keyword) ? "keyword" : "conversation";
      if (kind === "conversation" && !process.env.ANTHROPIC_API_KEY) continue;
      await claimReply({ reply_id: reply.id, post_id: post.id, status: kind === "ignored" ? "ignored" : "pending", kind, reply_to: reply.id, comment_text: reply.text, username: reply.username ?? null });
    }
  }
}

async function syncInsights() {
  await stamp("last_sync");
  for (const post of await recentPublished()) {
    if (post.external_id) await updatePost(post.id, ["published"], await postInsights(post.external_id));
  }
  await recordFollowers(await followerCount());
}

async function recordFollowers(count: number) {
  await setState("followers", String(count));
  const history = await followerHistory();
  const day = new Date().toISOString().slice(0, 10);
  await setState("followers_history", JSON.stringify([...history.filter((entry) => entry.day !== day), { day, count }].slice(-120)));
}

export async function followerHistory() {
  return JSON.parse((await getState("followers_history")) ?? "[]") as { day: string; count: number }[];
}

/** The saved account numbers, so admin pages never wait on Threads. The schedule keeps them fresh. */
export async function savedSnapshot() {
  const stored = await getState("account_snapshot");
  return stored ? (JSON.parse(stored) as { at: number; posts: AccountPost[] }) : null;
}

/** Reads account numbers at most every 6 hours. An old copy is used if Threads cannot be reached. */
export async function accountSnapshot() {
  if (!threadsConfigured()) return null;
  const cached = await savedSnapshot();
  if (cached && Date.now() - cached.at < 6 * HOUR) return cached;
  try {
    const [posts, followers] = await Promise.all([accountPosts(), followerCount()]);
    await recordFollowers(followers);
    const snapshot = { at: Date.now(), posts };
    await setState("account_snapshot", JSON.stringify(snapshot));
    return snapshot;
  } catch (error) {
    console.error("Threads snapshot:", message(error));
    return cached;
  }
}

/** What the funnel should work on now, from the account's last 30 days and the panel's BOFU posts. */
export async function currentFocus(posts: AccountPost[]) {
  const [followers, published, leads] = await Promise.all([getState("followers"), postsWithStatus(["published"], "posted_at.desc", 500), leadCountsBySource()]);
  const cutoff = Date.now() - 30 * 24 * HOUR;
  const offers = published.filter((post) => post.stage === "offer" && post.posted_at && Date.parse(post.posted_at) > cutoff).map((post) => ({ enquiries: leads.get(`threads-${post.id}`) ?? 0 }));
  return chooseFocus(posts, Number(followers ?? 0), offers, Date.now());
}

export async function savedTopics() {
  const stored = await getState("topic_suggestions");
  return stored ? (JSON.parse(stored) as { topics: { topic: string; views: number }[] }).topics : [];
}

/** Topics drawn from the account's strongest posts, refreshed weekly. Empty if they cannot be worked out. */
export async function topicSuggestions(posts: AccountPost[]) {
  if (!process.env.ANTHROPIC_API_KEY || posts.length === 0) return [];
  const stored = await getState("topic_suggestions");
  const cached = stored ? (JSON.parse(stored) as { at: number; topics: { topic: string; views: number }[] }) : null;
  if (cached && Date.now() - cached.at < 7 * 24 * HOUR) return cached.topics;
  try {
    const topics = await suggestTopics(topPosts(posts, 15));
    await setState("topic_suggestions", JSON.stringify({ at: Date.now(), topics }));
    return topics;
  } catch (error) {
    console.error("Threads topics:", message(error));
    return cached?.topics ?? [];
  }
}

export async function runTick() {
  const settings = await getSettings();
  await stamp("last_tick");
  const errors: string[] = [];
  const step = async (name: string, action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (error) {
      console.error(`Threads ${name}:`, message(error));
      errors.push(`${name}: ${message(error)}`);
    }
  };

  await step("reschedule", () => rescheduleQueue(settings, true));
  if (threadsConfigured()) {
    if (await elapsed("last_token_refresh", 7 * 24 * HOUR)) {
      await step("token refresh", async () => {
        await refreshToken();
        await stamp("last_token_refresh");
      });
    }
    if (await elapsed("last_sync", 30 * MINUTE)) await step("insights", syncInsights);
    if (!settings.paused) {
      await step("posting", advancePosts);
      if (await elapsed("last_replies", 5 * MINUTE)) await step("comments", () => scanReplies(settings));
      await step("replies", () => advanceReplies(settings));
    }
  }
  if (threadsConfigured()) {
    await step("account numbers", async () => {
      const snapshot = await accountSnapshot();
      await topicSuggestions(snapshot?.posts ?? []);
    });
  }
  if (!settings.paused) await step("content", () => fillQueue());
  await setState("engine_error", errors.join(" · ").slice(0, 500) || null);
  return { errors };
}

export async function threadsHealth() {
  const [lastTick, engineError, followers, failed, stuck, failedReplies] = await Promise.all([
    getState("last_tick"),
    getState("engine_error"),
    getState("followers"),
    postsWithStatus(["failed"], "scheduled_at.desc", 50),
    postsWithStatus(["publishing"], "scheduled_at.desc", 50),
    repliesWithStatus("failed", 50),
  ]);
  return {
    cronRunning: Date.now() - Number(lastTick ?? 0) < 10 * MINUTE,
    engineError,
    followers: followers === null ? null : Number(followers),
    failedPosts: failed.length,
    stuckPosts: stuck.filter((post) => Date.now() - Date.parse(post.scheduled_at) > HOUR).length,
    failedReplies: failedReplies.length,
    threadsConfigured: threadsConfigured(),
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  };
}
