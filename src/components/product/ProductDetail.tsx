"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { categoryHref, getCategoryBySlug } from "@/lib/categories";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { calcSubtotal } from "@/lib/order";
import { getProductFlavorFamily, type Product } from "@/lib/products";
import { useCart } from "@/lib/shop/cart";
import { useEffect, useMemo, useState } from "react";

type ProductDetailProps = {
  product: Product;
};

type FamilyChoice = {
  product: Product;
  label: { zh: string; en: string };
};

export function ProductDetail({ product }: ProductDetailProps) {
  const { locale, t } = useI18n();
  const { toOrderItems } = useCart();
  const { products } = useCatalog();
  const family = getProductFlavorFamily(product.id);
  const [selectedProductId, setSelectedProductId] = useState(product.id);
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);

  const familyChoices = useMemo<FamilyChoice[]>(() => {
    if (!family) return [];
    const catalogById = new Map(products.map((candidate) => [candidate.id, candidate]));
    return family.choices.flatMap((choice) => {
      const candidate = catalogById.get(choice.productId);
      return candidate ? [{ product: candidate, label: choice.label }] : [];
    });
  }, [family, products]);

  useEffect(() => {
    setSelectedProductId(product.id);
    setSelectedSpecIndex(0);
  }, [product.id]);

  const selectedFamilyChoice = familyChoices.find(
    (choice) => choice.product.id === selectedProductId,
  );
  const selectedProduct = selectedFamilyChoice?.product ?? product;

  useEffect(() => {
    setSelectedSpecIndex(0);
  }, [selectedProduct.id]);

  const hasPackVariants = Boolean(selectedProduct.variants?.length);
  const specOptions = hasPackVariants ? selectedProduct.variants! : [];
  const selectedOption = specOptions[selectedSpecIndex] ?? specOptions[0];
  const selectedPrice = selectedOption?.price ?? selectedProduct.price;
  const selectedPriceId = selectedOption?.priceId ?? selectedProduct.priceId;
  const selectedOriginalPrice = selectedOption?.originalPrice ?? selectedProduct.originalPrice;
  const category = getCategoryBySlug(selectedProduct.categorySlug);
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
        <span className="text-[color:var(--ink)]">{selectedProduct.name[locale]}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
        <div className="relative w-full">
          <ProductGallery
            key={selectedProduct.id}
            images={selectedProduct.images}
            fallbackImage={selectedProduct.image}
            alt={selectedProduct.name[locale]}
            priority
          />
          {discountPercent ? (
            <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-[#c0483a] px-3 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="milk-tea-card p-5 sm:p-7">
          <p className="text-sm text-[color:var(--muted)]">商品編號：{selectedProduct.id}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-[color:var(--ink)] sm:text-3xl">
            {selectedProduct.name[locale]}
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
            price={selectedProduct.marketReferencePrice}
            asOf={selectedProduct.marketReferenceAsOf}
            className="mt-2"
          />

          <FreeShippingProgress subtotal={cartSubtotal} className="mt-5" />

          {selectedProduct.description ? (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                {t("productModalFeaturesTitle")}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                {selectedProduct.description[locale] || selectedProduct.description.zh || selectedProduct.description.en}
              </p>
            </div>
          ) : null}

          {selectedProduct.texture || selectedProduct.availability ? (
            <dl className="mt-6 grid gap-4 border-y border-[color:var(--line)] py-4 sm:grid-cols-2">
              {selectedProduct.texture ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                    {t("productTextureTitle")}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                    {selectedProduct.texture[locale] || selectedProduct.texture.zh || selectedProduct.texture.en}
                  </dd>
                </div>
              ) : null}
              {selectedProduct.availability ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                    {t("productAvailabilityTitle")}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                    {selectedProduct.availability[locale] || selectedProduct.availability.zh || selectedProduct.availability.en}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {family && familyChoices.length > 1 ? (
            <section className="mt-6" aria-labelledby="product-family-selector-title">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2
                    id="product-family-selector-title"
                    className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
                  >
                    {family.selector[locale]}
                  </h2>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{family.label[locale]}</p>
                </div>
                <span className="text-[11px] text-[color:var(--muted)]">
                  {familyChoices.length} {locale === "zh" ? "款可選" : "choices"}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={family.selector[locale]}>
                {familyChoices.map((choice) => {
                  const selected = choice.product.id === selectedProduct.id;
                  const unavailable = choice.product.inStock === false;
                  return (
                    <button
                      key={choice.product.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={unavailable}
                      onClick={() => setSelectedProductId(choice.product.id)}
                      className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                        selected
                          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : unavailable
                            ? "cursor-not-allowed border-[color:var(--line)] bg-white/60 text-[color:var(--muted)] opacity-55"
                            : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/60"
                      }`}
                    >
                      <span className="min-w-0 leading-snug">
                        <span className="block">{choice.label[locale]}</span>
                        <span className="mt-0.5 block text-xs font-medium tabular-nums text-[color:var(--muted)]">
                          {formatMoney(choice.product.price, locale)}
                          {unavailable ? ` · ${t("productSoldOut")}` : ""}
                        </span>
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
            </section>
          ) : null}

          {hasPackVariants ? (
            <section className="mt-6" aria-labelledby="product-pack-selector-title">
              <div className="flex items-end justify-between gap-3">
                <h2
                  id="product-pack-selector-title"
                  className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
                >
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
                      key={`${spec.key}-${index}`}
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
                        <span className="block">{spec.label[locale] || spec.label.zh || spec.label.en}</span>
                        <span className="mt-0.5 block text-xs font-medium tabular-nums text-[color:var(--muted)]">
                          {formatMoney(spec.price, locale)}
                          {spec.unitLabel ? ` · ${spec.unitLabel[locale] || spec.unitLabel.zh}` : ""}
                        </span>
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
            </section>
          ) : null}

          {selectedProduct.inStock === false ? (
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
            <AddToCartButton productId={selectedProduct.id} priceId={selectedPriceId} size="modal" />
            {selectedProduct.inStock === false ? (
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
          {selectedProduct.inStock === false ? (
            <span
              aria-disabled="true"
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl bg-[color:var(--muted)] px-4 py-3 text-sm font-semibold text-white opacity-70"
            >
              {t("productSoldOut")}
            </span>
          ) : (
            <AddToCartButton
              productId={selectedProduct.id}
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
