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
    expect(page).toContain('t("homeHeadline")');
    expect(page).toContain('t("homeCta")');
    expect(page).toContain('h-[14rem]');
    expect(page).toContain('const [isDesktopHero, setIsDesktopHero] = useState(false)');
    expect(page).toContain('window.matchMedia("(min-width: 1024px)")');
    expect(page).toContain('{isDesktopHero ? (');
    expect(page).toContain('import mobileHeroImage from "@/assets/hero-mobile-clean-pet-lifestyle.jpg"');
    expect(page).toContain('src={mobileHeroImage}');
    expect(page).toContain('object-cover object-center');
    expect(page).toContain('origin-left scale-[1.5] object-cover object-[0%_58%]');
    expect(page).toContain('h-10 sm:h-20 lg:h-32');
    expect(page).toContain('min-h-10');
    expect(page).toContain("<HomepageProductGrid />");
    expect(page).toContain('grid grid-cols-4 gap-2 sm:gap-3');
    expect(page).toContain('onClick={() => setIsExploreOpen((open) => !open)}');
    expect(page).not.toContain('<ExplorePetControls');
    expect(page).toContain('t("categoryGridTitle")');
    expect(page).toContain('aria-expanded={isExploreOpen}');
    expect(page).not.toContain('id="pet-breed-guide" className="mt-10"');
    expect(page).toContain('labelKey: "allProducts"');
    expect(page).toContain('href: "/menu#products"');
    expect(page).toContain('Icon: BagIcon');
    expect(page).toContain('min-h-14 flex-col items-center justify-center');
    expect(page).toContain('rounded-xl border border-[#eadfd6] bg-[#fdfbf9]');
    expect(page).toContain('hover:border-[#d7b893] hover:bg-white');
    expect(page).toContain('h-4 w-4 shrink-0 text-[#7a5949]');
    expect(page.indexOf('grid grid-cols-4 gap-2 sm:gap-3')).toBeLessThan(page.indexOf("<HomepageProductGrid />"));
    expect(page.indexOf("<HomepageProductGrid />")).toBeLessThan(page.indexOf('id="brand-story"'));
  });

  it("keeps the explore section as responsive left content and right lifestyle image", () => {
    const page = source("src/app/page.tsx");

    expect(page).toContain('id="brand-story" className="bg-[#fbf7f3]');
    expect(page).toContain('lg:grid-cols-2 lg:items-center lg:gap-x-10');
    expect(page).toContain('relative mt-[15px] block h-[220px]');
    expect(page).toContain('src="/images/explore-japanese-pet-lifestyle.jpg"');
    const exploreGallery = source("src/components/about/ExploreCatBreedGallery.tsx");
    const breedGallery = source("src/lib/catBreedGallery.ts");
    expect(page).toContain("<ExplorePetWorldGallery animal={exploreAnimal} dogCoat={dogCoatFilter} />");
    expect(exploreGallery).toContain("CAT_BREED_GALLERY_IMAGES");
    expect(exploreGallery).toContain("/cat-breeds/${breed.slug}");
    expect(breedGallery.match(/\/images\/cat-breeds\//g)?.length).toBe(81);
    expect(exploreGallery).not.toContain("/images/products/");
    const dogBreeds = source("src/lib/dogBreeds.ts");
    const dogGallery = source("src/components/about/ExploreDogBreedGallery.tsx");
    const petGuide = source("src/components/about/ExplorePetWorldGallery.tsx");
    expect(petGuide).toContain("<ExploreCatBreedGallery />");
    expect(petGuide).not.toContain("<button");
    expect(petGuide).toContain("<ExploreDogBreedGallery coatFilter={dogCoat} />");
    const petControls = source("src/components/about/ExplorePetControls.tsx");
    expect(petControls).toContain("exploreCats");
    expect(petControls).toContain("exploreDogs");
    expect(petControls).toContain("longHairedDogs");
    expect(petControls).toContain("shortHairedDogs");
    expect(dogGallery).toContain("DOG_BREEDS");
    expect(dogGallery).toContain("dogBreedsPersonality");
    expect(dogBreeds.match(/slug: \"[^\"]+\"/g)?.length).toBe(8);
    expect(dogBreeds.match(/imageUrl: \"\/images\/dog-breeds\//g)?.length).toBe(8);
    expect(dogBreeds).not.toContain("/images/products/");
    expect(dogBreeds).not.toContain("/images/cat-breeds/");
    expect(dogBreeds.match(/id: \"dog-\d+\"/g)?.length).toBe(8);
    expect(dogBreeds).toContain('coatType: "short"');
    expect(dogBreeds).toContain('coatType: "long"');
    expect(page).toContain('mt-[15px] block h-[220px] w-full');
    expect(page).toContain('min-[769px]:h-[320px]');
    expect(page).toContain('lg:h-[400px]');
    expect(page).toContain('rounded-xl');
    expect(page).toContain('mt-7 flex flex-wrap items-center gap-5');
    expect(page).toContain('t("exploreCta")');
  });

  it("renders homepage products from the live catalog context", () => {
    const productGrid = source("src/components/home/HomepageProductGrid.tsx");

    expect(productGrid).toContain("useCatalog");
    expect(productGrid).toContain("getProductsByCategory(null, catalogProducts)");
    expect(productGrid).toContain("<ProductImage");
    expect(productGrid).toContain("<AddToCartButton");
    expect(productGrid).toContain('lg:grid-cols-4');
    expect(productGrid).toContain('(min-width: 1024px) 25vw');
    expect(productGrid).toContain('t("catalogUpdating")');
    expect(productGrid).not.toContain("查看全部商品");
    expect(productGrid).not.toContain("查看全部");
  });

  it("uses responsive image delivery and a focused homepage product selection", () => {
    const page = source("src/app/page.tsx");
    const productImage = source("src/components/product/ProductImage.tsx");
    const productGrid = source("src/components/home/HomepageProductGrid.tsx");
    const nextConfig = source("next.config.ts");

    expect(page).toContain('import Image from "next/image"');
    expect(page).toContain('sizes="53vw"');
    expect(productImage).toContain('import Image from "next/image"');
    expect(productGrid).toContain('.slice(0, 12)');
    expect(nextConfig).toContain('hostname: "files.stripe.com"');
    expect(nextConfig).toContain('formats: ["image/avif", "image/webp"]');
  });

  it("keeps category and subcategory navigation bilingual", () => {
    const page = source("src/app/page.tsx");
    const productCatalog = source("src/components/menu/ProductCatalog.tsx");
    const products = source("src/lib/products.ts");
    const translations = source("src/lib/i18n/translations.ts");

    expect(page).toContain("labelKey: \"catSubWetCans\"");
    expect(page).toContain("labelKey: \"catSubDryFood\"");
    expect(products).toContain("PRODUCT_SUBCATEGORY_LABEL_KEY");
    expect(products).toContain("CAT_SNACK_SERIES_LABEL_KEY");
    expect(productCatalog).toContain('getProductSubcategoryLabelKey(option)');
    expect(productCatalog).toContain('id="products"');
    expect(productCatalog).toContain('scroll-mt-24');
    expect(productCatalog).toContain("CAT_SNACK_SERIES_LABEL_KEY[series]");
    expect(productCatalog).toContain('t(categorySlug === "cats" ? "catSubNavLabel" : "dogSubNavLabel")');
    expect(translations).toContain('catSubWetCans: "Cans / Wet food"');
    expect(translations).toContain('dogSubSnacks: "Dog treats"');

    const productsSource = source("src/lib/products.ts");
    const catalogServer = source("src/lib/catalog-server.ts");
    const catalogOverrides = source("src/lib/catalog-overrides.ts");
    expect(productsSource).toContain("isSmallPetProductText");
    expect(productsSource).toContain("small");
    expect(productsSource).toContain("hamster");
    expect(catalogServer).toContain("isSmallPetProductText(");
    expect(catalogServer).toContain('return "small-pets"');
    expect(catalogServer).toContain("function snackSeriesFromProduct(");
    expect(catalogServer).toContain("...(snackSeries ? { snackSeries } : {})");
    expect(catalogOverrides).toContain("isSmallPetProductText(zhTitle, enTitle, zhDescription, enDescription)");

    const demoProducts = source("src/lib/small-pet-demo-products.ts");
    expect(demoProducts).toContain("demo-small-pet-rabbit-hay");
    expect(demoProducts).toContain("demo-small-pet-hamster-food");
    expect(demoProducts).toContain("demo-small-pet-guinea-pig-vitamin");
    expect(demoProducts).toContain("demo-small-pet-bedding");
    expect(demoProducts.match(/categorySlug: \"small-pets\"/g)?.length).toBe(4);
    expect(demoProducts).toContain('metadata: { demo: "true"');
    expect(catalogServer).toContain("SMALL_PET_DEMO_PRODUCTS");
    expect(translations).toContain('allProducts: "全部產品"');
    expect(translations).toContain('allProducts: "All Products"');
    expect(translations).toContain('catSnackSeriesHairball: "Hairball-care formula"');
  });

  it("keeps category and subcategory SEO metadata bilingual and shareable", () => {
    const seo = source("src/lib/seo/category-seo.ts");
    const categoryPage = source("src/app/categories/[slug]/page.tsx");
    const subcategoryPage = source("src/app/categories/[slug]/[sub]/page.tsx");
    const categoryLink = source("src/components/CategoryNavLink.tsx");
    expect(categoryLink).toContain('href.startsWith("/menu") || href.startsWith("/categories")');
    expect(categoryLink).toContain('`${href}#products`');
    expect(categoryLink).toContain('const [pathAndQuery, hash] = targetHref.split("#", 2)');

    const header = source("src/components/Header.tsx");

    expect(seo).toContain("const CATEGORY_SEO");
    expect(seo).toContain("const SUBCATEGORY_SEO");
    expect(seo).toContain("const SNACK_SERIES_SEO");
    expect(seo).toContain('"zh-HK": chineseCanonical');
    expect(seo).toContain('"en-HK": englishCanonical');
    expect(seo).toContain("openGraph");
    expect(seo).toContain("twitter");
    expect(categoryPage).toContain("generateMetadata");
    expect(subcategoryPage).toContain("generateMetadata");
    expect(categoryLink).toContain('href.startsWith("/categories")');
    expect(categoryLink).toContain('lang=en');
    expect(header).toContain('query.set("lang", "en")');
    expect(header).toContain('className="flex h-10 shrink-0 items-center');
  });

  it("keeps live Stripe product content bilingual", () => {
    const catalog = source("src/lib/catalog-server.ts");
    const detail = source("src/components/product/ProductDetail.tsx");
    const quickView = source("src/components/menu/ProductQuickView.tsx");

    expect(catalog).toContain("bilingualMetadataValue");
    expect(catalog).toContain("parseBilingualSpecs");
    expect(catalog).toContain("description_zh");
    expect(catalog).toContain("GENERATED_PRODUCT_TRANSLATIONS");
    expect(catalog).toContain("const localizedName = metadataName ??");
    expect(catalog).toContain("const localizedDescription = metadataDescription ??");
    expect(catalog).toContain('"specs_en"');
    expect(detail).toContain("product.description[locale] || product.description.zh");
    expect(detail).toContain("spec[locale] || spec.zh");
    expect(quickView).toContain("product.description[locale] || product.description.zh");
    expect(quickView).toContain("spec[locale] || spec.zh");
  });

  it("prefers the updated Vercel Stripe key while retaining live-key fallback", () => {
    const stripe = source("src/lib/stripe.ts");

    expect(stripe).toContain('readServerEnv("STRIPE_SECRET_KEY") ||');
    expect(stripe).toContain('readServerEnv("STRIPE_LIVE_SECRET_KEY")');
    expect(
      stripe.indexOf('readServerEnv("STRIPE_SECRET_KEY")'),
    ).toBeLessThan(stripe.indexOf('readServerEnv("STRIPE_LIVE_SECRET_KEY")'));
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

  it("keeps footer contact details accurate and moves WhatsApp into the footer", () => {
    const footer = source("src/components/Footer.tsx");
    const layout = source("src/app/layout.tsx");

    expect(footer).toContain("MofuHavenHK@gmail.com");
    expect(footer).toContain('aria-label="WhatsApp"');
    expect(footer).toContain("waUrl ?? \"https://wa.me/85298646585\"");
    expect(footer).toContain("<WhatsAppLogo className=\"h-5 w-5\" />");
    expect(layout).not.toContain("FloatingWhatsApp");
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
    expect(paymentMethods).toContain("grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3");
    expect(paymentMethods).toContain("min-h-[5.5rem]");
    expect(paymentMethods).toContain('role="radiogroup"');
    expect(paymentMethods).toContain('role="radio"');
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
