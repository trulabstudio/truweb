import { NextRequest, NextResponse } from "next/server";
import { contactFormContent } from "@/lib/content/pages";
import {
  getPackageInterestLabel,
  packageInterestIds,
  type LeadInput,
} from "@/lib/types/lead";

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

    const packageId = clean(body.packageId, 60);
    const packageLabel = getPackageInterestLabel(packageId);
    const lead = {
      name: clean(body.name, 100), company: clean(body.company, 120), email: clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 30), packageId, message: clean(body.message, 2000),
    };
    if (!lead.name || !lead.email || !lead.phone || !lead.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !allowedPackageIds.has(lead.packageId)) return NextResponse.json({ error: apiMessages.invalidFields }, { status: 422 });

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const token = clean(body.turnstileToken, 2048);
    if (!turnstileSecret || !token) return NextResponse.json({ error: apiMessages.antiSpamUnavailable }, { status: 503 });
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "" }),
      cache: "no-store",
    });
    const challenge = await verification.json() as { success?: boolean };
    if (!challenge.success) return NextResponse.json({ error: apiMessages.antiSpamFailed }, { status: 400 });

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
        source: "website",
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
      }),
      cache: "no-store",
    });
    if (!saved.ok) { console.error("Supabase lead insert failed", saved.status, await saved.text()); return NextResponse.json({ error: apiMessages.saveFailed }, { status: 502 }); }
    const [record] = await saved.json() as Array<{ id: string }>;

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    if (resendKey && notifyEmail) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `new-lead-${record.id}` },
        body: JSON.stringify({ from: process.env.LEAD_FROM_EMAIL || notificationEmail.fallbackFrom, to: [notifyEmail], reply_to: lead.email, subject: `${notificationEmail.subjectPrefix}: ${lead.name}`, html: `<h2>${notificationEmail.heading}</h2><p><b>${notificationEmail.labels.name}:</b> ${escapeHtml(lead.name)}</p><p><b>${notificationEmail.labels.company}:</b> ${escapeHtml(lead.company || notificationEmail.emptyValue)}</p><p><b>${notificationEmail.labels.email}:</b> ${escapeHtml(lead.email)}</p><p><b>${notificationEmail.labels.phone}:</b> ${escapeHtml(lead.phone)}</p><p><b>${notificationEmail.labels.packageInterest}:</b> ${escapeHtml(packageLabel || notificationEmail.emptyValue)}</p><p><b>${notificationEmail.labels.message}:</b><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>` }),
      });
      if (!emailResponse.ok) console.error("Lead notification email failed", emailResponse.status, await emailResponse.text());
    }
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: apiMessages.submitFailed }, { status: 500 });
  }
}
