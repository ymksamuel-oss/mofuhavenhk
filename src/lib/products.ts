import type { CategoryIconName } from "@/lib/categories";
import type { TranslationKey } from "@/lib/i18n/translations";
import { canonicalCategorySlug } from "./categories";
import { normalizeProductClassificationText } from "./product-classification-text";

/**
 * Main child categories shown under 「\u8c93\u54aa\u5546\u54c1」. These follow the user's
 * requested navigation order; legacy food routes remain resolvable below.
 */
export const CAT_SUBCATEGORIES = [
  "\u8c93\u7f50\u7f50",
  "\u8c93\u8c93\u5c0f\u98df",
  "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
  "\u8c93\u7802\u53ca\u8c93\u7802\u76c6",
  "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd",
] as const;

const CAT_LEGACY_SUBCATEGORIES = ["\u8c93\u4e7e\u7ce7", "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df"] as const;

export type CatSubcategory =
  | (typeof CAT_SUBCATEGORIES)[number]
  | (typeof CAT_LEGACY_SUBCATEGORIES)[number];

/** Direct shopping collections under \u8c93\u54aa\u5546\u54c1; not children of dry food. */
export const CAT_LIFE_STAGES = ["kitten", "adult", "senior"] as const;
export type CatLifeStage = (typeof CAT_LIFE_STAGES)[number];

export const CAT_LIFE_STAGE_BY_SLUG: Record<string, CatLifeStage> = {
  kitten: "kitten",
  adult: "adult",
  senior: "senior",
};

export function resolveCatLifeStageSlug(value: string | undefined | null): CatLifeStage | null {
  if (!value) return null;
  return CAT_LIFE_STAGE_BY_SLUG[value.toLowerCase()] ?? null;
}

const ALL_CAT_SUBCATEGORIES = [...CAT_SUBCATEGORIES, ...CAT_LEGACY_SUBCATEGORIES] as const;

/** Main child categories shown under 「\u72d7\u72d7\u5c08\u5340」. */
export const DOG_SUBCATEGORIES = [
  "\u72d7\u72d7\u4e7e\u7ce7",
  "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7",
  "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1",
  "\u72d7\u72d7\u5c0f\u98df",
  "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a",
  "\u72d7\u72d7\u73a9\u5177",
] as const;

const DOG_LEGACY_SUBCATEGORIES = ["\u72d7\u72d7\u98df\u54c1", "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df"] as const;

export type DogSubcategory =
  | (typeof DOG_SUBCATEGORIES)[number]
  | (typeof DOG_LEGACY_SUBCATEGORIES)[number];

const ALL_DOG_SUBCATEGORIES = [...DOG_SUBCATEGORIES, ...DOG_LEGACY_SUBCATEGORIES] as const;

/** Main child categories shown under 「\u5c0f\u5bf5\u7269\u7528\u54c1」. */
export const SMALL_PET_SUBCATEGORIES = [
  "\u5154\u4ed4\u7528\u54c1",
  "\u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1",
  "\u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1",
  "\u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df",
  "\u7267\u8349\u53ca\u588a\u6750",
  "\u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1",
  "\u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406",
] as const;

export type SmallPetSubcategory = (typeof SMALL_PET_SUBCATEGORIES)[number];

/** Main child categories shown under 「\u5bf5\u7269\u751f\u6d3b\u7528\u54c1」. */
export const LIFESTYLE_SUBCATEGORIES = [
  "\u98df\u5177\u53ca\u9935\u98df",
  "\u7761\u7aa9\u53ca\u5bb6\u5c45",
  "\u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c",
  "\u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406",
  "\u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9",
  "\u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77",
  "\u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6",
] as const;

export type LifestyleSubcategory = (typeof LIFESTYLE_SUBCATEGORIES)[number];

export type ProductSubcategory =
  | CatSubcategory
  | DogSubcategory
  | SmallPetSubcategory
  | LifestyleSubcategory;

