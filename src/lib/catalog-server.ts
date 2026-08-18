import "server-only";

import Stripe from "stripe";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { type Product } from "@/lib/products";
import { fromStripeAmountHkd, getStripe } from "@/lib/stripe";

export type CatalogSnapshot = {
  products: Product[];
  source: "stripe";
  matchedRecords: number;
};

const CATALOG_IMAGE_FALLBACK = "/mofu-haven-website-b.png";

function productMetadata(product: Stripe.Product): Record<string, string> {
  return product.metadata ?? {};
}

function categoryFromProduct(product: Stripe.Product): "cats" | "dogs" {
  return /狗|dog/i.test(product.name ?? "") ? "dogs" : "cats";
}

function iconForCategory(categorySlug: string): CategoryIconName {
  return CATEGORIES.find(({ slug }) => slug === categorySlug)?.icon ?? "bone";
}

async function listAllActiveProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  let startingAfter: string | undefined;

  do {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    products.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !startingAfter) {
      throw new Error("Stripe products pagination returned has_more without a cursor");
    }
  } while (startingAfter);

  return products;
}

async function listAllActiveHkdPrices(stripe: Stripe): Promise<Map<string, number>> {
  const pricesByProductId = new Map<string, number>();
  let startingAfter: string | undefined;

  do {
    const page = await stripe.prices.list({
      active: true,
      currency: "hkd",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const price of page.data) {
      if (price.unit_amount === null) continue;
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      if (!pricesByProductId.has(productId)) {
        pricesByProductId.set(productId, fromStripeAmountHkd(price.unit_amount));
      }
    }
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !startingAfter) {
      throw new Error("Stripe prices pagination returned has_more without a cursor");
    }
  } while (startingAfter);

  return pricesByProductId;
}

function stripeProductToCatalogProduct(
  product: Stripe.Product,
  pricesByProductId: ReadonlyMap<string, number>,
): Product | null {
  const metadata = productMetadata(product);
  const price = pricesByProductId.get(product.id);
  const image = product.images?.[0] || CATALOG_IMAGE_FALLBACK;
  const id = metadata.id?.trim() || product.id;
  if (price === undefined) {
    console.warn("Stripe catalog product skipped: missing HKD price", {
      id,
      stripeProductId: product.id,
    });
    return null;
  }

  const categorySlug = categoryFromProduct(product);
  const catalogProduct: Product = {
    id,
    metadata,
    categorySlug,
    icon: iconForCategory(categorySlug),
    image,
    name: { zh: product.name ?? "", en: product.name ?? "" },
    price,
    inStock: true,
    ...(product.description
      ? { description: { zh: product.description, en: product.description } }
      : {}),
  };

  return catalogProduct;
}

async function fetchCatalogFromStripe(): Promise<CatalogSnapshot> {
  const stripe = getStripe();
  const [stripeProducts, pricesByProductId] = await Promise.all([
    listAllActiveProducts(stripe),
    listAllActiveHkdPrices(stripe),
  ]);
  // Server-side Vercel log: confirms the metadata received from Stripe before filtering.
  console.log(
    "Fetched Stripe product metadata before Pet Snacks filtering",
    stripeProducts.map(({ id, name, metadata }) => ({ id, name, metadata })),
  );

  const products = stripeProducts
    .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
    .filter((product): product is Product => product !== null)
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

  return { products, source: "stripe", matchedRecords: products.length };
}

function stripeErrorDetails(error: unknown) {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      type: error.type,
      code: error.code ?? null,
      statusCode: error.statusCode ?? null,
      requestId: error.requestId ?? null,
      message: error.message,
    };
  }
  return { message: error instanceof Error ? error.message : "unknown error" };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    // Intentionally uncached: fetch live Stripe catalog data on every request.
    return await fetchCatalogFromStripe();
  } catch (error) {
    console.error("Storefront Stripe catalog fetch failed", stripeErrorDetails(error));
    return { products: [], source: "stripe", matchedRecords: 0 };
  }
}
