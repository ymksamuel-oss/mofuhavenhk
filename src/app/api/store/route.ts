import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabasePublic();
  if (!supabase) return NextResponse.json({ configured: false, categories: [], products: [], banners: [], settings: {} }, { status: 503 });
  const [categories, products, banners, settings] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("banners").select("*").order("sort_order", { ascending: true }),
    supabase.from("store_settings").select("key,value").in("key", ["announcement", "shipping_note", "whatsapp_url", "instagram_url", "stripe_publishable_key"]),
  ]);
  const errors = [categories, products, banners].filter((result) => result.error).map((result) => result.error?.message).filter(Boolean);
  if (errors.length) return NextResponse.json({ configured: true, categories: [], products: [], banners: [], settings: {}, error: "supabase_read_failed", detail: errors.join("; ") }, { status: 502, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ configured: true, categories: categories.data || [], products: products.data || [], banners: banners.data || [], settings: Object.fromEntries((settings.data || []).map((item) => [item.key, item.value])) }, { headers: { "Cache-Control": "no-store" } });
}
