import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
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
  const subSlug = sub.trim().toLowerCase();
  const categoryName = categorySlug === "dogs" ? "狗狗專區" : categorySlug === "cats" ? "貓咪專區" : categorySlug === "supplies" ? "寵物用品" : "寵物商品分類";
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首頁", item: "https://mofuhavenhk.com/" },
        { "@type": "ListItem", position: 2, name: categoryName, item: `https://mofuhavenhk.com/categories/${categorySlug}` },
        { "@type": "ListItem", position: 3, name: subSlug, item: `https://mofuhavenhk.com/categories/${categorySlug}/${subSlug}` },
      ],
    }} />
    <ProductCatalog categorySlug={categorySlug} subcategory={subSlug} showProductSearch />
  </>;
}
