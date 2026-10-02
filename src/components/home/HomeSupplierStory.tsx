"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

const MAP_EMBED_URL = "https://www.google.com/maps?q=%E3%83%99%E3%82%B9%E3%83%88%E3%83%91%E3%83%BC%E3%83%88%E3%83%8A%E3%83%BC%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%20%E6%84%9B%E7%9F%A5%E7%9C%8C%E8%B1%8A%E6%A9%8B%E5%B8%82%E4%B8%8B%E5%9C%B0%E7%94%BA%E9%95%B7%E6%B1%A036%E7%95%AA%E5%9C%B0&output=embed";

export function HomeSupplierStory() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <section className="border-y border-[#d9e3d5] bg-[#f3f7f1] px-4 py-10 sm:px-8 sm:py-14 lg:px-10" aria-labelledby="home-supplier-story-title">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#c9d8c5] bg-white p-5 shadow-[0_22px_55px_-34px_rgba(61,90,64,0.38)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-[#3d5a40] sm:text-xs">✦ JAPAN HERITAGE · 1926 ✦</p>
            <h2 id="home-supplier-story-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#2f4933] sm:text-3xl lg:text-4xl">
              {isEn ? "A century of Japanese craftsmanship, from factory to bowl" : "日本百年老舖製造履歷，從工坊直達毛孩餐桌"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5e7661] sm:text-base sm:leading-8">
              {isEn
                ? "Best Partner has been making pet treats in Toyohashi, Aichi since 1926. We follow the origin, craft and official sourcing behind every selection so you can shop with confidence."
                : "Best Partner 自 1926 年於日本愛知縣豐橋市製造寵物食品。我們追溯每一件選品的產地、工藝與正規進口來源，讓你安心為毛孩選購。"}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(isEn ? ["Made in Japan", "Official sourcing", "Transparent origins"] : ["日本原廠製造", "正規進口來源", "透明產地資訊"]).map((label) => (
                <span key={label} className="rounded-full border border-[#b7c9b1] bg-[#e9f0e6] px-3 py-1.5 text-xs font-semibold text-[#3d5a40]">{label}</span>
              ))}
            </div>
            <Link href="/supplier-profile" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(178,91,32,0.7)] transition hover:bg-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
              {isEn ? "Read the full manufacturer story" : "閱讀完整製造商履歷"} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#e5eee2]">
                <Image src="/images/best-partner-factory.jpg" alt={isEn ? "Best Partner factory in Toyohashi, Aichi, Japan" : "日本愛知縣豐橋市 Best Partner 本社工廠實景"} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-xs leading-5 text-[#6b806d]">{isEn ? "Best Partner head office and factory · Toyohashi, Aichi" : "日本愛知縣豐橋市・Best Partner 本社工廠實景"}</figcaption>
            </figure>
            <div className="overflow-hidden rounded-2xl border border-[#d9e3d5] bg-[#eef4eb] sm:col-span-1 lg:col-span-1">
              <iframe title={isEn ? "Best Partner factory location" : "Best Partner 原廠位置"} src={MAP_EMBED_URL} className="h-44 w-full border-0 sm:h-full sm:min-h-44 lg:h-44" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
