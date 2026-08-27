import { afterEach, describe, expect, it, vi } from "vitest";
import {
  receiptEmailHtml,
  receiptEmailIdempotencyKey,
  receiptEmailText,
  sendOrderReceiptEmail,
  type OrderReceiptEmailInput,
} from "../src/lib/orderReceiptEmail";
import {
  parseReceiptLineMetadata,
  receiptLineMetadata,
} from "../src/lib/receiptLineMetadata";
import type { OrderItem } from "../src/lib/order";
import { sendPaidOrderReceipt } from "../src/lib/stripeOrderReceipt";
import type Stripe from "stripe";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RECEIPT_FROM_EMAIL: process.env.RECEIPT_FROM_EMAIL,
  RECEIPT_REPLY_TO_EMAIL: process.env.RECEIPT_REPLY_TO_EMAIL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const sampleReceipt: OrderReceiptEmailInput = {
  orderNumber: "MH20260827-1234",
  customerName: "陳小明",
  customerEmail: "customer@example.com",
  paidAt: new Date("2026-08-27T08:35:00.000Z"),
  paymentLabel: "信用卡／全球支付 (Stripe)",
  subtotalHkd: 100.8,
  shippingHkd: 25,
  totalHkd: 125.8,
  items: [
    {
      name: "CIAO 測試商品 <安全>",
      variantLabel: "85g",
      mofuSku: "MH-CAT-CIAO-001",
      quantity: 2,
      unitAmountHkd: 50.4,
    },
  ],
};

