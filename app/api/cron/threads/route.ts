import { NextRequest, NextResponse } from "next/server";
import { blogTick } from "@/lib/blog/engine";
import { runTick } from "@/lib/threads/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runTick();
    // The blog shares this schedule. It only writes once a week, so most runs return at once.
    await blogTick().catch((error) => console.error("Blog draft:", error instanceof Error ? error.message : error));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Threads cron:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Threads run failed" }, { status: 500 });
  }
}
