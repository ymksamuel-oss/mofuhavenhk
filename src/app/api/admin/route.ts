import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, createAdminToken, verifyAdminPassword, verifyAdminToken } from "@/lib/admin-auth";
import { getStripeImagesForSupabaseRows } from "@/lib/catalog-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { FEATURED_PET_GALLERY_SETTING_KEY, isFeaturedPetLink, MAX_FEATURED_PETS } from "@/lib/featured-pets";
import {
  CATEGORY_LOCALIZATIONS_SETTING_KEY,
  normalizeCategoryLocalization,
  parseCategoryLocalizations,
} from "@/lib/category-localizations";
import {
  PRODUCT_LOCALIZATIONS_SETTING_KEY,
  normalizeProductLocalization,
  parseProductLocalizations,
} from "@/lib/product-localizations";

const tables = new Set(["categories", "products", "banners", "coupons", "orders", "store_settings"]);
const secretKeys = new Set(["stripe_secret_key", "stripe_publishable_key", "stripe_webhook_secret", "payment_api_key"]);
const MAX_PRODUCT_IMAGES = 8;
const MAX_BANNERS = 4;

type FeaturedPetPayload = {
  image_url: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  link: string | null;
  sort_order: number;
  is_published: boolean;
};

type BannerPayload = {
  image_url: string;
  mobile_image_url: string | null;
  link: string | null;
  title: string | null;
  sort_order: number;
};

function normalizeBannerBatch(value: unknown): { banners: BannerPayload[]; error?: string } {
  if (!Array.isArray(value)) return { banners: [], error: "invalid_banners" };
  if (value.length > MAX_BANNERS) return { banners: [], error: `最多只可儲存 ${MAX_BANNERS} 組 Banner` };

  const banners: BannerPayload[] = [];
  const usedSortOrders = new Set<number>();
  for (const [index, valueAtIndex] of value.entries()) {
    if (!valueAtIndex || typeof valueAtIndex !== "object" || Array.isArray(valueAtIndex)) {
      return { banners: [], error: `第 ${index + 1} 組 Banner 格式不正確` };
    }

    const row = valueAtIndex as Record<string, unknown>;
    const imageUrl = typeof row.image_url === "string" ? row.image_url.trim() : "";
    if (!imageUrl) return { banners: [], error: `第 ${index + 1} 組 Banner 必須提供桌面版圖片` };

    const sortOrder = Number(row.sort_order);
    if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
      return { banners: [], error: `第 ${index + 1} 組 Banner 的排序必須是 0 或以上的整數` };
    }
    if (usedSortOrders.has(sortOrder)) {
      return { banners: [], error: `Banner 排序不可重複（第 ${index + 1} 組）` };
    }
    usedSortOrders.add(sortOrder);
    banners.push({
      image_url: imageUrl,
      mobile_image_url: typeof row.mobile_image_url === "string" && row.mobile_image_url.trim() ? row.mobile_image_url.trim() : null,
      link: typeof row.link === "string" && row.link.trim() ? row.link.trim() : null,
      title: typeof row.title === "string" && row.title.trim() ? row.title.trim() : null,
      sort_order: sortOrder,
    });
  }

  if (banners.length === 1) return { banners: [], error: "輪播至少需要兩組 Banner；如要清空，請保留四格為空後儲存。" };
  return { banners };
}

