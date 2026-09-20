import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { COLLECTIONS, getCollection } from "@/lib/collections";

export const revalidate = 300;

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
  return {
    title: collection.seo_title,
    description: collection.description,
    alternates: { canonical: `https://mofuhavenhk.com/collections/${collection.slug}` },
    openGraph: { title: collection.seo_title, description: collection.description, type: "website" },
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
