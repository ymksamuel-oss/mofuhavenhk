"use client";

import { useEffect, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, productHref, resolveCategorySubSlug } from "@/lib/products";
import { findCategoryBySlug } from "@/lib/store-categories";
import { getLocalizedProductName } from "@/lib/translateProductName";
import { BrandServiceStrip } from "@/components/BrandServiceStrip";

const PAGE_SIZE = 12;
type PageItem = number | "ellipsis";

function getPageNumbers(current: number, total: number): PageItem[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const result: PageItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
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
  /** Child category slug for `/categories/[parent]/[child]`. */
  subcategory?: unknown;
  /** Retained only for legacy route compatibility; database category_id remains authoritative. */
  catLifeStage?: unknown;
  snackSeries?: unknown;
  /** Show the homepage-style search section on `/categories/...` pages only. */
  showProductSearch?: boolean;
  /** Special editorial filter for cat-only and cat-friendly natural products. */
  specialFilter?: "cat-zone" | null;
  ingredientFilter?: string | null;
  audienceFilter?: string | null;
};

const INGREDIENT_FILTERS = [
  ["seafood", "深海海鮮", "海鮮", "Deep-Sea Seafood"],
  ["deer", "低敏鹿肉", "鹿肉", "Novel Deer Protein"],
  ["horse", "低敏馬肉", "馬肉", "Novel Horse Protein"],
  ["chicken", "純天然雞肉", "鶏肉", "Natural Chicken"],
  ["beef", "嚴選牛肉", "牛肉", "Premium Beef"],
  ["dairy", "乳製品／芝士／拌糧粉", "乳製品・チーズ・ふりかけ", "Dairy / Cheese / Toppers"],
] as const;

const AUDIENCE_FILTERS = [
  ["cat", "貓專用", "猫用", "For Cats"],
  ["dog", "狗專用", "犬用", "For Dogs"],
  ["all-pets", "貓狗兼用", "犬猫兼用", "All Pets"],
] as const;

function productFilterText(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  return [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
}

function matchesIngredient(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter) return true;
  const text = productFilterText(product);
  const patterns: Record<string, RegExp> = {
    seafood: /深海海鮮|魚介|魚|まぐろ|マグロ|かつお|鰹|きびなご|わかさぎ|たら|鱈|鮭|鯛|鯵|鯖|鱧|うなぎ|帆立|白子|seafood|fish|tuna|bonito/,
    deer: /低敏鹿肉|鹿肉|鹿|venison|deer/,
    horse: /低敏馬肉|馬肉|馬|horse/,
    chicken: /純天然雞肉|雞肉|鶏|ささみ|chicken/,
    beef: /嚴選牛肉|牛肉|牛|beef/,
    dairy: /乳製品|芝士|乳|チーズ|ヨーグルト|dairy|cheese|yogurt|ふりかけ|topper/,
  };
  return patterns[filter]?.test(text) ?? false;
}

function matchesAudience(product: Parameters<typeof productFilterText>[0], filter: string | null) {
  if (!filter) return true;
  const text = productFilterText(product);
  if (filter === "cat") return /貓專用|猫用|貓用|for cats|cat-only/.test(text);
  if (filter === "dog") return /狗專用|犬用|for dogs|dog-only|寵物用品/.test(text);
  return !/貓專用|猫用|貓用|狗專用|犬用|狗具|for cats|for dogs|cat-only|dog-only/.test(text);
}

function isCatZoneProduct(product: { name: { zh: string; en: string }; description?: { zh: string; en: string }; tags?: string[]; metadata?: Record<string, string> }) {
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ").toLowerCase();
  return /貓|猫|cat|にぼし|まぐろ|マグロ|かつお|鰹|きびなご|ひめたら|わかさぎ|魚|fish|tuna|bonito|鱈|鹿肉|馬肉|鹿|馬|venison|horse/.test(text);
}

/**
 * Shared catalog UI for `/menu`, `/categories/[slug]`, and
 * `/categories/[slug]/[sub]` food-zone pages.
 * Product cards hard-navigate to `/product/[id]` detail pages.
 */
