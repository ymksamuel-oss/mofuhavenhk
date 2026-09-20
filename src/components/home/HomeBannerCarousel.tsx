"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_PLAY_MS = 4000;

type HeroSlide = {
  id: string;
  eyebrow: string;
  badge: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  image: string;
  mobileImage: string;
  tone: string;
  imagePosition: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "natural-meat",
    eyebrow: "100% NATURAL & PURE",
    badge: "JAPAN-SELECTED・PURE MEAT",
    title: "Pure Meat Goodness・100% Natural Treats",
    subtitle: "Wild Hokkaido venison and gentle horse meat｜slow-dried to preserve every layer of flavour",
    href: "/collections/venison",
    cta: "Explore Natural Treats",
    image: "/images/hero-natural-meat.jpg",
    mobileImage: "/images/hero-natural-meat.jpg",
    tone: "from-[#3b2418]/90 via-[#704a31]/62 to-transparent",
    imagePosition: "object-[68%_center]",
  },
  {
    id: "dental-chews",
    eyebrow: "DENTAL CARE & CHEW",
    badge: "DENTAL CARE・ENERGY RELEASE",
    title: "Natural Dental Chews for Happier Days",
    subtitle: "Whole hooves・beef tendons・yak cheese sticks｜daily chewing support for cleaner teeth and calm energy",
    href: "/collections/dental-chews",
    cta: "Shop Dental Chews",
    image: "/images/hero-dental-chew.jpg",
    mobileImage: "/images/hero-dental-chew.jpg",
    tone: "from-[#30221b]/90 via-[#73503b]/58 to-transparent",
    imagePosition: "object-[72%_center]",
  },
  {
    id: "outdoor-walk",
    eyebrow: "ERGONOMIC OUTDOOR GEAR",
    badge: "JAPANESE FUNCTION・COMFORT IN MOTION",
    title: "Lightweight Design for Better Walks",
    subtitle: "Y-shaped harnesses・pressure-friendly leads｜balanced support for comfortable everyday adventures",
    href: "/collections/outdoor-gear",
    cta: "Explore Outdoor Gear",
    image: "/images/hero-outdoor-walk.jpg",
    mobileImage: "/images/hero-outdoor-walk.jpg",
    tone: "from-[#243b34]/90 via-[#4f6a5d]/58 to-transparent",
    imagePosition: "object-[62%_center]",
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
    <section aria-label="Homepage hero carousel" className="relative w-full px-3 sm:px-6 lg:px-10">
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
            <img src={activeSlide.image} alt="" aria-hidden="true" className={`absolute inset-0 -z-20 h-full w-full object-cover ${activeSlide.imagePosition}`} />
          </picture>
          <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${activeSlide.tone}`} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#241912]/45 via-transparent to-transparent" />

          <div className="flex min-h-[500px] max-w-2xl flex-col justify-center px-10 py-14 text-white sm:min-h-[430px] sm:px-20 sm:py-16">
            <span className="mb-3 w-fit text-[10px] font-bold tracking-[0.24em] text-[#f7d7b8] sm:text-xs">{activeSlide.eyebrow}</span>
            <span className="mb-4 w-fit rounded-full border border-white/35 bg-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-[0.08em] shadow-sm backdrop-blur-md sm:text-sm">{activeSlide.badge}</span>
            <h1 className="max-w-xl text-[clamp(2rem,7vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.035em] drop-shadow-md">{activeSlide.title}</h1>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#fff8ee] drop-shadow sm:text-xl sm:leading-8">{activeSlide.subtitle}</p>
            <Link href={activeSlide.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#8a5836] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(39,20,10,0.8)] transition duration-200 hover:scale-[1.02] hover:bg-[#a66d46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8dfc4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#5b3d2c]">
              {activeSlide.cta}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <button type="button" aria-label="Previous banner" onClick={goPrevious} className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5 sm:h-12 sm:w-12"><Arrow direction="previous" /></button>
          <button type="button" aria-label="Next banner" onClick={goNext} className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:h-12 sm:w-12"><Arrow direction="next" /></button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="Select homepage banner">
            {HERO_SLIDES.map((slide, index) => <button key={slide.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Go to banner ${index + 1}`} onClick={() => goTo(index)} className={`h-2.5 rounded-full border border-white/90 transition-all ${index === activeIndex ? "w-9 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
