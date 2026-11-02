import { NextResponse, type NextRequest } from "next/server";
import { getSettings, saveSettings, setState } from "@/lib/threads/db";
import { verifySignedRequest } from "@/lib/threads/meta";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!verifySignedRequest(form?.get("signed_request"))) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await saveSettings({ ...(await getSettings()), paused: true });
  await setState("token", null);
  return NextResponse.json({ ok: true });
}
