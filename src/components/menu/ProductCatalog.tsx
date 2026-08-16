"use client";

import { useMemo } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductSearch } from "@/components/ProductSearch";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
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
import { formatMoney, type TranslationKey } from "@/lib/i18n/translations";
import {
  CAT_SNACK_SERIES,
  CAT_SNACK_SERIES_SLUG,
  CAT_SUBCATEGORIES,
  CAT_SUBCATEGORY_SLUG,
  DOG_SUBCATEGORIES,
  DOG_SUBCATEGORY_SLUG,
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  getProductsByCategory,
  productHref,
  type CatSnackSeries,
  type CatSubcategory,
  type DogSubcategory,
  type Product,
  type ProductSubcategory,
} from "@/lib/products";

function categoryMenuLinkClassName(active: boolean) {
  return `group/link flex min-h-11 items-center justify-between border-b px-1 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
    active
      ? "border-[color:var(--accent)] font-semibold text-[color:var(--ink)]"
      : "border-[color:var(--line)]/70 font-medium text-[color:var(--muted)] hover:border-[color:var(--accent)]/70 hover:text-[color:var(--ink)]"
  }`;
}

function subChipClassName(active: boolean) {
  return `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
    active
      ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--surface)] shadow-sm"
      : "border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/50 hover:text-[color:var(--ink)]"
  }`;
}

const CAT_SUB_LABEL_KEYS: Record<CatSubcategory, TranslationKey> = {
  貓罐罐: "catSubWetCans",
  貓乾糧: "catSubDryFood",
  冷凍脫水系列: "catSubFreezeDried",
  貓貓小食: "catSubSnacks",
  投藥餵藥專用小食: "pillTreatsSubcategory",
};

const DOG_SUB_LABEL_KEYS: Record<DogSubcategory, TranslationKey> = {
  狗狗食品: "dogSubFood",
  狗狗小食: "dogSubSnacks",
  投藥餵藥專用小食: "pillTreatsSubcategory",
};

const CAT_SNACK_SERIES_LABEL_KEYS: Record<CatSnackSeries, TranslationKey> = {
  無添加天然系列: "catSnackSeriesNatural",
  老貓零食: "catSnackSeriesSenior",
  去毛球配方: "catSnackSeriesHairball",
  bb貓零食: "catSnackSeriesKitten",
};

type ProductCatalogProps = {
  /** `null` = full catalog (`/menu`); otherwise a category slug page. */
  categorySlug: string | null;
  /**
   * Optional food-zone subcategory from the URL path
   * (`/categories/cats/freeze-dried`, `/categories/cats/snacks`, …).
   */
  subcategory?: ProductSubcategory | null;
  /** Optional cat-snack series filter (`?series=natural|senior|hairball|kitten`). */
  snackSeries?: CatSnackSeries | null;
  /** Show the homepage-style search section on `/categories/...` pages only. */
  showProductSearch?: boolean;
};