export type ProductSubcategoryLabelKey = Extract<
  TranslationKey,
  | "catSubWetCans"
  | "catSubDryFood"
  | "catSubFreezeDried"
  | "catSubSnacks"
  | "catSubLitter"
  | "catSubToysClimbing"
  | "pillTreatsSubcategory"
  | "dogSubFood"
  | "dogSubDryFood"
  | "dogSubWetCans"
  | "dogSubFreezeDried"
  | "dogSubSnacks"
  | "dogSubToiletPads"
  | "dogSubToys"
  | "smallPetSubRabbits"
  | "smallPetSubHamsters"
  | "smallPetSubGuineaPigs"
  | "smallPetSubFoodTreats"
  | "smallPetSubHayBedding"
  | "smallPetSubHabitats"
  | "smallPetSubToysHealth"
  | "lifestyleSubFeeding"
  | "lifestyleSubBedsHome"
  | "lifestyleSubOutdoorTravel"
  | "lifestyleSubCleaningOdour"
  | "lifestyleSubGrooming"
  | "lifestyleSubTrainingSafety"
  | "lifestyleSubStorageAccessories"
>;

export const PRODUCT_SUBCATEGORY_LABEL_KEY: Record<
  ProductSubcategory,
  ProductSubcategoryLabelKey
> = {
  \u8c93\u7f50\u7f50: "catSubWetCans",
  \u8c93\u4e7e\u7ce7: "catSubDryFood",
  \u51b7\u51cd\u812b\u6c34\u7cfb\u5217: "catSubFreezeDried",
  \u8c93\u8c93\u5c0f\u98df: "catSubSnacks",
  \u8c93\u7802\u53ca\u8c93\u7802\u76c6: "catSubLitter",
  \u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd: "catSubToysClimbing",
  \u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df: "pillTreatsSubcategory",
  \u72d7\u72d7\u98df\u54c1: "dogSubFood",
  \u72d7\u72d7\u4e7e\u7ce7: "dogSubDryFood",
  \u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7: "dogSubWetCans",
  \u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1: "dogSubFreezeDried",
  \u72d7\u72d7\u5c0f\u98df: "dogSubSnacks",
  \u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a: "dogSubToiletPads",
  \u72d7\u72d7\u73a9\u5177: "dogSubToys",
  \u5154\u4ed4\u7528\u54c1: "smallPetSubRabbits",
  \u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1: "smallPetSubHamsters",
  \u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1: "smallPetSubGuineaPigs",
  \u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df: "smallPetSubFoodTreats",
  \u7267\u8349\u53ca\u588a\u6750: "smallPetSubHayBedding",
  \u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1: "smallPetSubHabitats",
  \u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406: "smallPetSubToysHealth",
  \u98df\u5177\u53ca\u9935\u98df: "lifestyleSubFeeding",
  \u7761\u7aa9\u53ca\u5bb6\u5c45: "lifestyleSubBedsHome",
  \u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c: "lifestyleSubOutdoorTravel",
  \u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406: "lifestyleSubCleaningOdour",
  \u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9: "lifestyleSubGrooming",
  \u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77: "lifestyleSubTrainingSafety",
  \u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6: "lifestyleSubStorageAccessories",
};

export function getProductSubcategoryLabelKey(
  subcategory: ProductSubcategory,
): ProductSubcategoryLabelKey {
  return PRODUCT_SUBCATEGORY_LABEL_KEY[subcategory];
}

/** A purchasable product option with its own verified Stripe Price ID. */
export type ProductVariant = {
  key: string;
  priceId: string;
  price: number;
  label: { zh: string; en: string; ja?: string };
  /** Optional product image shown when this specific variant is selected. */
  image?: string;
  /** Optional per-can reference shown only for pack-size variants. */
  unitLabel?: { zh: string; en: string; ja?: string };
  originalPrice?: number;
};

export type CatSnackSeries =
  | "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217"
  | "\u8001\u8c93\u96f6\u98df"
  | "\u53bb\u6bdb\u7403\u914d\u65b9"
  | "bb\u8c93\u96f6\u98df";

export const CAT_SNACK_SERIES = [
  "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217",
  "\u8001\u8c93\u96f6\u98df",
  "\u53bb\u6bdb\u7403\u914d\u65b9",
  "bb\u8c93\u96f6\u98df",
] as const satisfies readonly CatSnackSeries[];

