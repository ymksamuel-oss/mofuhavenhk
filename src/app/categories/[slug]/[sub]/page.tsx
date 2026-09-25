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
 * - `/categories/cats/freeze-dried` → \u51b7\u51cd\u812b\u6c34\u7cfb\u5217
 * - `/categories/cats/snacks` → \u8c93\u8c93\u5c0f\u98df
 * - `/categories/cats/snacks?series=natural|senior|hairball|kitten` → series filters
 * - `/categories/cats/pill-treats` → \u8c93\u7528\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df
 * - `/categories/dogs/snacks` → \u72d7\u72d7\u5c0f\u98df
 * - `/categories/dogs/food` → \u72d7\u72d7\u98df\u54c1
 * - `/categories/dogs/pill-treats` → \u72d7\u7528\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df
 */
export default async function CategorySubPage({ params }: CategorySubPageProps) {
  const { slug, sub } = await params;
  const categorySlug = canonicalCategorySlug(slug) ?? slug.trim().toLowerCase();
  const subSlug = sub.trim().toLowerCase();
  const categoryName = categorySlug === "dogs" ? "\u72d7\u72d7\u5c08\u5340" : categorySlug === "cats" ? "\u8c93\u54aa\u5c08\u5340" : categorySlug === "supplies" ? "\u5bf5\u7269\u7528\u54c1" : "\u5bf5\u7269\u5546\u54c1\u5206\u985e";
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "\u9996\u9801", item: "https://www.mofuhavenhk.com/" },
        { "@type": "ListItem", position: 2, name: categoryName, item: `https://www.mofuhavenhk.com/categories/${categorySlug}` },
        { "@type": "ListItem", position: 3, name: subSlug, item: `https://www.mofuhavenhk.com/categories/${categorySlug}/${subSlug}` },
      ],
    }} />
    <ProductCatalog categorySlug={categorySlug} subcategory={subSlug} showProductSearch />
  </>;
}
