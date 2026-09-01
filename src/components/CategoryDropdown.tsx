"use client";

import { CategoryNavLink } from "@/components/CategoryNavLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const HEADER_MENU_GROUPS = [
  "cats",
  "dogs",
  "small-pets",
  "lifestyle",
  "explore",
  "shopping",
] as const;

export type CategoryMenuGroup = (typeof HEADER_MENU_GROUPS)[number];

export const HEADER_MENU_LABEL_KEY = {
  cats: "navHeaderCats",
  dogs: "navHeaderDogs",
  "small-pets": "navHeaderSmallPets",
  lifestyle: "navHeaderLifestyle",
  explore: "navHeaderExplore",
  shopping: "navHeaderShopping",
} as const;

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
 * Canonical Header navigation lists. Desktop uses a vertical dropdown and the
 * mobile drawer uses these exact same links, so the two interfaces cannot drift.
 * Product routes are strict collection routes; editorial and policy destinations
 * remain direct informational links.
 */
export function CategorySubmenu({ group, compact = false, onNavigate }: CategorySubmenuProps) {
  const { t } = useI18n();
  const itemsByGroup = {
    cats: [
      { href: "/categories/cats/dry-food", label: t("catDirectDryFood") },
      { href: "/categories/cats/kitten", label: t("catDirectKitten") },
      { href: "/categories/cats/adult", label: t("catDirectAdult") },
      { href: "/categories/cats/senior", label: t("catDirectSenior") },
      { href: "/categories/cats/snacks", label: t("catDirectTreats") },
      { href: "/categories/cats/wet-cans", label: t("catSubWetCans") },
      { href: "/categories/cats/freeze-dried", label: t("catSubFreezeDried") },
      { href: "/categories/cats/litter", label: t("catSubLitter") },
      { href: "/categories/cats/toys-climbing", label: t("catSubToysClimbing") },
    ],
    dogs: [
      { href: "/categories/dogs/dry-food", label: t("dogSubDryFood") },
      { href: "/categories/dogs/wet-cans", label: t("dogSubWetCans") },
      { href: "/categories/dogs/freeze-dried", label: t("dogSubFreezeDried") },
      { href: "/categories/dogs/snacks", label: t("dogSubSnacks") },
      { href: "/categories/dogs/toilet-pads", label: t("dogSubToiletPads") },
      { href: "/categories/dogs/toys", label: t("dogSubToys") },
    ],
    "small-pets": [
      { href: "/categories/small-pets/rabbits", label: t("smallPetSubRabbits") },
      { href: "/categories/small-pets/hamsters-gerbils", label: t("smallPetSubHamsters") },
      { href: "/categories/small-pets/guinea-pigs-chinchillas", label: t("smallPetSubGuineaPigs") },
      { href: "/categories/small-pets/food-treats", label: t("smallPetSubFoodTreats") },
      { href: "/categories/small-pets/hay-bedding", label: t("smallPetSubHayBedding") },
      { href: "/categories/small-pets/habitats", label: t("smallPetSubHabitats") },
      { href: "/categories/small-pets/toys-health", label: t("smallPetSubToysHealth") },
    ],
    lifestyle: [
      { href: "/categories/lifestyle/feeding", label: t("lifestyleSubFeeding") },
      { href: "/categories/lifestyle/beds-home", label: t("lifestyleSubBedsHome") },
      { href: "/categories/lifestyle/outdoor-travel", label: t("lifestyleSubOutdoorTravel") },
      { href: "/categories/lifestyle/cleaning-odour", label: t("lifestyleSubCleaningOdour") },
      { href: "/categories/lifestyle/grooming", label: t("lifestyleSubGrooming") },
      { href: "/categories/lifestyle/training-safety", label: t("lifestyleSubTrainingSafety") },
      { href: "/categories/lifestyle/storage-accessories", label: t("lifestyleSubStorageAccessories") },
    ],
    explore: [
      { href: "/cat-breeds", label: t("navExploreCats") },
      { href: "/cat-breeds?animal=dogs", label: t("navExploreDogs") },
      { href: "/categories/small-pets", label: t("navExploreSmallPets") },
    ],
    shopping: [
      { href: "/shipping-policy", label: t("navShippingPolicy") },
      { href: "/returns", label: t("navReturnsPolicy") },
      { href: "/terms", label: t("navTermsPolicy") },
    ],
  } as const;
  const items = itemsByGroup[group];
  const panelClass = compact
    ? "grid gap-1"
    : "grid min-w-64 gap-1 rounded-2xl border border-[color:var(--line)] bg-[#fffdfb] p-2 shadow-[0_18px_34px_-26px_rgba(62,42,28,0.42)]";
  const linkClass = "group flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-sm leading-snug text-[color:var(--muted)] transition-[background-color,color,transform,box-shadow] duration-150 ease-out hover:translate-x-0.5 hover:bg-[#f1ded1] hover:text-[#583827] hover:shadow-[0_8px_16px_-14px_rgba(79,50,33,0.7)] active:scale-[0.98] focus-visible:bg-[#f1ded1] focus-visible:text-[#583827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]";

  return (
    <section className={panelClass} aria-label={t(HEADER_MENU_LABEL_KEY[group])}>
      <h3 className="border-b border-[color:var(--line)] px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)]">
        {t(HEADER_MENU_LABEL_KEY[group])}
      </h3>
      <div className="grid gap-1 pt-1">
        {items.map((item) => (
          <CategoryNavLink key={item.href} href={item.href} onNavigate={onNavigate} className={linkClass}>
            <span>{item.label}</span>
            <ArrowIcon className="h-3.5 w-3.5 text-[color:var(--muted)] opacity-0 transition-all duration-150 group-hover:translate-x-1 group-hover:text-[#583827] group-hover:opacity-100" />
          </CategoryNavLink>
        ))}
      </div>
    </section>
  );
}
