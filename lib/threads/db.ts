import { siteConfig } from "@/lib/site-config";
import { defaultSettings, type ThreadsSettings } from "./schedule";

export type ThreadsPost = {
  id: number;
  text: string;
  stage: string;
  topic: string | null;
  status: "draft" | "scheduled" | "container" | "publishing" | "published" | "failed";
  scheduled_at: string;
  container_id: string | null;
  container_at: string | null;
  external_id: string | null;
  posted_at: string | null;
  error: string | null;
  views: number;
  likes: number;
  replies: number;
  reposts: number;
};

export type ThreadsReply = {
  reply_id: string;
  post_id: number;
  status: "pending" | "container" | "publishing" | "done" | "failed" | "ignored";
  kind: "self" | "keyword" | "conversation" | "ignored";
  created_at: string;
  comment_text: string | null;
  reply_text: string | null;
  reply_to: string | null;
  username: string | null;
  container_id: string | null;
  container_at: string | null;
  error: string | null;
};

export class ThreadsSetupError extends Error {}

export async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ThreadsSetupError("Supabase is not configured.");
  const { prefer, ...options } = init;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    if (/PGRST205|PGRST204|42P01|42703/.test(detail)) throw new ThreadsSetupError("The Threads tables have not been created yet.");
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 200)}`);
  }
  const body = await response.text();
  return (body ? JSON.parse(body) : null) as T;
}

export async function getState(key: string) {
  const rows = await rest<{ value: string }[]>(`threads_state?key=eq.${encodeURIComponent(key)}&select=value`);
  return rows[0]?.value ?? null;
}

export async function setState(key: string, value: string | null) {
  if (value === null) {
    await rest(`threads_state?key=eq.${encodeURIComponent(key)}`, { method: "DELETE" });
    return;
  }
  await rest("threads_state?on_conflict=key", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: JSON.stringify({ key, value }),
  });
}

/** Only one holder at a time. A lock left behind by a crashed run expires. */
export async function acquireLock(key: string, ttlMs: number) {
  const claim = () => rest<unknown[]>("threads_state?on_conflict=key", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: JSON.stringify({ key, value: String(Date.now()) }),
  });
  if ((await claim()).length > 0) return true;
  if (Date.now() - Number((await getState(key)) ?? 0) < ttlMs) return false;
  await setState(key, null);
  return (await claim()).length > 0;
}

export async function getSettings(): Promise<ThreadsSettings> {
  const stored = await getState("settings");
  const settings: ThreadsSettings = { ...defaultSettings, ...(stored ? JSON.parse(stored) : {}) };
  return { ...settings, formLink: settings.formLink || `${siteConfig.url}/#contact` };
}

export const saveSettings = (settings: ThreadsSettings) => setState("settings", JSON.stringify(settings));

export const postsWithStatus = (statuses: string[], order = "scheduled_at.asc", limit = 100) =>
  rest<ThreadsPost[]>(`threads_posts?status=in.(${statuses.join(",")})&order=${order}&limit=${limit}`);

export const insertPosts = (posts: Pick<ThreadsPost, "text" | "stage" | "topic" | "status" | "scheduled_at">[]) =>
  rest<ThreadsPost[]>("threads_posts", { method: "POST", prefer: "return=representation", body: JSON.stringify(posts) });

/** Changes a post only while it is in an expected status, so two runs cannot both act on it. */
export async function updatePost(id: number, fromStatuses: string[], patch: Partial<ThreadsPost>) {
  const rows = await rest<ThreadsPost[]>(`threads_posts?id=eq.${id}&status=in.(${fromStatuses.join(",")})`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify(patch),
  });
  return rows[0] ?? null;
}

export const deletePost = (id: number) =>
  rest(`threads_posts?id=eq.${id}&status=in.(draft,scheduled,failed)`, { method: "DELETE" });

export async function updateReply(replyId: string, fromStatus: string, patch: Partial<ThreadsReply>) {
  const rows = await rest<ThreadsReply[]>(`threads_replies?reply_id=eq.${encodeURIComponent(replyId)}&status=eq.${fromStatus}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify(patch),
  });
  return rows[0] ?? null;
}

/** Returns true only for the first run that sees this reply. */
export async function claimReply(reply: Pick<ThreadsReply, "reply_id" | "post_id" | "status" | "kind" | "reply_to"> & Partial<Pick<ThreadsReply, "comment_text" | "username">>) {
  const rows = await rest<ThreadsReply[]>("threads_replies?on_conflict=reply_id", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: JSON.stringify(reply),
  });
  return rows.length > 0;
}

export const repliesWithStatus = (status: string, limit = 5) =>
  rest<ThreadsReply[]>(`threads_replies?status=eq.${status}&order=created_at.asc&limit=${limit}`);

export const recentReplies = () => rest<ThreadsReply[]>("threads_replies?order=created_at.desc&limit=100");

export async function getPost(id: number) {
  const rows = await rest<ThreadsPost[]>(`threads_posts?id=eq.${id}&limit=1`);
  return rows[0] ?? null;
}

export async function commentCountsByPost() {
  const rows = await rest<{ post_id: number }[]>("threads_replies?kind=in.(keyword,conversation)&select=post_id&limit=5000");
  const counts = new Map<number, number>();
  for (const { post_id } of rows) counts.set(post_id, (counts.get(post_id) ?? 0) + 1);
  return counts;
}

export async function leadCountsBySource() {
  const rows = await rest<{ source: string }[]>("leads?source=like.threads-*&select=source&limit=5000");
  const counts = new Map<string, number>();
  for (const { source } of rows) counts.set(source, (counts.get(source) ?? 0) + 1);
  return counts;
}

export const threadsLeadsSince = (since: string) =>
  rest<{ created_at: string }[]>(`leads?source=like.threads-*&created_at=gte.${since}&select=created_at&limit=5000`);
