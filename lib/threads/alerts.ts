import { contactFormContent } from "@/lib/content/pages";

export const alertEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_EMAIL);

/** Emails the site owner. Throws if the email could not be handed over. */
export async function emailOwner(subject: string, lines: string[]) {
  if (!alertEmailConfigured()) throw new Error("RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL is not configured.");
  const response = await fetch(`${process.env.RESEND_API_BASE ?? "https://api.resend.com"}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL || contactFormContent.notificationEmail.fallbackFrom,
      to: [process.env.LEAD_NOTIFICATION_EMAIL],
      subject,
      text: lines.join("\n\n"),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Email failed with status ${response.status}.`);
}
