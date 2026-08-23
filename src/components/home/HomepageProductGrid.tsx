"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, productHref } from "@/lib/products";

/**
 * Homepage storefront section backed by the live catalog supplied by the
 * server-side Stripe adapter. The homepage presents a focused 12-product selection;
 * the full active catalog remains available from the Shop page.
 */
export function HomepageProductGrid() {
  const { locale, t } = useI18n();
  const { products: catalogProducts } = useCatalog();
  const products = getProductsByCategory(null, catalogProducts).slice(0, 12);

  return (
    <section
      aria-labelledby="homepage-products-title"
      className="border-t border-[color:var(--line)] bg-[color:var(--background)] px-6 py-12 sm:px-10 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div>
            <span className="inline-flex rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[color:var(--accent)]">
              MOFU HAVEN PICKS
            </span>
            <h2
              id="homepage-products-title"
              className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl"
            >
              {t("homepagePicksTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              {t("homepagePicksSub")}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-8 text-center shadow-[0_14px_30px_-26px_rgba(43,38,35,0.28)]">
            <p className="text-sm font-semibold text-[color:var(--ink)]">
              {t("catalogUpdating")}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {t("catalogUpdatingHint")}
            </p>
            <CategoryNavLink
              href="/menu"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            >
              {t("goToCatalog")}
            </CategoryNavLink>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => {
              const href = productHref(product.id);
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
                  </CategoryNavLink>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
                    <CategoryNavLink
                      href={href}
                      className="line-clamp-2 min-h-[2.5rem] text-left text-sm font-semibold leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--accent)]"
                    >
                      {product.name[locale]}
                    </CategoryNavLink>
                    {product.description ? (
                      <p className="line-clamp-2 text-xs leading-snug text-[color:var(--muted)]">
                        {product.description[locale]}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-1 text-lg font-extrabold tabular-nums text-[color:var(--accent)]">
                      {formatMoney(product.price, locale)}
                    </p>
                    <AddToCartButton productId={product.id} size="card" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </section>
  );
}
