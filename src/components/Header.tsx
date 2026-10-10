"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ProductSearch } from "@/components/ProductSearch";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";
import { useWishlist } from "@/lib/shop/wishlist";
import { useCustomerAuth } from "@/lib/account/AuthProvider";
import { signOutAction } from "@/app/account/actions";

function navLinkClassName(active: boolean) {
  return `relative whitespace-nowrap py-0.5 transition-colors ${
    active
      ? "font-semibold text-[color:var(--ink)] after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[color:var(--accent)] after:content-['']"
      : "hover:text-[color:var(--ink)]"
  }`;
}

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
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

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.25 20a6.75 6.75 0 0 1 13.5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type HeaderLocale = "zh" | "en";

type LanguageSwitcherProps = {
  locale: HeaderLocale;
  label: string;
  size: "mobile" | "desktop";
  onSelect: (next: HeaderLocale) => void;
};

function LanguageSwitcher({ locale, label, size, onSelect }: LanguageSwitcherProps) {
  const isMobile = size === "mobile";
  const options: { value: HeaderLocale; zhLabel: string; enLabel: string }[] = [
    { value: "zh", zhLabel: "中文", enLabel: "Chinese" },
    { value: "en", zhLabel: "英文", enLabel: "English" },
  ];

  return (
    <div
      className={isMobile
        ? "flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] p-0.5 md:hidden"
        : "hidden h-10 shrink-0 items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] p-0.5 sm:h-11 md:flex"}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const active = locale === option.value;
        const optionName = option.value === "zh" ? "中文" : "English";
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={active}
            aria-label={`${locale === "en" ? "Switch to" : "切換至"}${locale === "en" ? " " : ""}${optionName}`}
            className={`rounded-full font-medium transition ${isMobile ? "min-h-8 px-2 py-1 text-[10px]" : "px-2 py-2 text-[10px] tracking-wide sm:text-xs"} ${active ? "bg-[color:var(--ink)] text-[color:var(--surface)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}
          >
            {isMobile ? (option.value === "zh" ? "中" : "EN") : locale === "zh" ? option.zhLabel : option.enLabel}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const { user: member, ready: authReady } = useCustomerAuth();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const primaryCategoryLinks = [
    { slug: "dogs", label: locale === "zh" ? "狗狗專區" : t("navCategoriesDogs") },
    { slug: "cats", label: locale === "zh" ? "貓貓專區" : t("navCategoriesCats") },
  ] as const;
  const petGuideHref = "/pet-guide";
  const accountHref = member ? "/account" : "/account/login";
  const primaryNavItems = [
    { href: "/", label: locale === "zh" ? "首頁" : t("navHome"), active: pathname === "/" },
    ...primaryCategoryLinks.map((item) => ({
      href: `/collections/${item.slug}`,
      label: item.label,
      active: pathname === `/collections/${item.slug}` || pathname.startsWith(`/collections/${item.slug}/`),
    })),
    {
      href: "/collections/value-bundles",
      label: locale === "en" ? "Value Bundles" : "促銷組合",
      active: pathname.startsWith("/collections/value-bundles"),
    },
    {
      href: petGuideHref,
      label: locale === "en" ? "Explore Pet World" : "探索寵物世界",
      active: pathname === petGuideHref || pathname.startsWith(`${petGuideHref}/`),
    },
    {
      href: "/about",
      label: locale === "en" ? "About Mofu Haven" : "認識毛毛港",
      active: pathname === "/about" || pathname.startsWith("/about/"),
    },
    {
      href: "/brand/best-partner",
      label: locale === "en" ? "Best Partner brand concept" : "Best Partner 品牌概念",
      active: pathname === "/brand/best-partner" || pathname.startsWith("/brand/"),
    },
  ];

  return (
    <header className="sticky top-0 z-[60] border-b border-[color:var(--line)] bg-[color:var(--background)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-2 px-3 sm:h-24 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="brand-logo-link flex shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
          aria-label={t("brand")}
        >
          <BrandLogo title={t("brand")} />
        </Link>

        <nav
          className="ml-2 hidden min-w-0 flex-1 items-center justify-center gap-5 whitespace-nowrap text-[11px] text-[color:var(--muted)] xl:flex 2xl:text-sm"
          aria-label={t("headerPrimaryNavLabel")}
        >
          {primaryNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClassName(item.active)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:hidden">
          <LanguageSwitcher locale={locale} label={t("headerLanguageLabel")} size="mobile" onSelect={setLocale} />
          <Link
            href={accountHref}
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-lg text-[color:var(--ink)] transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            aria-label={locale === "en" ? (member ? "Member centre" : "Sign in") : (member ? "會員中心" : "登入會員")}
          >
            <UserIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="ml-auto hidden items-center gap-2.5 md:flex">
          <ProductSearch variant="header" />
          <Link
            href="/checkout"
            className="relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
            aria-label={`${t("navCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
            data-testid="header-cart"
            onClick={(event) => {
              event.preventDefault();
              window.dispatchEvent(new Event("mofu:open-cart"));
            }}
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6D4C3D] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums" aria-live="polite" aria-atomic="true">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/wishlist"
            className="relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-[color:var(--line)] bg-white text-lg text-[#b84d3d] transition hover:border-[#b84d3d] hover:bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b84d3d] focus-visible:ring-offset-2"
            aria-label={`${locale === "en" ? "My wishlist" : "我的最愛"}${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
          >
            <span aria-hidden="true">{wishlistCount > 0 ? "♥" : "♡"}</span>
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c0483a] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            ) : null}
          </Link>
          <LanguageSwitcher locale={locale} label={t("headerLanguageLabel")} size="desktop" onSelect={setLocale} />
          {member ? (
            <details className="relative">
              <summary aria-label={locale === "en" ? "Member menu" : "會員選單"} className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-sm font-bold text-[color:var(--ink)] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
                {(member.displayName || member.email || "M").slice(0, 1).toLocaleUpperCase()}
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] grid min-w-52 gap-1 rounded-2xl border border-[color:var(--line)] bg-white p-2 shadow-lg">
                <p className="truncate px-3 py-2 text-xs text-[color:var(--muted)]">{member.email}</p>
                <Link href="/account" className="rounded-xl px-3 py-2.5 text-sm hover:bg-[color:var(--accent-soft)]">{locale === "en" ? "Member centre" : "個人中心"}</Link>
                <Link href="/account/orders" className="rounded-xl px-3 py-2.5 text-sm hover:bg-[color:var(--accent-soft)]">{locale === "en" ? "My orders" : "我的訂單"}</Link>
                <Link href="/account/addresses" className="rounded-xl px-3 py-2.5 text-sm hover:bg-[color:var(--accent-soft)]">{locale === "en" ? "Address book" : "地址簿"}</Link>
                <form action={signOutAction}>
                  <button type="submit" className="min-h-11 w-full rounded-xl px-3 py-2.5 text-left text-sm text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)]">{locale === "en" ? "Sign out" : "登出"}</button>
                </form>
              </div>
            </details>
          ) : authReady ? (
            <Link href="/account/login" className="flex min-h-11 items-center rounded-xl border border-[color:var(--line)] bg-white px-3 text-sm font-semibold text-[color:var(--ink)] hover:border-[color:var(--accent)]">
              {locale === "en" ? "Sign in" : "登入／註冊"}
            </Link>
          ) : (
            <span aria-hidden="true" className="h-11 w-24 animate-pulse rounded-xl bg-stone-100" />
          )}
        </div>
      </div>
      <nav
        className="mx-auto hidden w-full items-center justify-center gap-5 overflow-x-auto border-t border-gray-100 px-4 py-2.5 text-[11px] text-[color:var(--muted)] md:flex xl:hidden"
        aria-label={t("headerPrimaryNavLabel")}
      >
        {primaryNavItems.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClassName(item.active)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
