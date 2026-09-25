import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

export const revalidate = 300;

const DOG_INGREDIENTS = new Set([
  "chicken", "duck", "beef", "pork", "boar", "kangaroo", "deer", "horse", "sheep",
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
  const ingredientFilter = categorySlug === "dogs"
    ? (ingredient && DOG_INGREDIENTS.has(ingredient) ? ingredient : "chicken")
    : null;
  const categoryName = categorySlug === "dogs" ? "\u72d7\u72d7\u5c08\u5340" : categorySlug === "cats" ? "\u8c93\u54aa\u5c08\u5340" : categorySlug === "supplies" ? "\u5bf5\u7269\u7528\u54c1" : "\u5bf5\u7269\u5546\u54c1\u5206\u985e";
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "\u9996\u9801", item: "https://www.mofuhavenhk.com/" },
        { "@type": "ListItem", position: 2, name: categoryName, item: `https://www.mofuhavenhk.com/categories/${categorySlug}` },
      ],
    }} />
    <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch ingredientFilter={ingredientFilter} />
  </>;
}
