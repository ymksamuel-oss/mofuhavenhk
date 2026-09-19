import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import crypto from "node:crypto";

const SOURCE_ORIGIN = "https://best-partner.co.jp";
const STORAGE_BUCKET = "public-images";
const RATE_LIMIT = 50;
const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT = "MofuHavenHK official-product-image-sync/2.0 (+https://mofuhavenhk.com)";

type Product = {
  id: string;
  name: unknown;
  mofu_sku?: unknown;
  images: unknown;
};

type SourceMatch = {
  title: string;
  jan?: string;
  handle: string;
  imageUrl: string;
  productUrl: string;
  method: "JAN" | "日文品名";
};

type SyncItem = {
  id: string;
  name: string;
  status: string;
  matchMethod?: string;
  sourceTitle?: string;
  sourceJan?: string;
  sourceUrl?: string;
  imageUrl?: string;
  error?: string;
};

async function isAdmin() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u00a0\u3000]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceName(value: unknown) {
  const normalized = normalizeText(value);
  const afterPipe = normalized.includes("|") ? normalized.split("|").pop() || normalized : normalized;
  return afterPipe
    .replace(/^日本原裝\s*/i, "")
    .replace(/^Best Partner\s*/i, "")
    .replace(/^天然寵物零食\s*/i, "")
    .trim();
}

function compactName(value: unknown) {
  return sourceName(value)
    .toLocaleLowerCase("ja-JP")
    .replace(/\b\d+(?:\.\d+)?\s*(?:g|kg|ml|本|個|袋|支|入|枚|パック)\b/gi, "")
    .replace(/[ＳＭＬＬＬ]+$/u, "")
    .replace(/[\s・･,，、/／|｜()（）［］【】「」『』\-–—:：]/g, "")
    .trim();
}

function janCode(value: unknown) {
  const normalized = normalizeText(value).replace(/\D/g, "");
  return /^\d{13}$/.test(normalized) ? normalized : "";
}

function hasUsableImages(value: unknown) {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && /^https?:\/\//i.test(item.trim()));
}