const sampleItems: OrderItem[] = [
  {
    lineKey: "prod_ABC123::price_ABC123",
    id: "prod_ABC123",
    stripePriceId: "price_ABC123",
    mofuSku: "MH-CAT-CIAO-001",
    name: { zh: "測試商品", en: "Test" },
    image: "/images/test.png",
    qty: 2,
    unit: 50.4,
  },
];

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("payment receipt email", () => {
  it("renders Mofu branding, escaped product names, item details and payment totals", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.mofuhavenhk.com";
    const html = receiptEmailHtml(sampleReceipt);
    const text = receiptEmailText(sampleReceipt);

    expect(html).toContain("Mofu Haven");
    expect(html).toContain("mofu-haven-cat-dog-logo-transparent.png");
    expect(html).toContain("MH20260827-1234");
    expect(html).toContain("MH-CAT-CIAO-001");
    expect(html).toContain("HK$125.80");
    expect(html).toContain("CIAO 測試商品 &lt;安全&gt;");
    expect(html).not.toContain("CIAO 測試商品 <安全>");
    expect(text).toContain("付款方式：信用卡／全球支付 (Stripe)");
    expect(text).toContain("總金額：HK$125.80");
  });

  it("uses the Resend API with a payment-specific idempotency key and no customer data in tags", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RECEIPT_FROM_EMAIL = "Mofu Haven <receipts@example.com>";
    process.env.RECEIPT_REPLY_TO_EMAIL = "support@example.com";
    let captured: { url?: string; init?: RequestInit } = {};
    const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
      captured = { url: String(url), init };
      return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
    };

    const result = await sendOrderReceiptEmail("pi_ABC123", sampleReceipt, fetcher);

    expect(result).toEqual({ ok: true, status: "sent", providerMessageId: "email_123" });
    expect(captured.url).toBe("https://api.resend.com/emails");
    expect(captured.init?.headers).toMatchObject({
      Authorization: "Bearer re_test_key",
      "Idempotency-Key": receiptEmailIdempotencyKey("pi_ABC123"),
    });
    const payload = JSON.parse(String(captured.init?.body)) as Record<string, unknown>;
    expect(payload.to).toEqual(["customer@example.com"]);
    expect(payload.from).toBe("Mofu Haven <receipts@example.com>");
    expect(payload.reply_to).toBe("support@example.com");
    expect(payload.tags).toEqual([
      { name: "category", value: "payment_receipt" },
      { name: "order", value: "MH20260827-1234" },
    ]);
  });

  it("does not call a mail provider when email configuration or the recipient is invalid", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RECEIPT_FROM_EMAIL;
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return new Response("{}", { status: 200 });
    };

    const unconfigured = await sendOrderReceiptEmail("pi_ABC123", sampleReceipt, fetcher);
    const invalid = await sendOrderReceiptEmail(
      "pi_ABC124",
      { ...sampleReceipt, customerEmail: "not-an-email" },
      fetcher,
    );

    expect(unconfigured).toMatchObject({ ok: false, status: "not_configured" });
    expect(invalid).toMatchObject({ ok: false, status: "invalid_recipient" });
    expect(calls).toBe(0);
  });

  it("round-trips per-item Stripe Price references without storing customer email in metadata", () => {
    const metadata = receiptLineMetadata(sampleItems);
    const parsed = parseReceiptLineMetadata(metadata);

    expect(metadata.receiptLineMetadataVersion).toBe("v1");
    expect(metadata.receiptLineItems1).toBe("prod_ABC123|price_ABC123|2");
    expect(JSON.stringify(metadata)).not.toContain("customer@example.com");
    expect(parsed).toEqual([
      { productId: "prod_ABC123", priceId: "price_ABC123", quantity: 2 },
    ]);
  });

  it("rebuilds immutable Stripe Price line items, sends once, and records delivery on a paid intent", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RECEIPT_FROM_EMAIL = "Mofu Haven <receipts@example.com>";
    const originalFetch = globalThis.fetch;
    const emailFetch = vi.fn(async () =>
      new Response(JSON.stringify({ id: "email_789" }), { status: 200 }),
    );
    globalThis.fetch = emailFetch as typeof fetch;
    const lineMetadata = receiptLineMetadata(sampleItems);
    const update = vi.fn(async () => ({ id: "pi_ABC123" }));
    const stripe = {
      prices: {
        retrieve: vi.fn(async () => ({
          id: "price_ABC123",
          unit_amount: 5040,
          nickname: null,
          metadata: { variant_label_zh: "85g" },
          product: {
            id: "prod_ABC123",
            name: "CIAO 測試商品",
            metadata: { mofu_sku: "MH-CAT-CIAO-001" },
          },
        })),
      },
      charges: { retrieve: vi.fn(async () => ({ created: 1787819700 })) },
      customers: { retrieve: vi.fn(async () => ({ id: "cus_ABC123", email: "customer@example.com" })) },
      paymentIntents: { update },
    } as unknown as Stripe;
    const paymentIntent = {
      id: "pi_ABC123",
      amount: 12580,
      amount_received: 12580,
      created: 1787819600,
      latest_charge: "ch_ABC123",
      customer: "cus_ABC123",
      payment_method: { type: "card", billing_details: { email: null }, card: null },
      metadata: {
        orderNumber: "MH20260827-1234",
        customerName: "陳小明",
        subtotalHkd: "100.80",
        shippingHkd: "25.00",
        totalHkd: "125.80",
        ...lineMetadata,
      },
    } as unknown as Stripe.PaymentIntent;

    try {
      const result = await sendPaidOrderReceipt({ stripe, paymentIntent });
      expect(result).toEqual({
        ok: true,
        status: "sent",
        orderNumber: "MH20260827-1234",
        customerEmailPresent: true,
        providerMessageId: "email_789",
      });
      expect(emailFetch).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledWith(
        "pi_ABC123",
        expect.objectContaining({
          metadata: expect.objectContaining({
            receipt_email_sent: "true",
            receipt_email_provider_id: "email_789",
          }),
        }),
        expect.objectContaining({ idempotencyKey: "mofu-receipt-mark-sent-pi_ABC123" }),
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("skips provider delivery when the paid intent is already marked as receipted", async () => {
    const stripe = {} as Stripe;
    const paymentIntent = {
      id: "pi_ALREADY_SENT",
      amount: 1000,
      amount_received: 1000,
      created: 1787819600,
      receipt_email: "customer@example.com",
      payment_method: null,
      metadata: {
        orderNumber: "MH20260827-9999",
        receipt_email_sent: "true",
      },
    } as unknown as Stripe.PaymentIntent;

    const result = await sendPaidOrderReceipt({ stripe, paymentIntent });

    expect(result).toEqual({
      ok: true,
      status: "already_sent",
      orderNumber: "MH20260827-9999",
      customerEmailPresent: true,
    });
  });

  it("keeps the receipt trigger server-side and records both delivery outcomes", () => {
    const source = (relativePath: string) =>
      readFileSync(resolve(process.cwd(), relativePath), "utf8");
    const webhook = source("src/app/api/stripe/webhook/route.ts");
    const processing = source("src/lib/stripePaidOrderProcessing.ts");
    const checkout = source("src/app/api/stripe/create-checkout-session/route.ts");
    const intent = source("src/app/api/stripe/create-payment-intent/route.ts");

    expect(webhook).toContain("processPaidOrder");
    expect(webhook).toContain("receiptSent");
    expect(processing).toContain("notifyPaidPaymentIntent");
    expect(processing).toContain("sendPaidOrderReceipt");
    expect(checkout).toContain("customer_email: customerEmail");
    expect(intent).toContain("customer: customer.id");
    expect(checkout).toContain("receiptLineMetadata(items)");
    expect(intent).toContain("receiptLineMetadata(items)");
  });
});
