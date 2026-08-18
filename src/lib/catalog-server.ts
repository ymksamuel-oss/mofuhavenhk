import "server-only";

import Stripe from "stripe";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { inferFoodZone } from "@/lib/classifyPetFood";
import {
  categorySlugFromMetadata,
  subcategoryFromMetadata,
  type Product,
} from "@/lib/products";
import { fromStripeAmountHkd, getStripe } from "@/lib/stripe";

export type CatalogSnapshot = {
  products: Product[];
  source: "stripe";
  matchedRecords: number;
};

function metadataValue(product: Stripe.Product, ...keys: string[]): string {
  for (const key of keys) {
    const value = product.metadata[key]?.trim();
    if (value) return value;
  }
  return "";
}

function categoryFromProduct(product: Stripe.Product): string {
  // `metadata.category` is the Stripe taxonomy source of truth. Resolve it
  // before legacy keys and name-based inference so category buttons use the
  // same values that are authored in Stripe.
  const stripeCategory = product.metadata.category?.trim();
  const categoryFromStripe = categorySlugFromMetadata(stripeCategory);
  if (categoryFromStripe) return categoryFromStripe;

  const legacyCategory = metadataValue(product, "categorySlug", "category_slug");
  const legacySlug = categorySlugFromMetadata(legacyCategory);
  if (legacySlug) return legacySlug;

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

function subcategoryFromProduct(product: Stripe.Product): Product["subcategory"] {
  const stripeCategory = product.metadata.category?.trim();
  const categorySubcategory = subcategoryFromMetadata(stripeCategory);
  if (categorySubcategory) return categorySubcategory;

  const value = metadataValue(
    product,
    "subcategory",
    "subCategory",
    "subcategorySlug",
    "subcategory_slug",
  );
  const aliases: Record<string, Product["subcategory"]> = {
    "wet-cans": "貓罐罐",
    wet: "貓罐罐",
    "貓罐罐": "貓罐罐",
    "dry-food": "貓乾糧",
    dry: "貓乾糧",
    "貓乾糧": "貓乾糧",
    "freeze-dried": "冷凍脫水系列",
    "冷凍脫水系列": "冷凍脫水系列",
    snacks: "貓貓小食",
    "cat-snacks": "貓貓小食",
    "貓貓小食": "貓貓小食",
    food: "狗狗食品",
    "dog-food": "狗狗食品",
    "狗狗食品": "狗狗食品",
    "dog-snacks": "狗狗小食",
    "狗狗小食": "狗狗小食",
    "pill-treats": "投藥餵藥專用小食",
    "投藥餵藥專用小食": "投藥餵藥專用小食",
  };
  return aliases[value.toLowerCase()] ?? aliases[value];
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
  const subcategory = subcategoryFromProduct(product);
  const catalogProduct: Product = {
    id,
    metadata: { ...product.metadata },
    categorySlug,
    ...(subcategory ? { subcategory } : {}),
    icon: iconForCategory(categorySlug),
    image,
    name: { zh: product.name, en: product.name },
    price,
    inStock: true,
    ...(product.description
      ? { description: { zh: product.description, en: product.description } }
      : {}),
  };

  // A recognized Stripe `metadata.category` must not be overwritten by legacy
  // name-based classification.
  if (categorySlugFromMetadata(product.metadata.category)) return catalogProduct;

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
  // Server-side Vercel log: confirms the metadata received from Stripe before filtering.
  console.log(
    "Fetched Stripe product metadata before Pet Snacks filtering",
    stripeProducts.map(({ id, name, metadata }) => ({ id, name, metadata })),
  );

  const products = stripeProducts
    .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
    .filter((product): product is Product => product !== null)
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

  if (products.length === 0) {
    throw new Error("Stripe returned no active catalog products with HKD prices and images");
  }

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
    throw new Error("Storefront catalog is temporarily unavailable");
  }
}
