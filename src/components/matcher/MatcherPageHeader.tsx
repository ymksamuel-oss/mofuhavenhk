"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export function MatcherPageHeader() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a36b42]">{t("matcherEyebrow")}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{t("matcherHeroTitle")}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#76594a] sm:text-base">{t("matcherHeroSubtitle")}</p>
    </div>
  );
}
