import { NextRequest, NextResponse } from "next/server";

import { syncCatalogToLatestFxRate } from "@/lib/fxPricingSync";
import { readServerEnv } from "@/lib/serverEnv";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function cronAuthorized(request: NextRequest): boolean {
  const secret = readServerEnv("CRON_SECRET");
  const authorization = request.headers.get("authorization");
  return Boolean(secret) && authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await syncCatalogToLatestFxRate({ apply: true });
    return NextResponse.json({ ok: summary.failedPriceCount === 0, summary }, {
      status: summary.failedPriceCount === 0 ? 200 : 207,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("FX pricing scheduled sync failed", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json({ ok: false, code: "fx_pricing_sync_failed" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
