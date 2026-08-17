import "server-only";

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

async function getActiveHkdPrice(
  stripe: Stripe,
  product: Stripe.Product,
): Promise<number | null> {
  if (typeof product.default_price !== "string" && product.default_price) {
    const price = product.default_price;
    if (price.active && price.currency === "hkd" && price.unit_amount !== null) {
      return fromStripeAmountHkd(price.unit_amount);
    }
  }

  for await (const price of stripe.prices.list({
    product: product.id,
    active: true,
    currency: "hkd",
    limit: 100,
  })) {
    if (price.unit_amount !== null) return fromStripeAmountHkd(price.unit_amount);
  }
  return null;
}

async function stripeProductToCatalogProduct(
  stripe: Stripe,
  product: Stripe.Product,
): Promise<Product | null> {
  const price = await getActiveHkdPrice(stripe, product);
  const image = product.images[0];
  const id = product.metadata.id?.trim() || product.id;
  if (price === null || !image) {
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

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const stripe = getStripe();
    const products: Stripe.Product[] = [];
    for await (const product of stripe.products.list({ active: true, limit: 100 })) {
      products.push(product);
    }

    const catalogProducts = (
      await Promise.all(products.map((product) => stripeProductToCatalogProduct(stripe, product)))
    )
      .filter((product): product is Product => product !== null)
      .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

    if (catalogProducts.length === 0) {
      throw new Error("Stripe returned no active catalog products with HKD prices and images");
    }

    return {
      products: catalogProducts,
      source: "stripe",
      matchedRecords: catalogProducts.length,
    };
  } catch (error) {
    console.error(
      "Storefront Stripe catalog fetch failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { products: [], source: "stripe", matchedRecords: 0 };
  }
}
