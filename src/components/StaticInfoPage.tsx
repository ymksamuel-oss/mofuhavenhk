"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

type StaticInfoPageProps = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

/**
 * Lightweight shell for footer destination pages (About / FAQ / policies).
 * Copy can be expanded later without changing route structure.
 */
export function StaticInfoPage({ titleKey, bodyKey }: StaticInfoPageProps) {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mb-4">
        <Link
          href="/"
          className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {t("infoPageBack")}
        </Link>
      </p>
      <article className="milk-tea-card space-y-4 p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
          {t(titleKey)}
        </h1>
        <p className="text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
          {t(bodyKey)}
        </p>
      </article>
    </div>
  );
}
