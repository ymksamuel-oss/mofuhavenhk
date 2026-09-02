"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { FAQAccordion } from "@/components/FAQAccordion";
import { MarketReferencePrice } from "@/components/product/MarketReferencePrice";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { ProductImage } from "@/components/product/ProductImage";
import { OutOfStockOrderButton } from "@/components/product/OutOfStockOrderButton";
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
  const family = getProductFlavorFamily(product.stripeProductId ?? product.id);
  const [selectedProductId, setSelectedProductId] = useState(product.id);
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);

  const familyChoices = useMemo<FamilyChoice[]>(() => {
    if (!family) return [];
    const catalogById = new Map(
      products.flatMap((candidate) => [
        [candidate.id, candidate] as const,
        ...(candidate.stripeProductId ? [[candidate.stripeProductId, candidate] as const] : []),
      ]),
    );
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
  const variantSelectorTitle = selectedProduct.metadata?.[`variant_selection_label_${locale}`]
    ?? t("productSpecSelectorTitle");
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
  const metadata = selectedProduct.metadata ?? {};
  const metadataValue = (zhKey: string, enKey: string) => {
    const preferred = locale === "zh" ? metadata[zhKey] : metadata[enKey];
    const fallback = locale === "zh" ? metadata[enKey] : metadata[zhKey];
    return preferred?.trim() || fallback?.trim();
  };
  const detailedInformation = [
    { label: t("productBrandLabel"), value: selectedProduct.brand || metadataValue("brand", "brand") },
    { label: t("productTypeLabel"), value: metadataValue("product_type_zh", "product_type_en") },
    { label: t("productIngredientsLabel"), value: metadataValue("ingredients_zh", "ingredients_en") },
    { label: t("productMaterialLabel"), value: metadataValue("material_zh", "material_en") },
    { label: t("productGuaranteedAnalysisLabel"), value: metadataValue("guaranteed_analysis_zh", "guaranteed_analysis_en") },
    { label: t("productEnergyLabel"), value: metadataValue("energy_zh", "energy_en") },
    { label: t("productOriginLabel"), value: metadataValue("country_of_origin_zh", "country_of_origin_en") },
    { label: t("productFeedingLabel"), value: metadataValue("feeding_zh", "feeding_en") },
    { label: t("productStorageLabel"), value: metadataValue("storage_zh", "storage_en") },
    { label: t("productCareLabel"), value: metadataValue("care_zh", "care_en") },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
  const officialSourceUrl = metadata.official_source_url?.trim();
  const safeOfficialSourceUrl = officialSourceUrl?.startsWith("https://") ? officialSourceUrl : undefined;
  const officialSourceLabel = metadataValue("official_source_label_zh", "official_source_label_en") ?? safeOfficialSourceUrl;
  const notice = metadataValue("notice_zh", "notice_en");
  const verificationNote = metadataValue("verification_note_zh", "verification_note_en");
  const mofuSku = metadata.mofu_sku?.trim();

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
            key={`${selectedProduct.id}-${selectedPriceId}`}
            images={selectedOption?.image ? [selectedOption.image] : selectedProduct.images}
            fallbackImage={selectedOption?.image ?? selectedProduct.image}
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
          <p className="text-sm text-[color:var(--muted)]">
            {mofuSku ? t("productSkuLabel") : t("productIdLabel")}：{mofuSku ?? selectedProduct.id}
          </p>
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
                {selectedProduct.description[locale] || t("productDescriptionUnavailable")}
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
                    {selectedProduct.texture[locale] || t("productValueUnavailable")}
                  </dd>
                </div>
              ) : null}
              {selectedProduct.availability ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                    {t("productAvailabilityTitle")}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
                    {selectedProduct.availability[locale] || t("productValueUnavailable")}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {selectedProduct.specs && selectedProduct.specs.length > 0 ? (
            <section className="mt-6" aria-labelledby="product-specifications-title">
              <h2
                id="product-specifications-title"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
              >
                {t("productModalSpecsTitle")}
              </h2>
              <ul className="mt-2 space-y-2">
                {selectedProduct.specs.map((spec, index) => (
                  <li
                    key={`${selectedProduct.id}-spec-${index}`}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[color:var(--ink)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]"
                    />
                    {spec[locale] || t("productValueUnavailable")}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {detailedInformation.length > 0 ? (
            <section className="mt-6 border-t border-[color:var(--line)] pt-6" aria-labelledby="product-information-title">
              <h2
                id="product-information-title"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
              >
                {t("productInformationTitle")}
              </h2>
              <dl className="mt-3 space-y-3">
                {detailedInformation.map((item) => (
                  <div key={item.label} className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                    <dt className="text-xs font-semibold tracking-wide text-[color:var(--accent)]">{item.label}</dt>
                    <dd className="text-sm leading-relaxed text-[color:var(--ink)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {safeOfficialSourceUrl ? (
            <section className="mt-6" aria-labelledby="product-source-title">
              <h2
                id="product-source-title"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
              >
                {t("productOfficialSourceTitle")}
              </h2>
              <a
                href={safeOfficialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex text-sm font-medium leading-relaxed text-[color:var(--accent)] underline underline-offset-4 hover:text-[color:var(--hero-deep)]"
              >
                {officialSourceLabel}
              </a>
            </section>
          ) : null}

          {notice || verificationNote ? (
            <section className="mt-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-3" aria-labelledby="product-notice-title">
              <h2
                id="product-notice-title"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]"
              >
                {t("productImportantNotesTitle")}
              </h2>
              {notice ? <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">{notice}</p> : null}
              {verificationNote ? <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">{verificationNote}</p> : null}
            </section>
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
                  {familyChoices.length} {t("productChoicesSuffix")}
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
                      className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                        selected
                          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : unavailable
                            ? "cursor-not-allowed border-[color:var(--line)] bg-white/60 text-[color:var(--muted)] opacity-55"
                            : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/60"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-[color:var(--line)]">
                          <ProductImage
                            src={choice.product.image}
                            alt={choice.label[locale]}
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </span>
                        <span className="min-w-0 leading-snug">
                          <span className="block">{choice.label[locale]}</span>
                          <span className="mt-0.5 block text-xs font-medium tabular-nums text-[color:var(--muted)]">
                            {formatMoney(choice.product.price, locale)}
                            {unavailable ? ` · ${t("productSoldOut")}` : ""}
                          </span>
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
                  {variantSelectorTitle}
                </h2>
                <span className="text-[11px] text-[color:var(--muted)]">
                  {t("productModalSpecsTitle")}
                </span>
              </div>
              <div
                className="mt-3 grid gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label={variantSelectorTitle}
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
                      className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
                        selected
                          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/60"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {spec.image ? (
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-[color:var(--line)]">
                            <ProductImage
                              src={spec.image}
                              alt={spec.label[locale] || t("productValueUnavailable")}
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </span>
                        ) : null}
                        <span className="min-w-0 leading-snug">
                          <span className="block">{spec.label[locale] || t("productValueUnavailable")}</span>
                          <span className="mt-0.5 block text-xs font-medium tabular-nums text-[color:var(--muted)]">
                            {formatMoney(spec.price, locale)}
                            {spec.unitLabel ? ` · ${spec.unitLabel[locale] || t("productValueUnavailable")}` : ""}
                          </span>
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
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">
                {t("productOrderInquiryHint")}
              </p>
              <OutOfStockOrderButton
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                mofuSku={mofuSku}
                className="mt-3"
              />
            </div>
          ) : null}

          <div className="hidden space-y-3 sm:block">
            {selectedProduct.inStock === false ? (
              <OutOfStockOrderButton
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                mofuSku={mofuSku}
              />
            ) : (
              <>
                <AddToCartButton productId={selectedProduct.id} priceId={selectedPriceId} size="modal" />
                <CategoryNavLink
                  href="/checkout"
                  className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)]"
                >
                  {t("menuAddToCheckout")}
                </CategoryNavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <FAQAccordion />
      <ProductFAQ />

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
            <OutOfStockOrderButton
              productId={selectedProduct.id}
              productName={selectedProduct.name}
              mofuSku={mofuSku}
              className="!min-h-12 min-w-0 flex-1"
            />
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
