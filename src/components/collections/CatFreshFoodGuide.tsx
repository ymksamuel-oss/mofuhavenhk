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
  "4976064024725": { filter: "fish", texture: "★★★☆☆", method: "\u6eab\u6c34\u6ce1\u767c・\u6574\u689d\u624b\u9935" },
  "4976064013897": { filter: "fish", texture: "★☆☆☆☆", method: "\u63c9\u788e\u62cc\u7ce7・\u6eab\u6c34\u9bae\u6e6f" },
  "4976064024688": { filter: "fish", texture: "★☆☆☆☆", method: "\u6eab\u6c34\u6ce1\u767c・\u62cc\u5165\u4e3b\u98df" },
  "4976064015747": { filter: "chicken", texture: "★☆☆☆☆", method: "\u96ea\u82b1\u62cc\u7ce7・\u624b\u9935\u4e92\u52d5" },
  "4976064024336": { filter: "chicken", texture: "★★☆☆☆", method: "\u6df1\u5c64\u6df7\u7ce7・\u6fd5\u7ce7\u589e\u9999" },
  "4976064025500": { filter: "chew", texture: "★★★★☆", method: "\u624b\u6301\u6495\u54ac\u62d4\u6cb3" },
  "4976064024718": { filter: "chew", texture: "★★★☆☆", method: "3cm \u4e00\u53e3\u514d\u526a" },
};

const FILTERS: Array<{ id: GuideFilter; label: string; icon: string }> = [
  { id: "all", label: "\u5168\u90e8\u9bae\u98df", icon: "✦" },
  { id: "fish", label: "\u9bae\u9b5a\u88dc\u9223・\u9a19\u6c34", icon: "🐟" },
  { id: "chicken", label: "\u96de\u8089\u8a98\u98df・\u62cc\u7ce7", icon: "🍗" },
  { id: "chew", label: "\u54ac\u54ac\u78e8\u7259", icon: "🐾" },
];

const EATING_METHODS = [
  { icon: "🍲", title: "\u795e\u7d1a\u6eab\u6c34\u9a19\u6c34\u6cd5", body: "\u6eab\u6c34\u6ce1\u767c\u91cb\u653e\u6d77\u9b5a\u9999\u6c23，\u79d2\u8b8a\u9bae\u751c\u9ad8\u6e6f，\u5f15\u5c0e\u4e3b\u5b50\u4e3b\u52d5\u88dc\u6c34。", accent: "bg-[#ead8c7]" },
  { icon: "🥣", title: "\u634f\u788e／\u96ea\u82b1\u62cc\u7ce7\u6cd5", body: "\u8089\u788e\u8207\u8584\u82b1\u7dca\u6263\u98fc\u6599\u7e2b\u9699，\u675c\u7d55\u53ea\u8214\u9802\u5c64\u8089\u7247，\u6311\u98df\u8c93\u90fd\u80fd\u79d2\u6e05\u7897。", accent: "bg-[#e2e6d3]" },
  { icon: "🐾", title: "\u624b\u6301\u6495\u54ac\u62d4\u6cb3", body: "\u4fdd\u7559\u539f\u8089\u9577\u689d\u7e96\u7dad，\u624b\u9935\u4e92\u52d5\u589e\u9032\u611f\u60c5，\u540c\u6642\u935b\u934a\u81ea\u7136\u54ac\u5408\u529b。", accent: "bg-[#e8d9dc]" },
  { icon: "✂️", title: "3cm \u4e00\u53e3\u514d\u526a\u9632\u564e", body: "\u9810\u5148\u88c1\u526a\u6210\u4e00\u53e3\u4e00\u7c92，\u514d\u52d5\u526a\u5200，\u5e7c\u8c93\u8207\u9ad8\u9f61\u8c93\u90fd\u80fd\u5b89\u5fc3\u4eab\u7528。", accent: "bg-[#e5ddc8]" },
];

function getSku(product: Product) {
  return product.metadata?.mofu_sku || product.tags?.find((tag) => /^\d{13}$/.test(tag)) || "";
}

