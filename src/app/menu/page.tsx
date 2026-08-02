"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { CATEGORIES } from "@/lib/categories";
import { getProductsByCategory, type Product } from "@/lib/products";
import { ProductQuickView } from "@/components/menu/ProductQuickView";

function chipClassName(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
  }`;
}

function MenuContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");
  const products = getProductsByCategory(activeSlug);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <span className="mb-2 inline-block rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
          {t("menuEyebrow")}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
          {t("menuTitle")}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">{t("menuSubtitle")}</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/menu" className={chipClassName(!activeSlug)}>
          {t("menuAllCategories")}
        </Link>
        {CATEGORIES.map(({ slug, labelKey }) => (
          <Link
            key={slug}
            href={`/menu?category=${slug}`}
            className={chipClassName(activeSlug === slug)}
          >
            {t(labelKey)}
          </Link>
        ))}
      </div>

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
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(product)}
                  aria-label={`${t("productViewDetails")}: ${product.name[locale]}`}
                  className="relative aspect-square w-full overflow-hidden bg-[color:var(--background)] text-left"
                >
                  {/* Real product photograph — full-bleed square crop, not
                      illustration badges or AI artwork. */}
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  {discountPercent ? (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  ) : null}
                  {/* Hover affordance hinting the image opens a detail view. */}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[color:var(--ink)]/0 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:bg-[color:var(--ink)]/20 group-hover:opacity-100">
                    {t("productViewDetails")}
                  </span>
                </button>
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
                  <Link
                    href={`/checkout?category=${product.categorySlug}`}
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_-9px_rgba(169,124,80,0.75)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_10px_20px_-9px_rgba(92,58,34,0.65)]"
                  >
                    {t("menuAddToCheckout")}
                  </Link>
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

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}