export function ProductCatalog({
  categorySlug,
  subcategory,
  catLifeStage,
  snackSeries,
  specialFilter = null,
  ingredientFilter = null,
  audienceFilter = null,
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts, categories } = useCatalog();
  const liveChildCategory = typeof subcategory === "string"
    ? findCategoryBySlug(categories, subcategory.trim().toLowerCase())
    : null;
  const selectedSubcategory = typeof subcategory === "string"
    ? resolveCategorySubSlug(categorySlug || "", subcategory.trim().toLowerCase())
    : null;
  const productsInCategory = getProductsByCategory(categorySlug, catalogProducts);
  // A category route must never fall back to the complete catalog. When the
  // child slug is recognised, match the resolved database subcategory exactly;
  // an unrecognised child route is deliberately empty rather than overbroad.
  const productsByRoute = typeof subcategory === "string"
    ? liveChildCategory
      ? productsInCategory.filter((product) => product.categoryId === liveChildCategory.id)
      : selectedSubcategory
        ? productsInCategory.filter((product) => product.subcategory === selectedSubcategory)
      : []
    : productsInCategory;
  const products = productsByRoute.filter((product) =>
    (specialFilter !== "cat-zone" || isCatZoneProduct(product)) &&
    matchesIngredient(product, ingredientFilter) &&
    matchesAudience(product, audienceFilter),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const visibleProducts = products.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, subcategory]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, page)));
  };

  const title = specialFilter === "cat-zone" ? (locale === "en" ? "For Cats" : "貓咪專區") : t("menuTitle");
  return (
    <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:py-12">
      <h1 className="sr-only">{title}</h1>
      <nav aria-label={locale === "en" ? "Product filters" : "商品分類篩選"} className="mb-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        <CategoryNavLink href="/menu" className={`rounded-full border px-4 py-2 text-sm transition ${!specialFilter ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white" : "border-[color:var(--line)] text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
          {t("allProducts")}
        </CategoryNavLink>
        <CategoryNavLink href="/menu?category=cat-zone" className={`rounded-full border px-4 py-2 text-sm transition ${specialFilter === "cat-zone" ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white" : "border-[color:var(--line)] text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
          {locale === "ja" ? "猫ちゃん" : locale === "en" ? "For Cats" : "貓咪專區"}
        </CategoryNavLink>
      </nav>
      <nav aria-label={locale === "en" ? "Ingredient filters" : "食材分類篩選"} className="mb-2 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap">
        {INGREDIENT_FILTERS.map(([slug, zh, ja, en]) => (
          <CategoryNavLink key={slug} href={`/menu?ingredient=${slug}`} className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs leading-5 transition ${ingredientFilter === slug ? "border-[#7A4B31] bg-[#7A4B31] text-white" : "border-[color:var(--line)] text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
            {locale === "en" ? en : locale === "ja" ? ja : zh}
          </CategoryNavLink>
        ))}
      </nav>
      <nav aria-label={locale === "en" ? "Pet audience filters" : "適用對象篩選"} className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:mb-6 sm:flex-wrap">
        {AUDIENCE_FILTERS.filter(([slug]) => specialFilter !== "cat-zone" || slug !== "dog").map(([slug, zh, ja, en]) => (
          <CategoryNavLink key={slug} href={`/menu?audience=${slug}`} className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs leading-5 transition ${audienceFilter === slug ? "border-[#3d6954] bg-[#3d6954] text-white" : "border-[color:var(--line)] text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]"}`}>
            {locale === "en" ? en : locale === "ja" ? ja : zh}
          </CategoryNavLink>
        ))}
      </nav>
      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : (
        <>
          <ul id="products" className="scroll-mt-24 grid grid-cols-2 items-stretch gap-4 pb-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visibleProducts.map((product) => {
              const discountPercent = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : null;
              const badge = getProductBadge(product);
              const href = productHref(product.id);
              // The URL is resolved inside this map iteration from the
              // verified Supabase `images` array, so every card is independent.
              const imageUrl = product.images?.[0] ?? "catalog-placeholder";
              const localizedName = getLocalizedProductName(product, locale);
              return (
                <li
                  key={product.id}
                  className="milk-tea-card group flex h-full min-w-0 flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(43,38,35,0.3)]"
                >
                  <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[color:var(--background)]">
                    <CategoryNavLink
                      href={href}
                      aria-label={`${t("productViewDetails")}: ${localizedName}`}
                      className="absolute inset-0 block"
                    >
                      <ProductImage
                        key={`${product.id}-${imageUrl}`}
                        src={imageUrl}
                        alt={localizedName}
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
                      className="block min-h-[2.5rem] min-w-0 break-words text-left text-sm font-semibold leading-6 text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                    >
                      {localizedName}
                    </CategoryNavLink>
                    {product.description ? (
                      <p className="line-clamp-2 text-xs leading-snug break-words text-[color:var(--muted)]">
                        {locale === "ja"
                          ? product.metadata?.description_ja || product.description.zh || product.description.en
                          : (locale === "en" ? product.description.en : product.description.zh) || product.description.en || product.description.zh}
                      </p>
                    ) : null}
                    <MarketReferencePrice
                      price={product.marketReferencePrice}
                      asOf={product.marketReferenceAsOf}
                      compact
                      className="-mt-1"
                    />
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="text-lg font-bold tabular-nums text-[#7A4B31]">
                          {formatMoney(product.price, locale)}
                        </p>
                        {product.originalPrice ? (
                          <p className="text-xs tabular-nums text-[color:var(--muted)] line-through">
                            {formatMoney(product.originalPrice, locale)}
                          </p>
                        ) : null}
                      </div>
                      <AddToCartButton productId={product.id} size="card" className="shrink-0" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <nav
            className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
            aria-label={t("productPaginationLabel")}
          >
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label={t("productPaginationPrevious")}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("productPaginationPrevious")}
            </button>
            {getPageNumbers(safeCurrentPage, pageCount).map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-[color:var(--muted)]" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                  aria-label={t("productPaginationPage").replace("{page}", String(page))}
                  className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${
                    page === safeCurrentPage
                      ? "bg-[color:var(--ink)] text-white"
                      : "border border-[color:var(--line)] hover:bg-[color:var(--surface)]"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === pageCount}
              aria-label={t("productPaginationNext")}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("productPaginationNext")}
            </button>
          </nav>
          <BrandServiceStrip placement="catalog-bottom" />
        </>
      )}
    </div>
  );
}