function normalizeFeaturedPetBatch(value: unknown): { pets: FeaturedPetPayload[]; error?: string } {
  if (!Array.isArray(value)) return { pets: [], error: "invalid_featured_pets" };
  if (value.length > MAX_FEATURED_PETS) return { pets: [], error: `最多只可儲存 ${MAX_FEATURED_PETS} 個精選寵物內容槽` };

  const pets: FeaturedPetPayload[] = [];
  const usedSortOrders = new Set<number>();
  for (const [index, valueAtIndex] of value.entries()) {
    if (!valueAtIndex || typeof valueAtIndex !== "object" || Array.isArray(valueAtIndex)) {
      return { pets: [], error: `第 ${index + 1} 個內容槽格式不正確` };
    }

    const row = valueAtIndex as Record<string, unknown>;
    const imageUrl = typeof row.image_url === "string" ? row.image_url.trim() : "";
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const titleEn = typeof row.title_en === "string" ? row.title_en.trim() : "";
    const description = typeof row.description === "string" ? row.description.trim() : "";
    const descriptionEn = typeof row.description_en === "string" ? row.description_en.trim() : "";
    const link = typeof row.link === "string" ? row.link.trim() : "";
    const sortOrder = Number(row.sort_order);

    if (!/^https?:\/\//i.test(imageUrl)) return { pets: [], error: `第 ${index + 1} 個內容槽必須提供有效圖片網址` };
    if (!title) return { pets: [], error: `第 ${index + 1} 個內容槽必須填寫標題` };
    if (!description) return { pets: [], error: `第 ${index + 1} 個內容槽必須填寫詳細描述` };
    if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
      return { pets: [], error: `第 ${index + 1} 個內容槽的排序必須是 0 或以上的整數` };
    }
    if (usedSortOrders.has(sortOrder)) return { pets: [], error: `精選寵物排序不可重複（第 ${index + 1} 個內容槽）` };
    if (link && !isFeaturedPetLink(link)) return { pets: [], error: `第 ${index + 1} 個內容槽的連結必須以 /、http:// 或 https:// 開頭` };

    usedSortOrders.add(sortOrder);
    pets.push({
      image_url: imageUrl.slice(0, 2_000),
      title: title.slice(0, 160),
      title_en: titleEn ? titleEn.slice(0, 160) : null,
      description: description.slice(0, 2_000),
      description_en: descriptionEn ? descriptionEn.slice(0, 2_000) : null,
      link: link ? link.slice(0, 2_000) : null,
      sort_order: sortOrder,
      is_published: row.is_published !== false,
    });
  }
  return { pets };
}

