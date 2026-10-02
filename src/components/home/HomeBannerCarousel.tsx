"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { productHref } from "@/lib/products";
import type { Product } from "@/lib/products";
import type { HomepageBanner } from "@/lib/banner-server";

const AUTO_PLAY_MS = 5000;
const MAX_HERO_PRODUCTS = 4;

type BannerTheme = "flagship" | "topper" | "dental" | "everyday";

type Props = {
  banners: HomepageBanner[];
  products: Product[];
};

const BANNER_IDS: Record<string, BannerTheme> = {
  "f51df3ae-7a64-4cce-a6ad-ffb9a08d61d6": "flagship",
  "beb1adf3-a69e-4c3a-9ad3-7bd0cf904248": "topper",
  "3e5c62f5-6454-49b1-86dc-42407a7cf6a4": "dental",
  "3c3f3d3a-da4f-4d31-aab8-4a24f54590b3": "everyday",
};

const HERO_PRODUCT_SKUS: Record<BannerTheme, readonly string[]> = {
  flagship: ["4976064026545", "4976064026446", "4976064025333", "4976064025791"],
  topper: ["4976064026705", "4976064024886", "4976064013897", "4976064024251"],
  dental: ["4976064025890", "4976064025333", "4976064024046", "4976064026392"],
  everyday: ["4976064023520", "4976064026545", "4976064024336", "4976064025791"],
};

const THEME_FALLBACKS: Record<BannerTheme, RegExp> = {
  flagship: /蝦夷鹿|鹿肉|venison|deer|牛大筋|牛蹄|beef tendon|beef hoof|凍乾.*雞|freeze.dried.*chicken/i,
  topper: /雪花|肉碎|肉鬆|拌糧|柴魚|鰹魚|topper|flakes|furikake|chicken.*floss|gizzard/i,
  dental: /潔齒|耐咬|牛蹄筋|牛大筋|牛蹄|鹿肋骨|鯊魚皮|tendon|hoof|rib|shark.*skin|chew/i,
  everyday: /原肉|肉乾|蝦夷鹿|鹿肉|雞里肌|jerky|venison|chicken tenderloin/i,
};

function resolveBannerTheme(banner: HomepageBanner, index: number): BannerTheme {
  const knownTheme = BANNER_IDS[banner.id];
  if (knownTheme) return knownTheme;

  const copy = `${banner.tagEn} ${banner.titleZh} ${banner.titleEn} ${banner.subtitleZh} ${banner.subtitleEn} ${banner.linkUrl}`.toLowerCase();
  if (/dental|chew|潔齒|耐咬|牛蹄筋/.test(copy)) return "dental";
  if (/picky|pure meat|100%|純肉|挑嘴|雪花|拌糧|meal-toppers/.test(copy)) return "topper";
  if (/reason|stands apart|選ばれる理由|旗艦/.test(copy)) return "flagship";
  if (/daily nourishment|everyday nourishment|日常.*安心|daily-nourishment/.test(copy)) return "everyday";

  return (["flagship", "topper", "dental", "everyday"] as const)[index % 4];
}

