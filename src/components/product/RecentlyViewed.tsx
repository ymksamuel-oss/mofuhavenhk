"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/translations";

export function RecentlyViewed({
  products,
  recentIds,
  currentProductId,
  locale,
  onClear,
}: {
  products: Product[];
  recentIds: string[];
  currentProductId: string;
  locale: Locale;
  onClear: () => void;
}) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const recentlyViewedProducts = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return recentIds
      .filter((id) => id !== currentProductId)
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product && product.inStock !== false));
  }, [currentProductId, products, recentIds]);

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
  }, [recentlyViewedProducts.length]);

  if (recentlyViewedProducts.length === 0) return null;

  const scrollByCards = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };
  const isZh = locale === "zh";

  return (
    <section className="mt-8" aria-labelledby="recently-viewed-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 id="recently-viewed-title" className="text-xl font-bold text-stone-800">
          {isZh ? "👀 最近瀏覽過" : "👀 Recently Viewed"}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-[#a76443] hover:text-[#8b573f]"
          >
            {isZh ? "清除紀錄" : "Clear"}
          </button>
          <button type="button" onClick={() => scrollByCards(-1)} disabled={!canScrollLeft} aria-label={isZh ? "查看較早瀏覽商品" : "Show earlier viewed products"} className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-lg leading-none text-stone-700 shadow-sm transition hover:border-[#a76443] disabled:cursor-not-allowed disabled:opacity-35">‹</button>
          <button type="button" onClick={() => scrollByCards(1)} disabled={!canScrollRight} aria-label={isZh ? "查看更多最近瀏覽商品" : "Show more recently viewed products"} className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-lg leading-none text-stone-700 shadow-sm transition hover:border-[#a76443] disabled:cursor-not-allowed disabled:opacity-35">›</button>
        </div>
      </div>
      <ul ref={scrollRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={isZh ? "最近瀏覽商品" : "Recently viewed products"}>
        {recentlyViewedProducts.map((product) => {
          const name = getLocalizedProductName(product, locale);
          return (
            <li key={product.id} className="w-[145px] min-w-[145px] snap-start sm:w-[150px] sm:min-w-[150px]">
              <article className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#d7b394]">
                <Link href={productHref(product.id)} className="block" aria-label={isZh ? `查看商品：${name}` : `View product: ${name}`}>
                  <div className="relative aspect-square bg-[#FAF7F2]">
                    <ProductImage src={product.images?.[0] ?? product.image} alt={name} sizes="150px" className="object-contain mix-blend-multiply p-2" />
                  </div>
                  <h3 className="line-clamp-2 min-h-10 px-3 pt-2.5 text-xs font-semibold leading-5 text-stone-800">{name}</h3>
                </Link>
                <div className="flex items-center justify-between gap-1.5 px-3 pb-3 pt-2">
                  <span className="truncate text-xs font-bold text-[#8b573f]">{formatMoney(product.price, locale)}</span>
                  <AddToCartButton productId={product.id} priceId={product.priceId} size="card" showQuantity={false} compact />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
