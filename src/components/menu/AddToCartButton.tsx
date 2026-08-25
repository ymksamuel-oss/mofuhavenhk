"use client";

import { useEffect, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { MAX_QTY, MIN_QTY } from "@/lib/order";
import { useCart } from "@/lib/shop/cart";

type AddToCartButtonProps = {
  productId: string;
  /** Verified Stripe Price ID for the selected quantity tier. */
  priceId?: string;
  className?: string;
  /** `list` = compact qty stepper for horizontal freeze-dried cards. */
  size?: "card" | "modal" | "list";
  /** Hide the quantity control when rendered inside a fixed mobile action bar. */
  showQuantity?: boolean;
};

/**
 * Stays on the current page — never navigates to checkout.
 * Qty stepper lets shoppers pick units before adding.
 * Brief 「已加入 ✓」 feedback after a successful add.
 */
export function AddToCartButton({
  productId,
  priceId,
  className = "",
  size = "card",
  showQuantity = true,
}: AddToCartButtonProps) {
  const { t } = useI18n();
  const { getProductById } = useCatalog();
  const { addItem } = useCart();
  const product = getProductById(productId);
  const purchasable = Boolean(product && product.inStock !== false);
  const [qty, setQty] = useState(MIN_QTY);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  const decrease = () => {
    setQty((current) => Math.max(MIN_QTY, current - 1));
  };

  const increase = () => {
    setQty((current) => Math.min(MAX_QTY, current + 1));
  };

  const stop = (event: React.MouseEvent | React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const stepperBtnClass =
    size === "list"
      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-base font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40";

  const stepper = (
    <div className="flex items-center gap-1.5" onClick={stop}>
      <button
        type="button"
        onClick={decrease}
        disabled={!purchasable || qty <= MIN_QTY}
        aria-label={t("qtyDecrease")}
        className={stepperBtnClass}
      >
        −
      </button>
      <span
        className="min-w-6 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)]"
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={!purchasable || qty >= MAX_QTY}
        aria-label={t("qtyIncrease")}
        className={stepperBtnClass}
      >
        +
      </button>
    </div>
  );

  if (size === "list") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {stepper}
        <button
          type="button"
          onClick={(event) => {
            stop(event);
            if (!purchasable) return;
            addItem(productId, qty, priceId);
            setAdded(true);
            setQty(MIN_QTY);
          }}
          disabled={!purchasable}
          aria-live="polite"
          className={`inline-flex shrink-0 items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 ${
            added
              ? "bg-emerald-600"
              : "bg-[color:var(--accent)] hover:bg-[color:var(--hero-deep)]"
          }`}
        >
          {!purchasable
            ? t("productSoldOut")
            : added
              ? t("menuAddedToCart")
              : t("menuAddToCart")}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${
        size === "modal" ? "mt-6 gap-3" : "mt-1 gap-2"
      } ${className}`}
    >
      {showQuantity ? (
        <div className="flex items-center justify-center gap-2" onClick={stop}>
          {stepper}
        </div>
      ) : null}

      <button
        type="button"
        onClick={(event) => {
          stop(event);
          if (!purchasable) return;
          addItem(productId, qty, priceId);
          setAdded(true);
          setQty(MIN_QTY);
        }}
        disabled={!purchasable}
        aria-live="polite"
        className={`inline-flex w-full items-center justify-center rounded-2xl font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 disabled:shadow-none ${
          added
            ? "bg-emerald-600 hover:bg-emerald-600 animate-[fadeUp_0.25s_ease_both]"
            : "bg-[color:var(--accent)] hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)]"
        } ${size === "modal" ? "px-4 py-3 text-sm" : "px-4 py-2.5 text-xs"}`}
      >
        {!purchasable
          ? t("productSoldOut")
          : added
            ? t("menuAddedToCart")
            : t("menuAddToCart")}
      </button>
    </div>
  );
}
