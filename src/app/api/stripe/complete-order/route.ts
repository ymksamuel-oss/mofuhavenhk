import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  buildNotifyMessage,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";
import {
  fromStripeAmountHkd,
  getStripe,
  isStripeConfigured,
  paymentLabelFromIntent,
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
 * After Stripe confirms payment, verify either the PaymentIntent or a hosted
 * Checkout Session server-side and send the shop WhatsApp new-order notification.
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
    let sessionMetadata: Record<string, string> = {};

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
      if (!session.payment_intent || typeof session.payment_intent === "string") {
        return NextResponse.json(
          { ok: false, error: "checkout_missing_payment_intent" },
          { status: 502 },
        );
      }
      intent = session.payment_intent;
      sessionMetadata = session.metadata ?? {};
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

    const metadata = { ...sessionMetadata, ...intent.metadata };
    const orderNumber = metadata.orderNumber?.trim();
    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: "missing_order_metadata" },
        { status: 400 },
      );
    }

    const paymentMethod =
      intent.payment_method && typeof intent.payment_method !== "string"
        ? intent.payment_method
        : null;
    // Wallet redirects (for example WeChat Pay or an account-supported
    // AlipayHK method) may not collect a cardholder name.
    const customerName =
      metadata.customerName?.trim() ||
      paymentMethod?.billing_details?.name?.trim() ||
      "顧客";

    const paymentLabel = paymentLabelFromIntent(intent, paymentMethod);
    const total = fromStripeAmountHkd(intent.amount);

    // Idempotent: skip WhatsApp if already notified for this PaymentIntent.
    if (metadata.whatsapp_notified === "true") {
      return NextResponse.json({
        ok: true,
        alreadyNotified: true,
        orderNumber,
        paymentLabel,
        total,
      });
    }

    const message = buildNotifyMessage({
      orderNumber,
      customerName,
      paymentLabel,
      total,
      currency: "HK$",
    });

    const notify = await sendWhatsAppNotification(message);

    if (notify.ok) {
      await stripe.paymentIntents.update(intent.id, {
        metadata: {
          ...metadata,
          customerName,
          whatsapp_notified: "true",
          paymentLabel,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      paymentLabel,
      total,
      notified: notify.ok,
      notifyError: notify.ok ? undefined : notify.error,
      provider: notify.ok ? notify.provider : undefined,
    });
  } catch (err) {
    console.error("[stripe] complete-order failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: "complete_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
