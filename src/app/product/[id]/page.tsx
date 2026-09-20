import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSnapshot } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
const SITE_URL = "https://mofuhavenhk.com";
const SITE_NAME = "毛毛港 Mofu Haven HK";
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
  const name = product.name.zh || product.name.en || "日本天然寵物用品";
  const highlight = (product.description?.zh || product.description?.en || `精選${name}，適合毛孩日常照顧與獎勵。`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  const punctuation = /[。！？.!?]$/.test(highlight) ? "" : "。";
  return `${highlight}${punctuation}100%日本在地製造，全港滿額免運直送。`;
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
    "未開封及保持原有包裝的生活用品，可於收貨後 7 日內聯絡我們申請退換。食品、零食、已拆封或因顧客保存不當而受損的商品基於衛生及食品安全原因不設退換。如收到商品有破損或錯漏，請於收貨後 48 小時內透過 WhatsApp 聯絡我們並提供照片。",
};

const hongKongShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "香港配送",
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
  description: "香港現貨一般於下單後 1–2 個工作天內由順豐寄出；全單滿 HK$450 享本地順豐免運。",
};

const japanDirectShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "日本預訂／直送",
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
  description: "日本預訂／直送商品由日本品牌原裝空運抵港，約需 7–14 個工作天；日本節假日或會順延。",
};

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "商品不存在 | 毛毛港 Mofu Haven" };
  const name = product.name.zh || product.name.en || "日本天然寵物零食";
  const title = `${name}｜毛毛港 MofuHaven`;
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

  const name = product.name.zh || product.name.en || "日本天然寵物零食";
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
  const breadcrumbName = VALUE_BUNDLE_SKUS.has(sku) ? "促銷組合" : product.categorySlug || "商品目錄";
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
      { "@type": "ListItem", position: 1, name: "首頁", item: `${SITE_URL}/` },
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
