import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import {
  buildOrderItemsFromLines,
  calcSubtotal,
  generateOrderNumber,
  getOrderItems,
  getShippingCost,
} from "@/lib/order";
import {
  getStripePaymentMethodConfiguration,
  isRuntimeStripeConfigured,
  getRuntimeStripe,
  toStripeAmountHkd,
} from "@/lib/stripe";
import { isValidEmailAddress, normalizeEmailAddress } from "@/lib/emailAddress";
import { receiptLineMetadata } from "@/lib/receiptLineMetadata";
import { resolveCoupon } from "@/lib/coupon";

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
  shippingContact?: unknown;
  couponCode?: unknown;
};

type ShippingContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  phoneCountryCode?: unknown;
  address?: unknown;
  addressLine2?: unknown;
  district?: unknown;
  sfStationCode?: unknown;
};

const PAYMENT_LABELS: Record<string, string> = {
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  payme: "PayMe",
  card: "信用卡／全球支付 (Stripe)",
  alipayhk: "AlipayHK（香港支付寶）",
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanMetadataValue(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getShippingContact(value: unknown): ShippingContactPayload {
  return value && typeof value === "object" ? (value as ShippingContactPayload) : {};
}

/**
 * POST /api/stripe/create-payment-intent
 * Creates a PaymentIntent in HKD. Amount is computed server-side from the
 * product catalog + requested quantities (never trusts client totals).
 * Customer name is optional here — collected in the Stripe pay form.
 */
export async function POST(request: Request) {
  if (!(await isRuntimeStripeConfigured())) {
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
        const record = line as { id?: unknown; qty?: unknown; priceId?: unknown };
        if (typeof record.id !== "string") return null;
        return {
          id: record.id,
          qty: typeof record.qty === "number" ? record.qty : Number(record.qty),
          ...(typeof record.priceId === "string" ? { priceId: record.priceId } : {}),
        };
      })
      .filter((line): line is { id: string; qty: number; priceId?: string } => Boolean(line));
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
  const contact = getShippingContact(body.shippingContact);
  const customerEmail = normalizeEmailAddress(contact.email);
  if (!isValidEmailAddress(customerEmail)) {
    return NextResponse.json({ ok: false, error: "receipt_email_required" }, { status: 400 });
  }
  let receiptMetadata: Record<string, string>;
  try {
    receiptMetadata = receiptLineMetadata(items);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "receipt_line_items_invalid", detail: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
  const preferredMethod = isNonEmptyString(body.paymentMethod)
    ? body.paymentMethod.trim().toLowerCase()
    : "";
  const allowedPaymentMethods = new Set(["card", "applepay"]);
  if (preferredMethod && !allowedPaymentMethods.has(preferredMethod)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_payment_method" },
      { status: 400 },
    );
  }
  const paymentLabel =
    PAYMENT_LABELS[preferredMethod] || "Stripe";
  const subtotal = calcSubtotal(items);
  const coupon = await resolveCoupon(body.couponCode, subtotal);
  const shipping = getShippingCost(subtotal - coupon.discount, items.length > 0);
  const total = Math.max(0, subtotal - coupon.discount + shipping);
  const amount = toStripeAmountHkd(total);

  if (!Number.isFinite(amount) || amount < 50) {
    return NextResponse.json(
      { ok: false, error: "invalid_amount" },
      { status: 400 },
    );
  }

  try {
    const stripe = await getRuntimeStripe();
    const paymentMethodConfiguration = getStripePaymentMethodConfiguration();
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName || cleanMetadataValue(contact.name, 100) || undefined,
      description: `Mofu Haven customer for order ${orderNumber}`,
    }, { idempotencyKey: `mofu-receipt-customer-${orderNumber}` });
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "hkd",
      // Card and Apple Pay use this Elements/PaymentIntent path. Google Pay,
      // PayMe and AlipayHK use the hosted Checkout route. No unsupported
      // payment-method enum is hard-coded here.
      automatic_payment_methods: { enabled: true },
      ...(paymentMethodConfiguration
        ? { payment_method_configuration: paymentMethodConfiguration }
        : {}),
      // Exclude Stripe's domestic Alipay type. A separate AlipayHK method, if
      // enabled by Stripe for this account/configuration, remains Dashboard-driven.
      excluded_payment_method_types: ["alipay"],
      description: `Mofu Haven order ${orderNumber}`,
      customer: customer.id,
      metadata: {
        orderNumber,
        customerName,
        category: category ?? "",
        site: "mofuhavenhk.com",
        whatsapp_notified: "false",
        receipt_email_sent: "false",
        paymentMethod: preferredMethod || "auto",
        paymentLabel,
        shippingName: cleanMetadataValue(contact.name, 100),
        shippingPhone: `${cleanMetadataValue(contact.phoneCountryCode, 8)} ${cleanMetadataValue(contact.phone, 32)}`.trim(),
        shippingAddress: cleanMetadataValue(contact.address, 300),
        shippingAddressLine2: cleanMetadataValue(contact.addressLine2, 300),
        shippingDistrict: cleanMetadataValue(contact.district, 100),
        shippingSfStationCode: cleanMetadataValue(contact.sfStationCode, 32),
        subtotalHkd: subtotal.toFixed(2),
        shippingHkd: shipping.toFixed(2),
        totalHkd: total.toFixed(2),
        couponCode: coupon.code,
        couponDiscountHkd: coupon.discount.toFixed(2),
        lineItems: items.map((item) => `${item.id}:${item.stripePriceId ?? "dynamic"}x${item.qty}`).join(",").slice(0, 500),
        ...receiptMetadata,
      },
    });

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: orderError } = await supabase.from("orders").insert({
        customer_info: { ...contact, name: customerName, email: customerEmail },
        items: items.map((item) => ({ id: item.id, name: item.name, qty: item.qty, price: item.unit, priceId: item.stripePriceId || null })),
        total,
        status: "pending",
        payment_intent_id: intent.id,
        order_number: orderNumber,
      });
      if (orderError) console.warn("[orders] unable to persist pending order", orderError.message);
    }
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
