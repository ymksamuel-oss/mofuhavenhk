"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/translations";

type BannerSlide = {
  id: string;
  image: string;
  gallery?: string[];
  mobileImage?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  imageAlt: string;
  tone: "dark" | "light";
};

const AUTO_PLAY_MS = 5000;

type StoreProduct = {
  id?: string | number;
  image?: string | null;
  images?: unknown;
  name?: { zh?: string; en?: string } | null;
  description?: { zh?: string; en?: string } | null;
  tags?: unknown;
  metadata?: Record<string, unknown> | null;
};

function productText(product: StoreProduct): string {
  return [
    product.name?.zh,
    product.name?.en,
    product.description?.zh,
    product.description?.en,
    ...(Array.isArray(product.tags) ? product.tags : []),
    ...Object.values(product.metadata ?? {}),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function productImage(product: StoreProduct): string {
  const gallery = Array.isArray(product.images)
    ? product.images.find((image): image is string => typeof image === "string" && image.trim().length > 0)
    : "";
  return gallery || (typeof product.image === "string" ? product.image : "") || "catalog-placeholder";
}

function toProductSlides(
  products: StoreProduct[],
  locale: Locale,
): BannerSlide[] {
  const usableProducts = products.filter((product) => productImage(product) !== "catalog-placeholder");
  if (usableProducts.length === 0) return [];
  const used = new Set<string>();
  const pick = (patterns: RegExp[]): StoreProduct[] => {
    const matches = usableProducts.filter((product) => !used.has(String(product.id)) && patterns.some((pattern) => pattern.test(productText(product))));
    matches.forEach((product) => used.add(String(product.id)));
    return matches.slice(0, 2);
  };
  const fallback = (): StoreProduct[] => usableProducts.filter((product) => !used.has(String(product.id))).slice(0, 2);
  const dog = pick([/蝦夷|北海道|鹿肉|鹿|venison|deer|馬肉|horse|牛筋|beef/i]);
  const cat = pick([/金槍魚|鮪魚|まぐろ|柴魚|かつお|小魚乾|にぼし|tuna|bonito|fish/i]);
  const supplies = pick([/胸背|防暴衝|半鏈|項圈|頸圈|harness|collar|leash/i]);
  const offers = fallback();
  const safeFallback = usableProducts.slice(0, 2);
  const chosen = [dog, cat, supplies, offers].map((items) => (items.length ? items : fallback().length ? fallback() : safeFallback));
  return [
    {
      id: "hero-dog-natural-meat",
      image: productImage(chosen[0][0]),
      gallery: chosen[0].map(productImage),
      eyebrow: locale === "en" ? "JAPAN DIRECT · FOR DOGS" : "日本直送 ‧ 狗狗專區",
      title: locale === "en" ? "100% Japanese natural meat, pure chewy goodness for your best friend" : "100% 日本產天然原肉，給毛孩最純粹的嚼勁美味",
      subtitle: locale === "en" ? "Carefully selected Hokkaido venison, gentle horse meat and grilled beef tendon — no artificial additives." : "嚴選北海道鹿肉、低敏馬肉與香烤牛筋條，無人工添加，換季滋補首選。",
      cta: locale === "en" ? "Shop natural dog jerky" : "選購狗狗天然肉乾",
      href: "/categories/dogs",
      imageAlt: locale === "en" ? "Natural Japanese dog meat treats" : "日本天然狗狗原肉零食",
      tone: "light",
    },
    {
      id: "hero-cat-seafood",
      image: productImage(chosen[1][0]),
      gallery: chosen[1].map(productImage),
      eyebrow: locale === "en" ? "NATURAL SEAFOOD · FOR CATS" : "天然鮮味 ‧ 貓咪專區",
      title: locale === "en" ? "Deep-sea Japanese flavours that picky cats love at first bite" : "日本深海直送魚香，挑嘴貓咪一口愛上",
      subtitle: locale === "en" ? "Salt-free dried fish, bonito flakes, tuna and smooth snacks with natural taurine and quality protein." : "嚴選無鹽小魚乾、金槍魚柴魚薄片與糊仔，富含天然牛磺酸與優質蛋白。",
      cta: locale === "en" ? "Explore cat seafood favourites" : "探索貓咪人氣海鮮",
      href: "/categories/cats",
      imageAlt: locale === "en" ? "Japanese seafood treats for cats" : "日本貓咪人氣海鮮零食",
      tone: "light",
    },
    {
      id: "hero-supplies-walk",
      image: productImage(chosen[2][0]),
      gallery: chosen[2].map(productImage),
      eyebrow: locale === "en" ? "SAFE WALKS · PET SUPPLIES" : "安全出行 ‧ 寵物生活用品",
      title: locale === "en" ? "Breathable anti-pull gear for easier, safer walks" : "減壓透氣防暴衝裝備，每一次散步都安心輕鬆",
      subtitle: locale === "en" ? "Breathable mesh harnesses and two-tone anti-pull half-chain collars for comfortable outdoor adventures." : "透氣網眼胸背帶與雙色防暴衝半鏈頸圈，安全貼身，戶外散步無負擔。",
      cta: locale === "en" ? "Shop walks and supplies" : "查看生活與出行良品",
      href: "/categories/supplies",
      imageAlt: locale === "en" ? "Anti-pull pet walking supplies" : "寵物防暴衝散步用品",
      tone: "light",
    },
    {
      id: "hero-bundle-offer",
      image: productImage(chosen[3][0]),
      gallery: chosen[3].map(productImage),
      eyebrow: locale === "en" ? "STOREWIDE MULTI-BUY" : "全店量販優惠",
      title: locale === "en" ? "Buy more, save more — 5% off at 4 items, 15% off at 12" : "買多折多！滿 4 件享 95 折，滿 12 件享 85 折",
      subtitle: locale === "en" ? "Mix and match your pets’ favourites. Free SF Express local delivery over HK$450, with in-stock items dispatched in 1–2 working days." : "自由混搭毛孩心水零食！全單滿 HK$450 享順豐本地免運，1–2 工作天快速出貨。",
      cta: locale === "en" ? "Build your multi-buy order" : "立即拼單享優惠",
      href: "/menu",
      imageAlt: locale === "en" ? "Popular pet treats in a multi-buy offer" : "熱門寵物零食量販優惠",
      tone: "light",
    },
  ];
}

export function HomeBannerCarousel() {
  const { locale, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next");
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const slides = useMemo(() => toProductSlides(storeProducts, locale), [locale, storeProducts]);
  const autoplayTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const products = Array.isArray(payload?.products) ? payload.products : [];
        setStoreProducts(products);
        setActiveIndex(0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Keep the current database-backed result if a transient request fails.
      });

    return () => controller.abort();
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex((currentIndex) => {
      const nextIndex = Number.isFinite(index) ? index : currentIndex;
      if (nextIndex !== currentIndex) {
        const isForward = (nextIndex - currentIndex + slides.length) % slides.length <= slides.length / 2;
        setSlideDirection(isForward ? "next" : "previous");
      }
      return (nextIndex + slides.length) % slides.length;
    });
  }, [slides.length]);

  const goNext = useCallback(() => {
    setSlideDirection("next");
    setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
  }, [slides.length]);

  const goPrevious = useCallback(() => {
    setSlideDirection("previous");
    setActiveIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const restartAutoplay = useCallback(() => {
    if (autoplayTimer.current !== null) {
      window.clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
    if (slides.length <= 1) return;
    autoplayTimer.current = window.setInterval(goNext, AUTO_PLAY_MS);
  }, [goNext, slides.length]);

  useEffect(() => {
    restartAutoplay();
    return () => {
      if (autoplayTimer.current !== null) {
        window.clearInterval(autoplayTimer.current);
        autoplayTimer.current = null;
      }
    };
  }, [restartAutoplay]);

  const handleManualPrevious = useCallback(() => {
    goPrevious();
    restartAutoplay();
  }, [goPrevious, restartAutoplay]);

  const handleManualNext = useCallback(() => {
    goNext();
    restartAutoplay();
  }, [goNext, restartAutoplay]);

  const handleDotSelect = useCallback((index: number) => {
    goTo(index);
    restartAutoplay();
  }, [goTo, restartAutoplay]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) handleManualNext();
    else handleManualPrevious();
  }, [handleManualNext, handleManualPrevious]);

  const activeSlide = slides[activeIndex] || slides[0];
  const slideAnimationClass = slideDirection === "next" ? "banner-slide-in-next" : "banner-slide-in-previous";
  if (!activeSlide) return null;

  return (
    <section
      aria-label={t("homeBannerAriaLabel")}
      className="mobile-home-soft-surface relative isolate z-0 scroll-mt-14 bg-[color:var(--background)] px-4 pb-4 pt-4 sm:scroll-mt-16 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10 lg:pt-8"
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-[#d7b893]/65 bg-[#ead7bf] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[2rem]">
        <div
          className="relative aspect-[4/5] min-h-[26rem] touch-pan-y sm:aspect-[16/9] sm:min-h-0 lg:aspect-[2.15/1]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Render one active article instead of a translated stack, so old/new artwork can never overlap. */}
          <article key={activeSlide.id} aria-live="polite" className={`absolute inset-0 overflow-hidden bg-[#f7efe4] ${slideAnimationClass}`}>
            <div className="grid h-full grid-cols-1 lg:grid-cols-[55%_45%]">
              <div className="order-2 flex min-w-0 flex-col justify-center pl-12 pr-6 py-8 text-[#4b3621] sm:pl-14 sm:pr-10 sm:py-10 lg:order-1 lg:pl-16 lg:pr-8 lg:py-12">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#8a6848] sm:text-xs">{activeSlide.eyebrow}</p>
                <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl lg:text-3xl">
                  {activeSlide.title}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#725c45] sm:mt-4 sm:text-base sm:leading-7">
                  {activeSlide.subtitle}
                </p>
                <CategoryNavLink
                  href={activeSlide.href}
                  className="mt-5 inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_-16px_rgba(43,31,24,0.6)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
                >
                  {activeSlide.cta}<span aria-hidden className="ml-2 text-base">→</span>
                </CategoryNavLink>
              </div>
              <div className="order-1 flex min-h-40 items-center justify-center gap-3 px-10 py-5 sm:min-h-52 sm:px-16 sm:py-8 lg:order-2 lg:min-h-0 lg:px-8 lg:py-10">
                <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_34px_-22px_rgba(75,54,33,0.65)] sm:max-w-sm">
                  <ProductImage src={activeSlide.image} alt={activeSlide.imageAlt} priority={activeIndex === 0} sizes="(min-width: 1024px) 38vw, 80vw" className="object-contain p-3 sm:p-5" />
                </div>
                {activeSlide.gallery && activeSlide.gallery.length > 1 ? (
                  <div className="hidden w-20 shrink-0 flex-col gap-2 sm:flex lg:w-24">
                    {activeSlide.gallery.slice(1, 4).map((image, index) => (
                      <div key={`${activeSlide.id}-${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-[#d7b893]/70 bg-white shadow-sm">
                        <ProductImage src={image} alt="" sizes="96px" className="object-contain p-1" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          {/* Keep the full-slide CTA below a dedicated controls layer so it can never intercept arrow or dot clicks. */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <button
              type="button"
              aria-label={t("homeBannerPrevious")}
              disabled={slides.length <= 1}
              onClick={handleManualPrevious}
              className="pointer-events-auto absolute left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#8a6848]/40 bg-[#4b3621]/25 text-lg text-white shadow-sm transition hover:bg-[#4b3621]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:left-2 sm:h-9 sm:w-9"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              aria-label={t("homeBannerNext")}
              disabled={slides.length <= 1}
              onClick={handleManualNext}
              className="pointer-events-auto absolute right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#8a6848]/40 bg-[#4b3621]/25 text-lg text-white shadow-sm transition hover:bg-[#4b3621]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:right-2 sm:h-9 sm:w-9"
            >
              <span aria-hidden>›</span>
            </button>

            {slides.length > 1 && (
              <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label={t("homeBannerSelect")}>
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))}
                    aria-selected={activeIndex === index}
                    onClick={() => handleDotSelect(index)}
                    className={`h-2.5 rounded-full border border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
