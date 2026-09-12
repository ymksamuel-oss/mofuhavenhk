"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export function HomeBulkPromotion() {
  const { locale } = useI18n();
  const isEnglish = locale === "en";

  return (
    <aside
      className="border-y border-[#d7a56f]/50 bg-[#fff1d7] px-4 py-3 text-center shadow-[0_8px_24px_-20px_rgba(122,75,49,0.7)] sm:px-6 sm:py-3.5"
      aria-label={isEnglish ? "Bulk purchase promotion" : "貓狗專區量販優惠"}
    >
      <p className="text-sm font-bold leading-6 text-[#7b3f2b] sm:text-base">
        {isEnglish
          ? "🎉 Cat & dog zone bulk offer: 10% off from 8 units, 15% off from 16 units!"
          : "🎉 貓狗專區限時優惠：凡購買滿 8 件即享 9 折！滿 16 件更可享 85 折！"}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-[#9b684d] sm:text-xs">
        {isEnglish ? "Choose 8, 12, 16 or 24 units on product pages." : "商品頁可一鍵選擇 8、12、16 或 24 件。"}
      </p>
    </aside>
  );
}
