import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatusBadges } from "@/components/product/ProductStatusBadges";
import { HOME_FEATURED_PRODUCT_IDS } from "@/lib/home-featured-product-ids";
import { formatMoney } from "@/lib/i18n/translations";
import { getProductsByCategory, isStorefrontReadyProduct, productHref, type Product } from "@/lib/products";

type HomepageProductGridProps = {
  products: Product[];
};

/** Server-rendered homepage product section. Products are assembled by the page from Supabase. */
export function HomepageProductGrid({ products: catalogProducts }: HomepageProductGridProps) {
  console.log("[homepage-product-grid] SSR products", catalogProducts);
  if (catalogProducts.length === 0) {
    console.error("[homepage-product-grid] SSR products is empty", {
      error: "No products were returned by getCatalogSnapshot",
    });
  }
  const products = getProductsByCategory(null, catalogProducts)
    .filter(isStorefrontReadyProduct)
    .sort((left, right) => {
      const leftRank = HOME_FEATURED_PRODUCT_IDS.indexOf(left.id as (typeof HOME_FEATURED_PRODUCT_IDS)[number]);
      const rightRank = HOME_FEATURED_PRODUCT_IDS.indexOf(right.id as (typeof HOME_FEATURED_PRODUCT_IDS)[number]);
      const normalizedLeftRank = leftRank === -1 ? HOME_FEATURED_PRODUCT_IDS.length : leftRank;
      const normalizedRightRank = rightRank === -1 ? HOME_FEATURED_PRODUCT_IDS.length : rightRank;
      return normalizedLeftRank - normalizedRightRank || left.id.localeCompare(right.id, undefined, { numeric: true });
    })
    .slice(0, 12);

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
              今期人氣寵物好物
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              由 Mofu Haven 精選的貓咪、狗狗及日系寵物用品，直接由現時產品目錄載入。
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-8 text-center shadow-[0_14px_30px_-26px_rgba(43,38,35,0.28)]">
            <p className="text-sm font-semibold text-[color:var(--ink)]">暫時沒有可顯示的產品</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">請稍後再試，或到商品目錄查看全部產品。</p>
            <CategoryNavLink
              href="/menu"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            >
              查看商品目錄
            </CategoryNavLink>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => {
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
                    aria-label={`查看商品: ${product.name.zh}`}
                    className="relative block aspect-square overflow-hidden bg-[color:var(--accent-soft)]"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name.zh}
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
                      {product.name.zh}
                    </CategoryNavLink>
                    {product.description?.zh ? (
                      <p className="line-clamp-2 text-xs leading-snug text-[color:var(--muted)]">{product.description.zh}</p>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
                      <p className="text-lg font-extrabold tabular-nums text-[color:var(--accent)]">
                        {formatMoney(product.price, "zh")}
                      </p>
                      {product.originalPrice ? (
                        <p className="text-xs tabular-nums text-[color:var(--muted)] line-through">
                          {formatMoney(product.originalPrice, "zh")}
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
        )}
      </div>
    </section>
  );
}
