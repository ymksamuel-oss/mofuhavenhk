import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalog } from "@/components/menu/ProductCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { COLLECTIONS, getCollection, getCollectionDescription } from "@/lib/collections";

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
  const title = `${collection.title_en} | Japanese Pet Essentials | Mofu Haven`;
  const description = `${getCollectionDescription(collection)} Shop product details, usage guidance and Hong Kong delivery information.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.mofuhavenhk.com/collections/${collection.slug}` },
    openGraph: { title, description, type: "website", url: `https://www.mofuhavenhk.com/collections/${collection.slug}` },
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
        name: collection.title_en,
        description: getCollectionDescription(collection),
        url: `https://www.mofuhavenhk.com/collections/${collection.slug}`,
        isPartOf: { "@type": "WebSite", name: "Mofu Haven HK", url: "https://www.mofuhavenhk.com/" },
      }} />
      <ProductCatalog collectionSlug={collection.slug} categorySlug={null} subcategory={null} />
    </>
  );
}
