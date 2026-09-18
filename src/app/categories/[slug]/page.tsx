import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

export const dynamic = "force-dynamic";

const DOG_INGREDIENTS = new Set([
  "all", "chicken", "duck", "beef", "pork", "boar", "kangaroo", "deer", "horse", "sheep",
  "roll", "chips-jerky", "seafood", "produce", "snacks", "dairy", "seasoning", "side-dish", "frozen", "food",
]);

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[]; ingredient?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: canonicalCategorySlug(slug) ?? slug.trim().toLowerCase(),
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const categorySlug = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  const ingredient = Array.isArray(query.ingredient) ? query.ingredient[0] : query.ingredient;
  const ingredientFilter = categorySlug === "dogs" && ingredient && DOG_INGREDIENTS.has(ingredient) && ingredient !== "all"
    ? ingredient
    : null;
  return <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch ingredientFilter={ingredientFilter} />;
}
