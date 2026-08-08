import type { Product } from "@/lib/products";

export type ProductPriceOverride = {
  id: string;
  price: number;
  originalPrice?: number;
  inStock?: boolean;
};

export type ParsedProductOverrides = {
  overrides: Map<string, ProductPriceOverride>;
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

/**
 * The first 20 non-empty rows are scanned for a supported header row, so a
 * Sheet may keep a title row above the actual columns.
 *
 * Supported columns:
 * - id / productId / sku / 商品 ID
 * - price / salePrice / 售價 (HKD)
 * - originalPrice / compareAtPrice / 原價 (HKD) (optional)
 * - inStock / availability / 庫存狀態 (optional)
 *
 * Invalid data rows are ignored. Duplicate IDs invalidate the complete Sheet
 * so the caller can safely fall back to the code catalog.
 */
export function parseProductOverridesCsv(csv: string): ParsedProductOverrides {
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
    break;
  }

  if (headerRowIndex < 0) {
    throw new Error(
      "Google Sheet requires id/price or 商品 ID/售價 (HKD) columns within the first 20 non-empty rows",
    );
  }

  const overrides = new Map<string, ProductPriceOverride>();
  let ignoredRows = 0;

  for (const row of rows.slice(headerRowIndex + 1)) {
    const id = (row[idColumn] ?? "").trim();
    const price = parseMoney(row[priceColumn] ?? "");
    if (!id || price === null) {
      ignoredRows += 1;
      continue;
    }
    if (overrides.has(id)) {
      throw new Error(`Google Sheet contains duplicate product id: ${id}`);
    }

    const originalPrice =
      originalPriceColumn >= 0
        ? parseMoney(row[originalPriceColumn] ?? "")
        : null;
    const inStock =
      stockColumn >= 0 ? parseStock(row[stockColumn] ?? "") : undefined;

    overrides.set(id, {
      id,
      price,
      ...(originalPrice !== null && originalPrice >= price
        ? { originalPrice }
        : {}),
      ...(inStock !== undefined ? { inStock } : {}),
    });
  }

  if (overrides.size === 0) {
    throw new Error("Google Sheet contains no valid product price rows");
  }

  return {
    overrides,
    acceptedRows: overrides.size,
    ignoredRows,
    headerRow: headerRowIndex + 1,
  };
}

export function applyProductPriceOverrides(
  products: readonly Product[],
  overrides: ReadonlyMap<string, ProductPriceOverride>,
): { products: Product[]; matchedOverrides: number } {
  let matchedOverrides = 0;
  const merged = products.map((product) => {
    const override = overrides.get(product.id);
    if (!override) return product;
    matchedOverrides += 1;

    const originalPrice = override.originalPrice ?? product.originalPrice;
    const next: Product = {
      ...product,
      price: override.price,
      ...(override.inStock !== undefined
        ? { inStock: override.inStock }
        : {}),
    };

    if (originalPrice !== undefined && originalPrice >= override.price) {
      next.originalPrice = originalPrice;
    } else {
      delete next.originalPrice;
    }

    return next;
  });

  return { products: merged, matchedOverrides };
}
