import Stripe from "stripe";
import {
  buildNotifyMessage,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";
import {
  fromStripeAmountHkd,
  paymentLabelFromIntent,
} from "@/lib/stripe";

export type PaidOrderNotificationResult =
  | {
      ok: true;
      status: "sent" | "already_notified";
      orderNumber: string;
      paymentLabel: string;
      total: number;
      provider?: string;
    }
  | {
      ok: false;
      status:
        | "missing_order_metadata"
        | "invalid_payment_amount"
        | "not_configured"
        | "send_failed"
        | "metadata_update_failed";
      error: string;
      orderNumber?: string;
      paymentLabel?: string;
      total?: number;
    };

type NotifyPaidOrderInput = {
  stripe: Stripe;
  paymentIntent: Stripe.PaymentIntent;
  sessionMetadata?: Stripe.Metadata;
  source: "checkout.session.completed" | "checkout.session.async_payment_succeeded" | "payment_intent.succeeded" | "success_page";
};

function nonEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Sends one merchant notification for a confirmed Stripe PaymentIntent.
 * The PaymentIntent metadata flag makes normal webhook redeliveries and the
 * legacy browser fallback idempotent after the first successful delivery.
 */
export async function notifyPaidPaymentIntent({
  stripe,
  paymentIntent,
  sessionMetadata = {},
  source,
}: NotifyPaidOrderInput): Promise<PaidOrderNotificationResult> {
  const metadata = {
    ...sessionMetadata,
    ...(paymentIntent.metadata ?? {}),
  };
  const orderNumber = nonEmpty(metadata.orderNumber);

  if (!orderNumber) {
    console.error("[stripe-notify] missing orderNumber metadata", {
      source,
      paymentIntentId: paymentIntent.id,
    });
    return {
      ok: false,
      status: "missing_order_metadata",
      error: "missing_order_metadata",
    };
  }

  const total = fromStripeAmountHkd(paymentIntent.amount);
  if (!Number.isFinite(total) || total <= 0) {
    console.error("[stripe-notify] invalid PaymentIntent amount", {
      source,
      paymentIntentId: paymentIntent.id,
      orderNumber,
      amount: paymentIntent.amount,
    });
    return {
      ok: false,
      status: "invalid_payment_amount",
      error: "invalid_payment_amount",
      orderNumber,
    };
  }

  const paymentMethod =
    paymentIntent.payment_method && typeof paymentIntent.payment_method !== "string"
      ? paymentIntent.payment_method
      : null;
  const customerName =
    nonEmpty(metadata.customerName) ||
    nonEmpty(paymentMethod?.billing_details?.name) ||
    "顧客";
  const detectedPaymentLabel = paymentLabelFromIntent(paymentIntent, paymentMethod);
  const paymentLabel =
    detectedPaymentLabel !== "Stripe"
      ? detectedPaymentLabel
      : nonEmpty(metadata.paymentLabel) || "Stripe";

  if (metadata.whatsapp_notified === "true") {
    console.log("[stripe-notify] duplicate delivery skipped", {
      source,
      paymentIntentId: paymentIntent.id,
      orderNumber,
    });
    return {
      ok: true,
      status: "already_notified",
      orderNumber,
      paymentLabel,
      total,
    };
  }

  const message = buildNotifyMessage({
    orderNumber,
    customerName,
    paymentLabel,
    total,
    currency: "HK$",
  });

  console.log("[stripe-notify] sending merchant WhatsApp notification", {
    source,
    paymentIntentId: paymentIntent.id,
    orderNumber,
    paymentLabel,
    total,
  });

  const notify = await sendWhatsAppNotification(message);
  if (!notify.ok) {
    console.error("[stripe-notify] WhatsApp delivery failed", {
      source,
      paymentIntentId: paymentIntent.id,
      orderNumber,
      error: notify.error,
    });
    return {
      ok: false,
      status: notify.error === "not_configured" ? "not_configured" : "send_failed",
      error: notify.error,
      orderNumber,
      paymentLabel,
      total,
    };
  }

  try {
    await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {
          ...metadata,
          customerName,
          paymentLabel,
          whatsapp_notified: "true",
        },
      },
      { idempotencyKey: `mofu-whatsapp-notify-${paymentIntent.id}` },
    );
  } catch (error) {
    console.error("[stripe-notify] delivery sent but metadata flag failed", {
      source,
      paymentIntentId: paymentIntent.id,
      orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      status: "metadata_update_failed",
      error: "metadata_update_failed",
      orderNumber,
      paymentLabel,
      total,
    };
  }

  console.log("[stripe-notify] merchant WhatsApp notification sent", {
    source,
    paymentIntentId: paymentIntent.id,
    orderNumber,
    provider: notify.provider,
  });
  return {
    ok: true,
    status: "sent",
    orderNumber,
    paymentLabel,
    total,
    provider: notify.provider,
  };
}
