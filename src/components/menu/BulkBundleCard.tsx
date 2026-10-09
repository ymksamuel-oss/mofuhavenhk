"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type Locale } from "@/lib/i18n/translations";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/order";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";

const PACK_COUNTS = [6, 9, 12] as const;

function packCount(product: Product): number {
  const value = Number(product.metadata?.bulk_pack_count);
  return Number.isInteger(value) && PACK_COUNTS.includes(value as (typeof PACK_COUNTS)[number]) ? value : 0;
}

function averagePrice(amount: number, locale: Locale): string {
  const numberLocale = locale === "en" ? "en-HK" : "zh-HK";
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(amount);
}

function packLabel(count: number, locale: Locale): string {
  if (locale === "en") return `${count}-pack${count === 9 ? " 🔥" : ""}`;
  return `${count}包裝${count === 9 ? " 🔥" : ""}`;
}

export function BulkBundleCard({ products, priority = false }: { products: Product[]; priority?: boolean }) {
  const { locale } = useI18n();
  const tiers = [...products]
    .filter((product) => packCount(product) > 0)
    .sort((a, b) => packCount(a) - packCount(b));
  const featured = tiers[0] ?? products[0];
  const defaultTier = tiers.find((product) => packCount(product) === 9 && product.inStock !== false)
    ?? tiers.find((product) => product.inStock !== false)
    ?? tiers.find((product) => packCount(product) === 9)
    ?? featured;
  const [selectedPackCount, setSelectedPackCount] = useState(9);
  const [quantity, setQuantity] = useState(1);
  const selectedTier = tiers.find((product) => packCount(product) === selectedPackCount && product.inStock !== false)
    ?? defaultTier;
  const selectedCount = selectedTier ? packCount(selectedTier) : selectedPackCount;
  const name = (getLocalizedProductName(featured, locale) || featured?.name.zh || featured?.name.en || "")
    .replace(/\s+(?:【(?:6|9|12)包裝】[^\s]+|— (?:6-pack Sharing|9-pack Family|12-pack Value Case))$/u, "");
  const href = featured ? `/product/${encodeURIComponent(featured.id)}` : "/collections/value-bundles";
  const shippingLabel = selectedTier && selectedTier.price >= FREE_SHIPPING_THRESHOLD
    ? (locale === "en" ? " · Free shipping" : "・免運")
    : (locale === "en" ? ` · Free shipping over HK$${FREE_SHIPPING_THRESHOLD}` : `・全單滿 HK$${FREE_SHIPPING_THRESHOLD} 免運`);
  const selectedHint = selectedCount === 9
    ? shippingLabel
    : selectedCount === 12
      ? (locale === "en" ? " · Best value" : "・最抵")
      : "";

  return (
    <article className="group flex h-full min-h-[390px] min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative mx-auto aspect-square w-full max-w-[196px] overflow-hidden bg-stone-50">
          <ProductImage
            src={featured?.images?.[0] ?? "catalog-placeholder"}
            alt={name}
            sizes="(max-width: 768px) 50vw, 196px"
            priority={priority}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-stone-900/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
            {locale === "en" ? "Popular bulk" : "人氣量販"}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <h2 className="mb-2 line-clamp-2 min-h-9 text-sm font-semibold leading-5 text-stone-800 sm:text-base">{name}</h2>

        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={locale === "en" ? "Choose a pack size" : "選擇量販規格"}>
          {PACK_COUNTS.map((count) => {
            const tier = tiers.find((product) => packCount(product) === count);
            const isSelected = Boolean(tier && selectedTier?.id === tier.id);
            const isUnavailable = !tier || tier.inStock === false;
            const accessibleLabel = count === 9
              ? (locale === "en" ? "9-pack, popular choice" : "9包裝，熱銷量販")
              : packLabel(count, locale);
            return (
              <button
                key={count}
                type="button"
                disabled={isUnavailable}
                aria-label={accessibleLabel}
                aria-pressed={isSelected}
                onClick={() => setSelectedPackCount(count)}
                className={`min-w-0 whitespace-nowrap rounded-lg px-1 py-1 text-[9px] font-medium transition sm:px-2.5 sm:text-xs ${isSelected
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {packLabel(count, locale)}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex min-h-10 items-center justify-between gap-2" aria-live="polite">
          <div className="min-w-0">
            <p className="text-[10px] leading-4 text-stone-500 sm:text-xs">
              {selectedTier && selectedCount ? `${locale === "en" ? "Avg." : "平均"} ${averagePrice(selectedTier.price / selectedCount, locale)}${locale === "en" ? "/pack" : "／包"}${selectedHint}` : null}
            </p>
          </div>
          {selectedTier ? (
            <div className="shrink-0 text-right">
              {selectedTier.originalPrice && selectedTier.originalPrice > selectedTier.price
                ? <p className="text-[10px] leading-4 text-stone-400 line-through">{formatMoney(selectedTier.originalPrice, locale)}</p>
                : null}
              <p className="text-sm font-extrabold tabular-nums text-stone-900">{formatMoney(selectedTier.price, locale)}</p>
            </div>
          ) : null}
        </div>

        {selectedTier ? (
          <div className="mt-2">
            <AddToCartButton
              productId={selectedTier.id}
              unitPrice={selectedTier.price}
              quantity={quantity}
              onQuantityChange={setQuantity}
              size="bulk"
              showQuantity
              showBulkShortcuts={false}
            />
          </div>
        ) : null}
        {tiers.length !== 3
          ? <p className="mt-2 text-xs text-amber-700">{locale === "en" ? "Some pack sizes are temporarily unavailable." : "部分量販規格暫時未能供應。"}</p>
          : null}
      </div>
    </article>
  );
}
