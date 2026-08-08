"use client";

import { useEffect } from "react";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { formatMoney, type Locale, type TranslationKey } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

type ProductQuickViewProps = {
  product: Product;
  locale: Locale;
  t: (key: TranslationKey) => string;
  onClose: () => void;
};

/**
 * A lightweight "quick view" overlay opened from a /menu product card,
 * showing the full product name, discounted/original price, feature
 * highlights, and detailed specs (material, size, contents, etc.) without
 * navigating away from the catalog — keeps browsing smooth while still
 * surfacing all the detail a customer needs before adding to the basket.
 */
export function ProductQuickView({
  product,
  locale,
  t,
  onClose,
}: ProductQuickViewProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(74,54,38,0.45)] p-4 backdrop-blur-sm animate-[fadeUp_0.2s_ease_both]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-quick-view-title"
      onClick={onClose}
    >
      <div
        className="milk-tea-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("productModalClose")}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm text-[color:var(--accent)] transition hover:bg-[color:var(--accent)] hover:text-white"
        >
          ✕
        </button>

        <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[color:var(--background)]">
          <ProductImage
            src={product.image}
            alt={product.name[locale]}
            sizes="(min-width: 640px) 512px, 100vw"
            className="object-cover"
            priority
          />
          {discountPercent ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#c0483a] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        <h2
          id="product-quick-view-title"
          className="text-center font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-[color:var(--ink)] sm:text-2xl"
        >
          {product.name[locale]}
        </h2>

        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-2xl font-bold tabular-nums text-[color:var(--accent)]">
            {formatMoney(product.price, locale)}
          </span>
          {product.originalPrice ? (
            <span className="text-sm tabular-nums text-[color:var(--muted)] line-through">
              {formatMoney(product.originalPrice, locale)}
            </span>
          ) : null}
        </div>
        {discountPercent ? (
          <p className="mt-1 text-center text-xs font-semibold text-[#c0483a]">
            {t("productDiscountBadge")}
          </p>
        ) : null}

        {product.description ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
              {t("productModalFeaturesTitle")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--ink)]">
              {product.description[locale]}
            </p>
          </div>
        ) : null}

        {product.specs && product.specs.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
              {t("productModalSpecsTitle")}
            </h3>
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
            className="mt-5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--accent-soft)] px-4 py-3 text-center"
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

        <AddToCartButton productId={product.id} size="modal" />
      </div>
    </div>
  );
}
