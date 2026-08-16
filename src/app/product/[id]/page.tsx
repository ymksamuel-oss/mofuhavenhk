import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const catalog = await getCatalogSnapshot();
  const product = catalog.products.find((candidate) => candidate.id === id);
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