export type CatSnackSeriesLabelKey = Extract<
  TranslationKey,
  | "catSnackSeriesNatural"
  | "catSnackSeriesSenior"
  | "catSnackSeriesHairball"
  | "catSnackSeriesKitten"
>;

export const CAT_SNACK_SERIES_LABEL_KEY: Record<
  CatSnackSeries,
  CatSnackSeriesLabelKey
> = {
  \u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217: "catSnackSeriesNatural",
  \u8001\u8c93\u96f6\u98df: "catSnackSeriesSenior",
  \u53bb\u6bdb\u7403\u914d\u65b9: "catSnackSeriesHairball",
  bb\u8c93\u96f6\u98df: "catSnackSeriesKitten",
};

export const CAT_SNACK_SERIES_LABEL: Record<
  CatSnackSeries,
  { zh: string; en: string }
> = {
  \u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217: { zh: "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217", en: "No-additive natural" },
  \u8001\u8c93\u96f6\u98df: { zh: "\u8001\u8c93\u96f6\u98df", en: "Senior cat treats" },
  \u53bb\u6bdb\u7403\u914d\u65b9: { zh: "\u53bb\u6bdb\u7403\u914d\u65b9", en: "Hairball-care formula" },
  bb\u8c93\u96f6\u98df: { zh: "BB\u8c93\u96f6\u98df", en: "Kitten treats" },
};

export const CAT_SNACK_SERIES_BY_SLUG: Record<string, CatSnackSeries> = {
  natural: "\u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217",
  senior: "\u8001\u8c93\u96f6\u98df",
  hairball: "\u53bb\u6bdb\u7403\u914d\u65b9",
  kitten: "bb\u8c93\u96f6\u98df",
};

export const CAT_SNACK_SERIES_SLUG: Record<CatSnackSeries, string> = {
  \u7121\u6dfb\u52a0\u5929\u7136\u7cfb\u5217: "natural",
  \u8001\u8c93\u96f6\u98df: "senior",
  \u53bb\u6bdb\u7403\u914d\u65b9: "hairball",
  bb\u8c93\u96f6\u98df: "kitten",
};

export const CAT_SUBCATEGORY_BY_SLUG: Record<string, CatSubcategory> = {
  "wet-cans": "\u8c93\u7f50\u7f50",
  snacks: "\u8c93\u8c93\u5c0f\u98df",
  "freeze-dried": "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
  litter: "\u8c93\u7802\u53ca\u8c93\u7802\u76c6",
  "toys-climbing": "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd",
  // Existing Supabase child-category slugs. These map to the same canonical
  // collections used by the storefront navigation.
  "cat-feezed-dried-food": "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
  "cat-freezed-dried-food": "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
  "cat-freeze-dried-series": "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217",
  "cat-dry-food": "\u8c93\u4e7e\u7ce7",
  "cat-snack-food": "\u8c93\u8c93\u5c0f\u98df",
  "cat-litter": "\u8c93\u7802\u53ca\u8c93\u7802\u76c6",
  "cats-food-cans": "\u8c93\u7f50\u7f50",
  "cat-wet-food": "\u8c93\u7f50\u7f50",
  // Kept for existing shared links; deliberately omitted from the new Header list.
  "dry-food": "\u8c93\u4e7e\u7ce7",
  "pill-treats": "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df",
};

export const CAT_SUBCATEGORY_SLUG: Record<CatSubcategory, string> = {
  \u8c93\u7f50\u7f50: "wet-cans",
  \u8c93\u8c93\u5c0f\u98df: "snacks",
  \u51b7\u51cd\u812b\u6c34\u7cfb\u5217: "freeze-dried",
  \u8c93\u7802\u53ca\u8c93\u7802\u76c6: "litter",
  \u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd: "toys-climbing",
  \u8c93\u4e7e\u7ce7: "dry-food",
  \u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df: "pill-treats",
};

export const DOG_SUBCATEGORY_BY_SLUG: Record<string, DogSubcategory> = {
  "dry-food": "\u72d7\u72d7\u4e7e\u7ce7",
  "wet-cans": "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7",
  "freeze-dried": "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1",
  snacks: "\u72d7\u72d7\u5c0f\u98df",
  "toilet-pads": "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a",
  toys: "\u72d7\u72d7\u73a9\u5177",
  // Existing Supabase child-category slugs.
  "dog-food-cans": "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7",
  "dog-dry-food": "\u72d7\u72d7\u4e7e\u7ce7",
  "dog-snack-food": "\u72d7\u72d7\u5c0f\u98df",
  // Kept for existing shared links; deliberately omitted from the new Header list.
  food: "\u72d7\u72d7\u98df\u54c1",
  "pill-treats": "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df",
};

