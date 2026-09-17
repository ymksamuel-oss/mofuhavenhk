"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getBilingualProductName, getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";

export function BrandProductCard({ product }: { product: Product }) {
  const { locale, languageMode } = useI18n();
  const name = languageMode === "bilingual" ? getBilingualProductName(product) : getLocalizedProductName(product, locale);
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <Link href={productHref(product.id)} className="relative block aspect-square overflow-hidden bg-[#fbf5ed]">
        <ProductImage src={product.images?.[0] || "catalog-placeholder"} alt={name} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <Link href={productHref(product.id)} className="line-clamp-3 min-h-10 whitespace-pre-line text-sm font-semibold text-[#3e2d25]">{name}</Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div><strong className="text-lg text-[#7a4b31]">{formatMoney(product.price, locale)}</strong>{product.originalPrice ? <span className="ml-2 text-xs text-[#8b7c70] line-through">{formatMoney(product.originalPrice, locale)}</span> : null}</div>
          <AddToCartButton productId={product.id} size="card" />
        </div>
      </div>
    </li>
  );
}
