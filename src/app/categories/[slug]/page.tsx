import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { CATEGORIES, isCategorySlug } from "@/lib/categories";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CATEGORIES.map(({ slug }) => ({ slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) {
    notFound();
  }

  return <ProductCatalog categorySlug={slug} />;
}