export const DOG_SUBCATEGORY_SLUG: Record<DogSubcategory, string> = {
  \u72d7\u72d7\u4e7e\u7ce7: "dry-food",
  \u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7: "wet-cans",
  \u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1: "freeze-dried",
  \u72d7\u72d7\u5c0f\u98df: "snacks",
  \u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a: "toilet-pads",
  \u72d7\u72d7\u73a9\u5177: "toys",
  \u72d7\u72d7\u98df\u54c1: "food",
  \u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df: "pill-treats",
};

export const SMALL_PET_SUBCATEGORY_BY_SLUG: Record<string, SmallPetSubcategory> = {
  rabbits: "\u5154\u4ed4\u7528\u54c1",
  "hamsters-gerbils": "\u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1",
  "guinea-pigs-chinchillas": "\u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1",
  "food-treats": "\u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df",
  "hay-bedding": "\u7267\u8349\u53ca\u588a\u6750",
  habitats: "\u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1",
  "toys-health": "\u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406",
};

export const SMALL_PET_SUBCATEGORY_SLUG: Record<SmallPetSubcategory, string> = {
  \u5154\u4ed4\u7528\u54c1: "rabbits",
  \u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1: "hamsters-gerbils",
  \u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1: "guinea-pigs-chinchillas",
  \u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df: "food-treats",
  \u7267\u8349\u53ca\u588a\u6750: "hay-bedding",
  \u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1: "habitats",
  \u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406: "toys-health",
};

export const LIFESTYLE_SUBCATEGORY_BY_SLUG: Record<string, LifestyleSubcategory> = {
  feeding: "\u98df\u5177\u53ca\u9935\u98df",
  "cat-food-platter": "\u98df\u5177\u53ca\u9935\u98df",
  "beds-home": "\u7761\u7aa9\u53ca\u5bb6\u5c45",
  "outdoor-travel": "\u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c",
  "cleaning-odour": "\u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406",
  grooming: "\u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9",
  "training-safety": "\u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77",
  "storage-accessories": "\u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6",
};

export const LIFESTYLE_SUBCATEGORY_SLUG: Record<LifestyleSubcategory, string> = {
  \u98df\u5177\u53ca\u9935\u98df: "feeding",
  \u7761\u7aa9\u53ca\u5bb6\u5c45: "beds-home",
  \u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c: "outdoor-travel",
  \u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406: "cleaning-odour",
  \u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9: "grooming",
  \u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77: "training-safety",
  \u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6: "storage-accessories",
};

export type Product = {
  id: string;
  brandId?: string;
  brandName?: string;
  /** Unix timestamp supplied by Stripe when this product was created. */
  createdAt?: number;
  /** Active HKD Stripe Price used by Checkout for this product. */
  priceId?: string;
  /** Stripe Product ID used to verify receipt lines when the storefront row uses a database UUID. */
  stripeProductId?: string;
  /** Stripe metadata delivered with the catalog. `category` is the canonical taxonomy key. */
  metadata?: Record<string, string>;
  /** Database foreign key to `categories.id`; authoritative for managed storefront filtering. */
  categoryId?: string;
  categorySlug: string;
  subcategory?: ProductSubcategory;
  /** Primary cover image retained for listings, cart and checkout compatibility. */
  image: string;
  /** Optional product gallery, populated from up to five usable Stripe product images. */
  images?: string[];
  /** Normalized bilingual name used by the storefront components. */
  name: { zh: string; en: string; ja?: string };
  /** Raw database aliases retained for compatibility with Supabase/API payloads. */
  name_zh?: string;
  name_en?: string;
  english_name?: string;
  price: number;
  /** Active pack-size variants sourced from Stripe Prices, ordered by pack count. */
  variants?: ProductVariant[];
  /** Verified Mofu Haven prior/list price, displayed as a promotional strikethrough. */
  originalPrice?: number;
  /** Same-spec external market reference, intentionally distinct from this store's original price. */
  marketReferencePrice?: number;
  /** Optional internal publication date for the verified market reference. */
  marketReferenceAsOf?: string;
  series?: { zh: string; en: string };
  snackSeries?: CatSnackSeries;
  icon: CategoryIconName;
  description?: { zh: string; en: string; ja?: string };
  /** Optional serving texture and bite notes sourced from verified product metadata. */
  texture?: { zh: string; en: string };
  /** Optional live import status / package status sourced from verified product metadata. */
  availability?: { zh: string; en: string };
  specs?: { zh: string; en: string; ja?: string }[];
  tags?: string[];
  productType?: string;
  inStock?: boolean;
  brand?: string;
  vendor?: string;
  sourceUrl?: string;
  sourceImageUrl?: string;
  handle?: string;
  recommendedBreeds?: string[];
  sourceCategory?: string;
};

