import { NextResponse } from "next/server";
import {
  buildNotifyMessage,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";

export const runtime = "nodejs";

type NotifyOrderRequestBody = {
  orderNumber?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
  paymentLabel?: unknown;
  total?: unknown;
  currency?: unknown;
  siteUrl?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * POST /api/notify-order
 *
 * Called from the checkout page after a customer places an order and picks
 * a payment method (card, Apple Pay, AlipayHK, FPS, or Octopus). Formats a
 * new-order summary and sends it automatically, server-side, to the shop's
 * WhatsApp number via Twilio or CallMeBot (see src/lib/notifyWhatsapp.ts).
 *
 * Body: { orderNumber, customerName, customerPhone?, paymentLabel, total, currency?, siteUrl? }
 * Response: { ok: true, provider } on success, { ok: false, error } otherwise.
 *
 * This never throws on a missing/failed provider — it responds 502 with a
 * clear error code so the frontend can degrade gracefully (e.g. by pointing
 * the customer at the manual "Order via WhatsApp" button) without blocking
 * checkout.
 */
export async function POST(request: Request) {
  let body: NotifyOrderRequestBody;
  try {
    body = (await request.json()) as NotifyOrderRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const {
    orderNumber,
    customerName,
    customerPhone,
    paymentLabel,
    total,
    currency,
    siteUrl,
  } = body;

  if (
    !isNonEmptyString(orderNumber) ||
    !isNonEmptyString(customerName) ||
    !isNonEmptyString(paymentLabel) ||
    typeof total !== "number" ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_input" },
      { status: 400 },
    );
  }

  const resolvedSiteUrl = isNonEmptyString(siteUrl)
    ? siteUrl.trim()
    : (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin);

  const message = buildNotifyMessage({
    orderNumber: orderNumber.trim().slice(0, 60),
    customerName: customerName.trim().slice(0, 100),
    customerPhone: isNonEmptyString(customerPhone)
      ? customerPhone.trim().slice(0, 40)
      : undefined,
    paymentLabel: paymentLabel.trim().slice(0, 100),
    total,
    currency: isNonEmptyString(currency) ? currency.trim() : "HK$",
    siteUrl: resolvedSiteUrl,
  });

  const result = await sendWhatsAppNotification(message);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, provider: result.provider });
}
