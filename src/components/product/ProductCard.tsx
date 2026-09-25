"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatusBadges } from "@/components/product/ProductStatusBadges";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";
import englishDictionary from "@/data/product-english-dictionary.json";
import homepageEnglishNames from "@/data/mofu-homepage-featured.json";

export function ProductCard({ product, priority = false, showPurchaseControls = false }: { product: Product; priority?: boolean; showPurchaseControls?: boolean }) {
  const { locale, t } = useI18n();
  const directEnglishName = typeof (product as Product & { name_en?: unknown }).name_en === "string"
    ? (product as Product & { name_en: string }).name_en.trim()
    : "";
  const productSku = String(
    (product as Product & { sku?: string | number }).sku
      || product.metadata?.mofu_sku
      || product.tags?.find((tag) => /^\d{8,14}$/.test(tag))
      || "",
  ).trim();
  const dictName = locale === "en"
    ? (englishDictionary as Record<string, string>)[productSku]
    : "";
  const homepageEnglishName = locale === "en"
    ? (homepageEnglishNames as Record<string, string>)[productSku]
    : "";
  const getProductTitle = () => {
    if (locale === "en") {
      if (dictName) return dictName;
      if (homepageEnglishName) return homepageEnglishName;
      if (directEnglishName && !/[\u4e00-\u9fa5]/.test(directEnglishName)) return directEnglishName;
    }
    return getLocalizedProductName(product, locale) || "商品";
  };
  const cardTitle = getProductTitle();
  const displayName = cardTitle;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ECE5D8] bg-[#FFFCF8] shadow-[0_14px_32px_-26px_rgba(84,57,45,0.42)] transition-all duration-200 hover:-translate-y-1 hover:border-[#DCCBB8] hover:shadow-[0_24px_40px_-24px_rgba(84,57,45,0.28)]">
      <Link href={productHref(product.id)} aria-label={`${t("productViewDetails")}: ${displayName}`} className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#FAF7F2] p-2.5 sm:p-3">
          <div className="absolute left-2 right-2 top-2 z-10 flex flex-wrap items-start justify-start gap-1.5">
            {hasDiscount ? <span className="max-w-full shrink-0 rounded-full border border-[#c0483a]/25 bg-[#fff1ed] px-1.5 py-0.5 text-[9px] font-bold leading-4 text-[#a2382e] sm:px-2 sm:text-[10px]">{locale === "zh" ? "限時特惠" : "LIMITED OFFER"}</span> : null}
            <ProductStatusBadges product={product} className="!static !z-0 min-w-0 flex-none justify-start gap-1.5" />
          </div>
          <ProductImage
            src={product.images?.[0] ?? "catalog-placeholder"}
            alt={displayName}
            priority={priority}
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="h-[6.25rem] min-w-0 flex-1 items-start overflow-hidden px-2.5 pb-3 pt-2.5 sm:h-[6.5rem] sm:px-3 sm:pb-3.5 sm:pt-3">
          <h3 className="line-clamp-3 break-words text-left text-xs font-medium leading-5 text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)] sm:text-sm">{displayName}</h3>
        </div>
      </Link>
      <div className="absolute right-2 top-2 z-20"><WishlistButton productId={product.id} /></div>
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
