import { NextResponse } from "next/server";
import {
  buildNotifyMessage,
  sendWhatsAppNotification,
} from "@/lib/notifyWhatsapp";

export const runtime = "nodejs";

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
 * POST /api/notify-order
 *
 * Called from /checkout when the customer places an order. Formats the
 * shop-owner WhatsApp template and sends it server-side to @MofuHavenHK
 * via Twilio or CallMeBot (see src/lib/notifyWhatsapp.ts + .env.example).
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

  return NextResponse.json({ ok: true, provider: result.provider });
}
