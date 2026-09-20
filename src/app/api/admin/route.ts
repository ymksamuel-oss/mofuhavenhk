import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, createAdminToken, verifyAdminPassword, verifyAdminToken } from "@/lib/admin-auth";
import { getStripeImagesForSupabaseRows } from "@/lib/catalog-server";
import { orderProductImages } from "@/lib/catalog-images";
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

const tables = new Set(["categories", "products", "brands", "banners", "coupons", "orders", "store_settings"]);
const secretKeys = new Set(["stripe_secret_key", "stripe_publishable_key", "stripe_webhook_secret", "payment_api_key"]);
const PRODUCT_COSTS_SETTING_KEY = "admin_product_costs";
const MAX_PRODUCT_IMAGES = 8;
const MAX_BANNERS = 4;
const PRODUCT_PUBLISH_FIELDS = ["\u4e2d\u6587\u54c1\u540d", "\u82f1\u6587\u54c1\u540d", "\u4e2d\u6587\u8a73\u7d30\u6558\u8ff0", "\u82f1\u6587\u8a73\u7d30\u6558\u8ff0", "\u6709\u6548\u552e\u50f9", "\u5eab\u5b58（\u9700\u5927\u65bc 0）", "\u5716\u7247 URL"];

type ProductCost = { cost_jpy: number; shipping_hkd: number; markup_multiplier: number; exchange_rate: number };

function parseProductCosts(value: unknown): Record<string, ProductCost> {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([id, raw]) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const item = raw as Record<string, unknown>;
      const cost_jpy = Number(item.cost_jpy);
      const shipping_hkd = Number(item.shipping_hkd);
      const markup_multiplier = Number(item.markup_multiplier);
      const exchange_rate = Number(item.exchange_rate);
      if (![cost_jpy, shipping_hkd, markup_multiplier, exchange_rate].every(Number.isFinite)) return [];
      return [[id, { cost_jpy, shipping_hkd, markup_multiplier, exchange_rate } satisfies ProductCost]];
    }));
  } catch { return {}; }
}

function normalizeProductCost(row: Record<string, unknown>): ProductCost | null {
  const values = {
    cost_jpy: Number(row.cost_jpy ?? 0),
    shipping_hkd: Number(row.shipping_hkd ?? 8),
    markup_multiplier: Number(row.markup_multiplier ?? 2.2),
    exchange_rate: Number(row.exchange_rate ?? 0.052),
  };
  return Object.values(values).every(Number.isFinite) && values.cost_jpy >= 0 && values.shipping_hkd >= 0 && values.markup_multiplier > 0 && values.exchange_rate > 0 ? values : null;
}

async function upsertProductCost(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>, id: string, row: Record<string, unknown>) {
  const { data: existing, error: readError } = await supabase.from("store_settings").select("value").eq("key", PRODUCT_COSTS_SETTING_KEY).maybeSingle();
  if (readError) return { error: readError };
  const costs = parseProductCosts(existing?.value);
  const cost = normalizeProductCost(row);
  if (cost) costs[id] = cost;
  else delete costs[id];
  const { error } = await supabase.from("store_settings").upsert({ key: PRODUCT_COSTS_SETTING_KEY, value: JSON.stringify(costs), updated_at: new Date().toISOString() }, { onConflict: "key" });
  return { error };
}

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
  if (value.length > MAX_BANNERS) return { banners: [], error: `\u6700\u591a\u53ea\u53ef\u5132\u5b58 ${MAX_BANNERS} \u7d44 Banner` };

  const banners: BannerPayload[] = [];
  const usedSortOrders = new Set<number>();
  for (const [index, valueAtIndex] of value.entries()) {
    if (!valueAtIndex || typeof valueAtIndex !== "object" || Array.isArray(valueAtIndex)) {
      return { banners: [], error: `\u7b2c ${index + 1} \u7d44 Banner \u683c\u5f0f\u4e0d\u6b63\u78ba` };
    }

    const row = valueAtIndex as Record<string, unknown>;
    const imageUrl = typeof row.image_url === "string" ? row.image_url.trim() : "";
    if (!imageUrl) return { banners: [], error: `\u7b2c ${index + 1} \u7d44 Banner \u5fc5\u9808\u63d0\u4f9b\u684c\u9762\u7248\u5716\u7247` };

    const sortOrder = Number(row.sort_order);
    if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
      return { banners: [], error: `\u7b2c ${index + 1} \u7d44 Banner \u7684\u6392\u5e8f\u5fc5\u9808\u662f 0 \u6216\u4ee5\u4e0a\u7684\u6574\u6578` };
    }
    if (usedSortOrders.has(sortOrder)) {
      return { banners: [], error: `Banner \u6392\u5e8f\u4e0d\u53ef\u91cd\u8907（\u7b2c ${index + 1} \u7d44）` };
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

  return { banners };
}

