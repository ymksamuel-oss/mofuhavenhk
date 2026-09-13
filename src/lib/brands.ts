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

const CORE_BRANDS = ["CIAO", "COMBO", "DoggyMan", "d.b.f", "Inaba"] as const;

export function getCoreBrands(brands: Brand[]): Brand[] {
  return CORE_BRANDS.flatMap((coreName) => {
    const matches = brands.filter((brand) => {
      const name = brand.name.trim().toLocaleLowerCase();
      const core = coreName.toLocaleLowerCase();
      return name === core || name.startsWith(`${core} `) || name.startsWith(`${core}-`) || name.startsWith(`${core}/`);
    });
    const first = matches.sort((a, b) => {
      const aExact = a.name.trim().toLocaleLowerCase() === coreName.toLocaleLowerCase();
      const bExact = b.name.trim().toLocaleLowerCase() === coreName.toLocaleLowerCase();
      if (aExact !== bExact) return aExact ? -1 : 1;
      return a.sort_order - b.sort_order;
    })[0];
    return first ? [first] : [];
  });
}
