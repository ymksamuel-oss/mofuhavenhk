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
    expect(productDetail).toContain("role=\"radiogroup\"");
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
});


  it("restores Apple Pay and keeps checkout payment rows logo-only", () => {
    const stripeForm = source("src/components/checkout/StripePaymentForm.tsx");
    const paymentMethods = source("src/components/checkout/PaymentMethods.tsx");
    const checkout = source("src/app/checkout/page.tsx");
    const translations = source("src/lib/i18n/translations.ts");

    expect(stripeForm).toContain("PaymentRequestButtonElement");
    expect(stripeForm).toContain("paymentRequest(");
    expect(stripeForm).toContain('disableWallets: ["googlePay", "link", "browserCard"]');
    expect(stripeForm).toContain("disableLink: true");
    expect(paymentMethods).toContain('id: "applepay"');
    expect(paymentMethods).toContain("ApplePayLogo");
    expect(paymentMethods).toContain('className="sr-only"');
    expect(paymentMethods).not.toContain(">\n                  {t(labelKey)}\n                </span>");
    expect(checkout).toContain('selectedMethod === "applepay"');
    expect(checkout).toContain("preferredMethod={selectedMethod}");
    expect(translations).toContain('paymentHint: "請選擇付款方式。"');
    expect(translations).toContain('paymentHint: "Choose a payment method."');
  });
