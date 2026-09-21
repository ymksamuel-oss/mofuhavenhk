import "server-only";

import Stripe from "stripe";

import { canonicalCategorySlug, CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { buildCategoryTree, flattenCategoryTree, type StoreCategory } from "@/lib/store-categories";
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
  categorySlugFromMofuSku,
} from "@/lib/products";
import type { Brand } from "@/lib/brands";
import {
  fromStripeAmountHkd,
  getStripe,
  getStripePublishableKey,
  getStripeSecretKey,
} from "@/lib/stripe";
import {
  resolveEnglishProductDescription,
  resolveEnglishProductName,
} from "@/lib/product-english-resolver";
import { compareAtPriceFromMetadata } from "@/lib/compare-at-price";
import { normalizeProductClassificationText } from "./product-classification-text";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";
import { databaseProductImageUrls } from "@/lib/catalog-images";
import {
  applyCategoryLocalizations,
  CATEGORY_LOCALIZATIONS_SETTING_KEY,
  parseCategoryLocalizations,
} from "@/lib/category-localizations";
import {
  PRODUCT_LOCALIZATIONS_SETTING_KEY,
  parseProductLocalizations,
} from "@/lib/product-localizations";

export type CatalogSnapshot = {
  products: Product[];
  categories: StoreCategory[];
  brands: Brand[];
  source: "stripe" | "supabase" | "fallback";
  matchedRecords: number;
};

/**
 * Supabase import retries can create more than one database row for the same
 * Stripe Product. The query is ordered newest-first, so retain the first row
 * for every Stripe Product ID and never expose duplicate legacy cards.
 */
function uniqueProductsByStorefrontIdentity(products: readonly Product[]): Product[] {
  const productsByIdentity = new Map<string, Product>();
  for (const product of products) {
    const identity = product.stripeProductId
      ? `stripe:${product.stripeProductId}`
      : `database:${product.id}`;
    if (!productsByIdentity.has(identity)) productsByIdentity.set(identity, product);
  }
  return Array.from(productsByIdentity.values());
}

function variantGroupKey(product: Product): string {
  const metadata = product.metadata ?? {};
  const explicit = ["variant_group", "variant_group_id", "product_group", "parent_product_id", "parent_product", "style_id", "model_id", "mofu_product_group"]
    .map((key) => metadata[key]?.trim()).find(Boolean);
  if (explicit) return `group:${explicit.toLocaleLowerCase()}`;
  const source = [product.name.zh, product.name.en, metadata.japanese_name, metadata.name_ja].filter(Boolean).join(" ");
  if (/\u5f37\u97cc(?:\u900f\u6c23)?\u9632\u66b4\u885d\u80f8\u80cc\u5e36|\u9632\u66b4\u885d\u727d\u5f15\u5e36|\u9632\u66b4\u885d\u80f8\u80cc\u5e36|ハーネス|リード|\u727d\u5f15\u5e36|\u9805\u5708|\u9838\u5708|collar|leash|harness/i.test(source)) {
    const style = /\u727d\u5f15\u5e36|リード|lead|leash/i.test(source)
      ? "leash"
      : /\u9805\u5708|\u9838\u5708|collar/i.test(source) ? "collar" : "harness";
    const normalized = source
      .toLocaleLowerCase()
      .replace(/\b(?:xxs?|xs|s|m|l|xl|xxl)\b|(?:\u5c3a\u5bf8|size|\u984f\u8272|\u989c\u8272|color)\s*[:：-]?\s*[a-z0-9\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341]+/gi, "")
      .replace(/[\s|｜()（）【】\[\]_-]+/g, " ")
      .trim();
    return `style:${style}:${normalized}`;
  }
  return `product:${product.id}`;
}

