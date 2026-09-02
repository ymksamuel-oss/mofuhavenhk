"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { categoryDescendantIds, findCategoryBySlug } from "@/lib/store-categories";
import { productHref } from "@/lib/products";

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
};

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
}: ProductCatalogProps) {
  const { locale, t } = useI18n();
  const { products: catalogProducts, categories } = useCatalog();
  const selectedCategory = useMemo(() => {
    if (!categorySlug) return null;
    const parent = findCategoryBySlug(categories, categorySlug);
    if (!parent || typeof subcategory !== "string" || !subcategory.trim()) return parent;
    return parent.children.find((child) => child.slug === subcategory.trim().toLowerCase()) ?? null;
  }, [categories, categorySlug, subcategory]);
  const selectedCategoryIds = useMemo(
    () => categoryDescendantIds(selectedCategory),
    [selectedCategory],
  );
  const products = useMemo(() => {
    if (!categorySlug) return catalogProducts;
    return catalogProducts.filter((product) =>
      Boolean(product.categoryId) && selectedCategoryIds.has(product.categoryId as string),
    );
  }, [categorySlug, catalogProducts, selectedCategoryIds]);
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
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const title = selectedCategory?.name ?? t("menuTitle");
  return (
    <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:py-12">
      <h1 className="sr-only">{title}</h1>
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

          <nav
            className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
            aria-label={locale === "zh" ? "產品分頁" : "Product pages"}
          >
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label={locale === "zh" ? "上一頁" : "Previous page"}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← 上一頁
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
                  aria-label={`${locale === "zh" ? "第" : "Page "}${page}${locale === "zh" ? "頁" : ""}`}
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
              aria-label={locale === "zh" ? "下一頁" : "Next page"}
              className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              下一頁 →
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
