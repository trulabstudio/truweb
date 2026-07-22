import { NextRequest, NextResponse } from "next/server";
import { leadBudgetOptions, type LeadInput } from "@/lib/types/lead";

export const runtime = "nodejs";

const allowedBudgets = new Set<string>(["", ...leadBudgetOptions]);
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    const body = await request.json() as LeadInput;
    if (clean(body.website, 200)) return NextResponse.json({ error: "Submission rejected." }, { status: 400 });

    const lead = {
      name: clean(body.name, 100), company: clean(body.company, 120), email: clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 30), budget: clean(body.budget, 30), message: clean(body.message, 2000),
    };
    if (!lead.name || !lead.email || !lead.phone || !lead.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !allowedBudgets.has(lead.budget)) return NextResponse.json({ error: "Please check the required fields." }, { status: 422 });

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const token = clean(body.turnstileToken, 2048);
    if (!turnstileSecret || !token) return NextResponse.json({ error: "Anti-spam verification is unavailable." }, { status: 503 });
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "" }),
      cache: "no-store",
    });
    const challenge = await verification.json() as { success?: boolean };
    if (!challenge.success) return NextResponse.json({ error: "Anti-spam verification failed. Please try again." }, { status: 400 });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: "Lead storage is not configured." }, { status: 503 });
    const saved = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ ...lead, company: lead.company || null, budget: lead.budget || null, source: "website", user_agent: request.headers.get("user-agent")?.slice(0, 500) || null }), cache: "no-store",
    });
    if (!saved.ok) { console.error("Supabase lead insert failed", saved.status, await saved.text()); return NextResponse.json({ error: "Unable to save your enquiry. Please try again." }, { status: 502 }); }
    const [record] = await saved.json() as Array<{ id: string }>;

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    if (resendKey && notifyEmail) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `new-lead-${record.id}` },
        body: JSON.stringify({ from: process.env.LEAD_FROM_EMAIL || "Website <onboarding@resend.dev>", to: [notifyEmail], reply_to: lead.email, subject: `New website lead: ${lead.name}`, html: `<h2>New website enquiry</h2><p><b>Name:</b> ${escapeHtml(lead.name)}</p><p><b>Company:</b> ${escapeHtml(lead.company || "-")}</p><p><b>Email:</b> ${escapeHtml(lead.email)}</p><p><b>Phone:</b> ${escapeHtml(lead.phone)}</p><p><b>Budget:</b> ${escapeHtml(lead.budget || "-")}</p><p><b>Message:</b><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>` }),
      });
      if (!emailResponse.ok) console.error("Lead notification email failed", emailResponse.status, await emailResponse.text());
    }
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Unable to submit your enquiry. Please try again." }, { status: 500 });
  }
}
