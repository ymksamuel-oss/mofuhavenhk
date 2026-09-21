import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

const CJK_RE = /[\u3400-\u9fff]/;
const BUNDLE_NAMES: Record<string, { zh: string; en: string }> = {
  "MOFU-BUNDLE-PICKY-01": {
    zh: "【限時特惠・現省$72】挑食怪終結者 4 件套裝",
    en: "[Limited Deal • Save $72] Picky Eater Rescue 4-Piece Bundle",
  },
  "MOFU-BUNDLE-DENTAL-02": {
    zh: "【限時特惠・現省$61】室內放電防拆家・物理潔齒耐咬 3 件套裝",
    en: "[Limited Deal • Save $61] Power Chewer Dental Care 3-Piece Bundle",
  },
  "MOFU-BUNDLE-SEAFOOD-03": {
    zh: "【限時特惠・現省$72】深海美毛亮眼・Omega-3 全魚滋補 3 件套裝",
    en: "[Limited Deal • Save $72] Deep-Sea Omega-3 Fish Trio Bundle",
  },
  "MOFU-BUNDLE-WALK-04": {
    zh: "日系機能漫步 3 件套裝",
    en: "Japanese Functional Walking Gear 3-Piece Bundle",
  },
};

function skuFor(product: Product): string {
  return product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^MOFU-BUNDLE-/.test(tag))?.trim() || "";
}
function cleanName(value?: string): string {
  if (!value || /\\u[0-9a-fA-F]{4}/.test(value) || CJK_RE.test(value)) return "";
  return (value.split(/[|｜]/).at(-1) || value).replace(/^\s*(?:Made in Japan|Japan-made|Best Partner)\s*/i, "").replace(/\s{2,}/g, " ").trim();
}
function cleanChineseName(value?: string): string {
  if (!value || /\\u[0-9a-fA-F]{4}/.test(value)) return "";
  return (value.split(/[|｜]/).at(-1) || value).replace(/\s{2,}/g, " ").trim();
}
export function getJapaneseProductName(product: Product): string | undefined {
  const metadata = product.metadata ?? {};
  return ["name_ja", "name_jp", "japanese_name", "name_japanese", "product_name_ja", "product_name_jp"].map((key) => metadata[key]?.trim()).find(Boolean);
}
export function getLocalizedProductName(product: Product, locale: Locale): string {
  const sku = skuFor(product);
  const bundle = BUNDLE_NAMES[sku];
  if (bundle) return locale === "en" ? bundle.en : bundle.zh;
  const metadata = product.metadata ?? {};
  if (locale === "en") {
    const english = ["name_en", "title_en", "product_name_en", "english_name"].map((key) => cleanName(metadata[key])).find(Boolean) || cleanName(product.name.en);
    return english && !CJK_RE.test(english) ? english : `Japanese Pet Essential ${sku || product.id.slice(0, 8)}`;
  }
  return cleanChineseName(product.name.zh) || cleanChineseName(metadata.name_zh) || `日本天然食品 ${sku || product.id.slice(0, 8)}`;
}
export function getJapaneseProductSubtitle(product: Product): string { return getLocalizedProductName(product, "en"); }
export function getLocalizedProductDescription(product: Product, locale: Locale): string | undefined {
  const metadata = product.metadata ?? {};
  const keys = locale === "en" ? ["short_description_en", "feature_en", "selling_point_en"] : ["short_description_zh", "feature_zh", "selling_point_zh"];
  const candidate = keys.map((key) => metadata[key]?.trim()).find(Boolean) || product.description?.[locale === "en" ? "en" : "zh"]?.trim();
  return candidate;
}
export function getBilingualProductName(product: Product): string { return getLocalizedProductName(product, "zh"); }
export function getBilingualProductNameParts(product: Product): { zh: string; ja?: string } { return { zh: getLocalizedProductName(product, "zh") }; }