/**
 * Product wording that identifies the small-pet shelf. Keep this broad enough
 * for future Stripe / sheet products while avoiding generic pet wording.
 */
const SMALL_PET_KEYWORDS = /\u5c0f\u52d5\u7269|\u5c0f\u52a8\u7269|\u5c0f\u5bf5\u7269|\u5c0f\u5ba0\u7269|\u5154\u5b50?|\u5154\u7528|\u5009\u9f20|\u4ed3\u9f20|\u5929\u7afa\u9f20|\u8c5a\u9f20|\u8377\u862d\u8c6c|\u8377\u5170\u732a|\u523a\u875f|\u523a\u732c|\u9f8d\u8c93|\u9f99\u732b|\u871c\u888b\u9f2f|\u98db\u9f20|\u98de\u9f20|\u96ea\u8c82|rabbit|bunny|hamster|guinea\s*pig|gerbil|chinchilla|hedgehog|ferret|small\s*[- ]?pet|small\s*animal|rodent/i;

export function isSmallPetProductText(...values: Array<string | undefined>): boolean {
  return SMALL_PET_KEYWORDS.test(values.filter(Boolean).join(" "));
}

const CATEGORY_SLUG_BY_METADATA: Record<string, string> = {
  cats: "cats",
  cat: "cats",
  "\u8c93\u54aa\u5546\u54c1": "cats",
  dogs: "dogs",
  dog: "dogs",
  "\u72d7\u72d7\u5546\u54c1": "dogs",
  "small-pets": "small-pets",
  "\u5c0f\u52d5\u7269": "small-pets",
  "\u5c0f\u5bf5\u7269": "small-pets",
  lifestyle: "lifestyle",
  "\u5bf5\u7269\u751f\u6d3b\u7528\u54c1": "lifestyle",
  snacks: "snacks",
  snack: "snacks",
  "\u5bf5\u7269\u5c0f\u98df": "snacks",
  toys: "toys",
  "\u5bf5\u7269\u73a9\u5177": "toys",
  health: "health",
  "\u71df\u990a\u4fdd\u5065": "health",
  cleaning: "cleaning",
  "\u5c45\u5bb6\u6e05\u6f54": "cleaning",
  deals: "deals",
  "\u9650\u6642\u512a\u60e0": "deals",
  bestsellers: "bestsellers",
  "\u71b1\u8ce3\u5546\u54c1": "bestsellers",
  outdoor: "outdoor",
  "\u5916\u51fa\u7528\u54c1": "outdoor",
};

const SUBCATEGORY_PARENT_BY_METADATA: Record<
  string,
  { parent: string; subcategory: ProductSubcategory }
