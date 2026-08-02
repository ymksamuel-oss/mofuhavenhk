import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  paymentIntentId?: unknown;
  customerName?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/stripe/update-customer-name
 * Stores the cardholder / Apple Pay payer name on PaymentIntent metadata
 * before or after confirm, so WhatsApp notify has a customer name.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (
    !isNonEmptyString(body.paymentIntentId) ||
    !isNonEmptyString(body.customerName)
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_input" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const id = body.paymentIntentId.trim();
    const intent = await stripe.paymentIntents.retrieve(id);
    await stripe.paymentIntents.update(id, {
      metadata: {
        ...intent.metadata,
        customerName: body.customerName.trim().slice(0, 100),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[stripe] update-customer-name failed", err);
    return NextResponse.json(
      { ok: false, error: "update_failed" },
      { status: 502 },
    );
  }
}
