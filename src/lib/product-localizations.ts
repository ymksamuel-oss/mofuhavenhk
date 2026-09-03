import type { Product } from "@/lib/products";

export const PRODUCT_LOCALIZATIONS_SETTING_KEY = "product_localizations";

export type ProductLocalization = {
  name_en: string | null;
  description_en: string | null;
};

export type ProductLocalizationMap = Record<string, ProductLocalization>;

function optionalText(value: unknown, limit: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : null;
}

export function normalizeProductLocalization(value: unknown): ProductLocalization {
  const row = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    name_en: optionalText(row.name_en, 240),
    description_en: optionalText(row.description_en, 4_000),
  };
}

export function parseProductLocalizations(value: unknown): ProductLocalizationMap {
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const raw = JSON.parse(value);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>)
        .filter(([id, item]) => Boolean(id.trim()) && item && typeof item === "object" && !Array.isArray(item))
        .map(([id, item]) => [id.trim(), normalizeProductLocalization(item)]),
    );
  } catch {
    return {};
  }
}

export function applyProductLocalization(
  product: Product,
  localized: ProductLocalization | undefined,
): Product {
  if (!localized) return product;
  return {
    ...product,
    name: {
      ...product.name,
      ...(localized.name_en ? { en: localized.name_en } : {}),
    },
    ...(localized.description_en ? {
      description: {
        zh: product.description?.zh || product.description?.en || product.name.zh,
        en: localized.description_en,
      },
    } : {}),
  };
}
