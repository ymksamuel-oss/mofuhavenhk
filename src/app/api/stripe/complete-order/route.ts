import { NextResponse } from "next/server";
import Stripe from "stripe";
import { notifyPaidPaymentIntent } from "@/lib/stripeOrderNotification";
import {
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

 type Body = {
  paymentIntentId?: unknown;
  checkoutSessionId?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/stripe/complete-order
 *
 * Legacy browser fallback for the success page and the PaymentIntent Elements
 * flow. Stripe's server-to-server webhook is now the primary trigger; this
 * route remains useful when a customer returns before the webhook is handled.
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

  const paymentIntentId = isNonEmptyString(body.paymentIntentId)
    ? body.paymentIntentId.trim()
    : "";
  const checkoutSessionId = isNonEmptyString(body.checkoutSessionId)
    ? body.checkoutSessionId.trim()
    : "";

  if (!paymentIntentId && !checkoutSessionId) {
    return NextResponse.json(
      { ok: false, error: "payment_reference_required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    let intent: Stripe.PaymentIntent;
    let sessionMetadata: Stripe.Metadata | undefined;

    if (checkoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
        expand: ["payment_intent.payment_method"],
      });
      if (
        session.mode !== "payment" ||
        session.status !== "complete" ||
        session.payment_status !== "paid"
      ) {
        return NextResponse.json(
          { ok: false, error: "checkout_not_paid" },
          { status: 402 },
        );
      }
      if (!session.payment_intent) {
        return NextResponse.json(
          { ok: false, error: "checkout_missing_payment_intent" },
          { status: 502 },
        );
      }
      sessionMetadata = session.metadata ?? undefined;
      intent =
        typeof session.payment_intent === "string"
          ? await stripe.paymentIntents.retrieve(session.payment_intent, {
              expand: ["payment_method"],
            })
          : session.payment_intent;
    } else {
      intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["payment_method"],
      });
    }

    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { ok: false, error: "payment_not_succeeded", status: intent.status },
        { status: 402 },
      );
    }

    const result = await notifyPaidPaymentIntent({
      stripe,
      paymentIntent: intent,
      sessionMetadata,
      source: "success_page",
    });

    if (!result.ok) {
      // The PaymentIntent is already confirmed. Never make the browser treat a
      // notification outage as a payment failure or invite a second charge.
      return NextResponse.json({
        ok: true,
        orderNumber: result.orderNumber,
        paymentLabel: result.paymentLabel,
        total: result.total,
        notified: false,
        notifyError: result.error,
      });
    }

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      paymentLabel: result.paymentLabel,
      total: result.total,
      notified: result.status === "sent",
      alreadyNotified: result.status === "already_notified",
      provider: result.provider,
    });
  } catch (error) {
    console.error("[stripe] complete-order failed", {
      paymentIntentId: paymentIntentId || undefined,
      checkoutSessionId: checkoutSessionId || undefined,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        error: "complete_failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
