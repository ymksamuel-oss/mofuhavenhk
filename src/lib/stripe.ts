import Stripe from "stripe";

/** HKD uses two decimal places → Stripe amount in cents. */
export function toStripeAmountHkd(totalHkd: number): number {
  return Math.round(totalHkd * 100);
}

export function fromStripeAmountHkd(amountCents: number): number {
  return amountCents / 100;
}

/** Publishable key ships as fallback; Secret Key must stay in Vercel env (GitHub blocks sk_live in git). */
const DEFAULT_STRIPE_PUBLISHABLE_KEY = "pk_live_51TxSYXRyM6dRKLtZ6joIPvsDMs2B4tT213AXP0GwQj4erOGz28GS9lc66i5tuM2rVRlM0RqTuHRbKFWmliTDm4G300WPBn3IyJ";

export function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

/**
 * Publishable key for Stripe.js / Elements.
 * Prefer STRIPE_PUBLISHABLE_KEY (as requested); also accept NEXT_PUBLIC_*.
 */
export function getStripePublishableKey(): string {
  return (
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    DEFAULT_STRIPE_PUBLISHABLE_KEY
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripePublishableKey());
}

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripeSingleton;
}

export function paymentLabelFromIntent(
  intent: Stripe.PaymentIntent,
  paymentMethod: Stripe.PaymentMethod | null,
): string {
  const wallet = paymentMethod?.card?.wallet?.type;
  if (wallet === "apple_pay") return "Apple Pay";
  // Google Pay is intentionally disabled in checkout UI / Payment Request.
  if (paymentMethod?.type === "wechat_pay") {
    return "WeChat Pay（微信支付）";
  }
  if (paymentMethod?.type === "alipay") {
    return "AlipayHK（香港支付寶）";
  }
  if (paymentMethod?.type === "card") {
    return "信用卡／全球支付 (Stripe)";
  }
  if (intent.metadata?.paymentLabel) {
    return intent.metadata.paymentLabel;
  }
  return "Stripe";
}
