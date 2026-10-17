const LEGACY_PRODUCT_IMAGE_PATH = /mofuhavenhk\.com\/assets\/product\//i;
const MAX_CATALOG_IMAGES = 8;

/** Trim bad catalog input and resolve relative/local paths to deploy-safe URLs. */
export function normalizeProductImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (
    !candidate ||
    candidate === "catalog-placeholder" ||
    LEGACY_PRODUCT_IMAGE_PATH.test(candidate) ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
      return null;
    }
  }

  if (candidate.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(candidate)) return null;
  const path = candidate.replace(/^(?:\.\/)+/, "").replace(/^public\//i, "");
  try {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, "https://mofuhaven.invalid");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Preserve the explicitly curated sequence; filenames cannot reliably identify a hero image. */
export function orderProductImages(images: string[]): string[] {
  return Array.from(new Set(images));
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
      .map(normalizeProductImageUrl)
      .filter((image): image is string => Boolean(image)),
  )).slice(0, MAX_CATALOG_IMAGES);
}
