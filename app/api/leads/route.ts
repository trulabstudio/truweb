import { NextRequest, NextResponse } from "next/server";
import { contactFormContent } from "@/lib/content/pages";
import {
  getPackageInterestLabel,
  packageInterestIds,
  type LeadInput,
} from "@/lib/types/lead";

import { konsultasiContent } from "@/lib/content/konsultasi";
import { cleanLeadSource } from "@/lib/threads/schedule";

export const runtime = "nodejs";

const allowedPackageIds = new Set<string>(["", ...packageInterestIds]);
const { apiMessages, notificationEmail } = contactFormContent;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: apiMessages.invalidRequest }, { status: 415 });
    const body = await request.json() as LeadInput;
    if (clean(body.website, 200)) return NextResponse.json({ error: apiMessages.submissionRejected }, { status: 400 });

    // The Threads landing page asks for less, so it has no email or message.
    const short = body.form === "konsultasi";
    const packageId = short ? "" : clean(body.packageId, 60);
    const packageLabel = getPackageInterestLabel(packageId);
    const lead = {
      name: clean(body.name, 100), company: clean(body.company, 120), email: short ? "" : clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 30), packageId, message: short ? konsultasiContent.form.leadMessage : clean(body.message, 2000),
    };
    const validEmail = short || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
    if (!lead.name || !lead.phone || !lead.message || !validEmail || (short && !lead.company) || !allowedPackageIds.has(lead.packageId)) return NextResponse.json({ error: apiMessages.invalidFields }, { status: 422 });

    const turnstileSecret = process.env.TURNSTILE_SECRET;
    const token = clean(body["cf-turnstile-response"], 2048);
    if (!turnstileSecret) return NextResponse.json({ error: apiMessages.antiSpamUnavailable }, { status: 503 });
    if (!token) return NextResponse.json({ error: apiMessages.antiSpamFailed }, { status: 403 });

    let challenge: { success?: boolean };
    try {
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "" }),
        cache: "no-store",
      });
      if (!verification.ok) throw new Error(`siteverify ${verification.status}`);
      challenge = await verification.json() as { success?: boolean };
    } catch (error) {
      console.error("Turnstile siteverify failed", error);
      return NextResponse.json({ error: apiMessages.antiSpamFailed }, { status: 403 });
    }
    if (challenge.success !== true) return NextResponse.json({ error: apiMessages.antiSpamFailed }, { status: 403 });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: apiMessages.storageUnavailable }, { status: 503 });
    const saved = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        name: lead.name,
        company: lead.company || null,
        email: lead.email,
        phone: lead.phone,
        // The database keeps its historical `budget` column; new submissions store stable IDs.
        budget: lead.packageId || null,
        message: lead.message,
        source: cleanLeadSource(body.source),
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
      }),
      cache: "no-store",
    });
    if (!saved.ok) { console.error("Supabase lead insert failed", saved.status, await saved.text()); return NextResponse.json({ error: apiMessages.saveFailed }, { status: 502 }); }
    const [record] = await saved.json() as Array<{ id: string }>;

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    if (resendKey && notifyEmail) {
      const from = process.env.LEAD_FROM_EMAIL || notificationEmail.fallbackFrom;
      const detailsHtml = `<p><b>${notificationEmail.labels.name}:</b> ${escapeHtml(lead.name)}</p><p><b>${notificationEmail.labels.company}:</b> ${escapeHtml(lead.company || notificationEmail.emptyValue)}</p><p><b>${notificationEmail.labels.email}:</b> ${escapeHtml(lead.email)}</p><p><b>${notificationEmail.labels.phone}:</b> ${escapeHtml(lead.phone)}</p><p><b>${notificationEmail.labels.packageInterest}:</b> ${escapeHtml(packageLabel || notificationEmail.emptyValue)}</p><p><b>${notificationEmail.labels.message}:</b><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>`;
      const sendEmail = (body: object, idempotencyKey: string) => fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(body),
      });
      const [notificationResponse, customerResponse] = await Promise.all([
        sendEmail({ from, to: [notifyEmail], ...(lead.email ? { reply_to: lead.email } : {}), subject: `${notificationEmail.subjectPrefix}: ${lead.name}`, html: `<h2>${notificationEmail.heading}</h2>${detailsHtml}` }, `new-lead-${record.id}`),
        // There is no address to confirm to when the short form was used.
        !lead.email ? null : sendEmail({ from, to: [lead.email], reply_to: notifyEmail, subject: notificationEmail.customer.subject, html: `<h2>${notificationEmail.customer.heading}</h2><p>Hi ${escapeHtml(lead.name)},</p><p>${notificationEmail.customer.introduction}</p><h3>${notificationEmail.customer.detailsHeading}</h3>${detailsHtml}<p>${notificationEmail.customer.correctionNotice}</p><p>${notificationEmail.customer.signOff}</p>` }, `lead-confirmation-${record.id}`),
      ]);
      if (!notificationResponse.ok) console.error("Lead notification email failed", notificationResponse.status, await notificationResponse.text());
      if (customerResponse && !customerResponse.ok) console.error("Lead confirmation email failed", customerResponse.status, await customerResponse.text());
    }
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: apiMessages.submitFailed }, { status: 500 });
  }
}
