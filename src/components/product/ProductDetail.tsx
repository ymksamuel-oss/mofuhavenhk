"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { ProductImage } from "@/components/product/ProductImage";
import { OutOfStockOrderButton } from "@/components/product/OutOfStockOrderButton";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { calcSubtotal, isPetBundleProduct, PET_BUNDLE_QUANTITIES } from "@/lib/order";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/shop/cart";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { trackMetaEvent } from "@/components/MetaPixel";

type ProductDetailProps = { product: Product };
type RichContent = { highlights: string[]; spotlight: string; texture: string; feeding: string[]; nutrition: string[]; notes: string[] };

const DEFAULT_FEEDING = [
  "🍲 溫水泡發騙水法｜加入少量暖水，釋放鮮魚香氣，變成天然高湯。",
  "🥣 雪花拌糧法｜捏碎薄片拌入主糧，香味緊扣每一粒飼料。",
  "🐾 手持撕咬拔河｜保留原肉纖維，手餵互動增進感情。",
  "✂️ 3cm 一口免剪｜預先分成一口大小，幼貓老貓更安心。",
];

function parseDescription(text: string, product: Product): RichContent {
  const blocks = text.split(/(?=【[^】]+】|\n##?\s)/g).map((item) => item.trim()).filter(Boolean);
  const find = (names: string[]) => blocks.find((block) => names.some((name) => block.includes(name))) ?? "";
  const body = (value: string) => value.replace(/^【[^】]+】|^##?\s[^\n]+/m, "").trim();
  const lines = (value: string) => body(value).split("\n").map((line) => line.trim()).filter((line) => line.length > 2);
  const features = lines(find(["核心亮點", "商品特色", "Highlights", "Features"]));
  const feeding = lines(find(["4 大花式餵食法", "4大花式餵食法", "餵食方法", "Feeding"]));
  const nutrition = lines(find(["規格與保證營養", "保證營養", "營養", "Nutrition"]));
  const notes = lines(find(["貼心叮嚀", "注意事項", "保存方法", "Notes"]));
  return {
    highlights: (features.length ? features : product.specs?.map((spec) => spec.zh) ?? []).slice(0, 5),
    spotlight: body(find(["商品重點", "購買理由", "Key point"])) || "日本原裝 BestPartner 天然純肉，無添加、無著色，為毛孩準備一口安心的日系鮮味。",
    texture: body(find(["口感與食感", "食感與硬度", "Texture"])) || product.texture?.zh || "★★★☆☆ 酥脆乾爽・咔嚓作響；餵食前可按需要分成一口大小。",
    feeding: (feeding.length ? feeding : DEFAULT_FEEDING).slice(0, 4),
    nutrition: nutrition.slice(0, 8),
    notes: (notes.length ? notes : ["急吞貓請先剪成一口大小並由主人陪同餵食。", "特殊腎臟或泌尿道需要的貓咪，請先諮詢獸醫。", "開封後請夾緊封口，放置陰涼乾燥處保存。\n"]).slice(0, 5),
  };
}

function RichProductContent({ product, locale, sku, firstImage }: { product: Product; locale: "zh" | "en" | "ja"; sku: string; firstImage: string }) {
  const [tab, setTab] = useState<"details" | "notes">("details");
  const [open, setOpen] = useState(true);
  const text = product.description?.[locale] || product.description?.zh || "";
  const rich = useMemo(() => parseDescription(text, product), [text, product]);
  const nutrition = rich.nutrition.length ? rich.nutrition : [
    `產地：${product.metadata?.country_of_origin_zh || "日本"}`,
    `淨重：${product.metadata?.weight_zh || "以包裝標示為準"}`,
    `原材料：${product.metadata?.ingredients_zh || "天然單一肉源／魚介"}`,
    `粗蛋白：${product.metadata?.protein_zh || "以包裝標示為準"}`,
    `粗脂肪：${product.metadata?.fat_zh || "以包裝標示為準"}`,
    `條碼：${sku}`,
  ];
  return <div className="mt-8 space-y-5">
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"><span className="font-bold">✨ 商品特色</span><span className="text-xl text-stone-400" aria-hidden>{open ? "−" : "+"}</span></button>
      {open ? <div className="border-t border-stone-100 px-4 pb-5 pt-4 sm:px-5"><p className="text-xs font-semibold tracking-wide text-stone-400">商品編號：{sku}</p><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{rich.highlights.map((item, index) => <li key={`${item}-${index}`}>{/^[🐟🚫🦴✨🍲🥣🐾✂️✔️❌]/.test(item) ? item : `✨ ${item}`}</li>)}</ul><div className="mt-4 rounded-xl bg-[#fbf3df] p-4"><p className="font-bold">🐱 {rich.spotlight.split("\n")[0]}</p><p className="mt-2 text-sm leading-6 text-stone-600">{rich.spotlight.split("\n").slice(1).join(" ") || "日常拌糧、獎勵或互動餵食都適合，讓每一餐多一點天然香氣。"}</p></div></div> : null}
    </section>
    <div className="flex rounded-xl bg-stone-100 p-1" role="tablist" aria-label="商品內容分頁"><button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "details" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>詳細說明</button><button type="button" role="tab" aria-selected={tab === "notes"} onClick={() => setTab("notes")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "notes" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>商品推薦／購物須知</button></div>
    {tab === "details" ? <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-stone-100 bg-white p-3 shadow-sm sm:p-4"><span className="absolute right-5 top-5 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">🇯🇵 日本原裝・無添加</span><div className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f0e9]"><ProductImage src={firstImage} alt={product.name.zh} sizes="(min-width: 1024px) 700px, 100vw" priority className="object-contain p-3" /></div></section>
      <section className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="font-bold text-red-800">❌ 人食小魚乾（重鹽傷腎）</p><p className="mt-2 text-sm leading-6 text-red-700">調味及鈉含量較高，不適合直接當作貓咪日常零食。</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="font-bold text-emerald-800">✔️ BestPartner</p><p className="mt-2 text-sm leading-6 text-emerald-700">淡水熟成・食鹽不使用，專為毛孩設計的純淨鮮味。</p></div></section>
      <section className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">🐾 食感與硬度</h2><span className="text-amber-600">★★★☆☆</span></div><p className="mt-2 text-sm leading-6 text-stone-600">{rich.texture}</p></section>
      <section><h2 className="mb-3 text-lg font-bold">🍽️ 4 大神仙吃法</h2><div className="grid gap-3 sm:grid-cols-2">{rich.feeding.map((item, index) => <article key={`${item}-${index}`} className="rounded-2xl border border-stone-200 bg-[#fffdf9] p-4"><p className="text-sm font-bold leading-6">{item}</p><p className="mt-2 text-xs leading-5 text-stone-500">小訣竅：{index === 0 ? "先用暖水浸出香氣，再連湯奉上。" : index === 1 ? "捏成雪花狀，均勻撒在主糧表面。" : index === 2 ? "手餵時保持短時間互動，避免急吞。" : "幼貓及老貓建議先分小塊。"}</p></article>)}</div></section>
      <section className="rounded-2xl border border-stone-200 bg-white p-4"><h2 className="font-bold">📋 保證營養與規格</h2><dl className="mt-3 divide-y divide-stone-100 text-sm">{nutrition.map((row, index) => { const [key, ...rest] = row.split("："); return <div key={`${row}-${index}`} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5"><dt className="font-semibold text-stone-500">{key}</dt><dd>{rest.join("：") || row}</dd></div>; })}</dl></section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-bold text-amber-900">💛 毛拔麻貼心叮嚀</h2><ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900/80">{rich.notes.map((note, index) => <li key={`${note}-${index}`}>・{note}</li>)}</ul></section>
    </div> : <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-bold">🛍️ 購物須知</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600"><li>📦 香港現貨一般於下單後 1–2 個工作天內由順豐寄出。</li><li>✈️ 日本預訂／直送商品約需 7–14 個工作天，遇日本節假日或會順延。</li><li>🧺 同單含現貨與預訂品將一併發貨；全單滿 HK$450 享本地順豐免運。</li><li>💬 如需為幼貓、老貓或敏感體質選擇食材，歡迎聯絡我們。</li></ul></section>}
  </div>;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { locale, t } = useI18n();
  const { toOrderItems } = useCart();
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const selectedOption = product.variants?.[selectedSpecIndex] ?? product.variants?.[0];
  const selectedPrice = selectedOption?.price ?? product.price;
  const selectedPriceId = selectedOption?.priceId ?? product.priceId;
  const selectedOriginalPrice = selectedOption?.originalPrice ?? product.originalPrice;
  const name = getLocalizedProductName(product, locale) || t("productDescriptionUnavailable");
  const category = getCategoryBySlug(product.categorySlug);
  const sku = product.metadata?.mofu_sku?.trim() || product.id;
  const firstImage = selectedOption?.image || product.images?.[0] || product.image;
  const cartSubtotal = calcSubtotal(toOrderItems());
  const isFood = isPetBundleProduct(product) || /(food|treat|snack|零食|小食|食品|肉乾|肉條|魚介|鮮肉|原肉)/i.test(JSON.stringify(product));
  const quantityOptions = isFood ? PET_BUNDLE_QUANTITIES : undefined;
  const discountPercent = selectedOriginalPrice ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100) : null;
  useEffect(() => { trackMetaEvent("ViewContent", { content_type: "product", content_ids: [product.id], content_name: product.name.zh || product.name.en, value: product.price, currency: "HKD" }); }, [product.id, product.name.en, product.name.zh, product.price]);
  return <div className="min-h-screen bg-[#faf7f2] text-stone-800"><main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6 sm:pb-16 sm:pt-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-500"><CategoryNavLink href="/menu" className="font-medium hover:text-stone-800">{t("menuTitle")}</CategoryNavLink><span>/</span>{category ? <><CategoryNavLink href={categoryHref(category.slug)} className="font-medium hover:text-stone-800">{t(category.labelKey)}</CategoryNavLink><span>/</span></> : null}<span className="truncate text-stone-700">{name}</span></div><div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative"><ProductGallery key={`${product.id}-${selectedPriceId}`} images={selectedOption?.image ? [selectedOption.image] : product.images} fallbackImage={firstImage} alt={name} priority />{discountPercent ? <span className="absolute left-4 top-4 z-10 rounded-full bg-[#b84d3d] px-3 py-1 text-xs font-bold text-white shadow">-{discountPercent}%</span> : null}</div><section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><p className="text-xs font-semibold tracking-wide text-stone-400">SKU：{sku}</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">{name}</h1><div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-4xl font-extrabold tabular-nums text-[#8b573f]">{formatMoney(selectedPrice, locale)}</span>{selectedOriginalPrice ? <span className="text-base text-stone-400 line-through">{formatMoney(selectedOriginalPrice, locale)}</span> : null}</div>{discountPercent ? <p className="mt-1 text-sm font-semibold text-[#b84d3d]">{t("productDiscountBadge")}</p> : null}<MarketReferencePrice price={product.marketReferencePrice} asOf={product.marketReferenceAsOf} className="mt-2" /><FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />{product.variants?.length ? <div className="mt-5"><p className="text-sm font-bold">{product.metadata?.variant_selection_label_zh || t("productSpecSelectorTitle")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{product.variants.map((variant, index) => <button key={variant.key} type="button" onClick={() => setSelectedSpecIndex(index)} className={`rounded-xl border p-3 text-left text-sm ${selectedSpecIndex === index ? "border-[#8b573f] bg-[#f7eee7]" : "border-stone-200 bg-white"}`}><span className="block font-semibold">{variant.label[locale] || variant.label.zh}</span><span className="mt-1 block text-xs text-stone-500">{formatMoney(variant.price, locale)}{variant.unitLabel?.[locale] ? ` · ${variant.unitLabel[locale]}` : ""}</span></button>)}</div></div> : null}{product.inStock !== false ? <div className="mt-6"><p className="mb-2 text-sm font-bold">{t("productPurchaseQuantity")}</p><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" quantityOptions={quantityOptions} quantity={selectedQty} onQuantityChange={setSelectedQty} showBulkShortcuts showTotal unitPrice={selectedPrice} className="[&>button:last-child]:rounded-xl [&>button:last-child]:py-3.5" /></div> : <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="font-bold">{t("productSoldOut")}</p><p className="mt-1 text-sm text-stone-600">{t("productOutOfStockMessage")}</p><OutOfStockOrderButton productId={product.id} productName={product.name} mofuSku={sku} className="mt-3" /></div>}</section></div><RichProductContent product={product} locale={locale} sku={sku} firstImage={firstImage} /><FAQAccordion /><ProductFAQ /></main><div className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-between gap-3 border-t border-stone-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md sm:hidden"><div className="flex min-w-0 flex-1 items-center gap-2.5"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-[#f5f0e9]"><ProductImage src={firstImage} alt={name} sizes="44px" className="object-contain p-1" /></div><div className="flex min-w-0 flex-1 flex-col justify-center"><p className="truncate text-xs font-normal text-stone-600">{name}</p><p className="text-sm font-bold text-stone-900">{formatMoney(selectedPrice, locale)}</p></div></div><div className="shrink-0"><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" showQuantity={false} quantity={selectedQty} unitPrice={selectedPrice} className="!mt-0 !gap-0 !flex-none [&>button:last-child]:!h-10 [&>button:last-child]:!w-auto [&>button:last-child]:!min-w-[8rem] [&>button:last-child]:!shrink-0 [&>button:last-child]:!rounded-full [&>button:last-child]:!bg-stone-900 [&>button:last-child]:!px-5 [&>button:last-child]:!py-0 [&>button:last-child]:!text-sm [&>button:last-child]:!font-medium [&>button:last-child]:!whitespace-nowrap [&>button:last-child]:shadow-sm [&>button:last-child]:hover:!bg-stone-800 [&>button:last-child]:active:!scale-95" /></div></div></div>;
}
