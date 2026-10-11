import { CATEGORIES } from "@/lib/categories";
import { flattenCategoryTree, type StoreCategory } from "@/lib/store-categories";

const FALLBACK_ROOT_SLUGS = ["supplies", "lifestyle", "outdoor"];

export function categoryStaticParams(categories: readonly StoreCategory[]) {
  const databaseRoots = flattenCategoryTree(categories)
    .filter((category) => category.parent_id === null)
    .map((category) => category.slug);
  return Array.from(new Set([
    ...CATEGORIES.map((category) => category.slug),
    ...FALLBACK_ROOT_SLUGS,
    ...databaseRoots,
  ])).sort().map((slug) => ({ slug }));
}

export function subcategoryStaticParams(categories: readonly StoreCategory[]) {
  const flattened = flattenCategoryTree(categories);
  const byId = new Map(flattened.map((category) => [category.id, category]));
  return flattened.flatMap((category) => {
    if (!category.parent_id) return [];
    const parent = byId.get(category.parent_id);
    return parent ? [{ slug: parent.slug, sub: category.slug }] : [];
  });
}
