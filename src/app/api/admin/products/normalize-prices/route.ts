import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Compatibility endpoint retained for old clients; automatic RMB pricing is retired. */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      code: "automatic_pricing_disabled",
      message: "Automatic RMB/CNY pricing is retired; edit HKD retail prices directly.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
