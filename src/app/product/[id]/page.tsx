import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/order";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";
const SITE_URL = "https://www.mofuhavenhk.com";
const SITE_NAME = "Mofu Haven HK";
const VALUE_BUNDLE_SKUS = new Set([
  "MOFU-BUNDLE-PICKY-01",
  "MOFU-BUNDLE-DENTAL-02",
  "MOFU-BUNDLE-SEAFOOD-03",
  "MOFU-BUNDLE-WALK-04",
]);

function productSku(product: { id: string; metadata?: Record<string, string> }) {
  return product.metadata?.mofu_sku?.trim() || product.id;
}

function cleanEnglishCopy(value?: string): string {
  if (!value || /\\u[0-9a-fA-F]{4}/.test(value) || /[\u3400-\u9fff]/.test(value)) return "";
  return value.trim();
}

function productSeoDescription(product: Product) {
  const name = getLocalizedProductName(product, "en");
  const highlight = (cleanEnglishCopy(product.description?.en) || `Carefully selected ${name} for everyday pet care and rewards.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  const punctuation = /[.!?]$/.test(highlight) ? "" : ".";
  const metadataText = Object.values(product.metadata ?? {}).join(" ");
  const madeInJapan = /made\s*in\s*japan|日本製|日本國產|日本直送/i.test(`${product.description?.zh ?? ""} ${metadataText}`);
  const origin = madeInJapan ? " Verified Japanese-origin selection." : " Carefully selected for everyday pet care.";
  return `${highlight}${punctuation}${origin} Free Hong Kong delivery applies to qualifying orders.`;
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
    "Unopened lifestyle items in their original packaging may be returned within 7 days. Food, treats, opened items and products damaged through improper storage are non-returnable for hygiene and food-safety reasons. Contact us on WhatsApp within 48 hours with photos if an item arrives damaged or leaking.",
};

const hongKongShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "Hong Kong Delivery",
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
    value: FREE_SHIPPING_THRESHOLD,
    currency: "HKD",
  },
  description: `Hong Kong in-stock items are generally shipped within 1–2 business days via SF Express. Orders over HK$${FREE_SHIPPING_THRESHOLD} qualify for free local delivery.`,
};

const japanDirectShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingLabel: "Japan Pre-order / Direct Shipping",
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
    value: FREE_SHIPPING_THRESHOLD,
    currency: "HKD",
  },
  description: "Japan Pre-order and direct-shipping items usually arrive within 7–14 business days. Japanese public holidays may cause delays.",
};

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = (await getCatalogSnapshot()).products.find((candidate) => candidate.id === id);
  if (!product) return { title: "Product Not Found | Mofu Haven" };
  const name = getLocalizedProductName(product, "en");
  const title = `${name} | Mofu Haven`;
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

  const name = getLocalizedProductName(product, "en");
  const description = productSeoDescription(product);
  const image = product.images?.[0] || product.image;
  const imageUrl = productImageUrl(image);
  const galleryImages = Array.from(new Set((product.images ?? [product.image]).filter(Boolean).map(productImageUrl)));
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.id)}`;
  const sku = productSku(product);
  const breadcrumbUrl = VALUE_BUNDLE_SKUS.has(sku)
    ? `${SITE_URL}/collections/value-bundles`
    : product.categorySlug
      ? `${SITE_URL}/categories/${encodeURIComponent(product.categorySlug)}`
      : `${SITE_URL}/menu`;
  const breadcrumbName = VALUE_BUNDLE_SKUS.has(sku) ? "Value Bundles" : product.categorySlug || "Product Catalog";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    alternateName: product.name.zh && product.name.zh !== name ? product.name.zh : undefined,
    image: galleryImages.length ? galleryImages : [imageUrl],
    description,
    sku,
    url: canonical,
    brand: product.brand || product.brandName ? { "@type": "Brand", name: product.brand || product.brandName } : undefined,
    offers: {
      "@type": "Offer",
      url: canonical,
      price: product.price.toFixed(2),
      priceCurrency: "HKD",
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: product.price.toFixed(2),
          priceCurrency: "HKD",
          priceType: "https://schema.org/SalePrice",
        },
        ...(product.originalPrice && product.originalPrice > product.price
          ? [{
              "@type": "UnitPriceSpecification",
              price: product.originalPrice.toFixed(2),
              priceCurrency: "HKD",
              priceType: "https://schema.org/ListPrice",
            }]
          : []),
      ],
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
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
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
