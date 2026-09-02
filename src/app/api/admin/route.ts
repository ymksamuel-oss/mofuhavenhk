import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, createAdminToken, verifyAdminPassword, verifyAdminToken } from "@/lib/admin-auth";
import { getStripeImagesForSupabaseRows } from "@/lib/catalog-server";
import { getSupabaseAdmin } from "@/lib/supabase";

const tables = new Set(["categories", "products", "banners", "coupons", "orders", "store_settings"]);
const secretKeys = new Set(["stripe_secret_key", "stripe_publishable_key", "stripe_webhook_secret", "payment_api_key"]);
const MAX_PRODUCT_IMAGES = 8;

async function isAdmin() { const jar = await cookies(); return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value); }
function cleanRow(table: string, row: Record<string, unknown>) { if (table === "store_settings" && secretKeys.has(String(row.key))) return { ...row, value: "••••••••" }; return row; }
function normalizeProductImages(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      values
        .flatMap((item) => (typeof item === "string" ? item.split(/[\r\n,|;]+/) : []))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_PRODUCT_IMAGES);
}

export async function GET(request: Request) {
  const table = new URL(request.url).searchParams.get("table") || "";
  if (!tables.has(table)) return NextResponse.json({ error: "invalid_table" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let query = supabase.from(table).select("*");
  if (table === "categories" || table === "banners") query = query.order("sort_order", { ascending: true });
  if (table === "orders" || table === "products") query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data || [];
  if (table === "products") {
    const stripeImages = await getStripeImagesForSupabaseRows(rows);
    rows = rows.map((row) => {
      if (Array.isArray(row.images) && row.images.length > 0) return row;
      const fallbackImages = stripeImages.get(String(row.source_product_id || "")) || [];
      return fallbackImages.length > 0 ? { ...row, images: fallbackImages } : row;
    });
  }

  return NextResponse.json({ data: rows.map((row) => cleanRow(table, row)) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.action === "login") {
    if (!verifyAdminPassword(String(body.password || ""))) return NextResponse.json({ error: "invalid_password" }, { status: 401 });
    const response = NextResponse.json({ ok: true }); response.cookies.set(ADMIN_COOKIE, createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 }); return response;
  }
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (body.action === "logout") { const response = NextResponse.json({ ok: true }); response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" }); return response; }
  const table = String(body.table || ""); if (!tables.has(table)) return NextResponse.json({ error: "invalid_table" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const payload = { ...(body.row || {}) }; delete payload.id; delete payload.created_at; delete payload.updated_at;
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Banner 新增預設加入現有 slider；只有管理員明確選擇覆蓋時才清除舊記錄。
  if (table === "banners" && data?.id && body.replaceExisting === true) {
    const { error: cleanupError } = await supabase.from("banners").delete().neq("id", data.id);
    if (cleanupError) return NextResponse.json({ error: `新 Banner 已儲存，但清除舊 Banner 失敗：${cleanupError.message}` }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})); const table = String(body.table || ""); const id = String(body.id || ""); const key = String(body.key || body.row?.key || "");
  if (!tables.has(table) || (!id && !(table === "store_settings" && key))) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const payload = { ...(body.row || {}), ...(table === "store_settings" ? { updated_at: new Date().toISOString() } : {}) }; delete payload.id; delete payload.created_at;
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  if (table === "store_settings" && secretKeys.has(String(payload.key)) && payload.value === "••••••••") delete payload.value;
  const base = supabase.from(table).update(payload); const filtered = table === "store_settings" ? base.eq("key", key) : base.eq("id", id); const { data, error } = await filtered.select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})); const table = String(body.table || ""); const id = String(body.id || ""); const key = String(body.key || "");
  if (!tables.has(table) || (!id && !(table === "store_settings" && key))) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const query = table === "store_settings" ? supabase.from(table).delete().eq("key", key) : supabase.from(table).delete().eq("id", id); const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true });
}
