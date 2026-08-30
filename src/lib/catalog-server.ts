import "server-only";

import Stripe from "stripe";
import { unstable_noStore as noStore } from "next/cache";

import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { PRODUCTS as VERIFIED_FALLBACK_PRODUCTS } from "@/lib/catalog-fallback";
import { RECENT_FALLBACK_PRODUCTS } from "@/lib/catalog-recent-fallback";
import { LOCAL_CATALOG_IMAGE_FALLBACKS } from "@/lib/catalog-image-fallback";
import {
  CAT_SNACK_SERIES,
  categorySlugFromMetadata,
  isSmallPetProductText,
  subcategoryFromMetadata,
  resolveCategorySubSlug,
  type CatSnackSeries,
  type Product,
  type ProductSubcategory,
  type ProductVariant,
  isStorefrontReadyProduct,
  uniqueProductsById,
} from "@/lib/products";
import {
  fromStripeAmountHkd,
  getStripe,
  getStripePublishableKey,
  getStripeSecretKey,
} from "@/lib/stripe";
import { GENERATED_PRODUCT_TRANSLATIONS } from "@/lib/generated-product-translations";
import { compareAtPriceFromMetadata } from "@/lib/compare-at-price";
import { normalizeProductClassificationText } from "./product-classification-text";
import { resolveProductVariantImage } from "./product-variant-images";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CatalogSnapshot = {
  products: Product[];
  source: "stripe" | "supabase" | "fallback";
  matchedRecords: number;
};

/**
 * Git-backed catalog used when Stripe is unavailable or returns no usable
 * products. Checkout remains server-authoritative and re-validates prices.
 */
const FALLBACK_PRODUCTS: Product[] = VERIFIED_FALLBACK_PRODUCTS;

function fallbackCatalogSnapshot(): CatalogSnapshot {
  const products = uniqueProductsById([
    ...FALLBACK_PRODUCTS,
    ...RECENT_FALLBACK_PRODUCTS,
  ]);
  return {
    products,
    source: "fallback",
    matchedRecords: products.length,
  };
}

/** Internal marker handled by ProductImage as a CSS-only missing-image state. */
const CATALOG_IMAGE_FALLBACK = "catalog-placeholder";
const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;
const FREEZE_DRY_TEXT_MARK = /冷凍脫水|冷冻脱水|凍乾|凍干|freeze[\s-]?dried|freeze[\s-]?dry/i;
const IMAGE_METADATA_KEY = /(^|[_.-])images?($|[_.-])|image[_-]?(url|urls|cdn)|source[_-]?image/i;

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

function imageUrlsFromMetadata(metadata: Readonly<Record<string, string>>): string[] {
  const urls: string[] = [];
  for (const [key, rawValue] of Object.entries(metadata)) {
    if (!IMAGE_METADATA_KEY.test(key) || !rawValue?.trim()) continue;
    const values: unknown[] = [rawValue];
    try {
      values.push(JSON.parse(rawValue));
    } catch {
      // Metadata may be a comma/newline/pipe-delimited URL list.
    }
    for (const value of values.flatMap((item) => Array.isArray(item) ? item : [item])) {
      if (typeof value !== "string") continue;
      for (const candidate of value.split(/[\r\n,|;]+/)) {
        if (isUsableCatalogImage(candidate.trim())) urls.push(candidate.trim());
      }
    }
  }
  return urls;
}

function catalogImageUrls(product: Stripe.Product, metadata: Readonly<Record<string, string>>): string[] {
  return Array.from(new Set([
    ...imageUrlsFromMetadata(metadata),
    ...(product.images ?? []),
    ...(LOCAL_CATALOG_IMAGE_FALLBACKS[product.id] ?? []),
  ].filter(isUsableCatalogImage))).slice(0, 8);
}

