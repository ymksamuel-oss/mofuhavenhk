/* eslint-disable @typescript-eslint/no-explicit-any */
import snapshot from "@/data/catalog-fallback.json";

export type LocalAdminRow = Record<string, any>;

const STORAGE_PREFIX = "mofu-admin-local:";

function categoryRows(): LocalAdminRow[] {
  return (snapshot.categories || []).map((row) => ({ ...row }));
}

function productRows(): LocalAdminRow[] {
  const categoryBySlug = new Map(categoryRows().map((row) => [String(row.slug || "").toLowerCase(), row]));
  return snapshot.products.map((product) => {
    const source = product as Record<string, any>;
    const category = product.category_slug ? categoryBySlug.get(String(product.category_slug).toLowerCase()) : undefined;
    const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image_url].filter(Boolean);
    return {
      id: product.id,
      name: product.name_zh || product.name,
      name_zh: product.name_zh || product.name,
      name_en: product.name_en || product.name,
      price: Number(product.price) || 0,
      original_price: product.original_price == null ? null : Number(product.original_price),
      stock: Number(product.stock) || 0,
      stock_quantity: Number(product.stock) || 0,
      image_url: images[0] || null,
      image: images[0] || null,
      images,
      category_id: category?.id || null,
      category_slug: product.category_slug || null,
      brand: product.supplier_brand || "Best Partner",
      supplier_brand: product.supplier_brand || "Best Partner",
      product_spec: product.product_spec || "",
      pet_species: product.pet_species || "all_pets",
      feature_tags: product.feature_tags || [],
      mofu_sku: product.mofu_sku || "",
      status: "published",
      is_published: true,
      description: source.description || "",
      description_en: source.description_en || "",
    };
  });
}

function brandRows(): LocalAdminRow[] {
  const counts = new Map<string, number>();
  for (const product of productRows()) {
    const name = String(product.supplier_brand || product.brand || "Best Partner");
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return Array.from(counts, ([name, product_count], index) => ({
    id: `local-brand-${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    product_count,
    sort_order: index,
    is_active: true,
  }));
}

function seedRows(table: string): LocalAdminRow[] {
  if (table === "products") return productRows();
  if (table === "categories") return categoryRows();
  if (table === "brands") return brandRows();
  return [];
}

function storageKey(table: string) {
  return `${STORAGE_PREFIX}${table}`;
}

function readRows(table: string): LocalAdminRow[] {
  if (typeof window === "undefined") return seedRows(table);
  try {
    const raw = window.localStorage.getItem(storageKey(table));
    if (!raw) {
      const seeded = seedRows(table);
      window.localStorage.setItem(storageKey(table), JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedRows(table);
  } catch {
    return seedRows(table);
  }
}

function writeRows(table: string, rows: LocalAdminRow[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey(table), JSON.stringify(rows));
}

export function isSupabaseUnavailableMessage(message: unknown): boolean {
  const value = String(message || "").toLowerCase();
  return !value || value.includes("supabase_not_configured") || value.includes("exceed_egress_quota") || value.includes("service for this project is restricted") || value.includes("supabase") || value.includes("fetch failed") || value.includes("network") || value.includes("http 4") || value.includes("http 5");
}

export function localAdminCall(method: string, body: LocalAdminRow | undefined, table?: string): LocalAdminRow {
  const target = table || String(body?.table || "");
  if (method === "GET") return { data: readRows(target) };
  if (method === "POST" && (body?.action === "replace_featured_pets" || body?.action === "replace_banners")) {
    const values = body.action === "replace_featured_pets" ? body.pets || [] : body.banners || [];
    return { ok: true, data: values, count: values.length };
  }
  if (!target || !["products", "categories", "brands", "banners", "coupons", "store_settings", "orders"].includes(target)) return { data: [] };
  const rows = readRows(target);
  if (method === "DELETE") {
    const id = String(body?.id || "");
    const key = String(body?.key || "");
    const remaining = rows.filter((row) => id ? String(row.id) !== id : String(row.key) !== key);
    writeRows(target, remaining);
    return { ok: true, data: [] };
  }
  if (method === "PATCH") {
    const id = String(body?.id || body?.row?.id || "");
    const key = String(body?.key || body?.row?.key || "");
    const patch = { ...(body?.row || {}) };
    const next = rows.map((row) => ((id && String(row.id) === id) || (key && String(row.key) === key)) ? { ...row, ...patch } : row);
    writeRows(target, next);
    return { ok: true, data: next.find((row) => (id && String(row.id) === id) || (key && String(row.key) === key)) || patch };
  }
  if (method === "POST") {
    const row = { ...(body?.row || {}) };
    const created = { ...row, id: row.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`) };
    writeRows(target, [...rows, created]);
    return { ok: true, data: created };
  }
  return { data: rows };
}
