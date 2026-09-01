import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categorySlug = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  return <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch />;
}
