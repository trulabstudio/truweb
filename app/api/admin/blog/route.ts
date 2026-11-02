import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { BLOG_TAG, deleteBlogPost, updateBlogPost } from "@/lib/blog/db";
import { writeDraft } from "@/lib/blog/engine";
import { looksComplete } from "@/lib/threads/schedule";
import { validSlug } from "@/lib/blog/markdown";

export const maxDuration = 300;

const denied = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });
const invalid = (error: string) => NextResponse.json({ error }, { status: 400 });
const failed = (error: unknown) => {
  console.error("Admin blog:", error instanceof Error ? error.message : error);
  const duplicate = error instanceof Error && /23505|duplicate/.test(error.message);
  return NextResponse.json({ error: duplicate ? "Another article already uses this web address." : "Could not complete this action. Please try again." }, { status: duplicate ? 409 : 502 });
};
const refresh = () => {
  revalidateTag(BLOG_TAG);
  // Pages are also cleared by path, in case one was built before it read any article.
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
};

export async function POST() {
  if (!(await isAdmin())) return denied();
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 503 });
  try {
    const post = await writeDraft();
    return post ? NextResponse.json({ id: post.id }) : NextResponse.json({ error: "A draft is already being written." }, { status: 409 });
  } catch (error) {
    return failed(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return denied();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = Number(body?.id);
  const action = String(body?.action);
  if (!Number.isInteger(id) || !["save", "publish", "unpublish"].includes(action)) return invalid("Invalid request.");
  const text = (key: string) => (typeof body?.[key] === "string" ? (body[key] as string).trim() : "");
  const fields = { title: text("title"), description: text("description"), slug: text("slug"), body: text("body") };
  if (!fields.title || fields.title.length > 120) return invalid("The title must be between 1 and 120 characters.");
  if (!fields.description || fields.description.length > 300) return invalid("The description must be between 1 and 300 characters.");
  if (!validSlug(fields.slug)) return invalid("The web address can only use lowercase letters, numbers and hyphens.");
  if (!fields.body || fields.body.length > 30000) return invalid("The article is empty or too long.");
  if (action === "publish" && !looksComplete(fields.body)) return invalid("The article looks cut off. Finish the last sentence before publishing.");
  try {
    const status = action === "save" ? {} : action === "publish" ? { status: "published" as const, published_at: new Date().toISOString() } : { status: "draft" as const };
    const post = await updateBlogPost(id, { ...fields, ...status });
    refresh();
    return NextResponse.json({ ok: Boolean(post) });
  } catch (error) {
    return failed(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return denied();
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) return invalid("Invalid request.");
  try {
    await deleteBlogPost(id);
    refresh();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failed(error);
  }
}
