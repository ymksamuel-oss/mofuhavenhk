import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("calm warm editorial UI contract", () => {
  it("keeps the deep caramel and warm editorial palette", () => {
    const css = source("src/app/globals.css");

    expect(css).toContain("--background: #fbf9f6");
    expect(css).toContain("--surface: #ffffff");
    expect(css).toContain("--line: #efe8e1");
    expect(css).toContain("--accent: #6d4c3d");
    expect(css).toContain("--accent-hover: #54392d");
    expect(css).toContain("--accent-soft: #f5ebe6");
    expect(css).toContain("--ink: #2b2623");
  });

  it("keeps the homepage hero readable and rounded", () => {
    const page = source("src/app/page.tsx");

    expect(page).toContain("rgba(53,39,27,0.70)");
    expect(page).toContain("font-semibold leading-tight");
    expect(page).toContain("rounded-2xl bg-[color:var(--accent)]");
    expect(page).toContain("<HomepageProductGrid />");
  });

  it("renders homepage products from the live catalog context", () => {
    const productGrid = source("src/components/home/HomepageProductGrid.tsx");

    expect(productGrid).toContain("useCatalog");
    expect(productGrid).toContain("getProductsByCategory(null, catalogProducts)");
    expect(productGrid).toContain("<ProductImage");
    expect(productGrid).toContain("<AddToCartButton");
    expect(productGrid).toContain("產品目錄正在更新中");
  });

  it("prefers the active Vercel Stripe live key for the storefront catalog", () => {
    const stripe = source("src/lib/stripe.ts");

    expect(stripe).toContain("process.env.STRIPE_LIVE_SECRET_KEY?.trim()");
    expect(stripe).toContain("process.env.STRIPE_SECRET_KEY?.trim()");
  });

  it("keeps the PDP mobile action bar, specs and FAQ mounted", () => {
    const productDetail = source("src/components/product/ProductDetail.tsx");

    expect(productDetail).toContain("FAQAccordion");
    expect(productDetail).toContain('role="radiogroup"');
    expect(productDetail).toContain("fixed inset-x-0 bottom-0");
    expect(productDetail).toContain("text-xl font-extrabold");
  });

  it("keeps the mobile drawer shipping, upsell and checkout surfaces", () => {
    const drawer = source("src/components/cart/MobileCartDrawer.tsx");

    expect(drawer).toContain("<FreeShippingProgress");
    expect(drawer).toContain("cartDrawerUpsellTitle");
    expect(drawer).toContain("bg-white p-3");
    expect(drawer).toContain("cartDrawerCheckoutCta");
    expect(drawer).toContain("env(safe-area-inset-bottom");
  });

  it("keeps exactly the five requested payment options and official marks", () => {
    const paymentMethods = source("src/components/checkout/PaymentMethods.tsx");
    const paymentIcons = source("src/components/icons/PaymentIcons.tsx");
    const checkout = source("src/app/checkout/page.tsx");
    const footer = source("src/components/Footer.tsx");
    const faq = source("src/components/FAQAccordion.tsx");

    expect(paymentMethods).toContain('id: "card"');
    expect(paymentMethods).toContain('id: "applepay"');
    expect(paymentMethods).toContain('id: "googlepay"');
    expect(paymentMethods).toContain('id: "alipayhk"');
    expect(paymentMethods).toContain('id: "payme"');
    expect(paymentMethods).not.toContain("wechatpay");
    expect(paymentMethods).not.toContain("payWeChatPay");
    expect(checkout).not.toContain("AsianWalletPayForm");
    expect(checkout).not.toContain("wechatpay");
    expect(footer).not.toContain("WeChatPayLogo");
    expect(footer).not.toContain("WeChat Pay");
    expect(faq).not.toContain("WeChat Pay");

    expect(paymentIcons).toContain('src="/payment/apple-pay-mark.svg"');
    expect(paymentIcons).toContain('src="/payment/google-pay-mark.svg"');
    expect(paymentIcons).toContain('src="/payment/payme-logo.png"');
    expect(paymentIcons).toContain('src="/payment/alipayhk-logo.svg"');
    expect(paymentIcons).not.toContain("WeChatPayLogo");
    expect(paymentIcons).not.toContain("G Pay");
  });

  it("routes hosted payment options through the configured Checkout Session", () => {
    const sessionRoute = source("src/app/api/stripe/create-checkout-session/route.ts");
    const paymentIntentRoute = source("src/app/api/stripe/create-payment-intent/route.ts");
    const translations = source("src/lib/i18n/translations.ts");

    expect(sessionRoute).toContain('payment_method_configuration');
    expect(sessionRoute).toContain('excluded_payment_method_types: ["alipay", "wechat_pay"]');
    expect(sessionRoute).toContain('link: { display: "never" }');
    expect(sessionRoute).toContain("Do not set payment_method_types");
    expect(paymentIntentRoute).toContain("getStripePaymentMethodConfiguration");
    expect(paymentIntentRoute).toContain('excluded_payment_method_types: ["alipay"]');
    expect(paymentIntentRoute).not.toContain("wechat_pay");
    expect(translations).toContain('payGooglePay: "Google Pay（Stripe Checkout）"');
    expect(translations).toContain('payPayMe: "PayMe（Stripe Checkout）"');
    expect(translations).toContain('payAlipayHk: "AlipayHK（香港支付寶）"');
    expect(translations).not.toContain("payWeChatPay");
    expect(translations).not.toContain("wechatPayHint");
  });
});
