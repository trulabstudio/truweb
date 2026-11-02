import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { emailOwner } from "@/lib/threads/alerts";

const text = adminText.threads.alertEmails;

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    await emailOwner(text.testSubject, [text.testBody]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : text.testFailed }, { status: 502 });
  }
}
