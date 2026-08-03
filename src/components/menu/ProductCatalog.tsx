"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductQuickView } from "@/components/menu/ProductQuickView";
import { WishlistHeartButton } from "@/components/menu/WishlistHeartButton";
import {
  CATEGORIES,
  categoryHref,
  getCategoryBySlug,
} from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, type Product } from "@/lib/products";

function chipClassName(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
  }`;
}

type ProductCatalogProps = {
  /** `null` = full catalog (`/menu`); otherwise a category slug page. */
  categorySlug: string | null;
};

/**
 * Shared catalog UI for `/menu` (all products) and `/categories/[slug]`.
 * Category chips navigate to dedicated category pages.
 */
export function ProductCatalog({ categorySlug }: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const category = getCategoryBySlug(categorySlug);
  const products = getProductsByCategory(categorySlug);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const title = category ? t(category.labelKey) : t("menuTitle");
  const subtitle = category ? t("categoryPageSubtitle") : t("menuSubtitle");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">{subtitle}</p>
      </header>

      <nav
        aria-label={t("categoryNavLabel")}
        className="mb-8 flex flex-wrap gap-2"
      >
        <Link href="/menu" className={chipClassName(!categorySlug)}>
          {t("menuAllCategories")}
        </Link>
        {CATEGORIES.map(({ slug, labelKey }) => (
          <Link
            key={slug}
            href={categoryHref(slug)}
            className={chipClassName(categorySlug === slug)}
          >
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;

            return (
              <li
                key={product.id}
                className="milk-tea-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(74,54,38,0.6)]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--background)]">
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(product)}
                    aria-label={`${t("productViewDetails")}: ${product.name[locale]}`}
                    className="absolute inset-0 text-left"
                  >
                    <Image
                      src={product.image}
                      alt={product.name[locale]}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[color:var(--ink)]/0 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:bg-[color:var(--ink)]/20 group-hover:opacity-100">
                      {t("productViewDetails")}
                    </span>
                  </button>

                  {discountPercent ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  ) : null}

                  <WishlistHeartButton
                    productId={product.id}
                    className="absolute right-2.5 top-2.5 z-10"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(product)}
                    className="text-left text-sm font-medium leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                  >
                    {product.name[locale]}
                  </button>
                  {product.description ? (
                    <p className="text-xs leading-snug text-[color:var(--muted)]">
                      {product.description[locale]}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
                    <p className="text-lg font-semibold tabular-nums text-[color:var(--accent)]">
                      {formatMoney(product.price, locale)}
                    </p>
                    {product.originalPrice ? (
                      <p className="text-xs tabular-nums text-[color:var(--muted)] line-through">
                        {formatMoney(product.originalPrice, locale)}
                      </p>
                    ) : null}
                  </div>
                  <AddToCartButton productId={product.id} size="card" />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {quickViewProduct ? (
        <ProductQuickView
          product={quickViewProduct}
          locale={locale}
          t={t}
          onClose={() => setQuickViewProduct(null)}
        />
      ) : null}
    </div>
  );
}
