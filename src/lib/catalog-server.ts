import "server-only";

import Stripe from "stripe";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import {
  categorySlugFromMetadata,
  subcategoryFromMetadata,
  type Product,
  type ProductSubcategory,
  uniqueProductsById,
} from "@/lib/products";
import { fromStripeAmountHkd, getStripe } from "@/lib/stripe";

export type CatalogSnapshot = {
  products: Product[];
  source: "stripe";
  matchedRecords: number;
};

/** Internal marker handled by ProductImage as a CSS-only missing-image state. */
const CATALOG_IMAGE_FALLBACK = "catalog-placeholder";
const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;

/**
 * The previous storefront's product asset route now responds with an HTML 404
 * document. Treat those URLs as missing images instead of rendering the page
 * artwork inside product cards. Other HTTPS Stripe/CDN image URLs are kept.
 */
function isUsableCatalogImage(value: string | undefined): value is string {
  if (!value || LEGACY_PRODUCT_IMAGE_PATH.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

function productMetadata(product: Stripe.Product): Record<string, string> {
  return product.metadata ?? {};
}

function categoryFromProduct(product: Stripe.Product): string {
  const metadata = productMetadata(product);
  const metadataCategory =
    metadata.category ?? metadata.category_slug ?? metadata.category_code ?? metadata["主分類代碼"];
  return (
    categorySlugFromMetadata(metadataCategory) ??
    (/(小動物|兔|倉鼠|天竺鼠|牧草|小寵物|small.?pet)/i.test(product.name ?? "")
      ? "small-pets"
      : /狗|犬|dog/i.test(product.name ?? "")
        ? "dogs"
        : "cats")
  );
}

function subcategoryFromProduct(
  product: Stripe.Product,
  categorySlug: string,
): ProductSubcategory | undefined {
  const metadata = productMetadata(product);
  const raw =
    metadata.subcategory ?? metadata.sub_category ?? metadata.child_category ?? metadata["SubCategory"];
  const fromMetadata = subcategoryFromMetadata(raw);
  if (fromMetadata) return fromMetadata;

  const text = `${product.name ?? ""} ${product.description ?? ""}`.toLowerCase();
  if (text.includes("投藥") || text.includes("餵藥") || text.includes("pill")) {
    return "投藥餵藥專用小食";
  }
  if (categorySlug === "cats") {
    if (text.includes("冷凍脫水") || text.includes("freeze-dried")) return "冷凍脫水系列";
    if (text.includes("罐頭") || text.includes("罐罐") || text.includes("濕糧") || text.includes("濕食")) return "貓罐罐";
    if (text.includes("乾糧") || text.includes("飼料")) return "貓乾糧";
    if (text.includes("小食") || text.includes("零食") || text.includes("脆餅") || text.includes("肉泥") || text.includes("凍乾")) return "貓貓小食";
  }
  if (categorySlug === "dogs") {
    if (text.includes("小食") || text.includes("零食") || text.includes("肉條") || text.includes("肉卷")) return "狗狗小食";
    return "狗狗食品";
  }
  return undefined;
}

function metadataTags(metadata: Record<string, string>): string[] {
  return Array.from(new Set(
    Object.entries(metadata)
      .filter(([key]) => /^(tag|tags)$/i.test(key))
      .flatMap(([, value]) => value.split(/[,，、|]/).map((tag) => tag.trim()))
      .filter(Boolean),
  ));
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

type StripePriceRecord = { id: string; amount: number };

async function listAllActiveHkdPrices(stripe: Stripe): Promise<Map<string, StripePriceRecord>> {
  const pricesByProductId = new Map<string, StripePriceRecord>();
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
        pricesByProductId.set(productId, {
          id: price.id,
          amount: fromStripeAmountHkd(price.unit_amount),
        });
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
  pricesByProductId: ReadonlyMap<string, StripePriceRecord>,
): Product | null {
  const metadata = productMetadata(product);
  const priceRecord = pricesByProductId.get(product.id);
  const image =
    product.images?.find(isUsableCatalogImage) ?? CATALOG_IMAGE_FALLBACK;
  const id = product.id;
  if (priceRecord === undefined) {
    console.warn("Stripe catalog product skipped: missing HKD price", {
      id,
      stripeProductId: product.id,
    });
    return null;
  }

  const categorySlug = categoryFromProduct(product);
  const subcategory = subcategoryFromProduct(product, categorySlug);
  const catalogProduct: Product = {
    id,
    priceId: priceRecord.id,
    metadata,
    categorySlug,
    ...(subcategory ? { subcategory } : {}),
    icon: iconForCategory(categorySlug),
    image,
    name: { zh: product.name ?? "", en: product.name ?? "" },
    price: priceRecord.amount,
    inStock: true,
    tags: Array.from(new Set([
      ...metadataTags(metadata),
      categorySlug,
      ...(subcategory ? [subcategory] : []),
    ])),
    ...(metadata.brand ? { brand: metadata.brand } : {}),
    ...(metadata.vendor ? { vendor: metadata.vendor } : {}),
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

  const products = uniqueProductsById(
    stripeProducts
      .filter((product) => pricesByProductId.has(product.id))
      .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
      .filter((product): product is Product => product !== null),
  ).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

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
