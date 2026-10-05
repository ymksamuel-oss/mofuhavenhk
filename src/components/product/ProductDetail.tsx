"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductImage } from "@/components/product/ProductImage";
import { BackInStockAlertButton } from "@/components/product/BackInStockAlertButton";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type Locale } from "@/lib/i18n/translations";
import { calcSubtotal, isPetBundleProduct, PET_BUNDLE_QUANTITIES } from "@/lib/order";
import { getProductFlavorFamily, type Product } from "@/lib/products";
import { getProductJanCode, isValidGtin13 } from "@/lib/product-identifiers";
import { useCart } from "@/lib/shop/cart";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { trackMetaEvent } from "@/components/MetaPixel";
import { ShoppingCart } from "lucide-react";
import {
  parseProductContent,
  productSpecifications,
  safeProductText,
  type RichProductContent,
} from "@/lib/product-content";

type ProductDetailProps = { product: Product };
type FamilyChoice = { product: Product; label: { zh: string; en: string } };

const OFFICIAL_PRODUCT_IMAGE_OVERRIDES: Record<string, string[]> = {
  "4976064026569": [
    "https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/best-partner/4976064026569-0.jpg",
    "https://hkuxxgduymkztkmyhhot.supabase.co/storage/v1/object/public/public-images/best-partner/4976064026569-1.jpg",
  ],
};

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

function splitSpecLine(line: string): { label: string; value: string } {
  const match = line.replace(/^[•●▪◦\-*]+\s*/, "").match(/^([^:：]+)[:：]\s*(.+)$/);
  return match ? { label: match[1].trim(), value: match[2].trim() } : { label: "", value: line.trim() };
}

function localiseSpecLabel(label: string, locale: Locale): string {
  const value = label.toLocaleLowerCase();
  if (locale === "en") {
    if (/原材料|成分|ingredient/.test(value)) return "Ingredients";
    if (/產地|产地|來源|origin|made in/.test(value)) return "Origin";
    if (/粗蛋白|crude protein|protein/.test(value)) return "Crude Protein";
    if (/粗纖維|粗纤维|crude fiber|fibre|fiber/.test(value)) return "Crude Fiber";
    if (/粗脂肪|crude fat|fat/.test(value)) return "Crude Fat";
    if (/水分|moisture/.test(value)) return "Moisture";
    if (/粗灰分|ash/.test(value)) return "Crude Ash";
    if (/熱量|热量|energy|calorie/.test(value)) return "Energy";
    return label;
  }
  if (/ingredient|原材料|成分/.test(value)) return "主要成分";
  if (/origin|made in|產地|产地|來源/.test(value)) return "產地來源";
  if (/crude protein|protein|粗蛋白/.test(value)) return "粗蛋白質";
  if (/crude fiber|fibre|fiber|粗纖維|粗纤维/.test(value)) return "粗纖維";
  if (/crude fat|fat|粗脂肪/.test(value)) return "粗脂肪";
  if (/moisture|水分/.test(value)) return "水分";
  if (/ash|粗灰分/.test(value)) return "粗灰分";
  if (/energy|calorie|熱量|热量/.test(value)) return "熱量";
  return label;
}

