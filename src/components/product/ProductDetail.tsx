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
import { YouMayAlsoLike } from "@/components/recommendations/YouMayAlsoLike";
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

function parseDescription(text: string, product: Product): RichContent {
  const blocks = text.split(/(?=【[^】]+】|\n##?\s)/g).map((item) => item.trim()).filter(Boolean);
  const find = (names: string[]) => blocks.find((block) => names.some((name) => block.includes(name))) ?? "";
  const body = (value: string) => value.replace(/^【[^】]+】|^##?\s[^\n]+/m, "").trim();
  const lines = (value: string) => body(value).split("\n").map((line) => line.trim()).filter((line) => line.length > 2);
  const features = lines(find(["Product Features", "Highlights", "Features"]));
  const feeding = lines(find(["Feeding Instructions", "Feeding"]));
  const nutrition = lines(find(["Nutrition & Specifications", "Nutrition", "Specifications"]));
  const notes = lines(find(["Shopping Notes", "Notes"]));
  const dynamicParagraphs = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 8 && !/^【[^】]+】/.test(line) && !/^##?\s/.test(line));
  return {
    highlights: (features.length ? features : product.specs?.map((spec) => spec.en || spec.zh) ?? []).slice(0, 5),
    spotlight: body(find(["\u5546\u54c1\u91cd\u9ede", "\u8cfc\u8cb7\u7406\u7531", "Key point"])),
    texture: body(find(["Texture", "Texture & Hardness"])) || product.texture?.en || "",
    feeding: (feeding.length ? feeding : dynamicParagraphs).slice(0, 4),
    nutrition: nutrition.slice(0, 8),
    notes: notes.slice(0, 5),
  };
}

function ProfessionalMetrics({ product, locale }: { product: Product; locale: "zh" | "en" | "ja" }) {
  const isZh = locale === "zh";
  const text = `${product.categorySlug} ${product.name.en} ${product.name.zh}`.toLowerCase();
  const isCat = /cat|\u8c93/.test(text);
  const isChew = /dental|chew|bone|tendon|\u725b\u8e44|\u725b\u7b4b|\u8010\u54ac/.test(text);
  const metrics = [
    { icon: "🇯🇵", label: isZh ? "產地" : "Origin", value: isZh ? "日本國產・愛知縣" : "Japan・Aichi" },
    { icon: "★", label: isZh ? "耐咬等級" : "Chew Level", value: isChew ? "★★★★☆" : "★★★☆☆" },
    { icon: "🐾", label: isZh ? "適用對象" : "Suitable for", value: isCat ? (isZh ? "貓咪" : "Cats") : (isZh ? "全年齡犬・挑食毛孩" : "All-age dogs・Picky eaters") },
    { icon: "🌿", label: isZh ? "配方特性" : "Key Benefits", value: isZh ? "低溫烘乾・高蛋白・低脂肪" : "Low-temperature dried・High protein・Low fat" },
  ];
  return <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4 sm:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="rounded-xl bg-[#FAF7F2] px-2.5 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400"><span aria-hidden>{metric.icon}</span> {metric.label}</p><p className="mt-1 text-xs font-semibold leading-4 text-stone-700">{metric.value}</p></div>)}</div>;
}

function RichProductContent({ product, sku, firstImage }: { product: Product; sku: string; firstImage: string }) {
  const [tab, setTab] = useState<"details" | "notes">("details");
  const text = product.description?.en || "";
  const rich = useMemo(() => parseDescription(text, product), [text, product]);
  const nutrition = rich.nutrition.length ? rich.nutrition : [
    `Country of origin: ${product.metadata?.country_of_origin_en || "Japan"}`,
    `Net weight: ${product.metadata?.weight_en || "See package label"}`,
    `Ingredients: ${product.metadata?.ingredients_en || "See package label"}`,
    `Crude protein: ${product.metadata?.protein_en || "See package label"}`,
    `Crude fat: ${product.metadata?.fat_en || "See package label"}`,
    `Barcode: ${sku}`,
  ];
  return <div className="mt-8 space-y-5">
    <YouMayAlsoLike cartProductIds={[product.id]} />
    <div className="flex rounded-xl bg-stone-100 p-1" role="tablist" aria-label="Product content tabs"><button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "details" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>Details</button><button type="button" role="tab" aria-selected={tab === "notes"} onClick={() => setTab("notes")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "notes" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>Shopping notes</button></div>
    {tab === "details" ? <div className="space-y-5">
      <p className="px-1 text-xs text-stone-400">Product code: {sku}</p>
      <section className="relative overflow-hidden rounded-2xl border border-stone-100 bg-white p-3 shadow-sm sm:p-4"><span className="absolute right-5 top-5 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">🇯🇵 Made in Japan・Additive-Free</span><div className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f0e9]"><ProductImage src={firstImage} alt={product.name.zh} sizes="(min-width: 1024px) 700px, 100vw" priority className="object-contain p-3" /></div></section>
      {rich.texture ? <section className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">🐾 Texture & hardness</h2></div><p className="mt-2 text-sm leading-6 text-stone-600">{rich.texture}</p></section> : null}
      {rich.feeding.length ? <section><h2 className="mb-3 text-lg font-bold">🍽️ Feeding instructions</h2><div className="grid gap-3 sm:grid-cols-2">{rich.feeding.map((item, index) => <article key={`${item}-${index}`} className="rounded-2xl border border-stone-200 bg-[#fffdf9] p-4"><p className="text-sm font-bold leading-6">{item}</p></article>)}</div></section> : null}
      <section className="rounded-2xl border border-stone-200 bg-white p-4"><h2 className="font-bold">📋 Nutrition & Specifications</h2><dl className="mt-3 divide-y divide-stone-100 text-sm">{nutrition.map((row, index) => { const [key, ...rest] = row.split(":"); return <div key={`${row}-${index}`} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5"><dt className="font-semibold text-stone-500">{key}</dt><dd>{rest.join(":") || row}</dd></div>; })}</dl></section>
      {rich.notes.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-bold text-amber-900">💛 Helpful notes</h2><ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900/80">{rich.notes.map((note, index) => <li key={`${note}-${index}`}>・{note}</li>)}</ul></section> : null}
    </div> : <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-bold">🛍️ Shopping Notes</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600"><li>📦 Hong Kong in-stock items are generally shipped within 1–2 business days via SF Express.</li><li>✈️ Japan Pre-order and direct-shipping items usually arrive within 7–14 business days. Japanese public holidays may cause delays.</li><li>🧺 Mixed orders containing in-stock and pre-order items ship together. Local shipping is free for orders over HK$450.</li><li>💬 Contact us if you have questions about feeding, ingredients or storage.</li></ul></section>}
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
  const isFood = isPetBundleProduct(product) || /(food|treat|snack|seafood|jerky|meat)/i.test(JSON.stringify(product));
  const quantityOptions = isFood ? PET_BUNDLE_QUANTITIES : undefined;
  const discountPercent = selectedOriginalPrice ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100) : null;
  useEffect(() => { trackMetaEvent("ViewContent", { content_type: "product", content_ids: [product.id], content_name: product.name.zh || product.name.en, value: product.price, currency: "HKD" }); }, [product.id, product.name.en, product.name.zh, product.price]);
  return <div className="min-h-screen bg-[#faf7f2] text-stone-800"><main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6 sm:pb-16 sm:pt-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-500"><CategoryNavLink href="/menu" className="font-medium hover:text-stone-800">{t("menuTitle")}</CategoryNavLink><span>/</span>{category ? <><CategoryNavLink href={categoryHref(category.slug)} className="font-medium hover:text-stone-800">{t(category.labelKey)}</CategoryNavLink><span>/</span></> : null}<span className="truncate text-stone-700">{name}</span></div><div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative"><ProductGallery key={`${product.id}-${selectedPriceId}`} images={selectedOption?.image ? [selectedOption.image] : product.images} fallbackImage={firstImage} alt={name} priority />{discountPercent ? <span className="absolute left-4 top-4 z-10 rounded-full bg-[#b84d3d] px-3 py-1 text-xs font-bold text-white shadow">-{discountPercent}%</span> : null}</div><section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><p className="text-xs font-semibold tracking-wide text-stone-400">SKU：{sku}</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">{name}</h1><div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-4xl font-extrabold tabular-nums text-[#8b573f]">{formatMoney(selectedPrice, locale)}</span>{selectedOriginalPrice ? <span className="text-base text-stone-400 line-through">{formatMoney(selectedOriginalPrice, locale)}</span> : null}</div>{discountPercent ? <p className="mt-1 text-sm font-semibold text-[#b84d3d]">{t("productDiscountBadge")}</p> : null}<MarketReferencePrice price={product.marketReferencePrice} asOf={product.marketReferenceAsOf} className="mt-2" /><FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />{product.variants?.length ? <div className="mt-5"><p className="text-sm font-bold">{product.metadata?.variant_selection_label_en || t("productSpecSelectorTitle")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{product.variants.map((variant, index) => <button key={variant.key} type="button" onClick={() => setSelectedSpecIndex(index)} className={`rounded-xl border p-3 text-left text-sm ${selectedSpecIndex === index ? "border-[#8b573f] bg-[#f7eee7]" : "border-stone-200 bg-white"}`}><span className="block font-semibold">{variant.label.en || variant.label.zh}</span><span className="mt-1 block text-xs text-stone-500">{formatMoney(variant.price, locale)}{variant.unitLabel?.en ? ` · ${variant.unitLabel[locale]}` : ""}</span></button>)}</div></div> : null}{product.inStock !== false ? <div className="mt-6"><p className="mb-2 text-sm font-bold">{t("productPurchaseQuantity")}</p><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" quantityOptions={quantityOptions} quantity={selectedQty} onQuantityChange={setSelectedQty} showBulkShortcuts showTotal unitPrice={selectedPrice} className="[&>button:last-child]:rounded-xl [&>button:last-child]:py-3.5" /></div> : <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="font-bold">{t("productSoldOut")}</p><p className="mt-1 text-sm text-stone-600">{t("productOutOfStockMessage")}</p><OutOfStockOrderButton productId={product.id} productName={product.name} mofuSku={sku} className="mt-3" /></div>}<ProfessionalMetrics product={product} locale={locale} /></section></div><RichProductContent product={product} sku={sku} firstImage={firstImage} /><FAQAccordion /><ProductFAQ /></main><div className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-between gap-3 border-t border-stone-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md sm:hidden"><div className="flex min-w-0 flex-1 items-center gap-2.5"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-[#f5f0e9]"><ProductImage src={firstImage} alt={name} sizes="44px" className="object-contain p-1" /></div><div className="flex min-w-0 flex-1 flex-col justify-center"><p className="truncate text-xs font-normal text-stone-600">{name}</p><p className="text-sm font-bold text-stone-900">{formatMoney(selectedPrice, locale)}</p></div></div><div className="shrink-0"><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" showQuantity={false} quantity={selectedQty} unitPrice={selectedPrice} className="!mt-0 !gap-0 !flex-none [&>button:last-child]:!h-10 [&>button:last-child]:!w-auto [&>button:last-child]:!min-w-[8rem] [&>button:last-child]:!shrink-0 [&>button:last-child]:!rounded-full [&>button:last-child]:!bg-stone-900 [&>button:last-child]:!px-5 [&>button:last-child]:!py-0 [&>button:last-child]:!text-sm [&>button:last-child]:!font-medium [&>button:last-child]:!whitespace-nowrap [&>button:last-child]:shadow-sm [&>button:last-child]:hover:!bg-stone-800 [&>button:last-child]:active:!scale-95" /></div></div></div>;
}
