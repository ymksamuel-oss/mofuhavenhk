"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";

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
  const [addedId, setAddedId] = useState<string | null>(null);
  const excludedIds = useMemo(() => new Set(cartProductIds), [cartProductIds]);
  const firstProduct = products.find((product) => product.id === cartProductIds[0]);
  const recommendations = useMemo(() => products
    .filter((product) => product.inStock !== false && !excludedIds.has(product.id))
    .sort((a, b) => recommendationScore(b, firstProduct) - recommendationScore(a, firstProduct) || a.price - b.price)
    .slice(0, 3), [excludedIds, firstProduct, products]);

  useEffect(() => {
    if (!addedId) return;
    const timer = window.setTimeout(() => setAddedId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [addedId]);

  if (!recommendations.length) return null;

  const handleAdd = (productId: string) => {
    addItem(productId);
    setAddedId(productId);
    onAdded?.(productId);
  };

  return (
    <section className={`border-t border-[color:var(--line)] pt-5 ${className}`} aria-labelledby="you-may-also-like-title">
      <div className="mb-3">
        <h2 id="you-may-also-like-title" className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]">
          ✨ You May Also Like
        </h2>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Popular additions from other pet parents</p>
      </div>
      <ul className="space-y-2.5">
        {recommendations.map((product) => {
          const name = getLocalizedProductName(product, locale);
          const isAdded = addedId === product.id;
          return (
            <li key={product.id} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[color:var(--line)] bg-white p-2.5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2] ring-1 ring-[color:var(--line)]">
                <ProductImage src={product.images?.[0] ?? product.image ?? "catalog-placeholder"} alt={name} sizes="48px" className="object-contain mix-blend-multiply" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-[color:var(--ink)]">{name}</p>
                <p className="mt-1 text-sm font-bold tabular-nums text-[color:var(--accent)]">{formatMoney(product.price, locale)}</p>
              </div>
              <button type="button" onClick={() => handleAdd(product.id)} disabled={isAdded} className="shrink-0 rounded-full bg-[color:var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--hero-deep)] disabled:cursor-default disabled:bg-emerald-700 active:scale-[0.97]">
                {isAdded ? "Added ✓" : "+ Add"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
