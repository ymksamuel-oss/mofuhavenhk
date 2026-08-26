"use client";

import type { ReactNode } from "react";
import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

type CategoryDropdownProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

type IconProps = { className?: string };

function CatIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6.3 9.1 5.2 4.5 9.1 6.8M17.7 9.1l1.1-4.6-3.9 2.3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 13.1c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6c0 3.9-2.8 6.4-6.5 6.4s-6.5-2.5-6.5-6.4Z" stroke="currentColor" strokeWidth="1.55" />
      <path d="M9.3 13.1h.1m5.2 0h.1M11.2 15.5c.5.35 1.1.35 1.6 0" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function DogIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6.2 9.5 4.7 6.2l4.1.9M17.8 9.5l1.5-3.3-4.1.9" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.6 12.5c0-3.4 2.8-5.8 6.4-5.8s6.4 2.4 6.4 5.8c0 4.1-2.7 6.8-6.4 6.8s-6.4-2.7-6.4-6.8Z" stroke="currentColor" strokeWidth="1.55" />
      <path d="M9.3 12.3h.1m5.2 0h.1m-3.6 2.2h2l-1 1.1-1-1.1Z" fill="currentColor" />
    </svg>
  );
}

function BowlIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5.1 11.4h13.8l-1 4.1a3.4 3.4 0 0 1-3.3 2.6H9.4a3.4 3.4 0 0 1-3.3-2.6l-1-4.1Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M7.3 8.1c1-.8 2.2-.8 3.1 0 .9-.8 2.1-.8 3.1 0 .9-.8 2.1-.8 3.1 0" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="m12 3 1.2 4.6L18 9l-4.8 1.4L12 15l-1.2-4.6L6 9l4.8-1.4L12 3ZM18.3 15.1l.6 2.3 2.4.7-2.4.7-.6 2.3-.6-2.3-2.4-.7 2.4-.7.6-2.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type CategoryMenuGroup = "cats" | "dogs";

type CategorySubmenuProps = {
  group: CategoryMenuGroup;
  compact?: boolean;
  onNavigate?: () => void;
};

/**
 * A focused, text-led category list for a single top-level pet group.
 * The desktop Header uses it as the reference-style vertical dropdown;
 * the mobile drawer uses the same canonical links in its accordions.
 */
export function CategorySubmenu({ group, compact = false, onNavigate }: CategorySubmenuProps) {
  const { t } = useI18n();
  const isCats = group === "cats";
  const items = isCats
    ? [
        { href: "/categories/cats/wet-cans", label: t("catSubWetCans") },
        { href: "/categories/cats/dry-food", label: t("catSubDryFood") },
        { href: "/categories/cats/freeze-dried", label: t("catSubFreezeDried") },
        { href: "/categories/cats/snacks", label: t("catSubSnacks") },
        { href: "/categories/cats/pill-treats", label: t("pillTreatsSubcategory") },
      ]
    : [
        { href: "/categories/dogs/food", label: t("dogSubFood") },
        { href: "/categories/dogs/snacks", label: t("dogSubSnacks") },
        { href: "/categories/dogs/pill-treats", label: t("pillTreatsSubcategory") },
      ];
  const allHref = isCats ? "/categories/cats" : "/categories/dogs";
  const allLabel = isCats ? t("navCategoriesAllCats") : t("navCategoriesAllDogs");
  const panelClass = compact
    ? "grid gap-1"
    : "grid min-w-56 gap-1 rounded-2xl border border-[color:var(--line)] bg-[#fffdfb] p-2 shadow-[0_18px_34px_-26px_rgba(62,42,28,0.42)]";
  const linkClass = "group flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-sm leading-snug text-[color:var(--muted)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)] active:scale-[0.98] focus-visible:bg-[color:var(--accent-soft)] focus-visible:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]";

  return (
    <div className={panelClass} aria-label={isCats ? t("navCategoriesCats") : t("navCategoriesDogs")}>
      <CategoryNavLink
        href={allHref}
        onNavigate={onNavigate}
        className={`${linkClass} border-b border-[color:var(--line)] pb-2.5 font-semibold text-[color:var(--ink)]`}
      >
        <span>{allLabel}</span>
        <ArrowIcon className="h-3.5 w-3.5 text-[color:var(--accent)]" />
      </CategoryNavLink>
      {items.map((item) => (
        <CategoryNavLink key={item.href} href={item.href} onNavigate={onNavigate} className={linkClass}>
          <span>{item.label}</span>
          <ArrowIcon className="h-3.5 w-3.5 text-[color:var(--muted)] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </CategoryNavLink>
      ))}
    </div>
  );
}

