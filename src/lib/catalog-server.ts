import "server-only";

import { unstable_cache } from "next/cache";
import Stripe from "stripe";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { inferFoodZone } from "@/lib/classifyPetFood";
import type { Product } from "@/lib/products";
import { fromStripeAmountHkd, getStripe } from "@/lib/stripe";

export type CatalogSnapshot = {
  products: Product[];
  source: "stripe";
  matchedRecords: number;
};

function categoryFromProduct(product: Stripe.Product): string {
  const explicitCategory = product.metadata.categorySlug?.trim();
  if (explicitCategory && CATEGORIES.some(({ slug }) => slug === explicitCategory)) {
    return explicitCategory;
  }

  const text = `${product.metadata.id ?? ""}\n${product.name}\n${product.description ?? ""}`.toLowerCase();
  if (/clean|litter|air-freshener|尿墊|貓砂|清潔/.test(text)) return "cleaning";
  if (/health|supplement|probiotic|omega|dental-water|保健|益生菌|營養/.test(text)) return "health";
  if (/toy|玩具/.test(text)) return "toys";
  if (/coat|harness|leash|collar|outdoor|大衣|胸背|牽引/.test(text)) return "outdoor";
  if (/^bestseller-/.test(product.metadata.id ?? "")) return "bestsellers";
  if (/^deal-/.test(product.metadata.id ?? "")) return "deals";
  if (/(^|[-_])dog|狗/.test(text)) return "dogs";
  if (/(^|[-_])cat|貓|^wt-/.test(text)) return "cats";
  return "snacks";
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
  const price = pricesByProductId.get(product.id);
  const image = product.images[0];
  const id = product.metadata.id?.trim() || product.id;
  if (price === undefined || !image) {
    console.warn("Stripe catalog product skipped: missing HKD price or image", {
      id,
      stripeProductId: product.id,
    });
    return null;
  }

  const categorySlug = categoryFromProduct(product);
  const catalogProduct: Product = {
    id,
    categorySlug,
    icon: iconForCategory(categorySlug),
    image,
    name: { zh: product.name, en: product.name },
    price,
    inStock: true,
    ...(product.description
      ? { description: { zh: product.description, en: product.description } }
      : {}),
  };

  const foodZone = inferFoodZone(catalogProduct);
  return foodZone
    ? {
        ...catalogProduct,
        categorySlug: foodZone.categorySlug,
        subcategory: foodZone.subcategory,
        icon: iconForCategory(foodZone.categorySlug),
      }
    : catalogProduct;
}

async function fetchCatalogFromStripe(): Promise<CatalogSnapshot> {
  const stripe = getStripe();
  const [stripeProducts, pricesByProductId] = await Promise.all([
    listAllActiveProducts(stripe),
    listAllActiveHkdPrices(stripe),
  ]);
  const products = stripeProducts
    .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
    .filter((product): product is Product => product !== null)
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

  if (products.length === 0) {
    throw new Error("Stripe returned no active catalog products with HKD prices and images");
  }

  return { products, source: "stripe", matchedRecords: products.length };
}

const getCachedCatalog = unstable_cache(
  fetchCatalogFromStripe,
  ["stripe-active-product-catalog"],
  { revalidate: 300 },
);

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
    return await getCachedCatalog();
  } catch (error) {
    console.error("Storefront Stripe catalog fetch failed", stripeErrorDetails(error));
    throw new Error("Storefront catalog is temporarily unavailable");
  }
}
