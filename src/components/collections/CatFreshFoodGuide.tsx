"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import type { Product } from "@/lib/products";

export const GUIDE_SKUS = [
  "4976064024725",
  "4976064013897",
  "4976064024688",
  "4976064015747",
  "4976064024336",
  "4976064025500",
  "4976064024718",
] as const;

type GuideFilter = "all" | "fish" | "chicken" | "chew";
type ProductGuideMeta = { filter: Exclude<GuideFilter, "all">; texture: string; method: string };

const PRODUCT_META: Record<string, ProductGuideMeta> = {
  "4976064024725": { filter: "fish", texture: "★★★☆☆", method: "溫水泡發・整條手餵" },
  "4976064013897": { filter: "fish", texture: "★☆☆☆☆", method: "揉碎拌糧・溫水鮮湯" },
  "4976064024688": { filter: "fish", texture: "★☆☆☆☆", method: "溫水泡發・拌入主食" },
  "4976064015747": { filter: "chicken", texture: "★☆☆☆☆", method: "雪花拌糧・手餵互動" },
  "4976064024336": { filter: "chicken", texture: "★★☆☆☆", method: "深層混糧・濕糧增香" },
  "4976064025500": { filter: "chew", texture: "★★★★☆", method: "手持撕咬拔河" },
  "4976064024718": { filter: "chew", texture: "★★★☆☆", method: "3cm 一口免剪" },
};

const FILTERS: Array<{ id: GuideFilter; label: string; icon: string }> = [
  { id: "all", label: "全部鮮食", icon: "✦" },
  { id: "fish", label: "鮮魚補鈣・騙水", icon: "🐟" },
  { id: "chicken", label: "雞肉誘食・拌糧", icon: "🍗" },
  { id: "chew", label: "咬咬磨牙", icon: "🐾" },
];

const EATING_METHODS = [
  { icon: "🍲", title: "神級溫水騙水法", body: "溫水泡發釋放海魚香氣，秒變鮮甜高湯，引導主子主動補水。", accent: "bg-[#ead8c7]" },
  { icon: "🥣", title: "捏碎／雪花拌糧法", body: "肉碎與薄花緊扣飼料縫隙，杜絕只舔頂層肉片，挑食貓都能秒清碗。", accent: "bg-[#e2e6d3]" },
  { icon: "🐾", title: "手持撕咬拔河", body: "保留原肉長條纖維，手餵互動增進感情，同時鍛鍊自然咬合力。", accent: "bg-[#e8d9dc]" },
  { icon: "✂️", title: "3cm 一口免剪防噎", body: "預先裁剪成一口一粒，免動剪刀，幼貓與高齡貓都能安心享用。", accent: "bg-[#e5ddc8]" },
];

function getSku(product: Product) {
  return product.metadata?.mofu_sku || product.tags?.find((tag) => /^\d{13}$/.test(tag)) || "";
}

function productLabel(product: Product) {
  return product.name.zh || "日本天然貓咪鮮食";
}