function normalizeFeaturedPetBatch(value: unknown): { pets: FeaturedPetPayload[]; error?: string } {
  if (!Array.isArray(value)) return { pets: [], error: "invalid_featured_pets" };
  if (value.length > MAX_FEATURED_PETS) return { pets: [], error: `\u6700\u591a\u53ea\u53ef\u5132\u5b58 ${MAX_FEATURED_PETS} \u500b\u7cbe\u9078\u5bf5\u7269\u5167\u5bb9\u69fd` };

  const pets: FeaturedPetPayload[] = [];
  const usedSortOrders = new Set<number>();
  for (const [index, valueAtIndex] of value.entries()) {
    if (!valueAtIndex || typeof valueAtIndex !== "object" || Array.isArray(valueAtIndex)) {
      return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u683c\u5f0f\u4e0d\u6b63\u78ba` };
    }

    const row = valueAtIndex as Record<string, unknown>;
    const imageUrl = typeof row.image_url === "string" ? row.image_url.trim() : "";
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const titleEn = typeof row.title_en === "string" ? row.title_en.trim() : "";
    const description = typeof row.description === "string" ? row.description.trim() : "";
    const descriptionEn = typeof row.description_en === "string" ? row.description_en.trim() : "";
    const link = typeof row.link === "string" ? row.link.trim() : "";
    const sortOrder = Number(row.sort_order);

    if (!/^https?:\/\//i.test(imageUrl)) return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u5fc5\u9808\u63d0\u4f9b\u6709\u6548\u5716\u7247\u7db2\u5740` };
    if (!title) return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u5fc5\u9808\u586b\u5beb\u6a19\u984c` };
    if (!description) return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u5fc5\u9808\u586b\u5beb\u8a73\u7d30\u63cf\u8ff0` };
    if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
      return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u7684\u6392\u5e8f\u5fc5\u9808\u662f 0 \u6216\u4ee5\u4e0a\u7684\u6574\u6578` };
    }
    if (usedSortOrders.has(sortOrder)) return { pets: [], error: `\u7cbe\u9078\u5bf5\u7269\u6392\u5e8f\u4e0d\u53ef\u91cd\u8907（\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd）` };
    if (link && !isFeaturedPetLink(link)) return { pets: [], error: `\u7b2c ${index + 1} \u500b\u5167\u5bb9\u69fd\u7684\u9023\u7d50\u5fc5\u9808\u4ee5 /、http:// \u6216 https:// \u958b\u982d` };

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
  return orderProductImages(
    values
      .flatMap((item) => (typeof item === "string" ? item.split(/[\r\n,|;]+/) : []))
      .map((item) => item.trim())
      .filter(Boolean),
  ).slice(0, MAX_PRODUCT_IMAGES);
}

function isValidImageUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\/\S+$/i.test(value.trim());
}

