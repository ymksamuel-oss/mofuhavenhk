import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Compatibility endpoint only. RMB/CNY FX pricing has been retired because
 * product cost and HKD retail price are now independent.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      code: "fx_pricing_disabled",
      message: "RMB/HKD automatic pricing is retired; product costs and HKD retail prices are independent.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
