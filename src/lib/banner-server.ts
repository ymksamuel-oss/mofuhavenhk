import "server-only";

import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

export type HomepageBanner = {
  id: string;
  tagEn: string;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  buttonTextZh: string;
  buttonTextEn: string;
  linkUrl: string;
  bgType: "product_grid" | "custom_image";
  customImageUrl: string;
  sortOrder: number;
};

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function getHomepageBanners(): Promise<HomepageBanner[]> {
  const supabase = getSupabasePublic() || getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("banners")
    .select("id,tag_en,title_zh,title_en,subtitle_zh,subtitle_en,button_text_zh,button_text_en,link_url,bg_type,custom_image_url,sort_order,title,link,image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(12);

  if (error) {
    console.error("[banners] failed to load homepage banners", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: text(row.id),
    tagEn: text(row.tag_en, "BEST PARTNER SELECT"),
    titleZh: text(row.title_zh, text(row.title, "毛孩生活嚴選")),
    titleEn: text(row.title_en, text(row.title, "Best Partner selections for happy pets")),
    subtitleZh: text(row.subtitle_zh, "探索日本天然寵物食品與生活用品。"),
    subtitleEn: text(row.subtitle_en, "Explore Japanese natural pet food and everyday essentials."),
    buttonTextZh: text(row.button_text_zh, "探索更多 ➔"),
    buttonTextEn: text(row.button_text_en, "Explore More ➔"),
    linkUrl: text(row.link_url, text(row.link, "/collections/all")),
    bgType: row.bg_type === "custom_image" ? "custom_image" : "product_grid",
    customImageUrl: text(row.custom_image_url, text(row.image_url)),
    sortOrder: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
  }));
}
