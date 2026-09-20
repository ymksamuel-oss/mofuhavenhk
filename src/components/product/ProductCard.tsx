"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatusBadges } from "@/components/product/ProductStatusBadges";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";

export function ProductCard({ product, priority = false, showPurchaseControls = false }: { product: Product; priority?: boolean; showPurchaseControls?: boolean }) {
  const { locale, t } = useI18n();
  const hasBrand = Boolean(product.brand?.trim() || product.brandName?.trim());
  const name = getLocalizedProductName(product, locale);
  const displayName = hasBrand
    ? name.replace(/Best\s*Partner/gi, "").replace(/\s{2,}/g, " ").trim()
    : name;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ECE5D8] bg-[#FFFCF8] shadow-[0_14px_32px_-26px_rgba(84,57,45,0.42)] transition-all duration-200 hover:-translate-y-1 hover:border-[#DCCBB8] hover:shadow-[0_24px_40px_-24px_rgba(84,57,45,0.28)]">
      <Link href={productHref(product.id)} aria-label={`${t("productViewDetails")}: ${displayName}`} className={`block min-w-0 ${showPurchaseControls ? "" : "h-full"}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F2] p-3 sm:p-4">
          <ProductStatusBadges product={product} className="right-2 top-2" />
          {hasDiscount ? <span className="absolute left-2 top-2 z-10 rounded-full border border-[#c0483a]/25 bg-[#fff1ed] px-2 py-0.5 text-[10px] font-bold leading-4 text-[#a2382e]">優惠</span> : null}
          <ProductImage
            src={product.images?.[0] ?? "catalog-placeholder"}
            alt={displayName}
            priority={priority}
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 px-3 pt-3 sm:px-4 sm:pt-4">
          <h3 className="line-clamp-3 min-h-[4.5rem] break-words text-left text-sm font-semibold leading-5 text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">{displayName}</h3>
        </div>
      </Link>
      {showPurchaseControls ? (
        <div className="mt-auto flex items-end justify-between gap-2 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
          <div className="min-w-0 tabular-nums">
            {hasDiscount ? <p className="truncate text-xs leading-4 text-[color:var(--muted)] line-through">{formatMoney(product.originalPrice!, locale)}</p> : null}
            <p className="whitespace-nowrap text-base font-bold leading-5 text-[color:var(--ink)]">{formatMoney(product.price, locale)}</p>
          </div>
          <AddToCartButton productId={product.id} priceId={product.priceId} size="card" showBulkShortcuts={false} className="shrink-0" />
        </div>
      ) : null}
    </article>
  );
}
