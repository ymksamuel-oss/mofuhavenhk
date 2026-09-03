import type { StoreCategory } from "@/lib/store-categories";

export const CATEGORY_LOCALIZATIONS_SETTING_KEY = "category_localizations";

export type CategoryLocalization = {
  name_zh: string | null;
  name_en: string | null;
};

export type CategoryLocalizationMap = Record<string, CategoryLocalization>;

function optionalText(value: unknown, limit = 160): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : null;
}

export function parseCategoryLocalizations(value: unknown): CategoryLocalizationMap {
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const raw = JSON.parse(value);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

    return Object.fromEntries(
      Object.entries(raw as Record<string, unknown>)
        .filter(([id, item]) => Boolean(id.trim()) && item && typeof item === "object" && !Array.isArray(item))
        .map(([id, item]) => {
          const row = item as Record<string, unknown>;
          return [id.trim(), {
            name_zh: optionalText(row.name_zh),
            name_en: optionalText(row.name_en),
          }];
        }),
    );
  } catch {
    return {};
  }
}

export function normalizeCategoryLocalization(value: unknown): CategoryLocalization {
  const row = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    name_zh: optionalText(row.name_zh),
    name_en: optionalText(row.name_en),
  };
}

export function applyCategoryLocalizations(
  categories: StoreCategory[],
  localizations: CategoryLocalizationMap,
): StoreCategory[] {
  return categories.map((category) => {
    const localized = localizations[category.id];
    return {
      ...category,
      name_zh: localized?.name_zh || category.name_zh || null,
      name_en: localized?.name_en || category.name_en || null,
      children: applyCategoryLocalizations(category.children, localizations),
    };
  });
}
