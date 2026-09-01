import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { canonicalCategorySlug } from "@/lib/categories";
import { getCategoryPageMetadata } from "@/lib/seo/category-seo";

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
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return getCategoryPageMetadata(lang === "en" ? "en" : "zh", {
    categorySlug: canonicalCategorySlug(slug) ?? slug.trim().toLowerCase(),
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
  const categorySlug = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  return <ProductCatalog categorySlug={categorySlug} subcategory={sub.trim().toLowerCase()} showProductSearch />;
}
