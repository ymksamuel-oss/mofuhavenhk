import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { sendOrderReceiptEmail } from "@/lib/orderReceiptEmail";

export const runtime = "nodejs";

const TEST_RECIPIENT = "mofuhavenhk@gmail.com";
const TEST_TOKEN_HASH = "eee6949d02f91da3fd361a2608f3295813d009d57fec626abd8d7e4b1e5ed356";
const TEST_EXPIRES_AT = Date.parse("2026-08-27T08:06:11Z");
const TEST_PAYMENT_INTENT_ID = "pi_mofu_receipt_test_20260827_006";
const TEST_ORDER_NUMBER = "TEST-EMAIL-NO-CHARGE-20260827-06";

function hasValidTestToken(value: string | null): boolean {
  if (!value) return false;
  const received = Buffer.from(createHash("sha256").update(value).digest("hex"), "utf8");
  const expected = Buffer.from(TEST_TOKEN_HASH, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function unavailable(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

export async function POST(request: NextRequest) {
  if (Date.now() > TEST_EXPIRES_AT || !hasValidTestToken(request.headers.get("x-mofu-receipt-test-token"))) {
    return unavailable();
  }

  const result = await sendOrderReceiptEmail(TEST_PAYMENT_INTENT_ID, {
    orderNumber: TEST_ORDER_NUMBER,
    customerName: "Mofu Haven 測試帳戶（非真實訂單）",
    customerEmail: TEST_RECIPIENT,
    shippingRecipientName: "Mofu Haven 收據測試",
    shippingPhone: "+852 0000 0000",
    shippingAddress: "此為經授權的電子收據寄件測試，並非真實送貨地址。",
    paidAt: new Date(),
    paymentLabel: "系統寄件測試（未經 Stripe 付款）",
    subtotalHkd: 1,
    shippingHkd: 0,
    totalHkd: 1,
    items: [
      {
        name: "Mofu Haven 品牌電子收據測試品",
        variantLabel: "非真實商品／不會寄送",
        mofuSku: "TEST-RECEIPT-ONLY",
        quantity: 1,
        unitAmountHkd: 1,
      },
    ],
  });

  if (!result.ok) {
    console.error("[receipt-email-test] delivery failed", { status: result.status, error: result.error });
    return NextResponse.json({ ok: false, status: result.status }, { status: 502 });
  }

  console.info("[receipt-email-test] delivery accepted", {
    orderNumber: TEST_ORDER_NUMBER,
    providerMessageId: result.providerMessageId,
  });
  return NextResponse.json({ ok: true, status: result.status, providerMessageId: result.providerMessageId });
}

export async function GET() {
  return unavailable();
}
