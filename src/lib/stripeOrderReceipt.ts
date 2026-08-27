import Stripe from "stripe";
import { fromStripeAmountHkd, paymentLabelFromIntent } from "@/lib/stripe";
import {
  type EmailReceiptLine,
  sendOrderReceiptEmail,
} from "@/lib/orderReceiptEmail";
import { parseReceiptLineMetadata } from "@/lib/receiptLineMetadata";
import { normalizeEmailAddress } from "@/lib/emailAddress";

export type PaidOrderReceiptResult =
  | {
      ok: true;
      status: "sent" | "already_sent";
      orderNumber: string;
      customerEmailPresent: boolean;
      providerMessageId?: string;
    }
  | {
      ok: false;
      status:
        | "missing_order_metadata"
        | "missing_customer_email"
        | "missing_receipt_line_items"
        | "invalid_payment_amount"
        | "not_configured"
        | "send_failed"
        | "metadata_update_failed";
      error: string;
      orderNumber?: string;
    };

type SendPaidOrderReceiptInput = {
  stripe: Stripe;
  paymentIntent: Stripe.PaymentIntent;
  sessionMetadata?: Stripe.Metadata;
  customerEmail?: string | null;
};

function value(metadata: Stripe.Metadata, key: string): string {
  return typeof metadata[key] === "string" ? metadata[key].trim() : "";
}

