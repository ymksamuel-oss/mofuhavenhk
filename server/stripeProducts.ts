import Stripe from "stripe";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { canonicalCatalogFields } from "../shared/productCatalog";
import { recoveredProductImageMap } from "../shared/recoveredProductImageMap";

export type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  images: string[];
  priceId: string | null;
  unitAmount: number | null;
  currency: string | null;
  active: boolean;
  category: string;
  sub_category: string;
  metadata: Record<string, string>;
};

export type ProductSource = "stripe" | "mcp-live-snapshot";

const knownUnavailableProductImage = /^https?:\/\/mofuhavenhk\.com\/(?:images\/products|products)\//i;

function sanitizeMetadata(metadata: Stripe.Metadata | Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata ?? {}).filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;
}

export function sanitizeProductImages(images: string[]): string[] {
  return images.filter((image) => {
    try {
      const url = new URL(image);
      return (url.protocol === "http:" || url.protocol === "https:") && !knownUnavailableProductImage.test(image);
    } catch {
      return false;
    }
  });
}

export function selectProductPrice(
  product: Stripe.Product,
  activePrices: Stripe.Price[],
): Stripe.Price | null {
  const defaultPrice = product.default_price;
  if (defaultPrice && typeof defaultPrice !== "string" && defaultPrice.active) {
    return defaultPrice;
  }

  const candidates = activePrices.filter((price) => {
    const productId = typeof price.product === "string" ? price.product : price.product?.id;
    return productId === product.id && price.active;
  });

  return candidates.sort((left, right) => right.created - left.created)[0] ?? null;
}

export function toStoreProduct(
  product: Stripe.Product,
  activePrices: Stripe.Price[],
): StoreProduct {
  const price = selectProductPrice(product, activePrices);
  const recoveredImage = recoveredProductImageMap[product.id];
  const images = recoveredImage ? [recoveredImage] : sanitizeProductImages(product.images.filter(Boolean));
  const rawMetadata = sanitizeMetadata(product.metadata ?? {});
  const catalogFields = canonicalCatalogFields({ name: product.name, description: product.description, metadata: rawMetadata });

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: images[0] ?? null,
    images,
    priceId: price?.id ?? null,
    unitAmount: price?.unit_amount ?? null,
    currency: price?.currency ?? null,
    active: product.active,
    ...catalogFields,
    metadata: { ...rawMetadata, ...catalogFields, parent_category: catalogFields.category },
  };
}

function snapshotToStoreProduct(product: (typeof stripeProductsSnapshot)[number]): StoreProduct {
  const catalogFields = canonicalCatalogFields({ name: product.name, description: product.description, metadata: product.metadata });
  const recoveredImage = recoveredProductImageMap[product.id];
  const images = recoveredImage ? [recoveredImage] : sanitizeProductImages(product.images);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: images[0] ?? null,
    images,
    priceId: product.priceId,
    unitAmount: product.unitAmount,
    currency: product.currency,
    active: product.active,
    ...catalogFields,
    metadata: { ...product.metadata, ...catalogFields, parent_category: catalogFields.category },
  };
}

export async function listStoreProducts(stripe: Stripe): Promise<{ products: StoreProduct[]; source: ProductSource }> {
  const [products, prices] = await Promise.all([
    stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    }),
    stripe.prices.list({
      active: true,
      limit: 100,
    }),
  ]);

  if (products.data.length > 0) {
    return {
      products: products.data.map((product) => toStoreProduct(product, prices.data)),
      source: "stripe",
    };
  }

  // The current project sandbox is empty, while MCP verified the user's Live
  // account contains 91 Active products. Keep the storefront usable without
  // exposing or hardcoding a secret; replace this fallback automatically once
  // the project's server receives the matching Live Stripe connection.
  return {
    products: stripeProductsSnapshot.map(snapshotToStoreProduct),
    source: "mcp-live-snapshot",
  };
}
