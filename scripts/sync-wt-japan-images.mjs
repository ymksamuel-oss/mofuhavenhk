#!/usr/bin/env node

/**
 * Fill missing Supabase product images from the public wt-japan.com Shopify catalog.
 *
 * Safe defaults:
 *   - dry-run: no uploads or database writes
 *   - exact normalized product-title match only
 *   - only products with no usable existing images are changed
 *
 * Required environment variables:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Examples:
 *   node scripts/sync-wt-japan-images.mjs
 *   node scripts/sync-wt-japan-images.mjs --apply
 *   node scripts/sync-wt-japan-images.mjs --apply --limit 20
 *   node scripts/sync-wt-japan-images.mjs --apply --name "CIAO ..."
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_ORIGIN = "https://www.wt-japan.com";
const STORAGE_BUCKET = "public-images";
const MAX_SEARCH_RESULTS = 50;
const REQUEST_TIMEOUT_MS = 25_000;
const USER_AGENT = "MofuHavenHK product-image-sync/1.0";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const apply = process.argv.includes("--apply");
const overwrite = process.argv.includes("--overwrite");
const limit = Math.max(0, Number(argValue("--limit") || 0));
const onlyName = argValue("--name");
const reportPath = argValue("--report") || "data/wt-japan-image-sync-report.json";

const supabaseUrl = String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u00a0\u3000]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("zh-Hant");
}

function hasUsableImages(value) {
  if (!Array.isArray(value)) return false;
  return value.some((item) => typeof item === "string" && /^https?:\/\//i.test(item.trim()));
}

function safeFileExtension(contentType, sourceUrl) {
  const typeExtension = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  }[String(contentType || "").split(";")[0].toLowerCase()];
  if (typeExtension) return typeExtension;
  const extension = path.extname(new URL(sourceUrl).pathname).toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension || "jpg";
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      headers: { "User-Agent": USER_AGENT, ...(options.headers || {}) },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

async function fetchProducts() {
  const rows = [];
  let offset = 0;
  while (true) {
    const url = `${supabaseUrl}/rest/v1/products?select=id,name,images&order=created_at.desc&limit=1000&offset=${offset}`;
    const response = await fetchWithTimeout(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Supabase product read failed: HTTP ${response.status} ${await response.text()}`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
    offset += 1000;
  }
}

function extractSearchProducts(html) {
  const marker = "var meta = ";
  const start = html.indexOf(marker);
  if (start < 0) return [];
  const jsonStart = start + marker.length;
  const end = html.indexOf(";</script>", jsonStart);
  if (end < 0) return [];
  try {
    const meta = JSON.parse(html.slice(jsonStart, end));
    return Array.isArray(meta?.products) ? meta.products : [];
  } catch {
    return [];
  }
}

async function searchExactSourceProduct(name) {
  const searchUrl = `${SOURCE_ORIGIN}/search?q=${encodeURIComponent(name)}&options%5Bprefix%5D=none`;
  const response = await fetchWithTimeout(searchUrl, { headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`wt-japan search failed: HTTP ${response.status}`);
  const html = await response.text();
  const candidates = extractSearchProducts(html).slice(0, MAX_SEARCH_RESULTS);
  const checkedHandles = new Set();
  for (const candidate of candidates) {
    const handle = String(candidate.handle || "").trim();
    if (!handle || checkedHandles.has(handle)) continue;
    checkedHandles.add(handle);
    const productUrl = `${SOURCE_ORIGIN}/products/${encodeURIComponent(handle)}.js`;
    try {
      const product = await fetchJson(productUrl);
      if (normalizeName(product.title) !== normalizeName(name)) continue;
      const image = Array.isArray(product.images) ? product.images.find((url) => /^https?:\/\//i.test(String(url))) : "";
      if (!image) continue;
      return { title: product.title, handle, imageUrl: image, productUrl: `${SOURCE_ORIGIN}/products/${handle}` };
    } catch (error) {
      console.warn(`[source] unable to inspect ${handle}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return null;
}

async function uploadImage(imageUrl, productId) {
  const response = await fetchWithTimeout(imageUrl, { headers: { Accept: "image/avif,image/webp,image/*" } });
  if (!response.ok) throw new Error(`image download failed: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) throw new Error("downloaded image is empty");
  const digest = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 12);
  const extension = safeFileExtension(contentType, imageUrl);
  const objectPath = `wt-japan/${productId}-${digest}.${extension}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`;
  const uploadResponse = await fetchWithTimeout(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!uploadResponse.ok) throw new Error(`Supabase image upload failed: HTTP ${uploadResponse.status} ${await uploadResponse.text()}`);
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}

async function updateProductImages(productId, imageUrl) {
  const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ images: [imageUrl] }),
  });
  if (!response.ok) throw new Error(`Supabase product update failed: HTTP ${response.status} ${await response.text()}`);
}

async function main() {
  const allProducts = await fetchProducts();
  const selected = allProducts
    .filter((product) => !onlyName || normalizeName(product.name) === normalizeName(onlyName))
    .filter((product) => overwrite || !hasUsableImages(product.images))
    .slice(0, limit || undefined);
  const report = {
    startedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    overwrite,
    source: SOURCE_ORIGIN,
    totalProducts: allProducts.length,
    selectedProducts: selected.length,
    matched: 0,
    uploaded: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    items: [],
  };

  for (const product of selected) {
    const item = { id: product.id, name: product.name, status: "pending" };
    try {
      const match = await searchExactSourceProduct(product.name);
      if (!match) {
        item.status = "no_exact_match";
        report.skipped += 1;
        report.items.push(item);
        console.log(`[skip] ${product.name} — no exact wt-japan title match`);
        continue;
      }
      item.match = match;
      report.matched += 1;
      if (!apply) {
        item.status = "would_update";
        report.items.push(item);
        console.log(`[dry-run] ${product.name} ← ${match.productUrl}`);
        continue;
      }
      const publicImageUrl = await uploadImage(match.imageUrl, product.id);
      report.uploaded += 1;
      await updateProductImages(product.id, publicImageUrl);
      report.updated += 1;
      item.status = "updated";
      item.imageUrl = publicImageUrl;
      report.items.push(item);
      console.log(`[updated] ${product.name} ← ${publicImageUrl}`);
    } catch (error) {
      item.status = "failed";
      item.error = error instanceof Error ? error.message : String(error);
      report.failed += 1;
      report.items.push(item);
      console.error(`[failed] ${product.name}: ${item.error}`);
    }
  }

  report.finishedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nCompleted: matched=${report.matched}, updated=${report.updated}, skipped=${report.skipped}, failed=${report.failed}`);
  console.log(`Report: ${reportPath}`);
  if (report.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
