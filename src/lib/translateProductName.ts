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
  const cleanName = (value?: string) => {
    if (!value) return "";
    const tail = value.split(/[｜|]/).at(-1) || value;
    return tail.replace(/^日本(?:原裝|直送|製品?)\s*/i, "")
      .replace(/^Best Partner\s*/i, "")
      .replace(/^天然寵物(?:零食|食品|用品)\s*[：:]?\s*/i, "")
      .trim();
  };
  const metadataName = ["name_zh", "title_zh", "product_name_zh", "中文名稱", "中文商品名稱", "name_en", "title_en", "product_name_en"]
    .map((key) => cleanName(metadata[key])).find(Boolean);
  const zhName = cleanName(product.name.zh);
  const enName = cleanName(product.name.en);
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
  const metadata = product.metadata ?? {};
  const featureKeys = locale === "en"
    ? ["short_description_en", "feature_en", "selling_point_en", "特色_en"]
    : ["short_description_zh", "feature_zh", "selling_point_zh", "特色", "產品特色"];
  const candidate = featureKeys.map((key) => metadata[key]?.trim()).find(Boolean)
    || product.description?.[locale]?.trim()
    || (locale === "en" ? product.description?.zh?.trim() : product.description?.en?.trim());
  if (!candidate) return undefined;
  if (/^(?:best partner\s*)?(?:日本製|日本原裝|日本直送)?(?:天然)?寵物(?:產品|用品|零食)|best partner.*pet products|japanese.*pet supplies/i.test(candidate)) return undefined;
  if (/規格\s*\d|詳情請見|請參閱包裝|產品規格/i.test(candidate)) return undefined;
  return candidate;
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
