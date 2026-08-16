import type { CategoryIconName } from "@/lib/categories";

/** Cat-products sub-filter keys (shown under 「貓咪商品」). */
export const CAT_SUBCATEGORIES = [
  "貓罐罐",
  "貓乾糧",
  "冷凍脫水系列",
  "貓貓小食",
  "投藥餵藥專用小食",
] as const;

export type CatSubcategory = (typeof CAT_SUBCATEGORIES)[number];

/** Dog-products sub-filter keys (shown under 「狗狗商品」). */
export const DOG_SUBCATEGORIES = [
  "狗狗食品",
  "狗狗小食",
  "投藥餵藥專用小食",
] as const;

export type DogSubcategory = (typeof DOG_SUBCATEGORIES)[number];
export type ProductSubcategory = CatSubcategory | DogSubcategory;

export type CatSnackSeries =
  | "無添加天然系列"
  | "老貓零食"
  | "去毛球配方"
  | "bb貓零食";

export const CAT_SNACK_SERIES = [
  "無添加天然系列",
  "老貓零食",
  "去毛球配方",
  "bb貓零食",
] as const satisfies readonly CatSnackSeries[];

export const CAT_SNACK_SERIES_LABEL: Record<
  CatSnackSeries,
  { zh: string; en: string }
> = {
  無添加天然系列: { zh: "無添加天然系列", en: "No-additive natural" },
  老貓零食: { zh: "老貓零食", en: "Senior cat treats" },
  去毛球配方: { zh: "去毛球配方", en: "Hairball-care formula" },
  bb貓零食: { zh: "BB貓零食", en: "Kitten treats" },
};

export const CAT_SNACK_SERIES_BY_SLUG: Record<string, CatSnackSeries> = {
  natural: "無添加天然系列",
  senior: "老貓零食",
  hairball: "去毛球配方",
  kitten: "bb貓零食",
};

export const CAT_SNACK_SERIES_SLUG: Record<CatSnackSeries, string> = {
  無添加天然系列: "natural",
  老貓零食: "senior",
  去毛球配方: "hairball",
  bb貓零食: "kitten",
};

export const CAT_SUBCATEGORY_BY_SLUG: Record<string, CatSubcategory> = {
  "wet-cans": "貓罐罐",
  "dry-food": "貓乾糧",
  "freeze-dried": "冷凍脫水系列",
  snacks: "貓貓小食",
  "pill-treats": "投藥餵藥專用小食",
};

export const CAT_SUBCATEGORY_SLUG: Record<CatSubcategory, string> = {
  貓罐罐: "wet-cans",
  貓乾糧: "dry-food",
  冷凍脫水系列: "freeze-dried",
  貓貓小食: "snacks",
  投藥餵藥專用小食: "pill-treats",
};

export const DOG_SUBCATEGORY_BY_SLUG: Record<string, DogSubcategory> = {
  food: "狗狗食品",
  snacks: "狗狗小食",
  "pill-treats": "投藥餵藥專用小食",
};

export const DOG_SUBCATEGORY_SLUG: Record<DogSubcategory, string> = {
  狗狗食品: "food",
  狗狗小食: "snacks",
  投藥餵藥專用小食: "pill-treats",
};

export type Product = {
  id: string;
  categorySlug: string;
  subcategory?: ProductSubcategory;
  image: string;
  name: { zh: string; en: string };
  price: number;
  originalPrice?: number;
  series?: { zh: string; en: string };
  snackSeries?: CatSnackSeries;
  icon: CategoryIconName;
  description?: { zh: string; en: string };
  specs?: { zh: string; en: string }[];
  tags?: string[];
  productType?: string;
  inStock?: boolean;
  brand?: string;
  vendor?: string;
  sourceUrl?: string;
  sourceImageUrl?: string;
  handle?: string;
  recommendedBreeds?: string[];
  sourceCategory?: string;
};

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = [],
): Product[] {
  if (!slug) return [...products];
  return products.filter((product) => product.categorySlug === slug);
}

export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = [],
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => product.subcategory === subcategory);
  if (!snackSeries || subcategory !== "貓貓小食") return bySub;
  return bySub.filter((product) => product.snackSeries === snackSeries);
}

export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const dogs = getProductsByCategory("dogs", products);
  if (!subcategory) return dogs;
  return dogs.filter((product) => product.subcategory === subcategory);
}

export function getProductById(
  id: string | null | undefined,
  products: readonly Product[] = [],
): Product | null {
  if (!id) return null;
  return products.find((product) => product.id === id) ?? null;
}

export function resolveCategorySubSlug(
  categorySlug: string,
  subSlug: string | null | undefined,
): ProductSubcategory | null {
  if (!subSlug) return null;
  if (categorySlug === "cats") return CAT_SUBCATEGORY_BY_SLUG[subSlug] ?? null;
  if (categorySlug === "dogs") return DOG_SUBCATEGORY_BY_SLUG[subSlug] ?? null;
  return null;
}

export function resolveCatSnackSeriesSlug(
  seriesSlug: string | null | undefined,
): CatSnackSeries | null {
  if (!seriesSlug) return null;
  return CAT_SNACK_SERIES_BY_SLUG[seriesSlug] ?? null;
}

export function productHref(id: string): string {
  return `/product/${id}`;
}
