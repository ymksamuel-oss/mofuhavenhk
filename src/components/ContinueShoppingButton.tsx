"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ContinueShoppingButtonProps = {
  className?: string;
  /** Visual weight — header CTA vs bottom strip. */
  variant?: "primary" | "soft";
};

/**
 * Returns shoppers to the product catalog from cart / checkout.
 */
export function ContinueShoppingButton({
  className = "",
  variant = "primary",
}: ContinueShoppingButtonProps) {
  const { t } = useI18n();

  const base =
    "inline-flex w-full max-w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-sm font-semibold transition active:scale-[0.99] sm:w-auto";

  const styles =
    variant === "primary"
      ? "border border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_24px_-14px_rgba(169,124,80,0.75)] hover:bg-[color:var(--hero-deep)] hover:border-[color:var(--hero-deep)]"
      : "border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)] shadow-[0_10px_24px_-16px_rgba(169,124,80,0.7)] hover:border-[color:var(--hero-deep)] hover:bg-[color:var(--accent)] hover:text-white";

  return (
    <Link href="/menu" className={`${base} ${styles} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14.5 6.5L9 12l5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{t("navContinueShopping")}</span>
    </Link>
  );
}
