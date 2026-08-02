import { NextResponse } from "next/server";
import {
  buildNotifyMessage,
  getConfiguredProviders,
  isNotifyConfigured,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotifyOrderRequestBody = {
  orderNumber?: unknown;
  customerName?: unknown;
  paymentLabel?: unknown;
  total?: unknown;
  currency?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * GET /api/notify-order
 * Lightweight health check — reports whether a server-side WhatsApp
 * gateway is configured (never exposes secrets).
 */
export async function GET() {
  const providers = getConfiguredProviders();
  return NextResponse.json({
    ok: true,
    shopHandle: process.env.SHOP_WHATSAPP_HANDLE?.trim() || "MofuHavenHK",
    configured: providers.length > 0,
    providers,
  });
}

/**
 * POST /api/notify-order
 *
 * Called from /checkout when the customer places an order. Formats the
 * shop-owner WhatsApp template and sends it **server-side** to @MofuHavenHK
 * via Meta Cloud API / Twilio / Green API / CallMeBot.
 *
 * This route never returns a wa.me URL and never asks the customer to
 * manually send the shop notification.
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

  const { orderNumber, customerName, paymentLabel, total, currency } = body;

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

  if (!isNotifyConfigured()) {
    console.error(
      "[notify-order] Rejecting order notify — no WhatsApp gateway env vars on this deployment.",
    );
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        hint: "Set CALLMEBOT_PHONE + CALLMEBOT_APIKEY (or TWILIO_* / WHATSAPP_CLOUD_* / GREEN_API_*) on Vercel for @MofuHavenHK.",
      },
      { status: 503 },
    );
  }

  const message = buildNotifyMessage({
    orderNumber: orderNumber.trim().slice(0, 60),
    customerName: customerName.trim().slice(0, 100),
    paymentLabel: paymentLabel.trim().slice(0, 100),
    total,
    currency: isNonEmptyString(currency) ? currency.trim() : "HK$",
  });

  const result = await sendWhatsAppNotification(message);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: result.provider,
    delivered: true,
  });
}