function mergeVariantProducts(products: readonly Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) groups.set(variantGroupKey(product), [...(groups.get(variantGroupKey(product)) ?? []), product]);
  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];
    const representative = group[0];
    const existingPriceIds = new Set((representative.variants ?? []).map((variant) => variant.priceId));
    const mergedVariants = [...(representative.variants ?? [])];
    for (const product of group.slice(1)) {
      if (!product.priceId || existingPriceIds.has(product.priceId)) continue;
      existingPriceIds.add(product.priceId);
      const japaneseName = product.metadata?.japanese_name || product.metadata?.name_ja;
      mergedVariants.push({
        key: `product-${product.id}`,
        priceId: product.priceId,
        price: product.price,
        label: { zh: product.name.zh || product.name.en || "\u9078\u9805", en: product.name.en || product.name.zh || "Option", ...(japaneseName ? { ja: japaneseName } : {}) },
        ...(product.originalPrice ? { originalPrice: product.originalPrice } : {}),
        ...(product.images?.[0] ? { image: product.images[0] } : {}),
      });
    }
    return mergedVariants.length ? { ...representative, variants: mergedVariants } : representative;
  });
}

type ManagedCategoryAssignment = {
  categorySlug: string;
  subcategory?: ProductSubcategory;
};

/**
 * Resolves a product's category_id from the live Supabase category tree. A
 * product may point to a child category, but storefront route filtering occurs
 * at its root category with an optional standard subcategory. Products with no
 * valid relation are intentionally unassigned, never guessed from their name
 * or SKU and never leaked into another category.
 */
function resolveManagedCategoryAssignment(
  categoryId: string | null | undefined,
  categoriesById: ReadonlyMap<string, StoreCategory>,
): ManagedCategoryAssignment {
  const assigned = categoryId ? categoriesById.get(String(categoryId)) : undefined;
  if (!assigned) return { categorySlug: "unassigned" };

  let root = assigned;
  const visited = new Set<string>([assigned.id]);
  while (root.parent_id) {
    const parent = categoriesById.get(root.parent_id);
    if (!parent || visited.has(parent.id)) break;
    visited.add(parent.id);
    root = parent;
  }

  const categorySlug = canonicalCategorySlug(root.slug) ?? root.slug;
  const subcategory = assigned.id === root.id
    ? undefined
    : resolveCategorySubSlug(categorySlug, assigned.slug) ?? subcategoryFromMetadata(assigned.name);
  return { categorySlug, ...(subcategory ? { subcategory } : {}) };
}

/** Internal marker handled by ProductImage as a CSS-only missing-image state. */
const CATALOG_IMAGE_FALLBACK = "catalog-placeholder";
const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;
const FREEZE_DRY_TEXT_MARK = /\u51b7\u51cd\u812b\u6c34|\u51b7\u51bb\u8131\u6c34|\u51cd\u4e7e|\u51cd\u5e72|freeze[\s-]?dried|freeze[\s-]?dry/i;
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
  ].filter(isUsableCatalogImage))).slice(0, 8);
}

type SupabaseProductImageRow = {
  images?: unknown;
  image?: unknown;
  image_url?: unknown;
  source_product_id?: string | null;
};

function isStripeProductId(value: unknown): value is string {
  return typeof value === "string" && /^prod_[A-Za-z0-9]+$/.test(value.trim());
}

function isStripePriceId(value: unknown): value is string {
  return typeof value === "string" && /^price_[A-Za-z0-9]+$/.test(value.trim());
}

/**
 * Supabase is the source of truth for product rows, but older sync runs may
 * have left `images` empty while the linked Stripe Product still has images.
 * Enrich only those rows, and degrade to the DB value if Stripe is unavailable.
 */
