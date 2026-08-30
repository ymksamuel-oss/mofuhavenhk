import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EMPTY_STORE_RESPONSE = {
  configured: false,
  degraded: true,
  categories: [],
  products: [],
  banners: [],
  settings: {},
};

export async function GET() {
  try {
    const supabase = getSupabasePublic();
    if (!supabase) {
      console.error("[store-api] Supabase public client is not configured", {
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      });
      return NextResponse.json(EMPTY_STORE_RESPONSE, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const [categories, products, banners, settings] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("banners").select("*").order("sort_order", { ascending: true }),
      supabase.from("store_settings").select("key,value").in("key", ["announcement", "shipping_note", "whatsapp_url", "instagram_url", "stripe_publishable_key"]),
    ]);

    const queryErrors = [categories, products, banners, settings]
      .filter((result) => result.error)
      .map((result) => ({ code: result.error?.code, message: result.error?.message }));
    if (queryErrors.length) {
      console.error("[store-api] Supabase REST query returned errors", { queryErrors });
      return NextResponse.json({ ...EMPTY_STORE_RESPONSE, configured: true }, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    console.info("[store-api] Supabase data fetched", {
      categories: categories.data?.length ?? 0,
      products: products.data?.length ?? 0,
      banners: banners.data?.length ?? 0,
      settings: settings.data?.length ?? 0,
    });
    return NextResponse.json({
      configured: true,
      degraded: false,
      categories: categories.data || [],
      products: products.data || [],
      banners: banners.data || [],
      settings: Object.fromEntries((settings.data || []).map((item) => [item.key, item.value])),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[store-api] Supabase REST request failed; returning empty store response", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(EMPTY_STORE_RESPONSE, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
