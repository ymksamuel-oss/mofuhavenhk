import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ configured: false, categories: [], products: [], banners: [], settings: {} });
  const [categories, products, banners, settings] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("banners").select("*").order("sort_order", { ascending: true }),
    supabase.from("store_settings").select("key,value").in("key", ["announcement", "shipping_note", "whatsapp_url", "instagram_url", "stripe_publishable_key"]),
  ]);
  return NextResponse.json({ configured: true, categories: categories.data || [], products: products.data || [], banners: banners.data || [], settings: Object.fromEntries((settings.data || []).map((item) => [item.key, item.value])) }, { headers: { "Cache-Control": "no-store" } });
}
