"use client";

import { useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { categoryDescendantIds, findCategoryBySlug } from "@/lib/store-categories";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";
import styles from "./HomeProductMarquee.module.css";

type PageItem = number | "ellipsis";

const MOBILE_PAGE_SIZE = 12;

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

type ProductCardProps = {
  product: Product;
  duplicate?: boolean;
};

function ProductCard({ product, duplicate = false }: ProductCardProps) {
  const { locale, t } = useI18n();
  const href = productHref(product.id);
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article
      aria-hidden={duplicate || undefined}
      data-marquee-copy={duplicate ? "duplicate" : "source"}
      className={`${styles.card} ${duplicate ? "" : ""}`}
    >
      <CategoryNavLink
        href={href}
        tabIndex={duplicate ? -1 : undefined}
        aria-label={`${t("viewProductAria")}: ${product.name[locale]}`}
        className={styles.cardLink}
      >
        <div className={styles.imageWrap}>
          <ProductImage
            src={product.image}
            alt={product.name[locale]}
            sizes="(min-width: 1024px) 210px, (min-width: 640px) 190px, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
          />
          {discountPercent ? <span className={styles.discount}>-{discountPercent}%</span> : null}
        </div>
        <div className={styles.cardBody}>
          <p className={styles.name}>{product.name[locale]}</p>
          <div className={styles.priceLine}>
            <span className={styles.price}>{formatMoney(product.price, locale)}</span>
            {product.originalPrice ? (
              <span className={styles.originalPrice}>{formatMoney(product.originalPrice, locale)}</span>
            ) : null}
          </div>
        </div>
      </CategoryNavLink>
    </article>
  );
}

type ProductRowProps = {
  label: string;
  products: Product[];
  speed: "regular" | "slow";
};

function ProductRow({ label, products, speed }: ProductRowProps) {
  const { t } = useI18n();
  const repeatedProducts = [...products, ...products];

  return (
    <div className={styles.rowWrap} aria-label={label}>
      <div
        className={`${styles.track} ${speed === "slow" ? styles.trackSlow : styles.trackRegular}`}
        title={t("homeMarqueePause")}
      >
        {repeatedProducts.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} duplicate={index >= products.length} />
        ))}
      </div>
    </div>
  );
}

type MobileProductShowcaseProps = {
  label: string;
  products: Product[];
};

function MobileProductShowcase({ label, products }: MobileProductShowcaseProps) {
  const { locale } = useI18n();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(products.length / MOBILE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = products.slice(
    (currentPage - 1) * MOBILE_PAGE_SIZE,
    currentPage * MOBILE_PAGE_SIZE,
  );
  const goToPage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(pageCount, nextPage));
    setPage(safePage);
    document.getElementById("home-product-marquee-title")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="lg:hidden" data-mobile-product-list="vertical-paginated">
      <ul
        aria-label={label}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-5 sm:px-10"
      >
        {visibleProducts.map((product) => (
          <li key={product.id} className={styles.mobileCard}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <nav
        className="mt-7 flex flex-wrap items-center justify-center gap-1.5 px-4"
        aria-label={locale === "zh" ? "產品分頁" : "Product pages"}
      >
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={locale === "zh" ? "上一頁" : "Previous page"}
          className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 上一頁
        </button>
        {getPageNumbers(currentPage, pageCount).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[color:var(--muted)]" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={item === currentPage ? "page" : undefined}
              aria-label={`${locale === "zh" ? "第" : "Page "}${item}${locale === "zh" ? "頁" : ""}`}
              className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${
                item === currentPage
                  ? "bg-[color:var(--ink)] text-white"
                  : "border border-[color:var(--line)] hover:bg-[color:var(--surface)]"
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pageCount}
          aria-label={locale === "zh" ? "下一頁" : "Next page"}
          className="rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一頁 →
        </button>
      </nav>
    </div>
  );
}

/**
 * An editorial two-row product parade on desktop. On phones and tablets the
 * same products become a vertical, paginated grid with twelve products/page.
 */
export function HomeProductMarquee() {
  const { locale, t } = useI18n();
  const { products: catalogProducts, categories } = useCatalog();
  const activeProducts = catalogProducts.filter(isStorefrontReadyProduct);
  const catCategoryIds = categoryDescendantIds(findCategoryBySlug(categories, "cats"));
  const dogCategoryIds = categoryDescendantIds(findCategoryBySlug(categories, "dogs"));
  const catProducts = activeProducts
    .filter((product) => catCategoryIds.has(product.categoryId ?? "") || product.categorySlug === "cats")
    .slice(0, 8);
  const dogProducts = activeProducts
    .filter((product) => dogCategoryIds.has(product.categoryId ?? "") || product.categorySlug === "dogs")
    .slice(0, 8);

  if (catProducts.length === 0 || dogProducts.length === 0) return null;

  return (
    <section
      id="home-product-marquee"
      aria-labelledby="home-product-marquee-title"
      className="overflow-hidden border-y border-[#d7c0aa]/70 bg-[#f4e9dc] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#c6a785]/55 bg-[#fffaf4]/80 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#7a543b]">
            {t("homeMarqueeEyebrow")}
          </span>
          <h2
            id="home-product-marquee-title"
            className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#4b3621] sm:text-4xl"
          >
            {t("homeMarqueeTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#765d49] sm:text-base">
            {t("homeMarqueeSub")}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6" data-locale={locale}>
        <div className="lg:hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <p className="mb-3 text-xs font-bold tracking-[0.14em] text-[#765039]">
              {t("homeMarqueeCats")} · {t("homeMarqueeDogs")}
            </p>
          </div>
          <MobileProductShowcase
            label={`${t("homeMarqueeCats")} · ${t("homeMarqueeDogs")}`}
            products={[...catProducts, ...dogProducts]}
          />
        </div>

        <div className="hidden lg:block">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
            <p className="mb-2 text-xs font-bold tracking-[0.14em] text-[#765039] sm:mb-3">
              {t("homeMarqueeCats")}
            </p>
          </div>
          <ProductRow label={t("homeMarqueeCats")} products={catProducts} speed="regular" />
          <div className="mx-auto max-w-7xl px-6 pt-1 sm:px-10 lg:px-12">
            <p className="mb-2 text-xs font-bold tracking-[0.14em] text-[#765039] sm:mb-3">
              {t("homeMarqueeDogs")}
            </p>
          </div>
          <ProductRow label={t("homeMarqueeDogs")} products={dogProducts} speed="slow" />
        </div>
      </div>
    </section>
  );
}
