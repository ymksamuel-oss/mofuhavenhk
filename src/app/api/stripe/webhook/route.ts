import { NextResponse } from "next/server";
import Stripe from "stripe";
import { notifyPaidPaymentIntent } from "@/lib/stripeOrderNotification";
import { getStripe, getStripeSecretKey } from "@/lib/stripe";
import { readServerEnv } from "@/lib/serverEnv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "payment_intent.succeeded",
]);

function webhookSecret(): string {
  return readServerEnv("STRIPE_WEBHOOK_SECRET");
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * POST /api/stripe/webhook
 *
 * Stripe is the source of truth for completed payments. The raw body must be
 * passed to constructEvent before any JSON parsing so Stripe's signature can
 * be verified. Failed notification delivery deliberately returns 503, which
 * asks Stripe to redeliver the event instead of silently losing the order.
 */
export async function POST(request: Request) {
  const secret = webhookSecret();
  if (!secret) {
    console.error(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET is missing on this deployment",
    );
    return jsonError("webhook_not_configured", 503);
  }

  if (!getStripeSecretKey()) {
    console.error("[stripe-webhook] Stripe secret key is missing");
    return jsonError("stripe_not_configured", 503);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[stripe-webhook] missing Stripe-Signature header");
    return jsonError("missing_signature", 400);
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe-webhook] signature verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonError("invalid_signature", 400);
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    console.log("[stripe-webhook] ignored event", {
      eventId: event.id,
      type: event.type,
    });
    return NextResponse.json({ ok: true, received: true, ignored: true });
  }

  try {
    const stripe = getStripe();
    let paymentIntent: Stripe.PaymentIntent;
    let sessionMetadata: Stripe.Metadata | undefined;

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const eventSession = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
        expand: ["payment_intent.payment_method"],
      });

      sessionMetadata = session.metadata ?? undefined;
      if (!session.payment_intent) {
        console.log("[stripe-webhook] Checkout has no PaymentIntent yet", {
          eventId: event.id,
          sessionId: session.id,
        });
        return NextResponse.json({
          ok: true,
          received: true,
          pending: true,
        });
      }

      if (typeof session.payment_intent === "string") {
        paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          { expand: ["payment_method"] },
        );
      } else {
        paymentIntent = session.payment_intent;
      }

      // checkout.session.completed can be emitted before a delayed payment is
      // finally paid. async_payment_succeeded or payment_intent.succeeded will
      // handle that later; acknowledge this event without sending prematurely.
      if (
        paymentIntent.status !== "succeeded" ||
        (event.type === "checkout.session.completed" &&
          session.payment_status !== "paid")
      ) {
        console.log("[stripe-webhook] payment is not settled yet", {
          eventId: event.id,
          sessionId: session.id,
          paymentIntentId: paymentIntent.id,
          paymentStatus: session.payment_status,
          intentStatus: paymentIntent.status,
        });
        return NextResponse.json({
          ok: true,
          received: true,
          pending: true,
        });
      }
    } else {
      const eventIntent = event.data.object as Stripe.PaymentIntent;
      paymentIntent = await stripe.paymentIntents.retrieve(eventIntent.id, {
        expand: ["payment_method"],
      });
      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json({
          ok: true,
          received: true,
          pending: true,
        });
      }
    }

    const result = await notifyPaidPaymentIntent({
      stripe,
      paymentIntent,
      sessionMetadata,
      source: event.type as
        | "checkout.session.completed"
        | "checkout.session.async_payment_succeeded"
        | "payment_intent.succeeded",
    });

    if (!result.ok) {
      console.error("[stripe-webhook] order notification was not completed", {
        eventId: event.id,
        paymentIntentId: paymentIntent.id,
        status: result.status,
        error: result.error,
      });
      return NextResponse.json(
        {
          ok: false,
          received: true,
          error: result.error,
          orderNumber: result.orderNumber,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      received: true,
      notified: result.status === "sent",
      alreadyNotified: result.status === "already_notified",
      orderNumber: result.orderNumber,
      provider: result.provider,
    });
  } catch (error) {
    console.error("[stripe-webhook] handler failed", {
      eventId: event.id,
      type: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonError("webhook_processing_failed", 503);
  }
}
