import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";
import { categoryStaticParams } from "@/lib/category-route-params";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const revalidate = 86400;

export async function generateStaticParams() {
  const { categories } = await getCatalogSnapshot();
  return categoryStaticParams(categories);
}

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getCategoryPageMetadata("zh", {
    categorySlug: canonicalCategorySlug(slug) ?? slug.trim().toLowerCase(),
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categorySlug = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  return <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch />;
}
