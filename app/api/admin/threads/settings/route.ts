import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getSettings, saveSettings } from "@/lib/threads/db";
import { rescheduleQueue } from "@/lib/threads/engine";
import { validateSettings } from "@/lib/threads/schedule";

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { settings, errors } = validateSettings(await request.json().catch(() => null));
  if (errors.length) return NextResponse.json({ error: "Please fix the following fields.", errors }, { status: 400 });
  try {
    const before = await getSettings();
    await saveSettings(settings);
    if (before.postTimes.join() !== settings.postTimes.join()) await rescheduleQueue(settings, false);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin Threads settings:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not save settings. Please try again." }, { status: 502 });
  }
}
