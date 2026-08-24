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
    expect(route).toContain('expand: ["payment_intent.payment_method"]');
    expect(route).toContain('{ status: 503 }');
  });

  it("keeps notification delivery in one idempotent server-side service", () => {
    const helper = source("src/lib/stripeOrderNotification.ts");
    const completeOrder = source("src/app/api/stripe/complete-order/route.ts");

    expect(helper).toContain('metadata.whatsapp_notified === "true"');
    expect(helper).toContain("sendWhatsAppNotification(message)");
    expect(helper).toContain("mofu-whatsapp-notify-");
    expect(helper).toContain('whatsapp_notified: "true"');
    expect(completeOrder).toContain("notifyPaidPaymentIntent");
    expect(completeOrder).toContain('source: "success_page"');
  });

  it("exposes only safe runtime diagnostics when explicitly requested", () => {
    const notifyRoute = source("src/app/api/notify-order/route.ts");
    const notifyService = source("src/lib/notifyWhatsapp.ts");

    expect(notifyRoute).toContain('searchParams.get("diagnostics") === "1"');
    expect(notifyRoute).toContain("getNotificationDiagnostics");
    expect(notifyService).toContain("Never return a secret value");
    expect(notifyService).toContain("gitCommitSha");
    expect(notifyService).toContain("internationalFormat");
  });

  it("documents the exact Vercel webhook and notification environment setup", () => {
    const env = source(".env.example");

    expect(env).toContain("Vercel → Project → Settings → Environment Variables");
    expect(env).toContain("https://www.mofuhavenhk.com/api/stripe/webhook");
    expect(env).toContain("STRIPE_WEBHOOK_SECRET=");
    expect(env).toContain("WHATSAPP_PHONE=852XXXXXXXX");
    expect(env).toContain("WHATSAPP_API_KEY=");
  });
});
