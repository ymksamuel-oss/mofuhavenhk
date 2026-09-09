import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import crypto from "node:crypto";

const SOURCE_ORIGIN = "https://www.wt-japan.com";
const STORAGE_BUCKET = "public-images";
const RATE_LIMIT = 20;
const REQUEST_TIMEOUT_MS = 25_000;
const USER_AGENT = "MofuHavenHK product-image-sync/1.0";

type Product = { id: string; name: string; images: unknown };
type SyncItem = { id: string; name: string; status: string; sourceUrl?: string; imageUrl?: string; error?: string };

async function isAdmin() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function normalizeName(value: unknown) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u00a0\u3000]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("zh-Hant");
}

function hasUsableImages(value: unknown) {
  return Array.isArray(value) && value.some((item) => typeof item === "string" && /^https?:\/\//i.test(item.trim()));
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

async function findExactSourceProduct(name: string) {
  const response = await fetchWithTimeout(`${SOURCE_ORIGIN}/search?q=${encodeURIComponent(name)}&options%5Bprefix%5D=none`, { headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`wt-japan 搜尋失敗：HTTP ${response.status}`);
  const html = await response.text();
  const marker = "var meta = ";
  const start = html.indexOf(marker);
  const end = start < 0 ? -1 : html.indexOf(";</script>", start + marker.length);
  if (start < 0 || end < 0) return null;
  let candidates: Array<{ handle?: string }> = [];
  try {
    const meta = JSON.parse(html.slice(start + marker.length, end)) as { products?: Array<{ handle?: string }> };
    candidates = Array.isArray(meta.products) ? meta.products.slice(0, 50) : [];
  } catch {
    return null;
  }
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const handle = String(candidate.handle || "").trim();
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
    const productResponse = await fetchWithTimeout(`${SOURCE_ORIGIN}/products/${encodeURIComponent(handle)}.js`, { headers: { Accept: "application/json" } });
    if (!productResponse.ok) continue;
    const product = await productResponse.json() as { title?: string; images?: unknown };
    const images = Array.isArray(product.images) ? product.images.filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url)) : [];
    if (normalizeName(product.title) === normalizeName(name) && images[0]) {
      return { title: String(product.title), handle, imageUrl: images[0], productUrl: `${SOURCE_ORIGIN}/products/${handle}` };
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
  const objectPath = `wt-japan/${productId}-${digest}.${extension(response.headers.get("content-type"), imageUrl)}`;
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
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), RATE_LIMIT) : 5;
  const apply = body.apply === true;
  const overwrite = body.overwrite === true;
  const { data, error } = await supabase.from("products").select("id,name,images").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: `讀取產品失敗：${error.message}` }, { status: 500 });
  const products = ((data || []) as Product[]).filter((product) => overwrite || !hasUsableImages(product.images)).slice(0, limit);
  const items: SyncItem[] = [];
  let matched = 0;
  let uploaded = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  for (const product of products) {
    const item: SyncItem = { id: product.id, name: product.name, status: "pending" };
    try {
      const match = await findExactSourceProduct(product.name);
      if (!match) {
        item.status = "no_exact_match";
        skipped += 1;
        items.push(item);
        continue;
      }
      matched += 1;
      item.sourceUrl = match.productUrl;
      if (!apply) {
        item.status = "would_update";
        items.push(item);
        continue;
      }
      const publicUrl = await uploadImage(match.imageUrl, product.id, supabase);
      uploaded += 1;
      const { error: updateError } = await supabase.from("products").update({ images: [publicUrl] }).eq("id", product.id);
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
  return NextResponse.json({ mode: apply ? "apply" : "dry-run", limit, overwrite, totalCandidates: products.length, matched, uploaded, updated, skipped, failed, items });
}
