"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { BundleContentsCard } from "@/components/product/BundleContentsCard";
import { ProductImage } from "@/components/product/ProductImage";
import { BackInStockAlertButton } from "@/components/product/BackInStockAlertButton";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type Locale } from "@/lib/i18n/translations";
import { calcSubtotal, isPetBundleProduct, PET_BUNDLE_QUANTITIES } from "@/lib/order";
import type { Product } from "@/lib/products";
import { getProductJanCode, isValidGtin13 } from "@/lib/product-identifiers";
import { useCart } from "@/lib/shop/cart";
import { useCatalog } from "@/lib/catalog-context";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref } from "@/lib/products";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { ShoppingCart } from "lucide-react";
import {
  parseProductContent,
  safeProductText,
  type RichProductContent,
} from "@/lib/product-content";

type ProductDetailProps = { product: Product };

const OFFICIAL_PRODUCT_IMAGE_OVERRIDES: Record<string, string[]> = {
  "4976064026569": [
    "https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/best-partner/4976064026569-0.jpg",
    "https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/best-partner/4976064026569-1.jpg",
  ],
};

const VENISON_SKUS = new Set(["4976064026545", "4976064026743", "4976064025081"]);

type PackageFactKey = "ingredients" | "origin" | "additives" | "protein" | "fat" | "fiber" | "ash" | "moisture" | "calories" | "netWeight" | "storage" | "suitableAge" | "jan";
type PackageFactField = { key: PackageFactKey; labelZh: string; labelEn: string; pattern: RegExp; required?: boolean };

const PACKAGE_FACT_FIELDS: PackageFactField[] = [
  { key: "ingredients", labelZh: "原材料", labelEn: "Ingredients", pattern: /^(?:原材料|原料|成分|ingredients?)$/i, required: true },
  { key: "origin", labelZh: "產地", labelEn: "Origin", pattern: /^(?:產地|原產地|製造地|產地國|country\s+of\s+origin|origin)$/i },
  { key: "additives", labelZh: "添加物", labelEn: "Additives", pattern: /^(?:添加物|添加劑|additives?)$/i },
  { key: "protein", labelZh: "粗蛋白質", labelEn: "Crude Protein", pattern: /^(?:粗蛋白質?|蛋白質|crude\s+protein|protein)$/i, required: true },
  { key: "fat", labelZh: "粗脂肪", labelEn: "Crude Fat", pattern: /^(?:粗脂肪|脂肪|crude\s+fat|fat)$/i, required: true },
  { key: "fiber", labelZh: "粗纖維", labelEn: "Crude Fiber", pattern: /^(?:粗纖維|纖維|crude\s+fiber|fiber|fibre)$/i, required: true },
  { key: "ash", labelZh: "粗灰分", labelEn: "Crude Ash", pattern: /^(?:粗灰分|灰分|crude\s+ash|ash)$/i, required: true },
  { key: "moisture", labelZh: "水分", labelEn: "Moisture", pattern: /^(?:水分|moisture)$/i, required: true },
  { key: "calories", labelZh: "熱量", labelEn: "Calories", pattern: /^(?:熱量|代謝能|代謝能量|卡路里|calories?|energy|kcal)$/i, required: true },
  { key: "netWeight", labelZh: "淨重／包裝規格", labelEn: "Net Weight / Pack Size", pattern: /^(?:淨重|淨含量|內容量|容量|規格|重量|net\s*(?:weight|contents?)|pack(?:age)?\s*size)$/i, required: true },
  { key: "storage", labelZh: "保存方法", labelEn: "Storage", pattern: /^(?:保存方法|保存方式|保管方法|儲存方式|storage(?:\s+method)?)$/i, required: true },
  { key: "suitableAge", labelZh: "適用年齡", labelEn: "Suitable Age", pattern: /^(?:適用年齡|適合年齡|年齡|suitable\s+age|age)$/i },
  { key: "jan", labelZh: "JAN 條碼", labelEn: "JAN Barcode", pattern: /^(?:jan(?:\s*(?:碼|代碼|コード|code))?|條碼|國際條碼|barcode|gtin(?:-?13)?)$/i, required: true },
];

