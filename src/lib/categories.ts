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
  { slug: "snacks", labelKey: "categorySnacks", icon: "bone" },
  { slug: "toys", labelKey: "categoryToys", icon: "toy" },
  { slug: "health", labelKey: "categoryHealth", icon: "health" },
  { slug: "cleaning", labelKey: "categoryCleaning", icon: "cleaning" },
  { slug: "deals", labelKey: "categoryDeals", icon: "clock" },
  { slug: "bestsellers", labelKey: "categoryBestsellers", icon: "fire" },
  { slug: "outdoor", labelKey: "categoryOutdoor", icon: "bag" },
];

export function getCategoryLabelKey(slug: string | null): CategoryLabelKey | null {
  if (!slug) return null;
  return CATEGORIES.find((category) => category.slug === slug)?.labelKey ?? null;
}

export function getCategoryBySlug(slug: string | null | undefined): Category | null {
  if (!slug) return null;
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function isCategorySlug(slug: string): boolean {
  return CATEGORIES.some((category) => category.slug === slug);
}

/** Canonical path for a category landing page. */
export function categoryHref(slug: string): string {
  return `/categories/${slug}`;
}

/** Canonical path for a category subcategory (e.g. `/categories/dogs/snacks`). */
export function categorySubHref(slug: string, subSlug: string | null | undefined): string {
  if (!subSlug) return categoryHref(slug);
  return `/categories/${slug}/${subSlug}`;
}

/** Dog-snacks zone URL, optionally filtered to a series query (`?series=biscuits`). */
export function dogSnacksSeriesHref(seriesSlug: string | null | undefined): string {
  const base = categorySubHref("dogs", "snacks");
  if (!seriesSlug) return base;
  return `${base}?series=${encodeURIComponent(seriesSlug)}`;
}
