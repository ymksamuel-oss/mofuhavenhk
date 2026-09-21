"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const AUTO_PLAY_MS = 4000;

type LocalizedText = { zh: string; en: string };
type HeroSlide = {
  id: string;
  eyebrow: LocalizedText;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  mobileSubtitle: LocalizedText;
  href: string;
  cta: LocalizedText;
  image: string;
  mobileImage: string;
  tone: string;
  imagePosition: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "natural-meat",
    eyebrow: { zh: "100% 天然・純粹原肉", en: "100% NATURAL & PURE" },
    badge: { zh: "日本在地嚴選・純粹原肉", en: "JAPAN-SELECTED・PURE MEAT" },
    title: { zh: "純粹肉香・100% 無添加的天然賞賜", en: "Pure Meat Goodness・100% Natural Treats" },
    subtitle: { zh: "嚴選北海道野生鹿肉與低敏馬肉｜低溫慢火烘乾，鎖住極致鮮味", en: "Wild Hokkaido venison and gentle horse meat｜slow-dried to preserve every layer of flavour" },
    mobileSubtitle: { zh: "北海道野生鹿肉・低敏馬肉，低溫慢火濃縮純粹肉香", en: "Hokkaido venison・gentle horse meat, slow-dried for pure flavour" },
    href: "/collections/venison",
    cta: { zh: "探索天然原肉系列", en: "Explore Natural Treats" },
    image: "/images/hero-natural-meat.jpg",
    mobileImage: "/images/hero-natural-meat.jpg",
    tone: "from-[#3b2418]/90 via-[#704a31]/62 to-transparent",
    imagePosition: "object-[68%_center]",
  },
  {
    id: "dental-chews",
    eyebrow: { zh: "潔齒護理・天然耐咬", en: "DENTAL CARE & CHEW" },
    badge: { zh: "物理潔齒提案・釋放精力", en: "DENTAL CARE・ENERGY RELEASE" },
    title: { zh: "告別拆家！天然耐咬潔齒系列", en: "Natural Dental Chews for Happier Days" },
    subtitle: { zh: "原隻牛蹄・特長牛大筋・犛牛芝士棒", en: "Whole hooves・beef tendons・yak cheese sticks｜daily chewing support for cleaner teeth and calm energy" },
    mobileSubtitle: { zh: "原隻牛蹄・牛大筋・犛牛芝士棒，自然耐咬潔齒", en: "Whole hooves・beef tendons・yak cheese sticks for natural dental care" },
    href: "/collections/dental-chews",
    cta: { zh: "選購潔齒耐咬", en: "Shop Dental Chews" },
    image: "/images/hero-dental-chew.jpg",
    mobileImage: "/images/hero-dental-chew.jpg",
    tone: "from-[#30221b]/90 via-[#73503b]/58 to-transparent",
    imagePosition: "object-[72%_center]",
  },
];

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <span aria-hidden="true" className="text-2xl leading-none">{direction === "previous" ? "‹" : "›"}</span>;
}

export function HomeBannerCarousel() {
  const { locale, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const activeSlide = HERO_SLIDES[activeIndex];

  const goTo = useCallback((index: number, nextDirection?: "next" | "previous") => {
    setDirection(nextDirection ?? (index >= activeIndex ? "next" : "previous"));
    setActiveIndex((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [activeIndex]);

  const goNext = useCallback(() => {
    setDirection("next");
    setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
  }, []);

  const goPrevious = useCallback(() => {
    setDirection("previous");
    setActiveIndex((index) => (index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused]);

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setIsPaused(true);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) {
      setIsPaused(false);
      return;
    }
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) >= 40) {
      if (deltaX < 0) goNext();
      else goPrevious();
    }
    setIsPaused(false);
  };

  return (
    <section aria-label={t("homeBannerAriaLabel")} className="relative w-full px-3 sm:px-6 lg:px-10">
      <div
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[1.35rem] bg-[#ead8c8] shadow-[0_22px_48px_-28px_rgba(73,48,31,0.48)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={activeSlide.id} className={`relative isolate h-[380px] overflow-hidden rounded-3xl ${direction === "next" ? "banner-slide-in-next" : "banner-slide-in-previous"} sm:h-[420px]`}>
          <picture className="absolute inset-0 z-0 block h-full w-full bg-[#ead8c8]">
            <source media="(max-width: 639px)" srcSet={activeSlide.mobileImage} />
            <img src={activeSlide.image} alt="" aria-hidden="true" className="absolute inset-0 z-0 h-full w-full object-cover object-[75%_center]" />
          </picture>
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className={`pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-r md:block ${activeSlide.tone}`} />

          <div className="absolute bottom-5 left-4 z-20 flex max-w-[70%] flex-col items-start gap-1.5 text-white md:bottom-16 md:left-20 md:max-w-2xl">
            <span className="w-fit text-[10px] font-bold uppercase tracking-wider text-white/80 md:text-xs md:tracking-[0.24em]">{activeSlide.eyebrow[locale]}</span>
            <span className="w-fit rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-white backdrop-blur-sm">{activeSlide.badge[locale]}</span>
            <h1 className="text-base font-bold leading-tight drop-shadow-sm sm:text-lg md:text-[clamp(2rem,7vw,3.25rem)] md:leading-[1.12]">{activeSlide.title[locale]}</h1>
            <p className="line-clamp-1 text-xs text-white/90 drop-shadow-sm md:hidden">{activeSlide.mobileSubtitle[locale]}</p>
            <p className="mt-1 hidden max-w-xl text-base font-semibold leading-7 text-white/90 drop-shadow-sm md:block md:text-xl md:leading-8">{activeSlide.subtitle[locale]}</p>
            <Link href={activeSlide.href} className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 md:px-5 md:py-3 md:text-sm">
              {activeSlide.cta[locale]}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <button type="button" aria-label={t("homeBannerPrevious")} onClick={goPrevious} className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-5 md:h-12 md:w-12"><Arrow direction="previous" /></button>
          <button type="button" aria-label={t("homeBannerNext")} onClick={goNext} className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-5 md:h-12 md:w-12"><Arrow direction="next" /></button>

          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label={t("homeBannerSelect")}>
            {HERO_SLIDES.map((slide, index) => <button key={slide.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))} onClick={() => goTo(index)} className={`h-2.5 rounded-full border border-white/90 transition-all ${index === activeIndex ? "w-9 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
