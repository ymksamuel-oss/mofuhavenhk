import type { CategoryIconName } from "@/lib/categories";
import type { TranslationKey } from "@/lib/i18n/translations";

/**
 * Main child categories shown under 「貓咪商品」. These follow the user's
 * requested navigation order; legacy food routes remain resolvable below.
 */
export const CAT_SUBCATEGORIES = [
  "貓罐罐",
  "貓貓小食",
  "冷凍脫水系列",
  "貓砂及貓砂盆",
  "貓咪玩具及攀爬設施",
] as const;

const CAT_LEGACY_SUBCATEGORIES = ["貓乾糧", "投藥餵藥專用小食"] as const;

export type CatSubcategory =
  | (typeof CAT_SUBCATEGORIES)[number]
  | (typeof CAT_LEGACY_SUBCATEGORIES)[number];

const ALL_CAT_SUBCATEGORIES = [...CAT_SUBCATEGORIES, ...CAT_LEGACY_SUBCATEGORIES] as const;

/** Main child categories shown under 「狗狗專區」. */
export const DOG_SUBCATEGORIES = [
  "狗狗乾糧",
  "狗狗罐頭及濕糧",
  "狗狗冷凍脫水食品",
  "狗狗小食",
  "狗狗廁所及尿墊",
  "狗狗玩具",
] as const;

const DOG_LEGACY_SUBCATEGORIES = ["狗狗食品", "投藥餵藥專用小食"] as const;

export type DogSubcategory =
  | (typeof DOG_SUBCATEGORIES)[number]
  | (typeof DOG_LEGACY_SUBCATEGORIES)[number];

const ALL_DOG_SUBCATEGORIES = [...DOG_SUBCATEGORIES, ...DOG_LEGACY_SUBCATEGORIES] as const;

/** Main child categories shown under 「小寵物用品」. */
export const SMALL_PET_SUBCATEGORIES = [
  "兔仔用品",
  "倉鼠及沙鼠用品",
  "天竺鼠及龍貓用品",
  "小寵物主糧及零食",
  "牧草及墊材",
  "籠舍及居住用品",
  "小寵物玩具及健康護理",
] as const;

export type SmallPetSubcategory = (typeof SMALL_PET_SUBCATEGORIES)[number];

/** Main child categories shown under 「寵物生活用品」. */
export const LIFESTYLE_SUBCATEGORIES = [
  "食具及餵食",
  "睡窩及家居",
  "外出散步及旅行",
  "清潔除臭及護理",
  "梳毛洗護及美容",
  "訓練安全及防護",
  "收納及日常配件",
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
  貓罐罐: "catSubWetCans",
  貓乾糧: "catSubDryFood",
  冷凍脫水系列: "catSubFreezeDried",
  貓貓小食: "catSubSnacks",
  貓砂及貓砂盆: "catSubLitter",
  貓咪玩具及攀爬設施: "catSubToysClimbing",
  投藥餵藥專用小食: "pillTreatsSubcategory",
  狗狗食品: "dogSubFood",
  狗狗乾糧: "dogSubDryFood",
  狗狗罐頭及濕糧: "dogSubWetCans",
  狗狗冷凍脫水食品: "dogSubFreezeDried",
  狗狗小食: "dogSubSnacks",
  狗狗廁所及尿墊: "dogSubToiletPads",
  狗狗玩具: "dogSubToys",
  兔仔用品: "smallPetSubRabbits",
  倉鼠及沙鼠用品: "smallPetSubHamsters",
  天竺鼠及龍貓用品: "smallPetSubGuineaPigs",
  小寵物主糧及零食: "smallPetSubFoodTreats",
  牧草及墊材: "smallPetSubHayBedding",
  籠舍及居住用品: "smallPetSubHabitats",
  小寵物玩具及健康護理: "smallPetSubToysHealth",
  食具及餵食: "lifestyleSubFeeding",
  睡窩及家居: "lifestyleSubBedsHome",
  外出散步及旅行: "lifestyleSubOutdoorTravel",
  清潔除臭及護理: "lifestyleSubCleaningOdour",
  梳毛洗護及美容: "lifestyleSubGrooming",
  訓練安全及防護: "lifestyleSubTrainingSafety",
  收納及日常配件: "lifestyleSubStorageAccessories",
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
  label: { zh: string; en: string };
  /** Optional per-can reference shown only for pack-size variants. */
  unitLabel?: { zh: string; en: string };
  originalPrice?: number;
};

