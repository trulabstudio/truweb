import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, createSession, passwordMatches, SESSION_COOKIE, SESSION_SECONDS } from "@/lib/admin/auth";

const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is missing or shorter than 12 characters." }, { status: 503 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !passwordMatches(body.password)) {
    attempts.set(ip, [...recent, now]);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
