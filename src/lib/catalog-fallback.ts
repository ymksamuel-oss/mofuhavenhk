import "server-only";

import snapshot from "@/data/catalog-fallback.json";
import { canonicalCategorySlug } from "@/lib/categories";
import { categoryIconForSlug, buildCategoryTree } from "@/lib/store-categories";
import { normalizeProductImageUrl } from "@/lib/catalog-images";
import type { Product } from "@/lib/products";
import type { CatalogSnapshot } from "@/lib/catalog-server";

type SnapshotProduct = (typeof snapshot.products)[number];

const CATALOG_IMAGE_FALLBACK = "catalog-placeholder";
const BULK_SKU = /^MOFU-BUNDLE-BULK-(\d{13})-(6|9|12)$/;

function asMoney(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function categoryForSnapshot(raw: string | null | undefined, sku: string, petSpecies: string | null | undefined): string {
  const normalized = canonicalCategorySlug(raw);
  if (normalized) return normalized;
  // Legacy bulk rows have no category relation; inherit the exact GTIN product category.
  const bulk = sku.match(BULK_SKU);
  if (bulk) {
    const baseProduct = (snapshot.products as SnapshotProduct[]).find((product) => String(product.mofu_sku ?? "").trim() === bulk[1]);
    const baseCategory = canonicalCategorySlug(baseProduct?.category_slug);
    if (baseCategory) return baseCategory;
  }
  const speciesCategory = canonicalCategorySlug(petSpecies);
  if (speciesCategory === "cats" || speciesCategory === "dogs") return speciesCategory;
  return "dogs";
}

function mapSnapshotProduct(row: SnapshotProduct): Product {
  const sku = String(row.mofu_sku ?? "").trim();
  const categorySlug = categoryForSnapshot(row.category_slug, sku, row.pet_species);
  const imageUrl = normalizeProductImageUrl(row.image_url);
  const bulk = sku.match(BULK_SKU);
  const tags = Array.isArray(row.feature_tags)
    ? row.feature_tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const nameZh = String(row.name_zh || row.name || "未命名產品").trim();
  const nameEn = String(row.name_en || row.name || nameZh).trim();
  const price = asMoney(row.price);
  const originalPrice = asMoney(row.original_price);

  return {
    id: String(row.id),
    mofuSku: sku || undefined,
    categorySlug,
    image: imageUrl ?? CATALOG_IMAGE_FALLBACK,
    ...(imageUrl ? { images: [imageUrl] } : {}),
    name: { zh: nameZh, en: nameEn },
    name_zh: nameZh,
    name_en: nameEn,
    price,
    ...(bulk && originalPrice > price ? { originalPrice } : {}),
    inStock: Number(row.stock) > 0,
    ...(row.product_spec ? { productSpec: String(row.product_spec) } : {}),
    ...(row.supplier_brand ? { brand: String(row.supplier_brand), brandName: String(row.supplier_brand) } : {}),
    ...(row.pet_species ? { productType: String(row.pet_species) } : {}),
    metadata: {
      category: categorySlug,
      ...(sku ? { mofu_sku: sku } : {}),
      catalog_fallback: "true",
      ...(bulk ? { bulk_group: `bulk-${bulk[1]}`, bulk_pack_count: bulk[2] } : {}),
    },
    tags: Array.from(new Set([
      categorySlug,
      ...tags,
      ...(row.pet_species ? [String(row.pet_species)] : []),
      ...(sku ? [sku] : []),
    ])),
    icon: categoryIconForSlug(categorySlug),
  };
}

/**
 * Bundled public catalog snapshot used as the primary storefront source.
 */
export function getCatalogFallbackSnapshot(): CatalogSnapshot {
  const products = (snapshot.products as SnapshotProduct[]).map(mapSnapshotProduct);
  return {
    products,
    categories: buildCategoryTree(snapshot.categories),
    brands: [],
    source: "static",
    matchedRecords: products.length,
  };
}
