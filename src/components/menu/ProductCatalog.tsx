"use client";

import { useMemo } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { EditorialPageSlogan } from "@/components/EditorialPageSlogan";
import { ProductSearch } from "@/components/ProductSearch";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductImage } from "@/components/product/ProductImage";
import {
  CATEGORIES,
  categoryHref,
  categorySubHref,
  catSnacksSeriesHref,
  getCategoryBySlug,
} from "@/lib/categories";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import {
  CAT_SNACK_SERIES,
  CAT_SNACK_SERIES_LABEL_KEY,
  CAT_SNACK_SERIES_SLUG,
  CAT_SUBCATEGORIES,
  CAT_SUBCATEGORY_SLUG,
  DOG_SUBCATEGORIES,
  DOG_SUBCATEGORY_SLUG,
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  getLifestyleProductsBySubcategory,
  getSmallPetProductsBySubcategory,
  getProductSubcategoryLabelKey,
  getProductsByCategory,
  isStorefrontReadyProduct,
  type CatSubcategory,
  type DogSubcategory,
  type LifestyleSubcategory,
  type SmallPetSubcategory,
  productHref,
  resolveCategorySubSlug,
  resolveCatSnackSeriesSlug,
} from "@/lib/products";

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
  subcategory,
  snackSeries,
  showProductSearch = false,
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const category = getCategoryBySlug(categorySlug);
  const selectedSubcategory =
    typeof subcategory === "string"
      ? resolveCategorySubSlug(categorySlug ?? "", subcategory)
      : null;
  const selectedSnackSeries =
    typeof snackSeries === "string" ? resolveCatSnackSeriesSlug(snackSeries) : null;
  const subcategoryOptions =
    categorySlug === "cats"
      ? CAT_SUBCATEGORIES
      : categorySlug === "dogs"
        ? DOG_SUBCATEGORIES
        : [];

  const products = useMemo(() => {
    const matchingProducts =
      categorySlug === "cats" && selectedSubcategory
        ? getCatProductsBySubcategory(
            selectedSubcategory as CatSubcategory,
            selectedSnackSeries,
            catalogProducts,
          )
        : categorySlug === "dogs" && selectedSubcategory
          ? getDogProductsBySubcategory(
              selectedSubcategory as DogSubcategory,
              catalogProducts,
            )
          : categorySlug === "small-pets" && selectedSubcategory
            ? getSmallPetProductsBySubcategory(
                selectedSubcategory as SmallPetSubcategory,
                catalogProducts,
              )
            : categorySlug === "lifestyle" && selectedSubcategory
              ? getLifestyleProductsBySubcategory(
                  selectedSubcategory as LifestyleSubcategory,
                  catalogProducts,
                )
              : getProductsByCategory(categorySlug, catalogProducts);
    return matchingProducts.filter(isStorefrontReadyProduct);
  }, [categorySlug, catalogProducts, selectedSnackSeries, selectedSubcategory]);

  const title = selectedSubcategory
    ? t(getProductSubcategoryLabelKey(selectedSubcategory))
    : category
      ? t(category.labelKey)
      : t("menuTitle");
  const subtitle = category ? t("categoryPageSubtitle") : t("menuSubtitle");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">{subtitle}</p>
        <EditorialPageSlogan
          className="mt-6"
          eyebrow={t("menuSloganEyebrow")}
          title={t("menuSloganTitle")}
          body={t("menuSloganBody")}
        />
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
      <details className="group mb-5 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_14px_30px_-26px_rgba(43,38,35,0.2)] sm:mb-6">
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

      {categorySlug === "cats" || categorySlug === "dogs" ? (
        <section
          aria-label={t(categorySlug === "cats" ? "catSubNavLabel" : "dogSubNavLabel")}
          className="mb-6 border-y border-[color:var(--line)] py-4"
        >
          <p className="mb-3 text-sm font-semibold text-[color:var(--ink)]">
            {t(categorySlug === "cats" ? "catSubNavLabel" : "dogSubNavLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            <CategoryNavLink
              href={categoryHref(categorySlug)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                !selectedSubcategory
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              }`}
            >
              {t(categorySlug === "cats" ? "catSubAll" : "dogSubAll")}
            </CategoryNavLink>
            {subcategoryOptions.map((option) => {
              const isActive = selectedSubcategory === option;
              const subSlug =
                categorySlug === "cats"
                  ? CAT_SUBCATEGORY_SLUG[option as CatSubcategory]
                  : DOG_SUBCATEGORY_SLUG[option as DogSubcategory];
              return (
                <CategoryNavLink
                  key={option}
                  href={categorySubHref(categorySlug, subSlug)}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                      : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  }`}
                >
                  {t(getProductSubcategoryLabelKey(option))}
                </CategoryNavLink>
              );
            })}
          </div>

          {categorySlug === "cats" && selectedSubcategory === "貓貓小食" ? (
            <div className="mt-4 border-t border-[color:var(--line)] pt-4">
              <p className="mb-3 text-sm font-semibold text-[color:var(--ink)]">
                {t("catSnackSeriesNavLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                <CategoryNavLink
                  href={catSnacksSeriesHref(null)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    !selectedSnackSeries
                      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                      : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  }`}
                >
                  {t("catSnackSeriesAll")}
                </CategoryNavLink>
                {CAT_SNACK_SERIES.map((series) => {
                  const isActive = selectedSnackSeries === series;
                  return (
                    <CategoryNavLink
                      key={series}
                      href={catSnacksSeriesHref(CAT_SNACK_SERIES_SLUG[series])}
                      aria-current={isActive ? "page" : undefined}
                      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                          : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                      }`}
                    >
                      {t(CAT_SNACK_SERIES_LABEL_KEY[series])}
                    </CategoryNavLink>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : (
        <ul id="products" className="scroll-mt-24 grid grid-cols-2 items-stretch gap-4 pb-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;
            const badge = getProductBadge(product);
            const href = productHref(product.id);

            return (
              <li
                key={product.id}
                className="milk-tea-card group flex h-full min-w-0 flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(43,38,35,0.3)]"
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
                      {badge === "hot" ? t("badgeHot") : t("badgeNew")}
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
                    <p className="text-lg font-bold tabular-nums text-[#7A4B31]">
                      {formatMoney(product.price, locale)}
                    </p>
                    {product.originalPrice ? (
                      <p className="text-xs tabular-nums text-[color:var(--muted)] line-through">
                        {formatMoney(product.originalPrice, locale)}
                      </p>
                    ) : null}
                  </div>
                  <MarketReferencePrice
                    price={product.marketReferencePrice}
                    asOf={product.marketReferenceAsOf}
                    compact
                    className="-mt-1"
                  />
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