function packageHeadingTitle(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.startsWith("【") && trimmed.includes("】")) return trimmed.slice(1, trimmed.indexOf("】")).trim();
  if (/^#{1,6}\s/.test(trimmed)) return trimmed.replace(/^#{1,6}\s*/, "").trim();
  return null;
}

function parsePackageFactLine(rawLine: string): { key: PackageFactKey; value: string } | null {
  const line = rawLine.trim().replace(/^[•●▪◦・\-*]+\s*/u, "").replace(/^\d+\s*[.)、]\s*/, "");
  const match = line.match(/^(.{1,48}?)[：:=]\s*(.+)$/u) ?? line.match(/^(.{1,48}?)\s{1,}(.+)$/u);
  if (!match) return null;
  const label = match[1].replace(/[（(].*?[）)]/g, "").trim();
  const field = PACKAGE_FACT_FIELDS.find((candidate) => candidate.pattern.test(label));
  if (!field) return null;
  let value = match[2].trim();
  if (field.key === "jan") {
    const code = value.match(/\d{13}/)?.[0];
    if (!isValidGtin13(code)) return null;
    value = code;
  }
  return value ? { key: field.key, value } : null;
}

function parsePackageFacts(text: string, locale: Locale, fallbackJan: string, nutritionLines: string[] = []): {
  sectionFound: boolean;
  values: Map<PackageFactKey, string>;
  otherLines: string[];
} {
  const values = new Map<PackageFactKey, string>();
  const otherLines: string[] = [];
  const specHeading = /產品規格|商品規格|規格與保證營養|規格與保存|規格及保存|規格清單|保證營養|保存方法|保存方式|原材料|原料|產地|官方\s*JAN|條碼|資料來源|來源|sources?|ingredients?\s*(?:&|and)\s*origin|specifications?\s*&\s*storage|official\s+jan|barcode|guaranteed\s+analysis|nutrition\s+(?:facts|analysis)|product\s+specifications?/i;
  let sectionFound = false;
  let inSpecSection = false;
  const addFact = (fact: { key: PackageFactKey; value: string }) => {
    const previous = values.get(fact.key);
    if (!previous) values.set(fact.key, fact.value);
    else if (!previous.includes(fact.value)) values.set(fact.key, `${previous}；${fact.value}`);
  };

  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = packageHeadingTitle(rawLine);
    if (heading !== null) {
      inSpecSection = specHeading.test(heading);
      sectionFound ||= inSpecSection;
      continue;
    }
    if (!rawLine.trim()) continue;
    const displayLine = safeProductText(rawLine, locale);
    if (!displayLine) continue;
    const fact = parsePackageFactLine(displayLine);
    if (fact && (inSpecSection || !sectionFound)) addFact(fact);
    else if (inSpecSection) otherLines.push(displayLine.replace(/^[•●▪◦・\-*]+\s*/u, ""));
  }

  for (const nutritionLine of nutritionLines) {
    const displayLine = safeProductText(nutritionLine, locale);
    const fact = displayLine ? parsePackageFactLine(displayLine) : null;
    if (fact) addFact(fact);
  }

  if (values.size > 0 && fallbackJan && !values.has("jan")) values.set("jan", fallbackJan);
  return { sectionFound, values, otherLines: [...new Set(otherLines)] };
}

function packageSectionLines(text: string, locale: Locale, headingPattern: RegExp): string[] {
  const lines: string[] = [];
  let inTargetSection = false;
  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = packageHeadingTitle(rawLine);
    if (heading !== null) {
      inTargetSection = headingPattern.test(heading);
      continue;
    }
    if (!inTargetSection) continue;
    const line = safeProductText(rawLine, locale).replace(/^[•●▪◦・\-*]+\s*/u, "").trim();
    if (line) lines.push(line);
  }
  return [...new Set(lines)];
}

function isVenisonProduct(product: Product, sku: string): boolean {
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? [])].filter(Boolean).join(" ");
  return VENISON_SKUS.has(sku) || /鹿肉|蝦夷鹿|venison|ezo deer/i.test(text);
}