> = {
  "\u8c93\u7f50\u7f50": { parent: "cats", subcategory: "\u8c93\u7f50\u7f50" },
  "\u8c93\u4e7e\u7ce7": { parent: "cats", subcategory: "\u8c93\u4e7e\u7ce7" },
  "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217": { parent: "cats", subcategory: "\u51b7\u51cd\u812b\u6c34\u7cfb\u5217" },
  "\u8c93\u8c93\u5c0f\u98df": { parent: "cats", subcategory: "\u8c93\u8c93\u5c0f\u98df" },
  "\u8c93\u7802\u53ca\u8c93\u7802\u76c6": { parent: "cats", subcategory: "\u8c93\u7802\u53ca\u8c93\u7802\u76c6" },
  "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd": { parent: "cats", subcategory: "\u8c93\u54aa\u73a9\u5177\u53ca\u6500\u722c\u8a2d\u65bd" },
  "\u72d7\u72d7\u98df\u54c1": { parent: "dogs", subcategory: "\u72d7\u72d7\u98df\u54c1" },
  "\u72d7\u72d7\u4e7e\u7ce7": { parent: "dogs", subcategory: "\u72d7\u72d7\u4e7e\u7ce7" },
  "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7": { parent: "dogs", subcategory: "\u72d7\u72d7\u7f50\u982d\u53ca\u6fd5\u7ce7" },
  "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1": { parent: "dogs", subcategory: "\u72d7\u72d7\u51b7\u51cd\u812b\u6c34\u98df\u54c1" },
  "\u72d7\u72d7\u5c0f\u98df": { parent: "dogs", subcategory: "\u72d7\u72d7\u5c0f\u98df" },
  "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a": { parent: "dogs", subcategory: "\u72d7\u72d7\u5ec1\u6240\u53ca\u5c3f\u588a" },
  "\u72d7\u72d7\u73a9\u5177": { parent: "dogs", subcategory: "\u72d7\u72d7\u73a9\u5177" },
  "\u5154\u4ed4\u7528\u54c1": { parent: "small-pets", subcategory: "\u5154\u4ed4\u7528\u54c1" },
  "\u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1": { parent: "small-pets", subcategory: "\u5009\u9f20\u53ca\u6c99\u9f20\u7528\u54c1" },
  "\u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1": { parent: "small-pets", subcategory: "\u5929\u7afa\u9f20\u53ca\u9f8d\u8c93\u7528\u54c1" },
  "\u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df": { parent: "small-pets", subcategory: "\u5c0f\u5bf5\u7269\u4e3b\u7ce7\u53ca\u96f6\u98df" },
  "\u7267\u8349\u53ca\u588a\u6750": { parent: "small-pets", subcategory: "\u7267\u8349\u53ca\u588a\u6750" },
  "\u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1": { parent: "small-pets", subcategory: "\u7c60\u820d\u53ca\u5c45\u4f4f\u7528\u54c1" },
  "\u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406": { parent: "small-pets", subcategory: "\u5c0f\u5bf5\u7269\u73a9\u5177\u53ca\u5065\u5eb7\u8b77\u7406" },
  "\u98df\u5177\u53ca\u9935\u98df": { parent: "lifestyle", subcategory: "\u98df\u5177\u53ca\u9935\u98df" },
  "\u7761\u7aa9\u53ca\u5bb6\u5c45": { parent: "lifestyle", subcategory: "\u7761\u7aa9\u53ca\u5bb6\u5c45" },
  "\u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c": { parent: "lifestyle", subcategory: "\u5916\u51fa\u6563\u6b65\u53ca\u65c5\u884c" },
  "\u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406": { parent: "lifestyle", subcategory: "\u6e05\u6f54\u9664\u81ed\u53ca\u8b77\u7406" },
  "\u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9": { parent: "lifestyle", subcategory: "\u68b3\u6bdb\u6d17\u8b77\u53ca\u7f8e\u5bb9" },
  "\u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77": { parent: "lifestyle", subcategory: "\u8a13\u7df4\u5b89\u5168\u53ca\u9632\u8b77" },
  "\u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6": { parent: "lifestyle", subcategory: "\u6536\u7d0d\u53ca\u65e5\u5e38\u914d\u4ef6" },
};

/** Classify an Mofu SKU by its required pet-family prefix. */
export function categorySlugFromMofuSku(mofuSku: string | undefined): "cats" | "dogs" | null {
  const value = mofuSku?.trim().toUpperCase();
  if (!value) return null;
  if (value.includes("MH-CAT")) return "cats";
  if (value.includes("MH-DOG")) return "dogs";
  return null;
}

