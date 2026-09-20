import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

const CJK_RE = /[\u3400-\u9fff]/;
const BUNDLE_NAMES: Record<string, string> = {
  "MOFU-BUNDLE-PICKY-01": "[Limited Deal • Save $72] Picky Eater Rescue 4-Piece Bundle",
  "MOFU-BUNDLE-DENTAL-02": "[Limited Deal • Save $61] Power Chewer Dental Care 3-Piece Bundle",
  "MOFU-BUNDLE-SEAFOOD-03": "[Limited Deal • Save $72] Deep-Sea Omega-3 Fish Trio Bundle",
  "MOFU-BUNDLE-WALK-04": "[Limited Deal] Japanese Functional Walking Gear 3-Piece Bundle",
};

function skuFor(product: Product): string {
  return product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^MOFU-BUNDLE-/.test(tag))?.trim() || "";
}
function cleanName(value?: string): string {
  if (!value || CJK_RE.test(value)) return "";
  return (value.split(/[|]/).at(-1) || value).replace(/^\s*(?:Made in Japan|Japan-made|Best Partner)\s*/i, "").replace(/\s{2,}/g, " ").trim();
}
export function getJapaneseProductName(product: Product): string | undefined {
  const metadata = product.metadata ?? {};
  return ["name_ja", "name_jp", "japanese_name", "name_japanese", "product_name_ja", "product_name_jp"].map((key) => metadata[key]?.trim()).find((value) => value && !CJK_RE.test(value));
}
export function getLocalizedProductName(product: Product, _locale: Locale): string {
  const sku = skuFor(product);
  if (BUNDLE_NAMES[sku]) return BUNDLE_NAMES[sku];
  const metadata = product.metadata ?? {};
  const englishMetadata = ["name_en", "title_en", "product_name_en", "english_name"].map((key) => cleanName(metadata[key])).find(Boolean);
  const englishName = cleanName(product.name.en);
  return englishMetadata || englishName || `Japanese Pet Essential ${sku || product.id.slice(0, 8)}`;
}
export function getJapaneseProductSubtitle(product: Product): string { return getLocalizedProductName(product, "en"); }
export function getLocalizedProductDescription(product: Product, _locale: Locale): string | undefined {
  const metadata = product.metadata ?? {};
  const candidate = ["short_description_en", "feature_en", "selling_point_en"].map((key) => metadata[key]?.trim()).find(Boolean) || product.description?.en?.trim();
  return candidate && !CJK_RE.test(candidate) ? candidate : undefined;
}
export function getBilingualProductName(product: Product): string { return getLocalizedProductName(product, "en"); }
export function getBilingualProductNameParts(product: Product): { zh: string; ja?: string } { return { zh: getLocalizedProductName(product, "en") }; }
