"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

function chipClassName(active: boolean) {
  return `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
  }`;
}

const LINKS = [
  { href: "/about-dog", labelKey: "exploreAboutDog" as const },
  { href: "/about-cat", labelKey: "exploreAboutCat" as const },
];

/**
 * Catalog chip that opens a small dropdown for picture-book guides.
 */
export function ExplorePetWorldMenu() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = pathname === "/about-cat" || pathname === "/about-dog";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const node = rootRef.current;
      if (!node) return;
      if (event.target instanceof Node && !node.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={chipClassName(active || open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{t("explorePetWorld")}</span>
        <span
          aria-hidden
          className={`text-[0.7em] leading-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={t("explorePetWorld")}
          className="absolute left-0 top-[calc(100%+0.4rem)] z-30 min-w-[10.5rem] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] py-1.5 shadow-[0_18px_34px_-22px_rgba(74,54,38,0.55)]"
        >
          {LINKS.map(({ href, labelKey }) => {
            const isCurrent = pathname === href;
            return (
              <li key={href} role="none">
                <Link
                  role="menuitem"
                  href={href}
                  className={`block px-4 py-2.5 text-sm transition ${
                    isCurrent
                      ? "bg-[color:var(--accent-soft)] font-medium text-[color:var(--accent)]"
                      : "text-[color:var(--ink)] hover:bg-[color:var(--accent-soft)]/70 hover:text-[color:var(--accent)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
