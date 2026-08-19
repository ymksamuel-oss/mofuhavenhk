export type ProductCategory =
  | "all"
  | "cats"
  | "dogs"
  | "treats"
  | "wet-cans"
  | "toys"
  | "supplements"
  | "small-pets"
  | "deals"
  | "bestsellers"
  | "outdoor";

export type CatalogProduct = {
  name: string;
  description: string | null;
  metadata: Record<string, string>;
};

const productCategorySet = new Set<ProductCategory>([
  "all",
  "cats",
  "dogs",
  "treats",
  "wet-cans",
  "toys",
  "supplements",
  "small-pets",
  "deals",
  "bestsellers",
  "outdoor",
]);

const legacyCategoryAliases: Record<string, ProductCategory> = {
  cleaning: "small-pets",
};

export function normalizeRequestedCategory(value: string | null | undefined): ProductCategory {
  const candidate = value?.trim().toLocaleLowerCase("zh-HK") ?? "";
  return legacyCategoryAliases[candidate] ?? (productCategorySet.has(candidate as ProductCategory) ? candidate as ProductCategory : "all");
}

const normalized = (value: string) => value.toLocaleLowerCase("zh-HK");

const searchableText = (product: CatalogProduct) =>
  [product.name, product.description ?? "", ...Object.entries(product.metadata).flat()]
    .join(" ")
    .toLocaleLowerCase("zh-HK");

// The source catalog contains legacy values such as child_category/type/slug
// that were copied as wet-cans for unrelated items. Category mapping therefore
// uses product text and the stable species/tag fields only.
const trustedCategoryText = (product: CatalogProduct) =>
  [
    product.name,
    product.description ?? "",
    product.metadata.category,
    product.metadata.parent_category,
    product.metadata.category_zh,
    product.metadata.Categories,
    product.metadata.Category,
    product.metadata.Parent_Category,
    product.metadata.tags,
    product.metadata.categories,
  ]
    .filter(Boolean)
    .map((value) => normalized(value as string))
    .join(" ");

export function normalizeProductCategories(product: CatalogProduct): ProductCategory[] {
  const text = trustedCategoryText(product);
  const categories = new Set<ProductCategory>();
  // Legacy metadata labels some small-animal products as cats. The explicit
  // small-animal signal takes precedence so they can be found independently.
  const isSmallPet = /(小動物|小寵物|倉鼠|天竺鼠|兔仔|兔)/i.test(text);
  // Legacy metadata may label unrelated products as wet-cans. Only a clear
  // product-name signal is trusted for wet food, and this same signal takes
  // precedence over a conflicting small-pet/hygiene metadata value.
  const isWetCan = /(罐罐|罐頭|濕糧|濕食|鮮肉杯|wet|canned)/i.test(normalized(product.name));

  if (isSmallPet) categories.add("small-pets");
  if (!isSmallPet && /(cats?|貓咪商品|貓貓|貓)/i.test(text)) categories.add("cats");
  if (/(dogs?|狗狗商品|狗狗|狗)/i.test(text)) categories.add("dogs");
  if (/(treat|snack|小食|零食|肉泥|燒鰹魚|糊仔|脆餅|餡餅|雞肉卷|脫水)/i.test(text)) categories.add("treats");
  if (isWetCan) categories.add("wet-cans");
  if (/(toy|玩具)/i.test(text)) categories.add("toys");
  if (/(supplement|health|保健|營養|奶粉|益生菌)/i.test(text)) categories.add("supplements");
  if (/(sale|deal|優惠|折扣)/i.test(text)) categories.add("deals");
  if (/(best|熱賣|人氣)/i.test(text)) categories.add("bestsellers");
  if (/(outdoor|travel|外出)/i.test(text)) categories.add("outdoor");

  return Array.from(categories);
}

export function productMatchesFilter(product: CatalogProduct, category: ProductCategory = "all", query = ""): boolean {
  const normalizedQuery = normalized(query.trim());
  const text = searchableText(product);
  const categoryMatches = category === "all" || normalizeProductCategories(product).includes(category);
  return categoryMatches && (!normalizedQuery || text.includes(normalizedQuery));
}

export function filterCatalogProducts<T extends CatalogProduct>(products: T[], category: ProductCategory = "all", query = ""): T[] {
  return products.filter((product) => productMatchesFilter(product, category, query));
}
