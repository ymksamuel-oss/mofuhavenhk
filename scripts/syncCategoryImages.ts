import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type Category = {
  id: string;
  name?: string | null;
  slug?: string | null;
  sort_order?: number | null;
  image_url?: string | null;
};

type Product = {
  id: string;
  category_id?: string | null;
  images?: unknown;
  source_product_id?: string | null;
  created_at?: string | null;
};

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const clearMissing = process.argv.includes("--clear-missing");
const supabaseUrl = process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Never use the anon key for this write operation.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function validImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return value.trim().startsWith("/") && !value.trim().startsWith("//");
  }
}

function firstImage(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const image = images.find(validImageUrl);
  return typeof image === "string" ? image.trim() : null;
}

async function stripeImageMap(products: Product[]): Promise<Map<string, string>> {
  const sourceIds = new Set(
    products
      .filter((product) => !firstImage(product.images))
      .map((product) => product.source_product_id)
      .filter((id): id is string => Boolean(id)),
  );
  if (!sourceIds.size || !stripeSecretKey) return new Map();

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-08-26.dahlia",
    typescript: true,
  });
  const result = new Map<string, string>();
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    if (!sourceIds.has(product.id)) continue;
    const image = product.images.find(validImageUrl);
    if (image) result.set(product.id, image.trim());
  }
  return result;
}

async function main() {
  const [{ data: categories, error: categoryError }, { data: products, error: productError }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,sort_order,image_url").order("sort_order", { ascending: true }).order("id", { ascending: true }),
    supabase.from("products").select("id,category_id,images,source_product_id,created_at").order("created_at", { ascending: true }).order("id", { ascending: true }),
  ]);
  if (categoryError) throw new Error(`categories query failed: ${categoryError.message}`);
  if (productError) throw new Error(`products query failed: ${productError.message}`);

  const categoryRows = (categories ?? []) as Category[];
  const productRows = (products ?? []) as Product[];
  const stripeImages = await stripeImageMap(productRows);
  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const category of categoryRows) {
    const firstProduct = productRows.find((product) => {
      if (product.category_id !== category.id) return false;
      return Boolean(firstImage(product.images) || stripeImages.get(product.source_product_id ?? ""));
    });
    const imageUrl = firstImage(firstProduct?.images) || stripeImages.get(firstProduct?.source_product_id ?? "") || null;
    if (!imageUrl) {
      missing += 1;
      if (!clearMissing || !category.image_url) continue;
    }
    if (!force && (category.image_url || null) === imageUrl) {
      unchanged += 1;
      continue;
    }

    console.log(`${dryRun ? "[dry-run]" : "[update]"} ${category.slug || category.name || category.id} <- ${imageUrl || "(clear)"}`);
    if (!dryRun) {
      const { error } = await supabase.from("categories").update({ image_url: imageUrl }).eq("id", category.id);
      if (error) throw new Error(`failed updating category ${category.id}: ${error.message}`);
    }
    updated += 1;
  }

  console.log(JSON.stringify({ dryRun, force, clearMissing, categories: categoryRows.length, products: productRows.length, updated, unchanged, missing, stripeFallbackProducts: stripeImages.size }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
