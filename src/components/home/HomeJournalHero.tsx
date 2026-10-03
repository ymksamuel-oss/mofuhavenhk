"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HOMEPAGE_HERO_BANNERS } from "@/lib/homepage-featured";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

type HeroPick = {
  sku: string;
  zh: string;
  en: string;
};

const HERO_PICKS: readonly HeroPick[] = [
  { sku: "4976064026545", zh: "北海道蝦夷鹿肉", en: "Hokkaido venison" },
  { sku: "4976064025623", zh: "低敏純馬肉棒", en: "Pure horse-meat bar" },
  { sku: "4976064013736", zh: "金槍魚薄片", en: "Yellowfin tuna flakes" },
  { sku: "4976064025333", zh: "天然原隻牛蹄", en: "Whole natural beef hoof" },
  { sku: "4976064025791", zh: "凍乾純雞里肌", en: "Freeze-dried chicken" },
  { sku: "4976064025272", zh: "安納芋蜜甘藷", en: "Anno imo sweet potato" },
  { sku: "4976064026514", zh: "鴨里肌肉乾", en: "Japanese duck tenderloin" },
  { sku: "4976064026392", zh: "鯊魚皮潔齒棒", en: "Shark-skin dental chew" },
  { sku: "4976064025661", zh: "高山犛牛芝士", en: "Himalayan yak cheese" },
];

const HERO_BANNER_IMAGES: Record<string, string> = {
  "banner-natural-meat": "/images/hero-natural-meat.jpg",
  "banner-dental-chews": "/images/hero-dental-chew.jpg",
  "banner-seafood": "/images/hero-outdoor-walk.jpg",
};

function productSku(product: Product): string {
  return String(
    product.mofuSku ??
      product.metadata?.mofu_sku ??
      product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ??
      "",
  ).trim();
}

export function HomeJournalHero({ products }: { products: Product[] }) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [activeBanner, setActiveBanner] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const moveBanner = (direction: 1 | -1) => {
    setActiveBanner((current) => (current + direction + HOMEPAGE_HERO_BANNERS.length) % HOMEPAGE_HERO_BANNERS.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % HOMEPAGE_HERO_BANNERS.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined) return;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    moveBanner(delta < 0 ? 1 : -1);
  };

  const featuredProducts = useMemo(() => {
    const bySku = new Map(
      products
        .filter((product) => isStorefrontReadyProduct(product) && product.images?.[0])
        .map((product) => [productSku(product), product]),
    );

    return HERO_PICKS.flatMap((pick) => {
      const product = bySku.get(pick.sku);
      return product ? [{ ...pick, product }] : [];
    });
  }, [products]);

  return (
    <section aria-labelledby="mofu-journal-title" className="bg-[#FFFFFF] text-[#2D2926]">
      <div
        className="relative mx-auto aspect-[16/8] w-full max-w-7xl overflow-hidden bg-white sm:aspect-[16/7]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={isEn ? "Mofu Haven promotional banners" : "Mofu Haven 精選推廣 Banner"}
      >
        {HOMEPAGE_HERO_BANNERS.map((banner, index) => (
          <div key={banner.id} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === activeBanner ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <Image src={HERO_BANNER_IMAGES[banner.id] ?? "/images/hero-natural-meat.jpg"} alt={banner.title} fill priority={index === 0} sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-2xl flex-col justify-center px-6 py-8 text-white sm:px-12 lg:px-16">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-xs">{banner.badge}</p>
              <h2 className="max-w-xl text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{banner.title}</h2>
              <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/85 sm:text-sm lg:text-base">{banner.subtitle}</p>
              <Link href={banner.ctaLink} className="mt-5 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100 sm:text-sm">
                {banner.ctaText} <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => moveBanner(-1)} aria-label={isEn ? "Previous banner" : "上一幅 Banner"} className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-2xl leading-none text-stone-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#C86A2B]">‹</button>
        <button type="button" onClick={() => moveBanner(1)} aria-label={isEn ? "Next banner" : "下一幅 Banner"} className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-2xl leading-none text-stone-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-[#C86A2B]">›</button>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" aria-label={isEn ? "Banner pagination" : "Banner 分頁"}>
          {HOMEPAGE_HERO_BANNERS.map((banner, index) => <button key={banner.id} type="button" onClick={() => setActiveBanner(index)} aria-label={`${isEn ? "Go to banner" : "前往 Banner"} ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === activeBanner ? "w-6 bg-white" : "w-1.5 bg-white/60"}`} />)}
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-3 py-8 sm:px-6 md:grid-cols-12 md:py-16">
        <div className="col-span-12 min-w-0 md:col-span-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            MOFU JOURNAL · ISSUE 01
          </p>
          <h1
            id="mofu-journal-title"
            className="mb-4 max-w-xl whitespace-pre-line font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.25] tracking-tight text-[#2D2926] sm:text-4xl lg:text-5xl"
          >
            {isEn
              ? "The Purest Good for Your Furry Friends\nStarting with Peace of Mind in Every Bite"
              : "給毛孩最純粹的好\n從一口安心開始"}
          </h1>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
            {isEn
              ? "Direct from a century-old Aichi workshop · 100% natural meat · No chemical preservatives"
              : "日本愛知縣百年工坊原裝直送・100% 在地天然純肉・0化學防腐劑"}
          </p>
          <Link
            href="/menu?ingredient=venison"
            className="inline-flex items-center gap-2 rounded-full bg-[#C86A2B] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#B25B20] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A2B] focus-visible:ring-offset-2"
          >
            {isEn ? "Explore natural meat treats" : "探索天然原肉系列"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="col-span-12 min-w-0 md:col-span-7">
          <ul
            aria-label={isEn ? "Featured Best Partner products" : "Best Partner 精選商品"}
            className="mx-auto grid w-full max-w-md grid-cols-3 gap-2.5 rounded-2xl border border-stone-200/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:gap-3 sm:p-4 md:max-w-none"
          >
            {featuredProducts.map(({ product, zh, en }, index) => {
              const label = isEn ? en : zh;
              return (
                <li key={product.id} className="min-w-0">
                  <Link
                    href={productHref(product.id)}
                    title={label}
                    aria-label={`${isEn ? "View product" : "查看商品"}：${label}`}
                    className="group flex aspect-square min-w-0 flex-col items-center justify-between rounded-xl border border-stone-100 bg-white p-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86A2B] sm:p-2.5"
                  >
                    <span className="relative block h-[70%] min-h-0 w-full">
                      <ProductImage
                        src={product.images?.[0] ?? product.image}
                        alt={label}
                        priority={index < 3}
                        sizes="(min-width: 1024px) 18vw, (min-width: 768px) 23vw, 29vw"
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="mt-1 block w-full truncate text-center text-[10px] font-medium leading-4 text-stone-700 sm:text-[11px]">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
