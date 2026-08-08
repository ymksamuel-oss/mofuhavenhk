import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { PRODUCTS, getProductById } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return PRODUCTS.map(({ id }) => ({ id }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const catalog = await getCatalogSnapshot();
  const product = getProductById(id, catalog.products);
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