function productsForTheme(products: Product[], theme: BannerTheme): Product[] {
  const withImages = products.filter((product) => Boolean(product.images?.[0]));
  const productsBySku = new Map(withImages.map((product) => [product.mofuSku ?? "", product]));
  const selected = HERO_PRODUCT_SKUS[theme]
    .map((sku) => productsBySku.get(sku))
    .filter((product): product is Product => Boolean(product));
  const selectedIds = new Set(selected.map((product) => product.id));

  if (selected.length < 3) {
    for (const product of withImages) {
      const searchable = `${product.name.zh} ${product.name.en} ${product.description?.zh ?? ""} ${product.description?.en ?? ""} ${(product.tags ?? []).join(" ")}`;
      if (!selectedIds.has(product.id) && THEME_FALLBACKS[theme].test(searchable)) {
        selected.push(product);
        selectedIds.add(product.id);
      }
      if (selected.length >= MAX_HERO_PRODUCTS) break;
    }
  }

  return selected.slice(0, MAX_HERO_PRODUCTS);
}

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
    if (!activeBanner) return [];
    return productsForTheme(products, resolveBannerTheme(activeBanner, activeIndex));
  }, [activeBanner, activeIndex, products]);

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
        className="relative mx-auto h-[292px] w-full max-w-[900px] overflow-hidden rounded-[1.5rem] border border-[#eaded3] bg-[#f7f2ec] shadow-[0_24px_55px_-34px_rgba(73,48,31,0.48)] sm:h-[296px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeBanner.bgType === "custom_image" && activeBanner.customImageUrl ? (
          <div className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: `url(${activeBanner.customImageUrl})` }} aria-hidden="true" />
        ) : null}

        <div className="relative z-10 grid h-full grid-rows-[160px_132px] sm:grid-cols-2 sm:grid-rows-1">
          <div className="flex h-full min-w-0 flex-col items-center justify-center gap-1 px-5 py-2 text-center sm:items-start sm:gap-2 sm:px-7 sm:text-left">
            <span className="text-[9px] font-bold uppercase leading-3 tracking-[0.24em] text-[#8b6b55] sm:text-[10px]">{activeBanner.tagEn}</span>
            <h1 className="line-clamp-2 whitespace-pre-line font-[family-name:var(--font-display)] text-xl font-semibold leading-[1.08] tracking-tight text-[#493526] sm:text-2xl sm:leading-tight lg:text-[1.8rem]">{locale === "en" ? activeBanner.titleEn : activeBanner.titleZh}</h1>
            <p className="line-clamp-2 max-w-lg whitespace-pre-line text-[11px] leading-[1.25] text-[#765d49] sm:text-xs sm:leading-5">{locale === "en" ? activeBanner.subtitleEn : activeBanner.subtitleZh}</p>
            <div className="mt-0.5 flex max-w-full items-center justify-center gap-2 sm:justify-start">
              <Link href={activeBanner.linkUrl} className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-15px_rgba(24,24,27,.8)] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:min-h-9 sm:px-5 sm:text-sm">
                {locale === "en" ? activeBanner.buttonTextEn : activeBanner.buttonTextZh}
              </Link>
              <div className="flex shrink-0 items-center gap-1.5" role="tablist" aria-label={t("homeBannerSelect")}>
                {banners.map((banner, index) => <button key={banner.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={t("homeBannerGoTo").replace("{number}", String(index + 1))} onClick={() => goTo(index)} className={`h-2 rounded-full border border-[#7a543b]/50 transition-all ${index === activeIndex ? "w-6 bg-[#493526]" : "w-2 bg-[#b99678]/55 hover:bg-[#7a543b]"}`} />)}
              </div>
            </div>
          </div>

          <div className="flex h-full min-w-0 items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(255,253,250,0.42)_0%,rgba(244,233,223,0.9)_100%)] px-3 py-1 sm:px-4 sm:py-6 xl:px-10">
            <div className="grid h-[120px] w-full grid-cols-4 items-center gap-1.5 sm:h-[140px] sm:gap-2">
              {featuredProducts.map((product) => {
                const name = locale === "en" ? product.name.en : product.name.zh;
                return (
                  <Link key={product.id} href={productHref(product.id)} title={name} aria-label={locale === "en" ? `View product: ${name}` : `查看商品：${name}`} className="relative block h-[120px] min-w-0 overflow-hidden rounded-xl border border-white/90 bg-white shadow-[0_10px_24px_-18px_rgba(82,58,42,0.55)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b573f] focus-visible:ring-offset-2 sm:h-[140px]">
                    <ProductImage src={product.images?.[0] ?? product.image} alt={name} sizes="(min-width: 1024px) 100px, 22vw" className="object-contain p-1.5 sm:p-2" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <button type="button" aria-label={t("homeBannerPrevious")} onClick={goPrevious} className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] xl:flex"><Arrow direction="previous" /></button>
        <button type="button" aria-label={t("homeBannerNext")} onClick={goNext} className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/90 text-[#493526] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#493526] xl:flex"><Arrow direction="next" /></button>
      </div>
    </section>
  );
}
