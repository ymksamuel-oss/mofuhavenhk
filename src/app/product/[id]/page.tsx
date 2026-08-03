import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { PRODUCTS, getProductById } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return PRODUCTS.map(({ id }) => ({ id }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
