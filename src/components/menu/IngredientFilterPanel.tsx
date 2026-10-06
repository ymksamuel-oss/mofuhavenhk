import { getProductMeatFamily, type Product, type ProductMeatFamily } from "@/lib/products";

export type IngredientKey = "chicken" | "venison" | "horse" | "beef" | "duck" | "pork" | "lamb" | "kangaroo" | "seafood" | "produce" | "dairy";
export type IngredientFilter = { key: IngredientKey; zh: string; en: string; group: "meat" | "seafood" | "produce" | "dairy" };

export const INGREDIENT_FILTERS: IngredientFilter[] = [
  { key: "chicken", zh: "純雞肉", en: "Chicken", group: "meat" },
  { key: "venison", zh: "蝦夷鹿肉", en: "Venison", group: "meat" },
  { key: "horse", zh: "低敏純馬肉", en: "Horse", group: "meat" },
  { key: "beef", zh: "牛肉牛筋", en: "Beef", group: "meat" },
  { key: "duck", zh: "櫻桃鴨肉", en: "Duck", group: "meat" },
  { key: "pork", zh: "鹿兒島黑豚", en: "Pork", group: "meat" },
  { key: "lamb", zh: "溫補羊肉", en: "Lamb", group: "meat" },
  { key: "kangaroo", zh: "袋鼠肉", en: "Kangaroo", group: "meat" },
  { key: "seafood", zh: "深海魚介", en: "Fish & Seafood", group: "seafood" },
  { key: "produce", zh: "田園蔬果", en: "Fruits & Veg", group: "produce" },
  { key: "dairy", zh: "犛牛芝士乳品", en: "Cheese & Dairy", group: "dairy" },
];

const MEAT_FAMILY_BY_INGREDIENT: Partial<Record<IngredientKey, ProductMeatFamily>> = {
  chicken: "CHICKEN",
  venison: "VENISON",
  horse: "HORSE",
  beef: "BEEF",
  duck: "DUCK",
  pork: "PORK",
  lamb: "LAMB",
  kangaroo: "KANGAROO",
  seafood: "FISH",
};

const NON_MEAT_PATTERNS: Partial<Record<IngredientKey, RegExp>> = {
  produce: /(?:蔬菜|水果|地瓜|甘藷|紫薯|香蕉|蘋果|豆腐|納豆|野菜|果物|フルーツ|vegetable|fruit|produce|tofu|natto|sweet\s*potato)/i,
  dairy: /(?:乳製品|芝士|奶酪|乳酪|山羊奶|チーズ|cheese|dairy|milk)/i,
};

function productIngredientText(product: Product): string {
  return [product.name.zh, product.name.en, ...(product.tags ?? []), ...Object.entries(product.metadata ?? {})
    .filter(([key]) => /(?:ingredient|material|category|supplier_category|product_type)/i.test(key))
    .map(([, value]) => value)]
    .filter(Boolean)
    .join(" ");
}

export function parseIngredientSelection(value: string | null | undefined): IngredientKey[] {
  const valid = new Set(INGREDIENT_FILTERS.map((item) => item.key));
  return (value ?? "").split(",").filter((item): item is IngredientKey => valid.has(item as IngredientKey));
}

/**
 * Match only explicitly identified ingredient families. Animal-source filters
 * require exactly one recognized meat family; no generic "meat/bone" fallback
 * or unrelated-product backfill is allowed.
 */
export function productMatchesIngredient(product: Product, filters: IngredientKey[]): boolean {
  if (filters.length === 0) return true;

  const meatFamily = getProductMeatFamily(product);
  const nonMeatText = productIngredientText(product);
  return filters.some((filter) => {
    const family = MEAT_FAMILY_BY_INGREDIENT[filter];
    if (family) return meatFamily === family;
    return NON_MEAT_PATTERNS[filter]?.test(nonMeatText) ?? false;
  });
}
