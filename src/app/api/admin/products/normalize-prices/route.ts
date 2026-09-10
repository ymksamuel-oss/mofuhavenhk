import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_CNY_TO_HKD_RATE, RETAIL_MULTIPLIER, hkdPriceFromCnyCost, replaceSupabaseProductStripePrice } from "@/lib/fxPricingSync";

const PRICE_TAIL_EPSILON = 0.001;

type Product = {
  id: string;
  name: string | null;
  mofu_sku?: string | null;
  cost_price_rmb?: number | string | null;
  price?: number | string | null;
  original_price?: number | string | null;
  current_hkd?: number | string | null;
  source_product_id?: string | null;
  source_price_id?: string | null;
};

function hasNineTail(value: unknown) {
  const price = Number(value);
  if (!Number.isFinite(price)) return false;
  return Math.abs((price * 100) % 100 - 90) < PRICE_TAIL_EPSILON;
}

function numberOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST() {
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });

  const { data: setting, error: settingError } = await supabase.from("store_settings").select("value").eq("key", "rmb_hkd_rate").maybeSingle();
  if (settingError) return NextResponse.json({ error: `讀取 RMB/HKD 匯率失敗：${settingError.message}` }, { status: 500 });
  const configuredRate = Number(setting?.value);
  const rate = Number.isFinite(configuredRate) && configuredRate >= 0.9 && configuredRate <= 1.5 ? configuredRate : DEFAULT_CNY_TO_HKD_RATE;

  const { data, error } = await supabase.from("products").select("id,name,mofu_sku,cost_price_rmb,price,original_price,current_hkd,source_product_id,source_price_id").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: `讀取產品失敗：${error.message}` }, { status: 500 });

  const changed: Array<{ id: string; name: string | null; sku: string | null; oldPrice: number | null; newPrice: number }> = [];
  const skipped: Array<{ id: string; name: string | null; reason: string }> = [];
  const failed: Array<{ id: string; name: string | null; error: string }> = [];

  for (const product of (data || []) as Product[]) {
    const cost = numberOrNull(product.cost_price_rmb);
    if (cost === null || cost <= 0) {
      skipped.push({ id: product.id, name: product.name, reason: "沒有有效來貨價 CNY" });
      continue;
    }
    let newPrice: number;
    try {
      newPrice = hkdPriceFromCnyCost(String(cost), rate);
    } catch (cause) {
      skipped.push({ id: product.id, name: product.name, reason: cause instanceof Error ? cause.message : "來貨價格式無效" });
      continue;
    }
    const needsUpdate = !hasNineTail(product.price) || Number(product.price) !== newPrice || Number(product.original_price) !== newPrice || Number(product.current_hkd) !== newPrice;
    if (!needsUpdate) continue;
    try {
      let replacementPriceId: string | null = null;
      if (product.source_product_id) {
        replacementPriceId = await replaceSupabaseProductStripePrice({
          stripeProductId: product.source_product_id,
          stripePriceId: product.source_price_id,
          targetHkd: newPrice,
          rateValue: rate,
        });
      }
      const { error: updateError } = await supabase.from("products").update({
        price: newPrice,
        original_price: newPrice,
        current_hkd: newPrice,
        ...(replacementPriceId ? { source_price_id: replacementPriceId } : {}),
      }).eq("id", product.id);
      if (updateError) throw new Error(updateError.message);
      changed.push({ id: product.id, name: product.name, sku: product.mofu_sku ?? null, oldPrice: numberOrNull(product.price), newPrice });
    } catch (cause) {
      failed.push({ id: product.id, name: product.name, error: cause instanceof Error ? cause.message : "更新失敗" });
    }
  }

  return NextResponse.json({ ok: true, rate, multiplier: RETAIL_MULTIPLIER, total: data?.length || 0, changed: changed.length, skipped: skipped.length, failed: failed.length, changedProducts: changed, skippedProducts: skipped, failedProducts: failed });
}
