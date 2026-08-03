"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  size?: "card" | "modal";
};

/**
 * Stays on the current page — never navigates to checkout.
 * Brief 「已加入 ✓」 feedback after a successful add.
 */
export function AddToCartButton({
  productId,
  className = "",
  size = "card",
}: AddToCartButtonProps) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(productId, 1);
        setAdded(true);
      }}
      aria-live="polite"
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-[0_8px_16px_-9px_rgba(169,124,80,0.75)] transition active:scale-[0.97] ${
        added
          ? "bg-emerald-600 hover:bg-emerald-600 animate-[fadeUp_0.25s_ease_both]"
          : "bg-[color:var(--accent)] hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_10px_20px_-9px_rgba(92,58,34,0.65)]"
      } ${
        size === "modal"
          ? "mt-6 w-full px-4 py-3 text-sm"
          : "mt-1 px-4 py-2.5 text-xs"
      } ${className}`}
    >
      {added ? t("menuAddedToCart") : t("menuAddToCart")}
    </button>
  );
}
