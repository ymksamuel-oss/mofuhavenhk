"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatusBadges } from "@/components/product/ProductStatusBadges";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

const PAGE_SIZE = 12;
type PageItem = number | "ellipsis";

type HomepageProductGridProps = {
  products: Product[];
};

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

/** Locale-aware homepage product section. Products are assembled by the page from Supabase. */
export function HomepageProductGrid({ products: catalogProducts }: HomepageProductGridProps) {
  const { locale, t } = useI18n();
  console.log("[homepage-product-grid] SSR products", catalogProducts);
  if (catalogProducts.length === 0) {
    console.error("[homepage-product-grid] SSR products is empty", {
      error: "No products were returned by getCatalogSnapshot",
    });
  }
  const products = getProductsByCategory(null, catalogProducts)
    .filter(isStorefrontReadyProduct)
    .sort((left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0) || left.id.localeCompare(right.id, undefined, { numeric: true }));
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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, page)));
  };

  return (
    <section
      id="homepage-products"
      aria-labelledby="homepage-products-title"
      className="border-t border-[color:var(--line)] bg-[color:var(--background)] px-6 py-12 sm:px-10 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div>
            <span className="inline-flex rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[color:var(--accent)]">
              {t("homepageGridEyebrow")}
            </span>
            <h2
              id="homepage-products-title"
              className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl"
            >
              {t("homepageGridTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              {t("homepageGridSubtitle")}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-8 text-center shadow-[0_14px_30px_-26px_rgba(43,38,35,0.28)]">
            <p className="text-sm font-semibold text-[color:var(--ink)]">{t("homepageGridEmptyTitle")}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{t("homepageGridEmptyHint")}</p>
            <CategoryNavLink
              href="/menu"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            >
              {t("homepageGridEmptyCta")}
            </CategoryNavLink>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5">
              {visibleProducts.map((product) => {
              const href = productHref(product.id);
              const discountPercent = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : null;
              return (
                <li
                  key={product.id}
                  className="milk-tea-card group flex min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(43,38,35,0.3)]"
                >
                  <CategoryNavLink
                    href={href}
                    aria-label={`${t("viewProductAria")}: ${product.name[locale]}`}
                    className="relative block aspect-square overflow-hidden bg-[color:var(--accent-soft)]"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name[locale]}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    {discountPercent ? (
                      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-[#c0483a] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        -{discountPercent}%
                      </span>
                    ) : null}
                    <ProductStatusBadges product={product} className="right-2.5 top-2.5" />
                  </CategoryNavLink>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
                    <CategoryNavLink
                      href={href}
                      className="line-clamp-2 min-h-[2.5rem] text-left text-sm font-semibold leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                    >
                      {product.name[locale]}
                    </CategoryNavLink>
                    {product.description?.[locale] ? (
                      <p className="line-clamp-2 text-xs leading-snug text-[color:var(--muted)]">{product.description[locale]}</p>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
                      <p className="text-lg font-extrabold tabular-nums text-[color:var(--accent)]">
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
          </>
        )}
      </div>
    </section>
  );
}
