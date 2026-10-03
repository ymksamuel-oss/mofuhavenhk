"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function HomeSupplierStory() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section
      className="border-y border-[#e7ddd2] bg-[#FAF8F5] px-4 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
      aria-label={isEn ? "Mofu Journal editorial features" : "Mofu Journal 品牌專題"}
    >
      <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
        <article className="grid min-w-0 grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="min-w-0 md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              TRACEABILITY · FROM FARM TO BOWL
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[#2D2926] sm:text-4xl">
              {isEn ? "Traceability from Farm to Bowl" : "從產地到餐桌・安心溯源"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "From Hokkaido wild venison to pure grass-fed horse meat, we focus on single-protein recipes and clearly traceable ingredients for everyday confidence."
                : "從北海道野生鹿肉到草飼純馬肉，我們以單一肉源為選品核心，清楚追溯原料來處，讓每一口都吃得安心。"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-stone-700">
              {(isEn
                ? ["Hokkaido venison", "Pure horse jerky", "Single-source meat"]
                : ["北海道野生鹿肉", "純馬肉乾", "單一肉源嚴選"]
              ).map((label) => (
                <span key={label} className="rounded-full border border-stone-200 bg-white px-3 py-1.5">
                  {label}
                </span>
              ))}
            </div>
            <Link
              href="/collections/horse-meat"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C86A2B] transition hover:gap-3 hover:text-[#B25B20]"
            >
              {isEn ? "Shop natural meat treats" : "快速選購天然原肉"} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="min-w-0 md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-100 bg-[#F2EAE0] shadow-sm">
              <Image
                src="/images/hero-natural-meat.jpg"
                alt={isEn ? "A golden retriever enjoying a natural meat treat" : "金毛犬享用天然原肉零食的暖色生活攝影"}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          </figure>
        </article>

        <article className="grid min-w-0 grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-10 lg:gap-16">
          <figure className="order-2 min-w-0 md:order-1 md:col-span-7">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-100 bg-[#F2EAE0] shadow-sm md:aspect-[4/3]">
              <Image
                src="/images/best-partner/bp-official-golden-retriever-badges.jpg"
                alt={isEn
                  ? "Official Best Partner artwork: an owner petting a golden retriever, four Japanese quality badges and the BP mark"
                  : "Best Partner 官方認證圖：主人撫摸金毛犬，左側完整呈現「国産・無添加・無着色・豊富な品揃え」四個標籤，右下角有 BP 標誌"}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain"
              />
            </div>
          </figure>
          <div className="order-1 min-w-0 md:order-2 md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              THE ART OF SLOW DRYING
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[#2D2926] sm:text-4xl">
              {isEn ? "The Art of Slow Drying" : "愛知縣職人的低溫慢火烘乾工藝"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "Founded in 1926, the Toyohashi workshop uses small-batch, low-temperature drying to deepen natural flavour—preserving goodness without relying on chemical preservatives."
                : "創立於 1926 年的愛知縣豐橋工坊，堅持小批量低溫慢火溫烘，濃縮天然鮮味；以職人耐心守住風味，不依賴人工化學防腐劑。"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-stone-700 sm:grid-cols-3">
              {(isEn ? ["Small batch", "Low temperature", "0 preservatives"] : ["小批量製作", "低溫慢火", "0 化學防腐"]
              ).map((label) => (
                <span key={label} className="border-l-2 border-[#C86A2B] pl-3 leading-5">
                  {label}
                </span>
              ))}
            </div>
            <Link
              href="/supplier-profile"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C86A2B] transition hover:gap-3 hover:text-[#B25B20]"
            >
              {isEn ? "Read the manufacturer story" : "閱讀完整製造商履歷"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
