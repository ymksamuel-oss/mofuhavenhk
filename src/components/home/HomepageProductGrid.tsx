"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getProductsByCategory, isStorefrontReadyProduct, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
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
    if (/ハーネス|harness|胸背/.test(text)) return "best-partner-tough-harness";
    if (/リード|lead|leash|牽引/.test(text)) return "best-partner-tough-lead";
    if (/カラー|collar|頸圈/.test(text)) return "best-partner-tough-collar";
  }
  return product.id;
}

function homepageGroup(product: Product): "cat" | "meat" | "gear" | "other" {
  const text = `${product.name.zh} ${product.name.en} ${product.description?.zh ?? ""}`.toLowerCase();
  if (/貓|猫|cat/.test(text) && /魚|鮪|吞拿魚|鰹|fish|tuna|bonito|鱈|沙丁|小魚/.test(text)) return "cat";
  if (/鹿|馬|牛|羊|鯊魚|鹿肉|馬肉|beef|venison|horse|shark/.test(text)) return "meat";
  if (/胸背|牽引|頸圈|harness|leash|collar|タフ[・\s-]*ブレイド/.test(text)) return "gear";
  return "other";
}

/** Keep the full catalogue intact, but make the homepage an editorial sampler. */
function homepageProducts(products: Product[]): Product[] {
  const representatives = new Map<string, Product>();
  for (const product of products) {
    const key = homepageFamilyKey(product);
    const current = representatives.get(key);
    if (!current || (product.createdAt ?? 0) > (current.createdAt ?? 0)) representatives.set(key, product);
  }
  const groups: Record<ReturnType<typeof homepageGroup>, Product[]> = { cat: [], meat: [], gear: [], other: [] };
  for (const product of representatives.values()) groups[homepageGroup(product)].push(product);
  for (const group of Object.values(groups)) {
    group.sort((left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0) || left.id.localeCompare(right.id, undefined, { numeric: true }));
  }
  const result: Product[] = [];
  const order: Array<keyof typeof groups> = ["cat", "meat", "gear", "other"];
  let added = true;
  while (added) {
    added = false;
    for (const key of order) {
      const product = groups[key].shift();
      if (product) { result.push(product); added = true; }
    }
  }
  return result;
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
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleProducts.map((product, index) => {
              return (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} priority={index < 4} />
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