function RichProductContent({ product, locale, sku }: { product: Product; locale: Locale; sku: string }) {
  const { t } = useI18n();
  const [openFeatures, setOpenFeatures] = useState(true);
  const text = locale === "zh" ? product.description?.zh || product.description?.[locale] || "" : product.description?.[locale] || product.description?.zh || "";
  const rich: RichProductContent = useMemo(() => parseProductContent(text, product, locale), [text, product, locale]);
  const defaultEnglishFeatures = [
    "🇯🇵 100% Made in Japan: Carefully selected natural Japanese ingredients with no artificial synthesis.",
    "🌿 Zero Chemical Additives: Guaranteed free from artificial colorings, preservatives, and chemical flavourings.",
    "🥩 Natural Slow-Dried Process: Gently dried at low temperatures to lock in pure nutrients and irresistible aroma.",
    "🚚 Free SF Express Shipping: Storewide orders over HK$399 enjoy free local delivery to your door or SF lockers.",
  ];
  const displayFeatures = locale === "en" && rich.highlights.length === 0 ? defaultEnglishFeatures : rich.highlights;
  const parsedRows = [...rich.nutrition, ...productSpecifications(product, sku, locale)]
    .map(splitSpecLine)
    .filter((row) => row.value)
    .filter((row) => locale !== "en" || !/[\u3400-\u9fff]/u.test(`${row.label} ${row.value}`))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.label === row.label && candidate.value === row.value) === index)
    .slice(0, 10)
    .map((row) => ({ label: localiseSpecLabel(row.label || (locale === "en" ? "Specification" : "規格"), locale), value: row.value }));
  const specificationRows = parsedRows.length ? parsedRows : [{ label: locale === "en" ? "Specification" : "規格", value: locale === "en" ? "Not provided" : "資料未提供" }];
  return <div className="mt-8 space-y-5">
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-5">
        {[locale === "en" ? "🇯🇵 100% Made in Japan" : "🇯🇵 100% 日本原裝", locale === "en" ? "🌿 Additive-Free" : "🌿 無添加", locale === "en" ? "✓ Genuine Official Product" : "✓ 原廠正貨保證"].map((badge) => <span key={badge} className="rounded-full bg-[#f7eee7] px-3 py-1 text-[11px] font-bold leading-5 text-[#8b573f] ring-1 ring-[#ead8c8]">{badge}</span>)}
      </div>
      <button type="button" onClick={() => setOpenFeatures((value) => !value)} aria-expanded={openFeatures} className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"><span className="font-bold">✨ {t("product_features")}</span><span className="text-xl text-stone-400" aria-hidden>{openFeatures ? "−" : "+"}</span></button>
      {openFeatures ? <div className="border-t border-stone-100 px-4 pb-5 pt-3 sm:px-5">
        {displayFeatures.length ? <ul className="space-y-2 text-[13px] leading-relaxed text-stone-700">{displayFeatures.map((item, index) => <li key={`${item}-${index}`}>{locale === "en" ? item : `✨ ${item}`}</li>)}</ul> : null}
        {rich.spotlight ? <div className="mt-4 rounded-xl bg-[#fbf3df] p-4"><p className="whitespace-pre-line text-[13px] leading-relaxed text-stone-600">{rich.spotlight}</p></div> : null}
        {rich.feeding.length ? <div className="mt-4 rounded-xl bg-[#fff8ef] p-4"><h3 className="font-bold">🍽️ {locale === "en" ? "Feeding / use" : "妙用吃法"}</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-stone-700">{rich.feeding.map((item, index) => <li key={`${item}-${index}`}>{item.replace(/^\d+\s*[.)、]\s*/u, "")}</li>)}</ol></div> : null}
      </div> : null}
    </section>
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-labelledby="product-specifications-title">
      <div className="px-4 py-4 sm:px-5"><h2 id="product-specifications-title" className="text-lg font-bold">{locale === "en" ? "📋 Specifications & Guaranteed Analysis" : "📋 產品規格與保證營養分析"}</h2><div className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-100">{specificationRows.map((row, index) => <div key={`${row.label}-${index}`} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 px-3 py-3 text-[13px] leading-relaxed sm:px-4"><dt className="min-w-0 break-words font-semibold text-stone-500">{row.label}</dt><dd className="min-w-0 break-words font-medium text-stone-800">{row.value}</dd></div>)}</div></div>
    </section>
    <section aria-label={locale === "en" ? "Delivery trust information" : "配送信任資訊"} className="grid grid-cols-1 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-[#ead8c8] bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {[{ icon: "🚚", title: locale === "en" ? "Free SF shipping" : "滿 HK$399 順豐免運", body: locale === "en" ? "Storewide qualifying orders" : "全單達門檻即享" }, { icon: "⚡", title: locale === "en" ? "Ships in 1–2 days" : "1–2 天現貨發貨", body: locale === "en" ? "Hong Kong in-stock items" : "香港現貨優先寄出" }, { icon: "🇯🇵", title: locale === "en" ? "Genuine Japan source" : "100% 日本原廠正貨", body: locale === "en" ? "Officially selected products" : "官方來源嚴選" }].map((item) => <div key={item.title} className="flex items-center gap-3 px-4 py-3 sm:block sm:px-3 sm:py-4"><span className="text-xl" aria-hidden>{item.icon}</span><div className="min-w-0"><p className="text-[13px] font-bold leading-relaxed text-stone-800">{item.title}</p><p className="text-[12px] leading-relaxed text-stone-500">{item.body}</p></div></div>)}
    </section>
  </div>;
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
  const { toOrderItems, itemCount, addItem } = useCart();
  const { products: catalogProducts } = useCatalog();
  const family = getProductFlavorFamily(product.id);
  const [selectedProductId, setSelectedProductId] = useState(product.id);
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const familyChoices = useMemo<FamilyChoice[]>(() => {
    if (!family) return [];
    const catalogById = new Map(catalogProducts.map((candidate) => [candidate.id, candidate]));
    return family.choices.flatMap((choice) => {
      const candidate = catalogById.get(choice.productId);
      return candidate ? [{ product: candidate, label: choice.label }] : [];
    });
  }, [catalogProducts, family]);
  useEffect(() => {
    setSelectedProductId(product.id);
    setSelectedSpecIndex(0);
  }, [product.id]);
  const selectedFamilyChoice = familyChoices.find((choice) => choice.product.id === selectedProductId);
  const selectedProduct = selectedFamilyChoice?.product ?? product;
  useEffect(() => {
    setSelectedSpecIndex(0);
  }, [selectedProduct.id]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [purchaseVisible, setPurchaseVisible] = useState(true);
  const [stickyAdded, setStickyAdded] = useState(false);
  const [stickyLoading, setStickyLoading] = useState(false);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const previousItemCount = useRef(itemCount);
  const selectedOption = selectedProduct.variants?.[selectedSpecIndex] ?? selectedProduct.variants?.[0];
  const selectedPrice = selectedOption?.price ?? selectedProduct.price;
  const selectedPriceId = selectedOption?.priceId ?? selectedProduct.priceId;
  const selectedOriginalPrice = selectedOption?.originalPrice ?? selectedProduct.originalPrice;
  const name = getLocalizedProductName(selectedProduct, locale) || t("productDescriptionUnavailable");
  const category = getCategoryBySlug(selectedProduct.categorySlug);
  const sku = selectedProduct.metadata?.mofu_sku?.trim() || selectedProduct.id;
  const barcode = getProductJanCode(product) ?? sku;
  const firstImage = selectedOption?.image || selectedProduct.images?.[0] || selectedProduct.image;
  const officialImages = OFFICIAL_PRODUCT_IMAGE_OVERRIDES[sku] ?? OFFICIAL_PRODUCT_IMAGE_OVERRIDES[selectedProduct.id];
  const galleryImages = officialImages ?? (selectedOption?.image ? [selectedOption.image] : selectedProduct.images);
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
    addItem(selectedProduct.id, selectedQty, selectedPriceId);
    setStickyAdded(true);
    window.dispatchEvent(new CustomEvent("mofu:open-cart"));
    window.setTimeout(() => setStickyLoading(false), 450);
  };
  const isFood = isPetBundleProduct(selectedProduct) || /(food|treat|snack|零食|小食|食品|肉乾|肉條|魚介|鮮肉|原肉)/i.test(JSON.stringify(selectedProduct));
  const quantityOptions = isFood ? PET_BUNDLE_QUANTITIES : undefined;
  const discountPercent = selectedOriginalPrice ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100) : null;
  useEffect(() => { trackMetaEvent("ViewContent", { content_type: "product", content_ids: [sku], content_name: name, content_sku: sku, value: selectedPrice, currency: "HKD" }); }, [name, selectedPrice, sku]);
  return <div className="min-h-screen bg-[#FFFFFF] text-stone-800"><main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-500"><CategoryNavLink href="/menu" className="font-medium hover:text-stone-800">{t("menuTitle")}</CategoryNavLink><span>/</span>{category ? <><CategoryNavLink href={categoryHref(category.slug)} className="font-medium hover:text-stone-800">{t(category.labelKey)}</CategoryNavLink><span>/</span></> : null}<span className="truncate text-stone-700">{name}</span></div><div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative"><ProductGallery key={`${selectedProduct.id}-${selectedPriceId}`} images={galleryImages} fallbackImage={primaryImage} alt={name} priority />{discountPercent ? <span className="absolute left-4 top-4 z-10 rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">-{discountPercent}%</span> : null}</div><section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-3"><h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">{name}</h1><WishlistButton productId={selectedProduct.id} className="h-11 w-11 shrink-0 text-xl" /></div><div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-2xl font-bold tracking-tight tabular-nums text-[#111111] sm:text-3xl">{formatMoney(selectedPrice, locale)}</span>{selectedOriginalPrice ? <span className="text-base text-stone-400 line-through">{formatMoney(selectedOriginalPrice, locale)}</span> : null}</div>{discountPercent ? <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-stone-500">{t("productDiscountBadge")}</p> : null}<MarketReferencePrice price={selectedProduct.marketReferencePrice} asOf={selectedProduct.marketReferenceAsOf} className="mt-2" /><FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />{family && familyChoices.length > 1 ? <div className="mt-5 rounded-xl bg-[#fbf3df] p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{family.selector[locale]}</p><span className="text-xs text-stone-500">{familyChoices.length} {locale === "zh" ? "款可選" : "choices"}</span></div><div className="mt-2 grid gap-2 sm:grid-cols-2">{familyChoices.map((choice) => <button key={choice.product.id} type="button" onClick={() => setSelectedProductId(choice.product.id)} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold ${choice.product.id === selectedProduct.id ? "border-[#111111] bg-white text-[#111111]" : "border-stone-200 bg-white text-stone-600"}`}>{choice.label[locale]}</button>)}</div></div> : null}{selectedProduct.variants?.length ? <div className="mt-5"><p className="text-sm font-bold">{selectedProduct.metadata?.variant_selection_label_zh || t("productSpecSelectorTitle")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{selectedProduct.variants!.map((variant, index) => <button key={variant.key} type="button" onClick={() => setSelectedSpecIndex(index)} className={`rounded-xl border p-3 text-left text-sm ${selectedSpecIndex === index ? "border-2 border-[#111111] bg-white text-[#111111]" : "border-stone-200 bg-white text-stone-700"}`}><span className="block font-semibold">{variant.label[locale] || variant.label.zh}</span><span className="mt-1 block text-xs text-stone-500">{formatMoney(variant.price, locale)}{variant.unitLabel?.[locale] ? ` · ${variant.unitLabel[locale]}` : ""}</span></button>)}</div></div> : null}{selectedProduct.inStock !== false ? <div ref={purchaseRef} className="mt-6"><p className="mb-2 text-sm font-bold">{t("productPurchaseQuantity")}</p><AddToCartButton productId={selectedProduct.id} priceId={selectedPriceId} size="modal" quantityOptions={quantityOptions} quantity={selectedQty} onQuantityChange={setSelectedQty} showBulkShortcuts showTotal unitPrice={selectedPrice} className="[&>button:last-child]:rounded-full [&>button:last-child]:py-4" /></div> : <div ref={purchaseRef} className="mt-6 rounded-2xl border border-stone-200 bg-[#FAFAFA] p-4 text-stone-800"><p className="font-bold">{t("productSoldOut")}</p><p className="mt-1 text-sm text-stone-600">{t("productOutOfStockMessage")}</p><BackInStockAlertButton productId={selectedProduct.id} /></div>}</section></div><RichProductContent product={selectedProduct} locale={locale} sku={barcode} /></main>{selectedProduct.inStock === false ? null : <MobileStickyCartBar product={selectedProduct} name={name} price={selectedPrice} image={primaryImage} visible={!purchaseVisible} basketCount={itemCount} basketTotal={cartSubtotal} added={stickyAdded} loading={stickyLoading} locale={locale} onAdd={handleStickyAdd} />}</div>;
}
