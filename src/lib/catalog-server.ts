import "server-only";

import {
  parseProductCatalogCsv,
  productRecordsToProducts,
} from "@/lib/catalog-overrides";
import type { Product } from "@/lib/products";

const DEFAULT_GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1zTZxk-cidcgcmGsM79jMQD72Fznmd7CfAQNS79pp6i0/export?format=csv";

export type CatalogSnapshot = {
  products: Product[];
  source: "google-sheet";
  matchedRecords: number;
};

function getGoogleSheetCsvUrl(): string {
  const directUrl = process.env.GOOGLE_SHEET_CSV_URL?.trim();
  if (directUrl) {
    const url = new URL(directUrl);
    if (url.protocol !== "https:" || url.hostname !== "docs.google.com") {
      throw new Error(
        "GOOGLE_SHEET_CSV_URL must be an HTTPS docs.google.com CSV URL",
      );
    }
    return url.toString();
  }

  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!sheetId) return DEFAULT_GOOGLE_SHEET_CSV_URL;
  if (!/^[A-Za-z0-9_-]+$/.test(sheetId)) {
    throw new Error("GOOGLE_SHEET_ID has an invalid format");
  }

  const gid = process.env.GOOGLE_SHEET_GID?.trim() || "0";
  if (!/^\d+$/.test(gid)) {
    throw new Error("GOOGLE_SHEET_GID must be numeric");
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

async function fetchSheetCsv(url: string): Promise<string> {
  const configuredTimeoutMs = Number(process.env.GOOGLE_SHEET_TIMEOUT_MS);
  const timeoutMs = Number.isInteger(configuredTimeoutMs)
    ? Math.max(1000, Math.min(configuredTimeoutMs, 15000))
    : 5000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "text/csv" },
    });
    if (!response.ok) {
      throw new Error(`Google Sheet returned HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  const url = getGoogleSheetCsvUrl();
  const csv = await fetchSheetCsv(url);
  const parsed = parseProductCatalogCsv(csv);
  const products = productRecordsToProducts(parsed.records);

  return {
    products,
    source: "google-sheet",
    matchedRecords: products.length,
  };
}
