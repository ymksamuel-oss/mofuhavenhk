import Stripe from "stripe";
import { notifyPaidPaymentIntent } from "@/lib/stripeOrderNotification";
import { sendPaidOrderReceipt } from "@/lib/stripeOrderReceipt";

export type PaidOrderProcessingResult =
  | {
      ok: true;
      orderNumber: string;
      paymentLabel: string;
      total: number;
      notificationStatus: "sent" | "already_notified";
      receiptStatus: "sent" | "already_sent";
      notificationProvider?: string;
      receiptProviderMessageId?: string;
    }
  | {
      ok: false;
      stage: "merchant_notification" | "customer_receipt";
      error: string;
      orderNumber?: string;
      paymentLabel?: string;
      total?: number;
    };

type ProcessPaidOrderInput = {
  stripe: Stripe;
  paymentIntent: Stripe.PaymentIntent;
  sessionMetadata?: Stripe.Metadata;
  customerEmail?: string | null;
  source: "checkout.session.completed" | "checkout.session.async_payment_succeeded" | "payment_intent.succeeded" | "success_page";
};

/**
 * Process one confirmed payment server-side. The merchant notification remains
 * first so the order workflow is not altered; a customer receipt is then sent
 * from the same confirmed PaymentIntent. Each delivery has independent
 * idempotency protection for webhook redelivery and browser fallback calls.
 */
export async function processPaidOrder({
  stripe,
  paymentIntent,
  sessionMetadata,
  customerEmail,
  source,
}: ProcessPaidOrderInput): Promise<PaidOrderProcessingResult> {
  const notification = await notifyPaidPaymentIntent({
    stripe,
    paymentIntent,
    sessionMetadata,
    source,
  });
  if (!notification.ok) {
    return {
      ok: false,
      stage: "merchant_notification",
      error: notification.error,
      orderNumber: notification.orderNumber,
      paymentLabel: notification.paymentLabel,
      total: notification.total,
    };
  }

  const receipt = await sendPaidOrderReceipt({
    stripe,
    paymentIntent,
    sessionMetadata,
    customerEmail,
  });
  if (!receipt.ok) {
    return {
      ok: false,
      stage: "customer_receipt",
      error: receipt.error,
      orderNumber: receipt.orderNumber || notification.orderNumber,
      paymentLabel: notification.paymentLabel,
      total: notification.total,
    };
  }

  return {
    ok: true,
    orderNumber: notification.orderNumber,
    paymentLabel: notification.paymentLabel,
    total: notification.total,
    notificationStatus: notification.status,
    receiptStatus: receipt.status,
    notificationProvider: notification.provider,
    receiptProviderMessageId: receipt.providerMessageId,
  };
}
