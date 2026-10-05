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

export function parseIngredientSelection(value: string | null | undefined): IngredientKey[] {
  const valid = new Set(INGREDIENT_FILTERS.map((item) => item.key));
  return (value ?? "").split(",").filter((item): item is IngredientKey => valid.has(item as IngredientKey));
}

export function productMatchesIngredient(product: Product, filters: IngredientKey[]) {
  if (filters.length === 0) return true;
  const strictFamilyByIngredient: Partial<Record<IngredientKey, ProductMeatFamily>> = {
    pork: "PORK",
    horse: "HORSE",
    venison: "VENISON",
    beef: "BEEF",
    chicken: "CHICKEN",
    lamb: "LAMB",
    seafood: "FISH",
  };
  const strictFamilies = filters
    .map((filter) => strictFamilyByIngredient[filter])
    .filter((family): family is ProductMeatFamily => Boolean(family));
  if (strictFamilies.length > 0) {
    return strictFamilies.includes(getProductMeatFamily(product) ?? ("" as ProductMeatFamily));
  }
  const text = [product.name.zh, product.name.en, product.description?.zh, product.description?.en, ...(product.tags ?? []), ...Object.values(product.metadata ?? {})].filter(Boolean).join(" ");
  const patterns: Record<IngredientKey, RegExp> = {
    chicken: /純天然雞肉|雞胸肉|雞肉|鶏|ささみ|chicken/i,
    venison: /低敏鹿肉|蝦夷鹿|鹿肉|鹿肋排|鹿骨|鹿角|ベニソン|venison|deer/i,
    horse: /低敏馬肉|馬肉|馬|horse/i,
    beef: /嚴選牛肉|牛肉|牛筋|牛蹄|牛舌|ビーフ|beef/i,
    duck: /鴨肉|鴨|duck|カモ/i,
    pork: /豬肉|黑豚|豬耳|豚|ポーク|pork/i,
    lamb: /羊肉|羊|ラム|lamb|sheep/i,
    kangaroo: /袋鼠|カンガルー|kangaroo/i,
    seafood: /深海魚介|魚介|魚|鮪|金槍魚|吞拿魚|鮭|鱈|鯊魚|小魚乾|まぐろ|マグロ|かつお|seafood|fish|tuna|bonito|salmon|shark/i,
    produce: /蔬菜|水果|地瓜|紫薯|香蕉|蘋果|豆腐|納豆|野菜|果物|フルーツ|vegetable|fruit|produce|tofu|natto|sweet\s*potato/i,
    dairy: /乳製品|芝士|乳酪|奶酪|チーズ|cheese|dairy/i,
  };
  return filters.some((filter) => patterns[filter].test(text));
}
