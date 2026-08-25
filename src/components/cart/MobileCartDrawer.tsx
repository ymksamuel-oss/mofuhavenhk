"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { FreeShippingProgress } from "@/components/shipping/FreeShippingProgress";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { calcSubtotal, MAX_QTY, MIN_QTY } from "@/lib/order";
import { formatMoney } from "@/lib/i18n/translations";
import { useCart } from "@/lib/shop/cart";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

type MobileCartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onEmptyStateChange?: (isEmpty: boolean) => void;
};

export function MobileCartDrawer({
  open,
  onClose,
  onEmptyStateChange,
}: MobileCartDrawerProps) {
  const { locale, t } = useI18n();
  const { products } = useCatalog();
  const { itemCount, toOrderItems, setQty, removeItem, addItem } = useCart();
  const [portalReady, setPortalReady] = useState(false);
  const items = toOrderItems();
  const subtotal = calcSubtotal(items);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (open && onEmptyStateChange) {
      onEmptyStateChange(items.length === 0);
    }
    if (!open) {
      if (onEmptyStateChange) onEmptyStateChange(false);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const suggestions = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.inStock !== false &&
            !items.some((item) => item.id === product.id),
        )
        .slice(0, 3),
    [items, products],
  );

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-cart-drawer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(43,38,35,0.46)] backdrop-blur-[2px]"
        aria-label={t("cartDrawerClose")}
        onClick={onClose}
      />

        <aside
          className={
            items.length === 0
              ? "absolute inset-x-0 bottom-0 top-auto flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[28px] border-t border-[color:var(--line)] bg-[color:var(--background)] shadow-[0_-20px_48px_-16px_rgba(43,38,35,0.38)] animate-in slide-in-from-bottom duration-300"
              : "absolute inset-y-0 right-0 flex w-full max-w-full flex-col overflow-hidden border-l border-[color:var(--line)] bg-[color:var(--background)] shadow-[-20px_0_48px_-26px_rgba(43,38,35,0.38)] sm:w-[min(94vw,28rem)]"
          }
        >
        <header className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] bg-[color:var(--background)] px-4 pb-4 pt-[max(1.1rem,env(safe-area-inset-top,0px))] sm:px-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
              Mofu Haven
            </p>
            <h2
              id="mobile-cart-drawer-title"
              className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-[color:var(--ink)]"
            >
              {t("cartDrawerTitle")}
              <span className="ml-2 text-sm font-medium text-[color:var(--muted)]">
                ({itemCount})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cartDrawerClose")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-5">
          {items.length === 0 ? (
            <div className="px-1 py-4 text-center">
              <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                {t("cartDrawerEmpty")}
              </p>
              <div className="mt-6">
                <Link
                  href="/menu"
                  onClick={onClose}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[color:var(--accent)] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-[color:var(--hero-deep)]"
                >
                  {t("navContinueShopping")}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <FreeShippingProgress subtotal={subtotal} className="mb-5" />
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.lineKey}
                    className="flex gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4 shadow-[0_10px_24px_-24px_rgba(43,38,35,0.5)]"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[color:var(--background)] ring-1 ring-[color:var(--line)]">
                      <ProductImage
                        src={item.image}
                        alt={item.name[locale]}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-[color:var(--ink)]">
                            {item.name[locale]}
                          </p>
                          {item.variantLabel ? (
                            <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                              {item.variantLabel[locale] || item.variantLabel.zh}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.lineKey)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-lg leading-none text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
                          aria-label={`${t("removeItem")}：${item.name[locale]}`}
                        >
                          ×
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {formatMoney(item.unit, locale)}/{t("unitPriceSuffix")}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setQty(item.lineKey, Math.max(MIN_QTY, item.qty - 1))
                            }
                            disabled={item.qty <= MIN_QTY}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-semibold text-[color:var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={t("qtyDecrease")}
                          >
                            −
                          </button>
                          <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)]">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQty(item.lineKey, Math.min(MAX_QTY, item.qty + 1))
                            }
                            disabled={item.qty >= MAX_QTY}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-semibold text-[color:var(--ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={t("qtyIncrease")}
                          >
                            +
                          </button>
                        </div>
                        <p className="shrink-0 text-base font-bold tabular-nums text-[color:var(--accent)]">
                          {formatMoney(item.qty * item.unit, locale)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 ? (
                <section className="mt-6" aria-labelledby="cart-upsell-title">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
                        Mofu picks
                      </p>
                      <h3
                        id="cart-upsell-title"
                        className="mt-1 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--ink)]"
                      >
                        {t("cartDrawerUpsellTitle")}
                      </h3>
                    </div>
                    <span className="text-xs text-[color:var(--muted)]">
                      {t("cartDrawerUpsellHint")}
                    </span>
                  </div>
                  <ul className="grid gap-3">
                    {suggestions.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-white p-3 shadow-[0_10px_24px_-24px_rgba(43,38,35,0.5)]"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-[color:var(--line)]">
                          <ProductImage
                            src={product.image}
                            alt={product.name[locale]}
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-medium leading-snug text-[color:var(--ink)]">
                            {product.name[locale]}
                          </p>
                          <p className="mt-1 text-sm font-bold tabular-nums text-[color:var(--accent)]">
                            {formatMoney(product.price, locale)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(product.id)}
                          className="shrink-0 rounded-xl bg-[color:var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--hero-deep)] active:scale-[0.97]"
                        >
                          {t("cartDrawerAdd")}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="shrink-0 border-t border-[color:var(--line)] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm text-[color:var(--muted)]">{t("subtotal")}</span>
              <span className="text-xl font-bold tabular-nums text-[color:var(--accent)]">
                {formatMoney(subtotal, locale)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(122,75,49,0.58)] transition hover:bg-[color:var(--hero-deep)] hover:shadow-[0_16px_30px_-14px_rgba(84,57,45,0.58)]"
            >
              {t("cartDrawerCheckoutCta")}
            </Link>
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
