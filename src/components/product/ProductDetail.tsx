"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { ProductImage } from "@/components/product/ProductImage";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { calcSubtotal } from "@/lib/order";
import { useCart } from "@/lib/shop/cart";
import type { Product } from "@/lib/products";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const { locale, t } = useI18n();
  const { toOrderItems } = useCart();
  const category = getCategoryBySlug(product.categorySlug);
  const cartSubtotal = calcSubtotal(toOrderItems());
  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
        <CategoryNavLink
          href="/menu"
          className="touch-manipulation font-medium hover:text-[color:var(--accent)]"
        >
          {t("menuTitle")}
        </CategoryNavLink>
        <span aria-hidden>/</span>
        {category ? (
          <>
            <CategoryNavLink
              href={categoryHref(category.slug)}
              className="touch-manipulation font-medium hover:text-[color:var(--accent)]"
            >
              {t(category.labelKey)}
            </CategoryNavLink>
            <span aria-hidden>/</span>
          </>
        ) : null}
        <span className="text-[color:var(--ink)]">{product.name[locale]}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[color:var(--surface)] ring-1 ring-[color:var(--line)]">
          <ProductImage
            src={product.image}
            alt={product.name[locale]}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {discountPercent ? (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-[#c0483a] px-3 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="milk-tea-card p-5 sm:p-7">
          <p className="text-sm text-[#777777]">商品編號：{product.id}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-[color:var(--ink)] sm:text-3xl">
            {product.name[locale]}
          </h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tabular-nums text-[#8C5432]">
              {formatMoney(product.price, locale)}
            </span>
            {product.originalPrice ? (
              <span className="text-base tabular-nums text-[color:var(--muted)] line-through">
                {formatMoney(product.originalPrice, locale)}
              </span>
            ) : null}
          </div>
          {discountPercent ? (
            <p className="mt-1 text-sm font-semibold text-[#c0483a]">
              {t("productDiscountBadge")}
            </p>
          ) : null}

          <FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />

          {product.description ? (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                {t("productModalFeaturesTitle")}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                {product.description[locale]}
              </p>
            </div>
          ) : null}

          {product.specs && product.specs.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                {t("productModalSpecsTitle")}
              </h2>
              <ul className="mt-1.5 space-y-1.5">
                {product.specs.map((spec) => (
                  <li
                    key={spec.zh}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[color:var(--ink)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]"
                    />
                    {spec[locale]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.inStock === false ? (
            <div
              className="mt-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-3"
              role="status"
            >
              <p className="text-sm font-semibold text-[color:var(--ink)]">
                {t("productSoldOut")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
                {t("productOutOfStockMessage")}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <AddToCartButton productId={product.id} size="modal" />
            {product.inStock === false ? (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--muted)] px-4 py-3 text-sm font-semibold text-white opacity-70"
              >
                {t("productSoldOut")}
              </span>
            ) : (
              <CategoryNavLink
                href="/checkout"
                className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)]"
              >
                {t("menuAddToCheckout")}
              </CategoryNavLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
