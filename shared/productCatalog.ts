export type ProductCategory =
  | "all"
  | "cats"
  | "dogs"
  | "treats"
  | "wet-cans"
  | "toys"
  | "supplements"
  | "cleaning"
  | "deals"
  | "bestsellers"
  | "outdoor";

export type CatalogProduct = {
  name: string;
  description: string | null;
  metadata: Record<string, string>;
};

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

  if (/(cats?|貓咪商品|貓貓|貓)/i.test(text)) categories.add("cats");
  if (/(dogs?|狗狗商品|狗狗|狗)/i.test(text)) categories.add("dogs");
  if (/(treat|snack|小食|零食|肉泥|燒鰹魚|糊仔|脆餅|餡餅|雞肉卷|脫水)/i.test(text)) categories.add("treats");
  // Legacy records reuse `slug/type=wet-cans` for unrelated dry food and snacks.
  // Only a clear product-name signal can classify a product as wet food.
  if (/(罐罐|罐頭|濕糧|濕食|鮮肉杯|wet|canned)/i.test(normalized(product.name))) categories.add("wet-cans");
  if (/(toy|玩具)/i.test(text)) categories.add("toys");
  if (/(supplement|health|保健|營養|奶粉|益生菌)/i.test(text)) categories.add("supplements");
  if (/(clean|hygiene|清潔|消臭|尿墊)/i.test(text)) categories.add("cleaning");
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
