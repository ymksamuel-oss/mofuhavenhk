"use client";

import { useMemo } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductSearch } from "@/components/ProductSearch";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import {
  CATEGORIES,
  categoryHref,
  getCategoryBySlug,
} from "@/lib/categories";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, productHref } from "@/lib/products";

function categoryMenuLinkClassName(active: boolean) {
  return `group/link flex min-h-11 items-center justify-between border-b px-1 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
    active
      ? "border-[color:var(--accent)] font-semibold text-[color:var(--ink)]"
      : "border-[color:var(--line)]/70 font-medium text-[color:var(--muted)] hover:border-[color:var(--accent)]/70 hover:text-[color:var(--ink)]"
  }`;
}

function getProductBadge(product: {
  id: string;
  tags?: string[];
  metadata?: Record<string, string>;
  productType?: string;
  sourceCategory?: string;
}): "hot" | "new" | null {
  const source = [
    product.id,
    ...(product.tags ?? []),
    product.metadata?.badge,
    product.metadata?.label,
    product.productType,
    product.sourceCategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/熱賣|熱銷|bestseller|best seller|popular|hot/.test(source)) return "hot";
  if (/新品|新款|new|launch|wt-japan/.test(source)) return "new";
  return null;
}

type ProductCatalogProps = {
  /** `null` = full catalog (`/menu`); otherwise a category slug page. */
  categorySlug: string | null;
  /** Ignored legacy route parameters retained for route compatibility. */
  subcategory?: unknown;
  snackSeries?: unknown;
  /** Show the homepage-style search section on `/categories/...` pages only. */
  showProductSearch?: boolean;
};

/**
 * Shared catalog UI for `/menu`, `/categories/[slug]`, and
 * `/categories/[slug]/[sub]` food-zone pages.
 * Product cards hard-navigate to `/product/[id]` detail pages.
 */
export function ProductCatalog({
  categorySlug,
  showProductSearch = false,
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const category = getCategoryBySlug(categorySlug);
  const products = useMemo(
    () => getProductsByCategory(categorySlug, catalogProducts),
    [categorySlug, catalogProducts],
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

      {showProductSearch ? (
        <section
          aria-labelledby="category-product-search-title"
          className="relative z-20 mb-6 max-w-2xl sm:mb-8"
        >
          <div className="mb-4">
            <h2
              id="category-product-search-title"
              className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-2xl"
            >
              {t("productSearchHomeTitle")}
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--muted)] sm:text-base">
              {t("productSearchHomeSub")}
            </p>
          </div>
          <ProductSearch variant="home" />
        </section>
      ) : null}

      {/* @section: product-categories */}
      <details className="group mb-5 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_14px_30px_-26px_rgba(74,54,38,0.5)] sm:mb-6">
        <summary className="flex min-h-11 cursor-pointer list-none touch-manipulation items-center justify-between gap-3 px-4 py-3 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)] [&::-webkit-details-marker]:hidden sm:px-5">
          <span className="min-w-0">
            <span className="block">{t("categoryNavLabel")}</span>
            <span className="mt-0.5 block truncate text-xs font-normal text-[color:var(--muted)]">
              {category ? t(category.labelKey) : t("menuAllCategories")}
            </span>
          </span>
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5 shrink-0 text-[color:var(--accent)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>

        <nav
          aria-label={t("categoryNavLabel")}
          className="border-t border-[color:var(--line)] px-3 py-3 sm:px-4 sm:py-4"
        >
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ slug, labelKey }) => {
              const active = categorySlug === slug;
              return (
                <CategoryNavLink
                  key={slug}
                  href={categoryHref(slug)}
                  aria-current={active ? "page" : undefined}
                  className={categoryMenuLinkClassName(active)}
                >
                  <span>{t(labelKey)}</span>
                  {active ? <span aria-hidden="true">✓</span> : null}
                </CategoryNavLink>
              );
            })}
          </div>

          {/* 探索寵物世界區塊已依要求隱藏／移除，保持畫面乾淨簡潔 */}
        </nav>
      </details>

      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : (
        <ul className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;
            const badge = getProductBadge(product);
            const href = productHref(product.id);

            return (
              <li
                key={product.id}
                className="milk-tea-card group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(74,54,38,0.15)]"
              >
                <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[color:var(--background)]">
                  <CategoryNavLink
                    href={href}
                    aria-label={`${t("productViewDetails")}: ${product.name[locale]}`}
                    className="absolute inset-0 block"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name[locale]}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[color:var(--ink)]/0 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:bg-[color:var(--ink)]/20 group-hover:opacity-100">
                      {t("productViewDetails")}
                    </span>
                  </CategoryNavLink>

                  {product.inStock === false ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                      {t("productSoldOut")}
                    </span>
                  ) : discountPercent ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  ) : badge ? (
                    <span
                      className={`pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                        badge === "hot" ? "bg-[#8b6f47]" : "bg-[#3d6954]"
                      }`}
                    >
                      {badge === "hot" ? "熱賣中" : "新品"}
                    </span>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
                  <CategoryNavLink
                    href={href}
                    className="line-clamp-2 min-h-[2.5rem] break-words text-left text-sm font-medium leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                  >
                    {product.name[locale]}
                  </CategoryNavLink>
                  {product.description ? (
                    <p className="line-clamp-2 text-xs leading-snug break-words text-[color:var(--muted)]">
                      {product.description[locale]}
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
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
    </div>
  );
}
