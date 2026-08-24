import "server-only";

import Stripe from "stripe";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import {
  CAT_SNACK_SERIES,
  categorySlugFromMetadata,
  isSmallPetProductText,
  subcategoryFromMetadata,
  type CatSnackSeries,
  type Product,
  type ProductSubcategory,
  uniqueProductsById,
} from "@/lib/products";
import {
  fromStripeAmountHkd,
  getStripe,
  getStripePublishableKey,
  getStripeSecretKey,
} from "@/lib/stripe";
import { GENERATED_PRODUCT_TRANSLATIONS } from "@/lib/generated-product-translations";
import { SMALL_PET_DEMO_PRODUCTS } from "@/lib/small-pet-demo-products";

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
  const metadataText = Object.values(metadata).join(" ");
  if (
    isSmallPetProductText(
      product.name,
      product.description ?? undefined,
      metadataText,
      metadata["product_type"],
      metadata["tags"],
    )
  ) {
    return "small-pets";
  }
  return (
    categorySlugFromMetadata(metadataCategory) ??
    (/狗|犬|dog/i.test(product.name ?? "") ? "dogs" : "cats")
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

function snackSeriesFromProduct(
  product: Stripe.Product,
  categorySlug: string,
  subcategory: ProductSubcategory | undefined,
): CatSnackSeries | undefined {
  if (categorySlug !== "cats" || subcategory !== "貓貓小食") return undefined;
  const metadata = productMetadata(product);
  const explicit = [
    metadata.snackSeries,
    metadata.snack_series,
    metadata.series,
    metadata["小食系列"],
  ].find(Boolean)?.trim();
  const bySlug: Record<string, CatSnackSeries> = {
    natural: "無添加天然系列",
    senior: "老貓零食",
    hairball: "去毛球配方",
    kitten: "bb貓零食",
  };
  if (explicit) {
    const matched =
      bySlug[explicit.toLowerCase()] ??
      CAT_SNACK_SERIES.find((series) => series === explicit);
    if (matched) return matched;
  }
  const text = [product.name, product.description, ...Object.values(metadata)]
    .filter(Boolean)
    .join(" ");
  if (/去毛球|毛玉|hairball/i.test(text)) return "去毛球配方";
  if (/老貓|高齡|senior|11\s*\+|11歲|14歲/i.test(text)) return "老貓零食";
  if (/bb\s*貓|幼貓|kitten|junior/i.test(text)) return "bb貓零食";
  if (/無添加|天然|natural|no[- ]?additive/i.test(text)) return "無添加天然系列";
  return undefined;
}

function firstMetadataValue(
  metadata: Record<string, string>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = metadata[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function bilingualMetadataValue(
  metadata: Record<string, string>,
  zhKeys: string[],
  enKeys: string[],
  fallback: string,
): { zh: string; en: string } | undefined {
  const zh = firstMetadataValue(metadata, zhKeys) ?? fallback;
  const en = firstMetadataValue(metadata, enKeys) ?? fallback;
  if (!zh && !en) return undefined;
  return { zh: zh || en, en: en || zh };
}

function parseBilingualSpecs(
  metadata: Record<string, string>,
): { zh: string; en: string }[] | undefined {
  const zhValue = firstMetadataValue(metadata, [
    "specs_zh",
    "spec_zh",
    "specifications_zh",
    "specs.zh",
    "specifications.zh",
    "規格",
    "中文規格",
  ]);
  const enValue = firstMetadataValue(metadata, [
    "specs_en",
    "spec_en",
    "specifications_en",
    "specs.en",
    "specifications.en",
    "英文規格",
  ]);
  const sharedValue = firstMetadataValue(metadata, ["specs", "specifications"]);
  const parseList = (value: string | undefined) =>
    value
      ?.split(/\r?\n|[|｜;]/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];
  const zhItems = parseList(zhValue ?? sharedValue);
  const enItems = parseList(enValue ?? sharedValue);
  const count = Math.max(zhItems.length, enItems.length);
  if (!count) return undefined;
  return Array.from({ length: count }, (_, index) => ({
    zh: zhItems[index] ?? enItems[index] ?? "",
    en: enItems[index] ?? zhItems[index] ?? "",
  }));
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
  const snackSeries = snackSeriesFromProduct(product, categorySlug, subcategory);
  const generatedTranslation = GENERATED_PRODUCT_TRANSLATIONS[id];
  const metadataName = bilingualMetadataValue(
    metadata,
    ["name_zh", "title_zh", "product_name_zh", "name.zh", "title.zh", "中文名稱", "中文商品名稱"],
    ["name_en", "title_en", "product_name_en", "name.en", "title.en", "英文名稱", "英文商品名稱"],
    "",
  );
  const localizedName = metadataName ?? (generatedTranslation
    ? { zh: generatedTranslation.name_zh, en: generatedTranslation.name_en }
    : { zh: product.name ?? "", en: product.name ?? "" });
  const metadataDescription = bilingualMetadataValue(
    metadata,
    ["description_zh", "detail_zh", "intro_zh", "description.zh", "detail.zh", "intro.zh", "中文描述", "中文介紹"],
    ["description_en", "detail_en", "intro_en", "description.en", "detail.en", "intro.en", "英文描述", "英文介紹"],
    "",
  );
  const localizedDescription = metadataDescription ?? (generatedTranslation && (generatedTranslation.description_zh || generatedTranslation.description_en)
    ? { zh: generatedTranslation.description_zh, en: generatedTranslation.description_en }
    : undefined);
  const catalogProduct: Product = {
    id,
    priceId: priceRecord.id,
    metadata,
    categorySlug,
    ...(subcategory ? { subcategory } : {}),
    ...(snackSeries ? { snackSeries } : {}),
    icon: iconForCategory(categorySlug),
    image,
    name: localizedName,
    price: priceRecord.amount,
    inStock: true,
    tags: Array.from(new Set([
      ...metadataTags(metadata),
      categorySlug,
      ...(subcategory ? [subcategory] : []),
    ])),
    ...(metadata.brand ? { brand: metadata.brand } : {}),
    ...(metadata.vendor ? { vendor: metadata.vendor } : {}),
    ...(localizedDescription ? { description: localizedDescription } : {}),
    ...(parseBilingualSpecs(metadata) ? { specs: parseBilingualSpecs(metadata) } : {}),
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

  const products = uniqueProductsById([
    ...stripeProducts
      .filter((product) => pricesByProductId.has(product.id))
      .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
      .filter((product): product is Product => product !== null),
    ...SMALL_PET_DEMO_PRODUCTS,
  ]).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

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

/**
 * Safe operational visibility for the live catalog. This deliberately never
 * serializes Stripe credentials or raw product data into a public response.
 */
export async function getCatalogDiagnostics() {
  const secretKey = getStripeSecretKey();
  const publishableKey = getStripePublishableKey();
  const credentials = {
    secretKey: {
      set: Boolean(secretKey),
      mode: secretKey.startsWith("sk_live_")
        ? "live"
        : secretKey.startsWith("sk_test_")
          ? "test"
          : "unknown",
    },
    publishableKey: {
      set: Boolean(publishableKey),
      mode: publishableKey.startsWith("pk_live_")
        ? "live"
        : publishableKey.startsWith("pk_test_")
          ? "test"
          : "unknown",
    },
  };

  try {
    const snapshot = await fetchCatalogFromStripe();
    return {
      ok: true,
      credentials,
      matchedRecords: snapshot.matchedRecords,
      source: snapshot.source,
    };
  } catch (error) {
    const details = stripeErrorDetails(error);
    return {
      ok: false,
      credentials,
      error: {
        type: "type" in details ? details.type : "unknown",
        code: "code" in details ? details.code : null,
        statusCode: "statusCode" in details ? details.statusCode : null,
      },
    };
  }
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
