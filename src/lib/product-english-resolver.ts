export type ProductEnglishSource = {
  id?: string | null;
  sourceId?: string | null;
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
};

const CJK_TEXT_RE = /[\u3400-\u9fff]/;
const ENGLISH_PRODUCT_FALLBACK = "Product name unavailable";
const ENGLISH_DESCRIPTION_FALLBACK = "Product details coming soon.";

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function isEnglishSafeCatalogText(value: string | null | undefined): boolean {
  const normalized = clean(value);
  return Boolean(normalized) && !CJK_TEXT_RE.test(normalized);
}

/**
 * Resolves EN text strictly from the managed catalog row or Stripe metadata.
 * No product-ID/name dictionary is bundled into the storefront.
 */
export function resolveEnglishProductName(source: ProductEnglishSource): string {
  const explicit = clean(source.nameEn);
  if (isEnglishSafeCatalogText(explicit)) return explicit;

  const rawName = clean(source.name);
  if (isEnglishSafeCatalogText(rawName)) return rawName;

  return ENGLISH_PRODUCT_FALLBACK;
}

/** Resolves EN description strictly from managed catalog data. */
export function resolveEnglishProductDescription(source: ProductEnglishSource): string {
  const explicit = clean(source.descriptionEn);
  if (isEnglishSafeCatalogText(explicit)) return explicit;

  const rawDescription = clean(source.description);
  if (isEnglishSafeCatalogText(rawDescription)) return rawDescription;

  return ENGLISH_DESCRIPTION_FALLBACK;
}

/** Retained as a compatibility API; managed catalog translations are row-owned. */
export function resolveGeneratedProductTranslation(): undefined {
  return undefined;
}
