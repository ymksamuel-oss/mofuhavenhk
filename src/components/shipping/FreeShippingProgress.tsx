"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/order";

type FreeShippingProgressProps = {
  subtotal: number;
  className?: string;
};

/**
 * Free shipping prompt
 * Design: compact, warm, and mobile-first. It uses the live cart subtotal so
 * the message stays accurate on checkout and product detail surfaces.
 */
export function FreeShippingProgress({
  subtotal,
  className = "",
}: FreeShippingProgressProps) {
  const { locale, t } = useI18n();
  const safeSubtotal = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0;
  const reached = safeSubtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - safeSubtotal);
  const percentage = Math.min(
    100,
    Math.round((safeSubtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const message = reached
    ? t("freeShippingReached")
    : t("freeShippingRemaining").replace(
        "{amount}",
        formatMoney(remaining, locale),
      );

  return (
    <section
      className={`rounded-2xl border px-4 py-3.5 ${
        reached
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-[color:var(--accent)]/20 bg-[color:var(--accent-soft)]/65"
      } ${className}`}
      aria-label={t("freeShippingProgressLabel")}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`min-w-0 text-sm font-semibold leading-snug ${
            reached ? "text-emerald-800" : "text-[color:var(--ink)]"
          }`}
        >
          {message}
        </p>
        <span
          className={`shrink-0 text-xs font-bold tabular-nums ${
            reached ? "text-emerald-700" : "text-[color:var(--accent)]"
          }`}
        >
          {percentage}%
        </span>
      </div>

      <div
        className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/75 ring-1 ring-black/5"
        role="progressbar"
        aria-label={t("freeShippingProgressLabel")}
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(safeSubtotal, FREE_SHIPPING_THRESHOLD)}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            reached ? "bg-emerald-500" : "bg-[color:var(--accent)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p
        className={`mt-2 text-[11px] leading-relaxed ${
          reached ? "text-emerald-700" : "text-[color:var(--muted)]"
        }`}
      >
        {t("freeShippingThreshold")}
      </p>
    </section>
  );
}
