"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type CategoryMenuGroup = "cats" | "dogs";

type CategorySubmenuProps = {
  group: CategoryMenuGroup;
  compact?: boolean;
  onNavigate?: () => void;
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Canonical text-led list for each Header primary category. Desktop uses it as
 * the vertical dropdown and the mobile drawer uses exactly the same links.
 * Deliberately excludes generic "all products" routes.
 */
export function CategorySubmenu({ group, compact = false, onNavigate }: CategorySubmenuProps) {
  const { t } = useI18n();
  const isCats = group === "cats";
  const items = isCats
    ? [
        { href: "/categories/cats/wet-cans", label: t("catSubWetCans") },
        { href: "/categories/cats/snacks", label: t("catSubSnacks") },
        { href: "/categories/cats/freeze-dried", label: t("catSubFreezeDried") },
        { href: "/categories/cats/litter", label: t("catSubLitter") },
        { href: "/categories/cats/toys-climbing", label: t("catSubToysClimbing") },
      ]
    : [
        { href: "/categories/dogs/dry-food", label: t("dogSubDryFood") },
        { href: "/categories/dogs/wet-cans", label: t("dogSubWetCans") },
        { href: "/categories/dogs/freeze-dried", label: t("dogSubFreezeDried") },
        { href: "/categories/dogs/snacks", label: t("dogSubSnacks") },
        { href: "/categories/dogs/toilet-pads", label: t("dogSubToiletPads") },
        { href: "/categories/dogs/toys", label: t("dogSubToys") },
      ];
  const panelClass = compact
    ? "grid gap-1"
    : "grid min-w-64 gap-1 rounded-2xl border border-[color:var(--line)] bg-[#fffdfb] p-2 shadow-[0_18px_34px_-26px_rgba(62,42,28,0.42)]";
  const linkClass = "group flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-sm leading-snug text-[color:var(--muted)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)] active:scale-[0.98] focus-visible:bg-[color:var(--accent-soft)] focus-visible:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]";

  return (
    <div className={panelClass} aria-label={isCats ? t("navHeaderCats") : t("navHeaderDogs")}>
      {items.map((item) => (
        <CategoryNavLink key={item.href} href={item.href} onNavigate={onNavigate} className={linkClass}>
          <span>{item.label}</span>
          <ArrowIcon className="h-3.5 w-3.5 text-[color:var(--muted)] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </CategoryNavLink>
      ))}
    </div>
  );
}
