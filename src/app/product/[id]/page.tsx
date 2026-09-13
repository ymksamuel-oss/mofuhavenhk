import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { formatMoney } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "商品不存在 | 毛毛港 Mofu Haven" };
  const name = product.name.zh || product.name.en;
  const description = product.description?.zh?.trim()
    || `特價 ${formatMoney(product.price, "zh")} ${product.originalPrice ? `(原價 ${formatMoney(product.originalPrice, "zh")}) ` : ""}- 日本進口正貨`;
  const image = product.images?.[0] || product.image;
  return {
    title: `${name} | 毛毛港 Mofu Haven`,
    description,
    openGraph: {
      type: "website",
      title: `${name} | 毛毛港 Mofu Haven`,
      description,
      images: [{ url: image, alt: name }],
      locale: "zh_HK",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | 毛毛港 Mofu Haven`,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const catalog = await getCatalogSnapshot();
  const product = catalog.products.find((candidate) => candidate.id === id);
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
