"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function HomeSupplierStory() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section className="border-y border-[#e7ddd2] bg-[#FAF8F5] px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-24" aria-label={isEn ? "Mofu Journal editorial features" : "Mofu Journal 品牌專題"}>
      <div className="mx-auto max-w-6xl space-y-16 sm:space-y-24">
        <article className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">TRACEABILITY · FROM FARM TO BOWL</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[#2D2926] sm:text-4xl">
              {isEn ? "Traceability from Farm to Bowl" : "Traceability from Farm to Bowl・安心產地溯源"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "From a century-old Aichi workshop to your pet’s bowl, we select single-source meat with care. Every product is made in Japan, with transparent origins and no low-cost blended by-products."
                : "從愛知縣百年工坊到毛孩餐桌，我們嚴選單一肉源，100% 日本在地生產，追溯每一份天然原肉的來源，絕不混充廉價副產品。"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-stone-700">
              {(isEn ? ["Pure horse jerky", "Freeze-dried chicken", "Single-source meat"] : ["純馬肉乾", "凍乾純雞里肌", "單一肉源嚴選"]).map((label) => (
                <span key={label} className="rounded-full border border-stone-200 bg-white px-3 py-1.5">{label}</span>
              ))}
            </div>
            <Link href="/menu" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C86A2B] transition hover:gap-3 hover:text-[#B25B20]">
              {isEn ? "Shop natural meat treats" : "快速選購天然原肉"} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="relative md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#eee5db] shadow-[0_20px_48px_-30px_rgba(73,48,31,0.45)]">
              <Image src="/images/hero-natural-meat.jpg" alt={isEn ? "Natural Japanese meat treats arranged for pets" : "日本天然原肉零食擺盤情境"} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm">{isEn ? "Made in Aichi, Japan" : "日本愛知縣製造"}</span>
            </div>
          </div>
        </article>

        <article className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="relative order-2 md:order-1 md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e8dfd5] shadow-[0_20px_48px_-30px_rgba(73,48,31,0.45)]">
              <Image src="/images/best-partner-factory.jpg" alt={isEn ? "Best Partner factory in Toyohashi, Aichi" : "日本愛知縣豐橋市 Best Partner 工坊"} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm">{isEn ? "Since 1926" : "創業於 1926 年"}</span>
            </div>
          </div>
          <div className="order-1 md:order-2 md:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">THE ART OF SLOW DRYING</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-[#2D2926] sm:text-4xl">
              {isEn ? "The Art of Slow Drying" : "愛知縣職人的低溫慢火烘乾工藝"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
              {isEn
                ? "Founded in 1926, the workshop uses small-batch, low-temperature drying to deepen natural flavour. It is a patient craft: preserving goodness without relying on chemical preservatives."
                : "創業於 1926 年的愛知縣工坊，堅持小批量低溫慢火溫烘，將肉材鮮味深層濃縮；以職人耐心守住天然風味，不依賴化學防腐劑。"}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-stone-700 sm:grid-cols-3">
              {(isEn ? ["Small batch", "Low temperature", "0 preservatives"] : ["小批量製作", "低溫慢火", "0 化學防腐"]).map((label) => (
                <span key={label} className="border-l-2 border-[#C86A2B] pl-3 leading-5">{label}</span>
              ))}
            </div>
            <Link href="/supplier-profile" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C86A2B] transition hover:gap-3 hover:text-[#B25B20]">
              {isEn ? "Read the manufacturer story" : "閱讀完整製造商履歷"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
