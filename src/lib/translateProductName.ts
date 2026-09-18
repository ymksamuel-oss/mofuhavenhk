import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/lib/products";

export function getJapaneseProductName(product: Product): string | undefined {
  const metadata = product.metadata ?? {};
  return [
    "name_ja", "name_jp", "japanese_name", "name_japanese", "product_name_ja", "product_name_jp",
    "原商品名", "商品名_日本語", "source_name_ja",
  ].map((key) => metadata[key]?.trim()).find(Boolean);
}

function containsJapanese(value?: string): boolean {
  return Boolean(value && /[\u3040-\u30ff]/.test(value));
}

function translateJapaneseName(value: string, locale: "zh" | "en"): string {
  const replacements = locale === "zh"
    ? [
        [/鯨\s*\(くじら\)\s*の干し肉/g, "日本產 鯨魚肉乾"], [/ミンチ/g, "免治碎肉"], [/こだわり/g, "特選"], [/ビーフ|牛(?!筋)/g, "牛肉"], [/牛アキレス/g, "牛筋"], [/アキレス/g, "筋條"],
        [/ジャーキー/g, "肉乾"], [/スティック/g, "肉條"], [/スライス/g, "薄片"], [/チップス|ちっぷす/g, "肉片"],
        [/ささみ|ササミ|鶏|チキン/g, "雞肉"], [/鹿/g, "鹿肉"], [/ホース|馬/g, "馬肉"], [/ポーク|豚/g, "豬肉"],
        [/カンガルー/g, "袋鼠肉"], [/かつお|鰹/g, "鰹魚"], [/まぐろ|マグロ/g, "鮪魚"], [/にぼし|煮干し/g, "小魚乾"],
        [/おやつ/g, "零食"], [/ふりかけ/g, "拌飯粉"], [/ごはん/g, "主食"], [/ソフト/g, "軟"], [/ハード/g, "硬"],
        [/ロング/g, "長條"], [/お徳用/g, "特惠裝"],
      ] as const
    : [
        [/鯨\s*\(くじら\)\s*の干し肉/g, "Whale jerky"], [/ミンチ/g, "minced meat"], [/こだわり/g, "Premium"], [/ビーフ|牛/g, "Beef"], [/アキレス/g, "Achilles Tendon"], [/ジャーキー/g, "Jerky"],
        [/スティック/g, "Sticks"], [/スライス/g, "Slices"], [/チップス|ちっぷす/g, "Chips"], [/ささみ|ササミ|鶏|チキン/g, "Chicken"],
        [/鹿/g, "Venison"], [/ホース|馬/g, "Horse"], [/ポーク|豚/g, "Pork"], [/カンガルー/g, "Kangaroo"],
        [/かつお|鰹/g, "Bonito"], [/まぐろ|マグロ/g, "Tuna"], [/にぼし|煮干し/g, "Dried fish"], [/おやつ/g, "Treats"],
        [/ふりかけ/g, "Sprinkle"], [/ごはん/g, "Food"], [/ソフト/g, "Soft"], [/ハード/g, "Hard"], [/ロング/g, "Long"],
        [/お徳用/g, "Value pack"],
      ] as const;
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value)
    .replace(/[　]+/g, " ").replace(/\s{2,}/g, " ").trim();
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
  const translatedJapaneseZh = containsJapanese(zhName) ? translateJapaneseName(zhName, "zh") : "";
  const translatedJapaneseEn = containsJapanese(enName) ? translateJapaneseName(enName, "en") : "";
  const isPlaceholder = (value?: string) => !value || /^(商品|product|unnamed product|product name unavailable)$/i.test(value.trim());
  const isGeneratedEnglish = (value?: string) => Boolean(value && /best partner pet lifestyle accessories|japanese dog gear|pet lifestyle accessories|product name unavailable/i.test(value));
  const realName = !isPlaceholder(zhName) && !containsJapanese(zhName)
    ? zhName
    : translatedJapaneseZh || (!isPlaceholder(enName) && !isGeneratedEnglish(enName) && !containsJapanese(enName) ? enName : metadataName);
  if (locale !== "en") return realName || "未命名商品";
  if (!isPlaceholder(enName) && !isGeneratedEnglish(enName) && !containsJapanese(enName) && enName !== zhName) return enName;
  return translatedJapaneseEn || realName || "Unnamed product";
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
