"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function HomeSupplierStory() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section
      className="border-y border-[#F1F1F1] bg-[#FFFFFF] px-4 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
      aria-label={isEn ? "Mofu Journal editorial features" : "毛毛港品牌專題"}
    >
      <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
        <article className="grid min-w-0 grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="min-w-0 md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {isEn ? "TRACEABILITY · FROM FARM TO BOWL" : "產地溯源：從日本農場到毛孩餐桌"}
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
            <div className="relative aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]">
              <Image
                src="/images/best-partner/bp-official-puppy-kitten-100-lineup.jpg"
                alt={isEn
                  ? "Official Best Partner artwork featuring a golden retriever puppy and a warm orange long-haired cat"
                  : "Best Partner 官方貓狗同框圖：金毛幼犬與暖橘色長毛貓咪，呈現國產、無添加、無著色及豐富商品陣容"}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105 sm:p-4"
              />
            </div>
          </figure>
        </article>

        <article className="grid min-w-0 grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-10 lg:gap-16">
          <figure className="order-2 min-w-0 md:order-1 md:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 shadow-sm">
              <Image
                src="/images/best-partner-factory.jpg"
                alt={isEn
                  ? "Best Partner head office factory in Toyohashi, Aichi, Japan, with the BP mark under a blue sky"
                  : "日本愛知縣豐橋市 Best Partner 本社工廠實景，藍天白雲下可見 BP 標誌廠房"}
                width={1090}
                height={820}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <figcaption className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold leading-5 text-stone-700 shadow-sm backdrop-blur-sm sm:bottom-5 sm:left-5 sm:px-4">
                {isEn ? "🇯🇵 Best Partner head office factory · Toyohashi, Aichi" : "🇯🇵 日本愛知縣豐橋市・Best Partner 本社工廠實景"}
              </figcaption>
            </div>
          </figure>
          <div className="order-1 min-w-0 md:order-2 md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {isEn ? "AICHI CRAFT · FROM SOURCE TO BOWL" : "愛知縣職人工藝／從產地到餐桌"}
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[#2D2926] sm:text-4xl">
              {isEn ? "A pure Japanese original for the family who matters most." : "給最重要的家人，一份純淨無瑕的日本原味。"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "Best Partner's Aichi head office, founded in 1926, pairs small-batch low-temperature drying with Mofu Haven Hong Kong's official direct import service."
                : "日本愛知縣百年本社（創業1926年）× 毛毛港香港官方專營直送"}
            </p>
            <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "We select 100% Japanese local pure meat and gently slow-dry it in-house, protecting every pet's clean, healthy everyday nourishment."
                : "嚴選 100% 日本在地純肉，自社低溫慢烘，守護毛孩純淨健康。"}
            </p>
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
