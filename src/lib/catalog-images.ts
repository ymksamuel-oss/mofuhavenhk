const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;
const MAX_CATALOG_IMAGES = 8;

/** Preserve the explicitly curated sequence; filenames cannot reliably identify a hero image. */
export function orderProductImages(images: string[]): string[] {
  return Array.from(new Set(images));
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
  // The admin editor is the source of truth for deliberate image order. Do
  // not re-sort here, otherwise a saved cover image would silently change
  // again when the storefront reads the row.
  return Array.from(new Set(
    [row.images, row.image, row.image_url]
      .flatMap(parseImageField)
      .filter(isUsableCatalogImage),
  )).slice(0, MAX_CATALOG_IMAGES);
}
