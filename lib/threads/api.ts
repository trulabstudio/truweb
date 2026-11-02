import { createHash } from "node:crypto";
import { getState, setState } from "./db";
import type { AccountPost } from "./metrics";

const base = () => process.env.THREADS_API_BASE ?? "https://graph.threads.com";
const userId = () => process.env.THREADS_USER_ID ?? "";
const envToken = () => process.env.THREADS_ACCESS_TOKEN ?? "";
const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex");

export const threadsConfigured = () => Boolean(userId() && envToken());

// A refreshed token lives in the database, until a new token is set in the environment.
async function token() {
  const stored = await getState("token");
  if (stored) {
    const { value, source } = JSON.parse(stored) as { value: string; source: string };
    if (source === fingerprint(envToken())) return value;
  }
  return envToken();
}

async function call<T>(path: string, params: Record<string, string>, method: "GET" | "POST" = "GET"): Promise<T> {
  const query = new URLSearchParams({ ...params, access_token: await token() });
  const response = await (method === "GET" ? fetch(`${base()}${path}?${query}`, { cache: "no-store" }) : fetch(`${base()}${path}`, { method, body: query, cache: "no-store" }));
  const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  // Only the API's message is kept, because the request URL contains the token.
  if (!response.ok) throw new Error(`Threads: ${body?.error?.message ?? response.status}`);
  return body as T;
}

export async function createContainer(text: string, replyToId?: string) {
  const { id } = await call<{ id: string }>(`/v1.0/${userId()}/threads`, { media_type: "TEXT", text, ...(replyToId ? { reply_to_id: replyToId } : {}) }, "POST");
  return id;
}

export async function publishContainer(containerId: string) {
  const { id } = await call<{ id: string }>(`/v1.0/${userId()}/threads_publish`, { creation_id: containerId }, "POST");
  return id;
}

type Insight = { name: string; values?: { value: number }[]; total_value?: { value: number } };
const insightValue = (item?: Insight) => item?.total_value?.value ?? item?.values?.[0]?.value ?? 0;

export async function postInsights(mediaId: string) {
  const { data } = await call<{ data: Insight[] }>(`/v1.0/${mediaId}/insights`, { metric: "views,likes,replies,reposts,quotes" });
  const metric = (name: string) => insightValue(data.find((item) => item.name === name));
  return { views: metric("views"), likes: metric("likes"), replies: metric("replies"), reposts: metric("reposts") + metric("quotes") };
}

export async function followerCount() {
  const { data } = await call<{ data: Insight[] }>(`/v1.0/${userId()}/threads_insights`, { metric: "followers_count" });
  return insightValue(data[0]);
}

export async function postReplies(mediaId: string) {
  const { data } = await call<{ data?: { id: string; text?: string; username?: string; is_reply_owned_by_me?: boolean }[] }>(`/v1.0/${mediaId}/replies`, { fields: "id,text,username,is_reply_owned_by_me", reverse: "true", limit: "100" });
  return data ?? [];
}

/** Recent posts from any source, so new content does not repeat what the account already said. */
export async function recentAccountPosts() {
  const { data } = await call<{ data?: { text?: string }[] }>(`/v1.0/${userId()}/threads`, { fields: "text", limit: "30" });
  return (data ?? []).flatMap((post) => (post.text ? [post.text] : []));
}

/** The latest posts from any source with their numbers. A post whose numbers cannot be read is skipped. */
export async function accountPosts() {
  const { data } = await call<{ data?: { id: string; text?: string; timestamp: string; permalink?: string }[] }>(`/v1.0/${userId()}/threads`, { fields: "id,text,timestamp,permalink", limit: "100" });
  const posts = data ?? [];
  const rows: AccountPost[] = [];
  for (let i = 0; i < posts.length; i += 10) {
    const batch = posts.slice(i, i + 10);
    const results = await Promise.allSettled(batch.map((post) => postInsights(post.id)));
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const post = batch[index];
        rows.push({ at: post.timestamp, text: (post.text ?? "").slice(0, 500), link: post.permalink ?? "", views: result.value.views, likes: result.value.likes, replies: result.value.replies, reposts: result.value.reposts });
      }
    });
  }
  return rows;
}

export async function refreshToken() {
  const { access_token } = await call<{ access_token: string }>("/refresh_access_token", { grant_type: "th_refresh_token" });
  await setState("token", JSON.stringify({ value: access_token, source: fingerprint(envToken()) }));
}
