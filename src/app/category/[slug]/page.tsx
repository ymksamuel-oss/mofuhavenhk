import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";
import { findCategoryBySlug } from "@/lib/store-categories";

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
  const snapshot = await getCatalogSnapshot();
  const category = findCategoryBySlug(snapshot.categories, slug);
  if (!category) return { robots: { index: false, follow: false } };
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: category.slug,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const snapshot = await getCatalogSnapshot();
  const category = findCategoryBySlug(snapshot.categories, slug);
  if (!category) notFound();

  return <ProductCatalog categorySlug={category.slug} subcategory={null} showProductSearch />;
}
