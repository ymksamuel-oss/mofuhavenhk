import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { CATEGORIES, isCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export function generateStaticParams() {
  return CATEGORIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  if (!isCategorySlug(slug)) return { robots: { index: false, follow: false } };
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: slug,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) {
    notFound();
  }

  return (
    <ProductCatalog
      categorySlug={slug}
      subcategory={null}
      showProductSearch
    />
  );
}
