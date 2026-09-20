import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { COLLECTIONS, getCollection } from "@/lib/collections";

export const revalidate = 300;
// Collection pages are public storefront routes; unknown slugs still resolve to notFound below.
export const dynamicParams = true;

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug.trim().toLowerCase());
  if (!collection) return { title: "Collection not found | Mofu Haven HK" };
  const title = `${collection.title_zh}｜日本天然寵物用品推薦｜毛毛港 MofuHaven`;
  const description = `${collection.description} 按毛孩需要選擇合適產品，查看規格、用法及香港配送資訊，方便安心選購。`;
  return {
    title,
    description,
    alternates: { canonical: `https://mofuhavenhk.com/collections/${collection.slug}` },
    openGraph: { title, description, type: "website", url: `https://mofuhavenhk.com/collections/${collection.slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug.trim().toLowerCase());
  if (!collection) notFound();

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: collection.title_zh,
        description: collection.description,
        url: `https://mofuhavenhk.com/collections/${collection.slug}`,
        isPartOf: { "@type": "WebSite", name: "Mofu Haven HK", url: "https://mofuhavenhk.com/" },
      }} />
      <ProductCatalog collectionSlug={collection.slug} categorySlug={null} subcategory={null} />
    </>
  );
}
