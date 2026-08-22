"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ContinueShoppingButtonProps = {
  className?: string;
  /** Visual weight — header CTA vs bottom strip. */
  variant?: "primary" | "soft";
};

/**
 * Returns shoppers to the product catalog from cart / checkout.
 * Uses a real <Link> (always navigates) plus an explicit router.push
 * so the control never becomes a dead touch target.
 */
export function ContinueShoppingButton({
  className = "",
  variant = "primary",
}: ContinueShoppingButtonProps) {
  const { t } = useI18n();
  const router = useRouter();

  const base =
    "relative z-20 inline-flex min-h-11 w-full max-w-full touch-manipulation items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-center text-sm font-semibold transition active:scale-[0.99] sm:w-auto";

  const styles =
    variant === "primary"
      ? "border border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] hover:bg-[color:var(--hero-deep)] hover:border-[color:var(--hero-deep)]"
      : "border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)] shadow-[0_10px_24px_-14px_rgba(122,75,49,0.3)] hover:border-[color:var(--hero-deep)] hover:bg-[color:var(--accent)] hover:text-white";

  return (
    <Link
      href="/menu"
      className={`${base} ${styles} ${className}`}
      onClick={(event) => {
        // Ensure navigation even if a parent handler interferes.
        event.stopPropagation();
        // Prefer client navigation; Link href remains the hard fallback.
        if (typeof window !== "undefined") {
          event.preventDefault();
          router.push("/menu");
        }
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none h-5 w-5 shrink-0"
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
      <span className="pointer-events-none">{t("navContinueShopping")}</span>
    </Link>
  );
}
