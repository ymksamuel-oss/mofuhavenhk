import Stripe from "stripe";
import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";

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
  metadata: Record<string, string>;
};

export type ProductSource = "stripe" | "mcp-live-snapshot";

const knownUnavailableProductImage = /^https?:\/\/mofuhavenhk\.com\/(?:images\/products|products)\//i;

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
  const images = sanitizeProductImages(product.images.filter(Boolean));

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
    metadata: product.metadata ?? {},
  };
}

function snapshotToStoreProduct(product: (typeof stripeProductsSnapshot)[number]): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: sanitizeProductImages(product.images)[0] ?? null,
    images: sanitizeProductImages(product.images),
    priceId: product.priceId,
    unitAmount: product.unitAmount,
    currency: product.currency,
    active: product.active,
    metadata: product.metadata,
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
