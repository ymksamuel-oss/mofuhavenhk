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

  it("keeps the responsive shiba hero warm, branded and readable", () => {
    const page = source("src/app/page.tsx");

    expect(page).toContain('/images/hero-sleeping-shiba-taupe.jpg');
    expect(page).toContain('lg:grid-cols-[1.06fr_0.94fr]');
    expect(page).toContain('bg-[#ead7bf]');
    expect(page).toContain('<BrandLogo title="Mofu Haven"');
    expect(page).toContain('為愛寵提供最安心的選擇');
    expect(page).toContain('立即選購');
    expect(page).toContain('rounded-[2rem]');
    expect(page).toContain("<HomepageProductGrid />");
  });

  it("keeps the explore section as responsive left content and right lifestyle image", () => {
    const page = source("src/app/page.tsx");

    expect(page).toContain('id="brand-story" className="bg-[#fbf7f3]');
    expect(page).toContain('lg:grid-cols-2 lg:items-center lg:gap-x-10');
    expect(page).toContain('/images/explore-japanese-pet-lifestyle.jpg');
    expect(page).toContain('mt-[15px] block h-[220px] w-full');
    expect(page).toContain('min-[769px]:h-[320px]');
    expect(page).toContain('lg:h-[400px]');
    expect(page).toContain('rounded-xl');
    expect(page).toContain('mt-7 flex flex-wrap items-center gap-5');
    expect(page).toContain('立即探索');
  });

  it("renders homepage products from the live catalog context", () => {
    const productGrid = source("src/components/home/HomepageProductGrid.tsx");

    expect(productGrid).toContain("useCatalog");
    expect(productGrid).toContain("getProductsByCategory(null, catalogProducts)");
    expect(productGrid).toContain("<ProductImage");
    expect(productGrid).toContain("<AddToCartButton");
    expect(productGrid).toContain('lg:grid-cols-4');
    expect(productGrid).toContain('(min-width: 1024px) 25vw');
    expect(productGrid).toContain("產品目錄正在更新中");
  });

  it("uses responsive image delivery and a focused homepage product selection", () => {
    const page = source("src/app/page.tsx");
    const productImage = source("src/components/product/ProductImage.tsx");
    const productGrid = source("src/components/home/HomepageProductGrid.tsx");
    const nextConfig = source("next.config.ts");

    expect(page).toContain('import Image from "next/image"');
    expect(page).toContain('sizes="(min-width: 1024px) 53vw, 100vw"');
    expect(productImage).toContain('import Image from "next/image"');
    expect(productGrid).toContain('.slice(0, 12)');
    expect(nextConfig).toContain('hostname: "files.stripe.com"');
    expect(nextConfig).toContain('formats: ["image/avif", "image/webp"]');
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

  it("keeps footer contact details accurate and hides the floating WhatsApp control near payment marks", () => {
    const footer = source("src/components/Footer.tsx");
    const floatingWhatsapp = source("src/components/FloatingWhatsApp.tsx");

    expect(footer).toContain("MofuHavenHK@gmail.com");
    expect(floatingWhatsapp).toContain('getElementById("site-footer-root")');
    expect(floatingWhatsapp).toContain("IntersectionObserver");
    expect(floatingWhatsapp).toContain("pointer-events-none translate-y-4 opacity-0");
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

    expect(paymentIcons).toContain('src="/payment/apple-pay-wordmark-transparent.svg"');
    expect(paymentIcons).toContain('src="/payment/google-pay-wordmark-transparent.svg"');
    expect(paymentIcons).toContain('src="/payment/payme-wordmark-transparent.png"');
    expect(paymentIcons).not.toContain("PayMe by HSBC");
    expect(paymentIcons).toContain('src="/payment/alipayhk-logo.svg"');
    expect(paymentIcons).not.toContain("WeChatPayLogo");
    expect(paymentIcons).not.toContain("G Pay");
  });

  it("routes hosted payment options through the configured Checkout Session", () => {
    const sessionRoute = source("src/app/api/stripe/create-checkout-session/route.ts");
    const paymentIntentRoute = source("src/app/api/stripe/create-payment-intent/route.ts");
    const translations = source("src/lib/i18n/translations.ts");

    expect(sessionRoute).toContain('error: "payment_method_configuration_not_configured"');
    expect(sessionRoute).toContain('payment_method_configuration: paymentMethodConfiguration');
    expect(sessionRoute).not.toContain('...(paymentMethodConfiguration');
    expect(sessionRoute).toContain('excluded_payment_method_types: ["alipay", "wechat_pay"]');
    expect(source("src/lib/stripe.ts")).toContain('/^pmc_[A-Za-z0-9]+$/');
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
