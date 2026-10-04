"use client";

import Link from "next/link";
import { SupplierProfileSection } from "@/components/SupplierProfileSection";
import { useI18n } from "@/lib/i18n/I18nProvider";

const PRINCIPLES = [
  {
    number: "01",
    titleZh: "天然純淨，堅持無添加",
    titleEn: "Additive-Free and Naturally Pure",
    bodyZh: "減少不必要的人工防腐劑、色素與化學添加，讓每一口都保留食材原有的天然風味。",
    bodyEn: "We minimise artificial preservatives, colours and chemical additives so every bite stays close to the natural ingredient.",
  },
  {
    number: "02",
    titleZh: "嚴選日本在地原料",
    titleEn: "100% Japanese Ingredients",
    bodyZh: "精選產地清晰的日本肉類與農產品，以透明來源與穩定品質，呈現純正自然的風味。",
    bodyEn: "We select locally sourced Japanese meats and produce with clear origins for dependable quality and authentic flavour.",
  },
  {
    number: "03",
    titleZh: "職人低溫慢烘工藝",
    titleEn: "Gentle Low-Temperature Drying",
    bodyZh: "以時間與溫和熱力慢慢烘走水分，不依賴防腐劑，細緻保留天然鮮味與耐嚼口感。",
    bodyEn: "Time and gentle heat remove moisture without relying on preservatives, preserving flavour while offering a satisfying natural chew.",
  },
] as const;

const PRODUCT_LINES = [
  {
    eyebrowZh: "狗狗專區",
    eyebrowEn: "FOR DOGS",
    titleZh: "狗狗天然零食",
    titleEn: "Dog Treats",
    bodyZh: "從雞肉、牛肉、鹿肉與魚類，到凍乾蔬果、潔齒耐咬小食及拌糧好物，為狗狗日常細心配搭。",
    bodyEn: "Chicken, beef, venison, fish, freeze-dried produce, dental chews and meal toppers for dogs.",
    href: "/categories/dogs",
    ctaZh: "選購狗狗好物",
    ctaEn: "Shop Dog Treats",
  },
  {
    eyebrowZh: "貓咪專區",
    eyebrowEn: "FOR CATS",
    titleZh: "貓咪天然小食",
    titleEn: "Cat Treats",
    bodyZh: "精選無添加魚肉、雞肉與海鮮零食，保留自然香氣與適口口感，為貓咪準備安心日常。",
    bodyEn: "Additive-free fish, chicken and seafood treats with natural aroma and satisfying texture for cats.",
    href: "/categories/cats",
    ctaZh: "探索貓咪好物",
    ctaEn: "Explore Cat Treats",
  },
  {
    eyebrowZh: "超值組合",
    eyebrowEn: "VALUE BUNDLES",
    titleZh: "日本食品精選組合",
    titleEn: "Official Food Bundles",
    bodyZh: "細心配搭日本食品與零食，涵蓋日常營養、潔齒照護與多元口味，讓每一天都吃得豐富安心。",
    bodyEn: "Curated Japanese food and treat combinations for everyday nourishment, dental care and variety.",
    href: "/collections/value-bundles",
    ctaZh: "查看精選組合",
    ctaEn: "View Food Bundles",
  },
] as const;

export function BestPartnerConceptContent() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-[#fbf7f2] text-[#49372c]">
      <section className="relative overflow-hidden border-b border-[#F1F1F1] bg-[#FFFFFF] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#FFFFFF]/45 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#e7d1b9]/35 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold tracking-[0.28em] text-[#9a6547] sm:text-sm">{isEn ? "BEST PARTNER · JAPAN" : "日本原裝・Best Partner"}</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-5xl lg:text-6xl">
            {isEn ? "Best Partner Japan · Domestic Ingredients, Additive-Free and Naturally Pure" : "Best Partner 日本原裝｜天然原料・無添加・純粹美味"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#725e50] sm:text-lg">
            {isEn ? "Pure, reassuring flavour for pets, bringing a little more happiness to every everyday meal." : "堅持日本在地天然原料，以職人細緻工藝呈現純粹風味，為毛孩的每一餐添一份安心與喜悅。"}
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="principles-title">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">{isEn ? "OUR PRINCIPLES" : "品牌理念"}</p>
            <h2 id="principles-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">{isEn ? "Care in Every Production Detail" : "用心做好每一個製作細節"}</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <article key={principle.number} className="rounded-[1.75rem] border border-[#F1F1F1] bg-[#FFFFFF] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.6)] sm:p-8">
                <span className="text-sm font-bold tracking-[0.18em] text-[#b27b50]">{principle.number}</span>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-[#49372c]">{isEn ? principle.titleEn : principle.titleZh}</h3>
                <p className="mt-4 text-sm leading-7 text-[#725e50]">{isEn ? principle.bodyEn : principle.bodyZh}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SupplierProfileSection />

      <section className="border-y border-[#F1F1F1] bg-[#FFFFFF] px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="product-lines-title">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">{isEn ? "PRODUCT LINES" : "產品系列"}</p>
            <h2 id="product-lines-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">{isEn ? "Thoughtful Everyday Essentials for Every Pet" : "為每一位毛孩精選的日常好物"}</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <article key={line.href} className="flex flex-col rounded-[1.75rem] bg-[#FFFFFF] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.55)] sm:p-8">
                <p className="text-[11px] font-bold tracking-[0.24em] text-[#b27b50]">{isEn ? line.eyebrowEn : line.eyebrowZh}</p>
                <h3 className="mt-3 text-2xl font-semibold text-[#49372c]">{isEn ? line.titleEn : line.titleZh}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#725e50]">{isEn ? line.bodyEn : line.bodyZh}</p>
                <Link href={line.href} className="mt-7 inline-flex w-fit items-center rounded-full bg-[#7a4b31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5e3928]">
                  {isEn ? line.ctaEn : line.ctaZh} <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="recommendation-title">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#F1F1F1] bg-[#FFFFFF] px-6 py-9 text-center shadow-[0_20px_48px_-34px_rgba(93,67,48,0.6)] sm:px-12 sm:py-12">
          <p className="text-2xl" aria-hidden="true">✦</p>
          <h2 id="recommendation-title" className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">{isEn ? "Recommended for Families Who Value Pure Everyday Care" : "為重視純淨日常照護的家庭而選"}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#725e50] sm:text-base">
            {isEn ? "A thoughtful choice for senior dogs, sensitive stomachs and families who value pure, minimally processed food." : "為熟齡犬、腸胃敏感的毛孩，以及重視天然少加工飲食的家庭，提供安心細選。"}
          </p>
          <div className="mt-7 rounded-2xl bg-[#FFFFFF] px-5 py-4 text-sm font-semibold leading-7 text-[#684a38]">
            {isEn ? "Authenticity assured: genuine Japanese products officially imported by Mofu Haven HK." : "正品保證：毛毛港香港官方專營進口日本原裝商品。"}
          </div>
        </div>
      </section>
    </main>
  );
}
