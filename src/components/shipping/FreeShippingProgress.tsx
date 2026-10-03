"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/order";
import { getFreeShippingProgress } from "@/lib/shipping-progress";

type FreeShippingProgressProps = {
  subtotal: number;
  className?: string;
  showContinueShoppingLink?: boolean;
};

/**
 * Free shipping prompt
 * Design: compact, warm, and mobile-first. It uses the live cart subtotal so
 * the message stays accurate on checkout and product detail surfaces.
 */
export function FreeShippingProgress({
  subtotal,
  className = "",
  showContinueShoppingLink = false,
}: FreeShippingProgressProps) {
  const { locale, t } = useI18n();
  const { reached, remaining, percentage, currentAmount } = getFreeShippingProgress(subtotal);
  const message = reached
    ? t("freeShippingReached")
    : t("freeShippingRemaining").replace(
        "{amount}",
        formatMoney(remaining, locale),
      );

  return (
    <section
      className={`rounded-2xl border p-4 text-stone-800 ${reached ? "border-emerald-200 bg-emerald-50/80" : "border-stone-200/80 bg-[#FAFAFA]"} ${className}`}
      aria-label={t("freeShippingProgressLabel")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative mt-0.5 h-9 w-11 shrink-0 overflow-hidden rounded-lg bg-white/65">
          <Image src="/images/mofu-visuals/icons/free-shipping.jpg" alt="" fill sizes="44px" className="object-cover" />
        </div>
        {showContinueShoppingLink ? (
          <Link
            href="/menu"
          className="min-w-0 flex-1 text-xs font-medium leading-snug text-stone-700 underline decoration-current/35 underline-offset-2 transition hover:opacity-75 sm:text-sm"
            aria-label={`${message} ${t("navContinueShopping")}`}
          >
            {message}
          </Link>
        ) : (
          <p
            className="min-w-0 flex-1 text-xs font-medium leading-snug text-stone-700 sm:text-sm"
          >
            {message}
          </p>
        )}
        <span
          className={`shrink-0 text-xs font-semibold tabular-nums ${reached ? "text-emerald-700" : "text-stone-700"}`}
        >
          {percentage}%
        </span>
      </div>

      <div
        className={`mt-2.5 h-2.5 w-full overflow-hidden rounded-full ${reached ? "bg-emerald-100" : "bg-stone-200"}`}
        role="progressbar"
        aria-label={t("freeShippingProgressLabel")}
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={currentAmount}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${reached ? "bg-emerald-600" : "bg-[#111111]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p
        className="mt-2 text-[11px] leading-relaxed text-stone-500"
      >
        {t("freeShippingThreshold")}
      </p>
    </section>
  );
}