async function validateProductForPublishing(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  id: string | null,
  payload: Record<string, unknown>,
) {
  let existing: Record<string, unknown> = {};
  if (id) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`\u8b80\u53d6\u7522\u54c1\u767c\u5e03\u8cc7\u6599\u5931\u6557：${error.message}`);
    existing = data || {};
  }
  const candidate = { ...existing, ...payload };
  const sku = String(candidate.mofu_sku || "").trim();
  if (sku) {
    let duplicateQuery = supabase.from("products").select("id,name,mofu_sku").eq("mofu_sku", sku).limit(10);
    if (id) duplicateQuery = duplicateQuery.neq("id", id);
    const { data: duplicates, error: duplicateError } = await duplicateQuery;
    if (duplicateError) throw new Error(`\u6aa2\u67e5 SKU \u662f\u5426\u91cd\u8907\u6642\u767c\u751f\u932f\u8aa4：${duplicateError.message}`);
    if (duplicates && duplicates.length > 0) {
      const names = duplicates.map((row) => String(row.name || row.id)).join("、");
      throw new Error(`SKU「${sku}」\u5df2\u5b58\u5728，\u8207\u4ee5\u4e0b\u7522\u54c1\u91cd\u8907：${names}。\u8acb\u6539\u7528\u552f\u4e00 SKU \u5f8c\u518d\u4e0a\u67b6。`);
    }
  }
  let localized: Record<string, unknown> = {};
  if (id) {
    const { data, error } = await supabase.from("store_settings").select("value").eq("key", PRODUCT_LOCALIZATIONS_SETTING_KEY).maybeSingle();
    if (error) throw new Error(`\u8b80\u53d6\u7522\u54c1\u82f1\u6587\u5167\u5bb9\u5931\u6557：${error.message}`);
    localized = parseProductLocalizations(data?.value)[id] || {};
  }
  const submittedImages = normalizeProductImages(candidate.images);
  const images = submittedImages.length > 0 ? submittedImages : normalizeProductImages(existing.images);
  const missing: string[] = [];
  if (!String(candidate.name || existing.name || "").trim()) missing.push(PRODUCT_PUBLISH_FIELDS[0]);
  if (!String(candidate.name_en || localized.name_en || "").trim()) missing.push(PRODUCT_PUBLISH_FIELDS[1]);
  if (!String(candidate.description || existing.description || "").trim()) missing.push(PRODUCT_PUBLISH_FIELDS[2]);
  if (!String(candidate.description_en || localized.description_en || "").trim()) missing.push(PRODUCT_PUBLISH_FIELDS[3]);
  if (!Number.isFinite(Number(candidate.price ?? existing.price)) || Number(candidate.price ?? existing.price) <= 0) missing.push(PRODUCT_PUBLISH_FIELDS[4]);
  if (!Number.isFinite(Number(candidate.stock ?? existing.stock)) || Number(candidate.stock ?? existing.stock) <= 0) missing.push(PRODUCT_PUBLISH_FIELDS[5]);
  if (!images.some(isValidImageUrl)) missing.push(PRODUCT_PUBLISH_FIELDS[6]);
  if (missing.length) throw new Error(`\u7522\u54c1\u672a\u80fd\u4e0a\u67b6，\u8acb\u5148\u88dc\u9f4a：${missing.join("、")}`);
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
    const { data: costSetting } = await supabase.from("store_settings").select("value").eq("key", PRODUCT_COSTS_SETTING_KEY).maybeSingle();
    const costs = parseProductCosts(costSetting?.value);
    rows = rows.map((row) => {
      const privateCost = costs[String(row.id)];
      const legacyCostJpy = Number(row.cost_price_jpy ?? row.cost_jpy ?? row.cost_price_rmb);
      return {
        ...row,
        ...(privateCost || {}),
        ...(!privateCost && Number.isFinite(legacyCostJpy) && legacyCostJpy > 0 ? { cost_jpy: legacyCostJpy } : {}),
      };
    });
  }

  if (table === "brands") {
    const { data: productRows } = await supabase.from("products").select("brand_id").limit(5000);
    const counts = new Map<string, number>();
    (productRows || []).forEach((product) => {
      const brandId = String(product.brand_id || "");
      counts.set(brandId, (counts.get(brandId) || 0) + 1);
    });
    rows = rows.map((row) => ({ ...row, product_count: counts.get(String(row.id)) || 0 }));
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
    if (error) return NextResponse.json({ error: `\u7cbe\u9078\u5bf5\u7269\u5167\u5bb9\u5132\u5b58\u5931\u6557：${error.message}` }, { status: 500 });
    return NextResponse.json({ data, count: pets.length });
  }

  if (body.action === "replace_banners") {
    const { banners, error: validationError } = normalizeBannerBatch(body.banners);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { data, error } = await replaceBanners(supabase, banners);
    if (error) return NextResponse.json({ error: `Banner \u5132\u5b58\u5931\u6557：${error.message}` }, { status: 500 });
    return NextResponse.json({ data, count: data?.length || 0 });
  }

  if (body.action === "set_banner_autoplay") {
    if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "banner_autoplay_enabled \u5fc5\u9808\u662f\u5e03\u6797\u503c" }, { status: 400 });
    const { data, error } = await supabase.from("store_settings").upsert({
      key: "banner_autoplay_enabled",
      value: body.enabled ? "true" : "false",
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" }).select("key,value,updated_at").single();
    if (error) return NextResponse.json({ error: `Banner \u8f2a\u64ad\u8a2d\u5b9a\u5132\u5b58\u5931\u6557：${error.message}` }, { status: 500 });
    return NextResponse.json({ data, enabled: body.enabled });
  }

  const table = String(body.table || ""); if (!tables.has(table)) return NextResponse.json({ error: "invalid_table" }, { status: 400 });
  if (table === "banners") return NextResponse.json({ error: "\u8acb\u4f7f\u7528\u56db\u683c Banner \u6279\u91cf\u5132\u5b58\u529f\u80fd。" }, { status: 400 });
  const payload = { ...(body.row || {}) }; delete payload.id; delete payload.created_at; delete payload.updated_at;
  const productCost = table === "products" ? normalizeProductCost(payload) : null;
  if (table === "products") {
    delete payload.cost_jpy;
    delete payload.shipping_hkd;
    delete payload.markup_multiplier;
    delete payload.exchange_rate;
    delete payload.cost_price_rmb;
  }
  const categoryLocalization = table === "categories" ? normalizeCategoryLocalization(payload) : null;
  const productLocalization = table === "products" ? normalizeProductLocalization(payload) : null;
  if (table === "categories") { delete payload.name_zh; delete payload.name_en; }
  if (table === "products") { /* Keep English fields until publish validation completes. */ }
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  if (table === "products" && (payload.status === "published" || payload.is_published === true)) {
    try { await validateProductForPublishing(supabase, null, payload); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "\u7522\u54c1\u8cc7\u6599\u4e0d\u5b8c\u6574，\u7121\u6cd5\u4e0a\u67b6" }, { status: 422 }); }
  }
  if (table === "products" && "name_en" in payload) delete payload.name_en;
  if (table === "products" && "description_en" in payload) delete payload.description_en;
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
  if (table === "products") {
    const { error: costError } = await upsertProductCost(supabase, String(data.id), productCost || {});
    if (costError) return NextResponse.json({ error: `\u6210\u672c\u8cc7\u6599\u5132\u5b58\u5931\u6557：${costError.message}` }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})); const table = String(body.table || ""); const id = String(body.id || ""); const key = String(body.key || body.row?.key || "");
  if (!tables.has(table) || (!id && !(table === "store_settings" && key))) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = getSupabaseAdmin(); if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const payload = { ...(body.row || {}), ...(table === "store_settings" ? { updated_at: new Date().toISOString() } : {}) }; delete payload.id; delete payload.created_at;
  const productCost = table === "products" ? normalizeProductCost(payload) : null;
  if (table === "products") {
    delete payload.cost_jpy;
    delete payload.shipping_hkd;
    delete payload.markup_multiplier;
    delete payload.exchange_rate;
    delete payload.cost_price_rmb;
  }
  const categoryLocalization = table === "categories" ? normalizeCategoryLocalization(payload) : null;
  const productLocalization = table === "products" ? normalizeProductLocalization(payload) : null;
  if (table === "categories") { delete payload.name_zh; delete payload.name_en; }
  if (table === "products") { /* Keep English fields until publish validation completes. */ }
  if (table === "products" && "images" in payload) payload.images = normalizeProductImages(payload.images);
  if (table === "products" && (payload.status === "published" || payload.is_published === true)) {
    try { await validateProductForPublishing(supabase, id, payload); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "\u7522\u54c1\u8cc7\u6599\u4e0d\u5b8c\u6574，\u7121\u6cd5\u4e0a\u67b6" }, { status: 422 }); }
  }
  if (table === "products" && "name_en" in payload) delete payload.name_en;
  if (table === "products" && "description_en" in payload) delete payload.description_en;
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
  if (table === "products") {
    const { error: costError } = await upsertProductCost(supabase, id, productCost || {});
    if (costError) return NextResponse.json({ error: `\u6210\u672c\u8cc7\u6599\u5132\u5b58\u5931\u6557：${costError.message}` }, { status: 500 });
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
  if (table === "products") {
    const { data: costSetting } = await supabase.from("store_settings").select("value").eq("key", PRODUCT_COSTS_SETTING_KEY).maybeSingle();
    const costs = parseProductCosts(costSetting?.value);
    if (costs[id]) {
      delete costs[id];
      await supabase.from("store_settings").upsert({ key: PRODUCT_COSTS_SETTING_KEY, value: JSON.stringify(costs), updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
  }
  return NextResponse.json({ ok: true, deleted: data.length });
}
