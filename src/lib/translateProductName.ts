import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

export function getJapaneseProductName(product: Product): string | undefined {
  const metadata = product.metadata ?? {};
  return [
    "name_ja",
    "name_jp",
    "japanese_name",
    "name_japanese",
    "product_name_ja",
    "product_name_jp",
    "原商品名",
    "商品名_日本語",
    "source_name_ja",
  ]
    .map((key) => metadata[key]?.trim()).find(Boolean);
}

export function getLocalizedProductName(product: Product, locale: Locale): string {
  const metadata = product.metadata ?? {};
  const metadataName = ["name_zh", "title_zh", "product_name_zh", "中文名稱", "中文商品名稱", "name_en", "title_en", "product_name_en"]
    .map((key) => metadata[key]?.trim()).find(Boolean);
  const zhName = product.name.zh?.trim();
  const enName = product.name.en?.trim();
  const isPlaceholder = (value?: string) => !value || /^(商品|product|unnamed product|product name unavailable)$/i.test(value.trim());
  const isGeneratedEnglish = (value?: string) => Boolean(value && /best partner pet lifestyle accessories|japanese dog gear|pet lifestyle accessories|product name unavailable/i.test(value));
  const realName = !isPlaceholder(zhName) ? zhName : (!isPlaceholder(enName) && !isGeneratedEnglish(enName) ? enName : metadataName);
  if (locale !== "en") return realName || "未命名商品";
  if (!isPlaceholder(enName) && !isGeneratedEnglish(enName) && enName !== zhName) return enName;
  return realName || "Unnamed product";
}

function cleanChineseProductSubtitle(value: string): string {
  const parts = value.split(/[｜|]/).map((part) => part.trim()).filter(Boolean);
  const candidate = parts.at(-1) || value;
  return candidate.replace(/^(日本原裝|日本直送|日本製)\s*/i, "").replace(/^(天然寵物零食|寵物零食)\s*[：:]?\s*/i, "").trim();
}

export function getJapaneseProductSubtitle(product: Product): string {
  const metadata = product.metadata ?? {};
  const source = ["name_zh", "title_zh", "product_name_zh", "中文名稱", "中文商品名稱"]
    .map((key) => metadata[key]?.trim()).find(Boolean) || product.name.zh || product.name.en || "商品";
  const subtitle = cleanChineseProductSubtitle(source);
  const brand = product.brand || metadata.supplier_brand || metadata.brand;
  return brand && !subtitle.toLocaleLowerCase().startsWith(brand.toLocaleLowerCase()) ? `${brand} ${subtitle}` : subtitle;
}

export function getLocalizedProductDescription(product: Product, locale: Locale): string | undefined {
  return product.description?.[locale] || product.description?.zh || product.description?.en;
}

export function getBilingualProductName(product: Product): string {
  const zh = product.name.zh || product.name.en || "商品";
  const ja = getJapaneseProductName(product);
  return ja && ja !== zh ? `${zh}\n${ja}` : zh;
}

export function getBilingualProductNameParts(product: Product): { zh: string; ja?: string } {
  const zh = product.name.zh || product.name.en || "商品";
  const ja = getJapaneseProductName(product);
  return { zh, ja: ja && ja !== zh ? ja : undefined };
}
