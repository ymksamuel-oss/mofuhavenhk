const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;
const MAX_CATALOG_IMAGES = 8;

/** Prefer the verified Best Partner packaging image, then the close-up image. */
export function orderProductImages(images: string[]): string[] {
  const unique = Array.from(new Set(images));
  const officialPackaging = unique.filter((image) => /\/official-[^/]+-0\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(image));
  const officialCloseUp = unique.filter((image) => /\/official-[^/]+-1\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(image));
  const packaging = unique.filter((image) => /(?:-0|[_-](?:pack|package|packaging|front|main))(?:\.(?:jpg|jpeg|png|webp))(?:\?|$)/i.test(image));
  const closeUps = unique.filter((image) => /(?:-1|[_-](?:close[-_]?up|detail|back|nutrition))(?:\.(?:jpg|jpeg|png|webp))(?:\?|$)/i.test(image));
  const primary = [...officialPackaging, ...packaging].filter((image, index, values) => values.indexOf(image) === index);
  const secondary = [...officialCloseUp, ...closeUps].filter((image, index, values) => !primary.includes(image) && values.indexOf(image) === index);
  const remaining = unique.filter((image) => !primary.includes(image) && !secondary.includes(image));
  return [...primary, ...remaining, ...secondary];
}

function isUsableCatalogImage(value: string): boolean {
  if (!value || LEGACY_PRODUCT_IMAGE_PATH.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

function parseImageField(value: unknown): string[] {
  const values: unknown[] = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => {
    if (typeof item !== "string") return [];
    const trimmed = item.trim();
    if (!trimmed) return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parseImageField(parsed) : [trimmed];
    } catch {
      return trimmed.split(/[\r\n,|;]+/).map((candidate) => candidate.trim());
    }
  });
}

/**
 * Reads the existing Supabase product image columns without rewriting or
 * uploading assets. `images` remains the preferred multi-image field, while
 * `image` and `image_url` preserve older product rows.
 */
export function databaseProductImageUrls(row: {
  images?: unknown;
  image?: unknown;
  image_url?: unknown;
}): string[] {
  return orderProductImages(
    [row.images, row.image, row.image_url]
      .flatMap(parseImageField)
      .filter(isUsableCatalogImage),
  ).slice(0, MAX_CATALOG_IMAGES);
}
