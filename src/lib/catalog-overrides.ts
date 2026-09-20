import { CATEGORIES, type CategoryIconName } from "@/lib/categories";
import { isSmallPetProductText } from "@/lib/products";
import type { Product } from "@/lib/products";

export type ProductSheetRecord = {
  id: string;
  categorySlug: string;
  image: string;
  name: { zh: string; en: string };
  description?: { zh: string; en: string };
  price: number;
  originalPrice?: number;
  inStock: boolean;
  sourceImageUrl?: string;
};

export type ParsedProductCatalog = {
  records: Map<string, ProductSheetRecord>;
  acceptedRows: number;
  ignoredRows: number;
  /** 1-based non-empty CSV row containing the detected column headers. */
  headerRow: number;
};

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];

    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) {
    throw new Error("Google Sheet CSV contains an unterminated quoted field");
  }

  row.push(field);
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-()[\]（）【】:：/\\]+/g, "");
}

function findColumn(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.includes(header));
}

function parseMoney(value: string): number | null {
  // Google Sheet may export display-formatted values such as
  // "HK$ 1,234.50". Keep only numeric characters, the decimal separator,
  // and a possible minus sign; the validation below still rejects zero,
  // negative, malformed, and unreasonably large prices.
  const normalized = value.replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 1_000_000) {
    return null;
  }
  return amount;
}

function parseStock(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (
    [
      "true",
      "1",
      "yes",
      "y",
      "in stock",
      "instock",
      "\u6709\u8ca8",
      "\u5728\u552e",
      "\u4e0a\u67b6",
    ].includes(normalized)
  ) {
    return true;
  }
  if (
    [
      "false",
      "0",
      "no",
      "n",
      "out of stock",
      "outofstock",
      "\u552e\u7f44",
      "\u7f3a\u8ca8",
      "\u505c\u552e",
      "\u4e0b\u67b6",
    ].includes(normalized)
  ) {
    return false;
  }
  return undefined;
}

function parseImage(
  localValue: string,
  sourceValue: string,
): { image: string; sourceImageUrl?: string } | null {
  const local = localValue.trim();
  const source = sourceValue.trim();

  const isSafeLocalPath = (value: string) =>
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("..") &&
    !value.includes("\\");
  const isHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  };

  const image = isSafeLocalPath(local)
    ? local
    : isHttpUrl(local)
      ? local
      : isHttpUrl(source)
        ? source
        : null;
  if (!image) return null;

  return {
    image,
    ...(isHttpUrl(source) ? { sourceImageUrl: source } : {}),
  };
}

/**
 * The first 20 non-empty rows are scanned for a supported header row, so a
 * Sheet may keep a title row above the actual columns.
 *
 * Supported columns:
 * - id / productId / sku / \u5546\u54c1 ID
 * - categorySlug / \u4e3b\u5206\u985e\u4ee3\u78bc
 * - image / \u672c\u5730\u5716\u7247\u8def\u5f91 / \u4f86\u6e90\u5716\u7247 URL
 * - title / \u4e2d\u6587\u5546\u54c1\u540d\u7a31 / \u82f1\u6587\u5546\u54c1\u540d\u7a31
 * - description / \u4e2d\u6587\u63cf\u8ff0 / \u82f1\u6587\u63cf\u8ff0
 * - price / salePrice / \u552e\u50f9 (HKD)
 * - originalPrice / compareAtPrice / \u539f\u50f9 (HKD) (optional)
 * - inStock / availability / \u5eab\u5b58\u72c0\u614b
 *
 * Invalid data rows are ignored. Duplicate IDs invalidate the complete Sheet
 * so callers do not serve an ambiguous catalog.
 */
