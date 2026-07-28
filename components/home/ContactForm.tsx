"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { contactContent } from "@/lib/content/home";
import { contactFormContent } from "@/lib/content/pages";
import { buildWhatsAppUrl, defaultWhatsAppMessage, siteConfig } from "@/lib/site-config";
import {
  getPackageInterestLabel,
  packageInterestOptions,
  type LeadFormState,
} from "@/lib/types/lead";

const initialForm: LeadFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  packageId: "",
  message: "",
};

declare global {
  interface Window {
    turnstile?: { reset: (widget?: HTMLElement) => void };
    onTurnstileSuccess?: (token: string) => void;
    onTurnstileExpired?: () => void;
    onTurnstileError?: () => void;
  }
}

function buildWhatsappUrl(form: LeadFormState) {
  const packageLabel = getPackageInterestLabel(form.packageId);

  return buildWhatsAppUrl([
    contactFormContent.whatsapp.introduction,
    "",
    contactFormContent.whatsapp.detailsHeading,
    `${contactFormContent.fields.name}: ${form.name}`,
    `${contactFormContent.fields.company}: ${form.company || contactFormContent.emptyValue}`,
    `${contactFormContent.fields.email}: ${form.email}`,
    `${contactFormContent.fields.phone}: ${form.phone}`,
    `${contactFormContent.fields.packageInterest}: ${packageLabel || contactFormContent.emptyValue}`,
    `${contactFormContent.whatsapp.projectLabel}: ${form.message}`,
    "",
    contactFormContent.whatsapp.closing,
  ].join("\n"));
}

export default function ContactForm() {
  const [form, setForm] = useState<LeadFormState>(initialForm);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    window.onTurnstileSuccess = (token) => setTurnstileToken(token);
    window.onTurnstileExpired = () => setTurnstileToken("");
    window.onTurnstileError = () => setTurnstileToken("");
    return () => {
      delete window.onTurnstileSuccess;
      delete window.onTurnstileExpired;
      delete window.onTurnstileError;
    };
  }, []);

  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [notice]);

  function updateField(field: keyof LeadFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setNotice("");

    if (!siteKey || !turnstileToken) {
      setStatus("error");
      setNotice(contactFormContent.turnstileRequired);
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken, website: "" }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || contactFormContent.submitFallbackError);

      const whatsappUrl = buildWhatsappUrl(form);
      setStatus("success");
      setNotice(contactFormContent.success);
      setForm(initialForm);
      setTurnstileToken("");
      window.turnstile?.reset(turnstileRef.current || undefined);
      window.location.assign(whatsappUrl);
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : contactFormContent.unexpectedError);
      setTurnstileToken("");
      window.turnstile?.reset(turnstileRef.current || undefined);
    }
  }

  return (
    <Section id="contact">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <Container className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="reveal">
          <span className="section-kicker">{contactContent.kicker}</span>
          <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight text-trulab-ink sm:text-5xl">{contactContent.title}</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-trulab-muted">{contactContent.description}</p>
          <div className="mt-8 grid max-w-xl gap-3">
            <a href={buildWhatsAppUrl(defaultWhatsAppMessage)} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-3 rounded-2xl border border-trulab-border/8 bg-trulab-surface px-4 py-3 text-sm font-semibold text-trulab-ink shadow-sm transition hover:border-trulab-border/14 hover:shadow-lift"><Phone size={17} aria-hidden />{siteConfig.phoneDisplay}</a>
            <a href={`mailto:${siteConfig.email}`} className="focus-ring inline-flex min-w-0 items-center gap-3 rounded-2xl border border-trulab-border/8 bg-trulab-surface px-4 py-3 text-sm font-semibold text-trulab-ink shadow-sm"><Mail size={17} aria-hidden /><span className="break-all">{siteConfig.email}</span></a>
            {siteConfig.address ? <p className="inline-flex min-w-0 items-start gap-3 rounded-2xl border border-trulab-border/8 bg-trulab-surface px-4 py-3 text-sm font-semibold text-trulab-ink shadow-sm"><MapPin size={17} className="mt-0.5 shrink-0" aria-hidden /><span className="break-words">{siteConfig.address}</span></p> : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} aria-busy={status === "loading"} className="min-w-0 rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-5 shadow-soft sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2 text-sm font-semibold">{contactFormContent.fields.name}<input autoComplete="name" maxLength={100} placeholder={contactFormContent.placeholders.name || undefined} value={form.name} onChange={(e) => updateField("name", e.target.value)} className="focus-ring min-w-0 rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal" required /></label>
            <label className="grid min-w-0 gap-2 text-sm font-semibold">{contactFormContent.fields.company}<input autoComplete="organization" maxLength={120} placeholder={contactFormContent.placeholders.company || undefined} value={form.company} onChange={(e) => updateField("company", e.target.value)} className="focus-ring min-w-0 rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal" /></label>
            <label className="grid min-w-0 gap-2 text-sm font-semibold">{contactFormContent.fields.email}<input type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder={contactFormContent.placeholders.email || undefined} value={form.email} onChange={(e) => updateField("email", e.target.value)} className="focus-ring min-w-0 rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal" required /></label>
            <label className="grid min-w-0 gap-2 text-sm font-semibold">{contactFormContent.fields.phone}<input type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder={contactFormContent.placeholders.phone || undefined} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="focus-ring min-w-0 rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal" required /></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">{contactFormContent.fields.packageInterest}<select value={form.packageId} onChange={(e) => updateField("packageId", e.target.value)} className="focus-ring rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal"><option value="">{contactFormContent.packageInterestPlaceholder}</option>{packageInterestOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">{contactFormContent.fields.message}<textarea maxLength={2000} placeholder={contactFormContent.placeholders.message || undefined} value={form.message} onChange={(e) => updateField("message", e.target.value)} rows={5} className="focus-ring resize-none rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal" required /></label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          </div>

          {siteKey ? <div className="turnstile-shell mt-5"><div ref={turnstileRef} className="cf-turnstile" data-sitekey={siteKey} data-callback="onTurnstileSuccess" data-expired-callback="onTurnstileExpired" data-error-callback="onTurnstileError" data-theme="light" /></div> : <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{contactFormContent.turnstileMissing}</p>}
          <p className="mt-3 flex items-center gap-2 text-xs text-trulab-muted"><ShieldCheck size={15} aria-hidden />{contactFormContent.turnstileNotice}</p>
          {notice ? <p ref={noticeRef} tabIndex={-1} role={status === "error" ? "alert" : "status"} className={`focus-ring mt-4 rounded-2xl border px-4 py-3 text-sm ${status === "success" ? "border-lime-200 bg-lime-50 text-lime-800" : "border-red-200 bg-red-50 text-red-700"}`}>{notice}</p> : null}
          <button type="submit" disabled={status === "loading" || !siteKey} className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-trulab-button-primary px-6 py-4 text-sm font-semibold text-trulab-button-primary-text disabled:cursor-not-allowed disabled:opacity-65">{status === "loading" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}{contactFormContent.submitLabel}</button>
        </form>
      </Container>
    </Section>
  );
}
