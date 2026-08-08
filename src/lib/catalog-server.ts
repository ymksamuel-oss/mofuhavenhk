import "server-only";

import { cache } from "react";
import {
  applyProductPriceOverrides,
  parseProductOverridesCsv,
} from "@/lib/catalog-overrides";
import { PRODUCTS, type Product } from "@/lib/products";

const DEFAULT_GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1zTZxk-cidcgcmGsM79jMQD72Fznmd7CfAQNS79pp6i0/export?format=csv";

export type CatalogSnapshot = {
  products: Product[];
  source: "google-sheet" | "static";
  matchedOverrides: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return parsed;
}

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
  const revalidateSeconds = positiveInteger(
    process.env.GOOGLE_SHEET_PRICE_CACHE_SECONDS,
    60,
  );
  const timeoutMs = Math.max(
    1000,
    Math.min(
      positiveInteger(process.env.GOOGLE_SHEET_TIMEOUT_MS, 5000),
      15000,
    ),
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      ...(revalidateSeconds === 0
        ? { cache: "no-store" as const }
        : { next: { revalidate: revalidateSeconds } }),
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

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const url = getGoogleSheetCsvUrl();
    const csv = await fetchSheetCsv(url);
    const parsed = parseProductOverridesCsv(csv);
    const merged = applyProductPriceOverrides(PRODUCTS, parsed.overrides);
    if (merged.matchedOverrides === 0) {
      throw new Error(
        "Google Sheet has valid rows, but none match the code catalog IDs",
      );
    }

    return {
      products: merged.products,
      source: "google-sheet",
      matchedOverrides: merged.matchedOverrides,
    };
  } catch (error) {
    console.error(
      "[catalog] Google Sheet price override failed; using static PRODUCTS fallback.",
      error instanceof Error ? error.message : String(error),
    );
    return {
      products: PRODUCTS,
      source: "static",
      matchedOverrides: 0,
    };
  }
}

/** Deduplicates repeated catalog reads within one React server render. */
export const getCatalogSnapshot = cache(loadCatalogSnapshot);
