"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { findCategoryBySlug, categoryDescendantIds } from "@/lib/store-categories";
import { isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";
import styles from "./HomeProductMarquee.module.css";

type ProductRowProps = {
  label: string;
  products: Product[];
  speed: "regular" | "slow";
};

function ProductRow({ label, products, speed }: ProductRowProps) {
  const { locale, t } = useI18n();
  const repeatedProducts = [...products, ...products];

  return (
    <div className={styles.rowWrap} aria-label={label}>
      <div
        className={`${styles.track} ${speed === "slow" ? styles.trackSlow : styles.trackRegular}`}
        title={t("homeMarqueePause")}
      >
        {repeatedProducts.map((product, index) => {
          const duplicate = index >= products.length;
          const href = productHref(product.id);
          const discountPercent = product.originalPrice
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null;

          return (
            <article
              key={`${product.id}-${index}`}
              aria-hidden={duplicate || undefined}
              data-marquee-copy={duplicate ? "duplicate" : "source"}
              className={styles.card}
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
                    sizes="(min-width: 1024px) 210px, (min-width: 640px) 190px, 156px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
                  />
                  {discountPercent ? (
                    <span className={styles.discount}>-{discountPercent}%</span>
                  ) : null}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.name}>{product.name[locale]}</p>
                  <div className={styles.priceLine}>
                    <span className={styles.price}>{formatMoney(product.price, locale)}</span>
                    {product.originalPrice ? (
                      <span className={styles.originalPrice}>
                        {formatMoney(product.originalPrice, locale)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CategoryNavLink>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/**
 * An editorial two-row product parade. Each row repeats the exact same active
 * catalog subset, so transform(-50%) loops without a visible jump.
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

  if (catProducts.length === 0 || dogProducts.length === 0) {
    return null;
  }

  return (
    <section
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
    </section>
  );
}
