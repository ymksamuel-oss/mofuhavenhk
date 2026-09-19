import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
const SITE_URL = "https://mofuhavenhk.com";
const SITE_NAME = "毛毛港 Mofu Haven HK";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "商品不存在 | 毛毛港 Mofu Haven" };
  const name = product.name.zh || product.name.en || "日本天然寵物零食";
  const title = `【日本原裝】${name} | 無添加寵物零食 - ${SITE_NAME}`;
  const description = `選購【${name}】。嚴選 100% 日本國產優質原料，堅持無添加、無人工防腐劑及色素。原廠低溫慢烘工藝，鎖住天然鮮味與嚼勁。香港現貨 1–2 日出貨，全單滿 HK$450 享順豐本地免運。`.slice(0, 160);
  const image = product.images?.[0] || product.image;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.id)}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: imageUrl, alt: name, width: 1200, height: 1200 }],
      locale: "zh_HK",
      siteName: SITE_NAME,
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

  const name = product.name.zh || product.name.en || "日本天然寵物零食";
  const description = `選購【${name}】。嚴選 100% 日本國產優質原料，堅持無添加、無人工防腐劑及色素。原廠低溫慢烘工藝，鎖住天然鮮味與嚼勁。香港現貨 1–2 日出貨，全單滿 HK$450 享順豐本地免運。`.slice(0, 160);
  const image = product.images?.[0] || product.image;
  const imageUrl = image.startsWith("http") ? image : `https://mofuhavenhk.com${image.startsWith("/") ? "" : "/"}${image}`;
  const canonical = `https://mofuhavenhk.com/product/${encodeURIComponent(product.id)}`;
  const sku = product.metadata?.mofu_sku || product.id;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: [imageUrl],
    description,
    sku,
    url: canonical,
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
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "商品目錄", item: `${SITE_URL}/menu` },
      { "@type": "ListItem", position: 3, name, item: canonical },
    ],
  };

  return <>
    <JsonLd data={productSchema} />
    <JsonLd data={breadcrumbSchema} />
    <ProductDetail product={product} />
  </>;
}
