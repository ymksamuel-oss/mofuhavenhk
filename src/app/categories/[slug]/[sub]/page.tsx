import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";
import { findCategoryBySlug } from "@/lib/store-categories";

export const dynamic = "force-dynamic";

type CategorySubPageProps = {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{ series?: string | string[]; lang?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategorySubPageProps): Promise<Metadata> {
  const { slug, sub } = await params;
  const query = await searchParams;
  const snapshot = await getCatalogSnapshot();
  const parent = findCategoryBySlug(snapshot.categories, slug);
  const category = parent?.children.find((child) => child.slug === sub.trim().toLowerCase());
  if (!parent || !category) return { robots: { index: false, follow: false } };
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: parent.slug,
  });
}

/**
 * Food-zone subcategory pages with clear URLs:
 * - `/categories/cats/freeze-dried` → 冷凍脫水系列
 * - `/categories/cats/snacks` → 貓貓小食
 * - `/categories/cats/snacks?series=natural|senior|hairball|kitten` → series filters
 * - `/categories/cats/pill-treats` → 貓用投藥餵藥專用小食
 * - `/categories/dogs/snacks` → 狗狗小食
 * - `/categories/dogs/food` → 狗狗食品
 * - `/categories/dogs/pill-treats` → 狗用投藥餵藥專用小食
 */
export default async function CategorySubPage({ params }: CategorySubPageProps) {
  const { slug, sub } = await params;
  const snapshot = await getCatalogSnapshot();
  const parent = findCategoryBySlug(snapshot.categories, slug);
  const category = parent?.children.find((child) => child.slug === sub.trim().toLowerCase());
  if (!parent || !category) notFound();

  return <ProductCatalog categorySlug={parent.slug} subcategory={category.slug} showProductSearch />;
}