function productLabel(product: Product) {
  return product.name.zh || "\u65e5\u672c\u5929\u7136\u8c93\u54aa\u9bae\u98df";
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
            <h1 className="max-w-xl text-[2.2rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[#3d2d25] sm:text-5xl lg:text-6xl">\u8c93\u54aa\u5c08\u5c6c\u7684<br />\u65e5\u7cfb\u548c\u98a8\u9bae\u98df\u76db\u5bb4</h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#6c5548] sm:text-lg">100% \u65e5\u672c\u570b\u7522・\u98df\u9e7d\u4e0d\u4f7f\u7528・\u89e3\u6c7a\u6311\u98df\u8207\u98f2\u6c34\u96e3\u984c</p>
            <a href="#products" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#694938] px-6 text-sm font-semibold text-white shadow-lg shadow-[#694938]/15 transition hover:-translate-y-0.5 hover:bg-[#54382c] active:scale-[0.98]">\u63a2\u7d22 7 \u6b3e\u8c93\u7528\u9bae\u98df <span className="ml-2" aria-hidden>↓</span></a>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-[#76513c]"><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">\u65e5\u672c\u570b\u7522</span><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">\u7121\u6dfb\u52a0</span><span className="rounded-full bg-[#fffaf4]/70 px-3 py-1.5">\u4f4e\u9209／\u7121\u9e7d</span></div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-[1.6rem] bg-[#f8eee4] shadow-[0_18px_40px_-28px_rgba(55,36,25,0.65)]">
            {heroProduct ? <ProductImage src={heroProduct.image} alt={productLabel(heroProduct)} priority sizes="(min-width: 1024px) 42vw, 92vw" className="object-contain p-5 mix-blend-multiply" /> : <div className="flex h-full items-center justify-center text-6xl" aria-hidden>🐈</div>}
            <div className="absolute bottom-4 left-4 rounded-2xl bg-[#fffaf4]/90 px-3.5 py-2 text-xs font-semibold text-[#694938] shadow-sm">100% \u65e5\u672c\u539f\u88dd\u9bae\u5473</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10"><div className="rounded-[1.75rem] border border-[#eaded5] bg-[#fffaf4] p-5 shadow-[0_18px_40px_-36px_rgba(58,38,26,0.8)] sm:p-8"><div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">\u8c93\u5974\u907f\u5751\u5c0f\u6559\u5ba4</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">\u4e0d\u662f\u6240\u6709\u9b5a\u4e7e，\u90fd\u9069\u5408\u6bcf\u65e5\u9935</h2></div><p className="max-w-sm text-sm leading-6 text-[#806d62]">\u9078\u64c7\u70ba\u8c93\u54aa\u8a2d\u8a08\u7684\u4f4e\u9209\u9bae\u98df，\u5b89\u5fc3\u88dc\u6c34，\u4e5f\u5b88\u8b77\u65e5\u5e38\u814e\u81df\u8ca0\u64d4。</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f5e9e4] p-5"><p className="text-2xl" aria-hidden>❌</p><h3 className="mt-3 text-lg font-semibold text-[#68473a]">\u4eba\u985e\u5c0f\u9b5a\u4e7e／\u5e38\u898f\u67f4\u9b5a</h3><p className="mt-2 text-sm leading-7 text-[#856b5e]">\u5f80\u5f80\u9e7d\u5206\u504f\u9ad8，\u8c93\u54aa\u9577\u671f\u651d\u53d6\u53ef\u80fd\u589e\u52a0\u814e\u81df\u8207\u6ccc\u5c3f\u7cfb\u7d71\u8ca0\u64d4。</p></div><div className="rounded-2xl bg-[#e8eedf] p-5"><p className="text-2xl" aria-hidden>✔️</p><h3 className="mt-3 text-lg font-semibold text-[#466044]">BestPartner \u8c93\u54aa\u9bae\u98df</h3><p className="mt-2 text-sm leading-7 text-[#61705d]">\u6de1\u6c34\u719f\u6210、\u98df\u9e7d\u4e0d\u4f7f\u7528；\u53e6\u6709\u6e1b\u9e7d\u7d04 1% \u9078\u64c7，\u4fdd\u7559\u9bae\u5473\u4e4b\u9918\u66f4\u8cbc\u8fd1\u8c93\u54aa\u9700\u8981。</p></div></div></div></section>

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-10"><div className="mb-6 max-w-2xl"><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">4 WAYS TO FEED</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">4 \u5927\u795e\u4ed9\u5403\u6cd5，\u9910\u9910\u90fd\u6709\u65b0\u9bae\u611f</h2><p className="mt-3 text-sm leading-7 text-[#806d62]">\u6309\u4e3b\u5b50\u7684\u53e3\u5473、\u5e74\u9f61\u8207\u5480\u56bc\u80fd\u529b，\u81ea\u7531\u914d\u642d\u6700\u9069\u5408\u7684\u9935\u98df\u60c5\u5883。</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{EATING_METHODS.map((method) => <article key={method.title} className={`rounded-[1.4rem] ${method.accent} p-5 transition hover:-translate-y-1`}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fffaf4]/80 text-2xl" aria-hidden>{method.icon}</div><h3 className="mt-5 text-lg font-semibold leading-snug text-[#45342b]">{method.title}</h3><p className="mt-2 text-sm leading-7 text-[#705b4e]">{method.body}</p></article>)}</div></section>

      <section id="products" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-20 lg:px-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.16em] text-[#a06b4e]">7 BEST PARTNER PICKS</p><h2 className="mt-2 text-2xl font-semibold text-[#3d2d25] sm:text-3xl">7 \u6b3e\u7522\u54c1\u9078\u8cfc\u77e9\u9663</h2></div><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">{FILTERS.map((filter) => <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] ${activeFilter === filter.id ? "border-[#694938] bg-[#694938] text-white" : "border-[#eaded5] bg-[#fffaf4] text-[#725a4c] hover:border-[#b98b6e]"}`}><span aria-hidden>{filter.icon}</span> {filter.label}</button>)}</div></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product, index) => { const sku = getSku(product); const meta = PRODUCT_META[sku]; return <article key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-[#eaded5] bg-[#fffaf4] shadow-[0_18px_42px_-34px_rgba(57,37,26,0.75)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-34px_rgba(57,37,26,0.72)]"><Link href={`/product/${product.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#694938] focus-visible:ring-offset-2"><div className="relative aspect-square overflow-hidden rounded-t-2xl border-b border-[#ECE5D8] bg-[#FAF7F2] p-3 sm:p-4"><ProductImage src={product.image} alt={productLabel(product)} priority={index < 2} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="object-contain mix-blend-multiply p-2 transition duration-300 group-hover:scale-[1.035]" /><span className="absolute left-3 top-3 rounded-full bg-[#fffaf4]/90 px-2.5 py-1 text-[11px] font-semibold text-[#694938] shadow-sm">\u65e5\u672c\u570b\u7522</span></div><div className="p-5"><p className="text-xs font-medium text-[#a06b4e]">{meta?.method || "\u65e5\u672c\u539f\u88dd・\u5929\u7136\u8089\u98df"}</p><h3 className="mt-2 min-h-[3.5rem] text-lg font-semibold leading-7 text-[#3d2d25]">{productLabel(product)}</h3><div className="mt-4"><p className="text-xs text-[#8b7467]">\u8edf\u786c\u5ea6</p><p className="mt-1 text-sm tracking-[0.12em] text-[#a06b4e]" aria-label={`\u8edf\u786c\u5ea6 ${meta?.texture || "\u672a\u63d0\u4f9b"}`}>{meta?.texture || "★☆☆☆☆"}</p></div><span className="mt-5 inline-flex items-center text-sm font-semibold text-[#694938]">\u67e5\u770b\u7522\u54c1\u8a73\u60c5 <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>→</span></span></div></Link></article>; })}</div>{!visibleProducts.length ? <p className="rounded-2xl bg-[#fffaf4] p-8 text-center text-sm text-[#806d62]">\u66ab\u6642\u672a\u627e\u5230\u76f8\u7b26\u7522\u54c1，\u8acb\u91cd\u65b0\u9078\u64c7\u5206\u985e。</p> : null}</section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-10"><div className="rounded-[1.8rem] bg-[#694938] px-5 py-8 text-white sm:px-10 sm:py-10"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.16em] text-[#e8c6a8]">MOFU HAVEN PROMISE</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">\u6bdb\u62d4\u9ebb\u5b89\u5fc3\u627f\u8afe</h2><p className="mt-3 text-sm leading-7 text-[#f4e4d7]">\u6bcf\u4e00\u6b3e\u90fd\u7531\u65e5\u672c\u539f\u5ee0\u88fd\u9020，\u8b93\u4f60\u70ba\u4e3b\u5b50\u6311\u9078\u6642\u66f4\u7c21\u55ae、\u66f4\u653e\u5fc3。</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["🇯🇵 100% \u65e5\u672c\u539f\u7522", "🌿 0 \u4eba\u5de5\u9632\u8150\u5291", "🥩 \u55ae\u4e00\u7d14\u8089\u98df\u6750", "📦 \u4fdd\u9bae\u593e\u93c8\u5305\u88dd"].map((promise) => <div key={promise} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-medium text-[#fff8f1]">{promise}</div>)}</div></div></section>
    </main>
  );
}
