// Visual reference: mobile Japanese editorial header keeps the logo, search, cart, and menu visible;
// language switching moves off the compact toolbar so the Hero remains visually quiet.
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ProductSearch } from "@/components/ProductSearch";
import {
  CategorySubmenu,
  HEADER_MENU_GROUPS,
  HEADER_MENU_LABEL_KEY,
  type CategoryMenuGroup,
} from "@/components/CategoryDropdown";
import { MobileCartDrawer } from "@/components/cart/MobileCartDrawer";
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

function CaretIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
  const router = useRouter();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<CategoryMenuGroup | null>(null);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState<CategoryMenuGroup | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const drawerId = useId();
  const mobileCategoriesId = useId();
  const desktopCategoriesId = useId();
  const desktopCategoryRef = useRef<HTMLElement>(null);

  const switchLocale = (next: Locale) => {
    setLocale(next);

    // Category pages use a shareable language query so SSR metadata, canonical,
    // Open Graph tags, and visible labels always describe the same language.
    if (pathname.startsWith("/categories")) {
      const query = new URLSearchParams(window.location.search);
      if (next === "en") query.set("lang", "en");
      else query.delete("lang");
      const suffix = query.toString();
      router.replace(`${pathname}${suffix ? `?${suffix}` : ""}`);
    }
  };

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCategoryOpen(null);
    setDesktopCategoryOpen(null);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) return;
    setMobileCategoryOpen(null);
  }, [menuOpen]);

  useEffect(() => {
    if (!desktopCategoryOpen) return;

    const closeWhenOutside = (event: PointerEvent) => {
      if (!desktopCategoryRef.current?.contains(event.target as Node)) {
        setDesktopCategoryOpen(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDesktopCategoryOpen(null);
    };

    window.addEventListener("pointerdown", closeWhenOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeWhenOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [desktopCategoryOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      touchAction: body.style.touchAction,
    };
    const previousRootOverflow = root.style.overflow;

    // Lock both scrolling roots without changing page position on iOS.
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";
    root.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      body.style.overflow = previousBodyStyles.overflow;
      body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      body.style.touchAction = previousBodyStyles.touchAction;
      root.style.overflow = previousRootOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const mobileNavItems = [
    { href: "/", label: t("navHome"), active: pathname === "/" },
    { href: "/checkout", label: t("navCheckout"), active: pathname === "/checkout" },
  ] as const;

  const isMenuGroupActive = (group: CategoryMenuGroup) => {
    if (group === "cats" || group === "dogs" || group === "small-pets" || group === "lifestyle") {
      return pathname.startsWith(`/categories/${group}`);
    }
    if (group === "explore") {
      return pathname.startsWith("/cat-breeds") || pathname.startsWith("/dog-breeds");
    }
    return pathname === "/shipping-policy" || pathname === "/returns" || pathname === "/terms";
  };

  const mobileMenu =
    menuOpen && portalReady
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] h-[100dvh] min-h-[100dvh] w-screen max-w-[100vw] overflow-hidden overscroll-none md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("navOpenMenu")}
          >
            {/* Dim overlay — tap anywhere outside the drawer to close */}
            <button
              type="button"
              className="absolute inset-0 bg-[color:var(--ink)]/45 backdrop-blur-[2px] transition-opacity"
              aria-label={t("navCloseMenu")}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id={drawerId}
              className="absolute right-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] w-[min(82vw,20rem)] max-w-full flex-col overflow-hidden overscroll-contain border-l border-[color:var(--line)] bg-[color:var(--background)] shadow-[-16px_0_40px_-20px_rgba(43,38,35,0.28)]"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #fbf9f6 55%, #f5ebe6 100%)",
              }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold leading-none text-[color:var(--ink)]">
                  {t("brand")}
                </span>
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)]"
                  aria-label={t("navCloseMenu")}
                  onClick={() => setMenuOpen(false)}
                >
                  <MenuIcon open />
                </button>
              </div>
              <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] pt-3 [-webkit-overflow-scrolling:touch]">
                {mobileNavItems.slice(0, 1).map((item) => (
                  <li key={item.href} className="block w-full">
                    <Link
                      href={item.href}
                      className={`flex min-h-11 w-full touch-manipulation items-center rounded-xl px-4 py-3.5 text-base font-medium leading-normal transition ${
                        item.active
                          ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]/70 hover:text-[color:var(--ink)]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {HEADER_MENU_GROUPS.map((group) => {
                  const isOpen = mobileCategoryOpen === group;
                  const isActive = isMenuGroupActive(group);
                  const label = t(HEADER_MENU_LABEL_KEY[group]);
                  const panelId = `${mobileCategoriesId}-${group}`;

                  return (
                    <li key={group} className="block w-full">
                      <button
                        type="button"
                        className={`flex min-h-11 w-full touch-manipulation items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium leading-normal transition ${
                          isActive || isOpen
                            ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                            : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]/70 hover:text-[color:var(--ink)]"
                        }`}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setMobileCategoryOpen((open) => (open === group ? null : group))}
                      >
                        <span>{label}</span>
                        <CaretIcon open={isOpen} />
                      </button>
                      {isOpen ? (
                        <div id={panelId} className="mx-1 mt-2 rounded-2xl border border-[color:var(--line)] bg-white/80 p-3 shadow-[0_18px_34px_-28px_rgba(56,40,30,0.5)] motion-safe:animate-[category-menu-in_180ms_cubic-bezier(0.23,1,0.32,1)]">
                          <CategorySubmenu
                            group={group}
                            compact
                            onNavigate={() => {
                              setMobileCategoryOpen(null);
                              setMenuOpen(false);
                            }}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
                {mobileNavItems.slice(1).map((item) => (
                  <li key={item.href} className="block w-full">
                    <Link
                      href={item.href}
                      className={`flex min-h-11 w-full touch-manipulation items-center rounded-xl px-4 py-3.5 text-base font-medium leading-normal transition ${
                        item.active
                          ? "bg-[color:var(--accent-soft)] font-semibold text-[color:var(--ink)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]/70 hover:text-[color:var(--ink)]"
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
      <header className="sticky top-0 z-[60] border-b border-[color:var(--line)] bg-[color:var(--background)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <Link
            href="/"
            className="brand-logo-link flex min-w-0 shrink items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            aria-label={t("brand")}
          >
            <BrandLogo
              title={t("brand")}
              animateOnMount
              className="h-11 sm:h-[3.25rem]"
            />
          </Link>

          <nav
            ref={desktopCategoryRef}
            className="ml-2 hidden min-w-0 items-center gap-3 text-[13px] text-[color:var(--muted)] lg:flex xl:gap-4 xl:text-sm"
            aria-label="Primary"
          >
            <Link href="/" className={navLinkClassName(pathname === "/")}>
              {t("navHome")}
            </Link>
            {HEADER_MENU_GROUPS.map((group) => {
              const isOpen = desktopCategoryOpen === group;
              const isActive = isMenuGroupActive(group);
              const label = t(HEADER_MENU_LABEL_KEY[group]);
              const panelId = `${desktopCategoriesId}-${group}`;

              return (
                <div
                  key={group}
                  className="relative -mb-3 pb-3"
                  onMouseEnter={() => setDesktopCategoryOpen(group)}
                >
                  <button
                    type="button"
                    className={`${navLinkClassName(isActive || isOpen)} inline-flex items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setDesktopCategoryOpen(group);
                    }}
                    onClick={() => setDesktopCategoryOpen(group)}
                    onFocus={() => setDesktopCategoryOpen(group)}
                  >
                    {label}
                    <CaretIcon open={isOpen} />
                  </button>
                  {isOpen ? (
                    <div
                      id={panelId}
                      role="menu"
                      className="absolute left-[-0.65rem] top-full z-[70] origin-top-left motion-safe:animate-[category-menu-in_180ms_cubic-bezier(0.23,1,0.32,1)]"
                    >
                      <CategorySubmenu group={group} onNavigate={() => setDesktopCategoryOpen(null)} />
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link href="/checkout" className={navLinkClassName(pathname === "/checkout")}>
              {t("navCheckout")}
            </Link>
          </nav>

          {/* Search, cart and language controls remain visually separate from category navigation. */}
          <div className="ml-auto flex min-w-0 shrink items-center gap-1.5 sm:gap-2.5">
            <ProductSearch variant="header" />

            <Link
              href="/checkout"
              className="relative hidden h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 md:flex"
              aria-label={`${t("navCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
              data-testid="header-cart"
            >
              <CartIcon className="h-5 w-5" />
              {itemCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6D4C3D] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              className="relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 md:hidden"
              aria-label={`${t("navCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              onClick={() => setCartOpen(true)}
            >
              <CartIcon className="h-5 w-5" />
              {itemCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6D4C3D] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>

            <div
              className="flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] p-0.5 sm:h-11"
              role="group"
              aria-label="Language"
            >
              <button
                type="button"
                onClick={() => switchLocale("zh")}
                className={`h-10 rounded-full px-2 text-[11px] font-medium tracking-wide transition sm:px-2.5 sm:text-xs ${
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
                className={`h-10 rounded-full px-2 text-[11px] font-medium tracking-wide transition sm:px-2.5 sm:text-xs ${
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
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 lg:hidden"
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
      <MobileCartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onEmptyStateChange={(isEmpty) => {
          if (typeof window !== "undefined") {
            const nav = document.getElementById("shop-flow-nav-root");
            const footer = document.getElementById("site-footer-root");
            if (isEmpty && cartOpen) {
              if (nav) nav.style.display = "none";
              if (footer) footer.style.display = "none";
            } else {
              if (nav) nav.style.display = "";
              if (footer) footer.style.display = "";
            }
          }
        }}
      />
    </>
  );
}
