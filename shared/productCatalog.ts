import {
  catalogHierarchy,
  isCatalogKey,
  isSubCatalogKey,
  type CatalogKey,
  type SubCatalogKey,
} from "./catalogHierarchy";

export type LegacyProductCategory =
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

export type ProductCategory = LegacyProductCategory | CatalogKey | SubCatalogKey;

export type CatalogProduct = {
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  category?: string;
  sub_category?: string;
};

export type CatalogAssignment = {
  category: CatalogKey;
  sub_category: SubCatalogKey;
};

const productCategorySet = new Set<string>([
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
  "cat",
  "dog",
  "cat-wet-food",
  "cat-dry-food",
  "cat-litter",
  "cat-treats",
  "cat-supplies",
  "dog-wet-food",
  "dog-dry-food",
  "dog-treats",
  "dog-supplies",
  "small-pet-food",
  "small-pet-treats",
  "small-pet-supplies",
]);

const legacyCategoryAliases: Record<string, ProductCategory> = {
  cleaning: "small-pets",
  cats: "cat",
  "cat-products": "cat",
  dogs: "dog",
  "dog-products": "dog",
  snacks: "treats",
  snack: "treats",
  "pet-snacks": "treats",
  "pet-treats": "treats",
  "寵物零食": "treats",
  "寵物小食": "treats",
  "狗狗小食": "treats",
  "貓咪小食": "treats",
  "wet-cans": "cat-wet-food",
  "cat-cans": "cat-wet-food",
  "貓咪罐罐": "cat-wet-food",
  "貓罐頭": "cat-wet-food",
};

export function normalizeRequestedCategory(value: string | null | undefined): ProductCategory {
  const candidate = value?.trim().toLocaleLowerCase("zh-HK") ?? "";
  return legacyCategoryAliases[candidate] ?? (productCategorySet.has(candidate) ? candidate as ProductCategory : "all");
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
    product.category ?? "",
    product.sub_category ?? "",
    ...Object.entries(product.metadata)
      .filter(([key]) => !legacySearchMetadataKeys.has(key.toLocaleLowerCase("zh-HK")))
      .flat(),
  ].join(" "));

