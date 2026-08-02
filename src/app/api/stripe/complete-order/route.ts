import { NextResponse } from "next/server";
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
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/stripe/complete-order
 *
 * After Stripe confirms payment on the client, verify the PaymentIntent
 * server-side and send the shop WhatsApp new-order notification.
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

  if (!isNonEmptyString(body.paymentIntentId)) {
    return NextResponse.json(
      { ok: false, error: "payment_intent_required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(
      body.paymentIntentId.trim(),
      { expand: ["payment_method"] },
    );

    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { ok: false, error: "payment_not_succeeded", status: intent.status },
        { status: 402 },
      );
    }

    const orderNumber = intent.metadata?.orderNumber?.trim();
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
    const customerName =
      intent.metadata?.customerName?.trim() ||
      paymentMethod?.billing_details?.name?.trim() ||
      "";
    if (!customerName) {
      return NextResponse.json(
        { ok: false, error: "missing_customer_name" },
        { status: 400 },
      );
    }

    const paymentLabel = paymentLabelFromIntent(intent, paymentMethod);
    const total = fromStripeAmountHkd(intent.amount);

    // Idempotent: skip WhatsApp if already notified for this PaymentIntent.
    if (intent.metadata?.whatsapp_notified === "true") {
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
          ...intent.metadata,
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
