"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_PLAY_MS = 4000;

type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  detail: string;
  href: string;
  cta: string;
  image: string;
  mobileImage: string;
  tone: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "natural-meat",
    badge: "日本在地嚴選・天然原肉",
    title: "100% 天然原肉零食",
    subtitle: "北海道野生鹿肉・低敏馬肉",
    detail: "為挑剔毛孩選擇純粹肉香，無需複雜添加，安心獎勵每一日。",
    href: "/collections/venison",
    cta: "探索天然肉源",
    image: "/images/hero-sleeping-shiba-taupe.jpg",
    mobileImage: "/images/hero-mobile-clean-pet-lifestyle.jpg",
    tone: "from-[#3d2d25]/85 via-[#5c4030]/48 to-transparent",
  },
  {
    id: "dental-chews",
    badge: "狗狗日常護理・物理潔齒",
    title: "告別拆家！物理刮除牙結石天花板",
    subtitle: "原隻牛蹄・特長牛大筋・犛牛芝士棒",
    detail: "讓自然咀嚼成為每日習慣，陪伴狗狗消耗精力，同時照顧口腔清潔。",
    href: "/collections/dental-chews",
    cta: "選購潔齒耐咬",
    image: "/images/explore-japanese-pet-lifestyle.jpg",
    mobileImage: "/images/hero-mobile-pet-products.jpg",
    tone: "from-[#4c3528]/88 via-[#815d43]/52 to-transparent",
  },
  {
    id: "outdoor-walk",
    badge: "日系機能美學・舒適散步",
    title: "防暴衝優雅漫步",
    subtitle: "Y 型減壓胸背帶・防勒牽引繩",
    detail: "貼合身形、減少拉扯，將每日外出變成毛孩與家長都享受的時光。",
    href: "/collections/outdoor-gear",
    cta: "探索戶外裝備",
    image: "/images/hero-mobile-clean-pet-lifestyle.jpg",
    mobileImage: "/images/hero-mobile-mofu-haven.jpg",
    tone: "from-[#243b3b]/88 via-[#49645e]/52 to-transparent",
  },
];

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <span aria-hidden="true" className="text-2xl leading-none">{direction === "previous" ? "‹" : "›"}</span>;
}

export function HomeBannerCarousel() {
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
    <section aria-label="首頁主題 Banner 輪播" className="relative w-full px-3 sm:px-6 lg:px-10">
      <div
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[1.35rem] bg-[#ead8c8] shadow-[0_22px_48px_-28px_rgba(73,48,31,0.48)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={activeSlide.id} className={`relative isolate min-h-[390px] overflow-hidden sm:min-h-[430px] ${direction === "next" ? "banner-slide-in-next" : "banner-slide-in-previous"}`}>
          <picture>
            <source media="(max-width: 639px)" srcSet={activeSlide.mobileImage} />
            <img src={activeSlide.image} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          </picture>
          <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${activeSlide.tone}`} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#2d211b]/55 via-transparent to-transparent" />

          <div className="flex min-h-[390px] max-w-2xl flex-col justify-center px-7 py-14 text-white sm:min-h-[430px] sm:px-14 sm:py-16">
            <span className="mb-4 w-fit rounded-full border border-white/45 bg-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] backdrop-blur-sm sm:text-sm">{activeSlide.badge}</span>
            <h1 className="max-w-xl text-3xl font-bold leading-[1.15] tracking-tight drop-shadow-md sm:text-5xl">{activeSlide.title}</h1>
            <p className="mt-4 max-w-xl text-lg font-semibold leading-snug text-[#fff8ee] drop-shadow sm:text-2xl">{activeSlide.subtitle}</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">{activeSlide.detail}</p>
            <Link href={activeSlide.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#fffaf2] px-5 py-3 text-sm font-bold text-[#5b3d2c] shadow-lg transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#5b3d2c]">
              {activeSlide.cta}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <button type="button" aria-label="上一張 Banner" onClick={goPrevious} className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5 sm:h-12 sm:w-12"><Arrow direction="previous" /></button>
          <button type="button" aria-label="下一張 Banner" onClick={goNext} className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:h-12 sm:w-12"><Arrow direction="next" /></button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="選擇首頁 Banner">
            {HERO_SLIDES.map((slide, index) => <button key={slide.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`前往第 ${index + 1} 張 Banner`} onClick={() => goTo(index)} className={`h-2.5 rounded-full border border-white/90 transition-all ${index === activeIndex ? "w-9 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
