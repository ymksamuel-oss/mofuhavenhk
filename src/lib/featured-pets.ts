export const FEATURED_PET_GALLERY_SETTING_KEY = "featured_pet_gallery";
export const MAX_FEATURED_PETS = 12;

export type FeaturedPet = {
  image_url: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  link: string | null;
  sort_order: number;
  is_published: boolean;
};

function asText(value: unknown, maximumLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isFeaturedPetLink(value: string): boolean {
  return (value.startsWith("/") && !value.startsWith("//")) || isHttpUrl(value);
}

/**
 * Parses the JSON value stored in store_settings. Invalid rows are ignored so a
 * malformed historical setting never prevents the homepage from rendering.
 */
export function parseFeaturedPets(value: unknown): FeaturedPet[] {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const raw = JSON.parse(value);
    if (!Array.isArray(raw)) return [];
    const bySortOrder = new Map<number, FeaturedPet>();

    for (const item of raw.slice(0, MAX_FEATURED_PETS)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const row = item as Record<string, unknown>;
      const imageUrl = asText(row.image_url, 2_000);
      const title = asText(row.title, 160);
      const titleEn = asText(row.title_en, 160);
      const description = asText(row.description, 2_000);
      const descriptionEn = asText(row.description_en, 2_000);
      const candidateLink = asText(row.link, 2_000);
      const sortOrder = Number(row.sort_order);
      if (!isHttpUrl(imageUrl) || !title || !description || !Number.isInteger(sortOrder) || sortOrder < 0) continue;
      if (bySortOrder.has(sortOrder)) continue;

      bySortOrder.set(sortOrder, {
        image_url: imageUrl,
        title,
        title_en: titleEn || null,
        description,
        description_en: descriptionEn || null,
        link: candidateLink && isFeaturedPetLink(candidateLink) ? candidateLink : null,
        sort_order: sortOrder,
        is_published: row.is_published !== false,
      });
    }

    return Array.from(bySortOrder.values())
      .filter((item) => item.is_published)
      .sort((left, right) => left.sort_order - right.sort_order || left.title.localeCompare(right.title, "zh-Hant"));
  } catch {
    return [];
  }
}
