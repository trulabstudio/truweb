"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { konsultasiContent } from "@/lib/content/konsultasi";
import { buildWhatsAppUrl } from "@/lib/site-config";

const text = konsultasiContent.form;
const field = "focus-ring min-w-0 rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3.5 text-base font-normal";

export default function KonsultasiForm() {
  const [form, setForm] = useState({ name: "", company: "", phone: "" });
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const source = () => new URLSearchParams(window.location.search).get("src") ?? undefined;

  useEffect(() => {
    window.onTurnstileSuccess = (value) => setToken(value);
    window.onTurnstileExpired = () => setToken("");
    window.onTurnstileError = () => setToken("");
    // Counts the visit, so the dashboard can show how many visitors go on to fill in the form.
    fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ src: source() }), keepalive: true }).catch(() => {});
    return () => {
      delete window.onTurnstileSuccess;
      delete window.onTurnstileExpired;
      delete window.onTurnstileError;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    if (!token) {
      setStatus("error");
      setNotice(text.antiSpamRequired);
      return;
    }
    // Opened before the request, because browsers block pop-ups that open after waiting.
    const whatsappWindow = window.open("", "_blank");
    setStatus("loading");
    setNotice("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, form: "konsultasi", "cf-turnstile-response": token, website: "", source: source() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || text.failed);
      const whatsappUrl = buildWhatsAppUrl(text.whatsappMessage(form.name, form.company));
      setStatus("success");
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      whatsappWindow?.close();
      setStatus("error");
      setNotice(text.failed);
      setToken("");
      window.turnstile?.reset(turnstileRef.current || undefined);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="grid justify-items-center gap-3 rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-8 text-center shadow-soft">
        <CheckCircle2 size={40} className="text-lime-600" aria-hidden />
        <p className="text-xl font-semibold">{text.successTitle}</p>
        <p className="text-sm leading-6 text-trulab-muted">{text.success}</p>
        <a href={buildWhatsAppUrl(text.whatsappMessage(form.name, form.company))} target="_blank" rel="noreferrer" className="focus-ring mt-2 inline-flex items-center gap-2 rounded-full bg-trulab-button-primary px-5 py-3 text-sm font-semibold text-trulab-button-primary-text">
          <MessageCircle size={17} aria-hidden />
          {text.whatsappDirect}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} aria-busy={status === "loading"} className="grid gap-4 rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-5 shadow-soft sm:p-7">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <p className="text-lg font-semibold">{text.title}</p>
      <label className="grid gap-2 text-sm font-semibold">
        {text.name}
        <input autoComplete="name" maxLength={100} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={field} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {text.company}
        <input autoComplete="organization" maxLength={120} required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className={field} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {text.phone}
        <input type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required placeholder={text.phoneHint} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={field} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {siteKey && <div ref={turnstileRef} className="cf-turnstile" data-sitekey={siteKey} data-action="konsultasi" data-callback="onTurnstileSuccess" data-expired-callback="onTurnstileExpired" data-error-callback="onTurnstileError" data-theme="light" data-size="flexible" />}
      {notice && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{notice}</p>}
      <button type="submit" disabled={status === "loading" || !siteKey} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-trulab-button-primary px-6 py-4 text-base font-semibold text-trulab-button-primary-text disabled:cursor-not-allowed disabled:opacity-65">
        {status === "loading" && <Loader2 size={18} className="animate-spin" aria-hidden />}
        {status === "loading" ? text.sending : text.submit}
      </button>
      <p className="text-center text-xs text-trulab-muted">{text.reassurance}</p>
    </form>
  );
}