function marketReferencePriceFromMetadata(
  metadata: Readonly<Record<string, string>>,
  currentPrice: number,
): number | undefined {
  const rawValue = metadata.market_reference_price_hkd;
  if (!rawValue) return undefined;
  const parsed = Number(rawValue.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > currentPrice ? parsed : undefined;
}

function marketReferenceAsOfFromMetadata(
  metadata: Readonly<Record<string, string>>,
): string | undefined {
  const value = metadata.market_reference_as_of?.trim();
  return value || undefined;
}

function categoryFromProduct(product: Stripe.Product): string {
  const metadata = productMetadata(product);
  const metadataCategory =
    metadata.category ?? metadata.category_slug ?? metadata.category_code ?? metadata["主分類代碼"];
  const metadataText = normalizeProductClassificationText(Object.values(metadata).join(" "));
  const explicitCategory = categorySlugFromMetadata(metadataCategory);
  if (explicitCategory === "small-pets" || explicitCategory === "lifestyle") {
    return explicitCategory;
  }
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

  // Product copy is a stronger signal than stale category metadata for records
  // imported from earlier catalog versions. Only override metadata when the
  // name/description clearly identifies exactly one pet type.
  const productText = normalizeProductClassificationText(`${product.name ?? ""} ${product.description ?? ""}`);
  const isDogProduct = /狗|犬|dog|canine/i.test(productText);
  const isCatProduct = /貓|猫|cat|feline/i.test(productText);
  if (isDogProduct && !isCatProduct) return "dogs";
  if (isCatProduct && !isDogProduct) return "cats";

  return explicitCategory ?? (isDogProduct ? "dogs" : "cats");
}

function subcategoryFromProduct(
  product: Stripe.Product,
  categorySlug: string,
): ProductSubcategory | undefined {
  const metadata = productMetadata(product);
  const raw =
    metadata.subcategory ?? metadata.sub_category ?? metadata.child_category ?? metadata["SubCategory"];
  const fromMetadata = subcategoryFromMetadata(raw) ?? resolveCategorySubSlug(categorySlug, raw);
  // An explicit, granular metadata value remains authoritative. The legacy
  // generic value「狗狗食品」is refined below so dry food and wet food never
  // share the new Header collections. This also prevents an import filename
  // such as "cat-litter-and-dry-food" from overriding a declared dry-food slug.
  if (fromMetadata && fromMetadata !== "狗狗食品") return fromMetadata;

  const text = normalizeProductClassificationText(`${product.name ?? ""} ${product.description ?? ""} ${Object.values(metadata).join(" ")}`).toLowerCase();
  if (text.includes("投藥") || text.includes("餵藥") || text.includes("pill")) {
    return "投藥餵藥專用小食";
  }
  if (categorySlug === "cats") {
    if (/(貓砂|litter|砂盆|cat\s*box)/i.test(text)) return "貓砂及貓砂盆";
    if (/(攀爬|貓爬|cat\s*tree|cat\s*toy|玩具|toy)/i.test(text)) return "貓咪玩具及攀爬設施";
    if (FREEZE_DRY_TEXT_MARK.test(text)) return "冷凍脫水系列";
    if (text.includes("罐頭") || text.includes("罐罐") || text.includes("濕糧") || text.includes("濕食")) return "貓罐罐";
    if (text.includes("乾糧") || text.includes("飼料")) return "貓乾糧";
    if (text.includes("小食") || text.includes("零食") || text.includes("脆餅") || text.includes("肉泥")) return "貓貓小食";
  }
  if (categorySlug === "dogs") {
    if (/(尿墊|尿布|狗廁|toilet|training\s*pad|pee\s*pad)/i.test(text)) return "狗狗廁所及尿墊";
    if (/(狗玩具|dog\s*toy|玩具|toy)/i.test(text)) return "狗狗玩具";
    if (/(乾糧|狗糧|kibble|dry\s*food)/i.test(text)) return "狗狗乾糧";
    if (FREEZE_DRY_TEXT_MARK.test(text)) return "狗狗冷凍脫水食品";
    if (/(罐頭|罐罐|濕糧|濕食|wet\s*food|canned|\bcan\b|pouch)/i.test(text)) return "狗狗罐頭及濕糧";
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
  const text = normalizeProductClassificationText([product.name, product.description, ...Object.values(metadata)]
    .filter(Boolean)
    .join(" "));
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

function inStockFromMetadata(metadata: Record<string, string>): boolean {
  const availability = [
    metadata.inventory_status,
    metadata.stock_status,
    metadata.availability,
  ]
    .filter(Boolean)
    .join(" ");
  const explicit = metadata.in_stock?.trim().toLowerCase();
  if (explicit === "false" || explicit === "0" || explicit === "no") return false;
  return !/缺貨|缺货|out\s*of\s*stock|sold\s*out/i.test(availability);
}

async function listAllActiveProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    products.push(...page.data);
    if (!page.has_more) return products;
    const nextCursor = page.data.at(-1)?.id;
    if (!nextCursor || nextCursor === startingAfter) {
      throw new Error("Stripe products pagination returned has_more without a new cursor");
    }
    startingAfter = nextCursor;
  }
}

type StripePriceRecord = {
  id: string;
  amount: number;
  metadata: Record<string, string>;
};

function packCountFromPrice(price: StripePriceRecord): number {
  const value = Number(price.metadata.pack_count);
  return Number.isInteger(value) && value > 0 ? value : Number.MAX_SAFE_INTEGER;
}

function variantSortFromPrice(price: StripePriceRecord): number {
  const value = Number(price.metadata.variant_sort);
  return Number.isInteger(value) && value > 0 ? value : packCountFromPrice(price);
}

function productVariantsFromPrices(
  productId: string,
  productMetadata: Record<string, string>,
  prices: readonly StripePriceRecord[],
): ProductVariant[] | undefined {
  const variantMode = productMetadata.variant_mode;
  const isGeneralChoice = variantMode === "option" || variantMode === "choice";
  if (variantMode !== "pack_size" && !isGeneralChoice) return undefined;

  const variants = prices
    .filter((price) => {
      const hasDeclaredVariant = Boolean(price.metadata.variant_key || price.metadata.variant_label_zh);
      return isGeneralChoice || packCountFromPrice(price) !== Number.MAX_SAFE_INTEGER || hasDeclaredVariant;
    })
    .sort((left, right) => variantSortFromPrice(left) - variantSortFromPrice(right))
    .map((price) => {
      const packCount = packCountFromPrice(price);
      const perCan = Number(price.metadata.per_can_hkd);
      const originalPrice = compareAtPriceFromMetadata(
        { ...productMetadata, ...price.metadata },
        price.amount,
      );
      const variantLabelZh = price.metadata.variant_label_zh || (isGeneralChoice ? "選項" : `${packCount}罐裝`);
      const variantLabelEn = price.metadata.variant_label_en || (isGeneralChoice ? "Option" : `${packCount} Cans`);
      const variantImage = resolveProductVariantImage({
        productId,
        variantKey: price.metadata.variant_key,
        labelZh: variantLabelZh,
        labelEn: variantLabelEn,
        explicitImage: price.metadata.variant_image_url,
      });
      return {
        key: price.metadata.variant_key || `pack-${packCount}`,
        priceId: price.id,
        price: price.amount,
        label: {
          zh: variantLabelZh,
          en: variantLabelEn,
        },
        ...(variantImage ? { image: variantImage } : {}),
        ...(Number.isFinite(perCan) && perCan > 0
          ? {
              unitLabel: {
                zh: `每罐 HK$${perCan.toFixed(2)}`,
                en: `HK$${perCan.toFixed(2)} each`,
              },
            }
          : {}),
        ...(originalPrice ? { originalPrice } : {}),
      };
    });

  return variants.length ? variants : undefined;
}

async function listAllActiveHkdPrices(stripe: Stripe): Promise<Map<string, StripePriceRecord[]>> {
  const pricesByProductId = new Map<string, StripePriceRecord[]>();
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.prices.list({
      active: true,
      currency: "hkd",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const price of page.data) {
      if (price.unit_amount === null) continue;
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      const records = pricesByProductId.get(productId) ?? [];
      records.push({
        id: price.id,
        amount: fromStripeAmountHkd(price.unit_amount),
        metadata: price.metadata ?? {},
      });
      pricesByProductId.set(productId, records);
    }
    if (!page.has_more) return pricesByProductId;
    const nextCursor = page.data.at(-1)?.id;
    if (!nextCursor || nextCursor === startingAfter) {
      throw new Error("Stripe prices pagination returned has_more without a new cursor");
    }
    startingAfter = nextCursor;
  }
}

function stripeProductToCatalogProduct(
  product: Stripe.Product,
  pricesByProductId: ReadonlyMap<string, StripePriceRecord[]>,
): Product | null {
  const metadata = productMetadata(product);
  const priceRecords = pricesByProductId.get(product.id) ?? [];
  const variants = productVariantsFromPrices(product.id, metadata, priceRecords);
  const defaultPriceId = typeof product.default_price === "string"
    ? product.default_price
    : product.default_price?.id;
  const priceRecord = variants?.length
    ? priceRecords.find((record) => record.id === variants[0].priceId)
    : priceRecords.find((record) => record.id === defaultPriceId) ?? priceRecords[0];
  const images = catalogImageUrls(product, metadata);
  const image = images[0] ?? CATALOG_IMAGE_FALLBACK;
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
  const localizedTexture = bilingualMetadataValue(
    metadata,
    ["texture_zh", "texture.zh", "mouthfeel_zh", "口感", "口感特點"],
    ["texture_en", "texture.en", "mouthfeel_en", "口感英文"],
    "",
  );
  const localizedAvailability = bilingualMetadataValue(
    metadata,
    ["availability_display_zh", "stock_status_zh", "規格狀態"],
    ["availability_display_en", "stock_status_en"],
    "",
  );
  const defaultVariantOriginalPrice = variants?.find((variant) => variant.priceId === priceRecord.id)?.originalPrice;
  const originalPrice = defaultVariantOriginalPrice ?? compareAtPriceFromMetadata(metadata, priceRecord.amount);
  const marketReferencePrice = marketReferencePriceFromMetadata(metadata, priceRecord.amount);
  const marketReferenceAsOf = marketReferenceAsOfFromMetadata(metadata);
  const catalogProduct: Product = {
    id,
    createdAt: product.created,
    priceId: priceRecord.id,
    metadata,
    categorySlug,
    ...(subcategory ? { subcategory } : {}),
    ...(snackSeries ? { snackSeries } : {}),
    icon: iconForCategory(categorySlug),
    image,
    ...(images.length > 0 ? { images } : {}),
    name: localizedName,
    price: priceRecord.amount,
    ...(variants ? { variants } : {}),
    ...(originalPrice ? { originalPrice } : {}),
    ...(marketReferencePrice ? { marketReferencePrice } : {}),
    ...(marketReferenceAsOf ? { marketReferenceAsOf } : {}),
    inStock: inStockFromMetadata(metadata),
    tags: Array.from(new Set([
      ...metadataTags(metadata),
      categorySlug,
      ...(subcategory ? [subcategory] : []),
    ])),
    ...(metadata.brand ? { brand: metadata.brand } : {}),
    ...(metadata.vendor ? { vendor: metadata.vendor } : {}),
    ...(localizedDescription ? { description: localizedDescription } : {}),
    ...(localizedTexture ? { texture: localizedTexture } : {}),
    ...(localizedAvailability ? { availability: localizedAvailability } : {}),
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

  const products = uniqueProductsById(
    stripeProducts
      .filter((product) => pricesByProductId.has(product.id))
      .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
      .filter((product): product is Product => product !== null),
  ).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

  if (products.length === 0) {
    throw new Error("Stripe catalog has no active HKD products");
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

async function fetchCatalogFromSupabase(): Promise<CatalogSnapshot | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const [categoryResult, productResult] = await Promise.all([
    supabase.from("categories").select("id,slug"),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
  ]);
  if (categoryResult.error || productResult.error || !productResult.data?.length) return null;
  const categorySlugs = new Map((categoryResult.data || []).map((row) => [row.id, row.slug]));
  const products = productResult.data.map((row: { id: string; created_at?: string | null; category_id?: string | null; name?: string | null; images?: unknown; price?: number | string | null; original_price?: number | string | null; stock?: number | string | null; description?: string | null }) => {
    const images = Array.isArray(row.images) ? row.images.filter((value: unknown): value is string => typeof value === "string" && value.length > 0) : [];
    const categorySlug = categorySlugs.get(row.category_id) || "lifestyle";
    const name = String(row.name || "未命名產品");
    return {
      id: String(row.id),
      createdAt: row.created_at ? Math.floor(new Date(row.created_at).getTime() / 1000) : undefined,
      categorySlug,
      image: images[0] || CATALOG_IMAGE_FALLBACK,
      ...(images.length ? { images } : {}),
      name: { zh: name, en: name },
      price: Number(row.price || 0),
      ...(row.original_price ? { originalPrice: Number(row.original_price) } : {}),
      inStock: Number(row.stock || 0) > 0,
      description: row.description ? { zh: String(row.description), en: String(row.description) } : undefined,
      metadata: {},
      tags: [categorySlug],
      icon: iconForCategory(categorySlug),
    } satisfies Product;
  }).filter((product) => product.price >= 0);
  return { products, source: "supabase", matchedRecords: products.length };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  noStore();
  try {
    const managedCatalog = await fetchCatalogFromSupabase();
    if (managedCatalog) return managedCatalog;
    // Intentionally uncached: fetch live Stripe catalog data on every request.
    return await fetchCatalogFromStripe();
  } catch (error) {
    console.error(
      "Storefront Stripe catalog fetch failed; using verified fallback catalog",
      stripeErrorDetails(error),
    );
    return fallbackCatalogSnapshot();
  }
}
