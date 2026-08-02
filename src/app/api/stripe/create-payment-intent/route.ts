import { NextResponse } from "next/server";
import {
  buildOrderItemsFromLines,
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
  lines?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/stripe/create-payment-intent
 * Creates a PaymentIntent in HKD. Amount is computed server-side from the
 * product catalog + requested quantities (never trusts client totals).
 * Customer name is optional here — collected in the Stripe pay form.
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

  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim()
      : null;

  let items = getOrderItems(category);
  if (Array.isArray(body.lines)) {
    const lines = body.lines
      .map((line) => {
        if (!line || typeof line !== "object") return null;
        const record = line as { id?: unknown; qty?: unknown };
        if (typeof record.id !== "string") return null;
        return {
          id: record.id,
          qty: typeof record.qty === "number" ? record.qty : Number(record.qty),
        };
      })
      .filter((line): line is { id: string; qty: number } => Boolean(line));
    const rebuilt = buildOrderItemsFromLines(lines);
    if (rebuilt.length > 0) items = rebuilt;
  }

  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "empty_order" },
      { status: 400 },
    );
  }

  const orderNumber = isNonEmptyString(body.orderNumber)
    ? body.orderNumber.trim().slice(0, 60)
    : generateOrderNumber();
  const customerName = isNonEmptyString(body.customerName)
    ? body.customerName.trim().slice(0, 100)
    : "";
  const total = calcSubtotal(items) + SHIPPING;
  const amount = toStripeAmountHkd(total);

  if (!Number.isFinite(amount) || amount < 50) {
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
        lineItems: items.map((item) => `${item.id}x${item.qty}`).join(","),
      },
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
