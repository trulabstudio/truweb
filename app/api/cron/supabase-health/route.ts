import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase health check is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/leads?select=id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      console.error(
        "Supabase health check failed",
        response.status,
        await response.text(),
      );
      return NextResponse.json(
        { error: "Supabase health check failed." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Supabase health check request failed", error);
    return NextResponse.json(
      { error: "Supabase health check request failed." },
      { status: 502 },
    );
  }
}