function RichProductContent({ product, locale, sku, firstImage }: { product: Product; locale: Locale; sku: string; firstImage: string }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"details" | "notes">("details");
  const [open, setOpen] = useState(true);
  const text = product.description?.[locale] || product.description?.zh || product.description?.en || "";
  const rich: RichProductContent = useMemo(() => parseProductContent(text, product, locale), [text, product, locale]);
  const packageFacts = useMemo(() => {
    const primary = parsePackageFacts(text, locale, getProductJanCode(product) ?? "", rich.nutrition);
    if (locale !== "en" || primary.values.size > 0 || !product.description?.zh || product.description.zh === text) return primary;

    // Some products only have the specification block in Chinese. Reuse that
    // same source data for the English table while keeping English field labels.
    const fallbackText = product.description.zh;
    const fallbackRich = parseProductContent(fallbackText, product, "zh");
    return parsePackageFacts(fallbackText, "zh", getProductJanCode(product) ?? "", fallbackRich.nutrition);
  }, [text, locale, product, rich.nutrition]);
  const hasPackageFacts = packageFacts.values.size > 0;
  const packageFeeding = useMemo(() => packageSectionLines(text, locale, /daily\s+feeding|feeding\s+guide|每日建議餵食量|每日餵食|餵食量|餵食指南/i), [text, locale]);
  const feedingDetails = packageFeeding.length ? packageFeeding : rich.feeding;
  const packageRows = PACKAGE_FACT_FIELDS
    .filter((field) => hasPackageFacts && (field.required || packageFacts.values.has(field.key)))
    .map((field) => ({
      key: field.key,
      label: locale === "en" ? field.labelEn : field.labelZh,
      value: packageFacts.values.get(field.key) ?? (locale === "en" ? "Not listed in the product description" : "商品描述未列明"),
      missing: !packageFacts.values.has(field.key),
    }));
  const showDescriptionFallback = !hasPackageFacts;
  const defaultEnglishFeatures = [
    "🇯🇵 100% Made in Japan: Carefully selected natural Japanese ingredients with no artificial synthesis.",
    "🌿 Zero Chemical Additives: Guaranteed free from artificial colorings, preservatives, and chemical flavourings.",
    "🥩 Natural Slow-Dried Process: Gently dried at low temperatures to lock in pure nutrients and irresistible aroma.",
    "🚚 Free SF Express Shipping: Storewide orders over HK$399 enjoy free local delivery to your door or SF lockers.",
  ];
  const displayFeatures = locale === "en" && rich.highlights.length === 0 ? defaultEnglishFeatures : rich.highlights;
  const shoppingNotes = locale === "en"
    ? [
        "📦 Hong Kong in-stock items are dispatched via SF Express within 1–2 business days.",
        "✈️ Japan direct items typically take 7–14 business days (may be extended during Japanese holidays).",
        "🧺 Orders with in-stock & pre-order items ship together; storewide orders of HK$399+ enjoy free SF local shipping.",
        "💬 For feeding advice, ingredient queries, or storage guidelines, feel free to contact us anytime.",
      ]
    : [
        "📦 香港現貨一般於下單後 1–2 個工作天內由順豐寄出。",
        "✈️ 日本預訂／直送商品約需 7–14 個工作天，遇日本節假日或會順延。",
        "🧺 同單含現貨與預訂品將一併發貨；全單滿 HK$399 享本地順豐免運。",
        "💬 如對產品的餵食方式、食材或保存方法有疑問，歡迎聯絡我們。",
      ];
  return <div className="mt-8 space-y-5">
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"><span className="font-bold">✨ {t("product_features")}</span><span className="text-xl text-stone-400" aria-hidden>{open ? "−" : "+"}</span></button>
      {open ? <div className="border-t border-stone-100 px-4 pb-5 pt-4 sm:px-5">{displayFeatures.length ? <ul className="space-y-2 text-sm leading-6 text-stone-700">{displayFeatures.map((item, index) => <li key={`${item}-${index}`}>{locale === "en" ? item : `✨ ${item}`}</li>)}</ul> : null}{rich.spotlight ? <div className="mt-4 rounded-xl bg-[#FFFFFF] p-4"><p className="whitespace-pre-line text-sm leading-6 text-stone-600">{rich.spotlight}</p></div> : null}</div> : null}
    </section>
    {isVenisonProduct(product, sku) ? <Link href="/blog/dog-food-venison-benefits" className="flex items-center justify-between rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#FFFFFF]"><span>💡 想了解更多鹿肉營養？</span><span>閱讀【日本獸醫鹿肉解析專欄 →】</span></Link> : null}
    <div className="flex rounded-xl bg-stone-100 p-1" role="tablist" aria-label={t("product_details")}><button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "details" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>{t("product_details")}</button><button type="button" role="tab" aria-selected={tab === "notes"} onClick={() => setTab("notes")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "notes" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>{t("shopping_notes")}</button></div>
    {tab === "details" ? <div className="space-y-5">
      {firstImage ? <div className="my-6"><section className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-6"><span className="absolute right-4 top-4 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">🇯🇵 {t("badge_japan_pure")}</span><ProductImage src={firstImage} alt={product.name.zh} sizes="(min-width: 768px) 440px, 100vw" priority className="object-contain mix-blend-multiply" /></section></div> : null}
      {hasPackageFacts ? <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">{locale === "en" ? "PRODUCT INFORMATION" : "商品資料"}</p>
        <h2 className="mt-1 text-lg font-bold text-stone-800">📋 {locale === "en" ? "Specifications & Guaranteed Analysis" : "產品規格與保證營養"}</h2>
        <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs font-semibold text-stone-500"><tr><th scope="col" className="w-[36%] px-3 py-2.5">{locale === "en" ? "Item" : "項目"}</th><th scope="col" className="px-3 py-2.5">{locale === "en" ? "Product / Package Details" : "商品／包裝資料"}</th></tr></thead>
            <tbody className="divide-y divide-stone-200">{packageRows.map((row) => <tr key={row.key}>
              <th scope="row" className="break-words px-3 py-2.5 align-top font-medium leading-5 text-stone-600 [overflow-wrap:anywhere]">{row.label}</th>
              <td className={`break-words px-3 py-2.5 align-top leading-5 [overflow-wrap:anywhere] ${row.missing ? "text-stone-400" : "text-stone-800"}`}>{row.value}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {packageFacts.otherLines.length ? <div className="mt-3 rounded-xl bg-stone-50 p-3"><h3 className="text-xs font-bold text-stone-600">{locale === "en" ? "Other package information" : "其他包裝資訊"}</h3><ul className="mt-1 space-y-1 break-words text-sm leading-6 text-stone-600 [overflow-wrap:anywhere]">{packageFacts.otherLines.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div> : null}
        <p className="mt-3 text-xs leading-5 text-stone-400">{locale === "en" ? "Values shown here are taken from the product description; fields not listed there are marked accordingly." : "表格內容取自商品描述；描述未列出的欄位已明確標示。"}</p>
      </section> : null}
      {showDescriptionFallback ? <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"><h2 className="font-bold text-stone-800">{locale === "en" ? "Full Product Description" : "完整商品描述"}</h2><div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600 [overflow-wrap:anywhere]">{text.trim() || (locale === "en" ? "Product information is not currently available." : "商品描述暫未提供。")}</div></section> : null}
      {rich.texture ? <section className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">🐾 食感與硬度</h2></div><p className="mt-2 text-sm leading-6 text-stone-600">{rich.texture}</p></section> : null}
      {feedingDetails.length ? <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4"><h2 className="font-bold text-stone-800">🍽️ {packageFeeding.length ? (locale === "en" ? "Daily Feeding Guide" : "每日建議餵食量") : (locale === "en" ? "Feeding / Usage" : "餵食／使用方式")}</h2><ul className="mt-2 space-y-2 break-words text-sm leading-6 text-stone-600 [overflow-wrap:anywhere]">{feedingDetails.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section> : null}
      {rich.notes.length ? <section className="rounded-2xl border border-stone-200 bg-[#FAFAFA] p-4"><h2 className="font-bold text-stone-800">貼心叮嚀</h2><ul className="mt-2 space-y-2 text-sm leading-6 text-stone-600">{rich.notes.map((note, index) => <li key={`${note}-${index}`}>・{note}</li>)}</ul></section> : null}
    </div> : <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-bold">🛍️ {t("shopping_notes")}</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">{shoppingNotes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ul></section>}
  </div>;
}


function PdpRecommendationCarousel({ products, locale }: { products: Product[]; locale: Locale }) {
  return <section className="mt-8" aria-labelledby="pdp-recommendations">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div><p className="text-xs font-bold tracking-[0.16em] text-stone-500">MOFU HAVEN PICKS</p><h2 id="pdp-recommendations" className="mt-1 text-xl font-bold">{locale === "zh" ? "你可能會喜歡" : "You May Also Like"}</h2></div>
    </div>
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={locale === "zh" ? "推薦商品" : "Recommended products"}>
      {products.map((recommendation) => { const recommendationName = getLocalizedProductName(recommendation, locale); return <li key={recommendation.id} className="w-[60%] min-w-[60%] shrink-0 snap-start sm:w-[45%] sm:min-w-[45%] md:w-[280px] md:min-w-[280px]"><article className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><Link href={productHref(recommendation.id)} className="block cursor-pointer transition-opacity hover:opacity-80" aria-label={locale === "zh" ? `查看商品：${recommendationName}` : `View product: ${recommendationName}`}><div className="relative aspect-square bg-[#FFFFFF]"><ProductImage src={recommendation.images?.[0] ?? recommendation.image} alt={recommendationName} sizes="(min-width: 768px) 280px, 60vw" className="object-contain p-2" /></div><h3 className="line-clamp-2 min-h-10 px-3 pt-3 text-sm font-semibold leading-5">{recommendationName}</h3></Link><div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2"><span className="text-sm font-bold text-[#111111]">{formatMoney(recommendation.price, locale)}</span><AddToCartButton productId={recommendation.id} priceId={recommendation.priceId} size="card" showQuantity={false} compact /></div></article></li>; })}
    </ul>
  </section>;
}

function MobileStickyCartBar({ product, name, price, image, visible, basketCount, basketTotal, added, loading, locale, onAdd }: {
  product: Product;
  name: string;
  price: number;
  image: string;
  visible: boolean;
  basketCount: number;
  basketTotal: number;
  added: boolean;
  loading: boolean;
  locale: Locale;
  onAdd: () => void;
}) {
  const openCart = () => window.dispatchEvent(new CustomEvent("mofu:open-cart"));
  useEffect(() => {
    document.body.classList.toggle("sticky-cart-visible", visible);
    return () => document.body.classList.remove("sticky-cart-visible");
  }, [visible]);
  return <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-stone-200 bg-white/95 px-3 pb-[max(16px,env(safe-area-inset-bottom,16px))] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300 sm:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`} aria-hidden={!visible}>
    {added ? <div className="flex items-center gap-2">
      <button type="button" onClick={openCart} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-stone-200" aria-label={locale === "en" ? "Open shopping cart" : "開啟購物籃"}>
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white"><ShoppingCart className="h-4 w-4" aria-hidden="true" /><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">{basketCount}</span></span>
        <span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-700">{locale === "en" ? `Basket: ${basketCount} item${basketCount === 1 ? "" : "s"}` : `購物籃已有 ${basketCount} 件商品`}</span><span className="block text-sm font-bold text-[#111111]">{formatMoney(basketTotal, locale)}</span></span>
      </button>
      <a href="/checkout" className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#111111] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-black active:scale-95">{locale === "en" ? "Checkout 💳" : "立即結帳 💳"}</a>
    </div> : <div className="flex items-center gap-2">
      <button type="button" onClick={openCart} className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-[#111111]" aria-label={locale === "en" ? "Open shopping cart" : "開啟購物籃"}><ShoppingCart className="h-5 w-5" aria-hidden="true" />{basketCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">{basketCount}</span> : null}</button>
      <div className="flex min-w-0 flex-1 items-center gap-2"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#FFFFFF] ring-1 ring-stone-200"><ProductImage src={image} alt={name} sizes="44px" className="object-contain" /></div><div className="min-w-0"><p className="truncate text-xs font-medium text-stone-700">{name}</p><p className="text-base font-bold text-[#111111]">{formatMoney(price, locale)}</p></div></div>
      <button type="button" onClick={onAdd} disabled={product.inStock === false || loading} className="flex h-12 min-w-[7.25rem] shrink-0 items-center justify-center rounded-full bg-[#111111] px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black active:scale-[0.99] disabled:cursor-wait disabled:bg-stone-400 disabled:opacity-70">{loading ? (locale === "en" ? "Adding…" : "加入中…") : locale === "en" ? "Add to Basket" : "加入購物車"}</button>
    </div>}
  </div>;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const { toOrderItems, itemCount, addItem } = useCart();
  const { recentIds, clearRecentlyViewed } = useRecentlyViewed(product.id);
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const [purchaseVisible, setPurchaseVisible] = useState(true);
  const [stickyAdded, setStickyAdded] = useState(false);
  const [stickyLoading, setStickyLoading] = useState(false);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const previousItemCount = useRef(itemCount);
  const selectedOption = product.variants?.[selectedSpecIndex] ?? product.variants?.[0];
  const selectedPrice = selectedOption?.price ?? product.price;
  const selectedPriceId = selectedOption?.priceId ?? product.priceId;
  const selectedOriginalPrice = selectedOption?.originalPrice ?? product.originalPrice;
  const name = getLocalizedProductName(product, locale) || t("productDescriptionUnavailable");
  const category = getCategoryBySlug(product.categorySlug);
  const sku = product.metadata?.mofu_sku?.trim() || product.id;
  const jan = getProductJanCode(product) ?? "";
  const firstImage = selectedOption?.image || product.images?.[0] || product.image;
  const officialImages = OFFICIAL_PRODUCT_IMAGE_OVERRIDES[sku] ?? OFFICIAL_PRODUCT_IMAGE_OVERRIDES[product.id];
  const galleryImages = officialImages ?? (selectedOption?.image ? [selectedOption.image] : product.images);
  const primaryImage = officialImages?.[0] || firstImage;
  const cartSubtotal = calcSubtotal(toOrderItems());
  useEffect(() => {
    const node = purchaseRef.current;
    if (!node) return;
    const updateVisibility = () => setPurchaseVisible(node.getBoundingClientRect().bottom > 0);
    let frame: number | null = null;
    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updateVisibility();
      });
    };
    updateVisibility();
    const observer = new IntersectionObserver(scheduleUpdate, { threshold: 0.15 });
    observer.observe(node);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (itemCount > previousItemCount.current) setStickyAdded(true);
    previousItemCount.current = itemCount;
  }, [itemCount]);
  const handleStickyAdd = () => {
    setStickyLoading(true);
    addItem(product.id, selectedQty, selectedPriceId);
    setStickyAdded(true);
    window.dispatchEvent(new CustomEvent("mofu:open-cart"));
    window.setTimeout(() => setStickyLoading(false), 450);
  };
  const isFood = isPetBundleProduct(product) || /(food|treat|snack|零食|小食|食品|肉乾|肉條|魚介|鮮肉|原肉)/i.test(JSON.stringify(product));
  const quantityOptions = isFood ? PET_BUNDLE_QUANTITIES : undefined;
  const discountPercent = selectedOriginalPrice ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100) : null;
  const recommendations = useMemo(() => {
    const sameCategory = catalogProducts.filter((candidate) => candidate.id !== product.id && candidate.inStock !== false && candidate.categorySlug === product.categorySlug);
    const remaining = catalogProducts.filter((candidate) => candidate.id !== product.id && candidate.inStock !== false && !sameCategory.some((item) => item.id === candidate.id));
    return [...sameCategory, ...remaining].slice(0, 4);
  }, [catalogProducts, product.categorySlug, product.id]);
  useEffect(() => { trackMetaEvent("ViewContent", { content_type: "product", content_ids: [sku], content_name: name, content_sku: sku, value: selectedPrice, currency: "HKD" }); }, [name, selectedPrice, sku]);
  return <div className="min-h-screen bg-[#FFFFFF] text-stone-800"><main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-500"><CategoryNavLink href="/menu" className="font-medium hover:text-stone-800">{t("menuTitle")}</CategoryNavLink><span>/</span>{category ? <><CategoryNavLink href={categoryHref(category.slug)} className="font-medium hover:text-stone-800">{t(category.labelKey)}</CategoryNavLink><span>/</span></> : null}<span className="truncate text-stone-700">{name}</span></div><div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative"><ProductGallery key={`${product.id}-${selectedPriceId}`} images={galleryImages} fallbackImage={primaryImage} alt={name} priority />{discountPercent ? <span className="absolute left-4 top-4 z-10 rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">-{discountPercent}%</span> : null}</div><section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-3"><h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">{name}</h1><WishlistButton productId={product.id} className="h-11 w-11 shrink-0 text-xl" /></div>{jan ? <div className="my-2.5 flex items-center gap-1.5" aria-label={`JAN ${jan}`}><span className="rounded bg-stone-100 px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-stone-600">JAN</span><span className="select-all font-mono text-xs tracking-wide text-stone-500">{jan}</span></div> : null}<div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-2xl font-bold tracking-tight tabular-nums text-[#111111] sm:text-3xl">{formatMoney(selectedPrice, locale)}</span>{selectedOriginalPrice ? <span className="text-base text-stone-400 line-through">{formatMoney(selectedOriginalPrice, locale)}</span> : null}</div>{discountPercent ? <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-stone-500">{t("productDiscountBadge")}</p> : null}<MarketReferencePrice price={product.marketReferencePrice} asOf={product.marketReferenceAsOf} className="mt-2" /><FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />{product.variants?.length ? <div className="mt-5"><p className="text-sm font-bold">{product.metadata?.variant_selection_label_zh || t("productSpecSelectorTitle")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{product.variants.map((variant, index) => <button key={variant.key} type="button" onClick={() => setSelectedSpecIndex(index)} className={`rounded-xl border p-3 text-left text-sm ${selectedSpecIndex === index ? "border-2 border-[#111111] bg-white text-[#111111]" : "border-stone-200 bg-white text-stone-700"}`}><span className="block font-semibold">{variant.label[locale] || variant.label.zh}</span><span className="mt-1 block text-xs text-stone-500">{formatMoney(variant.price, locale)}{variant.unitLabel?.[locale] ? ` · ${variant.unitLabel[locale]}` : ""}</span></button>)}</div></div> : null}{product.inStock !== false ? <div ref={purchaseRef} className="mt-6"><p className="mb-2 text-sm font-bold">{t("productPurchaseQuantity")}</p><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" quantityOptions={quantityOptions} quantity={selectedQty} onQuantityChange={setSelectedQty} showBulkShortcuts showTotal unitPrice={selectedPrice} className="[&>button:last-child]:rounded-full [&>button:last-child]:py-4" /></div> : <div ref={purchaseRef} className="mt-6 rounded-2xl border border-stone-200 bg-[#FAFAFA] p-4 text-stone-800"><p className="font-bold">{t("productSoldOut")}</p><p className="mt-1 text-sm text-stone-600">{t("productOutOfStockMessage")}</p><BackInStockAlertButton productId={product.id} /></div>}</section></div><RichProductContent product={product} locale={locale} sku={sku} firstImage={primaryImage} /><BundleContentsCard product={product} catalog={catalogProducts} />{recommendations.length ? <PdpRecommendationCarousel products={recommendations} locale={locale} /> : null}<RecentlyViewed products={catalogProducts} recentIds={recentIds} currentProductId={product.id} locale={locale} onClear={clearRecentlyViewed} /><FAQAccordion /><ProductFAQ /></main>{product.inStock === false ? null : <MobileStickyCartBar product={product} name={name} price={selectedPrice} image={primaryImage} visible={!purchaseVisible} basketCount={itemCount} basketTotal={cartSubtotal} added={stickyAdded} loading={stickyLoading} locale={locale} onAdd={handleStickyAdd} />}</div>;
}