function positiveMoney(metadata: Stripe.Metadata, key: string): number | null {
  const parsed = Number(value(metadata, key));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function shippingAddress(metadata: Stripe.Metadata): string {
  const address = [
    value(metadata, "shippingAddress"),
    value(metadata, "shippingAddressLine2"),
    value(metadata, "shippingDistrict"),
  ].filter(Boolean);
  const sfStationCode = value(metadata, "shippingSfStationCode");
  if (sfStationCode) address.push(`順豐站／智能櫃：${sfStationCode}`);
  return address.join("，");
}

function isExpandedProduct(product: Stripe.Price["product"]): product is Stripe.Product {
  return typeof product !== "string" && !("deleted" in product && product.deleted);
}

function productName(price: Stripe.Price): string {
  return isExpandedProduct(price.product)
    ? price.product.name
    : price.nickname || "Mofu Haven 商品";
}

function productId(price: Stripe.Price): string {
  return isExpandedProduct(price.product) ? price.product.id : "";
}

function productMofuSku(price: Stripe.Price): string {
  return isExpandedProduct(price.product)
    ? value(price.product.metadata ?? {}, "mofu_sku")
    : "";
}

async function paymentCompletedAt(stripe: Stripe, paymentIntent: Stripe.PaymentIntent): Promise<Date> {
  try {
    const latestCharge = paymentIntent.latest_charge;
    const chargeId = typeof latestCharge === "string" ? latestCharge : latestCharge?.id;
    if (chargeId) {
      const charge = await stripe.charges.retrieve(chargeId);
      return new Date(charge.created * 1000);
    }
  } catch {
    // A receipt may still be sent using the PaymentIntent creation time if the
    // charge fetch is temporarily unavailable after a confirmed payment.
  }
  return new Date(paymentIntent.created * 1000);
}

async function receiptLinesFromMetadata(
  stripe: Stripe,
  metadata: Stripe.Metadata,
): Promise<EmailReceiptLine[] | null> {
  const references = parseReceiptLineMetadata(metadata);
  if (references.length === 0) return null;
  const lines = await Promise.all(
    references.map(async (reference) => {
      const price = await stripe.prices.retrieve(reference.priceId, {
        expand: ["product"],
      });
      if (productId(price) !== reference.productId || !Number.isInteger(price.unit_amount)) {
        return null;
      }
      const priceMetadata = price.metadata ?? {};
      return {
        name: productName(price),
        variantLabel: value(priceMetadata, "variant_label_zh") || undefined,
        mofuSku: productMofuSku(price) || undefined,
        quantity: reference.quantity,
        unitAmountHkd: fromStripeAmountHkd(price.unit_amount!),
      } satisfies EmailReceiptLine;
    }),
  );
  return lines.every(Boolean) ? (lines as EmailReceiptLine[]) : null;
}

async function customerEmail(
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent,
  suppliedEmail?: string | null,
): Promise<string> {
  const paymentMethod =
    paymentIntent.payment_method && typeof paymentIntent.payment_method !== "string"
      ? paymentIntent.payment_method
      : null;
  const direct = normalizeEmailAddress(
    suppliedEmail || paymentIntent.receipt_email || paymentMethod?.billing_details?.email,
  );
  if (direct) return direct;
  try {
    const linkedCustomer = paymentIntent.customer;
    const customer =
      typeof linkedCustomer === "string"
        ? await stripe.customers.retrieve(linkedCustomer)
        : linkedCustomer;
    if (customer && !("deleted" in customer && customer.deleted)) {
      return normalizeEmailAddress(customer.email);
    }
  } catch {
    // The processing result below will return a retryable missing-email state.
  }
  return "";
}

/**
 * Sends one customer receipt after a confirmed payment. Stripe metadata records
 * a successful delivery after Resend accepts it; Resend's 24-hour idempotency
 * key protects retries during a transient metadata-write failure.
 */
export async function sendPaidOrderReceipt({
  stripe,
  paymentIntent,
  sessionMetadata = {},
  customerEmail: suppliedEmail,
}: SendPaidOrderReceiptInput): Promise<PaidOrderReceiptResult> {
  const metadata = { ...sessionMetadata, ...(paymentIntent.metadata ?? {}) };
  const orderNumber = value(metadata, "orderNumber");
  if (!orderNumber) {
    return { ok: false, status: "missing_order_metadata", error: "missing_order_metadata" };
  }
  const email = await customerEmail(stripe, paymentIntent, suppliedEmail);
  if (!email) {
    return { ok: false, status: "missing_customer_email", error: "missing_customer_email", orderNumber };
  }
  if (metadata.receipt_email_sent === "true") {
    return { ok: true, status: "already_sent", orderNumber, customerEmailPresent: true };
  }
  const totalHkd = fromStripeAmountHkd(paymentIntent.amount_received || paymentIntent.amount);
  if (!Number.isFinite(totalHkd) || totalHkd <= 0) {
    return { ok: false, status: "invalid_payment_amount", error: "invalid_payment_amount", orderNumber };
  }
  const items = await receiptLinesFromMetadata(stripe, metadata);
  if (!items) {
    return { ok: false, status: "missing_receipt_line_items", error: "missing_receipt_line_items", orderNumber };
  }
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.unitAmountHkd * item.quantity, 0);
  const metadataSubtotal = positiveMoney(metadata, "subtotalHkd");
  const metadataShipping = positiveMoney(metadata, "shippingHkd");
  const subtotalHkd = metadataSubtotal ?? calculatedSubtotal;
  const shippingHkd = metadataShipping ?? Math.max(0, totalHkd - subtotalHkd);
  if (Math.abs(subtotalHkd + shippingHkd - totalHkd) > 0.01) {
    return { ok: false, status: "invalid_payment_amount", error: "receipt_total_mismatch", orderNumber };
  }
  const paymentMethod =
    paymentIntent.payment_method && typeof paymentIntent.payment_method !== "string"
      ? paymentIntent.payment_method
      : null;
  const paymentLabel = paymentLabelFromIntent(paymentIntent, paymentMethod);
  const delivery = await sendOrderReceiptEmail(paymentIntent.id, {
    orderNumber,
    customerName: value(metadata, "customerName") || "顧客",
    customerEmail: email,
    shippingRecipientName: value(metadata, "shippingName") || value(metadata, "customerName") || "顧客",
    shippingPhone: value(metadata, "shippingPhone"),
    shippingAddress: shippingAddress(metadata),
    paidAt: await paymentCompletedAt(stripe, paymentIntent),
    paymentLabel,
    subtotalHkd,
    shippingHkd,
    totalHkd,
    items,
  });
  if (!delivery.ok) {
    return {
      ok: false,
      status: delivery.status === "invalid_recipient" ? "missing_customer_email" : delivery.status,
      error: delivery.error,
      orderNumber,
    };
  }
  try {
    await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {
          ...(paymentIntent.metadata ?? {}),
          receipt_email_sent: "true",
          receipt_email_provider_id: delivery.providerMessageId,
        },
      },
      { idempotencyKey: `mofu-receipt-mark-sent-${paymentIntent.id}` },
    );
  } catch (error) {
    console.error("[receipt-email] delivery sent but metadata flag failed", {
      paymentIntentId: paymentIntent.id,
      orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: "metadata_update_failed", error: "metadata_update_failed", orderNumber };
  }
  return {
    ok: true,
    status: "sent",
    orderNumber,
    customerEmailPresent: true,
    providerMessageId: delivery.providerMessageId,
  };
}
