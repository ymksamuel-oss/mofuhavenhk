"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
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
          <article key={activeSlide.id} aria-live="polite" className={`absolute inset-0 overflow-hidden ${slideAnimationClass}`}>
            <picture>
              {activeSlide.mobileImage ? <source media="(max-width: 639px)" srcSet={activeSlide.mobileImage} /> : null}
              <Image
                src={activeSlide.image}
                alt={activeSlide.imageAlt}
                fill
                priority={activeIndex === 0}
                quality={92}
                sizes="(min-width: 1024px) 90vw, 100vw"
                className="object-cover object-center"
              />
            </picture>

            <>
                <div
                  className={`absolute inset-0 ${
                    activeSlide.tone === "light"
                      ? "bg-gradient-to-r from-[#f7efe4]/95 via-[#f7efe4]/72 to-transparent"
                      : "bg-gradient-to-r from-[#2e2119]/80 via-[#2e2119]/38 to-transparent"
                  }`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute inset-x-0 bottom-0 top-0 flex max-w-xl flex-col justify-end px-6 pb-16 pt-12 sm:px-12 sm:pb-20 lg:px-16 lg:pb-24 ${
                    activeSlide.tone === "light" ? "text-[#4b3621]" : "text-white"
                  }`}
                >
                  <p className="text-[10px] font-semibold tracking-[0.26em] opacity-80 sm:text-xs">{activeSlide.eyebrow}</p>
                  <h1 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                    {activeSlide.title}
                  </h1>
                  <p className={`mt-4 max-w-md text-sm leading-7 sm:text-lg ${activeSlide.tone === "light" ? "text-[#725c45]" : "text-white/85"}`}>
                    {activeSlide.subtitle}
                  </p>
                  <CategoryNavLink
                    href={activeSlide.href}
                    className={`mt-6 inline-flex min-h-12 w-fit items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-[0_14px_28px_-16px_rgba(43,31,24,0.6)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                      activeSlide.tone === "light"
                        ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
                        : "bg-white text-[#4b3621] hover:bg-[#fff8ee]"
                    }`}
                  >
                    {activeSlide.cta}
                    <span aria-hidden className="ml-2 text-base">→</span>
                  </CategoryNavLink>
                </div>
              {activeSlide.gallery && activeSlide.gallery.length > 1 ? (
                <div className="absolute bottom-5 right-5 z-10 hidden w-40 grid-cols-2 gap-2 sm:grid lg:bottom-8 lg:right-8 lg:w-52">
                  {activeSlide.gallery.slice(1, 4).map((image, index) => (
                    <div key={`${activeSlide.id}-${image}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white/80 bg-[#f7efe4]/80 shadow-lg">
                      <Image src={image} alt="" fill sizes="104px" className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          </article>

          {/* Keep the full-slide CTA below a dedicated controls layer so it can never intercept arrow or dot clicks. */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <button
              type="button"
              aria-label={t("homeBannerPrevious")}
              disabled={slides.length <= 1}
              onClick={handleManualPrevious}
              className="pointer-events-auto absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 sm:left-5 sm:h-11 sm:w-11"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              aria-label={t("homeBannerNext")}
              disabled={slides.length <= 1}
              onClick={handleManualNext}
              className="pointer-events-auto absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 sm:right-5 sm:h-11 sm:w-11"
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
