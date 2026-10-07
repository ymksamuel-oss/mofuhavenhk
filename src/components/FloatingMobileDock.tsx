"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/shop/cart";
import { OPEN_CART_EVENT } from "@/components/cart/CartDrawerHost";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

function dockItemClass(active: boolean) {
  return `flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full text-[color:var(--ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${active ? "bg-stone-100" : "hover:bg-stone-100/80"}`;
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
  const isCategoryActive = ["/collections/dogs", "/collections/cats", "/collections/value-bundles"].some((route) => pathname.startsWith(route));
  const isMatcherActive = pathname === "/matcher" || pathname.startsWith("/matcher/");
  const whatsappHref = getShopWhatsAppChatUrl(`${t("brand")} — ${t("mobileDockWhatsApp")}`) ?? "https://wa.me/85298646585";

  return (
    <div
      ref={dockRef}
      className={`fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 mb-[env(safe-area-inset-bottom)] md:hidden ${isProductPage ? "bottom-24 sm:bottom-4" : "bottom-4"}`}
    >
      <nav
        aria-label={t("mobileDockNavLabel")}
        className="flex items-center gap-1.5 rounded-full border border-stone-200/60 bg-white/85 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl"
      >
        <Link href="/" aria-label={t("mobileDockRecommend")} aria-current={pathname === "/" ? "page" : undefined} className={dockItemClass(pathname === "/")}>
          <span aria-hidden="true" className="text-[18px] leading-none">🐾</span>
          <span className="max-w-full truncate text-[9px] font-medium leading-none">{t("mobileDockRecommend")}</span>
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-label={t("mobileDockCategories")}
            aria-haspopup="menu"
            aria-expanded={categoriesOpen}
            className={dockItemClass(categoriesOpen || isCategoryActive)}
            onClick={() => setCategoriesOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-[18px] leading-none">🥩</span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none">{t("mobileDockCategories")}</span>
          </button>
          {categoriesOpen ? (
            <div role="menu" className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-[60] grid w-48 -translate-x-1/2 gap-1 rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl">
              <Link role="menuitem" href="/collections/dogs" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">{t("mobileDockDogs")}</Link>
              <Link role="menuitem" href="/collections/cats" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">{t("mobileDockCats")}</Link>
              <Link role="menuitem" href="/collections/value-bundles" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">{t("mobileDockBundles")}</Link>
            </div>
          ) : null}
        </div>

        <Link href="/matcher" aria-label={t("mobileDockMatcher")} aria-current={isMatcherActive ? "page" : undefined} className={dockItemClass(isMatcherActive)}>
          <span aria-hidden="true" className="text-[18px] leading-none">🧭</span>
          <span className="max-w-full truncate text-[9px] font-medium leading-none">{t("mobileDockMatcher")}</span>
        </Link>

        <button
          type="button"
          aria-label={`${t("mobileDockCart")}${itemCount > 0 ? ` (${itemCount})` : ""}`}
          className={`${dockItemClass(false)} relative`}
          onClick={() => window.dispatchEvent(new Event(OPEN_CART_EVENT))}
        >
          <span aria-hidden="true" className="text-[18px] leading-none">🛍️</span>
          <span className="max-w-full truncate text-[9px] font-medium leading-none">{t("mobileDockCart")}</span>
          {itemCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c0483a] px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums" aria-live="polite" aria-atomic="true">
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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-200/60 bg-white/90 text-[22px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"
      >
        <span aria-hidden="true">💬</span>
      </a>
    </div>
  );
}
