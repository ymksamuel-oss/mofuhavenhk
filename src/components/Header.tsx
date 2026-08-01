"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/translations";

export function Header() {
  const { locale, setLocale, t } = useI18n();

  const switchLocale = (next: Locale) => {
    setLocale(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-6">
        {/* Narrow screens: gap-1.5 so brand + menu stay uncrowded */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-6">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-tight text-[color:var(--ink)] sm:text-xl"
          >
            {t("brand")}
          </Link>
          <nav className="flex min-w-0 items-center gap-1.5 text-sm text-[color:var(--muted)] sm:gap-4">
            <Link href="/" className="truncate hover:text-[color:var(--ink)]">
              {t("navHome")}
            </Link>
            <Link
              href="/checkout"
              className="truncate hover:text-[color:var(--ink)]"
            >
              {t("navCheckout")}
            </Link>
          </nav>
        </div>

        <div
          className="flex shrink-0 items-center gap-1.5"
          role="group"
          aria-label="Language"
        >
          <button
            type="button"
            onClick={() => switchLocale("zh")}
            className={`px-2 py-1 text-xs tracking-wide transition ${
              locale === "zh"
                ? "bg-[color:var(--ink)] text-[color:var(--surface)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            }`}
            aria-pressed={locale === "zh"}
          >
            {t("langZh")}
          </button>
          <button
            type="button"
            onClick={() => switchLocale("en")}
            className={`px-2 py-1 text-xs tracking-wide transition ${
              locale === "en"
                ? "bg-[color:var(--ink)] text-[color:var(--surface)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            }`}
            aria-pressed={locale === "en"}
          >
            {t("langEn")}
          </button>
        </div>
      </div>
    </header>
  );
}
