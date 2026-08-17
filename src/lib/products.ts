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
  /** Raw normalized taxonomy values retained from Stripe metadata. */
  taxonomyTerms?: string[];
};

const CATEGORY_TAXONOMY: Record<string, string[]> = {
  cats: ["cats", "cat", "貓咪商品", "貓咪", "貓用", "貓"],
  dogs: ["dogs", "dog", "狗狗商品", "狗狗", "狗用", "狗"],
};

const SUBCATEGORY_TAXONOMY: Record<ProductSubcategory, string[]> = {
  "貓罐罐": ["貓罐罐", "罐罐", "罐頭", "濕糧", "濕食", "wet food", "canned"],
  "貓乾糧": ["貓乾糧", "貓糧", "乾糧", "dry food", "kibble"],
  "冷凍脫水系列": ["冷凍脫水系列", "冷凍脫水", "凍乾", "freeze dried", "freeze dry"],
  "貓貓小食": ["貓貓小食", "貓咪小食", "貓零食", "cat snacks", "cat treats", "小食", "零食", "snack", "treat"],
  "狗狗食品": ["狗狗食品", "狗糧", "狗食", "dog food"],
  "狗狗小食": ["狗狗小食", "狗零食", "dog snacks", "dog treats", "小食", "零食", "snack", "treat"],
  "投藥餵藥專用小食": ["投藥餵藥專用小食", "投藥", "餵藥", "pill treats", "pill treat"],
};

const SNACK_SERIES_TAXONOMY: Record<CatSnackSeries, string[]> = {
  "無添加天然系列": ["無添加天然系列", "無添加", "天然系列", "no additive", "natural"],
  "老貓零食": ["老貓零食", "老貓", "senior cat", "senior"],
  "去毛球配方": ["去毛球配方", "去毛球", "吐毛球", "hairball"],
  "bb貓零食": ["bb貓零食", "幼貓零食", "kitten treats", "kitten"],
};

function normalizeTaxonomy(value: string): string {
  return value.toLocaleLowerCase().replace(/[\s_\-/／,|]+/g, "");
}

function taxonomyMatches(terms: readonly string[] | undefined, aliases: readonly string[]): boolean {
  if (!terms?.length) return false;
  const normalizedAliases = aliases.map(normalizeTaxonomy).filter(Boolean);
  return terms.some((term) => {
    const normalizedTerm = normalizeTaxonomy(term);
    if (!normalizedTerm) return false;
    return normalizedAliases.some(
      (alias) => normalizedTerm.includes(alias) || alias.includes(normalizedTerm),
    );
  });
}

function hasCategory(product: Product, categorySlug: string): boolean {
  return product.categorySlug === categorySlug || taxonomyMatches(product.taxonomyTerms, CATEGORY_TAXONOMY[categorySlug] ?? []);
}

function hasSubcategory(product: Product, subcategory: ProductSubcategory): boolean {
  return product.subcategory === subcategory || taxonomyMatches(product.taxonomyTerms, SUBCATEGORY_TAXONOMY[subcategory]);
}

function hasSnackSeries(product: Product, snackSeries: CatSnackSeries): boolean {
  return product.snackSeries === snackSeries || taxonomyMatches(product.taxonomyTerms, SNACK_SERIES_TAXONOMY[snackSeries]);
}

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = [],
): Product[] {
  if (!slug) return [...products];
  return products.filter((product) => hasCategory(product, slug));
}

export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = [],
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => hasSubcategory(product, subcategory));
  if (!snackSeries || subcategory !== "貓貓小食") return bySub;
  return bySub.filter((product) => hasSnackSeries(product, snackSeries));
}

export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const dogs = getProductsByCategory("dogs", products);
  if (!subcategory) return dogs;
  return dogs.filter((product) => hasSubcategory(product, subcategory));
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