export function CatFreshFoodGuide({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<GuideFilter>("all");
  const guideProducts = useMemo(() => {
    const bySku = new Map(products.map((product) => [getSku(product), product]));
    return GUIDE_SKUS.map((sku) => bySku.get(sku)).filter(Boolean) as Product[];
  }, [products]);
  const visibleProducts = guideProducts.filter((product) => activeFilter === "all" || PRODUCT_META[getSku(product)]?.filter === activeFilter);
  const heroProduct = guideProducts.find((product) => getSku(product) === "4976064024725") || guideProducts[0];

  return (
    <main className="overflow-hidden pb-16">
      <section className="relative isolate px-4 pb-10 pt-5 sm:px-6 sm:pb-16 sm:pt-10 lg:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-7 overflow-hidden rounded-[2rem] bg-[#ead8c7] px-5 py-7 shadow-[0_24px_65px_-42px_rgba(80,52,35,0.65)] sm:px-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-14">
          <div className="relative z-10">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fffaf4]/75 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-[#76513c]">CAT NATURAL FOOD GUIDE <span aria-hidden>✦</span></p>
            <h1 className="max-w-xl text-[2.2rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[#3d2d25] sm:text-5xl lg:text-6xl">貓咪專屬的<br />日系和風鮮食盛宴</h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#6c5548] sm:text-lg">100% 日本國產・食鹽不使用・解決挑食與飲水難題</p>
            <a href="#products" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#694938] px-6 text-sm font-semibold text-white shadow-lg shadow-[#694938]/15 transition hover:-translate-y-0.5 hover:bg-[#54382c] active:scale-[0.98]">探索 7 款貓用鮮食 <span className="ml-2" aria-hidden>↓</span></a>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-[#76513c]"><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">日本國產</span><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">無添加</span><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">低鈉／無鹽</span></div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-[1.6rem] bg-[#f8eee4] shadow-[0_18px_40px_-28px_rgba(55,36,25,0.65)]">
            {heroProduct ? <ProductImage src={heroProduct.image} alt={productLabel(heroProduct)} priority sizes="(min-width: 1024px) 42vw, 92vw" className="object-contain p-5 mix-blend-multiply" /> : <div className="flex h-full items-center justify-center text-6xl" aria-hidden>🐈</div>}
            <div className="absolute bottom-4 left-4 rounded-2xl bg-[#fffaf4]/90 px-3.5 py-2 text-xs font-semibold text-[#694938] shadow-sm">100% 日本原裝鮮味</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10"><div className="rounded-[1.75rem] border border-[#eaded5] bg-[#fffaf4] p-5 shadow-[0_18px_40px_-36px_rgba(58,38,26,0.8)] sm:p-8"><div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">貓奴避坑小教室</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">不是所有魚乾，都適合每日餵</h2></div><p className="max-w-sm text-sm leading-6 text-[#806d62]">選擇為貓咪設計的低鈉鮮食，安心補水，也守護日常腎臟負擔。</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f5e9e4] p-5"><p className="text-2xl" aria-hidden>❌</p><h3 className="mt-3 text-lg font-semibold text-[#68473a]">人類小魚乾／常規柴魚</h3><p className="mt-2 text-sm leading-7 text-[#856b5e]">往往鹽分偏高，貓咪長期攝取可能增加腎臟與泌尿系統負擔。</p></div><div className="rounded-2xl bg-[#e8eedf] p-5"><p className="text-2xl" aria-hidden>✔️</p><h3 className="mt-3 text-lg font-semibold text-[#466044]">BestPartner 貓咪鮮食</h3><p className="mt-2 text-sm leading-7 text-[#61705d]">淡水熟成、食鹽不使用；另有減鹽約 1% 選擇，保留鮮味之餘更貼近貓咪需要。</p></div></div></div></section>

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10"><div className="mb-6 max-w-2xl"><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">4 WAYS TO FEED</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">4 大神仙吃法，餐餐都有新鮮感</h2><p className="mt-3 text-sm leading-7 text-[#806d62]">按主子的口味、年齡與咀嚼能力，自由配搭最適合的餵食情境。</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{EATING_METHODS.map((method) => <article key={method.title} className={`rounded-[1.4rem] ${method.accent} p-5 transition hover:-translate-y-1`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fffaf4]/80 text-2xl" aria-hidden>{method.icon}</div><h3 className="mt-5 text-lg font-semibold leading-snug text-[#45342b]">{method.title}</h3><p className="mt-2 text-sm leading-7 text-[#705b4e]">{method.body}</p></article>)}</div></section>

      <section id="products" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-20 lg:px-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">7 BEST PARTNER PICKS</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">7 款產品選購矩陣</h2></div><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">{FILTERS.map((filter) => <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] ${activeFilter === filter.id ? "border-[#694938] bg-[#694938] text-white" : "border-[#eaded5] bg-[#fffaf4] text-[#725a4c] hover:border-[#b98b6e]"}`}><span aria-hidden>{filter.icon}</span> {filter.label}</button>)}</div></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product, index) => { const sku = getSku(product); const meta = PRODUCT_META[sku]; return <article key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-[#eaded5] bg-[#fffaf4] shadow-[0_18px_42px_-34px_rgba(57,37,26,0.75)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-34px_rgba(57,37,26,0.72)]"><Link href={`/product/${product.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#694938] focus-visible:ring-offset-2"><div className="relative aspect-square overflow-hidden bg-[#f7eee7]"><ProductImage src={product.image} alt={productLabel(product)} priority={index < 2} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="object-contain p-5 transition duration-300 group-hover:scale-[1.035]" /><span className="absolute left-3 top-3 rounded-full bg-[#fffaf4]/90 px-2.5 py-1 text-[11px] font-semibold text-[#694938] shadow-sm">日本國產</span></div><div className="p-5"><p className="text-xs font-medium text-[#a06b4e]">{meta?.method || "日本原裝・天然肉食"}</p><h3 className="mt-2 min-h-[3.5rem] text-lg font-semibold leading-7 text-[#3d2d25]">{productLabel(product)}</h3><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs text-[#8b7467]">軟硬度</p><p className="mt-1 text-sm tracking-[0.12em] text-[#a06b4e]" aria-label={`軟硬度 ${meta?.texture || "未提供"}`}>{meta?.texture || "★☆☆☆☆"}</p></div><p className="text-lg font-semibold text-[#694938]">HK${product.price.toFixed(0)}</p></div><span className="mt-5 inline-flex items-center text-sm font-semibold text-[#694938]">查看產品詳情 <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>→</span></span></div></Link></article>; })}</div>{!visibleProducts.length ? <p className="rounded-2xl bg-[#fffaf4] p-8 text-center text-sm text-[#806d62]">暫時未找到相符產品，請重新選擇分類。</p> : null}</section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-10"><div className="rounded-[1.8rem] bg-[#694938] px-5 py-8 text-white sm:px-10 sm:py-10"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.16em] text-[#e8c6a8]">MOFU HAVEN PROMISE</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">毛拔麻安心承諾</h2><p className="mt-3 text-sm leading-7 text-[#f4e4d7]">每一款都由日本原廠製造，讓你為主子挑選時更簡單、更放心。</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["🇯🇵 100% 日本原產", "🌿 0 人工防腐劑", "🥩 單一純肉食材", "📦 保鮮夾鏈包裝"].map((promise) => <div key={promise} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-medium text-[#fff8f1]">{promise}</div>)}</div></div></section>
    </main>
  );
}
