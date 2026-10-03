"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/products";
import type { HomepageBanner } from "@/lib/banner-server";

const AUTO_PLAY_MS = 5000;
const THEME_SKUS: Record<string, string[]> = {
  dental: ["4976064025333", "4976064026446", "4976064025661"],
  topper: ["4976064026705", "4976064024886", "4976064013897"],
  meat: ["4976064026545", "4976064025623", "4976064025081"],
  fish: ["4976064013897", "4976064024725", "4976064024688"],
};

type Props = {
  banners: HomepageBanner[];
  products: Product[];
};

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <span aria-hidden="true" className="text-2xl leading-none">{direction === "previous" ? "‹" : "›"}</span>;
}

function themeForBanner(banner: HomepageBanner): string {
  const text = `${banner.tagEn} ${banner.titleZh} ${banner.titleEn} ${banner.subtitleZh} ${banner.subtitleEn}`.toLowerCase();
  if (/dental|chew|潔齒|耐咬|牛蹄|牛筋/.test(text)) return "dental";
  if (/topper|flakes|挑食|拌糧|柴魚|肉碎/.test(text)) return "topper";
  if (/fish|sea|魚|鮪|小魚|鯊魚/.test(text)) return "fish";
  return "meat";
}

function themeProductMatches(product: Product, theme: string): boolean {
  const text = `${product.name.zh} ${product.name.en} ${product.description?.zh ?? ""} ${product.description?.en ?? ""} ${(product.tags ?? []).join(" ")}`.toLowerCase();
  const patterns: Record<string, RegExp> = {
    dental: /牛蹄|牛筋|牛大筋|牛舌|潔齒|耐咬|hoof|tendon|dental|chew/i,
    topper: /拌糧|肉碎|柴魚|肉鬆|bonito|flakes|topper|meat floss/i,
    fish: /魚|鮪|柴魚|小魚|鯊魚|fish|tuna|bonito|sardine|shark/i,
    meat: /鹿肉|馬肉|牛肉|雞肉|原肉|venison|horse|beef|chicken|natural meat|jerky/i,
  };
  return patterns[theme]?.test(text) ?? false;
}

function uniqueProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (!product.images?.[0] || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

export function HomeBannerCarousel({ banners, products }: Props) {
  const { locale, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next");
  const touchStartX = useRef<number | null>(null);
  const activeBanner = banners[activeIndex] ?? banners[0];
  const availableProducts = useMemo(() => uniqueProducts(products), [products]);
  const featuredProducts = useMemo(() => {
    if (!activeBanner) return [];
    const theme = themeForBanner(activeBanner);
    const bySku = new Map(availableProducts.map((product) => [product.mofuSku ?? "", product]));
    const selected = (THEME_SKUS[theme] ?? [])
      .map((sku) => bySku.get(sku))
      .filter((product): product is Product => Boolean(product));
    const themedProducts = availableProducts.filter((product) => themeProductMatches(product, theme));
    return uniqueProducts([...selected, ...themedProducts, ...availableProducts]).slice(0, 9);
  }, [activeBanner, availableProducts]);

  const goTo = useCallback((index: number) => {
    setSlideDirection(index >= activeIndex ? "next" : "previous");
    setActiveIndex((index + banners.length) % banners.length);
  }, [activeIndex, banners.length]);

  const goNext = useCallback(() => {
    setSlideDirection("next");
    setActiveIndex((index) => (index + 1) % banners.length);
  }, [banners.length]);

  const goPrevious = useCallback(() => {
    setSlideDirection("previous");
    setActiveIndex((index) => (index - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2 || isPaused) return undefined;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, goNext, isPaused]);

  useEffect(() => {
    if (activeIndex >= banners.length) setActiveIndex(0);
  }, [activeIndex, banners.length]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setIsPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
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

  if (!activeBanner) return null;

  return (
    <section aria-label={t("homeBannerAriaLabel")} className="relative w-full px-3 sm:px-6 lg:px-10">
      <div
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[1.5rem] border border-[#eaded3] bg-[#f7f2ec] shadow-[0_24px_55px_-34px_rgba(73,48,31,0.48)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative isolate min-h-[640px] overflow-hidden sm:min-h-[700px] md:min-h-[430px] lg:min-h-[500px]">
          {activeBanner.bgType === "custom_image" && activeBanner.customImageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${activeBanner.customImageUrl})` }} aria-hidden="true" />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-white/75" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,253,250,.94)_0%,rgba(255,253,250,.76)_48%,rgba(255,253,250,.5)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-[#f4e9df]/65" />

          <div key={activeBanner.id} className={`relative z-10 mx-auto grid min-h-[640px] w-full max-w-7xl grid-cols-1 items-center gap-6 px-6 py-12 sm:min-h-[700px] sm:px-10 sm:py-14 md:min-h-[430px] md:grid-cols-12 md:gap-6 md:px-12 md:py-8 lg:min-h-[500px] lg:gap-8 ${slideDirection === "next" ? "banner-slide-in-next" : "banner-slide-in-previous"}`}>
            <div className="col-span-12 min-w-0 text-left md:col-span-6 lg:col-span-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b6b55] sm:text-xs">{activeBanner.tagEn}</span>
              <h1 className="mt-3 max-w-xl whitespace-pre-line font-[family-name:var(--font-display)] text-2xl font-bold leading-[1.15] tracking-tight text-[#2D2926] md:text-3xl lg:text-4xl">{locale === "en" ? activeBanner.titleEn : activeBanner.titleZh}</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#765d49] sm:text-base sm:leading-7">{locale === "en" ? activeBanner.subtitleEn : activeBanner.subtitleZh}</p>
              <Link href={activeBanner.linkUrl} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C86A2B] px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-[#B25B20] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A2B] focus-visible:ring-offset-2">
                {locale === "en" ? activeBanner.buttonTextEn : activeBanner.buttonTextZh}
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="col-span-12 min-w-0 md:col-span-6 lg:col-span-7" aria-label={locale === "en" ? "Featured products" : "主打產品"}>
              <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2.5 rounded-2xl border border-stone-100 bg-white/60 p-3 shadow-sm backdrop-blur-sm sm:gap-3 md:max-w-none">
                {featuredProducts.map((product) => {
                  const name = locale === "en" ? product.name.en : product.name.zh;
                  return (
                    <Link key={product.id} href={`/product/${product.id}`} title={name} aria-label={name} className="group relative aspect-square flex items-center justify-center overflow-hidden rounded-xl border border-stone-100 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:scale-105 sm:p-2">
                      <ProductImage src={product.images?.[0] ?? product.image} alt={name} fill sizes="(min-width: 1024px) 18vw, (min-width: 768px) 23vw, 29vw" className="object-contain p-1.5 mix-blend-multiply sm:p-2" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <button type="button" aria-label={t("homeBannerPrevious")} onClick={goPrevious} className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] md:flex"><Arrow direction="previous" /></button>
          <button type="button" aria-label={t("homeBannerNext")} onClick={goNext} className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] md:flex"><Arrow direction="next" /></button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label={t("homeBannerSelect")}>
            {banners.map((banner, index) => <button key={banner.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))} onClick={() => goTo(index)} className={`h-2 rounded-full border border-[#7a543b]/50 transition-all ${index === activeIndex ? "w-8 bg-[#493526]" : "w-2 bg-[#b99678]/55 hover:bg-[#7a543b]"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
