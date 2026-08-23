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
  paymentMethod?: unknown;
  shippingContact?: unknown;
  lines?: unknown;
};

type ShippingContactPayload = {
  name?: unknown;
  phone?: unknown;
  phoneCountryCode?: unknown;
  address?: unknown;
  addressLine2?: unknown;
  district?: unknown;
  sfStationCode?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanMetadataValue(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getShippingContact(value: unknown): ShippingContactPayload {
  return value && typeof value === "object"
    ? (value as ShippingContactPayload)
    : {};
}

function getSafeCheckoutOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidates = [
    configured,
    request.headers.get("origin")?.trim(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : undefined,
    "https://mofuhavenhk.com",
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      const hostname = url.hostname.toLowerCase();
      const allowed =
        hostname === "mofuhavenhk.com" ||
        hostname.endsWith(".mofuhavenhk.com") ||
        hostname.endsWith(".vercel.app") ||
        hostname === "localhost";
      if (url.protocol === "https:" && allowed) {
        return url.origin;
      }
      if (url.protocol === "http:" && hostname === "localhost") {
        return url.origin;
      }
    } catch {
      // Ignore malformed deployment configuration and use the next candidate.
    }
  }

  return "https://mofuhavenhk.com";
}

function checkoutPaymentLabel(method: string): string {
  switch (method) {
    case "googlepay":
      return "Google Pay";
    case "payme":
      return "PayMe";
    case "applepay":
      return "Apple Pay";
    case "wechatpay":
      return "WeChat Pay（微信支付）";
    case "alipayhk":
      return "AlipayHK（香港支付寶）";
    default:
      return "Stripe Checkout";
  }
}

function absoluteImageUrl(image: string, origin: string): string | null {
  try {
    const url = new URL(image, origin);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * POST /api/stripe/create-checkout-session
 *
 * Creates a Stripe-hosted Checkout Session in HKD. Product names, quantities,
 * prices and availability are rebuilt from the server catalog. We deliberately
 * omit payment_method_types so Stripe's Dashboard-enabled dynamic methods can
 * decide which eligible options to render, including Google Pay and any
 * account-supported PayMe/AlipayHK method when the customer/device/domain and
 * selected configuration qualify. Domestic Alipay is explicitly excluded; no
 * unsupported `payme` or `alipayhk` API enum is sent.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "stripe_not_configured",
        hint: "Set STRIPE_PUBLISHABLE_KEY and STRIPE_LIVE_SECRET_KEY or STRIPE_SECRET_KEY on Vercel.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const category = isNonEmptyString(body.category) ? body.category.trim() : null;
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
    return NextResponse.json({ ok: false, error: "empty_order" }, { status: 400 });
  }

  const orderNumber = isNonEmptyString(body.orderNumber)
    ? body.orderNumber.trim().slice(0, 60)
    : generateOrderNumber();
  const preferredMethod = isNonEmptyString(body.paymentMethod)
    ? body.paymentMethod.trim().toLowerCase().slice(0, 40)
    : "auto";
  const customerName = isNonEmptyString(body.customerName)
    ? body.customerName.trim().slice(0, 100)
    : "";
  const contact = getShippingContact(body.shippingContact);
  const subtotal = calcSubtotal(items);
  const shipping = getShippingCost(subtotal, items.length > 0);
  const total = subtotal + shipping;
  const amount = toStripeAmountHkd(total);
  const origin = getSafeCheckoutOrigin(request);
  const paymentLabel = checkoutPaymentLabel(preferredMethod);
  const metadata = {
    orderNumber,
    customerName,
    preferredPaymentMethod: preferredMethod,
    paymentLabel,
    locale: cleanMetadataValue(body.locale, 12),
    shippingName: cleanMetadataValue(contact.name, 100),
    shippingPhone: `${cleanMetadataValue(contact.phoneCountryCode, 8)} ${cleanMetadataValue(contact.phone, 32)}`.trim(),
    shippingAddress: cleanMetadataValue(contact.address, 300),
    shippingAddressLine2: cleanMetadataValue(contact.addressLine2, 300),
    shippingDistrict: cleanMetadataValue(contact.district, 100),
    shippingSfStationCode: cleanMetadataValue(contact.sfStationCode, 32),
    subtotalHkd: subtotal.toFixed(2),
    shippingHkd: shipping.toFixed(2),
    totalHkd: total.toFixed(2),
    lineItems: items.map((item) => `${item.id}x${item.qty}`).join(",").slice(0, 500),
    site: "mofuhavenhk.com",
  };

  if (!Number.isFinite(amount) || amount < 50) {
    return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const paymentMethodConfiguration = getStripePaymentMethodConfiguration();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "hkd",
          unit_amount: toStripeAmountHkd(item.unit),
          product_data: {
            name: item.name.zh || item.name.en || item.id,
            ...(item.name.en && item.name.en !== item.name.zh
              ? { description: item.name.en.slice(0, 500) }
              : {}),
            ...(absoluteImageUrl(item.image, origin)
              ? { images: [absoluteImageUrl(item.image, origin)!] }
              : {}),
          },
        },
        quantity: item.qty,
      })),
      ...(shipping > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount" as const,
                  fixed_amount: { amount: toStripeAmountHkd(shipping), currency: "hkd" },
                  display_name: "香港本地配送",
                },
              },
            ],
          }
        : {}),
      ...(paymentMethodConfiguration
        ? { payment_method_configuration: paymentMethodConfiguration }
        : {}),
      // Block Stripe's domestic Alipay payment method. A separately supported
      // AlipayHK method remains controlled by the selected Dashboard config.
      excluded_payment_method_types: ["alipay"],
      // Hide Link from the hosted Checkout Express area. Apple Pay and Google
      // Pay remain Dashboard-enabled dynamic methods in the standard list.
      wallet_options: {
        link: { display: "never" },
      },
      payment_intent_data: {
        description: `Mofu Haven order ${orderNumber}`,
        metadata,
      },
      // Do not set payment_method_types here. Dashboard-enabled dynamic methods
      // are required for Stripe to decide whether Google Pay is eligible.
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?checkout=cancelled&order=${encodeURIComponent(orderNumber)}`,
      client_reference_id: orderNumber,
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      metadata,
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      orderNumber,
      amount: total,
      currency: "HK$",
    });
  } catch (err) {
    console.error("[stripe] create-checkout-session failed", err);
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
