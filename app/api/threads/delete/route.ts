import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getSettings, rest, saveSettings, setState } from "@/lib/threads/db";
import { verifySignedRequest } from "@/lib/threads/meta";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!verifySignedRequest(form?.get("signed_request"))) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await saveSettings({ ...(await getSettings()), paused: true });
  await rest("threads_posts?id=gt.0", { method: "DELETE" });
  await setState("token", null);
  await setState("followers", null);
  return NextResponse.json({ url: siteConfig.url, confirmation_code: randomUUID() });
}
