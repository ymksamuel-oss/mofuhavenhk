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

/** Lowercase + strip common punctuation/spaces for fuzzy substring match. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000\-_/·・,，.。:：;；()（）【】\[\]「」『』]/g, "");
}

function fieldScore(haystack: string, needle: string, weight: number): number {
  if (!haystack || !needle) return 0;
  const h = normalizeSearchText(haystack);
  const n = needle;
  if (!h.includes(n)) return 0;
  // Prefer matches near the start / exact-ish hits.
  if (h === n) return weight * 2;
  if (h.startsWith(n)) return weight + Math.floor(weight / 2);
  return weight;
}

/**
 * Instant fuzzy filter over WT Japan catalog (`@/data/productsData`).
 * Matches title, description, tags, category, vendor, and related breed names.
 * Query and fields are lowercased for case-insensitive substring matching
 * (e.g. 「罐罐」「罐」「CIAO」 → CIAO 貓罐罐).
 */
export function searchWtJapanProducts(
  query: string,
  limit = 12,
): ProductSearchHit[] {
  const needle = normalizeSearchText(query.trim());
  if (!needle) return [];

  const ranked: ProductSearchHit[] = [];

  for (const product of WT_JAPAN_PRODUCTS) {
    let score = 0;
    score += fieldScore(product.title, needle, 12);
    score += fieldScore(product.description, needle, 8);
    score += fieldScore(product.vendor, needle, 9);
    score += fieldScore(product.productType, needle, 7);
    score += fieldScore(product.subcategory, needle, 8);
    score += fieldScore(product.category, needle, 8);
    score += fieldScore(product.categorySlug, needle, 6);
    score += fieldScore(product.handle, needle, 4);

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

    // Fallback for short / broad terms like 「罐」「糧」「魚」:
    // search against a single combined string so one-character queries
    // still surface matching products immediately.
    if (score === 0 && needle.length <= 2) {
      const combined = normalizeSearchText(
        [
          product.title,
          product.description,
          product.vendor,
          product.productType,
          product.subcategory,
          product.category,
          product.handle,
          ...product.tags,
        ].join(" "),
      );
      if (combined.includes(needle)) {
        score = 5;
      }
    }

    if (score > 0) {
      ranked.push({ ...product, score });
    }
  }

  ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-HK"));
  return ranked.slice(0, limit);
}
