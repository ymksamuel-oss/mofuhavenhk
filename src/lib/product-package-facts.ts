import { isValidGtin13 } from "@/lib/product-identifiers";
import type { Locale } from "@/lib/i18n/translations";

type ProductPackageFactKey =
  | "ingredients"
  | "origin"
  | "protein"
  | "fat"
  | "fiber"
  | "ash"
  | "moisture"
  | "calories"
  | "netWeight"
  | "storage"
  | "jan";

export type ProductPackageFact = {
  key: ProductPackageFactKey;
  label: string;
  value: string;
};

type PackageFactField = {
  key: ProductPackageFactKey;
  label: { zh: string; en: string };
  pattern: RegExp;
};

const PACKAGE_FACT_FIELDS: PackageFactField[] = [
  { key: "ingredients", label: { zh: "主要成分", en: "Ingredients" }, pattern: /^(?:原材料|原料|成分|ingredients?)$/i },
  { key: "origin", label: { zh: "產地來源", en: "Origin" }, pattern: /^(?:產地|原產地|製造地|產地國|原産地|原産国|country\s+of\s+origin|origin)$/i },
  { key: "protein", label: { zh: "粗蛋白質", en: "Crude Protein" }, pattern: /^(?:粗蛋白質?|蛋白質|crude\s+protein|protein)$/i },
  { key: "fat", label: { zh: "粗脂肪", en: "Crude Fat" }, pattern: /^(?:粗脂肪|脂肪|crude\s+fat|fat)$/i },
  { key: "fiber", label: { zh: "粗纖維", en: "Crude Fiber" }, pattern: /^(?:粗纖維|纖維|crude\s+fiber|fiber|fibre)$/i },
  { key: "ash", label: { zh: "粗灰分", en: "Crude Ash" }, pattern: /^(?:粗灰分|灰分|crude\s+ash|ash)$/i },
  { key: "moisture", label: { zh: "水分", en: "Moisture" }, pattern: /^(?:水分|moisture)$/i },
  { key: "calories", label: { zh: "熱量", en: "Calories" }, pattern: /^(?:熱量|代謝能|代謝能量|卡路里|calories?|energy|kcal)$/i },
  { key: "netWeight", label: { zh: "淨重／規格", en: "Net Weight / Pack Size" }, pattern: /^(?:淨重(?:規格)?|淨含量|內容量|容量|規格|重量|net\s*(?:weight|contents?)|pack(?:age)?\s*size)$/i },
  { key: "storage", label: { zh: "保存方式", en: "Storage" }, pattern: /^(?:保存方法|保存方式|保管方法|儲存方式|storage(?:\s+method)?)$/i },
  { key: "jan", label: { zh: "JAN 國際條碼", en: "JAN Barcode" }, pattern: /^(?:jan(?:\s*(?:碼|代碼|コード|code))?|條碼|国际条码|國際條碼|barcode|gtin(?:-?13)?)$/i },
];

const ANALYSIS_PATTERNS: Array<{ key: ProductPackageFactKey; pattern: RegExp }> = [
  { key: "protein", pattern: /(?:粗蛋白質?|crude\s+protein|protein)\s*[:：=]?\s*([<>≤≥]?\s*\d+(?:\.\d+)?\s*%?(?:\s*(?:以上|以下|min(?:imum)?|max(?:imum)?))?)/gi },
  { key: "fat", pattern: /(?:粗脂肪|crude\s+fat|fat)\s*[:：=]?\s*([<>≤≥]?\s*\d+(?:\.\d+)?\s*%?(?:\s*(?:以上|以下|min(?:imum)?|max(?:imum)?))?)/gi },
  { key: "fiber", pattern: /(?:粗纖維|粗纤维|crude\s+fiber|fiber|fibre)\s*[:：=]?\s*([<>≤≥]?\s*\d+(?:\.\d+)?\s*%?(?:\s*(?:以上|以下|min(?:imum)?|max(?:imum)?))?)/gi },
  { key: "ash", pattern: /(?:粗灰分|灰分|crude\s+ash|ash)\s*[:：=]?\s*([<>≤≥]?\s*\d+(?:\.\d+)?\s*%?(?:\s*(?:以上|以下|min(?:imum)?|max(?:imum)?))?)/gi },
  { key: "moisture", pattern: /(?:水分|moisture)\s*[:：=]?\s*([<>≤≥]?\s*\d+(?:\.\d+)?\s*%?(?:\s*(?:以上|以下|min(?:imum)?|max(?:imum)?))?)/gi },
];

