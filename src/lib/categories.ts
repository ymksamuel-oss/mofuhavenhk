import type { TranslationKey } from "@/lib/i18n/translations";

export type CategoryIconName =
  | "cat"
  | "dog"
  | "bone"
  | "health"
  | "cleaning"
  | "clock"
  | "fire"
  | "bag"
  | "toy";

export type CategoryLabelKey = Extract<
  TranslationKey,
  | "categoryCats"
  | "categoryDogs"
  | "categorySmallPets"
  | "categoryLifestyle"
  | "categorySnacks"
  | "categoryHealth"
  | "categoryCleaning"
  | "categoryDeals"
  | "categoryBestsellers"
  | "categoryOutdoor"
  | "categoryToys"
>;

export type Category = {
  slug: string;
  labelKey: CategoryLabelKey;
  icon: CategoryIconName;
};

export const CATEGORIES: Category[] = [
  { slug: "cats", labelKey: "categoryCats", icon: "cat" },
  { slug: "dogs", labelKey: "categoryDogs", icon: "dog" },
  { slug: "small-pets", labelKey: "categorySmallPets", icon: "bone" },
  { slug: "lifestyle", labelKey: "categoryLifestyle", icon: "bag" },
  { slug: "snacks", labelKey: "categorySnacks", icon: "bone" },
  { slug: "toys", labelKey: "categoryToys", icon: "toy" },
  { slug: "health", labelKey: "categoryHealth", icon: "health" },
  { slug: "cleaning", labelKey: "categoryCleaning", icon: "cleaning" },
  { slug: "deals", labelKey: "categoryDeals", icon: "clock" },
  { slug: "bestsellers", labelKey: "categoryBestsellers", icon: "fire" },
  { slug: "outdoor", labelKey: "categoryOutdoor", icon: "bag" },
];

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  cat: "cats",
  cats: "cats",
  dog: "dogs",
  dogs: "dogs",
};

/** Convert legacy singular pet routes and database values to the canonical slugs. */
export function canonicalCategorySlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return CATEGORY_SLUG_ALIASES[normalized] ?? normalized;
}

export function getCategoryLabelKey(slug: string | null): CategoryLabelKey | null {
  const canonicalSlug = canonicalCategorySlug(slug);
  if (!canonicalSlug) return null;
  return CATEGORIES.find((category) => category.slug === canonicalSlug)?.labelKey ?? null;
}

export function getCategoryBySlug(slug: string | null | undefined): Category | null {
  const canonicalSlug = canonicalCategorySlug(slug);
  if (!canonicalSlug) return null;
  return CATEGORIES.find((category) => category.slug === canonicalSlug) ?? null;
}

export function isCategorySlug(slug: string): boolean {
  return Boolean(getCategoryBySlug(slug));
}

/** Canonical path for a category landing page. */
export function categoryHref(slug: string): string {
  return `/categories/${canonicalCategorySlug(slug) ?? slug}`;
}

/** Canonical path for a category subcategory (e.g. `/categories/dogs/snacks`). */
export function categorySubHref(slug: string, subSlug: string | null | undefined): string {
  const canonicalSlug = canonicalCategorySlug(slug) ?? slug;
  if (!subSlug) return categoryHref(canonicalSlug);
  return `/categories/${canonicalSlug}/${subSlug}`;
}

/** Cat-snacks zone URL, optionally filtered to a series query (`?series=natural`). */
export function catSnacksSeriesHref(seriesSlug: string | null | undefined): string {
  const base = categorySubHref("cats", "snacks");
  if (!seriesSlug) return base;
  return `${base}?series=${encodeURIComponent(seriesSlug)}`;
}
