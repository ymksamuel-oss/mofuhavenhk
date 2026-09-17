"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getLocalizedProductDescription, getLocalizedProductName } from "@/lib/translateProductName";
import { productHref, type Product } from "@/lib/products";

export function BrandProductCard({ product }: { product: Product }) {
  const { locale } = useI18n();
  const name = getLocalizedProductName(product, locale);
  const description = getLocalizedProductDescription(product, locale);
  return (
    <li className="min-w-0">
      <Link href={productHref(product.id)} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-[#fbf5ed]">
          <ProductImage src={product.images?.[0] || "catalog-placeholder"} alt={name} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-4">
          <span className="line-clamp-2 block font-semibold leading-6 text-[#3e2d25]">{name}</span>
          {description ? <span className="line-clamp-2 text-xs leading-5 text-[#8b7c70]">{description}</span> : null}
        </div>
      </Link>
    </li>
  );
}
