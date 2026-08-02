import { NextResponse } from "next/server";
import {
  calcSubtotal,
  generateOrderNumber,
  getOrderItems,
  SHIPPING,
} from "@/lib/order";
import {
  getStripe,
  isStripeConfigured,
  toStripeAmountHkd,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  customerName?: unknown;
  category?: unknown;
  orderNumber?: unknown;
  locale?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/stripe/create-payment-intent
 * Creates a PaymentIntent in HKD for the demo/category order.
 * Amount is computed server-side (never trusted from the client).
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "stripe_not_configured",
        hint: "Set STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY on Vercel.",
      },
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

  if (!isNonEmptyString(body.customerName)) {
    return NextResponse.json(
      { ok: false, error: "customer_name_required" },
      { status: 400 },
    );
  }

  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : null;
  const items = getOrderItems(category);
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "empty_order" },
      { status: 400 },
    );
  }

  const orderNumber = isNonEmptyString(body.orderNumber)
    ? body.orderNumber.trim().slice(0, 60)
    : generateOrderNumber();
  const customerName = body.customerName.trim().slice(0, 100);
  const total = calcSubtotal(items) + SHIPPING;
  const amount = toStripeAmountHkd(total);

  if (!Number.isFinite(amount) || amount < 50) {
    // Stripe HKD minimum is typically HK$0.50
    return NextResponse.json(
      { ok: false, error: "invalid_amount" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "hkd",
      automatic_payment_methods: { enabled: true },
      description: `Mofu Haven order ${orderNumber}`,
      metadata: {
        orderNumber,
        customerName,
        category: category ?? "",
        site: "mofuhavenhk.com",
        whatsapp_notified: "false",
      },
      receipt_email: undefined,
    });

    if (!intent.client_secret) {
      return NextResponse.json(
        { ok: false, error: "missing_client_secret" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      orderNumber,
      amount: total,
      currency: "HK$",
    });
  } catch (err) {
    console.error("[stripe] create-payment-intent failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: "stripe_create_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
