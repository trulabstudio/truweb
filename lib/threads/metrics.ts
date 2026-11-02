export type AccountPost = { at: string; text: string; link: string; views: number; likes: number; replies: number };
export type HourStat = { hour: number; posts: number; medianViews: number };
export type ReportPost = { stage: string; posted_at: string | null; views: number; likes: number; replies: number; comments: number; enquiries: number };

const DAY = 86_400_000;
const MYT_HOURS = 8;
const WINDOW = 14 * DAY;
// New posts are still collecting views, so they would make every comparison look worse.
const SETTLE = 2 * DAY;
const MIN_POSTS = 3;
// Old posts are left out because the account's reach has changed too much for them to say anything about now.
const HOUR_WINDOW = 90 * DAY;
const MIN_HOUR_POSTS = 5;

export function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Hours in Malaysia time, best first. Hours with too few posts are left out because one viral post would decide them. */
export function bestHours(posts: AccountPost[], now: number): HourStat[] {
  const byHour = new Map<number, number[]>();
  for (const post of posts.filter((item) => Date.parse(item.at) > now - HOUR_WINDOW)) {
    const hour = (new Date(post.at).getUTCHours() + MYT_HOURS) % 24;
    byHour.set(hour, [...(byHour.get(hour) ?? []), post.views]);
  }
  return [...byHour]
    .filter(([, views]) => views.length >= MIN_HOUR_POSTS)
    .map(([hour, views]) => ({ hour, posts: views.length, medianViews: median(views) }))
    .sort((a, b) => b.medianViews - a.medianViews);
}

/** The strongest waking hours that are at least three hours apart, or nothing if there are not enough of them. */
export function suggestTimes(hours: HourStat[], count: number) {
  const picked: number[] = [];
  for (const { hour } of hours) {
    if (hour >= 7 && hour <= 22 && picked.length < count && picked.every((other) => Math.abs(other - hour) >= 3)) picked.push(hour);
  }
  return picked.length === count ? picked.sort((a, b) => a - b).map((hour) => `${String(hour).padStart(2, "0")}:00`) : [];
}

const measures: Record<string, (posts: ReportPost[]) => number> = {
  attract: (posts) => median(posts.map((post) => post.views)),
  trust: (posts) => posts.reduce((sum, post) => sum + post.likes + post.replies, 0) / (posts.length || 1),
  offer: (posts) => posts.reduce((sum, post) => sum + post.enquiries, 0) / (posts.length || 1),
};

/** Compares the last 14 settled days with the 14 before them, one main measure per funnel stage. */
export function funnelReport(posts: ReportPost[], now: number) {
  const end = now - SETTLE;
  const within = (from: number, to: number) => posts.filter((post) => {
    const at = post.posted_at ? Date.parse(post.posted_at) : 0;
    return at > from && at <= to;
  });
  const current = within(end - WINDOW, end);
  const previous = within(end - 2 * WINDOW, end - WINDOW);
  return Object.keys(measures).map((stage) => {
    const now = current.filter((post) => post.stage === stage);
    const before = previous.filter((post) => post.stage === stage);
    const value = measures[stage](now);
    const earlier = measures[stage](before);
    const comparable = now.length >= MIN_POSTS && before.length >= MIN_POSTS;
    return {
      stage,
      posts: now.length,
      value: now.length >= MIN_POSTS ? value : null,
      earlier: before.length >= MIN_POSTS ? earlier : null,
      result: !comparable ? "wait" : value > earlier ? "better" : value < earlier ? "worse" : "same",
    };
  });
}

/** Follower change over 14 days, from daily snapshots. Null until a snapshot that old exists. */
export function followerChange(history: { day: string; count: number }[], now: number) {
  const cutoff = new Date(now - WINDOW).toISOString().slice(0, 10);
  const old = [...history].reverse().find((entry) => entry.day <= cutoff);
  const latest = history.at(-1);
  return old && latest ? latest.count - old.count : null;
}

export type Focus = { focus: "reach" | "trust" | "prospects" | "steady"; mix: { attract: number; trust: number; offer: number }; target: number; actual: number };

const MIN_REACH = 100;
const REACH_SHARE = 0.25;
const ENGAGEMENT_TARGET = 1.5;
const ENQUIRY_TARGET = 0.5;
const STRATEGY_WINDOW = 30 * DAY;

/**
 * Works on the weakest step first: no reach means nobody to convince, and no trust means offers are wasted.
 * The targets are starting points, and are shown in the panel so they can be questioned.
 */
export function chooseFocus(posts: AccountPost[], followers: number, offers: { enquiries: number }[], now: number): Focus {
  const recent = posts.filter((post) => Date.parse(post.at) > now - STRATEGY_WINDOW && Date.parse(post.at) <= now - SETTLE);
  if (recent.length < 5) return { focus: "steady", mix: { attract: 4, trust: 2, offer: 1 }, target: 5, actual: recent.length };
  const views = median(recent.map((post) => post.views));
  const reachTarget = Math.max(MIN_REACH, Math.round(followers * REACH_SHARE));
  if (views < reachTarget) return { focus: "reach", mix: { attract: 5, trust: 2, offer: 1 }, target: reachTarget, actual: views };
  const totalViews = recent.reduce((sum, post) => sum + post.views, 0);
  const engagement = totalViews ? (recent.reduce((sum, post) => sum + post.likes + post.replies, 0) / totalViews) * 100 : 0;
  if (engagement < ENGAGEMENT_TARGET) return { focus: "trust", mix: { attract: 3, trust: 3, offer: 1 }, target: ENGAGEMENT_TARGET, actual: Math.round(engagement * 10) / 10 };
  const rate = offers.length ? offers.reduce((sum, post) => sum + post.enquiries, 0) / offers.length : 0;
  if (rate < ENQUIRY_TARGET) return { focus: "prospects", mix: { attract: 3, trust: 2, offer: 1 }, target: ENQUIRY_TARGET, actual: Math.round(rate * 10) / 10 };
  return { focus: "steady", mix: { attract: 4, trust: 2, offer: 1 }, target: ENQUIRY_TARGET, actual: Math.round(rate * 10) / 10 };
}

const FOCUS_BRIEF: Record<Focus["focus"], string> = {
  reach: "Too few people see the posts. Prioritise hooks and ideas that strangers would stop for and share.",
  trust: "People see the posts but rarely react. Prioritise useful, specific posts worth saving or answering.",
  prospects: "Reach and reactions are healthy but enquiries are low. Make the offer clearer and tie every post closer to a real business problem.",
  steady: "Keep a steady balance and keep testing different ideas.",
};
export const focusBrief = (focus: Focus["focus"]) => FOCUS_BRIEF[focus];
