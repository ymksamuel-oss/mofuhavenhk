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

  it("syncs each Stripe product with its canonical remote source image when the sheet provides one", () => {
    const syncStripe = source("scripts/syncStripe.ts");

    expect(syncStripe).toContain("record.sourceImageUrl ?? record.image");
    expect(syncStripe).toContain("deployment-local `/assets/product/<id>` paths");
  });

  it("keeps image-only Stripe synchronization explicitly gated and isolated from catalog fields", () => {
    const imageSync = source("scripts/syncStripeImagesOnBuild.ts");
    const packageJson = source("package.json");

    expect(imageSync).toContain('process.env.SYNC_STRIPE_IMAGES_ON_BUILD === "1"');
    expect(imageSync).toContain("record.sourceImageUrl");
    expect(imageSync).toContain("stripe.products.update(product.id, { images: [sourceImageUrl] })");
    expect(imageSync).not.toContain("stripe.prices.create");
    expect(imageSync).not.toContain("stripe.products.create");
    expect(packageJson).toContain('"sync:stripe:images"');
    expect(packageJson).not.toContain('"prebuild"');
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
