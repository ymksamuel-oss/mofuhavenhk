"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";
import { OPEN_CART_EVENT } from "@/components/cart/CartDrawerHost";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

type IconProps = { className?: string };

function PawIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="6.3" cy="8.1" rx="2.05" ry="2.8" transform="rotate(-24 6.3 8.1)" />
      <ellipse cx="11.2" cy="5.8" rx="2.05" ry="2.8" transform="rotate(-7 11.2 5.8)" />
      <ellipse cx="16.4" cy="6.7" rx="2.05" ry="2.8" transform="rotate(15 16.4 6.7)" />
      <ellipse cx="20" cy="10.5" rx="1.75" ry="2.35" transform="rotate(28 20 10.5)" />
      <path d="M12.9 11.2c-1.8 0-3.1 1.4-4.25 2.55-1.02 1.02-2.15 2.2-2.15 3.86 0 1.42 1.12 2.4 2.48 2.4.98 0 2.25-.68 3.92-.68 1.64 0 2.89.68 3.89.68 1.36 0 2.48-.98 2.48-2.4 0-1.66-1.14-2.84-2.16-3.86-1.15-1.15-2.45-2.55-4.21-2.55Z" />
    </svg>
  );
}

function GridIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CompassIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.9 8.1-2.25 5.55-5.55 2.25 2.25-5.55 5.55-2.25Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ShoppingBagIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5.25 8.5h13.5l1 12h-15.5l1-12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8.5V6.75a3 3 0 0 1 6 0V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M20.2 11.5a8.2 8.2 0 0 1-8.4 8.2 9.6 9.6 0 0 1-3.55-.68L4 20l1.05-3.65A8.06 8.06 0 0 1 3.6 11.5a8.3 8.3 0 0 1 8.4-8.2 8.3 8.3 0 0 1 8.2 8.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11.8h8M8 15.1h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function dockItemClass(active: boolean) {
  return `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 text-center text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 ${active ? "bg-[#E8E8ED]/80 text-black transition-all" : "bg-transparent text-stone-700 transition-all hover:text-black"}`;
}

export function FloatingMobileDock() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!categoriesOpen) return;

    const closeWhenOutside = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setCategoriesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCategoriesOpen(false);
    };

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [categoriesOpen]);

  const isProductPage = pathname.startsWith("/product/");
  const isHomeActive = pathname === "/";
  const isCategoryActive = ["/collections/dogs", "/collections/cats", "/collections/value-bundles"].some((route) => pathname.startsWith(route));
  const isMatcherActive = pathname === "/matcher" || pathname.startsWith("/matcher/");
  const whatsappHref = getShopWhatsAppChatUrl(`${t("brand")} — ${t("mobileDockWhatsApp")}`) ?? "https://wa.me/85298646585";

  return (
    <div
      ref={dockRef}
      className={`fixed left-1/2 z-50 flex w-[calc(100vw-0.5rem)] max-w-[420px] -translate-x-1/2 items-center justify-between gap-2 mb-[env(safe-area-inset-bottom)] md:hidden ${isProductPage ? "bottom-24 sm:bottom-4" : "bottom-4"}`}
    >
      <nav
        aria-label={t("mobileDockNavLabel")}
        className="flex w-[84%] max-w-[350px] items-center justify-around rounded-full border border-black/5 bg-white/80 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
      >
        <Link href="/" aria-label={t("mobileDockRecommend")} aria-current={isHomeActive ? "page" : undefined} className={dockItemClass(isHomeActive)}>
          <PawIcon className="h-5 w-5" />
          <span className="max-w-full truncate leading-none">{t("mobileDockRecommend")}</span>
        </Link>

        <div className="relative flex min-w-0 flex-1">
          <button
            type="button"
            aria-label={t("mobileDockCategories")}
            aria-haspopup="menu"
            aria-expanded={categoriesOpen}
            className={`w-full ${dockItemClass(categoriesOpen || isCategoryActive)}`}
            onClick={() => setCategoriesOpen((open) => !open)}
          >
            <GridIcon className="h-5 w-5" />
            <span className="max-w-full truncate leading-none">{t("mobileDockCategories")}</span>
          </button>
          {categoriesOpen ? (
            <div role="menu" className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-[60] grid w-48 -translate-x-1/2 gap-1 rounded-2xl border border-black/5 bg-white/95 p-2 text-stone-800 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl">
              <Link role="menuitem" href="/collections/dogs" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[#E8E8ED]/80">{t("mobileDockDogs")}</Link>
              <Link role="menuitem" href="/collections/cats" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[#E8E8ED]/80">{t("mobileDockCats")}</Link>
              <Link role="menuitem" href="/collections/value-bundles" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[#E8E8ED]/80">{t("mobileDockBundles")}</Link>
            </div>
          ) : null}
        </div>

        <Link href="/matcher" aria-label={t("mobileDockMatcher")} aria-current={isMatcherActive ? "page" : undefined} className={dockItemClass(isMatcherActive)}>
          <CompassIcon className="h-5 w-5" />
          <span className="max-w-full truncate leading-none">{t("mobileDockMatcher")}</span>
        </Link>

        <button
          type="button"
          aria-label={`${t("mobileDockCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
          className={`${dockItemClass(false)} relative`}
          onClick={() => window.dispatchEvent(new Event(OPEN_CART_EVENT))}
        >
          <ShoppingBagIcon className="h-5 w-5" />
          <span className="max-w-full truncate leading-none">{t("mobileDockCart")}</span>
          {itemCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-800 px-1 text-[9px] font-semibold leading-none text-white tabular-nums" aria-live="polite" aria-atomic="true">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </button>
      </nav>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("mobileDockWhatsApp")}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white/80 text-stone-800 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
      >
        <ChatIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
