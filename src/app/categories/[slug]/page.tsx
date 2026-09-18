import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

export const dynamic = "force-dynamic";

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
  const categoryName = categorySlug === "dogs" ? "狗狗專區" : categorySlug === "cats" ? "貓咪專區" : categorySlug === "supplies" ? "寵物用品" : "寵物商品分類";
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首頁", item: "https://mofuhavenhk.com/" },
        { "@type": "ListItem", position: 2, name: categoryName, item: `https://mofuhavenhk.com/categories/${categorySlug}` },
      ],
    }} />
    <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch ingredientFilter={ingredientFilter} />
  </>;
}