/** List-style card: image + title/specs/price in a clear flex row (no overlap). */
function TreatListCard({
  product,
  locale,
  viewDetailsLabel,
  soldOutLabel,
}: {
  product: Product;
  locale: "zh" | "en";
  viewDetailsLabel: string;
  soldOutLabel: string;
}) {
  const href = productHref(product.id);
  const series = product.series?.[locale];
  const nameLine = product.name[locale];
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <li className="milk-tea-card overflow-hidden transition-shadow duration-200 hover:shadow-[0_18px_32px_-24px_rgba(74,54,38,0.55)]">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <CategoryNavLink
          href={href}
          aria-label={`${viewDetailsLabel}: ${product.name[locale]}`}
          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] sm:h-32 sm:w-32"
        >
          <ProductImage
            src={product.image}
            alt={product.name[locale]}
            sizes="128px"
            className="object-cover"
          />
          {product.inStock === false ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-[color:var(--ink)] px-2 py-0.5 text-[9px] font-bold text-white">
              {soldOutLabel}
            </span>
          ) : discountPercent ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-[#c0483a] px-1.5 py-0.5 text-[9px] font-bold text-white">
              -{discountPercent}%
            </span>
          ) : null}
        </CategoryNavLink>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {series ? (
            <CategoryNavLink
              href={href}
              className="break-words text-sm font-bold leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
            >
              {series}
            </CategoryNavLink>
          ) : null}
          <CategoryNavLink
            href={href}
            className={`break-words text-sm leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)] ${
              series ? "font-medium" : "font-semibold"
            }`}
          >
            {nameLine}
          </CategoryNavLink>
          {product.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed break-words text-[color:var(--muted)] sm:line-clamp-3">
              {product.description[locale]}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-base font-semibold tabular-nums text-[color:var(--accent)] sm:text-lg">
                {formatMoney(product.price, locale)}
              </p>
              {product.originalPrice ? (
                <p className="text-xs tabular-nums text-[color:var(--muted)] line-through">
                  {formatMoney(product.originalPrice, locale)}
                </p>
              ) : null}
            </div>
            <AddToCartButton productId={product.id} size="list" />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Shared catalog UI for `/menu`, `/categories/[slug]`, and
 * `/categories/[slug]/[sub]` food-zone pages.
 * Product cards hard-navigate to `/product/[id]` detail pages.
 */
export function ProductCatalog({
  categorySlug,
  subcategory = null,
  snackSeries = null,
  showProductSearch = false,
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const category = getCategoryBySlug(categorySlug);
  const isCats = categorySlug === "cats";
  const isDogs = categorySlug === "dogs";
  const catSubcategory =
    isCats && subcategory && CAT_SUBCATEGORIES.includes(subcategory as CatSubcategory)
      ? (subcategory as CatSubcategory)
      : null;
  const dogSubcategory =
    isDogs && subcategory && DOG_SUBCATEGORIES.includes(subcategory as DogSubcategory)
      ? (subcategory as DogSubcategory)
      : null;
  const catSnackSeries =
    catSubcategory === "貓貓小食" ? snackSeries : null;

  const products = useMemo(() => {
    let baseProducts: Product[] = [];
    
    if (isCats) {
      baseProducts = getCatProductsBySubcategory(
        catSubcategory,
        catSnackSeries,
        catalogProducts,
      );
    } else if (isDogs) {
      baseProducts = getDogProductsBySubcategory(
        dogSubcategory,
        catalogProducts,
      );
    } else {
      baseProducts = getProductsByCategory(categorySlug, catalogProducts);
    }
    
    return baseProducts;
  }, [
    isCats,
    isDogs,
    catSubcategory,
    dogSubcategory,
    catSnackSeries,
    categorySlug,
    catalogProducts,
  ]);

  const title = category ? t(category.labelKey) : t("menuTitle");
  const subtitle = category ? t("categoryPageSubtitle") : t("menuSubtitle");
  const showFreezeDriedZone = catSubcategory === "冷凍脫水系列";
  const showCatSnacksZone = catSubcategory === "貓貓小食";
  const showDogSnacksZone = dogSubcategory === "狗狗小食";
  const showPillTreatsZone =
    catSubcategory === "投藥餵藥專用小食" ||
    dogSubcategory === "投藥餵藥專用小食";
  const useListLayout =
    showFreezeDriedZone ||
    showCatSnacksZone ||
    showDogSnacksZone ||
    showPillTreatsZone;

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

          <div className="mt-4 border-t border-[color:var(--line)] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--accent)]">
              {t("explorePetsWorld")}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <CategoryNavLink
                href="/about-dog"
                className={categoryMenuLinkClassName(false)}
              >
                {t("exploreAboutDog")}
              </CategoryNavLink>
              <CategoryNavLink
                href="/about-cat"
                className={categoryMenuLinkClassName(false)}
              >
                {t("exploreAboutCat")}
              </CategoryNavLink>
              <CategoryNavLink
                href="/cat-breeds"
                className={categoryMenuLinkClassName(false)}
              >
                {t("exploreCatBreeds")}
              </CategoryNavLink>
            </div>
          </div>
        </nav>
      </details>

      {isCats ? (
        <div
          role="tablist"
          aria-label={t("catSubNavLabel")}
          className="scrollbar-none mb-6 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] sm:mb-8"
        >
          <CategoryNavLink
            href={categoryHref("cats")}
            role="tab"
            aria-selected={catSubcategory === null}
            className={subChipClassName(catSubcategory === null)}
          >
            {t("catSubAll")}
          </CategoryNavLink>
          {CAT_SUBCATEGORIES.map((sub) => (
            <CategoryNavLink
              key={sub}
              href={categorySubHref("cats", CAT_SUBCATEGORY_SLUG[sub])}
              role="tab"
              aria-selected={catSubcategory === sub}
              className={subChipClassName(catSubcategory === sub)}
            >
              {t(CAT_SUB_LABEL_KEYS[sub])}
            </CategoryNavLink>
          ))}
        </div>
      ) : null}

      {isDogs ? (
        <div
          role="tablist"
          aria-label={t("dogSubNavLabel")}
          className="scrollbar-none mb-6 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] sm:mb-8"
        >
          <CategoryNavLink
            href={categoryHref("dogs")}
            role="tab"
            aria-selected={dogSubcategory === null}
            className={subChipClassName(dogSubcategory === null)}
          >
            {t("dogSubAll")}
          </CategoryNavLink>
          {DOG_SUBCATEGORIES.map((sub) => (
            <CategoryNavLink
              key={sub}
              href={categorySubHref("dogs", DOG_SUBCATEGORY_SLUG[sub])}
              role="tab"
              aria-selected={dogSubcategory === sub}
              className={subChipClassName(dogSubcategory === sub)}
            >
              {t(DOG_SUB_LABEL_KEYS[sub])}
            </CategoryNavLink>
          ))}
        </div>
      ) : null}

      {showFreezeDriedZone ? (
        <section
          aria-label={t("catFreezeDriedZoneTitle")}
          className="mb-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 sm:mb-8 sm:px-5"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("catFreezeDriedZoneEyebrow")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--ink)] sm:text-2xl">
            {t("catFreezeDriedZoneTitle")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">
            {t("catFreezeDriedZoneSubtitle")}
          </p>
        </section>
      ) : null}

      {showCatSnacksZone ? (
        <section
          aria-label={t("catSnacksZoneTitle")}
          className="mb-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 sm:mb-8 sm:px-5"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("catSnacksZoneEyebrow")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--ink)] sm:text-2xl">
            {t("catSnacksZoneTitle")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">
            {t("catSnacksZoneSubtitle")}
          </p>
          <div
            role="tablist"
            aria-label={t("catSnackSeriesNavLabel")}
            className="scrollbar-none mt-4 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]"
          >
            <CategoryNavLink
              href={catSnacksSeriesHref(null)}
              role="tab"
              aria-selected={catSnackSeries === null}
              className={subChipClassName(catSnackSeries === null)}
            >
              {t("catSnackSeriesAll")}
            </CategoryNavLink>
            {CAT_SNACK_SERIES.map((series) => (
              <CategoryNavLink
                key={series}
                href={catSnacksSeriesHref(CAT_SNACK_SERIES_SLUG[series])}
                role="tab"
                aria-selected={catSnackSeries === series}
                className={subChipClassName(catSnackSeries === series)}
              >
                {t(CAT_SNACK_SERIES_LABEL_KEYS[series])}
              </CategoryNavLink>
            ))}
          </div>
        </section>
      ) : null}

      {showDogSnacksZone ? (
        <section
          aria-label={t("dogSnacksZoneTitle")}
          className="mb-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 sm:mb-8 sm:px-5"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {t("dogSnacksZoneEyebrow")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--ink)] sm:text-2xl">
            {t("dogSnacksZoneTitle")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">
            {t("dogSnacksZoneSubtitle")}
          </p>
        </section>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : useListLayout ? (
        <ul className="flex flex-col gap-3 sm:gap-4">
          {products.map((product) => (
            <TreatListCard
              key={product.id}
              product={product}
              locale={locale}
              viewDetailsLabel={t("productViewDetails")}
              soldOutLabel={t("productSoldOut")}
            />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;
            const href = productHref(product.id);

            return (
              <li
                key={product.id}
                className="milk-tea-card group flex h-full min-w-0 flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(74,54,38,0.6)]"
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
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-[10px] font-bold text-white">
                      {t("productSoldOut")}
                    </span>
                  ) : discountPercent ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white">
                      -{discountPercent}%
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
