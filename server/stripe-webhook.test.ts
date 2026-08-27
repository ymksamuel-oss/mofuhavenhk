import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Stripe webhook merchant notification contract", () => {
  it("verifies Stripe's raw request body before parsing the event", () => {
    const route = source("src/app/api/stripe/webhook/route.ts");

    expect(route).toContain('request.text()');
    expect(route).toContain('request.headers.get("stripe-signature")');
    expect(route).toContain("webhooks.constructEvent(payload, signature, secret)");
    expect(route).toContain('jsonError("invalid_signature"');
    expect(route).toContain('jsonError("webhook_not_configured"');
  });

  it("handles hosted Checkout, delayed Checkout and PaymentIntent success events", () => {
    const route = source("src/app/api/stripe/webhook/route.ts");

    expect(route).toContain('"checkout.session.completed"');
    expect(route).toContain('"checkout.session.async_payment_succeeded"');
    expect(route).toContain('"payment_intent.succeeded"');
    expect(route).toContain("checkout.sessions.retrieve");
    expect(route).toContain('expand: ["payment_intent.payment_method", "payment_intent.customer"]');
    expect(route).toContain('expand: ["payment_method", "customer"]');
    expect(route).toContain('{ status: 503 }');
  });

  it("keeps merchant notification and customer receipt delivery in one idempotent server-side process", () => {
    const helper = source("src/lib/stripeOrderNotification.ts");
    const processing = source("src/lib/stripePaidOrderProcessing.ts");
    const completeOrder = source("src/app/api/stripe/complete-order/route.ts");

    expect(helper).toContain('metadata.whatsapp_notified === "true"');
    expect(helper).toContain("sendWhatsAppNotification(message)");
    expect(helper).toContain("mofu-whatsapp-notify-");
    expect(helper).toContain('whatsapp_notified: "true"');
    expect(processing).toContain("notifyPaidPaymentIntent");
    expect(processing).toContain("sendPaidOrderReceipt");
    expect(completeOrder).toContain("processPaidOrder");
    expect(completeOrder).toContain('source: "success_page"');
  });

  it("exposes only safe runtime diagnostics when explicitly requested", () => {
    const notifyRoute = source("src/app/api/notify-order/route.ts");
    const notifyService = source("src/lib/notifyWhatsapp.ts");

    expect(notifyRoute).toContain('searchParams.get("diagnostics") === "1"');
    expect(notifyRoute).toContain("getNotificationDiagnostics");
    expect(notifyService).toContain("Never return a secret value");
    expect(notifyService).toContain("gitCommitSha");
    expect(notifyService).toContain("gitCommitRef");
    expect(notifyService).toContain("gitRepoOwner");
    expect(notifyService).toContain("gitRepoSlug");
    expect(notifyService).toContain("internationalFormat");
  });

  it("exposes only safe Stripe catalog diagnostics for product-load incidents", () => {
    const notifyRoute = source("src/app/api/notify-order/route.ts");
    const catalogService = source("src/lib/catalog-server.ts");

    expect(notifyRoute).toContain("getCatalogDiagnostics");
    expect(catalogService).toContain("matchedRecords");
    expect(catalogService).toContain('secretKey.startsWith("sk_live_")');
    expect(catalogService).toContain('publishableKey.startsWith("pk_live_")');
    expect(catalogService).not.toContain("secretKey: secretKey");
    expect(catalogService).not.toContain("publishableKey: publishableKey");
  });

  it("reads notification and webhook credentials through runtime environment keys", () => {
    const runtimeEnv = source("src/lib/serverEnv.ts");
    const notifyService = source("src/lib/notifyWhatsapp.ts");
    const stripeService = source("src/lib/stripe.ts");
    const webhookRoute = source("src/app/api/stripe/webhook/route.ts");

    expect(runtimeEnv).toContain("process.env[name]");
    expect(notifyService).toContain('readServerEnv("WHATSAPP_PHONE")');
    expect(notifyService).toContain('readServerEnv("WHATSAPP_API_KEY")');
    expect(stripeService).toContain('readServerEnv("STRIPE_LIVE_SECRET_KEY")');
    expect(webhookRoute).toContain('readServerEnv("STRIPE_WEBHOOK_SECRET")');
  });

  it("documents the exact Vercel webhook and notification environment setup", () => {
    const env = source(".env.example");

    expect(env).toContain("Vercel → Project → Settings → Environment Variables");
    expect(env).toContain("https://www.mofuhavenhk.com/api/stripe/webhook");
    expect(env).toContain("STRIPE_WEBHOOK_SECRET=");
    expect(env).toContain("WHATSAPP_PHONE=852XXXXXXXX");
    expect(env).toContain("WHATSAPP_API_KEY=");
    expect(env).toContain("RESEND_API_KEY=re_");
    expect(env).toContain("RECEIPT_FROM_EMAIL=Mofu Haven");
  });
});
