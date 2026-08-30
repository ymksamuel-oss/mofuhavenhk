import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const apply = process.argv.includes("--apply");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type CategoryTarget = "cats" | "dogs" | "small-pets" | "lifestyle" | "snacks" | "dry-food";
type Category = { id: string; name: string | null; slug: string | null };
type Product = { id: string; name: string | null; description: string | null; mofu_sku: string | null; category_id: string | null };

const categoryDefinitions: Record<CategoryTarget, { name: string; sort_order: number; aliases: string[] }> = {
  cats: { name: "貓咪商品", sort_order: 10, aliases: ["cats", "cat", "貓咪商品", "貓咪熱銷"] },
  dogs: { name: "狗狗商品", sort_order: 20, aliases: ["dogs", "dog", "狗狗商品", "狗狗熱銷"] },
  "small-pets": { name: "小寵物用品", sort_order: 30, aliases: ["small-pets", "small pets", "小寵物用品"] },
  lifestyle: { name: "寵物生活用品", sort_order: 40, aliases: ["lifestyle", "寵物生活用品", "睡窩及家居"] },
  snacks: { name: "零食", sort_order: 50, aliases: ["snacks", "零食", "小食", "貓貓小食", "狗狗小食"] },
  "dry-food": { name: "乾糧", sort_order: 60, aliases: ["dry-food", "乾糧", "貓乾糧", "狗狗乾糧"] },
};

const normalize = (value: string | null | undefined) => String(value || "")
  .normalize("NFKC")
  .toLowerCase()
  .replaceAll("猫", "貓")
  .replaceAll("猫粮", "貓糧")
  .replaceAll("干粮", "乾糧")
  .replaceAll("湿粮", "濕糧")
  .replaceAll("罐头", "罐頭")
  .replaceAll("冻干", "凍乾")
  .replaceAll("冷冻脱水", "冷凍脫水")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim();

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function targetForProduct(product: Product): CategoryTarget {
  const text = normalize([product.mofu_sku, product.name, product.description].filter(Boolean).join(" "));
  const sku = String(product.mofu_sku || "").toUpperCase();
  const hasCat = sku.includes("MH-CAT") || includesAny(text, ["貓", "cat", "feline"]);
  const hasDog = sku.includes("MH-DOG") || includesAny(text, ["狗", "犬", "dog", "canine"]);
  const hasSmallPet = includesAny(text, ["兔", "rabbit", "倉鼠", "hamster", "沙鼠", "天竺鼠", "龍貓", "chinchilla", "刺蝟", "小寵物", "small pet"]);
  const isSnack = includesAny(text, ["零食", "小食", "肉乾", "肉干", "肉泥", "脆餅", "餅乾", "treat", "snack", "jerky", "chew"]);
  const isDryFood = includesAny(text, ["乾糧", "干粮", "貓糧", "狗糧", "飼料", "kibble", "dry food"]);

  if (hasSmallPet && !hasCat && !hasDog) return "small-pets";
  if (isSnack) return "snacks";
  if (isDryFood) return "dry-food";
  if (hasCat && !hasDog) return "cats";
  if (hasDog && !hasCat) return "dogs";
  if (includesAny(text, ["食盤", "食碗", "飲水機", "睡窩", "家居", "bed", "bowl", "feeder", "harness", "胸背帶", "項圈", "牽引"])) return "lifestyle";
  return "lifestyle";
}

function findCategory(categories: Category[], target: CategoryTarget) {
  const aliases = categoryDefinitions[target].aliases.map(normalize);
  return categories.find((category) => [category.slug, category.name].some((value) => aliases.includes(normalize(value))));
}

async function ensureCategories(categories: Category[]) {
  const result = new Map<CategoryTarget, string>();
  for (const target of Object.keys(categoryDefinitions) as CategoryTarget[]) {
    const existing = findCategory(categories, target);
    if (existing) {
      result.set(target, existing.id);
      continue;
    }
    if (!apply) continue;
    const definition = categoryDefinitions[target];
    const { data, error } = await supabase.from("categories").insert({ name: definition.name, slug: target, sort_order: definition.sort_order }).select("id,name,slug").single();
    if (error) throw new Error(`Failed to create category ${target}: ${error.message}`);
    result.set(target, (data as Category).id);
    categories.push(data as Category);
  }
  return result;
}

async function main() {
  const [{ data: categories, error: categoryError }, { data: products, error: productError }] = await Promise.all([
    supabase.from("categories").select("id,name,slug"),
    supabase.from("products").select("id,name,description,mofu_sku,category_id"),
  ]);
  if (categoryError) throw categoryError;
  if (productError) throw productError;

  const categoryRows = (categories || []) as Category[];
  const productRows = (products || []) as Product[];
  const categoryIds = await ensureCategories(categoryRows);
  const updates = productRows.map((product) => {
    const target = targetForProduct(product);
    return { id: product.id, name: product.name, from: product.category_id, target, to: categoryIds.get(target) || null };
  });
  const unresolved = updates.filter((update) => !update.to);
  const changed = updates.filter((update) => update.to && update.from !== update.to);

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", total: updates.length, changed: changed.length, unresolved: unresolved.length, targetCounts: Object.fromEntries((Object.keys(categoryDefinitions) as CategoryTarget[]).map((target) => [target, updates.filter((item) => item.target === target).length])), preview: changed.slice(0, 20), unresolvedPreview: unresolved.slice(0, 20) }, null, 2));
  if (!apply) return;
  for (const update of changed) {
    if (!update.to) continue;
    const { error } = await supabase.from("products").update({ category_id: update.to }).eq("id", update.id);
    if (error) throw new Error(`Failed to update ${update.id}: ${error.message}`);
  }
  console.log(`Applied ${changed.length} category updates.`);
}

void main();
