import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
const SITE_URL = "https://mofuhavenhk.com";
const SITE_NAME = "\u6bdb\u6bdb\u6e2f Mofu Haven HK";
const VALUE_BUNDLE_SKUS = new Set([
  "MOFU-BUNDLE-PICKY-01",
  "MOFU-BUNDLE-DENTAL-02",
  "MOFU-BUNDLE-SEAFOOD-03",
  "MOFU-BUNDLE-WALK-04",
]);

function productSku(product: { id: string; metadata?: Record<string, string> }) {
  return product.metadata?.mofu_sku?.trim() || product.id;
}

function productSeoDescription(product: { name: { zh: string; en: string }; description?: { zh: string; en: string } }) {
  const name = product.name.zh || product.name.en || "\u65e5\u672c\u5929\u7136\u5bf5\u7269\u7528\u54c1";
  const highlight = (product.description?.zh || product.description?.en || `\u7cbe\u9078${name}，\u9069\u5408\u6bdb\u5b69\u65e5\u5e38\u7167\u9867\u8207\u734e\u52f5。`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  const punctuation = /[。！？.!?]$/.test(highlight) ? "" : "。";
  return `${highlight}${punctuation}100%\u65e5\u672c\u5728\u5730\u88fd\u9020，\u5168\u6e2f\u6eff\u984d\u514d\u904b\u76f4\u9001。`;
}

function productImageUrl(image: string) {
  return image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

const merchantReturnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "HK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 7,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnShippingFees",
  returnPolicyCountry: "HK",
  merchantReturnLink: `${SITE_URL}/shipping-policy`,
  description:
    "\u672a\u958b\u5c01\u53ca\u4fdd\u6301\u539f\u6709\u5305\u88dd\u7684\u751f\u6d3b\u7528\u54c1，\u53ef\u65bc\u6536\u8ca8\u5f8c 7 \u65e5\u5167\u806f\u7d61\u6211\u5011\u7533\u8acb\u9000\u63db。\u98df\u54c1、\u96f6\u98df、\u5df2\u62c6\u5c01\u6216\u56e0\u9867\u5ba2\u4fdd\u5b58\u4e0d\u7576\u800c\u53d7\u640d\u7684\u5546\u54c1\u57fa\u65bc\u885b\u751f\u53ca\u98df\u54c1\u5b89\u5168\u539f\u56e0\u4e0d\u8a2d\u9000\u63db。\u5982\u6536\u5230\u5546\u54c1\u6709\u7834\u640d\u6216\u932f\u6f0f，\u8acb\u65bc\u6536\u8ca8\u5f8c 48 \u5c0f\u6642\u5167\u900f\u904e WhatsApp \u806f\u7d61\u6211\u5011\u4e26\u63d0\u4f9b\u7167\u7247。",
};

const hongKongShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "\u9999\u6e2f\u914d\u9001",
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "HK",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
      unitCode: "DAY",
    },
  },
  shippingRate: {
    "@type": "MonetaryAmount",
    value: 0,
    currency: "HKD",
  },
  freeShippingThreshold: {
    "@type": "MonetaryAmount",
    value: 450,
    currency: "HKD",
  },
  description: "\u9999\u6e2f\u73fe\u8ca8\u4e00\u822c\u65bc\u4e0b\u55ae\u5f8c 1–2 \u500b\u5de5\u4f5c\u5929\u5167\u7531\u9806\u8c50\u5bc4\u51fa；\u5168\u55ae\u6eff HK$450 \u4eab\u672c\u5730\u9806\u8c50\u514d\u904b。",
};

const japanDirectShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "\u65e5\u672c\u9810\u8a02／\u76f4\u9001",
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "HK",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 3,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 7,
      maxValue: 14,
      unitCode: "DAY",
    },
  },
  shippingRate: {
    "@type": "MonetaryAmount",
    value: 0,
    currency: "HKD",
  },
  freeShippingThreshold: {
    "@type": "MonetaryAmount",
    value: 450,
    currency: "HKD",
  },
  description: "\u65e5\u672c\u9810\u8a02／\u76f4\u9001\u5546\u54c1\u7531\u65e5\u672c\u54c1\u724c\u539f\u88dd\u7a7a\u904b\u62b5\u6e2f，\u7d04\u9700 7–14 \u500b\u5de5\u4f5c\u5929；\u65e5\u672c\u7bc0\u5047\u65e5\u6216\u6703\u9806\u5ef6。",
};

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "\u5546\u54c1\u4e0d\u5b58\u5728 | \u6bdb\u6bdb\u6e2f Mofu Haven" };
  const name = product.name.zh || product.name.en || "\u65e5\u672c\u5929\u7136\u5bf5\u7269\u96f6\u98df";
  const title = `${name}｜\u6bdb\u6bdb\u6e2f MofuHaven`;
  const description = productSeoDescription(product);
  const image = product.images?.[0] || product.image;
  const imageUrl = productImageUrl(image);
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

  const name = product.name.zh || product.name.en || "\u65e5\u672c\u5929\u7136\u5bf5\u7269\u96f6\u98df";
  const description = productSeoDescription(product);
  const image = product.images?.[0] || product.image;
  const imageUrl = productImageUrl(image);
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.id)}`;
  const sku = productSku(product);
  const breadcrumbUrl = VALUE_BUNDLE_SKUS.has(sku)
    ? `${SITE_URL}/collections/value-bundles`
    : product.categorySlug
      ? `${SITE_URL}/categories/${encodeURIComponent(product.categorySlug)}`
      : `${SITE_URL}/menu`;
  const breadcrumbName = VALUE_BUNDLE_SKUS.has(sku) ? "\u4fc3\u92b7\u7d44\u5408" : product.categorySlug || "\u5546\u54c1\u76ee\u9304";
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
      hasMerchantReturnPolicy: merchantReturnPolicy,
      shippingDetails: [hongKongShippingDetails, japanDirectShippingDetails],
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "\u9996\u9801", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: breadcrumbName, item: breadcrumbUrl },
      { "@type": "ListItem", position: 3, name, item: canonical },
    ],
  };

  return <>
    <JsonLd data={productSchema} />
    <JsonLd data={breadcrumbSchema} />
    <ProductDetail product={product} />
  </>;
}
