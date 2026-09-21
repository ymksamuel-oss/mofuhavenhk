import type { Product } from "@/lib/products";

export type ProductContentLocale = "zh" | "en" | "ja";
export type RichProductContent = {
  highlights: string[];
  spotlight: string;
  texture: string;
  feeding: string[];
  nutrition: string[];
  notes: string[];
};

type Section = { title: string; lines: string[] };

const SECTION_LABELS = {
  highlights: ["核心亮點", "商品特色", "商品特點", "highlights", "features"],
  spotlight: ["商品重點", "購買理由", "key point", "key points"],
  texture: ["口感與食感", "食感與硬度", "texture", "bite"],
  feeding: ["餵食方法", "餵食方式", "使用方法", "4 大花式餵食法", "4大花式餵食法", "feeding", "directions"],
  nutrition: ["規格與保證營養", "保證營養", "營養", "規格", "nutrition", "specifications"],
  notes: ["貼心叮嚀", "注意事項", "保存方法", "notes", "storage", "caution"],
} as const;

function decodeLiteralEscapes(value: string): string {
  return value.replace(/\\u([0-9a-f]{4})/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)));
}

/** Returns display-safe text; source-language fallbacks are hidden instead of leaked. */
export function safeProductText(value: unknown, locale: ProductContentLocale = "zh"): string {
  if (typeof value !== "string") return "";
  const text = decodeLiteralEscapes(value).replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
  if (!text || text === "undefined" || text === "null") return "";
  if (locale !== "ja" && /[\u3040-\u30ff]/u.test(text)) return "";
  if (locale === "en" && /[\u3400-\u9fff]/u.test(text)) return "";
  return text;
}

function headingTitle(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.startsWith("##")) return trimmed.replace(/^#+\s*/, "").trim() || null;
  if (trimmed.startsWith("【") && trimmed.includes("】")) return trimmed.slice(1, trimmed.indexOf("】")).trim() || null;
  return null;
}

function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { title: "", lines: [] };
  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const title = headingTitle(line);
    if (title) {
      if (current.lines.length) sections.push(current);
      current = { title, lines: [] };
      continue;
    }
    current.lines.push(line.replace(/^[•●▪◦\-*]+\s*/, "").trim());
  }
  if (current.lines.length) sections.push(current);
  return sections;
}

function linesFrom(sections: Section[], names: readonly string[], locale: ProductContentLocale): string[] {
  return sections
    .filter((section) => names.some((name) => section.title.toLocaleLowerCase().includes(name.toLocaleLowerCase())))
    .flatMap((section) => section.lines)
    .map((line) => safeProductText(line, locale))
    .filter((line): line is string => Boolean(line) && line.length > 2);
}

function firstSectionBody(sections: Section[], names: readonly string[], locale: ProductContentLocale): string {
  return linesFrom(sections, names, locale).join("\n");
}

export function parseProductContent(text: string, product: Product, locale: ProductContentLocale = "zh"): RichProductContent {
  const sections = parseSections(text);
  const highlights = linesFrom(sections, SECTION_LABELS.highlights, locale);
  const fallbackSpecs = (product.specs ?? [])
    .map((spec) => safeProductText(spec[locale] || spec.zh || spec.en, locale))
    .filter((line): line is string => Boolean(line));
  const feeding = linesFrom(sections, SECTION_LABELS.feeding, locale);
  const nutrition = linesFrom(sections, SECTION_LABELS.nutrition, locale);
  const notes = linesFrom(sections, SECTION_LABELS.notes, locale);
  const textureFallback = locale === "en" ? product.texture?.en : product.texture?.zh || product.texture?.en;
  const texture = firstSectionBody(sections, SECTION_LABELS.texture, locale) || safeProductText(textureFallback, locale);
  return {
    highlights: (highlights.length ? highlights : fallbackSpecs).slice(0, 5),
    spotlight: firstSectionBody(sections, SECTION_LABELS.spotlight, locale),
    texture,
    feeding: feeding.slice(0, 4),
    nutrition: nutrition.slice(0, 8),
    notes: notes.slice(0, 5),
  };
}

export function productSpecifications(product: Product, sku: string, locale: ProductContentLocale = "zh"): string[] {
  const metadata = product.metadata ?? {};
  const candidates = [
    ...(product.specs ?? []).map((spec) => spec[locale] || spec.zh || spec.en),
    metadata[`specs_${locale}`],
    metadata[`specifications_${locale}`],
    metadata.specs,
    metadata.specifications,
  ];
  const rows = candidates
    .flatMap((value) => typeof value === "string" ? value.replace(/\r\n?/g, "\n").split("\n") : [])
    .map((value) => safeProductText(value, locale))
    .filter((value): value is string => Boolean(value) && value.length > 2)
    .slice(0, 12);
  const safeSku = safeProductText(sku, locale);
  return safeSku && !rows.some((row) => row.includes("條碼") || row.toLocaleLowerCase().includes("barcode"))
    ? [...rows, locale === "en" ? `Barcode: ${safeSku}` : `條碼：${safeSku}`]
    : rows;
}