function DropdownLink({
  href,
  icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <CategoryNavLink
      href={href}
      onNavigate={onNavigate}
      className="group flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-[color:var(--muted)] transition-[background-color,color,transform] duration-200 ease-out hover:bg-[color:var(--accent-soft)]/80 hover:text-[color:var(--ink)] focus-visible:bg-[color:var(--accent-soft)] focus-visible:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[color:var(--line)] bg-white text-[color:var(--accent)] transition-transform duration-200 ease-out group-hover:scale-105">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ArrowIcon className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100" />
    </CategoryNavLink>
  );
}

function SectionTitle({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="mb-2.5 flex items-start gap-2.5 px-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-[0.02em] text-[color:var(--ink)]">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-[color:var(--muted)]">{hint}</span>
      </span>
    </div>
  );
}

/**
 * Shared category navigation for the desktop mega-menu and the mobile drawer.
 * All links use the existing hard-navigation category helper to avoid soft-nav stalls.
 */
export function CategoryDropdownContent({ compact = false, onNavigate }: CategoryDropdownProps) {
  const { t } = useI18n();
  const layout = compact
    ? "grid gap-5"
    : "grid grid-cols-[1fr_1fr_0.82fr] gap-2 divide-x divide-[color:var(--line)]";
  const sectionPadding = compact ? "" : "px-4 first:pl-0 last:pr-0";

  return (
    <div className={layout} aria-label={t("navCategories")}>
      <section className={sectionPadding} aria-label={t("navCategoriesCats")}>
        <SectionTitle
          icon={<CatIcon className="h-4 w-4" />}
          title={t("navCategoriesCats")}
          hint={t("navCategoriesCatHint")}
        />
        <div className="grid gap-0.5">
          <DropdownLink href="/categories/cats/wet-cans" onNavigate={onNavigate} icon={<BowlIcon className="h-4 w-4" />}>
            {t("catSubWetCans")}
          </DropdownLink>
          <DropdownLink href="/categories/cats/dry-food" onNavigate={onNavigate} icon={<BowlIcon className="h-4 w-4" />}>
            {t("catSubDryFood")}
          </DropdownLink>
          <DropdownLink href="/categories/cats/snacks" onNavigate={onNavigate} icon={<SparkleIcon className="h-4 w-4" />}>
            {t("catSubSnacks")}
          </DropdownLink>
          <CategoryNavLink
            href="/categories/cats"
            onNavigate={onNavigate}
            className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:text-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            {t("navCategoriesAllCats")} <ArrowIcon className="h-3.5 w-3.5" />
          </CategoryNavLink>
        </div>
      </section>

      <section className={sectionPadding} aria-label={t("navCategoriesDogs")}>
        <SectionTitle
          icon={<DogIcon className="h-4 w-4" />}
          title={t("navCategoriesDogs")}
          hint={t("navCategoriesDogHint")}
        />
        <div className="grid gap-0.5">
          <DropdownLink href="/categories/dogs/food" onNavigate={onNavigate} icon={<BowlIcon className="h-4 w-4" />}>
            {t("dogSubFood")}
          </DropdownLink>
          <DropdownLink href="/categories/dogs/snacks" onNavigate={onNavigate} icon={<SparkleIcon className="h-4 w-4" />}>
            {t("dogSubSnacks")}
          </DropdownLink>
          <DropdownLink href="/categories/dogs/pill-treats" onNavigate={onNavigate} icon={<SparkleIcon className="h-4 w-4" />}>
            {t("pillTreatsSubcategory")}
          </DropdownLink>
          <CategoryNavLink
            href="/categories/dogs"
            onNavigate={onNavigate}
            className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:text-[color:var(--hero-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            {t("navCategoriesAllDogs")} <ArrowIcon className="h-3.5 w-3.5" />
          </CategoryNavLink>
        </div>
      </section>

      <section className={`${sectionPadding} ${compact ? "border-t border-[color:var(--line)] pt-5" : ""}`} aria-label={t("navCategoriesDiscover")}>
        <SectionTitle
          icon={<SparkleIcon className="h-4 w-4" />}
          title={t("navCategoriesDiscover")}
          hint={t("navCategoriesHint")}
        />
        <div className="grid gap-0.5">
          <DropdownLink href="/menu" onNavigate={onNavigate} icon={<BowlIcon className="h-4 w-4" />}>
            {t("navCategoriesBrowseAll")}
          </DropdownLink>
          <DropdownLink href="/about-cat" onNavigate={onNavigate} icon={<CatIcon className="h-4 w-4" />}>
            {t("categoryCats")}
          </DropdownLink>
          <DropdownLink href="/about-dog" onNavigate={onNavigate} icon={<DogIcon className="h-4 w-4" />}>
            {t("categoryDogs")}
          </DropdownLink>
        </div>
      </section>
    </div>
  );
}