function cleanLine(value: string): string {
  return value.trim().replace(/^[•●▪◦・\-*]+\s*/u, "").replace(/^\d+\s*[.)、]\s*/, "");
}

function addFact(
  facts: Map<ProductPackageFactKey, string>,
  key: ProductPackageFactKey,
  rawValue: string,
): void {
  const value = rawValue.trim();
  if (!value) return;
  if (key === "jan") {
    const code = value.match(/\d{13}/)?.[0];
    if (!isValidGtin13(code)) return;
    facts.set(key, code);
    return;
  }
  const previous = facts.get(key);
  if (!previous) facts.set(key, value);
  else if (!previous.includes(value)) facts.set(key, `${previous}；${value}`);
}

function extractAnalysis(line: string, facts: Map<ProductPackageFactKey, string>): void {
  for (const { key, pattern } of ANALYSIS_PATTERNS) {
    for (const match of line.matchAll(pattern)) {
      if (match[1]) addFact(facts, key, match[1].replace(/\s+/g, " "));
    }
  }
  const calorieMatch = line.match(/(?:熱量|代謝能(?:量)?|卡路里|calories?|energy)\s*[:：=]?\s*([^,，、|｜;；\n]+)/i);
  if (calorieMatch?.[1]) addFact(facts, "calories", calorieMatch[1]);
}

function extractLine(line: string, facts: Map<ProductPackageFactKey, string>): void {
  for (const chunk of cleanLine(line).split(/[|｜]/u)) {
    const cleaned = cleanLine(chunk);
    const match = cleaned.match(/^(.{1,48}?)[：:=]\s*(.+)$/u) ?? cleaned.match(/^(.{1,48}?)\s{1,}(.+)$/u);
    if (match) {
      const label = match[1].replace(/[（(].*?[）)]/g, "").trim();
      const field = PACKAGE_FACT_FIELDS.find((candidate) => candidate.pattern.test(label));
      if (field) addFact(facts, field.key, match[2]);
    }
    extractAnalysis(cleaned, facts);
  }
}

/**
 * Parse only product-provided text and catalog fields; missing claims are never
 * fabricated. The returned rows use a stable order so product cards are easy to scan.
 */
export function parseProductPackageFacts({
  description,
  specifications,
  fallbackJan,
  locale,
}: {
  description: string;
  specifications: readonly string[];
  fallbackJan: string;
  locale: Locale;
}): ProductPackageFact[] {
  const facts = new Map<ProductPackageFactKey, string>();
  const content = [description, ...specifications]
    .filter(Boolean)
    .join("\n")
    .replace(/\\u([0-9a-f]{4})/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)));

  for (const rawLine of content.replace(/\r\n?/g, "\n").split("\n")) {
    if (!rawLine.trim()) continue;
    if (locale === "en" && /[\u3400-\u9fff]/u.test(rawLine)) continue;
    extractLine(rawLine, facts);
  }

  if (fallbackJan && !facts.has("jan") && isValidGtin13(fallbackJan)) {
    facts.set("jan", fallbackJan);
  }

  const order: ProductPackageFactKey[] = [
    "ingredients", "origin", "protein", "fat", "fiber", "ash", "moisture", "calories", "netWeight", "storage", "jan",
  ];
  return order.flatMap((key) => {
    const value = facts.get(key);
    const field = PACKAGE_FACT_FIELDS.find((candidate) => candidate.key === key);
    return value && field ? [{ key, label: field.label[locale === "en" ? "en" : "zh"], value }] : [];
  });
}
