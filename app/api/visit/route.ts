import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/threads/db";
import { cleanLeadSource } from "@/lib/threads/schedule";

export const runtime = "nodejs";

/** Counts a landing page visit. Failures are ignored, because counting must never get in a visitor's way. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { src?: unknown };
    if (!/bot|crawl|spider|preview|facebookexternalhit/i.test(request.headers.get("user-agent") ?? "")) await recordVisit(cleanLeadSource(body.src) !== "website");
  } catch (error) {
    console.error("Visit not counted:", error instanceof Error ? error.message : error);
  }
  return new NextResponse(null, { status: 204 });
}
