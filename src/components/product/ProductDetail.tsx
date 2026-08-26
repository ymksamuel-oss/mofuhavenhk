"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductImage } from "@/components/product/ProductImage";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useState } from "react";
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
  const hasPackVariants = Boolean(product.variants?.length);
  const specOptions = hasPackVariants
    ? product.variants!.map((variant) => ({
        zh: variant.label.zh,
        en: variant.label.en,
        price: variant.price,
        priceId: variant.priceId,
        unitLabel: variant.unitLabel,
        originalPrice: variant.originalPrice,
      }))
    : product.specs?.length
      ? product.specs
      : [{ zh: t("productSpecDefault"), en: t("productSpecDefault") }];
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const selectedOption = specOptions[selectedSpecIndex];
  const selectedPrice = hasPackVariants && "price" in selectedOption
    ? selectedOption.price
    : product.price;
  const selectedPriceId = hasPackVariants && "priceId" in selectedOption
    ? selectedOption.priceId
    : product.priceId;
  const selectedOriginalPrice = hasPackVariants && "originalPrice" in selectedOption
    ? selectedOption.originalPrice
    : product.originalPrice;
  const category = getCategoryBySlug(product.categorySlug);
  const cartSubtotal = calcSubtotal(toOrderItems());
  const discountPercent = selectedOriginalPrice
    ? Math.round((1 - selectedPrice / selectedOriginalPrice) * 100)
    : null;

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] pt-8 sm:px-6 sm:py-12 lg:pb-12">
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
        <div className="relative w-full">
          <ProductGallery
            images={product.images}
            fallbackImage={product.image}
            alt={product.name[locale]}
            priority
          />
          {discountPercent ? (
            <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-[#c0483a] px-3 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="milk-tea-card p-5 sm:p-7">
          <p className="text-sm text-[color:var(--muted)]">商品編號：{product.id}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-[color:var(--ink)] sm:text-3xl">
            {product.name[locale]}
          </h1>

          <div className="mt-5 flex w-full min-w-0 flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="whitespace-nowrap text-4xl font-extrabold leading-none tabular-nums text-[color:var(--accent)] sm:text-[2.65rem]">
              {formatMoney(selectedPrice, locale)}
            </span>
            {selectedOriginalPrice ? (
              <span className="whitespace-nowrap text-base tabular-nums text-[color:var(--muted)] line-through">
                {formatMoney(selectedOriginalPrice, locale)}
              </span>
            ) : null}
          </div>
          {discountPercent ? (
            <p className="mt-1 text-sm font-semibold text-[#c0483a]">
              {t("productDiscountBadge")}
            </p>
          ) : null}
          <MarketReferencePrice
            price={product.marketReferencePrice}
            asOf={product.marketReferenceAsOf}
            className="mt-2"
          />

          <FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />

          {product.description ? (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                {t("productModalFeaturesTitle")}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                {product.description[locale] || product.description.zh || product.description.en}
              </p>
            </div>
          ) : null}

          {product.texture || product.availability ? (
            <dl className="mt-6 grid gap-4 border-y border-[color:var(--line)] py-4 sm:grid-cols-2">
              {product.texture ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                    {t("productTextureTitle")}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                    {product.texture[locale] || product.texture.zh || product.texture.en}
                  </dd>
                </div>
              ) : null}
              {product.availability ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                    {t("productAvailabilityTitle")}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                    {product.availability[locale] || product.availability.zh || product.availability.en}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                {t("productSpecSelectorTitle")}
              </h2>
              <span className="text-[11px] text-[color:var(--muted)]">
                {t("productModalSpecsTitle")}
              </span>
            </div>
            <div
              className="mt-3 grid gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label={t("productSpecSelectorTitle")}
            >
              {specOptions.map((spec, index) => {
                const selected = selectedSpecIndex === index;
                return (
                  <button
                    key={`${spec.zh}-${index}`}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedSpecIndex(index)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                      selected
                        ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                        : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/60"
                    }`}
                  >
                    <span className="min-w-0 leading-snug">
                      <span className="block">{spec[locale] || spec.zh || spec.en}</span>
                      {hasPackVariants && "price" in spec ? (
                        <span className="mt-0.5 block text-xs font-medium tabular-nums text-[color:var(--muted)]">
                          {formatMoney(spec.price, locale)}
                          {spec.unitLabel ? ` · ${spec.unitLabel[locale] || spec.unitLabel.zh}` : ""}
                        </span>
                      ) : null}
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                        selected
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                          : "border-[color:var(--line)] bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">
              {t("productSpecSelectorHint")}
            </p>
          </div>

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

          <div className="hidden space-y-3 sm:block">
            <AddToCartButton productId={product.id} priceId={selectedPriceId} size="modal" />
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
                className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)]"
              >
                {t("menuAddToCheckout")}
              </CategoryNavLink>
            )}
          </div>
        </div>
      </div>

      <FAQAccordion />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--line)] bg-white/95 shadow-[0_-16px_36px_-28px_rgba(43,38,35,0.42)] backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-end gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3">
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {t("total")}
            </p>
            <p className="mt-0.5 text-xl font-extrabold leading-none tabular-nums text-[color:var(--accent)]">
              {formatMoney(selectedPrice, locale)}
            </p>
          </div>
          {product.inStock === false ? (
            <span
              aria-disabled="true"
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl bg-[color:var(--muted)] px-4 py-3 text-sm font-semibold text-white opacity-70"
            >
              {t("productSoldOut")}
            </span>
          ) : (
            <AddToCartButton
              productId={product.id}
              priceId={selectedPriceId}
              size="modal"
              showQuantity={false}
              className="!mt-0 min-w-0 flex-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}
