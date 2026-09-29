"use client";

import Link from "next/link";
import Image from "next/image";
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
  highlightPills: readonly LocalizedText[];
  href: string;
  cta: LocalizedText;
  image: string;
  tone: string;
  imagePosition: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "natural-meat",
    eyebrow: { zh: "日本製造・0 防腐劑・航天級真空凍乾", en: "MADE IN JAPAN・ZERO PRESERVATIVES・VACUUM FREEZE-DRIED" },
    badge: { zh: "低溫慢烘・-40°C 凍乾鎖鮮", en: "SLOW-DRIED・-40°C FRESHNESS LOCK" },
    title: { zh: "給最重要的家人，一份純淨無瑕的日本原肉。", en: "Pure Japanese meat, chosen for your most important family member." },
    subtitle: { zh: "-40°C 真空凍乾鎖鮮・北海道野生鹿肉・極致低敏純馬肉｜挑嘴怪一口入魂", en: "-40°C vacuum freeze-drying・wild Hokkaido venison・gentle horse meat｜irresistible flavour for picky eaters" },
    mobileSubtitle: { zh: "-40°C 凍乾鎖鮮・北海道鹿肉・低敏純馬肉", en: "-40°C freeze-dried venison and gentle horse meat" },
    highlightPills: [
      { zh: "100% 國產天然原肉", en: "100% Natural Japanese Meat" },
      { zh: "愛知縣職人慢烘", en: "Aichi Artisan Slow-Dried" },
      { zh: "滿 HK$399 順豐免運", en: "Free SF Shipping over HK$399" },
    ],
    href: "/collections/natural-meat-treats",
    cta: { zh: "探索純肉選品", en: "Explore Natural Meat" },
    image: "/images/hero-natural-meat.jpg",
    tone: "from-[#3b2418]/90 via-[#704a31]/62 to-transparent",
    imagePosition: "object-[68%_center]",
  },
  {
    id: "dental-chews",
    eyebrow: { zh: "物理刮除牙結石・天然無化學漂白", en: "PHYSICAL PLAQUE REMOVAL・NO CHEMICAL BLEACHING" },
    badge: { zh: "原隻牛蹄・特長牛大筋・天然潔齒", en: "WHOLE HOOF・LONG BEEF TENDON・NATURAL DENTAL CARE" },
    title: { zh: "告別拆家！日本天然磨牙潔齒天花板。", en: "Natural Japanese dental chews to beat boredom and destructive chewing." },
    subtitle: { zh: "深入後臼齒刮除牙斑，天然原隻牛蹄・20cm 特長牛大筋｜耐啃數週不崩牙", en: "Reaches the back molars to help remove plaque｜whole beef hoof・20 cm beef tendon｜built for weeks of chewing" },
    mobileSubtitle: { zh: "原隻牛蹄・20cm 特長牛大筋，耐啃數週不崩牙", en: "Whole hoof and 20 cm beef tendon for long-lasting chewing" },
    highlightPills: [
      { zh: "去牙結石王者", en: "Plaque-Fighting Champion" },
      { zh: "釋放咀嚼天性", en: "Natural Chewing Enrichment" },
      { zh: "滿 HK$399 順豐免運", en: "Free SF Shipping over HK$399" },
    ],
    href: "/collections/dental-chews",
    cta: { zh: "搶購耐咬潔齒系列", en: "Shop Dental Chews" },
    image: "/images/hero-dental-chew.jpg",
    tone: "from-[#30221b]/90 via-[#73503b]/58 to-transparent",
    imagePosition: "object-[72%_center]",
  },
  {
    id: "meal-toppers",
    eyebrow: { zh: "挑嘴救星・犬貓適用純肉鮮食", en: "PICKY EATER SAVIOURS・PURE MEAT FOR DOGS & CATS" },
    badge: { zh: "雪花純肉碎・柴魚薄片・天然誘食", en: "SNOWFLAKE MEAT SHREDS・BONITO FLAKES・NATURAL APPETITE BOOST" },
    title: { zh: "專治不吃飯！職人雪花伴糧粉 & 貓奴瘋搶柴魚薄片。", en: "Make every meal irresistible with artisan meat toppers and bonito flakes." },
    subtitle: { zh: "純肉微粒緊緊包裹乾糧，爆發性肉香；無鹽補鈣小魚乾，天然騙水護腎神物", en: "Pure meat shreds wrap every kibble in savoury aroma; salt-free sardines add natural calcium and encourage hydration" },
    mobileSubtitle: { zh: "雪花純肉碎拌糧・柴魚薄片，天然香氣拯救挑嘴日常", en: "Snowflake meat shreds and bonito flakes for picky eaters" },
    highlightPills: [
      { zh: "純肉雪花無油膩", en: "Lean Snowflake Meat" },
      { zh: "貓咪化毛補水", en: "Hydration Support for Cats" },
      { zh: "滿 HK$399 順豐免運", en: "Free SF Shipping over HK$399" },
    ],
    href: "/collections/meal-toppers",
    cta: { zh: "選購誘食神粉與鮮食", en: "Shop Meal Toppers" },
    image: "https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/best-partner/official-4976064024251-0.jpg",
    tone: "from-[#3b2626]/90 via-[#8b5b52]/60 to-transparent",
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
          <Image src={activeSlide.image} alt={activeSlide.title[locale]} fill priority={activeIndex === 0} sizes="(max-width: 639px) 100vw, (max-width: 1280px) 92vw, 1200px" className={`z-0 object-cover ${activeSlide.imagePosition}`} />
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className={`pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-r md:block ${activeSlide.tone}`} />

          <div className="absolute bottom-5 left-12 z-20 flex max-w-[calc(100%-5.5rem)] flex-col items-start gap-1.5 text-white md:bottom-16 md:left-20 md:max-w-2xl">
            <span className="w-fit text-[10px] font-bold uppercase tracking-wider text-white/80 md:text-xs md:tracking-[0.24em]">{activeSlide.eyebrow[locale]}</span>
            <span className="w-fit rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-white backdrop-blur-sm">{activeSlide.badge[locale]}</span>
            <h1 className="text-base font-bold leading-tight drop-shadow-sm sm:text-lg md:text-[clamp(2rem,7vw,3.25rem)] md:leading-[1.12]">{activeSlide.title[locale]}</h1>
            <p className="line-clamp-1 text-xs text-white/90 drop-shadow-sm md:hidden">{activeSlide.mobileSubtitle[locale]}</p>
            <p className="mt-1 hidden max-w-xl text-base font-semibold leading-7 text-white/90 drop-shadow-sm md:block md:text-xl md:leading-8">{activeSlide.subtitle[locale]}</p>
            <div className="flex max-w-full flex-wrap gap-1.5 pt-1.5" aria-label={locale === "en" ? "Key highlights" : "特色亮點"}>
              {activeSlide.highlightPills.map((pill) => <span key={pill.zh} className="rounded-full border border-white/35 bg-white/15 px-2 py-1 text-[10px] font-medium leading-tight text-white backdrop-blur-sm sm:text-[11px]">{pill[locale]}</span>)}
            </div>
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
