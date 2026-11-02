"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ThreadsPost } from "@/lib/threads/db";
import { adminText } from "@/lib/admin/text";

const text = adminText.threads;
const dateFormat = new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short", hourCycle: "h23", timeZone: "Asia/Kuala_Lumpur" });
const primary = "focus-ring rounded-full bg-trulab-button-primary px-4 py-2 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover disabled:opacity-50";
const secondary = "focus-ring rounded-full border border-trulab-border/10 bg-trulab-surface px-4 py-2 text-sm font-semibold transition hover:shadow-lift disabled:opacity-50";

const statusStyle: Record<string, string> = {
  draft: "bg-amber-100 text-amber-900",
  scheduled: "bg-trulab-accent/30 text-trulab-ink",
  failed: "bg-red-100 text-red-800",
};

function PostCard({ post, onChanged }: { post: ThreadsPost; onChanged: () => void }) {
  const [value, setValue] = useState(post.text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = post.status === "container" || post.status === "publishing";
  const bytes = new TextEncoder().encode(value).length;

  async function act(action: "save" | "approve" | "unapprove" | "delete") {
    if (action === "delete" && !window.confirm(text.removeConfirm)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/threads/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, action, text: value }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) setError(body.error ?? text.actionFailed);
      else onChanged();
    } catch {
      setError(text.actionFailed);
    }
    setBusy(false);
  }

  return (
    <article className="grid gap-3 rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{dateFormat.format(new Date(post.scheduled_at))}</span>
        <span className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className="rounded-full border border-trulab-border/10 px-2.5 py-1">{text.stages[post.stage] ?? post.stage}</span>
          <span className={`rounded-full px-2.5 py-1 ${statusStyle[post.status] ?? "bg-trulab-bg"}`}>{text.statuses[post.status] ?? post.status}</span>
        </span>
      </div>
      {post.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{post.error}</p>}
      <textarea aria-label={text.postText} rows={5} disabled={locked} value={value} onChange={(event) => setValue(event.target.value)} className="tool-input leading-6 disabled:opacity-60" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`text-xs tabular-nums ${bytes > 500 ? "font-semibold text-red-700" : "text-trulab-muted"}`}>{text.bytes(bytes)}</span>
        {!locked && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className={secondary} onClick={() => act("delete")}>{text.remove}</button>
            {value !== post.text && <button type="button" disabled={busy} className={secondary} onClick={() => act("save")}>{text.saveText}</button>}
            {post.status === "scheduled"
              ? <button type="button" disabled={busy} className={secondary} onClick={() => act("unapprove")}>{text.moveToDraft}</button>
              : <button type="button" disabled={busy} className={primary} onClick={() => act("approve")}>{post.status === "failed" ? text.retry : text.approve}</button>}
          </div>
        )}
      </div>
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
    </article>
  );
}

export default function ThreadsQueue({ posts, canGenerate }: { posts: ThreadsPost[]; canGenerate: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const running = useRef(false);

  async function generate() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/threads/posts", { method: "POST" });
      const body = (await response.json()) as { created?: number; error?: string };
      setMessage(response.ok ? text.generated(body.created ?? 0) : body.error ?? text.actionFailed);
      router.refresh();
    } catch {
      setMessage(text.actionFailed);
    }
    running.current = false;
    setBusy(false);
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !canGenerate} onClick={generate} className={`${primary} inline-flex items-center gap-2 px-5 py-2.5`}>
          <Sparkles size={15} aria-hidden />
          {busy ? text.generating : text.generate}
        </button>
        <span role="status" className="text-sm font-medium text-trulab-muted">{message}</span>
      </div>
      {posts.length === 0 && <p className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5 text-trulab-muted">{text.empty}</p>}
      {posts.map((post) => <PostCard key={`${post.id}-${post.text}-${post.status}`} post={post} onChanged={() => router.refresh()} />)}
    </div>
  );
}