function existingImages(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item.trim()))
    : [];
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
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

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function searchResultUrls(html: string) {
  const urls = new Set<string>();
  for (const match of html.matchAll(/(?:https:\/\/best-partner\.co\.jp)?\/archives\/(\d+)\//g)) {
    urls.add(`${SOURCE_ORIGIN}/archives/${match[1]}/`);
  }
  return [...urls];
}

function extractPageTitle(html: string) {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1];
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  return decodeHtml((ogTitle || heading || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function extractJan(html: string) {
  const text = normalizeText(html.replace(/<[^>]+>/g, " "));
  const match = text.match(/(?:JAN|ＪＡＮ)[^0-9０-９]{0,80}([0-9０-９]{13})/i);
  return janCode(match?.[1]);
}

function extractOriginalImages(html: string, jan?: string) {
  const urls = new Set<string>();
  for (const match of html.matchAll(/https:\/\/best-partner\.co\.jp\/wp\/wp\/wp-content\/uploads\/[^"'\s)<>]+\.(?:jpe?g|png|webp)(?:\?[^"'\s)<>]+)?/gi)) {
    urls.add(decodeHtml(match[0]));
  }
  const candidates = [...urls].filter((url) => !/-\d+x\d+(?=\.[a-z]+(?:\?|$))/i.test(url));
  if (!candidates.length) return [];
  const score = (url: string) => {
    const file = url.split("/").pop() || "";
    if (jan && new RegExp(`/${jan}(?:\\.[a-z]+|[-.]|$)`, "i").test(`/${file}`)) return 0;
    if (jan && new RegExp(`/${jan}-1(?:\\.[a-z]+|[-.]|$)`, "i").test(`/${file}`)) return 1;
    return 2;
  };
  return candidates.sort((a, b) => score(a) - score(b));
}

async function findExactSourceProduct(name: unknown, sku: unknown): Promise<SourceMatch | null> {
  const jan = janCode(sku);
  const cleaned = sourceName(name);
  const queries = [...new Set([jan, cleaned].filter(Boolean))];

  for (const query of queries) {
    const searchUrl = `${SOURCE_ORIGIN}/?s=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(searchUrl, { headers: { Accept: "text/html" } });
    if (!response.ok) continue;
    const html = await response.text();
    for (const productUrl of searchResultUrls(html).slice(0, 30)) {
      const productResponse = await fetchWithTimeout(productUrl, { headers: { Accept: "text/html" } });
      if (!productResponse.ok) continue;
      const productHtml = await productResponse.text();
      const sourceJan = extractJan(productHtml);
      const title = extractPageTitle(productHtml);
      const janMatches = Boolean(jan && sourceJan && jan === sourceJan);
      const nameMatches = Boolean(cleaned && title && compactName(title) === compactName(cleaned));
      if (!janMatches && !nameMatches) continue;
      const imageUrl = extractOriginalImages(productHtml, sourceJan || jan)[0];
      if (!imageUrl) continue;
      return {
        title,
        jan: sourceJan || jan || undefined,
        handle: productUrl.split("/archives/")[1]?.replace(/\/$/, "") || "",
        imageUrl,
        productUrl,
        method: janMatches ? "JAN" : "日文品名",
      };
    }
  }
  return null;
}

function extension(contentType: string | null, sourceUrl: string) {
  const known: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  const type = String(contentType || "").split(";")[0].toLowerCase();
  if (known[type]) return known[type];
  return new URL(sourceUrl).pathname.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
}

async function uploadImage(imageUrl: string, productId: string, supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  const response = await fetchWithTimeout(imageUrl, { headers: { Accept: "image/avif,image/webp,image/*" } });
  if (!response.ok) throw new Error(`圖片下載失敗：HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error("下載圖片為空");
  const digest = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 12);
  const objectPath = `best-partner/${productId}-${digest}.${extension(response.headers.get("content-type"), imageUrl)}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, bytes, {
    contentType: response.headers.get("content-type") || "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`Supabase 圖片上傳失敗：${error.message}`);
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { limit?: unknown; apply?: unknown; overwrite?: unknown };
  const requestedLimit = Number(body.limit);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), RATE_LIMIT) : 10;
  const apply = body.apply === true;
  const overwrite = body.overwrite === true;
  const { data, error } = await supabase
    .from("products")
    .select("id,name,mofu_sku,images")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: `讀取產品失敗：${error.message}` }, { status: 500 });
  const products = ((data || []) as Product[]).filter((product) => overwrite || !hasUsableImages(product.images)).slice(0, limit);
  const items: SyncItem[] = [];
  let matched = 0;
  let uploaded = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const displayName = typeof product.name === "string" ? product.name : JSON.stringify(product.name);
    const item: SyncItem = { id: product.id, name: displayName, status: "pending" };
    try {
      const match = await findExactSourceProduct(product.name, product.mofu_sku);
      if (!match) {
        item.status = "no_match";
        skipped += 1;
        items.push(item);
        continue;
      }
      matched += 1;
      item.matchMethod = match.method;
      item.sourceTitle = match.title;
      item.sourceJan = match.jan;
      item.sourceUrl = match.productUrl;
      item.imageUrl = match.imageUrl;
      if (!apply) {
        item.status = "would_update";
        items.push(item);
        continue;
      }
      const publicUrl = await uploadImage(match.imageUrl, product.id, supabase);
      uploaded += 1;
      const mergedImages = [publicUrl, ...existingImages(product.images).filter((image) => image !== publicUrl)].slice(0, 8);
      const { error: updateError } = await supabase.from("products").update({ images: mergedImages }).eq("id", product.id);
      if (updateError) throw new Error(`產品更新失敗：${updateError.message}`);
      updated += 1;
      item.status = "updated";
      item.imageUrl = publicUrl;
      items.push(item);
    } catch (error) {
      failed += 1;
      item.status = "failed";
      item.error = error instanceof Error ? error.message : String(error);
      items.push(item);
    }
  }

  return NextResponse.json({ mode: apply ? "apply" : "dry-run", limit, overwrite, source: SOURCE_ORIGIN, totalCandidates: products.length, matched, uploaded, updated, skipped, failed, items });
}
