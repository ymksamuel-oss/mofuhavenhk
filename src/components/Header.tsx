"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      aria-hidden="true"
    >
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const drawerId = useId();

  const switchLocale = (next: Locale) => {
    setLocale(next);
  };

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const navItems = [
    { href: "/", label: t("navHome"), active: pathname === "/" },
    { href: "/menu", label: t("navMenu"), active: pathname === "/menu" },
    {
      href: "/checkout",
      label: t("navCheckout"),
      active: pathname === "/checkout",
    },
  ] as const;

  const mobileMenu =
    menuOpen && portalReady
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("navOpenMenu")}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[color:var(--ink)]/40"
              aria-label={t("navCloseMenu")}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id={drawerId}
              className="absolute inset-y-0 right-0 z-[101] flex h-full w-[min(18rem,86vw)] max-w-full flex-col bg-[color:var(--surface)] shadow-[-12px_0_32px_-18px_rgba(74,54,38,0.45)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold leading-none text-[color:var(--ink)]">
                  {t("brand")}
                </span>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--ink)]"
                  aria-label={t("navCloseMenu")}
                  onClick={() => setMenuOpen(false)}
                >
                  <MenuIcon open />
                </button>
              </div>
              <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                {navItems.map((item) => (
                  <li key={item.href} className="block w-full">
                    <Link
                      href={item.href}
                      className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-medium leading-normal transition ${
                        item.active
                          ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]/60 hover:text-[color:var(--ink)]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <Link
            href="/"
            className="brand-logo-link flex min-w-0 shrink items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            aria-label={t("brand")}
          >
            <BrandLogo
              title={t("brand")}
              className="[&_svg]:h-7 sm:[&_svg]:h-8"
            />
          </Link>

          <nav
            className="ml-2 hidden min-w-0 items-center gap-5 text-sm text-[color:var(--muted)] md:flex"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClassName(item.active)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
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
              className="flex shrink-0 items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] p-0.5"
              role="group"
              aria-label="Language"
            >
              <button
                type="button"
                onClick={() => switchLocale("zh")}
                className={`rounded-full px-2 py-1 text-[11px] font-medium tracking-wide transition sm:px-2.5 sm:text-xs ${
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
                className={`rounded-full px-2 py-1 text-[11px] font-medium tracking-wide transition sm:px-2.5 sm:text-xs ${
                  locale === "en"
                    ? "bg-[color:var(--ink)] text-[color:var(--surface)] shadow-sm"
                    : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                }`}
                aria-pressed={locale === "en"}
              >
                {t("langEn")}
              </button>
            </div>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:hidden"
              aria-label={menuOpen ? t("navCloseMenu") : t("navOpenMenu")}
              aria-expanded={menuOpen}
              aria-controls={drawerId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
