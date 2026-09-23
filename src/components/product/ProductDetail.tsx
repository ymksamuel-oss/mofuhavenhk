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
import { OutOfStockOrderButton } from "@/components/product/OutOfStockOrderButton";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type Locale } from "@/lib/i18n/translations";
import { calcSubtotal, isPetBundleProduct, PET_BUNDLE_QUANTITIES } from "@/lib/order";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/shop/cart";
import { useCatalog } from "@/lib/catalog-context";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref } from "@/lib/products";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { ShoppingCart } from "lucide-react";
import {
  parseProductContent,
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

function isVenisonProduct(product: Product, sku: string): boolean {
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? [])].filter(Boolean).join(" ");
  return VENISON_SKUS.has(sku) || /鹿肉|蝦夷鹿|venison|ezo deer/i.test(text);
}

function RichProductContent({ product, locale, sku, firstImage }: { product: Product; locale: Locale; sku: string; firstImage: string }) {
  const [tab, setTab] = useState<"details" | "notes">("details");
  const [open, setOpen] = useState(true);
  const text = locale === "zh" ? product.description?.zh || product.description?.[locale] || "" : product.description?.[locale] || product.description?.zh || "";
  const rich: RichProductContent = useMemo(() => parseProductContent(text, product, locale), [text, product, locale]);
  return <div className="mt-8 space-y-5">
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"><span className="font-bold">✨ 商品特色</span><span className="text-xl text-stone-400" aria-hidden>{open ? "−" : "+"}</span></button>
      {open ? <div className="border-t border-stone-100 px-4 pb-5 pt-4 sm:px-5">{rich.highlights.length ? <ul className="space-y-2 text-sm leading-6 text-stone-700">{rich.highlights.map((item, index) => <li key={`${item}-${index}`}>✨ {item}</li>)}</ul> : null}{rich.spotlight ? <div className="mt-4 rounded-xl bg-[#fbf3df] p-4"><p className="whitespace-pre-line text-sm leading-6 text-stone-600">{rich.spotlight}</p></div> : null}</div> : null}
    </section>
    {isVenisonProduct(product, sku) ? <Link href="/blog/dog-food-venison-benefits" className="flex items-center justify-between rounded-2xl border border-[#e2c4a8] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-[#8b573f] transition hover:border-[#b17a56] hover:bg-[#fff2e3]"><span>💡 想了解更多鹿肉營養？</span><span>閱讀【日本獸醫鹿肉解析專欄 →】</span></Link> : null}
    <div className="flex rounded-xl bg-stone-100 p-1" role="tablist" aria-label="商品內容分頁"><button type="button" role="tab" aria-selected={tab === "details"} onClick={() => setTab("details")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "details" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>詳細說明</button><button type="button" role="tab" aria-selected={tab === "notes"} onClick={() => setTab("notes")} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${tab === "notes" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>商品推薦／購物須知</button></div>
    {tab === "details" ? <div className="space-y-5">
      <div className="my-6">
        <section className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-[#ECE5D8] bg-[#FAF7F2] p-6"><span className="absolute right-4 top-4 z-10 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">🇯🇵 日本原裝・無添加</span><ProductImage src={firstImage} alt={product.name.zh} sizes="(min-width: 768px) 440px, 100vw" priority className="object-contain mix-blend-multiply" /></section>
      </div>
      {rich.texture ? <section className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">🐾 食感與硬度</h2></div><p className="mt-2 text-sm leading-6 text-stone-600">{rich.texture}</p></section> : null}
      {rich.feeding.length ? <section><h2 className="mb-3 text-lg font-bold">🍽️ 餵食／使用方式</h2><div className="grid gap-3 sm:grid-cols-2">{rich.feeding.map((item, index) => <article key={`${item}-${index}`} className="rounded-2xl border border-stone-200 bg-[#fffdf9] p-4"><p className="text-sm font-bold leading-6">{item}</p></article>)}</div></section> : null}
      {rich.notes.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-bold text-amber-900">💛 貼心叮嚀</h2><ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900/80">{rich.notes.map((note, index) => <li key={`${note}-${index}`}>・{note}</li>)}</ul></section> : null}
    </div> : <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-lg font-bold">🛍️ 購物須知</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600"><li>📦 香港現貨一般於下單後 1–2 個工作天內由順豐寄出。</li><li>✈️ 日本預訂／直送商品約需 7–14 個工作天，遇日本節假日或會順延。</li><li>🧺 同單含現貨與預訂品將一併發貨；全單滿 HK$399 享本地順豐免運。</li><li>💬 如對產品的餵食方式、食材或保存方法有疑問，歡迎聯絡我們。</li></ul></section>}
  </div>;
}


function PdpRecommendationCarousel({ products, locale }: { products: Product[]; locale: Locale }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updateScrollState = () => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  };
  useEffect(() => {
    updateScrollState();
    const element = scrollRef.current;
    if (!element) return;
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length]);
  const scrollByCards = (direction: -1 | 1) => scrollRef.current?.scrollBy({ left: direction * 260, behavior: "smooth" });
  return <section className="mt-8" aria-labelledby="pdp-recommendations">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">MOFU HAVEN PICKS</p><h2 id="pdp-recommendations" className="mt-1 text-xl font-bold">{locale === "zh" ? "你可能會喜歡" : "You May Also Like"}</h2></div>
      <div className="flex shrink-0 gap-1.5" aria-label={locale === "zh" ? "推薦商品導航" : "Recommendation navigation"}>
        <button type="button" onClick={() => scrollByCards(-1)} disabled={!canScrollLeft} aria-label={locale === "zh" ? "查看上一批推薦" : "Show previous recommendations"} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-xl leading-none text-stone-700 shadow-sm transition hover:border-[#a76443] disabled:cursor-not-allowed disabled:opacity-35">‹</button>
        <button type="button" onClick={() => scrollByCards(1)} disabled={!canScrollRight} aria-label={locale === "zh" ? "查看下一批推薦" : "Show more recommendations"} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-xl leading-none text-stone-700 shadow-sm transition hover:border-[#a76443] disabled:cursor-not-allowed disabled:opacity-35">›</button>
      </div>
    </div>
    <ul ref={scrollRef} onScroll={updateScrollState} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={locale === "zh" ? "推薦商品" : "Recommended products"}>
      {products.map((recommendation) => { const recommendationName = getLocalizedProductName(recommendation, locale); return <li key={recommendation.id} className="w-[168px] min-w-[168px] snap-start sm:w-[190px] sm:min-w-[190px]"><article className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><Link href={productHref(recommendation.id)} className="block cursor-pointer transition-opacity hover:opacity-80" aria-label={locale === "zh" ? `查看商品：${recommendationName}` : `View product: ${recommendationName}`}><div className="relative aspect-square bg-[#f5f0e9]"><ProductImage src={recommendation.images?.[0] ?? recommendation.image} alt={recommendationName} sizes="190px" className="object-contain p-2" /></div><h3 className="line-clamp-2 min-h-10 px-3 pt-3 text-sm font-semibold leading-5">{recommendationName}</h3></Link><div className="flex items-center justify-between gap-2 px-3 pb-3 pt-2"><span className="text-sm font-bold text-[#8b573f]">{formatMoney(recommendation.price, locale)}</span><AddToCartButton productId={recommendation.id} priceId={recommendation.priceId} size="card" showQuantity={false} compact /></div></article></li>; })}
    </ul>
  </section>;
}

function MobileStickyCartBar({ product, name, price, visible, basketCount, basketTotal, added, locale, onAdd }: {
  product: Product;
  name: string;
  price: number;
  visible: boolean;
  basketCount: number;
  basketTotal: number;
  added: boolean;
  locale: Locale;
  onAdd: () => void;
}) {
  const openCart = () => window.dispatchEvent(new CustomEvent("mofu:open-cart"));
  return <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-stone-200 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] pt-2 shadow-[0_-12px_30px_-18px_rgba(43,38,35,0.45)] backdrop-blur-md transition-all duration-300 sm:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`} aria-hidden={!visible}>
    {added ? <div className="flex items-center gap-2">
      <button type="button" onClick={openCart} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#faf7f2] px-3 py-2 text-left ring-1 ring-stone-200" aria-label={locale === "en" ? "Open shopping cart" : "開啟購物籃"}>
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b573f] text-white"><ShoppingCart className="h-4 w-4" aria-hidden="true" /><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{basketCount}</span></span>
        <span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-700">{locale === "en" ? `Basket: ${basketCount} item${basketCount === 1 ? "" : "s"}` : `購物籃已有 ${basketCount} 件商品`}</span><span className="block text-sm font-bold text-[#8b573f]">{formatMoney(basketTotal, locale)}</span></span>
      </button>
      <a href="/checkout" className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95">{locale === "en" ? "Checkout 💳" : "立即結帳 💳"}</a>
    </div> : <div className="flex items-center gap-2">
      <button type="button" onClick={openCart} className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-[#faf7f2] text-[#8b573f]" aria-label={locale === "en" ? "Open shopping cart" : "開啟購物籃"}><ShoppingCart className="h-5 w-5" aria-hidden="true" />{basketCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8b573f] px-1 text-[10px] font-bold text-white">{basketCount}</span> : null}</button>
      <div className="min-w-0 flex-1"><p className="truncate text-xs text-stone-500">{name}</p><p className="text-base font-bold text-[#8b573f]">{formatMoney(price, locale)}</p></div>
      <button type="button" onClick={onAdd} disabled={product.inStock === false} className="h-12 shrink-0 rounded-xl bg-[#8b573f] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#6f432f] active:scale-95 disabled:opacity-50">{locale === "en" ? "+ Add to cart" : "加入購物車"}</button>
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
  const purchaseRef = useRef<HTMLDivElement>(null);
  const previousItemCount = useRef(itemCount);
  const selectedOption = product.variants?.[selectedSpecIndex] ?? product.variants?.[0];
  const selectedPrice = selectedOption?.price ?? product.price;
  const selectedPriceId = selectedOption?.priceId ?? product.priceId;
  const selectedOriginalPrice = selectedOption?.originalPrice ?? product.originalPrice;
  const name = getLocalizedProductName(product, locale) || t("productDescriptionUnavailable");
  const category = getCategoryBySlug(product.categorySlug);
  const sku = product.metadata?.mofu_sku?.trim() || product.id;
  const firstImage = selectedOption?.image || product.images?.[0] || product.image;
  const officialImages = OFFICIAL_PRODUCT_IMAGE_OVERRIDES[sku] ?? OFFICIAL_PRODUCT_IMAGE_OVERRIDES[product.id];
  const galleryImages = officialImages ?? (selectedOption?.image ? [selectedOption.image] : product.images);
  const primaryImage = officialImages?.[0] || firstImage;
  const cartSubtotal = calcSubtotal(toOrderItems());
  useEffect(() => {
    const node = purchaseRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setPurchaseVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (itemCount > previousItemCount.current) setStickyAdded(true);
    previousItemCount.current = itemCount;
  }, [itemCount]);
  const isFood = isPetBundleProduct(product) || /(food|treat|snack|零食|小食|食品|肉乾|肉條|魚介|鮮肉|原肉)/i.test(JSON.stringify(product));
  const quantityOptions = isFood ? PET_BUNDLE_QUANTITIES : undefined;
  const discountPercent = selectedOriginalPrice ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100) : null;
  const recommendations = useMemo(() => {
    const sameCategory = catalogProducts.filter((candidate) => candidate.id !== product.id && candidate.inStock !== false && candidate.categorySlug === product.categorySlug);
    const remaining = catalogProducts.filter((candidate) => candidate.id !== product.id && candidate.inStock !== false && !sameCategory.some((item) => item.id === candidate.id));
    return [...sameCategory, ...remaining].slice(0, 4);
  }, [catalogProducts, product.categorySlug, product.id]);
  useEffect(() => { trackMetaEvent("ViewContent", { content_type: "product", content_ids: [sku], content_name: name, content_sku: sku, value: selectedPrice, currency: "HKD" }); }, [name, selectedPrice, sku]);
  return <div className="min-h-screen bg-[#faf7f2] text-stone-800"><main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-500"><CategoryNavLink href="/menu" className="font-medium hover:text-stone-800">{t("menuTitle")}</CategoryNavLink><span>/</span>{category ? <><CategoryNavLink href={categoryHref(category.slug)} className="font-medium hover:text-stone-800">{t(category.labelKey)}</CategoryNavLink><span>/</span></> : null}<span className="truncate text-stone-700">{name}</span></div><div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative"><ProductGallery key={`${product.id}-${selectedPriceId}`} images={galleryImages} fallbackImage={primaryImage} alt={name} priority />{discountPercent ? <span className="absolute left-4 top-4 z-10 rounded-full bg-[#b84d3d] px-3 py-1 text-xs font-bold text-white shadow">-{discountPercent}%</span> : null}</div><section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-3"><h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">{name}</h1><WishlistButton productId={product.id} className="h-11 w-11 shrink-0 text-xl" /></div><div className="mt-5 flex flex-wrap items-baseline gap-3"><span className="text-4xl font-extrabold tabular-nums text-[#8b573f]">{formatMoney(selectedPrice, locale)}</span>{selectedOriginalPrice ? <span className="text-base text-stone-400 line-through">{formatMoney(selectedOriginalPrice, locale)}</span> : null}</div>{discountPercent ? <p className="mt-1 text-sm font-semibold text-[#b84d3d]">{t("productDiscountBadge")}</p> : null}<MarketReferencePrice price={product.marketReferencePrice} asOf={product.marketReferenceAsOf} className="mt-2" /><FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />{product.variants?.length ? <div className="mt-5"><p className="text-sm font-bold">{product.metadata?.variant_selection_label_zh || t("productSpecSelectorTitle")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{product.variants.map((variant, index) => <button key={variant.key} type="button" onClick={() => setSelectedSpecIndex(index)} className={`rounded-xl border p-3 text-left text-sm ${selectedSpecIndex === index ? "border-[#8b573f] bg-[#f7eee7]" : "border-stone-200 bg-white"}`}><span className="block font-semibold">{variant.label[locale] || variant.label.zh}</span><span className="mt-1 block text-xs text-stone-500">{formatMoney(variant.price, locale)}{variant.unitLabel?.[locale] ? ` · ${variant.unitLabel[locale]}` : ""}</span></button>)}</div></div> : null}{product.inStock !== false ? <div ref={purchaseRef} className="mt-6"><p className="mb-2 text-sm font-bold">{t("productPurchaseQuantity")}</p><AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" quantityOptions={quantityOptions} quantity={selectedQty} onQuantityChange={setSelectedQty} showBulkShortcuts showTotal unitPrice={selectedPrice} className="[&>button:last-child]:rounded-xl [&>button:last-child]:py-3.5" /></div> : <div ref={purchaseRef} className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="font-bold">{t("productSoldOut")}</p><p className="mt-1 text-sm text-stone-600">{t("productOutOfStockMessage")}</p><OutOfStockOrderButton productId={product.id} productName={product.name} mofuSku={sku} className="mt-3" /></div>}</section></div><RichProductContent product={product} locale={locale} sku={sku} firstImage={primaryImage} /><BundleContentsCard product={product} catalog={catalogProducts} />{recommendations.length ? <PdpRecommendationCarousel products={recommendations} locale={locale} /> : null}<RecentlyViewed products={catalogProducts} recentIds={recentIds} currentProductId={product.id} locale={locale} onClear={clearRecentlyViewed} /><FAQAccordion /><ProductFAQ /></main><MobileStickyCartBar product={product} name={name} price={selectedPrice} visible={!purchaseVisible} basketCount={itemCount} basketTotal={cartSubtotal} added={stickyAdded} locale={locale} onAdd={() => { addItem(product.id, selectedQty, selectedPriceId); setStickyAdded(true); }} /></div>;
}
