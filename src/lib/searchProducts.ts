import { catBreedsData } from "@/lib/catBreeds";
import type { Product } from "@/lib/products";

export type ProductSearchHit = Product & {
  /** Ranking score — higher is a closer match. */
  score: number;
};

const BREED_BY_SLUG = new Map(
  catBreedsData.map((breed) => [breed.slug, breed] as const),
);

/** Lowercase + strip common punctuation/spaces for fuzzy substring match. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000\-_/·・,，.。:：;；()（）【】\[\]「」『』]/g, "");
}

function fieldScore(haystack: string | undefined, needle: string, weight: number): number {
  if (!haystack || !needle) return 0;
  const normalized = normalizeSearchText(haystack);
  if (!normalized.includes(needle)) return 0;
  if (normalized === needle) return weight * 2;
  if (normalized.startsWith(needle)) return weight + Math.floor(weight / 2);
  return weight;
}

/**
 * Instant fuzzy search over the complete, classified storefront catalog.
 * Every result retains the unified Product shape consumed by product cards,
 * product details, cart, checkout, and server-side price validation.
 */
export function buildSearchIndex(
  products: readonly Product[] = [],
): ProductSearchHit[] {
  return products.map((product) => ({ ...product, score: 0 }));
}

export function searchProducts(
  query: string,
  limit = 12,
  products: readonly Product[] = [],
): ProductSearchHit[] {
  const needle = normalizeSearchText(query.trim());
  if (!needle) return [];

  const ranked: ProductSearchHit[] = [];

  for (const product of products) {
    let score = 0;
    score += fieldScore(product.id, needle, 14);
    score += fieldScore(product.name.zh, needle, 13);
    score += fieldScore(product.name.en, needle, 13);
    score += fieldScore(product.description?.zh, needle, 8);
    score += fieldScore(product.description?.en, needle, 8);
    score += fieldScore(product.categorySlug, needle, 7);
    score += fieldScore(product.subcategory, needle, 9);
    score += fieldScore(product.brand, needle, 10);
    score += fieldScore(product.vendor, needle, 9);
    score += fieldScore(product.series?.zh, needle, 9);
    score += fieldScore(product.series?.en, needle, 9);
    score += fieldScore(product.snackSeries, needle, 8);
    score += fieldScore(product.productType, needle, 8);
    score += fieldScore(product.handle, needle, 5);
    score += fieldScore(product.sourceCategory, needle, 7);

    for (const tag of product.tags ?? []) {
      score += fieldScore(tag, needle, 7);
    }

    for (const spec of product.specs ?? []) {
      score += fieldScore(spec.zh, needle, 6);
      score += fieldScore(spec.en, needle, 6);
    }

    for (const slug of product.recommendedBreeds ?? []) {
      score += fieldScore(slug, needle, 6);
      score += fieldScore(slug.replace(/-/g, " "), needle, 6);
      const breed = BREED_BY_SLUG.get(slug);
      if (breed) {
        score += fieldScore(breed.name, needle, 7);
        score += fieldScore(breed.nameEn, needle, 7);
      }
    }

    if (score > 0) ranked.push({ ...product, score });
  }

  ranked.sort(
    (a, b) => b.score - a.score || a.name.zh.localeCompare(b.name.zh, "zh-HK"),
  );
  return ranked.slice(0, Math.max(0, limit));
}

/** @deprecated Use searchProducts; retained for source compatibility. */
export const searchWtJapanProducts = searchProducts;
