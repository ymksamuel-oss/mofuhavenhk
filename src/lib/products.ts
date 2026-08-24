import type { CategoryIconName } from "@/lib/categories";
import type { TranslationKey } from "@/lib/i18n/translations";

/** Cat-products sub-filter keys (shown under 「貓咪商品」). */
export const CAT_SUBCATEGORIES = [
  "貓罐罐",
  "貓乾糧",
  "冷凍脫水系列",
  "貓貓小食",
  "投藥餵藥專用小食",
] as const;

export type CatSubcategory = (typeof CAT_SUBCATEGORIES)[number];

export type ProductSubcategoryLabelKey = Extract<
  TranslationKey,
  | "catSubWetCans"
  | "catSubDryFood"
  | "catSubFreezeDried"
  | "catSubSnacks"
  | "pillTreatsSubcategory"
  | "dogSubFood"
  | "dogSubSnacks"
>;

export const PRODUCT_SUBCATEGORY_LABEL_KEY: Record<
  ProductSubcategory,
  ProductSubcategoryLabelKey
> = {
  貓罐罐: "catSubWetCans",
  貓乾糧: "catSubDryFood",
  冷凍脫水系列: "catSubFreezeDried",
  貓貓小食: "catSubSnacks",
  投藥餵藥專用小食: "pillTreatsSubcategory",
  狗狗食品: "dogSubFood",
  狗狗小食: "dogSubSnacks",
};

export function getProductSubcategoryLabelKey(
  subcategory: ProductSubcategory,
): ProductSubcategoryLabelKey {
  return PRODUCT_SUBCATEGORY_LABEL_KEY[subcategory];
}

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

export type CatSnackSeriesLabelKey = Extract<
  TranslationKey,
  | "catSnackSeriesNatural"
  | "catSnackSeriesSenior"
  | "catSnackSeriesHairball"
  | "catSnackSeriesKitten"
>;

export const CAT_SNACK_SERIES_LABEL_KEY: Record<
  CatSnackSeries,
  CatSnackSeriesLabelKey
> = {
  無添加天然系列: "catSnackSeriesNatural",
  老貓零食: "catSnackSeriesSenior",
  去毛球配方: "catSnackSeriesHairball",
  bb貓零食: "catSnackSeriesKitten",
};

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
  /** Active HKD Stripe Price used by Checkout for this product. */
  priceId?: string;
  /** Stripe metadata delivered with the catalog. `category` is the canonical taxonomy key. */
  metadata?: Record<string, string>;
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

/**
 * Product wording that identifies the small-pet shelf. Keep this broad enough
 * for future Stripe / sheet products while avoiding generic pet wording.
 */
const SMALL_PET_KEYWORDS = /小動物|小动物|小寵物|小宠物|兔子?|兔用|倉鼠|仓鼠|天竺鼠|豚鼠|荷蘭豬|荷兰猪|刺蝟|刺猬|龍貓|龙猫|蜜袋鼯|飛鼠|飞鼠|雪貂|rabbit|bunny|hamster|guinea\s*pig|gerbil|chinchilla|hedgehog|ferret|small\s*[- ]?pet|small\s*animal|rodent/i;

export function isSmallPetProductText(...values: Array<string | undefined>): boolean {
  return SMALL_PET_KEYWORDS.test(values.filter(Boolean).join(" "));
}

const CATEGORY_SLUG_BY_METADATA: Record<string, string> = {
  cats: "cats",
  cat: "cats",
  "貓咪商品": "cats",
  dogs: "dogs",
  dog: "dogs",
  "狗狗商品": "dogs",
  "small-pets": "small-pets",
  "小動物": "small-pets",
  "小寵物": "small-pets",
  snacks: "snacks",
  snack: "snacks",
  "寵物小食": "snacks",
  toys: "toys",
  "寵物玩具": "toys",
  health: "health",
  "營養保健": "health",
  cleaning: "cleaning",
  "居家清潔": "cleaning",
  deals: "deals",
  "限時優惠": "deals",
  bestsellers: "bestsellers",
  "熱賣商品": "bestsellers",
  outdoor: "outdoor",
  "外出用品": "outdoor",
};

const SUBCATEGORY_PARENT_BY_METADATA: Record<
  string,
  { parent: string; subcategory: ProductSubcategory }
> = {
  "貓罐罐": { parent: "cats", subcategory: "貓罐罐" },
  "貓乾糧": { parent: "cats", subcategory: "貓乾糧" },
  "冷凍脫水系列": { parent: "cats", subcategory: "冷凍脫水系列" },
  "貓貓小食": { parent: "cats", subcategory: "貓貓小食" },
  "狗狗食品": { parent: "dogs", subcategory: "狗狗食品" },
  "狗狗小食": { parent: "dogs", subcategory: "狗狗小食" },
};

export function categorySlugFromMetadata(category: string | undefined): string | null {
  const value = category?.trim();
  if (!value) return null;
  return (
    CATEGORY_SLUG_BY_METADATA[value.toLowerCase()] ??
    SUBCATEGORY_PARENT_BY_METADATA[value]?.parent ??
    null
  );
}

export function subcategoryFromMetadata(category: string | undefined): ProductSubcategory | null {
  const value = category?.trim();
  if (!value) return null;
  return (
    SUBCATEGORY_PARENT_BY_METADATA[value]?.subcategory ??
    (value === "投藥餵藥專用小食" ? "投藥餵藥專用小食" : null)
  );
}

export function uniqueProductsById(products: readonly Product[] = []): Product[] {
  const productsById = new Map<string, Product>();
  for (const product of products) {
    if (!productsById.has(product.id)) productsById.set(product.id, product);
  }
  return Array.from(productsById.values());
}

function productCategorySlug(product: Product): string {
  return product.categorySlug;
}

function productSubcategory(product: Product): ProductSubcategory | undefined {
  return subcategoryFromMetadata(product.metadata?.category) ?? product.subcategory;
}

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = [],
): Product[] {
  const uniqueProducts = uniqueProductsById(products);
  if (!slug) return uniqueProducts;
  return uniqueProducts.filter((product) => productCategorySlug(product) === slug);
}

export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = [],
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => productSubcategory(product) === subcategory);
  if (!snackSeries || subcategory !== "貓貓小食") return bySub;
  return bySub.filter((product) => product.snackSeries === snackSeries);
}

export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const dogs = getProductsByCategory("dogs", products);
  if (!subcategory) return dogs;
  return dogs.filter((product) => productSubcategory(product) === subcategory);
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
  if (categorySlug === "cats") {
    return (
      CAT_SUBCATEGORY_BY_SLUG[subSlug] ??
      (CAT_SUBCATEGORIES.includes(subSlug as CatSubcategory)
        ? (subSlug as CatSubcategory)
        : null)
    );
  }
  if (categorySlug === "dogs") {
    return (
      DOG_SUBCATEGORY_BY_SLUG[subSlug] ??
      (DOG_SUBCATEGORIES.includes(subSlug as DogSubcategory)
        ? (subSlug as DogSubcategory)
        : null)
    );
  }
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