export function categorySlugFromMetadata(category: string | undefined): string | null {
  const value = normalizeProductClassificationText(category?.trim());
  if (!value) return null;
  return (
    canonicalCategorySlug(CATEGORY_SLUG_BY_METADATA[value.toLowerCase()] ?? SUBCATEGORY_PARENT_BY_METADATA[value]?.parent) ??
    null
  );
}

export function subcategoryFromMetadata(category: string | undefined): ProductSubcategory | null {
  const value = normalizeProductClassificationText(category?.trim());
  if (!value) return null;
  return (
    SUBCATEGORY_PARENT_BY_METADATA[value]?.subcategory ??
    (value === "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df" ? "\u6295\u85e5\u9935\u85e5\u5c08\u7528\u5c0f\u98df" : null)
  );
}

export function isStorefrontReadyProduct(product: Pick<Product, "id" | "images" | "inStock" | "metadata">): boolean {
  const primaryImage = product.images?.[0] ?? "catalog-placeholder";
  const importedPlaceholder =
    primaryImage === "catalog-placeholder" &&
    product.metadata?.image_pending === "true";
  const explicitlyVisibleWhenSoldOut = product.metadata?.show_when_out_of_stock === "true";

  return (
    (product.inStock !== false || explicitlyVisibleWhenSoldOut) &&
    (primaryImage !== "catalog-placeholder" || importedPlaceholder) &&
    !product.metadata?.demo
  );
}

export function uniqueProductsById(products: readonly Product[] = []): Product[] {
  const productsById = new Map<string, Product>();
  for (const product of products) {
    if (!productsById.has(product.id)) productsById.set(product.id, product);
  }
  return Array.from(productsById.values());
}

function productCategorySlug(product: Product): string {
  // The category relation persisted by Admin (category_id → categorySlug) is the
  // authoritative assignment. A legacy Stripe row may not have that relation,
  // so an explicit canonical category metadata value is the only safe fallback.
  return categorySlugFromMetadata(product.metadata?.category)
    ?? canonicalCategorySlug(product.categorySlug)
    ?? product.categorySlug;
}

function productSubcategory(product: Product): ProductSubcategory | undefined {
  // Subcategory grouping stays strictly metadata/explicit-field driven; no
  // name/SKU keyword guessing is applied on top of the database assignment.
  return subcategoryFromMetadata(product.metadata?.category) ?? product.subcategory;
}

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = [],
): Product[] {
  const uniqueProducts = uniqueProductsById(products);
  const canonicalSlug = canonicalCategorySlug(slug);
  if (!canonicalSlug) return uniqueProducts;
  // Strict foreign-key filtering: a product appears in a category only when its
  // persisted category relation resolves to that slug. No fuzzy name/SKU matching.
  return uniqueProducts.filter((product) => {
    const productSlug = productCategorySlug(product);
    if (canonicalSlug === "supplies") return productSlug === "supplies" || productSlug === "lifestyle";
    if (canonicalSlug === "lifestyle") return productSlug === "lifestyle" || productSlug === "supplies";
    return productSlug === canonicalSlug;
  });
}

export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = [],
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => productSubcategory(product) === subcategory);
  if (!snackSeries || subcategory !== "\u8c93\u8c93\u5c0f\u98df") return bySub;
  return bySub.filter((product) => product.snackSeries === snackSeries);
}

const CAT_LIFE_STAGE_PATTERNS: Record<CatLifeStage, RegExp> = {
  kitten: /\u5e7c\u8c93|kitten|\u6210\u9577\u671f|0\s*[-~\u81f3]\s*12\s*(?:\u500b\u6708|\u4e2a\u6708|months?)/i,
  adult: /\u6210\u8c93|adult|\u5ba4\u5167\u6210\u8c93|\u5ba4\u5185\u6210\u732b|adult\s*cat/i,
  senior: /\u8001\u8c93|\u9ad8\u9f61|\u9ad8\u9f84|senior|(?:7|10|11|14|15)\s*(?:\u6b72|\u5c81|\u6b73|\u624d)\s*(?:\u8d77|\u4ee5\u4e0a|\+)/i,
};

/**
 * Strictly assign a cat product to a life-stage collection only when its
 * Stripe metadata or verified product wording explicitly states that stage.
 * Products with no age claim deliberately stay out of these three collections.
 */
