import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { deletePost, getSettings, updatePost } from "@/lib/threads/db";
import { fillQueue, nextFreeSlot } from "@/lib/threads/engine";
import { fitsThreads, looksComplete } from "@/lib/threads/schedule";

export const maxDuration = 300;

const denied = () => NextResponse.json({ error: "Please sign in again." }, { status: 401 });
const failed = (error: unknown) => {
  console.error("Admin Threads:", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Could not complete this action. Please try again." }, { status: 502 });
};

export async function POST() {
  if (!(await isAdmin())) return denied();
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 503 });
  try {
    return NextResponse.json({ created: await fillQueue(true) });
  } catch (error) {
    return failed(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return denied();
  const body = (await request.json().catch(() => null)) as { id?: unknown; action?: unknown; text?: unknown } | null;
  const id = Number(body?.id);
  if (!Number.isInteger(id) || !["save", "approve", "unapprove", "delete"].includes(String(body?.action))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const editable = ["draft", "scheduled", "failed"];
  try {
    if (body?.action === "delete") {
      await deletePost(id);
      return NextResponse.json({ ok: true });
    }
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!fitsThreads(text)) return NextResponse.json({ error: "A post must be between 1 and 500 bytes." }, { status: 400 });
    if (body?.action === "approve" && !looksComplete(text)) return NextResponse.json({ error: "This post looks cut off. Finish the last sentence before approving." }, { status: 400 });

    let patch: Parameters<typeof updatePost>[2] = { text };
    if (body?.action === "approve") {
      patch = { text, status: "scheduled", error: null, container_id: null, container_at: null };
    } else if (body?.action === "unapprove") {
      patch = { text, status: "draft" };
    }
    let post = await updatePost(id, editable, patch);
    if (!post) return NextResponse.json({ error: "This post can no longer be changed." }, { status: 409 });
    // A slot that has already passed would publish immediately, so it moves to the next free one.
    if (body?.action === "approve" && Date.parse(post.scheduled_at) <= Date.now()) {
      post = await updatePost(id, ["scheduled"], { scheduled_at: await nextFreeSlot(await getSettings()) });
    }
    return NextResponse.json({ post });
  } catch (error) {
    return failed(error);
  }
}
