import type { Product } from "@/lib/products";

export type ProductSheetRecord = {
  id: string;
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
      "有貨",
      "在售",
      "上架",
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
      "售罄",
      "缺貨",
      "停售",
      "下架",
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
 * - id / productId / sku / 商品 ID
 * - image / 本地圖片路徑 / 來源圖片 URL
 * - title / 中文商品名稱 / 英文商品名稱
 * - description / 中文描述 / 英文描述
 * - price / salePrice / 售價 (HKD)
 * - originalPrice / compareAtPrice / 原價 (HKD) (optional)
 * - inStock / availability / 庫存狀態
 *
 * Invalid data rows are ignored. Duplicate IDs invalidate the complete Sheet
 * so the caller can safely fall back to the code catalog.
 */
export function parseProductCatalogCsv(csv: string): ParsedProductCatalog {
  const rows = parseCsvRows(csv);
  if (rows.length === 0) {
    throw new Error("Google Sheet CSV is empty");
  }

  const headerScanLimit = Math.min(rows.length, 20);
  let headerRowIndex = -1;
  let idColumn = -1;
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
      "商品id",
      "商品編號",
      "產品id",
      "產品編號",
    ]);
    const candidatePriceColumn = findColumn(headers, [
      "price",
      "saleprice",
      "售價",
      "售價hkd",
      "價格",
      "價格hkd",
      "價錢",
      "價錢hkd",
    ]);

    if (candidateIdColumn < 0 || candidatePriceColumn < 0) {
      continue;
    }

    headerRowIndex = rowIndex;
    idColumn = candidateIdColumn;
    priceColumn = candidatePriceColumn;
    originalPriceColumn = findColumn(headers, [
      "originalprice",
      "compareatprice",
      "regularprice",
      "原價",
      "原價hkd",
    ]);
    stockColumn = findColumn(headers, [
      "instock",
      "available",
      "availability",
      "庫存",
      "庫存狀態",
      "存貨",
      "存貨狀態",
    ]);
    localImageColumn = findColumn(headers, [
      "image",
      "imagepath",
      "imageurl",
      "產品圖片",
      "商品圖片",
      "圖片",
      "本地圖片",
      "本地圖片路徑",
    ]);
    sourceImageColumn = findColumn(headers, [
      "sourceimage",
      "sourceimageurl",
      "來源圖片",
      "來源圖片url",
      "原始圖片",
      "原始圖片url",
    ]);
    zhTitleColumn = findColumn(headers, [
      "title",
      "name",
      "producttitle",
      "productname",
      "產品名稱",
      "商品名稱",
      "中文商品名稱",
      "中文名稱",
    ]);
    enTitleColumn = findColumn(headers, [
      "titleen",
      "nameen",
      "englishtitle",
      "englishname",
      "英文商品名稱",
      "英文名稱",
    ]);
    zhDescriptionColumn = findColumn(headers, [
      "description",
      "productdescription",
      "產品介紹",
      "商品介紹",
      "詳細介紹",
      "中文描述",
      "中文介紹",
    ]);
    enDescriptionColumn = findColumn(headers, [
      "descriptionen",
      "englishdescription",
      "英文描述",
      "英文介紹",
    ]);
    break;
  }

  if (headerRowIndex < 0) {
    throw new Error(
      "Google Sheet requires id/price or 商品 ID/售價 (HKD) columns within the first 20 non-empty rows",
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

    records.set(id, {
      id,
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

export function applyProductCatalogRecords(
  products: readonly Product[],
  records: ReadonlyMap<string, ProductSheetRecord>,
): { products: Product[]; matchedRecords: number } {
  let matchedRecords = 0;
  const merged = products.flatMap((product) => {
    const record = records.get(product.id);
    if (!record) return [];
    matchedRecords += 1;

    const next: Product = {
      ...product,
      image: record.image,
      name: record.name,
      price: record.price,
      inStock: record.inStock,
    };

    if (record.description) {
      next.description = record.description;
    } else {
      delete next.description;
    }
    if (
      record.originalPrice !== undefined &&
      record.originalPrice >= record.price
    ) {
      next.originalPrice = record.originalPrice;
    } else {
      delete next.originalPrice;
    }
    if (record.sourceImageUrl) {
      next.sourceImageUrl = record.sourceImageUrl;
    } else {
      delete next.sourceImageUrl;
    }

    return next;
  });

  return { products: merged, matchedRecords };
}
