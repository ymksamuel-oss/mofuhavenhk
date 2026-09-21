"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getProductsByCategory, isStorefrontReadyProduct, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { inferFoodZone } from "@/lib/classifyPetFood";
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

function homepageFamilyKey(product: Product): string {
  const text = `${product.name.zh} ${product.name.en} ${Object.values(product.metadata ?? {}).join(" ")}`.toLowerCase();
  if (/タフ[・\s-]*ブレイド|tough\s*blade/.test(text)) {
    if (/ハーネス|harness|\u80f8\u80cc/.test(text)) return "best-partner-tough-harness";
    if (/リード|lead|leash|\u727d\u5f15/.test(text)) return "best-partner-tough-lead";
    if (/カラー|collar|\u9838\u5708/.test(text)) return "best-partner-tough-collar";
  }
  return product.id;
}

function isHomepageFoodProduct(product: Product): boolean {
  const text = `${product.name.zh} ${product.name.en} ${product.description?.zh ?? ""} ${product.description?.en ?? ""} ${product.categorySlug} ${product.subcategory ?? ""} ${product.productType ?? ""} ${(product.tags ?? []).join(" ")} ${Object.values(product.metadata ?? {}).join(" ")}`.toLowerCase();
  const gearText = /\u80f8\u80cc|\u80f8\u80cc\u5e36|\u727d\u5f15|\u727d\u5f15\u7e69|\u9838\u5708|\u9805\u5708|\u6f2b\u6b65\u88dd\u7532|\u5916\u51fa|harness|leash|lead|collar|walking|outdoor|gear|tough.?blade|\u96e8\u8863|\u73a9\u5177|toy/.test(text);
  if (gearText) return false;
  const categoryText = `${product.categorySlug} ${product.metadata?.category ?? ""} ${product.metadata?.category_slug ?? ""} ${product.metadata?.product_type ?? ""}`.toLowerCase();
  const explicitFoodCategory = /^(food|treats?|snacks?|dental|chews?|food-treats)(?:[\s_-]|$)/.test(categoryText) || /(?:^|[\s_-])(food|treats?|snacks?|dental|chews?)(?:[\s_-]|$)/.test(categoryText);
  const edibleText = /\u8089\u4e7e|\u96f6\u98df|\u51cd\u4e7e|\u6f54\u9f52|\u6f54\u7259|\u725b\u8e44|\u725b\u7b4b|\u9e7f\u8089|\u99ac\u8089|\u9b5a|\u9baa|\u541e\u62ff\u9b5a|\u7d2b\u85af|\u96de\u8089|\u725b\u8089|\u7f8a\u8089|\u539f\u8089|\u9bae\u7ce7|\u8089\u6ce5|\u5957\u88dd|\u7d44\u5408|treat|snack|food|jerky|freeze.?dried|dental|chew|beef|venison|horse|chicken|fish|tuna|bonito|meat|bundle/.test(text);
  return explicitFoodCategory || edibleText || inferFoodZone(product) !== null;
}

/** Keep the full catalogue intact, but make the homepage an editorial sampler. */
function homepageProducts(products: Product[]): Product[] {
  const representatives = new Map<string, Product>();
  for (const product of products.filter(isHomepageFoodProduct)) {
    const key = homepageFamilyKey(product);
    const current = representatives.get(key);
    if (!current || (product.createdAt ?? 0) > (current.createdAt ?? 0)) representatives.set(key, product);
  }
  return Array.from(representatives.values()).sort(
    (left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0) || left.id.localeCompare(right.id, undefined, { numeric: true }),
  );
}

/** Locale-aware homepage product section. Products are assembled by the page from Supabase. */
export function HomepageProductGrid({ products: catalogProducts }: HomepageProductGridProps) {
  const { t } = useI18n();
  console.log("[homepage-product-grid] SSR products", catalogProducts);
  if (catalogProducts.length === 0) {
    console.error("[homepage-product-grid] SSR products is empty", {
      error: "No products were returned by getCatalogSnapshot",
    });
  }
  const products = homepageProducts(getProductsByCategory(null, catalogProducts)
    .filter(isStorefrontReadyProduct)
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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pageCount, page)));
  };

  return (
    <section
      id="homepage-products"
      aria-labelledby="homepage-products-title"
      className="border-t border-[color:var(--line)] bg-[color:var(--background)] px-6 py-6 sm:px-10 sm:py-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-5 sm:mb-6">
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
            <ul className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {visibleProducts.map((product, index) => {
              return (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} priority={index < 4} showPurchaseControls={false} />
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
