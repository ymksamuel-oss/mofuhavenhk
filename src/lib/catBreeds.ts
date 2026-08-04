export type CatCoatFilter = "all" | "short" | "long";

export type CatCoatType = "short" | "long" | "both";

export type CatBreed = {
  id: string;
  coat: CatCoatType;
  image: string;
  name: { zh: string; en: string };
  coatLabel: { zh: string; en: string };
  summary: { zh: string; en: string };
  imageAlt: { zh: string; en: string };
};

/** Shared Unsplash fallback when a breed portrait fails to load. */
export const CAT_BREED_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1574231164645-d6f0e8553590?q=80&w=600&auto=format&fit=crop";

/** Popular breeds for `/cat-breeds`. */
export const CAT_BREEDS: CatBreed[] = [
  {
    id: "british-shorthair",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop",
    name: { zh: "英國短毛貓", en: "British Shorthair" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "溫和穩定、體型圓滾，注意體重管理。",
      en: "Gentle and steady with a round build — watch weight carefully.",
    },
    imageAlt: {
      zh: "英國短毛貓肖像",
      en: "Portrait of a British Shorthair cat",
    },
  },
  {
    id: "american-shorthair",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800&auto=format&fit=crop",
    name: { zh: "美國短毛貓", en: "American Shorthair" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "活潑好動、適應力強，需補足每日運動量。",
      en: "Playful and adaptable — make sure daily exercise is enough.",
    },
    imageAlt: {
      zh: "美國短毛貓肖像",
      en: "Portrait of an American Shorthair cat",
    },
  },
  {
    id: "ragdoll",
    coat: "long",
    image:
      "https://images.unsplash.com/photo-1627341394541-11910609a632?q=80&w=800&auto=format&fit=crop",
    name: { zh: "布偶貓", en: "Ragdoll" },
    coatLabel: { zh: "長毛", en: "Long hair" },
    summary: {
      zh: "性格溫順、毛髮豐盈，需注重腸胃與定期梳毛。",
      en: "Sweet-tempered with a plush coat — mind digestion and brushing.",
    },
    imageAlt: {
      zh: "布偶貓肖像",
      en: "Portrait of a Ragdoll cat",
    },
  },
  {
    id: "russian-blue",
    coat: "short",
    image:
      "https://images.unsplash.com/photo-1574063413132-3407983637cc?q=80&w=800&auto=format&fit=crop",
    name: { zh: "俄羅斯藍貓", en: "Russian Blue" },
    coatLabel: { zh: "短毛", en: "Short hair" },
    summary: {
      zh: "敏感聰穎、短毛濃密，提供安靜的休息空間。",
      en: "Sensitive and bright with dense short fur — offer quiet rest space.",
    },
    imageAlt: {
      zh: "俄羅斯藍貓肖像",
      en: "Portrait of a Russian Blue cat",
    },
  },
  {
    id: "munchkin",
    coat: "both",
    image:
      "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&auto=format&fit=crop",
    name: { zh: "曼赤因短腿貓", en: "Munchkin" },
    coatLabel: { zh: "短毛／長毛", en: "Short / long hair" },
    summary: {
      zh: "活潑親人，注意關節與脊椎保健。",
      en: "Lively and affectionate — mind joint and spine care.",
    },
    imageAlt: {
      zh: "曼赤因短腿貓肖像",
      en: "Portrait of a Munchkin cat",
    },
  },
  {
    id: "norwegian-forest",
    coat: "long",
    image:
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&auto=format&fit=crop",
    name: { zh: "挪威森林貓", en: "Norwegian Forest Cat" },
    coatLabel: { zh: "長毛", en: "Long hair" },
    summary: {
      zh: "體型高大、毛樣厚實，需特別注意毛球排空。",
      en: "Large and thick-coated — pay special attention to hairball care.",
    },
    imageAlt: {
      zh: "挪威森林貓肖像",
      en: "Portrait of a Norwegian Forest Cat",
    },
  },
];

export function filterCatBreeds(
  filter: CatCoatFilter,
  breeds: CatBreed[] = CAT_BREEDS,
): CatBreed[] {
  if (filter === "all") return breeds;
  if (filter === "short") {
    return breeds.filter((breed) => breed.coat === "short" || breed.coat === "both");
  }
  return breeds.filter((breed) => breed.coat === "long" || breed.coat === "both");
}