const trustedCategoryText = (product: CatalogProduct) =>
  [
    product.name,
    product.description ?? "",
    product.category ?? "",
    product.sub_category ?? "",
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

const nameAndDescriptionText = (product: CatalogProduct) =>
  normalizeSearchText([product.name, product.description ?? ""].join(" "));

function explicitCatalogKey(product: CatalogProduct): CatalogKey | null {
  const nameText = normalizeSearchText([product.name, product.description ?? ""].join(" "));
  if (/小寵物|小動物|倉鼠|天竺鼠|兔仔|兔/.test(nameText)) return "small-pets";

  const hasDogSignal = /狗狗|狗|犬|dog/.test(nameText);
  const hasCatSignal = /貓咪|貓貓|貓|cat/.test(nameText);
  if (hasDogSignal && !hasCatSignal) return "dog";
  if (hasCatSignal && !hasDogSignal) return "cat";

  const candidates = [
    product.category,
    product.metadata.category,
    product.metadata.parent_category,
    product.metadata.category_zh,
    product.metadata.Category,
    product.metadata.Parent_Category,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (isCatalogKey(candidate)) return candidate;
  }
  for (const candidate of candidates) {
    const text = normalizeSearchText(candidate);
    if (/小寵物|小動物|倉鼠|天竺鼠|兔仔|兔/.test(text)) return "small-pets";
    if (/狗狗|狗|犬|dog/.test(text)) return "dog";
    if (/貓咪|貓貓|貓|cat/.test(text)) return "cat";
  }
  return null;
}

function resolveCatalogKey(product: CatalogProduct): CatalogKey {
  const explicit = explicitCatalogKey(product);
  if (explicit) return explicit;

  const text = trustedCategoryText(product);
  if (/小寵物|小動物|倉鼠|天竺鼠|兔仔|兔/.test(text)) return "small-pets";
  if (/狗狗|狗|犬|dog/.test(text) && !/貓咪|貓貓|貓|cat/.test(text)) return "dog";
  return "cat";
}

function explicitSubCatalogKey(product: CatalogProduct): SubCatalogKey | null {
  const candidates = [
    product.sub_category,
    product.metadata.sub_category,
    product.metadata.subcategory,
    product.metadata.subcategory_slug,
  ].filter(Boolean) as string[];
  return candidates.find((candidate): candidate is SubCatalogKey => isSubCatalogKey(candidate)) ?? null;
}

function resolveSubCatalogKey(product: CatalogProduct, category: CatalogKey): SubCatalogKey {
  const text = nameAndDescriptionText(product);
  const isDryFood = /乾糧|貓糧|狗糧|主食糧|kibble|dryfood/.test(text);
  const isTreat = /零食|小食|點心|凍乾|凍干|肉泥|糊仔|脆餅|餡餅|燒鰹魚|雞肉卷|肉條|脫水|treat|snack|bone/.test(text);
  const isWetFood = !isDryFood && !isTreat && /罐罐|罐頭|濕糧|濕食|鮮肉杯|canned|wetfood/.test(text);
  const isLitter = /貓砂|砂盆|貓廁所|清潔用品|litter|cleaning/.test(text);
  const isToy = /玩具|玩樂|toy/.test(text);
  const isHealth = /保健|營養|營養品|補充品|奶粉|益生菌|health|supplement/.test(text);
  const isSmallFood = /主食|牧草|飼料|糧|hay|food/.test(text);
  const isBedding = /墊材|木屑|紙砂|用品|bedding|supplies/.test(text);

  const explicit = explicitSubCatalogKey(product);
  const matchesParent = explicit && explicit.startsWith(category === "small-pets" ? "small-pet-" : `${category}-`);

  if (category === "cat") {
    if (isWetFood) return "cat-wet-food";
    if (isDryFood) return "cat-dry-food";
    if (isLitter) return "cat-litter";
    if (isTreat) return "cat-treats";
    if (matchesParent) return explicit;
    return "cat-supplies";
  }

  if (category === "dog") {
    if (isWetFood) return "dog-wet-food";
    if (isDryFood) return "dog-dry-food";
    if (isTreat) return "dog-treats";
    if (matchesParent) return explicit;
    return "dog-supplies";
  }

  if (isSmallFood) return "small-pet-food";
  if (isTreat) return "small-pet-treats";
  if (matchesParent) return explicit;
  if (isBedding || isToy || isHealth) return "small-pet-supplies";
  return "small-pet-supplies";
}

export function resolveCatalogAssignment(product: CatalogProduct): CatalogAssignment {
  const category = resolveCatalogKey(product);
  return { category, sub_category: resolveSubCatalogKey(product, category) };
}

export function canonicalCatalogFields(product: CatalogProduct): CatalogAssignment {
  return resolveCatalogAssignment(product);
}

export function normalizeProductCategories(product: CatalogProduct): ProductCategory[] {
  const assignment = resolveCatalogAssignment(product);
  const text = trustedCategoryText(product);
  const categories = new Set<ProductCategory>([assignment.category, assignment.sub_category]);

  if (assignment.category === "cat") categories.add("cats");
  if (assignment.category === "dog") categories.add("dogs");

  if (["cat-wet-food", "dog-wet-food"].includes(assignment.sub_category)) categories.add("wet-cans");
  if (["cat-treats", "dog-treats", "small-pet-treats"].includes(assignment.sub_category)) categories.add("treats");
  if (/toy|玩具/.test(text)) categories.add("toys");
  if (/supplement|health|保健|營養|奶粉|益生菌/.test(text)) categories.add("supplements");
  if (/sale|deal|優惠|折扣/.test(text)) categories.add("deals");
  if (/best|熱賣|人氣/.test(text)) categories.add("bestsellers");
  if (/outdoor|travel|外出/.test(text)) categories.add("outdoor");

  return Array.from(categories);
}

export function productMatchesFilter(product: CatalogProduct, category: ProductCategory = "all", query = ""): boolean {
  const searchTerms = expandSearchTerms(query);
  const text = searchableText(product);
  const assignment = resolveCatalogAssignment(product);
  const legacyCategories = normalizeProductCategories(product);
  const categoryMatches = category === "all"
    || category === assignment.category
    || category === assignment.sub_category
    || legacyCategories.includes(category);
  return categoryMatches && (!searchTerms.length || searchTerms.some((term) => text.includes(term)));
}

export function filterCatalogProducts<T extends CatalogProduct>(products: T[], category: ProductCategory = "all", query = ""): T[] {
  return products.filter((product) => productMatchesFilter(product, category, query));
}

export function getSubCatalogs(category: CatalogKey) {
  return catalogHierarchy.find((entry) => entry.key === category)?.subCatalogs ?? [];
}
