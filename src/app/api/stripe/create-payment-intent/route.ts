import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import {
  buildOrderItemsFromLines,
  calcSubtotal,
  generateOrderNumber,
  getOrderItems,
  getShippingCost,
} from "@/lib/order";
import {
  getStripe,
  getStripePaymentMethodConfiguration,
  isStripeConfigured,
  toStripeAmountHkd,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  customerName?: unknown;
  category?: unknown;
  orderNumber?: unknown;
  locale?: unknown;
  lines?: unknown;
  /** Preferred checkout method — stored in metadata for WhatsApp labels. */
  paymentMethod?: unknown;
};

const PAYMENT_LABELS: Record<string, string> = {
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  payme: "PayMe",
  card: "信用卡／全球支付 (Stripe)",
  wechatpay: "WeChat Pay（微信支付）",
  alipayhk: "AlipayHK（香港支付寶）",
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

  const catalog = await getCatalogSnapshot();
  let items = getOrderItems(category, catalog.products);
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
    const rebuilt = buildOrderItemsFromLines(lines, catalog.products);
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
  const preferredMethod = isNonEmptyString(body.paymentMethod)
    ? body.paymentMethod.trim().toLowerCase()
    : "";
  const paymentLabel =
    PAYMENT_LABELS[preferredMethod] || "Stripe";
  const subtotal = calcSubtotal(items);
  const total = subtotal + getShippingCost(subtotal, items.length > 0);
  const amount = toStripeAmountHkd(total);

  if (!Number.isFinite(amount) || amount < 50) {
    return NextResponse.json(
      { ok: false, error: "invalid_amount" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const paymentMethodConfiguration = getStripePaymentMethodConfiguration();
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "hkd",
      // Dashboard-enabled methods (card, wallets and WeChat Pay) for HKD.
      // Google Pay is also allowed by Payment Request when the device qualifies.
      // Google Pay, PayMe and AlipayHK use the hosted Checkout route. No
      // unsupported payment-method enum is hard-coded here.
      automatic_payment_methods: { enabled: true },
      ...(paymentMethodConfiguration
        ? { payment_method_configuration: paymentMethodConfiguration }
        : {}),
      // Exclude Stripe's domestic Alipay type. A separate AlipayHK method, if
      // enabled by Stripe for this account/configuration, remains Dashboard-driven.
      excluded_payment_method_types: ["alipay"],
      ...(preferredMethod === "wechatpay"
        ? {
            payment_method_options: {
              wechat_pay: { client: "web" },
            },
          }
        : {}),
      description: `Mofu Haven order ${orderNumber}`,
      metadata: {
        orderNumber,
        customerName,
        category: category ?? "",
        site: "mofuhavenhk.com",
        whatsapp_notified: "false",
        paymentMethod: preferredMethod || "auto",
        paymentLabel,
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
      items,
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
