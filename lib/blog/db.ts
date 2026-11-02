import { rest } from "@/lib/threads/db";

export type BlogPost = {
  id: number;
  created_at: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  keyword: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

export const BLOG_TAG = "blog";

/** Public pages read through the cache, and the admin clears it when an article changes. */
async function cached<T>(path: string): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [] as T;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: 3600, tags: [BLOG_TAG] },
  });
  // The blog is optional, so a missing table or an outage shows no articles instead of an error page.
  if (!response.ok) return [] as T;
  return (await response.json()) as T;
}

const LIST_FIELDS = "id,slug,title,description,keyword,status,published_at,updated_at,created_at";

export const publishedPosts = () => cached<BlogPost[]>(`blog_posts?status=eq.published&select=${LIST_FIELDS},body&order=published_at.desc&limit=200`);

export async function publishedPost(slug: string) {
  const rows = await cached<BlogPost[]>(`blog_posts?status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return rows[0] ?? null;
}

export const allPosts = () => rest<BlogPost[]>("blog_posts?order=status.asc,created_at.desc&limit=200");

export const insertPost = (post: Pick<BlogPost, "slug" | "title" | "description" | "body" | "keyword">) =>
  rest<BlogPost[]>("blog_posts", { method: "POST", prefer: "return=representation", body: JSON.stringify({ ...post, status: "draft" }) });

export async function updateBlogPost(id: number, patch: Partial<BlogPost>) {
  const rows = await rest<BlogPost[]>(`blog_posts?id=eq.${id}`, { method: "PATCH", prefer: "return=representation", body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
  return rows[0] ?? null;
}

export const deleteBlogPost = (id: number) => rest(`blog_posts?id=eq.${id}`, { method: "DELETE" });

export const draftCount = async () => (await rest<{ id: number }[]>("blog_posts?status=eq.draft&select=id")).length;
