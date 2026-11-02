import { acquireLock, getState, setState } from "@/lib/threads/db";
import { savedTopics } from "@/lib/threads/engine";
import { writeArticle, searchTopics } from "./ai";
import { refreshBlog } from "./cache";
import { allPosts, draftCount, getBlogMode, insertPost } from "./db";

const DAY = 86_400_000;
const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 500);

/** Writes one article, as a draft or published depending on the mode. Used by the button and the weekly schedule. */
export async function writeDraft() {
  if (!(await acquireLock("blog_lock", 10 * 60_000))) return null;
  try {
    const posts = await allPosts();
    // Topics that already work on Threads are searched for too, so they are offered alongside the list.
    const threadsTopics = (await savedTopics()).map((item) => item.topic);
    const article = await writeArticle([...searchTopics, ...threadsTopics], posts.map((post) => `${post.title} (${post.keyword ?? post.slug})`));
    // A clashing slug gets a suffix rather than failing after the article is already written.
    const slug = posts.some((post) => post.slug === article.slug) ? `${article.slug}-${Date.now().toString(36)}` : article.slug;
    // In auto mode the article goes live straight away. It has already passed the length and completeness checks.
    const live = (await getBlogMode()) === "auto";
    const [row] = await insertPost({ slug, title: article.title, description: article.description, body: article.body, keyword: article.keyword, status: live ? "published" : "draft", published_at: live ? new Date().toISOString() : null });
    if (live) refreshBlog();
    await setState("blog_error", null);
    await setState("blog_last_generate", String(Date.now()));
    return row;
  } catch (error) {
    await setState("blog_error", message(error));
    throw error;
  } finally {
    await setState("blog_lock", null);
  }
}

/** One new article a week, and none while an earlier draft is still waiting for approval. */
export async function blogTick() {
  if (!process.env.ANTHROPIC_API_KEY) return;
  const last = Number((await getState("blog_last_generate")) ?? 0);
  const retry = (await getState("blog_error")) ? DAY : 7 * DAY;
  if (Date.now() - last < retry || (await draftCount()) > 0) return;
  await setState("blog_last_generate", String(Date.now()));
  await writeDraft();
}
