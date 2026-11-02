"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import { adminText } from "@/lib/admin/text";
import type { BlogPost } from "@/lib/blog/db";
import { wordCount } from "@/lib/blog/markdown";

const text = adminText.blog;
const button = "focus-ring inline-flex items-center gap-2 rounded-full border border-trulab-border/10 bg-trulab-surface px-4 py-2 text-sm font-semibold transition hover:shadow-lift disabled:opacity-60";
const primary = "focus-ring inline-flex items-center gap-2 rounded-full bg-trulab-button-primary px-4 py-2 text-sm font-semibold text-trulab-button-primary-text disabled:opacity-60";

async function send(method: string, url: string, body?: object) {
  const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
  const result = (await response?.json().catch(() => null)) as { error?: string } | null;
  return response?.ok ? null : result?.error ?? text.failed;
}

export function WriteDraftButton({ canWrite }: { canWrite: boolean }) {
  const router = useRouter();
  const busy = useRef(false);
  const [state, setState] = useState<{ status: "idle" | "busy" | "done" | "error"; message?: string }>({ status: "idle" });

  async function write() {
    if (busy.current) return;
    busy.current = true;
    setState({ status: "busy" });
    const error = await send("POST", "/api/admin/blog");
    busy.current = false;
    setState(error ? { status: "error", message: error } : { status: "done" });
    if (!error) router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={write} disabled={!canWrite || state.status === "busy"} className={primary}>
        {state.status === "busy" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
        {state.status === "busy" ? text.writing : text.write}
      </button>
      {state.status === "done" && <span role="status" className="text-sm">{text.written}</span>}
      {state.status === "error" && <span role="alert" className="text-sm text-red-700">{state.message}</span>}
    </div>
  );
}

export default function BlogEditor({ post, siteUrl }: { post: BlogPost; siteUrl: string }) {
  const router = useRouter();
  const [fields, setFields] = useState({ title: post.title, description: post.description, slug: post.slug, body: post.body });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const published = post.status === "published";

  async function act(action: "save" | "publish" | "unpublish") {
    setBusy(true);
    setError("");
    const problem = await send("PATCH", "/api/admin/blog", { id: post.id, action, ...fields });
    setBusy(false);
    if (problem) setError(problem);
    else router.refresh();
  }

  async function remove() {
    if (!window.confirm(text.removeConfirm)) return;
    setBusy(true);
    const problem = await send("DELETE", `/api/admin/blog?id=${post.id}`);
    setBusy(false);
    if (problem) setError(problem);
    else router.refresh();
  }

  const input = "tool-input mt-2 block w-full";
  return (
    <details open={!published} className="rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5">
      <summary className="focus-ring cursor-pointer">
        <span className={`mr-2 rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-trulab-accent/30" : "bg-amber-100 text-amber-900"}`}>{text.statuses[post.status]}</span>
        <span className="font-semibold">{post.title}</span>
        {post.keyword && <span className="mt-1 block text-sm text-trulab-muted">{text.keyword(post.keyword)}</span>}
      </summary>
      <div className="mt-5 grid gap-4">
        {([["title", 1], ["description", 2], ["slug", 1]] as const).map(([key, rows]) => (
          <label key={key} className="block text-sm font-semibold">
            {text.fields[key]}
            {rows === 1 ? <input className={input} value={fields[key]} onChange={(event) => setFields({ ...fields, [key]: event.target.value })} /> : <textarea rows={rows} className={input} value={fields[key]} onChange={(event) => setFields({ ...fields, [key]: event.target.value })} />}
            <span className="mt-1 block text-xs font-normal text-trulab-muted">{text.help[key]}</span>
          </label>
        ))}
        <label className="block text-sm font-semibold">
          {text.fields.body}
          <textarea rows={22} className={`${input} font-mono text-sm leading-6`} value={fields.body} onChange={(event) => setFields({ ...fields, body: event.target.value })} />
          <span className="mt-1 block text-xs font-normal text-trulab-muted">{text.help.body} {text.counts(wordCount(fields.body), fields.title.length)}</span>
        </label>
        {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {!published && <button type="button" disabled={busy} onClick={() => act("publish")} className={primary}>{text.publish}</button>}
          <button type="button" disabled={busy} onClick={() => act("save")} className={button}>{text.save}</button>
          {published && <button type="button" disabled={busy} onClick={() => act("unpublish")} className={button}>{text.unpublish}</button>}
          {published && <a href={`${siteUrl}/blog/${post.slug}`} target="_blank" rel="noreferrer" className={button}><ExternalLink size={15} aria-hidden />{text.view}</a>}
          <button type="button" disabled={busy} onClick={remove} className={`${button} text-red-700`}>{text.remove}</button>
        </div>
      </div>
    </details>
  );
}

export function BlogModeSwitch({ initial }: { initial: "approve" | "auto" }) {
  const [mode, setMode] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function choose(next: "approve" | "auto") {
    const previous = mode;
    setMode(next);
    const error = await send("PUT", "/api/admin/blog", { mode: next });
    if (error) setMode(previous);
    setStatus(error ? "error" : "saved");
  }

  return (
    <fieldset className="grid gap-3 rounded-3xl border border-trulab-border/10 bg-trulab-surface p-5">
      <legend className="px-1 font-semibold">{text.modeTitle}</legend>
      {([["approve", text.modeApprove, text.modeApproveHelp], ["auto", text.modeAuto, text.modeAutoHelp]] as const).map(([value, label, help]) => (
        <label key={value} className="flex cursor-pointer gap-3 rounded-2xl bg-trulab-bg p-3 text-sm">
          <input type="radio" name="blog-mode" checked={mode === value} onChange={() => choose(value)} className="mt-1" />
          <span><span className="block font-semibold">{label}</span><span className="text-trulab-muted">{help}</span></span>
        </label>
      ))}
      {status === "saved" && <span role="status" className="text-sm">{text.modeSaved}</span>}
      {status === "error" && <span role="alert" className="text-sm text-red-700">{text.failed}</span>}
    </fieldset>
  );
}
