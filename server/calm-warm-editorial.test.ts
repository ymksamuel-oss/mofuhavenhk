import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("calm warm editorial UI contract", () => {
  it("keeps the deep caramel and warm editorial palette", () => {
    const css = source("src/app/globals.css");

    expect(css).toContain("--background: #fbf7f5");
    expect(css).toContain("--surface: #fbf7f5");
    expect(css).toContain("--product-image-surface: #f6eee8");
    expect(css).toContain("--line: #eaded5");
    expect(css).toContain("--accent: #6d4c3d");
    expect(css).toContain("--accent-hover: #54392d");
    expect(css).toContain("--accent-soft: #f3e8e0");
    expect(css).not.toContain(".product-image-fusion");
    expect(css).toContain("--ink: #2b2623");
  });

  it("keeps the responsive shiba hero warm, branded and readable", () => {
    const page = source("src/app/page.tsx");
    const header = source("src/components/Header.tsx");

    expect(page).toContain('/images/hero-sleeping-shiba-taupe.jpg');
    expect(page).toContain('lg:grid-cols-[1.06fr_0.94fr]');
    expect(page).toContain('bg-[#ead7bf]');
    expect(page).toContain('<BrandLogo title="Mofu Haven"');
    expect(page).toContain('t("homeHeadline")');
    expect(page).toContain('h-[14rem]');
    expect(page).toContain('const [isDesktopHero, setIsDesktopHero] = useState(false)');
    expect(page).toContain('window.matchMedia("(min-width: 1024px)")');
    expect(page).toContain('{isDesktopHero ? (');
    expect(page).toContain('src="/images/hero-mobile-mofu-haven.jpg"');
    expect(page).toContain('object-cover object-center');
    expect(page).toContain('origin-left scale-[1.5] object-cover object-[0%_58%]');
    expect(page).toContain('h-10 sm:h-20 lg:h-32');
    expect(page).toContain("<HomepageProductGrid />");
    expect(page).toContain("<HomeProductMarquee />");
    expect(page).not.toContain("const quickCategories");
    expect(page).not.toContain('t("categoryGridTitle")');
    expect(page).not.toContain('grid grid-cols-4 gap-2 sm:gap-3');
    expect(header).toContain("CategoryDropdown");
    expect(page).not.toContain('setIsExploreOpen');
    expect(page).not.toContain('<ExplorePetControls');
    expect(page).not.toContain('aria-expanded={isExploreOpen}');
    expect(page).not.toContain('id="pet-breed-guide" className="mt-10"');
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
    expect(productGrid).toContain("HOME_FEATURED_PRODUCT_IDS");
    expect(productGrid).toContain("ProductStatusBadges");
    expect(source("src/components/product/ProductStatusBadges.tsx")).toContain('"prod_V8cr2Q8hiWwniV"');
    expect(source("src/components/product/ProductStatusBadges.tsx")).toContain("NEW_ARRIVAL_WINDOW_MS");
    expect(source("src/components/product/ProductStatusBadges.tsx")).toContain("inStock === true && statuses.length === 0");
    expect(productGrid).toContain(".sort((left, right)");
    expect(productGrid).toContain("isStorefrontReadyProduct");
  });

  it("keeps a two-row accessible product marquee backed by the live catalog", () => {
    const marquee = source("src/components/home/HomeProductMarquee.tsx");
    const marqueeStyles = source("src/components/home/HomeProductMarquee.module.css");

    expect(marquee).toContain("useCatalog");
    expect(marquee).toContain("isStorefrontReadyProduct");
    expect(marquee).toContain('product.categorySlug === "cats"');
    expect(marquee).toContain('product.categorySlug === "dogs"');
    expect(marquee).toContain("const repeatedProducts = [...products, ...products, ...products]");
    expect(marquee).toContain("AUTO_RESUME_DELAY_MS");
    expect(marquee).toContain("scrollBy({ left: direction * distance, behavior: \"smooth\" })");
    expect(marquee).toContain("homeMarqueePrevious");
    expect(marquee).toContain("homeMarqueeNext");
    expect(marquee).toContain("onPointerEnter={pauseAutoPlay}");
    expect(marquee).toContain("onPointerLeave={resumeAutoPlaySoon}");
    expect(marquee).toContain("prefers-reduced-motion: reduce");
    expect(marquee).toContain("tabIndex={duplicate ? -1 : undefined}");
    expect(marquee).toContain("<ProductImage");
    expect(marquee).toContain("homeMarqueeCats");
    expect(marquee).toContain("homeMarqueeDogs");
    expect(marqueeStyles).toContain("scroll-snap-type: x proximity");
    expect(marqueeStyles).toContain(".controlButton");
    expect(marqueeStyles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(marqueeStyles).toContain('card[data-marquee-copy="duplicate"]');
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
    const header = source("src/components/Header.tsx");
    const categoryDropdown = source("src/components/CategoryDropdown.tsx");
    const productCatalog = source("src/components/menu/ProductCatalog.tsx");
    const products = source("src/lib/products.ts");
    const translations = source("src/lib/i18n/translations.ts");

    expect(page).not.toContain("const quickCategories");
    expect(header).toContain("CategoryDropdown");
    expect(categoryDropdown).toContain('t("catSubWetCans")');
    expect(categoryDropdown).toContain('t("catSubLitter")');
    expect(categoryDropdown).toContain('t("catSubToysClimbing")');
    expect(categoryDropdown).toContain('t("dogSubDryFood")');
    expect(categoryDropdown).toContain('t("dogSubWetCans")');
    expect(categoryDropdown).toContain('t("dogSubToiletPads")');
    expect(products).toContain("PRODUCT_SUBCATEGORY_LABEL_KEY");
    expect(products).toContain("CAT_SNACK_SERIES_LABEL_KEY");
    expect(productCatalog).toContain('getProductSubcategoryLabelKey(selectedSubcategory)');
    expect(productCatalog).toContain('<h1 className="sr-only">{title}</h1>');
    expect(productCatalog).toContain('id="products"');
    expect(productCatalog).toContain('scroll-mt-24');
    expect(productCatalog).not.toContain('ProductSearch variant="home"');
    expect(productCatalog).not.toContain('category-product-search-title');
    expect(productCatalog).not.toContain('categoryNavLabel');
    expect(productCatalog).not.toContain('CAT_SNACK_SERIES.map');
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
    expect(catalogServer).not.toContain("SMALL_PET_DEMO_PRODUCTS");
    expect(productsSource).toContain("QUARANTINED_PRODUCT_IDS");
    expect(productsSource).toContain("isStorefrontReadyProduct");
    expect(catalogServer).toContain(".filter(isStorefrontReadyProduct)");
    expect(translations).toContain('allProducts: "全部產品"');
    expect(translations).toContain('allProducts: "All Products"');
    expect(translations).toContain('catSnackSeriesHairball: "Hairball-care formula"');
  });

  it("keeps the Q2 local delivery policy complete and readable", () => {
    const translations = source("src/lib/i18n/translations.ts");
    const faq = source("src/components/FAQAccordion.tsx");

    expect(translations).toContain("faqDeliveryQuestion: \"落單後幾耐收貨？\"");
    expect(translations).toContain("現貨商品：我們一般會在訂單確認並完成付款後 1-2 個工作天內由香港倉庫安排寄出");
    expect(translations).toContain('shippingNote: "1–2 個工作天寄出・整體 5–7 個工作天收到"');
    expect(translations).toContain('shippingNote: "Dispatched in 1–2 working days・received within 5–7 working days overall"');
    expect(translations).toContain("顧客通常會於下單後 5-7 個工作天內收到商品");
    expect(translations).toContain('stripeMethodsPrimary: "付款由 Stripe 安全處理。"');
    expect(translations).toContain("此後備入口只在自動通知失敗時使用");
    expect(translations).toContain("八號或以上熱帶氣旋警告信號（掛風球）或黑色暴雨警告");
    expect(translations).toContain("本地物流及順豐派送服務將會暫停");
    expect(translations).toContain("順豐追蹤單號（Waybill No.）");
    expect(translations).toContain("In-stock products are generally dispatched from our Hong Kong warehouse within 1–2 working days");
    expect(translations).toContain("customers will usually receive their order within 5–7 working days");
    expect(translations).toContain("No. 8 or higher tropical cyclone warning signal");
    expect(translations).toContain("Black Rainstorm Warning");
    expect(translations).toContain("SF Express tracking number (Waybill No.)");
    expect(faq).toContain("whitespace-pre-line");
  });

  it("keeps the Q3 payment policy complete and readable", () => {
    const translations = source("src/lib/i18n/translations.ts");
    const faq = source("src/components/FAQAccordion.tsx");

    expect(translations).toContain("faqPaymentQuestion: \"支援乜嘢付款方式？\"");
    expect(translations).toContain("信用卡及手機支付");
    expect(translations).toContain("Visa／Mastercard");
    expect(translations).toContain("Apple Pay（適用於 iPhone、iPad 及 Mac 等 Apple 裝置）");
    expect(translations).toContain("Google Pay（適用於 Android 裝置或 Chrome 瀏覽器）");
    expect(translations).toContain("AlipayHK（支付寶香港）");
    expect(translations).toContain("PayMe");
    expect(translations).toContain("如果您使用 iPhone 或 iPad（iOS 裝置）瀏覽網店");
    expect(translations).toContain("部分非 Apple 官方的支付標誌（如 Google Pay）可能無法在結帳頁面直接顯示");
    expect(translations).toContain("7-day exchange and return guarantee");
    expect(faq).toContain("whitespace-pre-line");
  });

  it("keeps the Q4 return policy complete and readable", () => {
    const translations = source("src/lib/i18n/translations.ts");
    const faq = source("src/components/FAQAccordion.tsx");
    const faqPage = source("src/app/faq/page.tsx");

    expect(translations).toContain("faqReturnsQuestion: \"收到貨後可以退換貨嗎？\"");
    expect(translations).toContain("7日退換貨保障");
    expect(translations).toContain("運輸途中引致商品嚴重破損、變形或漏液");
    expect(translations).toContain("收到之商品與訂單內容不符");
    expect(translations).toContain("商品本身存在品質問題或已過期");
    expect(translations).toContain("必須於簽收後 7 天內提出申請");
    expect(translations).toContain("所有已開封、曾被使用");
    expect(translations).toContain("第一步：拍攝清晰的損壞部位");
    expect(translations).toContain("第二步：透過網頁 Footer 的 WhatsApp");
    expect(translations).toContain("第三步：經客服確認後");
    expect(translations).toContain("7-day exchange and return guarantee");
    expect(translations).toContain("Eligible reasons for exchange or return");
    expect(faq).toContain("whitespace-pre-line");
    expect(faqPage).toContain('import { FAQAccordion } from "@/components/FAQAccordion"');
    expect(faqPage).toContain("<FAQAccordion />");
  });

  it("keeps the mobile phone field compact and readable", () => {
    const phoneForm = source("src/components/checkout/ShippingContactForm.tsx");

    expect(phoneForm).toContain("grid-cols-[minmax(7.25rem,0.9fr)_minmax(0,2.1fr)]");
    expect(phoneForm).toContain("w-full min-w-0 max-w-none shrink rounded-xl");
    expect(phoneForm).toContain("placeholder:text-[0.7rem]");
    expect(phoneForm).toContain("sm:flex-1 sm:px-3.5");
    expect(phoneForm).toContain('id="shipping-phone-country"');
    expect(phoneForm).toContain('id="shipping-tel"');
    expect(phoneForm).toContain("showErrors?: boolean");
    expect(phoneForm).toContain('aria-invalid={phoneError ? true : undefined}');
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
    expect(detail).toContain("selectedProduct.description[locale] || selectedProduct.description.zh");
    expect(detail).toContain("spec.label[locale] || spec.label.zh");
    expect(detail).toContain("getProductFlavorFamily");
    expect(detail).not.toContain("product.specs?.length");
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

  it("keeps three compact social logos above the footer copyright", () => {
    const footer = source("src/components/Footer.tsx");
    const layout = source("src/app/layout.tsx");

    expect(footer).toContain("MofuHavenHK@gmail.com");
    expect(footer).toContain('aria-label="Social media"');
    expect(footer).toContain('aria-label="Facebook"');
    expect(footer).toContain('aria-label="Instagram"');
    expect(footer).toContain("https://www.facebook.com/profile.php?id=61593577262255");
    expect(footer).toContain("https://www.instagram.com/mofuhaven?igsh=MWR2MnJwZ2N5b2p2Zg%3D%3D&utm_source=qr");
    expect(footer).not.toContain("official link coming soon");
    expect(footer).toContain("<FacebookLogo className=\"h-full w-full\" />");
    expect(footer).toContain("<InstagramLogo className=\"h-full w-full\" />");
    expect(footer).toContain("<WhatsAppLogo className=\"h-full w-full\" />");
    expect(footer).toContain("waUrl ?? \"https://wa.me/85298646585\"");
    expect(footer).not.toContain("WhatsAppLogo className=\"h-5 w-5\"");
    expect(layout).not.toContain("FloatingWhatsApp");
  });

  it("keeps exactly the five requested payment options and official marks", () => {
    const paymentMethods = source("src/components/checkout/PaymentMethods.tsx");
    const paymentIcons = source("src/components/icons/PaymentIcons.tsx");
    const checkout = source("src/app/checkout/page.tsx");
    const footer = source("src/components/Footer.tsx");
    const faq = source("src/components/FAQAccordion.tsx");

    expect(paymentMethods).toContain('id: "visa"');
    expect(paymentMethods).toContain('id: "mastercard"');
    expect(paymentMethods).toContain('id: "applepay"');
    expect(paymentMethods).toContain('id: "googlepay"');
    expect(paymentMethods).toContain('id: "alipayhk"');
    expect(paymentMethods).toContain('id: "payme"');
    expect(paymentMethods).not.toContain("wechatpay");
    expect(paymentMethods).not.toContain("payWeChatPay");
    expect(paymentMethods).toContain("grid-cols-3 gap-1.5 sm:gap-2");
    expect(paymentMethods).not.toContain("grid-cols-2");
    expect(paymentMethods).toContain("min-h-[3.75rem]");
    expect(paymentMethods).toContain("bg-[color:var(--accent)]/[0.06]");
    expect(paymentMethods).toContain('id === "mastercard"');
    expect(paymentMethods).toContain('!h-8 !max-h-8 sm:!h-9 sm:!max-h-9');
    expect(footer).toContain('MastercardLogo className="!h-8 !w-auto sm:!h-9"');
    expect(paymentMethods).toContain('role="radiogroup"');
    expect(paymentMethods).toContain('role="radio"');
    expect(checkout).toContain('selectedMethod === "visa" || selectedMethod === "mastercard"');
    expect(checkout).toContain("validateShippingContact");
    expect(checkout).toContain('document.getElementById(firstInvalid)?.focus()');
    expect(checkout).toContain('? "card"');
    expect(checkout).toContain("pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]");
    expect(checkout).toContain("pt-3");
    expect(checkout).toContain("items-center gap-3 px-4");
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

  it("keeps the product page ready for a five-image Stripe gallery", () => {
    const productDetail = source("src/components/product/ProductDetail.tsx");
    const gallery = source("src/components/product/ProductGallery.tsx");
    const catalog = source("src/lib/catalog-server.ts");
    const productType = source("src/lib/products.ts");

    expect(productDetail).toContain("<ProductGallery");
    expect(productDetail).toContain("images={selectedProduct.images}");
    expect(productDetail).toContain("key={selectedProduct.id}");
    expect(gallery).toContain("slice(0, 5)");
    expect(gallery).toContain("snap-x snap-mandatory");
    expect(gallery).toContain('role="tablist"');
    expect(gallery).toContain("onTouchStart={onTouchStart}");
    expect(gallery).toContain('aria-label={t("productGalleryPrevious")}');
    expect(gallery).toContain('aria-label={t("productGalleryNext")}');
    expect(catalog).toContain("new Set((product.images ?? []).filter(isUsableCatalogImage))");
    expect(catalog).toContain("...(images.length > 0 ? { images } : {})");
    expect(productType).toContain("images?: string[]");
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
