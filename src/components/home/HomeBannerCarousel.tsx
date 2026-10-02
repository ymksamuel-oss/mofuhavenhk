"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/products";
import type { HomepageBanner } from "@/lib/banner-server";

const AUTO_PLAY_MS = 5000;
const FEATURED_PRODUCT_COUNT = 6;

type Props = {
  banners: HomepageBanner[];
  products: Product[];
};

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <span aria-hidden="true" className="text-2xl leading-none">{direction === "previous" ? "‹" : "›"}</span>;
}

export function HomeBannerCarousel({ banners, products }: Props) {
  const { locale, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const activeBanner = banners[activeIndex] ?? banners[0];
  const featuredProducts = useMemo(() => {
    const withImages = products.filter((product) => product.images?.[0]);
    const bestPartner = withImages.filter((product) =>
      product.brandName?.toLowerCase().includes("best partner")
      || product.brandId?.toLowerCase().includes("best-partner")
      || /best partner/i.test(`${product.name.en} ${product.name.zh}`),
    );
    return (bestPartner.length > 0 ? bestPartner : withImages).slice(0, FEATURED_PRODUCT_COUNT);
  }, [products]);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  }, [banners.length]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % banners.length);
  }, [banners.length]);

  const goPrevious = useCallback(() => {
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
    <section aria-label={t("homeBannerAriaLabel")} className="relative w-full px-3 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto w-full max-w-[900px] overflow-hidden rounded-[1.5rem] border border-[#eaded3] bg-[#f7f2ec] shadow-[0_24px_55px_-34px_rgba(73,48,31,0.48)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative isolate grid grid-cols-1 overflow-hidden lg:min-h-[440px] lg:grid-cols-2">
          {activeBanner.bgType === "custom_image" && activeBanner.customImageUrl ? (
            <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: `url(${activeBanner.customImageUrl})` }} aria-hidden="true" />
          ) : null}

          <div className="relative z-10 flex min-h-[330px] flex-col items-center justify-center px-7 py-12 text-center sm:min-h-[360px] sm:px-12 lg:min-h-[440px] lg:items-start lg:px-11 lg:py-14 lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8b6b55] sm:text-xs">{activeBanner.tagEn}</span>
            <h1 className="mt-5 max-w-xl whitespace-pre-line font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.2] tracking-tight text-[#493526] sm:text-4xl lg:text-[2.6rem]">{locale === "en" ? activeBanner.titleEn : activeBanner.titleZh}</h1>
            <p className="mt-5 max-w-lg whitespace-pre-line text-sm leading-7 text-[#765d49] sm:text-base sm:leading-8">{locale === "en" ? activeBanner.subtitleEn : activeBanner.subtitleZh}</p>
            <Link href={activeBanner.linkUrl} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-15px_rgba(24,24,27,.8)] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2">
              {locale === "en" ? activeBanner.buttonTextEn : activeBanner.buttonTextZh}
            </Link>
          </div>

          <div className="relative grid min-h-[250px] grid-cols-3 gap-2.5 bg-[radial-gradient(ellipse_at_center,rgba(255,253,250,0.42)_0%,rgba(244,233,223,0.9)_100%)] px-4 py-5 sm:min-h-[290px] sm:gap-4 sm:p-7 lg:min-h-[440px] lg:grid-cols-2 lg:grid-rows-3 lg:gap-4 lg:p-8">
            {Array.from({ length: FEATURED_PRODUCT_COUNT }, (_, index) => {
              const product = featuredProducts[index % Math.max(featuredProducts.length, 1)];
              return (
                <div key={`${product?.id ?? "empty"}-${index}`} className="relative h-24 overflow-hidden rounded-2xl border border-white/90 bg-white shadow-[0_10px_24px_-18px_rgba(82,58,42,0.55)] sm:h-32 lg:h-auto">
                  {product ? <ProductImage src={product.images?.[0] ?? "catalog-placeholder"} alt={locale === "en" ? product.name.en : product.name.zh} fill sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 28vw" className="object-contain p-2.5 sm:p-3" /> : <div className="h-full w-full bg-[#eee4d9]" />}
                </div>
              );
            })}
          </div>

          <button type="button" aria-label={t("homeBannerPrevious")} onClick={goPrevious} className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] md:flex lg:left-3"><Arrow direction="previous" /></button>
          <button type="button" aria-label={t("homeBannerNext")} onClick={goNext} className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] md:flex lg:right-3"><Arrow direction="next" /></button>

          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-2" role="tablist" aria-label={t("homeBannerSelect")}>
            {banners.map((banner, index) => <button key={banner.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))} onClick={() => goTo(index)} className={`h-2 rounded-full border border-[#7a543b]/50 transition-all ${index === activeIndex ? "w-8 bg-[#493526]" : "w-2 bg-[#b99678]/55 hover:bg-[#7a543b]"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
