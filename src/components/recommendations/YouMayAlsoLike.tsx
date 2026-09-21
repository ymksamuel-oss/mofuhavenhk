"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";

type YouMayAlsoLikeProps = {
  cartProductIds: string[];
  className?: string;
  onAdded?: (productId: string) => void;
};

function recommendationScore(product: Product, firstProduct?: Product): number {
  let score = 0;
  if (firstProduct?.categorySlug && product.categorySlug === firstProduct.categorySlug) score += 50;
  if (product.price < 90) score += 30;
  if (product.inStock !== false) score += 10;
  if (product.metadata?.featured === "true" || product.metadata?.is_featured === "true") score += 8;
  if (product.createdAt && Date.now() - product.createdAt * 1000 <= 14 * 24 * 60 * 60 * 1000) score += 4;
  return score;
}

export function YouMayAlsoLike({ cartProductIds, className = "", onAdded }: YouMayAlsoLikeProps) {
  const { locale } = useI18n();
  const { products } = useCatalog();
  const { addItem } = useCart();
  const carouselRef = useRef<HTMLUListElement>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const excludedIds = useMemo(() => new Set(cartProductIds), [cartProductIds]);
  const firstProduct = products.find((product) => product.id === cartProductIds[0]);
  const recommendations = useMemo(() => products
    .filter((product) => product.inStock !== false && !excludedIds.has(product.id))
    .sort((a, b) => recommendationScore(b, firstProduct) - recommendationScore(a, firstProduct) || a.price - b.price)
    .slice(0, 10), [excludedIds, firstProduct, products]);

  const updateScrollState = useCallback(() => {
    const element = carouselRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const element = carouselRef.current;
    if (!element) return;
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [recommendations.length, updateScrollState]);

  useEffect(() => {
    if (!addedId) return;
    const timer = window.setTimeout(() => setAddedId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [addedId]);

  if (!recommendations.length) return null;

  const scrollByCards = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  const handleAdd = (productId: string) => {
    addItem(productId);
    setAddedId(productId);
    onAdded?.(productId);
  };

  return (
    <section className={`border-t border-[color:var(--line)] pt-5 ${className}`} aria-labelledby="you-may-also-like-title">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="you-may-also-like-title" className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]">
            {locale === "zh" ? "✨ 你可能會喜歡" : "✨ You May Also Like"}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {locale === "zh" ? "挑選更多熱門搭配好物・一鍵加入購物車" : "Popular additions before checkout"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5" aria-label={locale === "zh" ? "推薦商品導航" : "Recommendation navigation"}>
          <button type="button" onClick={() => scrollByCards(-1)} disabled={!canScrollLeft} aria-label={locale === "zh" ? "查看上一批推薦" : "Show previous recommendations"} className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-lg leading-none text-[color:var(--ink)] transition hover:border-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40">‹</button>
          <button type="button" onClick={() => scrollByCards(1)} disabled={!canScrollRight} aria-label={locale === "zh" ? "查看下一批推薦" : "Show more recommendations"} className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-lg leading-none text-[color:var(--ink)] transition hover:border-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40">›</button>
        </div>
      </div>
      <ul ref={carouselRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={locale === "zh" ? "推薦商品" : "Recommended products"}>
        {recommendations.map((product) => {
          const name = getLocalizedProductName(product, locale);
          const isAdded = addedId === product.id;
          return (
            <li key={product.id} className="w-[140px] min-w-[140px] snap-start sm:w-[160px] sm:min-w-[160px]">
              <div className="h-full overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white p-2.5">
                <Link href={productHref(product.id)} className="block cursor-pointer transition-opacity hover:opacity-80" aria-label={locale === "zh" ? `查看商品：${name}` : `View product: ${name}`}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#FAF7F2] ring-1 ring-[color:var(--line)]">
                    <ProductImage src={product.images?.[0] ?? product.image ?? "catalog-placeholder"} alt={name} sizes="160px" className="object-contain mix-blend-multiply p-1" />
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-8 text-xs font-medium leading-snug text-[color:var(--ink)]">{name}</p>
                </Link>
                <p className="mt-1 text-sm font-bold tabular-nums text-[color:var(--accent)]">{formatMoney(product.price, locale)}</p>
                <button type="button" onClick={() => handleAdd(product.id)} disabled={isAdded} className="mt-2 w-full rounded-full bg-[color:var(--accent)] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--hero-deep)] disabled:cursor-default disabled:bg-emerald-700 active:scale-[0.97]">
                  {isAdded ? (locale === "zh" ? "已加入 ✓" : "Added ✓") : locale === "zh" ? "+ 加購" : "+ Add"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
