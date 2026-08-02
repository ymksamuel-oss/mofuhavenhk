"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/translations";

function navLinkClassName(active: boolean) {
  return `relative truncate py-0.5 transition-colors ${
    active
      ? "font-semibold text-[color:var(--ink)] after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[color:var(--accent)] after:content-['']"
      : "hover:text-[color:var(--ink)]"
  }`;
}

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();

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
          <nav className="flex min-w-0 items-center gap-2 text-sm text-[color:var(--muted)] sm:gap-5">
            <Link href="/" className={navLinkClassName(pathname === "/")}>
              {t("navHome")}
            </Link>
            <Link
              href="/menu"
              className={navLinkClassName(pathname === "/menu")}
            >
              {t("navMenu")}
            </Link>
            <Link
              href="/checkout"
              className={navLinkClassName(pathname === "/checkout")}
            >
              {t("navCheckout")}
            </Link>
          </nav>
        </div>

        <div
          className="flex shrink-0 items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] p-1"
          role="group"
          aria-label="Language"
        >
          <button
            type="button"
            onClick={() => switchLocale("zh")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition ${
              locale === "zh"
                ? "bg-[color:var(--ink)] text-[color:var(--surface)] shadow-sm"
                : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            }`}
            aria-pressed={locale === "zh"}
          >
            {t("langZh")}
          </button>
          <button
            type="button"
            onClick={() => switchLocale("en")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition ${
              locale === "en"
                ? "bg-[color:var(--ink)] text-[color:var(--surface)] shadow-sm"
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
