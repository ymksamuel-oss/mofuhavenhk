import "server-only";

import { FEATURED_PET_GALLERY_SETTING_KEY, parseFeaturedPets, type FeaturedPet } from "@/lib/featured-pets";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Featured pet content is intentionally read from CMS settings only. There are
 * no hard-coded fallback cards, so the homepage always reflects Admin content.
 */
export async function getFeaturedPets(): Promise<FeaturedPet[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", FEATURED_PET_GALLERY_SETTING_KEY)
      .maybeSingle();

    if (error) {
      console.warn("[featured-pets] CMS setting fetch failed", {
        code: error.code,
        message: error.message,
      });
      return [];
    }

    return parseFeaturedPets(data?.value);
  } catch (error) {
    console.warn("[featured-pets] CMS setting request failed", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