export function getCatProductLifeStage(product: Product): CatLifeStage | null {
  const explicit = (product.metadata?.life_stage ?? product.metadata?.lifeStage ?? "").toLowerCase();
  if (explicit === "kitten") return "kitten";
  if (explicit === "adult") return "adult";
  if (explicit === "senior") return "senior";

  const text = normalizeProductClassificationText([
    product.name.zh,
    product.name.en,
    product.description?.zh,
    product.description?.en,
    ...(product.tags ?? []),
    ...(product.specs ?? []).flatMap((spec) => [spec.zh, spec.en]),
    ...Object.values(product.metadata ?? {}),
  ].filter(Boolean).join(" "));

  if (CAT_LIFE_STAGE_PATTERNS.kitten.test(text)) return "kitten";
  if (CAT_LIFE_STAGE_PATTERNS.senior.test(text)) return "senior";
  if (CAT_LIFE_STAGE_PATTERNS.adult.test(text)) return "adult";
  return null;
}

export function getCatProductsByLifeStage(
  lifeStage: CatLifeStage | null,
  products: readonly Product[] = [],
): Product[] {
  if (!lifeStage) return [];
  return getProductsByCategory("cats", products).filter(
    (product) => getCatProductLifeStage(product) === lifeStage,
  );
}

export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const dogs = getProductsByCategory("dogs", products);
  if (!subcategory) return dogs;
  return dogs.filter((product) => productSubcategory(product) === subcategory);
}

export function getSmallPetProductsBySubcategory(
  subcategory: SmallPetSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const smallPets = getProductsByCategory("small-pets", products);
  if (!subcategory) return smallPets;
  return smallPets.filter((product) => productSubcategory(product) === subcategory);
}

export function getLifestyleProductsBySubcategory(
  subcategory: LifestyleSubcategory | null,
  products: readonly Product[] = [],
): Product[] {
  const lifestyle = getProductsByCategory("lifestyle", products);
  if (!subcategory) return lifestyle;
  return lifestyle.filter((product) => productSubcategory(product) === subcategory);
}

export function getProductById(
  id: string | null | undefined,
  products: readonly Product[] = [],
): Product | null {
  if (!id) return null;
  return products.find((product) => product.id === id) ?? null;
}

export function resolveCategorySubSlug(
  categorySlug: string,
  subSlug: string | null | undefined,
): ProductSubcategory | null {
  if (!subSlug) return null;
  if (categorySlug === "cats") {
    return (
      CAT_SUBCATEGORY_BY_SLUG[subSlug] ??
      (ALL_CAT_SUBCATEGORIES.includes(subSlug as CatSubcategory)
        ? (subSlug as CatSubcategory)
        : null)
    );
  }
  if (categorySlug === "dogs") {
    return (
      DOG_SUBCATEGORY_BY_SLUG[subSlug] ??
      (ALL_DOG_SUBCATEGORIES.includes(subSlug as DogSubcategory)
        ? (subSlug as DogSubcategory)
        : null)
    );
  }
  if (categorySlug === "small-pets") {
    return (
      SMALL_PET_SUBCATEGORY_BY_SLUG[subSlug] ??
      (SMALL_PET_SUBCATEGORIES.includes(subSlug as SmallPetSubcategory)
        ? (subSlug as SmallPetSubcategory)
        : null)
    );
  }
  if (categorySlug === "lifestyle" || categorySlug === "supplies") {
    return (
      LIFESTYLE_SUBCATEGORY_BY_SLUG[subSlug] ??
      (LIFESTYLE_SUBCATEGORIES.includes(subSlug as LifestyleSubcategory)
        ? (subSlug as LifestyleSubcategory)
        : null)
    );
  }
  return null;
}

export function resolveCatSnackSeriesSlug(
  seriesSlug: string | null | undefined,
): CatSnackSeries | null {
  if (!seriesSlug) return null;
  return (
    CAT_SNACK_SERIES_BY_SLUG[seriesSlug] ??
    (CAT_SNACK_SERIES.includes(seriesSlug as CatSnackSeries)
      ? (seriesSlug as CatSnackSeries)
      : null)
  );
}

export function productHref(id: string): string {
  return `/product/${id}`;
}