export type CatSnackSeries =
  | "無添加天然系列"
  | "老貓零食"
  | "去毛球配方"
  | "bb貓零食";

export const CAT_SNACK_SERIES = [
  "無添加天然系列",
  "老貓零食",
  "去毛球配方",
  "bb貓零食",
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
  無添加天然系列: "catSnackSeriesNatural",
  老貓零食: "catSnackSeriesSenior",
  去毛球配方: "catSnackSeriesHairball",
  bb貓零食: "catSnackSeriesKitten",
};

export const CAT_SNACK_SERIES_LABEL: Record<
  CatSnackSeries,
  { zh: string; en: string }
> = {
  無添加天然系列: { zh: "無添加天然系列", en: "No-additive natural" },
  老貓零食: { zh: "老貓零食", en: "Senior cat treats" },
  去毛球配方: { zh: "去毛球配方", en: "Hairball-care formula" },
  bb貓零食: { zh: "BB貓零食", en: "Kitten treats" },
};

export const CAT_SNACK_SERIES_BY_SLUG: Record<string, CatSnackSeries> = {
  natural: "無添加天然系列",
  senior: "老貓零食",
  hairball: "去毛球配方",
  kitten: "bb貓零食",
};

export const CAT_SNACK_SERIES_SLUG: Record<CatSnackSeries, string> = {
  無添加天然系列: "natural",
  老貓零食: "senior",
  去毛球配方: "hairball",
  bb貓零食: "kitten",
};

export const CAT_SUBCATEGORY_BY_SLUG: Record<string, CatSubcategory> = {
  "wet-cans": "貓罐罐",
  snacks: "貓貓小食",
  "freeze-dried": "冷凍脫水系列",
  litter: "貓砂及貓砂盆",
  "toys-climbing": "貓咪玩具及攀爬設施",
  // Kept for existing shared links; deliberately omitted from the new Header list.
  "dry-food": "貓乾糧",
  "pill-treats": "投藥餵藥專用小食",
};

export const CAT_SUBCATEGORY_SLUG: Record<CatSubcategory, string> = {
  貓罐罐: "wet-cans",
  貓貓小食: "snacks",
  冷凍脫水系列: "freeze-dried",
  貓砂及貓砂盆: "litter",
  貓咪玩具及攀爬設施: "toys-climbing",
  貓乾糧: "dry-food",
  投藥餵藥專用小食: "pill-treats",
};

export const DOG_SUBCATEGORY_BY_SLUG: Record<string, DogSubcategory> = {
  "dry-food": "狗狗乾糧",
  "wet-cans": "狗狗罐頭及濕糧",
  "freeze-dried": "狗狗冷凍脫水食品",
  snacks: "狗狗小食",
  "toilet-pads": "狗狗廁所及尿墊",
  toys: "狗狗玩具",
  // Kept for existing shared links; deliberately omitted from the new Header list.
  food: "狗狗食品",
  "pill-treats": "投藥餵藥專用小食",
};

export const DOG_SUBCATEGORY_SLUG: Record<DogSubcategory, string> = {
  狗狗乾糧: "dry-food",
  狗狗罐頭及濕糧: "wet-cans",
  狗狗冷凍脫水食品: "freeze-dried",
  狗狗小食: "snacks",
  狗狗廁所及尿墊: "toilet-pads",
  狗狗玩具: "toys",
  狗狗食品: "food",
  投藥餵藥專用小食: "pill-treats",
};

export const SMALL_PET_SUBCATEGORY_BY_SLUG: Record<string, SmallPetSubcategory> = {
  rabbits: "兔仔用品",
  "hamsters-gerbils": "倉鼠及沙鼠用品",
  "guinea-pigs-chinchillas": "天竺鼠及龍貓用品",
  "food-treats": "小寵物主糧及零食",
  "hay-bedding": "牧草及墊材",
  habitats: "籠舍及居住用品",
  "toys-health": "小寵物玩具及健康護理",
};

export const SMALL_PET_SUBCATEGORY_SLUG: Record<SmallPetSubcategory, string> = {
  兔仔用品: "rabbits",
  倉鼠及沙鼠用品: "hamsters-gerbils",
  天竺鼠及龍貓用品: "guinea-pigs-chinchillas",
  小寵物主糧及零食: "food-treats",
  牧草及墊材: "hay-bedding",
  籠舍及居住用品: "habitats",
  小寵物玩具及健康護理: "toys-health",
};

