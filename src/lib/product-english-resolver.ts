import { GENERATED_PRODUCT_TRANSLATIONS } from "@/lib/generated-product-translations";

export type ProductEnglishSource = {
  id?: string | null;
  sourceId?: string | null;
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
};

type ProductEnglishTranslation = {
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
};

const CJK_TEXT_RE = /[\u3400-\u9fff]/;
const ENGLISH_PRODUCT_FALLBACK = "Japanese Pet Product";
const ENGLISH_DESCRIPTION_FALLBACK = "Product details coming soon.";

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function isEnglishSafeCatalogText(value: string | null | undefined): boolean {
  const normalized = clean(value);
  return Boolean(normalized) && !CJK_TEXT_RE.test(normalized);
}

function normalizedProductName(value: string | null | undefined): string {
  return clean(value)
    .toLocaleLowerCase("en")
    .replace(/[\s\-‐‑‒–—_·・,，.。:：;；/／()（）\[\]{}「」『』"'`~!！?？+×x*]+/g, "");
}

const translationByProductName = new Map<string, ProductEnglishTranslation>();
for (const translation of Object.values(GENERATED_PRODUCT_TRANSLATIONS)) {
  const key = normalizedProductName(translation.name_zh);
  if (key) translationByProductName.set(key, translation);
}

function translatedRecord(source: ProductEnglishSource): ProductEnglishTranslation | undefined {
  const id = clean(source.id);
  const sourceId = clean(source.sourceId);
  const direct = (sourceId && GENERATED_PRODUCT_TRANSLATIONS[sourceId])
    || (id && GENERATED_PRODUCT_TRANSLATIONS[id]);
  if (direct) return direct;
  return translationByProductName.get(normalizedProductName(source.name));
}

/**
 * Resolves a product name for EN mode. Explicit English source values take
 * precedence, followed by the generated Google Sheet/database name dictionary.
 * Any Chinese-only or missing input becomes a stable English-safe fallback.
 */
export function resolveEnglishProductName(source: ProductEnglishSource): string {
  const explicit = clean(source.nameEn);
  if (isEnglishSafeCatalogText(explicit)) return explicit;

  const translated = clean(translatedRecord(source)?.name_en);
  if (isEnglishSafeCatalogText(translated)) return translated;

  const rawName = clean(source.name);
  if (isEnglishSafeCatalogText(rawName)) return rawName;

  const latinFragments = rawName
    .replace(/[\u3400-\u9fff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return latinFragments || ENGLISH_PRODUCT_FALLBACK;
}

/**
 * Resolves product description copy for EN mode without ever returning a
 * Chinese source value. The generated dictionary provides the default mapping
 * for Google Sheet and legacy database rows.
 */
export function resolveEnglishProductDescription(source: ProductEnglishSource): string {
  const explicit = clean(source.descriptionEn);
  if (isEnglishSafeCatalogText(explicit)) return explicit;

  const translated = clean(translatedRecord(source)?.description_en);
  if (isEnglishSafeCatalogText(translated)) return translated;

  const rawDescription = clean(source.description);
  if (isEnglishSafeCatalogText(rawDescription)) return rawDescription;

  return ENGLISH_DESCRIPTION_FALLBACK;
}

export function resolveGeneratedProductTranslation(source: ProductEnglishSource): ProductEnglishTranslation | undefined {
  return translatedRecord(source);
}
