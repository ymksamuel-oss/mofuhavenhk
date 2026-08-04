"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Placeholder destination for the 「關於犬」 explore-menu item.
 * Full picture-book content can expand here later.
 */
export default function AboutDogPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mb-4">
        <Link
          href="/menu"
          className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {t("aboutCatBackToCatalog")}
        </Link>
      </p>
      <article className="milk-tea-card space-y-4 p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-3xl">
          {t("exploreAboutDog")}
        </h1>
        <p className="text-[0.95rem] leading-relaxed tracking-[0.01em] text-[color:var(--muted)]">
          {t("aboutDogComingSoon")}
        </p>
      </article>
    </div>
  );
}