export function parseProductCatalogCsv(csv: string): ParsedProductCatalog {
  const rows = parseCsvRows(csv);
  if (rows.length === 0) {
    throw new Error("Google Sheet CSV is empty");
  }

  const headerScanLimit = Math.min(rows.length, 20);
  let headerRowIndex = -1;
  let idColumn = -1;
  let categoryColumn = -1;
  let priceColumn = -1;
  let originalPriceColumn = -1;
  let stockColumn = -1;
  let localImageColumn = -1;
  let sourceImageColumn = -1;
  let zhTitleColumn = -1;
  let enTitleColumn = -1;
  let zhDescriptionColumn = -1;
  let enDescriptionColumn = -1;

  for (let rowIndex = 0; rowIndex < headerScanLimit; rowIndex += 1) {
    const headers = rows[rowIndex].map(normalizeHeader);
    const candidateIdColumn = findColumn(headers, [
      "id",
      "productid",
      "sku",
      "\u5546\u54c1id",
      "\u5546\u54c1\u7de8\u865f",
      "\u7522\u54c1id",
      "\u7522\u54c1\u7de8\u865f",
    ]);
    const candidateCategoryColumn = findColumn(headers, [
      "categoryslug",
      "\u4e3b\u5206\u985e\u4ee3\u78bc",
      "\u4e3b\u5206\u7c7b\u4ee3\u7801",
    ]);
    const candidatePriceColumn = findColumn(headers, [
      "price",
      "saleprice",
      "\u552e\u50f9",
      "\u552e\u50f9hkd",
      "\u50f9\u683c",
      "\u50f9\u683chkd",
      "\u50f9\u9322",
      "\u50f9\u9322hkd",
    ]);

    if (
      candidateIdColumn < 0 ||
      candidateCategoryColumn < 0 ||
      candidatePriceColumn < 0
    ) {
      continue;
    }

    headerRowIndex = rowIndex;
    idColumn = candidateIdColumn;
    categoryColumn = candidateCategoryColumn;
    priceColumn = candidatePriceColumn;
    originalPriceColumn = findColumn(headers, [
      "originalprice",
      "compareatprice",
      "regularprice",
      "\u539f\u50f9",
      "\u539f\u50f9hkd",
    ]);
    stockColumn = findColumn(headers, [
      "instock",
      "available",
      "availability",
      "\u5eab\u5b58",
      "\u5eab\u5b58\u72c0\u614b",
      "\u5b58\u8ca8",
      "\u5b58\u8ca8\u72c0\u614b",
    ]);
    localImageColumn = findColumn(headers, [
      "image",
      "imagepath",
      "imageurl",
      "\u7522\u54c1\u5716\u7247",
      "\u5546\u54c1\u5716\u7247",
      "\u5716\u7247",
      "\u672c\u5730\u5716\u7247",
      "\u672c\u5730\u5716\u7247\u8def\u5f91",
    ]);
    sourceImageColumn = findColumn(headers, [
      "sourceimage",
      "sourceimageurl",
      "\u4f86\u6e90\u5716\u7247",
      "\u4f86\u6e90\u5716\u7247url",
      "\u539f\u59cb\u5716\u7247",
      "\u539f\u59cb\u5716\u7247url",
    ]);
    zhTitleColumn = findColumn(headers, [
      "title",
      "name",
      "producttitle",
      "productname",
      "\u7522\u54c1\u540d\u7a31",
      "\u5546\u54c1\u540d\u7a31",
      "\u4e2d\u6587\u5546\u54c1\u540d\u7a31",
      "\u4e2d\u6587\u540d\u7a31",
    ]);
    enTitleColumn = findColumn(headers, [
      "titleen",
      "nameen",
      "englishtitle",
      "englishname",
      "\u82f1\u6587\u5546\u54c1\u540d\u7a31",
      "\u82f1\u6587\u540d\u7a31",
    ]);
    zhDescriptionColumn = findColumn(headers, [
      "description",
      "productdescription",
      "\u7522\u54c1\u4ecb\u7d39",
      "\u5546\u54c1\u4ecb\u7d39",
      "\u8a73\u7d30\u4ecb\u7d39",
      "\u4e2d\u6587\u63cf\u8ff0",
      "\u4e2d\u6587\u4ecb\u7d39",
    ]);
    enDescriptionColumn = findColumn(headers, [
      "descriptionen",
      "englishdescription",
      "\u82f1\u6587\u63cf\u8ff0",
      "\u82f1\u6587\u4ecb\u7d39",
    ]);
    break;
  }

  if (headerRowIndex < 0) {
    throw new Error(
      "Google Sheet requires \u5546\u54c1 ID, \u4e3b\u5206\u985e\u4ee3\u78bc, and \u552e\u50f9 (HKD) columns within the first 20 non-empty rows",
    );
  }
  if (
    stockColumn < 0 ||
    (localImageColumn < 0 && sourceImageColumn < 0) ||
    (zhTitleColumn < 0 && enTitleColumn < 0) ||
    (zhDescriptionColumn < 0 && enDescriptionColumn < 0)
  ) {
    throw new Error(
      "Google Sheet requires image, title, description, stock, and price columns for catalog sync",
    );
  }

  const records = new Map<string, ProductSheetRecord>();
  let ignoredRows = 0;

  for (const row of rows.slice(headerRowIndex + 1)) {
    const id = (row[idColumn] ?? "").trim();
    const categorySlug = (row[categoryColumn] ?? "").trim();
    const price = parseMoney(row[priceColumn] ?? "");
    const inStock = parseStock(row[stockColumn] ?? "");
    const image = parseImage(
      localImageColumn >= 0 ? (row[localImageColumn] ?? "") : "",
      sourceImageColumn >= 0 ? (row[sourceImageColumn] ?? "") : "",
    );
    const zhTitle =
      zhTitleColumn >= 0 ? (row[zhTitleColumn] ?? "").trim() : "";
    const enTitle =
      enTitleColumn >= 0 ? (row[enTitleColumn] ?? "").trim() : "";

    if (
      !id ||
      !CATEGORIES.some((category) => category.slug === categorySlug) ||
      price === null ||
      inStock === undefined ||
      !image ||
      (!zhTitle && !enTitle)
    ) {
      ignoredRows += 1;
      continue;
    }
    if (records.has(id)) {
      throw new Error(`Google Sheet contains duplicate product id: ${id}`);
    }

    const originalPrice =
      originalPriceColumn >= 0
        ? parseMoney(row[originalPriceColumn] ?? "")
        : null;
    const zhDescription =
      zhDescriptionColumn >= 0
        ? (row[zhDescriptionColumn] ?? "").trim()
        : "";
    const enDescription =
      enDescriptionColumn >= 0
        ? (row[enDescriptionColumn] ?? "").trim()
        : "";

    const normalizedCategorySlug = isSmallPetProductText(zhTitle, enTitle, zhDescription, enDescription)
      ? "small-pets"
      : categorySlug;

    records.set(id, {
      id,
      categorySlug: normalizedCategorySlug,
      image: image.image,
      name: {
        zh: zhTitle || enTitle,
        en: enTitle || zhTitle,
      },
      ...((zhDescription || enDescription)
        ? {
            description: {
              zh: zhDescription || enDescription,
              en: enDescription || zhDescription,
            },
          }
        : {}),
      price,
      ...(originalPrice !== null && originalPrice >= price
        ? { originalPrice }
        : {}),
      inStock,
      ...(image.sourceImageUrl
        ? { sourceImageUrl: image.sourceImageUrl }
        : {}),
    });
  }

  if (records.size === 0) {
    throw new Error("Google Sheet contains no valid product catalog rows");
  }

  return {
    records,
    acceptedRows: records.size,
    ignoredRows,
    headerRow: headerRowIndex + 1,
  };
}

export function productRecordsToProducts(
  records: ReadonlyMap<string, ProductSheetRecord>,
): Product[] {
  const categoryIcons = new Map<string, CategoryIconName>(
    CATEGORIES.map((category) => [category.slug, category.icon]),
  );

  return Array.from(records.values(), (record) => ({
    id: record.id,
    categorySlug: record.categorySlug,
    icon: categoryIcons.get(record.categorySlug)!,
    image: record.image,
    name: record.name,
    price: record.price,
    inStock: record.inStock,
    ...(record.description ? { description: record.description } : {}),
    ...(record.originalPrice !== undefined
      ? { originalPrice: record.originalPrice }
      : {}),
    ...(record.sourceImageUrl ? { sourceImageUrl: record.sourceImageUrl } : {}),
  }));
}
