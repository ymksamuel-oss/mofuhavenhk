import type { Metadata } from "next";
import Link from "next/link";
import { BrandInfoCard } from "@/components/brand/BrandInfoCard";
import { BrandProductCard } from "@/components/brand/BrandProductCard";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { brandDescription, type Brand } from "@/lib/brands";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };
type CatalogProduct = Awaited<ReturnType<typeof getCatalogSnapshot>>["products"][number];

async function getBrand(slug: string): Promise<{ brand: Brand | null; products: CatalogProduct[] }> {
  const catalog = await getCatalogSnapshot();
  const brand = catalog.brands.find((item) => item.slug === slug) || null;
  const products = brand
    ? catalog.products.filter((product) => product.brandId === brand.id || (!product.brandId && product.brandName?.toLowerCase() === brand.name.toLowerCase()))
    : [];
  return { brand, products };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await getBrand(slug);
  if (!brand) return { title: "Brand not found | Mofu Haven" };
  return {
    title: `${brand.name} Japanese Pet Essentials | Mofu Haven`,
    description: `Browse curated ${brand.name} pet food, treats and everyday essentials from Mofu Haven, delivered from Japan.`,
    openGraph: { title: `${brand.name} Japanese Pet Essentials | Mofu Haven`, description: brandDescription(brand) },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const { brand, products } = await getBrand(slug);
  if (!brand) return <main className="mx-auto max-w-5xl px-4 py-20 text-center"><h1 className="text-3xl font-semibold">Brand not found</h1><Link href="/" className="mt-6 inline-block text-[#7a4b31] underline">Return home</Link></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <BrandInfoCard brand={brand} />
      {products.length === 0 ? <section className="py-12 text-center"><p className="text-neutral-500">This brand has no published products yet. Explore another brand.</p><Link href="/" className="mt-5 inline-block rounded-xl bg-[#7a4b31] px-5 py-3 font-semibold text-white">Explore other brands</Link></section> : <section aria-labelledby="brand-products-title"><h2 id="brand-products-title" className="sr-only">{brand.name} products</h2><ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <BrandProductCard key={product.id} product={product} />)}</ul></section>}
    </main>
  );
}
