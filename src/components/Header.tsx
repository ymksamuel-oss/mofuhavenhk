"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/translations";
import { useCart } from "@/lib/shop/cart";

function navLinkClassName(active: boolean) {
  return `relative truncate py-0.5 transition-colors ${
    active
      ? "font-semibold text-[color:var(--ink)] after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[color:var(--accent)] after:content-['']"
      : "hover:text-[color:var(--ink)]"
  }`;
}

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 5h1.7l1.2 10.2a1.5 1.5 0 0 0 1.5 1.3h9.4a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.5" r="1.2" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const { itemCount } = useCart();

  const switchLocale = (next: Locale) => {
    setLocale(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-6">
          <Link
            href="/"
            className="brand-logo-link flex shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            aria-label={t("brand")}
          >
            <BrandLogo title={t("brand")} />
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/checkout"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            aria-label={`${t("navCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

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
      </div>
    </header>
  );
}
