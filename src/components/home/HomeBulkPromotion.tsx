"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import Link from "next/link";

export function HomeBulkPromotion() {
  const { t } = useI18n();

  return (
    <aside
      className="border-y border-[#d7a56f]/50 bg-[#fff1d7] px-4 py-3 text-center shadow-[0_8px_24px_-20px_rgba(122,75,49,0.7)] sm:px-6 sm:py-3.5"
      aria-label={t("promoAriaLabel")}
    >
      <p className="text-sm font-bold leading-6 text-[#7b3f2b] sm:text-base">
        {t("promoHeadline")}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-[#9b684d] sm:text-xs">
        {t("promoSubline")}
      </p>
      <Link href="/collections/value-bundles" className="mt-2 inline-flex items-center rounded-full border border-[#d7a56f] bg-white/70 px-3 py-1 text-xs font-bold text-[#7b3f2b] transition hover:bg-white">
        🎁 Value Bundles
      </Link>
    </aside>
  );
}
