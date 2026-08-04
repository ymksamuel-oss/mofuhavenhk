"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

function chipClassName(active: boolean) {
  return `shrink-0 inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
  }`;
}

/**
 * Catalog chip that opens a small dropdown for pet-care story pages.
 */
export function ExplorePetsDropdown() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={chipClassName(open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{t("explorePetsWorld")}</span>
        <span
          aria-hidden
          className={`text-[0.7em] leading-none transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("explorePetsWorld")}
          className="absolute left-0 top-[calc(100%+0.4rem)] z-30 min-w-[10.5rem] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] py-1 shadow-[0_18px_34px_-22px_rgba(74,54,38,0.55)]"
        >
          <CategoryNavLink
            href="/about-dog"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
            onNavigate={() => setOpen(false)}
          >
            {t("exploreAboutDog")}
          </CategoryNavLink>
          <CategoryNavLink
            href="/about-cat"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
            onNavigate={() => setOpen(false)}
          >
            {t("exploreAboutCat")}
          </CategoryNavLink>
        </div>
      ) : null}
    </div>
  );
}
