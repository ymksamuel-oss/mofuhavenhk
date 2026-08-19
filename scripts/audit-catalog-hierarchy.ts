import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { canonicalCatalogFields, normalizeProductCategories } from "../shared/productCatalog";

const count = new Map<string, number>();
const examples = new Map<string, string[]>();
const subCategoryCounts = new Map<string, number>();

for (const product of stripeProductsSnapshot) {
  const assignment = canonicalCatalogFields(product);
  subCategoryCounts.set(assignment.sub_category, (subCategoryCounts.get(assignment.sub_category) ?? 0) + 1);
  const categories = normalizeProductCategories(product);
  for (const category of categories) {
    count.set(category, (count.get(category) ?? 0) + 1);
    const list = examples.get(category) ?? [];
    if (list.length < 5) list.push(product.name);
    examples.set(category, list);
  }
}

console.log(JSON.stringify({
  products: stripeProductsSnapshot.map((product) => ({
    name: product.name,
    category: product.metadata.category,
    sub_category: product.metadata.sub_category,
    subcategory_alt: product.metadata.subcategory_alt,
    normalizedCategories: normalizeProductCategories(product),
  })),
  total: stripeProductsSnapshot.length,
  categoryCounts: Object.fromEntries(count),
  subCategoryCounts: Object.fromEntries(subCategoryCounts),
  sampleNames: Object.fromEntries(examples),
  metadataKeyCounts: Object.fromEntries(
    ["category", "sub_category", "subcategory", "category_slug", "Categories", "Category", "Parent_Category", "SubCategory", "tags", "categories"]
      .map((key) => [key, stripeProductsSnapshot.filter((product) => Boolean(product.metadata[key])).length]),
  ),
}, null, 2));
