import { catBreedsData } from "@/lib/catBreeds";
import {
  WT_JAPAN_PRODUCTS,
  type WtJapanProduct,
} from "@/data/productsData";

export type ProductSearchHit = WtJapanProduct & {
  /** Ranking score — higher is a closer match. */
  score: number;
};

const BREED_BY_SLUG = new Map(
  catBreedsData.map((breed) => [breed.slug, breed] as const),
);

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000\-_/·・,，.。:：;；()（）【】\[\]「」『』]/g, "");
}

function fieldScore(haystack: string, needle: string, weight: number): number {
  if (!haystack || !needle) return 0;
  const h = normalize(haystack);
  const n = needle;
  if (!h.includes(n)) return 0;
  // Prefer matches near the start / exact-ish hits.
  if (h === n) return weight * 2;
  if (h.startsWith(n)) return weight + Math.floor(weight / 2);
  return weight;
}

/**
 * Instant fuzzy filter over WT Japan catalog (`@/data/productsData`).
 * Matches title, vendor, selling tags, and recommended breed slugs / names.
 */
export function searchWtJapanProducts(
  query: string,
  limit = 5,
): ProductSearchHit[] {
  const needle = normalize(query.trim());
  if (!needle) return [];

  const ranked: ProductSearchHit[] = [];

  for (const product of WT_JAPAN_PRODUCTS) {
    let score = 0;
    score += fieldScore(product.title, needle, 12);
    score += fieldScore(product.vendor, needle, 9);
    score += fieldScore(product.productType, needle, 4);

    for (const tag of product.tags) {
      score += fieldScore(tag, needle, 7);
    }

    for (const slug of product.recommendedBreeds) {
      score += fieldScore(slug, needle, 5);
      score += fieldScore(slug.replace(/-/g, " "), needle, 5);
      const breed = BREED_BY_SLUG.get(slug);
      if (breed) {
        score += fieldScore(breed.name, needle, 6);
        score += fieldScore(breed.nameEn, needle, 6);
      }
    }

    if (score > 0) {
      ranked.push({ ...product, score });
    }
  }

  ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-HK"));
  return ranked.slice(0, limit);
}
