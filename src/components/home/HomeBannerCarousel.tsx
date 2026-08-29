"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";

/**
 * Homepage banner style reminder: continue Mofu Haven's warm Japanese editorial
 * direction with cream surfaces, deep caramel type, soft gold controls, and
 * spacious rounded composition. Keep image URLs centralized here for easy swaps.
 */

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
};

/** Replace `image` / `mobileImage` here when new Banner 1–4 artwork is ready. */
export const HOME_BANNER_SLIDES: BannerSlide[] = [
  {
    id: "banner-1",
    image: "/images/hero-sleeping-shiba-taupe.jpg",
    // Use the 2560px desktop source on mobile too; the former 444px mobile crop looked soft on Retina screens.
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
    // Banner 4 previously used a 512px strip; this 1408px source keeps the artwork crisp.
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

export function HomeBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = (index: number) => {
    setActiveIndex((index + HOME_BANNER_SLIDES.length) % HOME_BANNER_SLIDES.length);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused]);

  return (
    <section
      aria-label="Mofu Haven Banner Slider"
      className="mobile-home-soft-surface bg-[color:var(--background)] px-4 pb-4 pt-3 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-[#d7b893]/65 bg-[#ead7bf] shadow-[0_22px_52px_-38px_rgba(75,54,33,0.58)] sm:rounded-[2rem]">
        <div className="relative aspect-[4/5] min-h-[30rem] sm:aspect-[16/9] sm:min-h-0 lg:aspect-[2.15/1]">
          <div
            className="flex h-full w-full transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {HOME_BANNER_SLIDES.map((slide) => (
              <article key={slide.id} className="relative h-full min-w-full overflow-hidden">
                <picture>
                  {slide.mobileImage ? <source media="(max-width: 639px)" srcSet={slide.mobileImage} /> : null}
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    priority={slide.id === "banner-1"}
                    quality={92}
                    sizes="(min-width: 1024px) 90vw, 100vw"
                    className="object-cover object-center"
                  />
                </picture>
                <div
                  className={`absolute inset-0 ${
                    slide.tone === "light"
                      ? "bg-gradient-to-r from-[#f7efe4]/95 via-[#f7efe4]/72 to-transparent"
                      : "bg-gradient-to-r from-[#2e2119]/80 via-[#2e2119]/38 to-transparent"
                  }`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute inset-x-0 bottom-0 top-0 flex max-w-xl flex-col justify-end px-6 pb-16 pt-12 sm:px-12 sm:pb-20 lg:px-16 lg:pb-24 ${
                    slide.tone === "light" ? "text-[#4b3621]" : "text-white"
                  }`}
                >
                  <p className="text-[10px] font-semibold tracking-[0.26em] opacity-80 sm:text-xs">{slide.eyebrow}</p>
                  <h1 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>
                  <p className={`mt-4 max-w-md text-sm leading-7 sm:text-lg ${slide.tone === "light" ? "text-[#725c45]" : "text-white/85"}`}>
                    {slide.subtitle}
                  </p>
                  <CategoryNavLink
                    href={slide.href}
                    className={`mt-6 inline-flex min-h-12 w-fit items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-[0_14px_28px_-16px_rgba(43,31,24,0.6)] transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                      slide.tone === "light"
                        ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--hero-deep)]"
                        : "bg-white text-[#4b3621] hover:bg-[#fff8ee]"
                    }`}
                  >
                    {slide.cta}
                    <span aria-hidden className="ml-2 text-base">→</span>
                  </CategoryNavLink>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            aria-label="上一張 Banner"
            onClick={goPrevious}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5 sm:h-11 sm:w-11"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            aria-label="下一張 Banner"
            onClick={goNext}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:h-11 sm:w-11"
          >
            <span aria-hidden>›</span>
          </button>

          <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-12 lg:left-16" role="tablist" aria-label="Banner 選擇">
            {HOME_BANNER_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-label={`切換至 Banner ${index + 1}`}
                aria-selected={activeIndex === index}
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full border border-white/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