export const LIFESTYLE_SUBCATEGORY_BY_SLUG: Record<string, LifestyleSubcategory> = {
  feeding: "食具及餵食",
  "beds-home": "睡窩及家居",
  "outdoor-travel": "外出散步及旅行",
  "cleaning-odour": "清潔除臭及護理",
  grooming: "梳毛洗護及美容",
  "training-safety": "訓練安全及防護",
  "storage-accessories": "收納及日常配件",
};

export const LIFESTYLE_SUBCATEGORY_SLUG: Record<LifestyleSubcategory, string> = {
  食具及餵食: "feeding",
  睡窩及家居: "beds-home",
  外出散步及旅行: "outdoor-travel",
  清潔除臭及護理: "cleaning-odour",
  梳毛洗護及美容: "grooming",
  訓練安全及防護: "training-safety",
  收納及日常配件: "storage-accessories",
};

export type Product = {
  id: string;
  /** Active HKD Stripe Price used by Checkout for this product. */
  priceId?: string;
  /** Stripe metadata delivered with the catalog. `category` is the canonical taxonomy key. */
  metadata?: Record<string, string>;
  categorySlug: string;
  subcategory?: ProductSubcategory;
  /** Primary cover image retained for listings, cart and checkout compatibility. */
  image: string;
  /** Optional product gallery, populated from up to five usable Stripe product images. */
  images?: string[];
  name: { zh: string; en: string };
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
  description?: { zh: string; en: string };
  /** Optional serving texture and bite notes sourced from verified product metadata. */
  texture?: { zh: string; en: string };
  /** Optional live import status / package status sourced from verified product metadata. */
  availability?: { zh: string; en: string };
  specs?: { zh: string; en: string }[];
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
const SMALL_PET_KEYWORDS = /小動物|小动物|小寵物|小宠物|兔子?|兔用|倉鼠|仓鼠|天竺鼠|豚鼠|荷蘭豬|荷兰猪|刺蝟|刺猬|龍貓|龙猫|蜜袋鼯|飛鼠|飞鼠|雪貂|rabbit|bunny|hamster|guinea\s*pig|gerbil|chinchilla|hedgehog|ferret|small\s*[- ]?pet|small\s*animal|rodent/i;

export function isSmallPetProductText(...values: Array<string | undefined>): boolean {
  return SMALL_PET_KEYWORDS.test(values.filter(Boolean).join(" "));
}

const CATEGORY_SLUG_BY_METADATA: Record<string, string> = {
  cats: "cats",
  cat: "cats",
  "貓咪商品": "cats",
  dogs: "dogs",
  dog: "dogs",
  "狗狗商品": "dogs",
  "small-pets": "small-pets",
  "小動物": "small-pets",
  "小寵物": "small-pets",
  lifestyle: "lifestyle",
  "寵物生活用品": "lifestyle",
  snacks: "snacks",
  snack: "snacks",
  "寵物小食": "snacks",
  toys: "toys",
  "寵物玩具": "toys",
  health: "health",
  "營養保健": "health",
  cleaning: "cleaning",
  "居家清潔": "cleaning",
  deals: "deals",
  "限時優惠": "deals",
  bestsellers: "bestsellers",
  "熱賣商品": "bestsellers",
  outdoor: "outdoor",
  "外出用品": "outdoor",
};

const SUBCATEGORY_PARENT_BY_METADATA: Record<
  string,
  { parent: string; subcategory: ProductSubcategory }
> = {
  "貓罐罐": { parent: "cats", subcategory: "貓罐罐" },
  "貓乾糧": { parent: "cats", subcategory: "貓乾糧" },
  "冷凍脫水系列": { parent: "cats", subcategory: "冷凍脫水系列" },
  "貓貓小食": { parent: "cats", subcategory: "貓貓小食" },
  "貓砂及貓砂盆": { parent: "cats", subcategory: "貓砂及貓砂盆" },
  "貓咪玩具及攀爬設施": { parent: "cats", subcategory: "貓咪玩具及攀爬設施" },
  "狗狗食品": { parent: "dogs", subcategory: "狗狗食品" },
  "狗狗乾糧": { parent: "dogs", subcategory: "狗狗乾糧" },
  "狗狗罐頭及濕糧": { parent: "dogs", subcategory: "狗狗罐頭及濕糧" },
  "狗狗冷凍脫水食品": { parent: "dogs", subcategory: "狗狗冷凍脫水食品" },
  "狗狗小食": { parent: "dogs", subcategory: "狗狗小食" },
  "狗狗廁所及尿墊": { parent: "dogs", subcategory: "狗狗廁所及尿墊" },
  "狗狗玩具": { parent: "dogs", subcategory: "狗狗玩具" },
  "兔仔用品": { parent: "small-pets", subcategory: "兔仔用品" },
  "倉鼠及沙鼠用品": { parent: "small-pets", subcategory: "倉鼠及沙鼠用品" },
  "天竺鼠及龍貓用品": { parent: "small-pets", subcategory: "天竺鼠及龍貓用品" },
  "小寵物主糧及零食": { parent: "small-pets", subcategory: "小寵物主糧及零食" },
  "牧草及墊材": { parent: "small-pets", subcategory: "牧草及墊材" },
  "籠舍及居住用品": { parent: "small-pets", subcategory: "籠舍及居住用品" },
  "小寵物玩具及健康護理": { parent: "small-pets", subcategory: "小寵物玩具及健康護理" },
  "食具及餵食": { parent: "lifestyle", subcategory: "食具及餵食" },
  "睡窩及家居": { parent: "lifestyle", subcategory: "睡窩及家居" },
  "外出散步及旅行": { parent: "lifestyle", subcategory: "外出散步及旅行" },
  "清潔除臭及護理": { parent: "lifestyle", subcategory: "清潔除臭及護理" },
  "梳毛洗護及美容": { parent: "lifestyle", subcategory: "梳毛洗護及美容" },
  "訓練安全及防護": { parent: "lifestyle", subcategory: "訓練安全及防護" },
  "收納及日常配件": { parent: "lifestyle", subcategory: "收納及日常配件" },
};

export function categorySlugFromMetadata(category: string | undefined): string | null {
  const value = category?.trim();
  if (!value) return null;
  return (
    CATEGORY_SLUG_BY_METADATA[value.toLowerCase()] ??
    SUBCATEGORY_PARENT_BY_METADATA[value]?.parent ??
    null
  );
}

export function subcategoryFromMetadata(category: string | undefined): ProductSubcategory | null {
  const value = category?.trim();
  if (!value) return null;
  return (
    SUBCATEGORY_PARENT_BY_METADATA[value]?.subcategory ??
    (value === "投藥餵藥專用小食" ? "投藥餵藥專用小食" : null)
  );
}

/** Products quarantined from storefront display until their Stripe record is corrected and verified. */
export const QUARANTINED_PRODUCT_IDS = new Set<string>([
  // Product name/description identify a cat scallop treat, but its current Stripe image is a dog-food photo.
  "prod_V4htF8xn3apgbi",
]);

export function isStorefrontReadyProduct(product: Pick<Product, "id" | "image" | "inStock" | "metadata">): boolean {
  const importedPlaceholder =
    product.image === "catalog-placeholder" &&
    product.metadata?.image_pending === "true";
  const explicitlyVisibleWhenSoldOut = product.metadata?.show_when_out_of_stock === "true";

  return (
    (product.inStock !== false || explicitlyVisibleWhenSoldOut) &&
    (product.image !== "catalog-placeholder" || importedPlaceholder) &&
    !product.metadata?.demo &&
    !QUARANTINED_PRODUCT_IDS.has(product.id)
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
  return categorySlugFromMetadata(product.metadata?.category) ?? product.categorySlug;
}

function productSubcategory(product: Product): ProductSubcategory | undefined {
  return subcategoryFromMetadata(product.metadata?.category) ?? product.subcategory;
}

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = [],
): Product[] {
  const uniqueProducts = uniqueProductsById(products);
  if (!slug) return uniqueProducts;
  return uniqueProducts.filter((product) => productCategorySlug(product) === slug);
}

export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = [],
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => productSubcategory(product) === subcategory);
  if (!snackSeries || subcategory !== "貓貓小食") return bySub;
  return bySub.filter((product) => product.snackSeries === snackSeries);
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
  if (categorySlug === "lifestyle") {
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
