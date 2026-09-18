import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { formatMoney } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
const SITE_URL = "https://mofuhavenhk.com";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "商品不存在 | 毛毛港 Mofu Haven" };
  const name = product.name.zh || product.name.en || "寵物商品";
  const description = (product.description?.zh?.trim()
    || `特價 ${formatMoney(product.price, "zh")} ${product.originalPrice ? `(原價 ${formatMoney(product.originalPrice, "zh")}) ` : ""}- 日本進口正貨`).slice(0, 120);
  const image = product.images?.[0] || product.image;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  const title = `${name} | 日本原裝直送 - 毛毛港 Mofu Haven HK`;
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.id)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: imageUrl, alt: name }],
      locale: "zh_HK",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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

  const name = product.name.zh || product.name.en || "寵物商品";
  const description = (product.description?.zh?.trim() || product.description?.en?.trim() || `${name}｜日本原裝直送寵物商品`).slice(0, 120);
  const image = product.images?.[0] || product.image;
  const imageUrl = image.startsWith("http") ? image : `https://mofuhavenhk.com${image.startsWith("/") ? "" : "/"}${image}`;
  const canonical = `https://mofuhavenhk.com/product/${encodeURIComponent(product.id)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: [imageUrl],
    description,
    sku: product.metadata?.mofu_sku || product.id,
    brand: product.brand || product.brandName ? { "@type": "Brand", name: product.brand || product.brandName } : undefined,
    offers: {
      "@type": "Offer",
      url: canonical,
      price: product.price.toFixed(2),
      priceCurrency: "HKD",
      availability: product.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return <>
    <JsonLd data={productSchema} />
    <ProductDetail product={product} />
  </>;
}