async function replaceFeaturedPets(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  pets: FeaturedPetPayload[],
) {
  return supabase
    .from("store_settings")
    .upsert({
      key: FEATURED_PET_GALLERY_SETTING_KEY,
      value: JSON.stringify(pets),
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" })
    .select("key,value,updated_at")
    .single();
}

async function upsertCategoryLocalization(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  id: string,
  candidate: unknown,
) {
  const { data: existing, error: readError } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", CATEGORY_LOCALIZATIONS_SETTING_KEY)
    .maybeSingle();
  if (readError) return { data: null, error: readError };

  const localizations = parseCategoryLocalizations(existing?.value);
  const next = {
    ...localizations,
    [id]: normalizeCategoryLocalization(candidate),
  };
  return supabase
    .from("store_settings")
    .upsert({
      key: CATEGORY_LOCALIZATIONS_SETTING_KEY,
      value: JSON.stringify(next),
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" })
    .select("key,value,updated_at")
    .single();
}

async function upsertProductLocalization(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  id: string,
  candidate: unknown,
) {
  const { data: existing, error: readError } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", PRODUCT_LOCALIZATIONS_SETTING_KEY)
    .maybeSingle();
  if (readError) return { data: null, error: readError };

  const localizations = parseProductLocalizations(existing?.value);
  const next = {
    ...localizations,
    [id]: normalizeProductLocalization(candidate),
  };
  return supabase
    .from("store_settings")
    .upsert({
      key: PRODUCT_LOCALIZATIONS_SETTING_KEY,
      value: JSON.stringify(next),
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" })
    .select("key,value,updated_at")
    .single();
}

async function replaceBanners(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  banners: BannerPayload[],
) {
  if (banners.length === 0) {
    const { error } = await supabase.from("banners").delete().not("id", "is", null);
    return { data: [], error };
  }

  // Insert the complete new set first so a transient insert failure never clears the current slider.
  const { data: inserted, error: insertError } = await supabase.from("banners").insert(banners).select();
  if (insertError || !inserted) return { data: null, error: insertError || new Error("banner_insert_failed") };

  const insertedIds = inserted.map((banner) => String(banner.id)).filter(Boolean);
  const { error: cleanupError } = await supabase
    .from("banners")
    .delete()
    .not("id", "in", `(${insertedIds.join(",")})`);

  return { data: inserted, error: cleanupError };
}

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
  if (!tables.has(table) && table !== "featured_pets") return NextResponse.json({ error: "invalid_table" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (table === "featured_pets") {
    const { data, error } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", FEATURED_PET_GALLERY_SETTING_KEY)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    try {
      const entries = data?.value ? JSON.parse(data.value) : [];
      return NextResponse.json({ data: Array.isArray(entries) ? entries : [] });
    } catch {
      return NextResponse.json({ data: [] });
    }
  }
  let query = supabase.from(table).select("*");
  if (table === "categories" || table === "banners") query = query.order("sort_order", { ascending: true });
  if (table === "orders" || table === "products") query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data || [];
  if (table === "categories") {
    const { data: localizationSetting } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", CATEGORY_LOCALIZATIONS_SETTING_KEY)
      .maybeSingle();
    const localizations = parseCategoryLocalizations(localizationSetting?.value);
    rows = rows.map((row) => ({ ...row, ...(localizations[String(row.id)] || {}) }));
  }
  if (table === "products") {
    const { data: localizationSetting } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", PRODUCT_LOCALIZATIONS_SETTING_KEY)
      .maybeSingle();
    const localizations = parseProductLocalizations(localizationSetting?.value);
    rows = rows.map((row) => ({ ...row, ...(localizations[String(row.id)] || {}) }));
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
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });

  if (body.action === "replace_featured_pets") {
    const { pets, error: validationError } = normalizeFeaturedPetBatch(body.pets);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { data, error } = await replaceFeaturedPets(supabase, pets);
    if (error) return NextResponse.json({ error: `精選寵物內容儲存失敗：${error.message}` }, { status: 500 });
    return NextResponse.json({ data, count: pets.length });
  }

  if (body.action === "replace_banners") {
    const { banners, error: validationError } = normalizeBannerBatch(body.banners);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { data, error } = await replaceBanners(supabase, banners);
    if (error) return NextResponse.json({ error: `Banner 儲存失敗：${error.message}` }, { status: 500 });
    return NextResponse.json({ data, count: data?.length || 0 });
  }

  const table = String(body.table || ""); if (!tables.has(table)) return NextResponse.json({ error: "invalid_table" }, { status: 400 });
  if (table === "banners") return NextResponse.json({ error: "請使用四格 Banner 批量儲存功能。" }, { status: 400 });
  const payload = { ...(body.row || {}) }; delete payload.id; delete payload.created_at; delete payload.updated_at;
  const categoryLocalization = table === "categories" ? normalizeCategoryLocalization(payload) : null;
  const productLocalization = table === "products" ? normalizeProductLocalization(payload) : null;
  if (table === "categories") { delete payload.name_zh; delete payload.name_en; }
  if (table === "products") { delete payload.name_en; delete payload.description_en; }
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (table === "categories" && categoryLocalization) {
    const { error: localizationError } = await upsertCategoryLocalization(supabase, String(data.id), categoryLocalization);
    if (localizationError) return NextResponse.json({ error: localizationError.message }, { status: 500 });
  }
  if (table === "products" && productLocalization) {
    const { error: localizationError } = await upsertProductLocalization(supabase, String(data.id), productLocalization);
    if (localizationError) return NextResponse.json({ error: localizationError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})); const table = String(body.table || ""); const id = String(body.id || ""); const key = String(body.key || body.row?.key || "");
  if (!tables.has(table) || (!id && !(table === "store_settings" && key))) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const payload = { ...(body.row || {}), ...(table === "store_settings" ? { updated_at: new Date().toISOString() } : {}) }; delete payload.id; delete payload.created_at;
  const categoryLocalization = table === "categories" ? normalizeCategoryLocalization(payload) : null;
  const productLocalization = table === "products" ? normalizeProductLocalization(payload) : null;
  if (table === "categories") { delete payload.name_zh; delete payload.name_en; }
  if (table === "products") { delete payload.name_en; delete payload.description_en; }
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  if (table === "store_settings" && secretKeys.has(String(payload.key)) && payload.value === "••••••••") delete payload.value;
  const base = supabase.from(table).update(payload); const filtered = table === "store_settings" ? base.eq("key", key) : base.eq("id", id); const { data, error } = await filtered.select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (table === "categories" && categoryLocalization) {
    const { error: localizationError } = await upsertCategoryLocalization(supabase, id, categoryLocalization);
    if (localizationError) return NextResponse.json({ error: localizationError.message }, { status: 500 });
  }
  if (table === "products" && productLocalization) {
    const { error: localizationError } = await upsertProductLocalization(supabase, id, productLocalization);
    if (localizationError) return NextResponse.json({ error: localizationError.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})); const table = String(body.table || ""); const id = String(body.id || ""); const key = String(body.key || "");
  if (!tables.has(table) || (!id && !(table === "store_settings" && key))) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const query = table === "store_settings"
    ? supabase.from(table).delete().eq("key", key).select("key")
    : supabase.from(table).delete().eq("id", id).select("id");
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0) return NextResponse.json({ error: "not_found_or_not_deleted" }, { status: 404 });
  return NextResponse.json({ ok: true, deleted: data.length });
}
