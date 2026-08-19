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
  snacks: "treats",
  snack: "treats",
  "pet-snacks": "treats",
  "pet-treats": "treats",
  "寵物零食": "treats",
  "寵物小食": "treats",
  "狗狗小食": "treats",
  "貓咪小食": "treats",
};

export function normalizeRequestedCategory(value: string | null | undefined): ProductCategory {
  const candidate = value?.trim().toLocaleLowerCase("zh-HK") ?? "";
  return legacyCategoryAliases[candidate] ?? (productCategorySet.has(candidate as ProductCategory) ? candidate as ProductCategory : "all");
}

export function resolveSearchCategory(currentCategory: ProductCategory, query: string): ProductCategory {
  return query.trim() ? "all" : currentCategory;
}

const normalizeSearchText = (value: string) => value.toLocaleLowerCase("zh-HK").replace(/\s+/g, "");

const searchSynonymGroups: string[][] = [
  ["罐罐", "罐頭", "主食罐", "副食罐", "濕糧", "濕食", "濕罐"],
  ["零食", "小食", "寵物零食", "寵物小食", "狗狗小食", "貓咪小食", "treat", "treats", "snack", "snacks"],
  ["雞肉", "雞胸肉", "雞柳", "雞肉味", "雞肝", "雞腎", "雞冠", "chicken"],
  ["貓", "貓咪", "貓貓", "cat", "cats"],
  ["狗", "狗狗", "犬", "dog", "dogs"],
  ["玩具", "玩樂", "toy", "toys"],
  ["保健", "營養", "營養品", "補充品", "supplement", "supplements"],
  ["外出", "出街", "旅行", "travel", "outdoor"],
];

export function expandSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return [];

  const terms = new Set([normalizedQuery]);
  for (const group of searchSynonymGroups) {
    const normalizedGroup = group.map(normalizeSearchText);
    if (normalizedGroup.some((term) => normalizedQuery.includes(term))) {
      normalizedGroup.forEach((term) => terms.add(term));
    }
  }
  return Array.from(terms);
}

const legacySearchMetadataKeys = new Set([
  "subcategory",
  "subcategory_alt",
  "subcategory_slug",
  "sub_category",
  "child_category",
  "slug",
  "type",
  "status",
  "is_active",
]);

const searchableText = (product: CatalogProduct) =>
  normalizeSearchText([
    product.name,
    product.description ?? "",
    ...Object.entries(product.metadata)
      .filter(([key]) => !legacySearchMetadataKeys.has(key.toLocaleLowerCase("zh-HK")))
      .flat(),
  ].join(" "));

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
    .map((value) => normalizeSearchText(value as string))
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
  const isWetCan = /(罐罐|罐頭|濕糧|濕食|鮮肉杯|wet|canned)/i.test(normalizeSearchText(product.name));

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
  const searchTerms = expandSearchTerms(query);
  const text = searchableText(product);
  const categoryMatches = category === "all" || normalizeProductCategories(product).includes(category);
  return categoryMatches && (!searchTerms.length || searchTerms.some((term) => text.includes(term)));
}

export function filterCatalogProducts<T extends CatalogProduct>(products: T[], category: ProductCategory = "all", query = ""): T[] {
  return products.filter((product) => productMatchesFilter(product, category, query));
}