export async function getActiveStripeProductIds(): Promise<Set<string> | null> {
  if (!getStripeSecretKey()) return null;
  try {
    const products = await listAllActiveProducts(getStripe());
    return new Set(products.map((product) => product.id));
  } catch (error) {
    console.warn("[catalog] Stripe active product verification unavailable; keeping database publication state", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Keep linked Stripe Product metadata as a fallback for older Supabase rows. */
async function getActiveStripeProductsById(): Promise<Map<string, Stripe.Product>> {
  if (!getStripeSecretKey()) return new Map();
  try {
    const products = await listAllActiveProducts(getStripe());
    return new Map(products.map((product) => [product.id, product]));
  } catch (error) {
    console.warn("[catalog] Stripe bilingual metadata fallback unavailable", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return new Map();
  }
}

export async function getStripeImagesForSupabaseRows(rows: SupabaseProductImageRow[]): Promise<Map<string, string[]>> {
  const missingSourceIds = new Set(
    rows
      .filter((row) => !Array.isArray(row.images) || row.images.length === 0)
      .map((row) => row.source_product_id)
      .filter((id): id is string => Boolean(id)),
  );
  if (!missingSourceIds.size || !getStripeSecretKey()) return new Map();

  try {
    const stripeProducts = await listAllActiveProducts(getStripe());
    return new Map(
      stripeProducts
        .filter((product) => missingSourceIds.has(product.id))
        .map((product) => [product.id, catalogImageUrls(product, productMetadata(product))]),
    );
  } catch (error) {
    console.warn("[catalog] Stripe image enrichment unavailable; keeping Supabase image fields", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return new Map();
  }
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
  const skuCategory = categorySlugFromMofuSku(metadata.mofu_sku);
  if (skuCategory) return skuCategory;
  const metadataCategory =
    metadata.category ?? metadata.category_slug ?? metadata.category_code ?? metadata["\u4e3b\u5206\u985e\u4ee3\u78bc"];
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
  const isDogProduct = /\u72d7|\u72ac|dog|canine/i.test(productText);
  const isCatProduct = /\u8c93|\u732b|cat|feline/i.test(productText);
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
  // generic value「\u72d7\u72d7\u98df\u54c1」is refined below so dry food and wet food never
  // share the new Header collections. This also prevents an import filename
  // such as "cat-litter-and-dry-food" from overriding a declared dry-food slug.
  if (fromMetadata && fromMetadata !== "\u72d7\u72d7\u98df\u54c1") return fromMetadata;

  const text = normalizeProductClassificationText(`${product.name ?? ""} ${product.description ?? ""} ${Object.values(metadata).join(" ")}`).toLowerCase();
  if (text.includes("\u6295\u85e5") || text.includes("\u9935\u85e5") || text.includes("pill")) {
    return "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df";
  }
  if (categorySlug === "cats") {
    if (/(\u8c93\u7802|litter|\u7802\u76c6|cat\s*box)/i.test(text)) return "\u8c93\u7802\u53ca\u8c93\u7802\u76c6";
    if (/(\u6500\u722c|\u8c93\u722c|cat\s*tree|cat\s*toy|\u73a9\u5177|toy)/i.test(text)) return "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd";
    if (FREEZE_DRY_TEXT_MARK.test(text)) return "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217";
    if (text.includes("\u7f50\u982d") || text.includes("\u7f50\u7f50") || text.includes("\u6fd5\u7ce7") || text.includes("\u6fd5\u98df")) return "\u8c93\u7f50\u7f50";
    if (text.includes("\u4e7e\u7ce7") || text.includes("\u98fc\u6599")) return "\u8c93\u4e7e\u7ce7";
    if (text.includes("\u5c0f\u98df") || text.includes("\u96f6\u98df") || text.includes("\u8106\u9905") || text.includes("\u8089\u6ce5")) return "\u8c93\u8c93\u5c0f\u98df";
  }
  if (categorySlug === "dogs") {
    if (/(\u5c3f\u588a|\u5c3f\u5e03|\u72d7\u5ec1|toilet|training\s*pad|pee\s*pad)/i.test(text)) return "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a";
    if (/(\u72d7\u73a9\u5177|dog\s*toy|\u73a9\u5177|toy)/i.test(text)) return "\u72d7\u72d7\u73a9\u5177";
    if (/(\u4e7e\u7ce7|\u72d7\u7ce7|kibble|dry\s*food)/i.test(text)) return "\u72d7\u72d7\u4e7e\u7ce7";
    if (FREEZE_DRY_TEXT_MARK.test(text)) return "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1";
    if (/(\u7f50\u982d|\u7f50\u7f50|\u6fd5\u7ce7|\u6fd5\u98df|wet\s*food|canned|\bcan\b|pouch)/i.test(text)) return "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7";
    if (text.includes("\u5c0f\u98df") || text.includes("\u96f6\u98df") || text.includes("\u8089\u689d") || text.includes("\u8089\u5377") || text.includes("\u8089\u7247") || text.includes("\u8089\u4e7e") || text.includes("\u8089\u7c92") || text.includes("\u9e7f\u8089") || text.includes("\u7d2b\u85af") || /treat|snack|jerky|sweet\s*potato/i.test(text)) return "\u72d7\u72d7\u5c0f\u98df";
    return "\u72d7\u72d7\u98df\u54c1";
  }
  return undefined;
}

function snackSeriesFromProduct(
  product: Stripe.Product,
  categorySlug: string,
  subcategory: ProductSubcategory | undefined,
): CatSnackSeries | undefined {
  if (categorySlug !== "cats" || subcategory !== "\u8c93\u8c93\u5c0f\u98df") return undefined;
  const metadata = productMetadata(product);
  const explicit = [
    metadata.snackSeries,
    metadata.snack_series,
    metadata.series,
    metadata["\u5c0f\u98df\u7cfb\u5217"],
  ].find(Boolean)?.trim();
  const bySlug: Record<string, CatSnackSeries> = {
    natural: "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217",
    senior: "\u8001\u8c93\u96f6\u98df",
    hairball: "\u53bb\u6bdb\u7403\u914d\u65b9",
    kitten: "bb\u8c93\u96f6\u98df",
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
  if (/\u53bb\u6bdb\u7403|\u6bdb\u7389|hairball/i.test(text)) return "\u53bb\u6bdb\u7403\u914d\u65b9";
  if (/\u8001\u8c93|\u9ad8\u9f61|senior|11\s*\+|11\u6b72|14\u6b72/i.test(text)) return "\u8001\u8c93\u96f6\u98df";
  if (/bb\s*\u8c93|\u5e7c\u8c93|kitten|junior/i.test(text)) return "bb\u8c93\u96f6\u98df";
  if (/\u7121\u6dfb\u52a0|\u5929\u7136|natural|no[- ]?additive/i.test(text)) return "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217";
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

const CJK_TEXT_RE = /[\u3400-\u9fff]/;

function englishSafeText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim() ?? "";
  return normalized && !CJK_TEXT_RE.test(normalized) ? normalized : fallback;
}

function bestPartnerChineseName(value: string, supplierBrand: string | null | undefined, sourceValue?: string | null): string {
  const source = /^\u65e5\u672c\u7522\u5929\u7136\u5bf5\u7269\u98df\u54c1｜Best Partner \u5546\u54c1 \d+$/.test(value.trim())
    ? sourceValue?.trim() || ""
    : value;
  if (supplierBrand !== "Best Partner" && source === value) return value;
  const name = (source.replace(/[　]/g, " ").split(/[｜|]/).at(-1) || source)
    .replace(/^\u65e5\u672c(?:\u539f\u88dd|\u76f4\u9001|\u88fd\u54c1?)\s*/i, "")
    .replace(/^Best Partner\s*/i, "")
    .replace(/^\u5929\u7136\u5bf5\u7269(?:\u96f6\u98df|\u98df\u54c1|\u7528\u54c1)\s*[：:]?\s*/i, "")
    .trim();
  const size = name.match(/(?:\s|^)([SML]|ＬＬ|Ｌ|Ｍ|Ｓ)(?:\s|$)/i)?.[1];
  const sizeLabel = size ? `（${size.replace("Ｌ", "L").replace("Ｍ", "M").replace("Ｓ", "S")}）` : "";
  if (/ハーネス/i.test(name)) return `\u5f37\u97cc\u900f\u6c23\u9632\u66b4\u885d\u80f8\u80cc\u5e36${sizeLabel}`;
  if (/リード/i.test(name)) return `\u5f37\u97cc\u9632\u66b4\u885d\u727d\u5f15\u5e36${sizeLabel}`;
  if (/カラー/i.test(name)) return `\u96d9\u8272\u534a\u93c8\u9632\u66b4\u885d\u9838\u5708${sizeLabel}`;
  const translated = name
    .replace(/\u732bの?/g, "\u8c93\u7528 ").replace(/\u5869\u7121\u6dfb\u52a0/g, "\u7121\u9e7d\u6dfb\u52a0")
    .replace(/まぐろ|マグロ/g, "\u91d1\u69cd\u9b5a").replace(/かつお/g, "\u67f4\u9b5a")
    .replace(/ささみ/g, "\u96de\u80f8\u8089").replace(/\u9d8f/g, "\u96de")
    .replace(/にぼし/g, "\u5c0f\u9b5a\u4e7e").replace(/きびなご/g, "\u4e01\u9999\u9b5a")
    .replace(/わかさぎ|ひめたら/g, "\u59ec\u9c48\u9b5a").replace(/スライス/g, "\u8584\u7247")
    .replace(/フレーク/g, "\u8089\u9b06").replace(/ふりかけ/g, "\u62cc\u98ef\u7c89")
    .replace(/ちっぷす/g, "\u8106\u7247").replace(/キューブ/g, "\u7c92")
    .replace(/スティック/g, "\u68d2").replace(/\s+/g, " ").trim();
  return translated || name || "\u672a\u547d\u540d\u7522\u54c1";
}

function enforceEnglishCatalogProducts(products: readonly Product[]): Product[] {
  return products.map((product) => {
    const description = product.description
      ? {
          ...product.description,
          en: resolveEnglishProductDescription({
          id: product.id,
          name: product.name.zh,
          description: product.description.zh,
          descriptionEn: product.description.en,
          }),
        }
      : undefined;
    return {
      ...product,
      name: {
        ...product.name,
        en: resolveEnglishProductName({
          id: product.id,
          name: product.name.zh,
          nameEn: product.name.en,
        }),
      },
      ...(description ? { description } : {}),
      ...(product.texture
        ? { texture: { ...product.texture, en: englishSafeText(product.texture.en, "") } }
        : {}),
      ...(product.availability
        ? { availability: { ...product.availability, en: englishSafeText(product.availability.en, "") } }
        : {}),
      ...(product.specs
        ? { specs: product.specs.map((spec) => ({ ...spec, en: englishSafeText(spec.en, "") })) }
        : {}),
      ...(product.variants
        ? {
            variants: product.variants.map((variant) => ({
              ...variant,
              label: { ...variant.label, en: englishSafeText(variant.label.en, "Product option") },
              ...(variant.unitLabel
                ? { unitLabel: { ...variant.unitLabel, en: englishSafeText(variant.unitLabel.en, "Unit") } }
                : {}),
            })),
          }
        : {}),
    };
  });
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
  return { zh: zh || en, en: englishSafeText(en, "") };
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
    "\u898f\u683c",
    "\u4e2d\u6587\u898f\u683c",
  ]);
  const enValue = firstMetadataValue(metadata, [
    "specs_en",
    "spec_en",
    "specifications_en",
    "specs.en",
    "specifications.en",
    "\u82f1\u6587\u898f\u683c",
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
  return !/\u7f3a\u8ca8|\u7f3a\u8d27|out\s*of\s*stock|sold\s*out/i.test(availability);
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
      const variantLabelZh = price.metadata.variant_label_zh || (isGeneralChoice ? "\u9078\u9805" : `${packCount}\u7f50\u88dd`);
      const variantLabelEn = price.metadata.variant_label_en || (isGeneralChoice ? "Option" : `${packCount} Cans`);
      const variantImage = isUsableCatalogImage(price.metadata.variant_image_url)
        ? price.metadata.variant_image_url.trim()
        : undefined;
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
                zh: `\u6bcf\u7f50 HK$${perCan.toFixed(2)}`,
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
  const metadataName = bilingualMetadataValue(
    metadata,
    ["name_zh", "title_zh", "product_name_zh", "name.zh", "title.zh", "\u4e2d\u6587\u540d\u7a31", "\u4e2d\u6587\u5546\u54c1\u540d\u7a31"],
    ["name_en", "title_en", "product_name_en", "name.en", "title.en", "\u82f1\u6587\u540d\u7a31", "\u82f1\u6587\u5546\u54c1\u540d\u7a31"],
    "",
  );
  const localizedName = metadataName
      ? {
          zh: metadataName.zh,
          en: resolveEnglishProductName({ id, name: product.name, nameEn: metadataName.en }),
        }
      : {
          zh: product.name ?? "",
          en: resolveEnglishProductName({ id, name: product.name }),
        };
  const metadataDescription = bilingualMetadataValue(
    metadata,
    ["description_zh", "detail_zh", "intro_zh", "description.zh", "detail.zh", "intro.zh", "\u4e2d\u6587\u63cf\u8ff0", "\u4e2d\u6587\u4ecb\u7d39"],
    ["description_en", "detail_en", "intro_en", "description.en", "detail.en", "intro.en", "\u82f1\u6587\u63cf\u8ff0", "\u82f1\u6587\u4ecb\u7d39"],
    "",
  );
  const localizedDescription = metadataDescription
      ? {
          zh: metadataDescription.zh,
          en: resolveEnglishProductDescription({
            id,
            name: product.name,
            description: product.description,
            descriptionEn: metadataDescription.en,
          }),
        }
      : undefined;
  const localizedTexture = bilingualMetadataValue(
    metadata,
    ["texture_zh", "texture.zh", "mouthfeel_zh", "\u53e3\u611f", "\u53e3\u611f\u7279\u9ede"],
    ["texture_en", "texture.en", "mouthfeel_en", "\u53e3\u611f\u82f1\u6587"],
    "",
  );
  const localizedAvailability = bilingualMetadataValue(
    metadata,
    ["availability_display_zh", "stock_status_zh", "\u898f\u683c\u72c0\u614b"],
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

  const products = mergeVariantProducts(uniqueProductsByStorefrontIdentity(
    stripeProducts
      .filter((product) => pricesByProductId.has(product.id))
      .map((product) => stripeProductToCatalogProduct(product, pricesByProductId))
      .filter((product): product is Product => product !== null),
  )).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));

  if (products.length === 0) {
    throw new Error("Stripe catalog has no active HKD products");
  }
  return { products: enforceEnglishCatalogProducts(products), categories: [], brands: [], source: "stripe", matchedRecords: products.length };
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
  const supabase = getSupabasePublic() || getSupabaseAdmin();
  if (!supabase) {
    console.warn("[catalog] Supabase is not configured; returning an empty catalog");
    return null;
  }

  try {
    const [categoryResult, productResult, brandResult] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase
        .from("products")
        // Verified against the live raw row: `images` is the product image
        // column and contains the ordered image URL array used by each card.
        .select("id,name,name_zh,name_en,price,original_price,stock,stock_quantity,description,description_zh,description_en,images,category_id,brand_id,brand,supplier_brand,product_spec,pet_species,feature_tags,cost_price_rmb,created_at,is_published,mofu_sku,status,source_product_id,source_price_id")
        .eq("is_published", true)
        .eq("status", "published")
        .gt("stock", 0)
        .order("created_at", { ascending: false }),
      supabase.from("brands").select("id,name,slug,logo_url,description,sort_order,is_active,created_at").eq("is_active", true).order("sort_order", { ascending: true }),
    ]);
    if (categoryResult.error || productResult.error || brandResult.error) {
      console.error("[catalog] Supabase product query returned an error", {
        categoryError: categoryResult.error?.message,
        categoryCode: categoryResult.error?.code,
        productError: productResult.error?.message,
        productCode: productResult.error?.code,
        brandError: brandResult.error?.message,
      });
      return null;
    }
    const rawCategoryTree = buildCategoryTree(categoryResult.data || []);
    const adminSupabase = getSupabaseAdmin();
    const localizedCategoryResult = adminSupabase
      ? await adminSupabase
        .from("store_settings")
        .select("value")
        .eq("key", CATEGORY_LOCALIZATIONS_SETTING_KEY)
        .maybeSingle()
      : null;
    const categoryTree = applyCategoryLocalizations(
      rawCategoryTree,
      parseCategoryLocalizations(localizedCategoryResult?.data?.value),
    );
    const localizedProductResult = adminSupabase
      ? await adminSupabase
        .from("store_settings")
        .select("value")
        .eq("key", PRODUCT_LOCALIZATIONS_SETTING_KEY)
        .maybeSingle()
      : null;
    const productLocalizations = parseProductLocalizations(localizedProductResult?.data?.value);
    if (!productResult.data?.length) {
      console.warn("[catalog] Supabase product query succeeded but returned zero rows", {
        categories: categoryResult.data?.length ?? 0,
      });
      return { products: [], categories: categoryTree, brands: brandResult.data || [], source: "supabase", matchedRecords: 0 };
    }
    const categoriesById = new Map(flattenCategoryTree(categoryTree).map((category) => [category.id, category]));
    const stripeImages = await getStripeImagesForSupabaseRows(productResult.data || []);
    const stripeProductsById = await getActiveStripeProductsById();
    let pricesByProductId = new Map<string, StripePriceRecord[]>();
    let pricesById = new Map<string, StripePriceRecord>();
    let stripePricesAvailable = false;
    if (getStripeSecretKey()) {
      try {
        pricesByProductId = await listAllActiveHkdPrices(getStripe());
        pricesById = new Map(Array.from(pricesByProductId.values()).flat().map((price) => [price.id, price]));
        stripePricesAvailable = true;
      } catch (error) {
        console.warn("[catalog] Stripe HKD price lookup unavailable; stored source_price_id values will only be used as a last resort", {
          errorName: error instanceof Error ? error.name : "unknown",
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }
    const mappedProducts: Product[] = productResult.data
      .map((row: { id: string; created_at?: string | null; category_id?: string | null; mofu_sku?: string | null; name?: string | null; name_zh?: string | null; name_en?: string | null; images?: unknown; image?: unknown; image_url?: unknown; price?: number | string | null; original_price?: number | string | null; stock?: number | string | null; description?: string | null; description_zh?: string | null; description_en?: string | null; supplier_brand?: string | null; source_product_id?: string | null; source_price_id?: string | null; feature_tags?: unknown; pet_species?: string | null }) => {
      const sourceProductId = row.source_product_id?.trim() || "";
      const stripeMetadata = sourceProductId
        ? stripeProductsById.get(sourceProductId)?.metadata ?? {}
        : {};
      const stripeName = bilingualMetadataValue(
        stripeMetadata,
        ["name_zh", "title_zh", "product_name_zh", "name.zh", "title.zh", "\u4e2d\u6587\u540d\u7a31", "\u4e2d\u6587\u5546\u54c1\u540d\u7a31"],
        ["name_en", "title_en", "product_name_en", "name.en", "title.en", "\u82f1\u6587\u540d\u7a31", "\u82f1\u6587\u5546\u54c1\u540d\u7a31"],
        "",
      );
      const stripeDescription = bilingualMetadataValue(
        stripeMetadata,
        ["description_zh", "detail_zh", "intro_zh", "description.zh", "detail.zh", "intro.zh", "\u4e2d\u6587\u63cf\u8ff0", "\u4e2d\u6587\u4ecb\u7d39"],
        ["description_en", "detail_en", "intro_en", "description.en", "detail.en", "intro.en", "\u82f1\u6587\u63cf\u8ff0", "\u82f1\u6587\u4ecb\u7d39"],
        "",
      );
      const productLocalization = productLocalizations[String(row.id)];
    const storedPriceId = isStripePriceId(row.source_price_id) ? row.source_price_id.trim() : undefined;
    const priceRecords = sourceProductId ? pricesByProductId.get(sourceProductId) ?? [] : [];
    const verifiedPriceRecord = storedPriceId ? priceRecords.find((price) => price.id === storedPriceId) : undefined;
    const resolvedPriceRecord = verifiedPriceRecord ?? priceRecords[0] ?? (storedPriceId ? pricesById.get(storedPriceId) : undefined);
    const resolvedPriceId = resolvedPriceRecord?.id ?? (!stripePricesAvailable ? storedPriceId : undefined);
    if (!resolvedPriceId) {
      console.warn("[catalog] Supabase product has no resolved Stripe HKD Price; keeping it visible with its database price", {
        databaseProductId: row.id,
        sourceProductId: sourceProductId || null,
        sourcePriceId: storedPriceId || null,
      });
    }
    const dbImages = databaseProductImageUrls(row);
    const images = dbImages.length ? dbImages : stripeImages.get(row.source_product_id ?? "") ?? [];
    // Resolve the database category relation through the tree. A child category
    // maps to its root collection plus its canonical child collection name.
    const categoryAssignment = resolveManagedCategoryAssignment(row.category_id, categoriesById);
    const categorySlug = categoryAssignment.categorySlug;
    const subcategory = categoryAssignment.subcategory;
    const databaseNameZh = bestPartnerChineseName(String(row.name_zh || row.name || "\u672a\u547d\u540d\u7522\u54c1"), row.supplier_brand, row.name);
    const databaseNameEn = resolveEnglishProductName({
      id: row.id,
      sourceId: row.source_product_id,
      name: row.name,
      nameEn: productLocalization?.name_en || row.name_en || stripeName?.en,
    });
    const databaseDescriptionZh = row.description_zh || row.description;
    const databaseDescriptionEn = resolveEnglishProductDescription({
      id: row.id,
      sourceId: row.source_product_id,
      name: row.name,
      description: row.description,
      descriptionEn: productLocalization?.description_en || row.description_en || stripeDescription?.en,
    });
    const rawSourceName = String(row.name || "").trim();
    const nameJa = ["name_ja", "name_jp", "product_name_ja", "\u539f\u5546\u54c1\u540d", "\u5546\u54c1\u540d_\u65e5\u672c\u8a9e", "source_name_ja"]
      .map((key) => stripeMetadata[key]?.trim()).find(Boolean)
      || (/[\u3040-\u30ff]/.test(rawSourceName) ? rawSourceName : undefined);
    const descriptionJa = ["description_ja", "detail_ja", "intro_ja", "\u65e5\u672c\u8a9e\u8aac\u660e", "\u539f\u6587\u8aac\u660e"]
      .map((key) => stripeMetadata[key]?.trim()).find(Boolean);
    return {
      id: String(row.id),
      ...(isStripeProductId(sourceProductId) ? { stripeProductId: sourceProductId } : {}),
      createdAt: row.created_at ? Math.floor(new Date(row.created_at).getTime() / 1000) : undefined,
      categoryId: row.category_id ? String(row.category_id) : undefined,
      brandId: (row as Record<string, unknown>).brand_id ? String((row as Record<string, unknown>).brand_id) : undefined,
      brandName: (row as Record<string, unknown>).brand ? String((row as Record<string, unknown>).brand) : undefined,
      categorySlug,
      ...(subcategory ? { subcategory } : {}),
      image: images[0] || CATALOG_IMAGE_FALLBACK,
      ...(images.length ? { images } : {}),
      name: {
        zh: databaseNameZh,
        ...(productLocalization?.name_ja ? { ja: productLocalization.name_ja } : {}),
        en: databaseNameEn,
      },
      ...(resolvedPriceId ? { priceId: resolvedPriceId } : {}),
      price: resolvedPriceRecord?.amount ?? Number(row.price || 0),
      ...(row.original_price ? { originalPrice: Number(row.original_price) } : {}),
      inStock: Number(row.stock || 0) > 0,
      description: databaseDescriptionZh || databaseDescriptionEn
        ? {
            zh: String(databaseDescriptionZh || "\u5546\u54c1\u8aaa\u660e\u7a0d\u5f8c\u66f4\u65b0。"),
            en: databaseDescriptionEn,
          }
        : undefined,
      metadata: {
        category: categorySlug,
        ...(nameJa ? { name_ja: nameJa } : {}),
        ...(descriptionJa ? { description_ja: descriptionJa } : {}),
        ...(row.mofu_sku ? { mofu_sku: String(row.mofu_sku) } : {}),
      },
      tags: [
        categorySlug,
        ...(subcategory ? [subcategory] : []),
        ...(Array.isArray(row.feature_tags) ? row.feature_tags.filter((tag): tag is string => typeof tag === "string") : []),
        ...(row.pet_species ? [String(row.pet_species)] : []),
        ...(row.mofu_sku ? [String(row.mofu_sku)] : []),
      ],
      icon: iconForCategory(categorySlug),
    } satisfies Product;
      });
    const products = mergeVariantProducts(uniqueProductsByStorefrontIdentity(mappedProducts));
    return { products: enforceEnglishCatalogProducts(products), categories: categoryTree, brands: brandResult.data || [], source: "supabase", matchedRecords: products.length };
  } catch (error) {
    console.error("[catalog] Supabase product fetch threw after retry handling", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const managedCatalog = await fetchCatalogFromSupabase();
    if (managedCatalog) return managedCatalog;
    return {
      products: [],
      categories: [],
      brands: [],
      source: "supabase",
      matchedRecords: 0,
    };
  } catch (error) {
    console.error(
      "Storefront catalog fetch failed",
      stripeErrorDetails(error),
    );
    return {
      products: [],
      categories: [],
      brands: [],
      source: "supabase",
      matchedRecords: 0,
    };
  }
}
