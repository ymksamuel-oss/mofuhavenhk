"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { MAX_QTY, MIN_QTY } from "@/lib/order";
import { useCart } from "@/lib/shop/cart";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  size?: "card" | "modal";
};

/**
 * Stays on the current page — never navigates to checkout.
 * Qty stepper lets shoppers pick units before adding.
 * Brief 「已加入 ✓」 feedback after a successful add.
 */
export function AddToCartButton({
  productId,
  className = "",
  size = "card",
}: AddToCartButtonProps) {
  const { t } = useI18n();
  const { addItem } = useCart();
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

  const stepperBtnClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-base font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={`flex flex-col ${
        size === "modal" ? "mt-6 gap-3" : "mt-1 gap-2"
      } ${className}`}
    >
      <div
        className="flex items-center justify-center gap-2"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          onClick={decrease}
          disabled={qty <= MIN_QTY}
          aria-label={t("qtyDecrease")}
          className={stepperBtnClass}
        >
          −
        </button>
        <span
          className="min-w-8 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)]"
          aria-live="polite"
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={qty >= MAX_QTY}
          aria-label={t("qtyIncrease")}
          className={stepperBtnClass}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          addItem(productId, qty);
          setAdded(true);
          setQty(MIN_QTY);
        }}
        aria-live="polite"
        className={`inline-flex w-full items-center justify-center rounded-full font-semibold text-white shadow-[0_8px_16px_-9px_rgba(169,124,80,0.75)] transition active:scale-[0.97] ${
          added
            ? "bg-emerald-600 hover:bg-emerald-600 animate-[fadeUp_0.25s_ease_both]"
            : "bg-[color:var(--accent)] hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_10px_20px_-9px_rgba(92,58,34,0.65)]"
        } ${size === "modal" ? "px-4 py-3 text-sm" : "px-4 py-2.5 text-xs"}`}
      >
        {added ? t("menuAddedToCart") : t("menuAddToCart")}
      </button>
    </div>
  );
}
