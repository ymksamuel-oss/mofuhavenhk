"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";

type BannerSlide = {
  id: string;
  image: string;
  mobileImage?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  imageAlt: string;
  tone: "dark" | "light";
  /** Database-managed banners are complete artwork and must not receive fallback copy. */
  managed?: boolean;
};

/** Static artwork used only when the store has no managed Banner configured. */
export const HOME_BANNER_SLIDES: BannerSlide[] = [
  {
    id: "banner-1",
    image: "/images/hero-sleeping-shiba-taupe.jpg",
    mobileImage: "/images/hero-sleeping-shiba-taupe.jpg",
    eyebrow: "MOFUHAVEN",
    title: "MOFUHAVEN 質感寵物生活",
    subtitle: "日系嚴選，給毛孩最溫柔的陪伴",
    cta: "立即選購",
    href: "/menu",
    imageAlt: "Mofu Haven 寵物生活選品",
    tone: "light",
  },
  {
    id: "banner-2",
    image: "/images/hero-mobile-clean-pet-lifestyle.jpg",
    eyebrow: "FEEDING ESSENTIALS",
    title: "食具及餵食專區",
    subtitle: "陶瓷質感食碗，讓用餐變成一種享受",
    cta: "探索食具",
    href: "/categories/cats",
    imageAlt: "寵物食具及餵食用品",
    tone: "dark",
  },
  {
    id: "banner-3",
    image: "/images/explore-japanese-pet-lifestyle.jpg",
    eyebrow: "PET HOME EDIT",
    title: "寵物日常家居用品",
    subtitle: "簡約自然風格，融入精緻家居",
    cta: "查看新品",
    href: "/categories/lifestyle",
    imageAlt: "簡約自然風格的寵物家居用品",
    tone: "dark",
  },
  {
    id: "banner-4",
    image: "/images/mofu-haven-website-b.png",
    eyebrow: "LIMITED OFFER",
    title: "全館限時優惠",
    subtitle: "精選和服項圈與生活質感好物",
    cta: "了解更多",
    href: "/menu",
    imageAlt: "Mofu Haven 精選寵物用品優惠",
    tone: "dark",
  },
];

const AUTO_PLAY_MS = 4000;

type StoreBanner = {
  id?: string | number;
  image_url?: string | null;
  mobile_image_url?: string | null;
  link?: string | null;
  title?: string | null;
};

function toManagedSlides(banners: StoreBanner[]): BannerSlide[] {
  const seenImages = new Set<string>();
  return banners
    .filter((banner) => typeof banner.image_url === "string" && banner.image_url.trim().length > 0)
    .map((banner, index) => {
      const image = banner.image_url!.trim();
      const mobileImage = typeof banner.mobile_image_url === "string" ? banner.mobile_image_url.trim() : "";
      return {
        id: String(banner.id || `managed-banner-${index}`),
        image,
        // Prefer the dedicated mobile artwork; fall back to the desktop image when absent.
        mobileImage: mobileImage || image,
        eyebrow: "MOFU HAVEN",
        title: banner.title?.trim() || "Mofu Haven 質感寵物生活",
        subtitle: "",
        cta: "",
        href: banner.link?.trim() || "",
        imageAlt: banner.title?.trim() || "Mofu Haven Banner",
        tone: "dark" as const,
        managed: true,
      };
    })
    .filter((banner) => {
      const dedupeKey = `${banner.image}|${banner.mobileImage || ""}`;
      if (seenImages.has(dedupeKey)) return false;
      seenImages.add(dedupeKey);
      return true;
    });
}

export function HomeBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next");
  const [slides, setSlides] = useState<BannerSlide[]>(HOME_BANNER_SLIDES);
  const autoplayTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const managedSlides = toManagedSlides(Array.isArray(payload?.banners) ? payload.banners : []);
        if (managedSlides.length > 0) {
          // Replace the fallback atomically and restart from the first managed Banner.
          setSlides(managedSlides);
          setActiveIndex(0);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // The static artwork remains a safe fallback when the optional store API is unavailable.
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
      aria-label="Mofu Haven Banner Slider"
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

            {!activeSlide.managed && (
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
              </>
            )}

            {activeSlide.managed && activeSlide.href && (
              <CategoryNavLink href={activeSlide.href} className="absolute inset-0 z-10" aria-label={activeSlide.title}>
                <span className="sr-only">{activeSlide.title}</span>
              </CategoryNavLink>
            )}
          </article>

          {/* Keep the full-slide CTA below a dedicated controls layer so it can
              never intercept arrow or dot clicks, including on managed banners. */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <button
              type="button"
              aria-label="上一張 Banner"
              disabled={slides.length <= 1}
              onClick={handleManualPrevious}
              className="pointer-events-auto absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 sm:left-5 sm:h-11 sm:w-11"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              aria-label="下一張 Banner"
              disabled={slides.length <= 1}
              onClick={handleManualNext}
              className="pointer-events-auto absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 sm:right-5 sm:h-11 sm:w-11"
            >
              <span aria-hidden>›</span>
            </button>

            {slides.length > 1 && (
              <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="Banner 選擇">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-label={`切換至 Banner ${index + 1}`}
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
