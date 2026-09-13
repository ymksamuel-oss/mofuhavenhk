export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

export function brandHref(slug: string): string {
  return `/brand/${encodeURIComponent(slug)}`;
}

export function brandDescription(brand: Brand): string {
  return brand.description?.trim() || `探索 ${brand.name} 的日本直送寵物食品及用品。`;
}

export function normalizeBrandSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
}
