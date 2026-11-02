import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(await runTick());
  } catch (error) {
    console.error("Threads cron:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Threads run failed" }, { status: 500 });
  }
}
