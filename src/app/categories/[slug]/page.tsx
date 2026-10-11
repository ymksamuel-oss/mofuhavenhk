import type { Metadata } from "next";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
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
  const categoryName = categorySlug === "dogs" ? "\u72d7\u72d7\u5c08\u5340" : categorySlug === "cats" ? "\u8c93\u54aa\u5c08\u5340" : categorySlug === "supplies" ? "\u5bf5\u7269\u7528\u54c1" : "\u5bf5\u7269\u5546\u54c1\u5206\u985e";
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "\u9996\u9801", item: "https://www.mofuhavenhk.com/" },
        { "@type": "ListItem", position: 2, name: categoryName, item: `https://www.mofuhavenhk.com/categories/${categorySlug}` },
      ],
    }} />
    <ProductCatalog categorySlug={categorySlug} subcategory={null} showProductSearch />
  </>;
}
