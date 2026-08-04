"use client";

import Image from "next/image";
import { useMemo } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ExplorePetsDropdown } from "@/components/menu/ExplorePetsDropdown";
import {
  CATEGORIES,
  categoryHref,
  categorySubHref,
  getCategoryBySlug,
} from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney, type TranslationKey } from "@/lib/i18n/translations";
import {
  CAT_SUBCATEGORIES,
  CAT_SUBCATEGORY_SLUG,
  DOG_SUBCATEGORIES,
  DOG_SUBCATEGORY_SLUG,
  freezeDriedProductName,
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  getProductsByCategory,
  productHref,
  type CatSubcategory,
  type DogSubcategory,
  type Product,
  type ProductSubcategory,
} from "@/lib/products";

function chipClassName(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
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
};

const DOG_SUB_LABEL_KEYS: Record<DogSubcategory, TranslationKey> = {
  狗狗食品: "dogSubFood",
  狗狗小食: "dogSubSnacks",
};

type ProductCatalogProps = {
  /** `null` = full catalog (`/menu`); otherwise a category slug page. */
  categorySlug: string | null;
  /**
   * Optional food-zone subcategory from the URL path
   * (`/categories/cats/freeze-dried`, `/categories/dogs/snacks`, …).
   */
  subcategory?: ProductSubcategory | null;
};

function FreezeDriedListCard({
  product,
  locale,
  viewDetailsLabel,
}: {
  product: Product;
  locale: "zh" | "en";
  viewDetailsLabel: string;
}) {
  const href = productHref(product.id);
  const series = product.series?.[locale];
  const nameLine = freezeDriedProductName(
    product.name[locale],
    series,
    locale,
  );
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
          <Image
            src={product.image}
            alt={product.name[locale]}
            fill
            sizes="128px"
            className="object-cover"
          />
          {discountPercent ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-[#c0483a] px-1.5 py-0.5 text-[9px] font-bold text-white">
              -{discountPercent}%
            </span>
          ) : null}
        </CategoryNavLink>

        <div className="flex min-w-0 flex-1 flex-col">
          {series ? (
            <CategoryNavLink
              href={href}
              className="text-sm font-bold leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
            >
              {series}
            </CategoryNavLink>
          ) : null}
          <CategoryNavLink
            href={href}
            className={`text-sm leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)] ${
              series ? "mt-0.5 font-medium" : "font-semibold"
            }`}
          >
            {nameLine}
          </CategoryNavLink>
          {product.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[color:var(--muted)] sm:line-clamp-3">
              {product.description[locale]}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
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
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
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

  const products = useMemo(() => {
    if (isCats) {
      return getCatProductsBySubcategory(catSubcategory);
    }
    if (isDogs) {
      return getDogProductsBySubcategory(dogSubcategory);
    }
    return getProductsByCategory(categorySlug);
  }, [isCats, isDogs, catSubcategory, dogSubcategory, categorySlug]);

  const title = category ? t(category.labelKey) : t("menuTitle");
  const subtitle = category ? t("categoryPageSubtitle") : t("menuSubtitle");
  const showFreezeDriedZone = catSubcategory === "冷凍脫水系列";
  const showDogSnacksZone = dogSubcategory === "狗狗小食";

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
        className="mb-4 flex flex-wrap gap-2 sm:mb-5"
      >
        <CategoryNavLink href="/menu" className={chipClassName(!categorySlug)}>
          {t("menuAllCategories")}
        </CategoryNavLink>
        {CATEGORIES.map(({ slug, labelKey }) => (
          <CategoryNavLink
            key={slug}
            href={categoryHref(slug)}
            className={chipClassName(categorySlug === slug)}
          >
            {t(labelKey)}
          </CategoryNavLink>
        ))}
        <ExplorePetsDropdown />
      </nav>

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
      ) : showFreezeDriedZone ? (
        <ul className="flex flex-col gap-3 sm:gap-4">
          {products.map((product) => (
            <FreezeDriedListCard
              key={product.id}
              product={product}
              locale={locale}
              viewDetailsLabel={t("productViewDetails")}
            />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;
            const href = productHref(product.id);

            return (
              <li
                key={product.id}
                className="milk-tea-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(74,54,38,0.6)]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--background)]">
                  <CategoryNavLink
                    href={href}
                    aria-label={`${t("productViewDetails")}: ${product.name[locale]}`}
                    className="absolute inset-0 block"
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
                  </CategoryNavLink>

                  {discountPercent ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <CategoryNavLink
                    href={href}
                    className="text-left text-sm font-medium leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                  >
                    {product.name[locale]}
                  </CategoryNavLink>
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
    </div>
  );
}
