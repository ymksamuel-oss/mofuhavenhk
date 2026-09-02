import type { CategoryIconName } from "@/lib/categories";
import type { TranslationKey } from "@/lib/i18n/translations";
import { canonicalCategorySlug } from "./categories";
import { normalizeProductClassificationText } from "./product-classification-text";

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

/** Direct shopping collections under 貓咪商品; not children of dry food. */
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
  /** Optional product image shown when this specific variant is selected. */
  image?: string;
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

/** A verified sibling product in the same purchasable flavour, formula, or size family. */
export type ProductFlavorChoice = {
  productId: string;
  label: { zh: string; en: string };
};

/**
 * Product families intentionally use explicit Stripe Product IDs rather than name matching.
 * This keeps an ingredient selector honest: every option is a live, separately purchasable
 * product with its own server-verified Stripe Price ID.
 */
export type ProductFlavorFamily = {
  key: string;
  selector: { zh: string; en: string };
  label: { zh: string; en: string };
  choices: readonly ProductFlavorChoice[];
};

export const PRODUCT_FLAVOR_FAMILIES: readonly ProductFlavorFamily[] = [
  {
    key: "one-care-100g-dog-can",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "ONE CARE 100g 主食罐", en: "ONE CARE 100g wet food" },
    choices: [
      { productId: "prod_V8ZpWi2bc00Aty", label: { zh: "白身魚", en: "White fish" } },
      { productId: "prod_V8ZpDXl9RWMDbc", label: { zh: "雞肉", en: "Chicken" } },
      { productId: "prod_V8Zo9dzijaQ39p", label: { zh: "牛肉", en: "Beef" } },
      { productId: "prod_V8ZodBXbffvz6o", label: { zh: "雞肝", en: "Chicken liver" } },
      { productId: "prod_V8ZoNtJinLFNNG", label: { zh: "雙重口味拼配", en: "Two-flavour mix" } },
      { productId: "prod_V8ZoJ2fwrBOiHL", label: { zh: "牛肉飯", en: "Beef & rice" } },
      { productId: "prod_V8ZorEO6daplRl", label: { zh: "牛肉蔬菜", en: "Beef & vegetables" } },
    ],
  },
  {
    key: "dbf-adult-dog-85g",
    selector: { zh: "選擇配方", en: "Choose a recipe" },
    label: { zh: "d.b.f 成犬之食事 85g", en: "d.b.f Adult Dog Meal 85g" },
    choices: [
      { productId: "prod_V8e2MnRWL8I3ON", label: { zh: "雞肉", en: "Chicken" } },
      { productId: "prod_V8e2eck5fdwDtP", label: { zh: "雞肉蔬菜", en: "Chicken & vegetables" } },
      { productId: "prod_V8e2wynYC6XsBo", label: { zh: "雞肉紅薯", en: "Chicken & sweet potato" } },
      { productId: "prod_V8e1EgYIqCWkcb", label: { zh: "雞肉軟骨", en: "Chicken & cartilage" } },
    ],
  },
  {
    key: "dbf-senior-dog-85g",
    selector: { zh: "選擇配方", en: "Choose a recipe" },
    label: { zh: "d.b.f 高齡犬之食事 85g", en: "d.b.f Senior Dog Meal 85g" },
    choices: [
      { productId: "prod_V8e22XlcOMIRus", label: { zh: "雞肉", en: "Chicken" } },
      { productId: "prod_V8e2oW8u6WCtg5", label: { zh: "雞肉蔬菜", en: "Chicken & vegetables" } },
      { productId: "prod_V8e2hvyqfhk59B", label: { zh: "雞肉紅薯", en: "Chicken & sweet potato" } },
      { productId: "prod_V8e2NVxYYDt7TI", label: { zh: "雞肉軟骨", en: "Chicken & cartilage" } },
    ],
  },
  {
    key: "dbf-puree-65g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "d.b.f 65g 肉糜罐", en: "d.b.f 65g purée can" },
    choices: [
      { productId: "prod_V8e1Jgdnr9v8HM", label: { zh: "牛肉糜", en: "Beef purée" } },
      { productId: "prod_V8e1qdj8efQTs9", label: { zh: "雞肉糜", en: "Chicken purée" } },
      { productId: "prod_V8e2HgqFtfTeZ3", label: { zh: "低脂雞胸肉糜", en: "Lower-fat chicken breast purée" } },
    ],
  },
  {
    key: "dbf-150g-side-dish",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "d.b.f 150g 營養副食", en: "d.b.f 150g side dish" },
    choices: [
      { productId: "prod_V8e2NpxQsXvHOA", label: { zh: "雞肉雞胸肉糜紅薯", en: "Chicken, breast purée & sweet potato" } },
      { productId: "prod_V8e2yXi5ewIEg5", label: { zh: "雞肉雞胸肉糜蔬菜", en: "Chicken, breast purée & vegetables" } },
    ],
  },
  {
    key: "combo-present-kidney-mini",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "COMBO Present 維護腎臟小包", en: "COMBO Present Kidney Support mini pack" },
    choices: [
      { productId: "prod_V8crtmrNegpX6C", label: { zh: "混合肉味", en: "Meat" } },
      { productId: "prod_V8crvbMiPxxJvt", label: { zh: "混合海鮮", en: "Seafood" } },
    ],
  },
  {
    key: "combo-present-dental-mini",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "COMBO Present 潔齒防口臭小包", en: "COMBO Present Dental Care mini pack" },
    choices: [
      { productId: "prod_V8cr9iyVmqUz8O", label: { zh: "混合肉味", en: "Meat" } },
      { productId: "prod_V8crzRJNuOzt2e", label: { zh: "混合海鮮", en: "Seafood" } },
    ],
  },
  {
    key: "petline-gochisou-time",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "PETLINE 盛宴時光 25g×4", en: "PETLINE Gochisou Time 25g×4" },
    choices: [
      { productId: "prod_V8lAMmluHgtE1f", label: { zh: "雞肉泥牛奶果凍芝士", en: "Chicken paste milk jelly & cheese" } },
      { productId: "prod_V8lAXdhHafIDnG", label: { zh: "雞胸肉牛奶燉芝士", en: "Chicken breast milk stew & cheese" } },
      { productId: "prod_V8lAt5mJJ5YOb7", label: { zh: "雞胸肉芝士果凍", en: "Chicken breast & cheese jelly" } },
      { productId: "prod_V8lAPSEzKs8rpv", label: { zh: "雞胸肉蔬菜牛肉風味果凍", en: "Chicken breast, vegetable & beef-style jelly" } },
    ],
  },
  {
    key: "ciao-grilled-30g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "CIAO 炙烤盛宴 30g", en: "CIAO Grilled Dinner 30g" },
    choices: [
      { productId: "prod_V8fe3PM27QjYNh", label: { zh: "正宗高湯味", en: "Authentic broth" } },
      { productId: "prod_V8fenfKdEjRnr7", label: { zh: "銀魚扇貝味", en: "Shirasu & scallop" } },
      { productId: "prod_V8feNaBEY6Pn28", label: { zh: "北海道風味扇貝", en: "Hokkaido scallop" } },
      { productId: "prod_V8fefdYTxUdNva", label: { zh: "鰹魚干扇貝味", en: "Bonito flakes & scallop" } },
    ],
  },
  {
    key: "ciao-probiotic-40g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "CIAO 超強乳酸菌 40g", en: "CIAO Probiotic 40g" },
    choices: [
      { productId: "prod_V8feeIGBK4DYB1", label: { zh: "雞肉鰹魚干高湯", en: "Chicken & bonito broth" } },
      { productId: "prod_V8feoZ4v72AX1T", label: { zh: "金槍魚雞肉鰹魚", en: "Tuna, chicken & bonito" } },
      { productId: "prod_V8feXQdvRNrV4B", label: { zh: "鮪魚雞肉柴魚片高湯", en: "Tuna, chicken & bonito flakes broth" } },
    ],
  },
  {
    key: "ciao-premium-30g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "CIAO Premium 30g", en: "CIAO Premium 30g" },
    choices: [
      { productId: "prod_V8feew2ryjD7ql", label: { zh: "雞胸肉扇貝", en: "Chicken breast & scallop" } },
      { productId: "prod_V8fe1kWPFBfcKh", label: { zh: "鰹魚雞胸肉木魚花", en: "Bonito, chicken & bonito flakes" } },
    ],
  },
  {
    key: "vets-labo-medimousse",
    selector: { zh: "選擇配方", en: "Choose a formula" },
    label: { zh: "Vet’s Labo MediMousse 95g", en: "Vet’s Labo MediMousse 95g" },
    choices: [
      { productId: "prod_V8fexvyuSOogz8", label: { zh: "健康支持", en: "Health support" } },
      { productId: "prod_V8feViin1yPowA", label: { zh: "腸胃呵護", en: "Digestive support" } },
      { productId: "prod_V8feexDq7xAidn", label: { zh: "皮膚維護", en: "Skin support" } },
      { productId: "prod_V8fe6YUsIrEf8Q", label: { zh: "減肥減脂", en: "Weight support" } },
    ],
  },
  {
    key: "silver-spoon-70g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "銀之匙貓罐頭 70g", en: "Gin no Spoon cat can 70g" },
    choices: [
      { productId: "prod_V8lATUvYyTfiyk", label: { zh: "魚肉雞胸肉鰹魚節", en: "Fish, chicken breast & bonito flakes" } },
      { productId: "prod_V8lAGdiamaGSwC", label: { zh: "魚肉雞胸肉吻仔魚", en: "Fish, chicken breast & shirasu" } },
      { productId: "prod_V8lATH0SDiLKBx", label: { zh: "濃湯鮪魚鰹魚雞胸肉", en: "Gravy tuna, bonito & chicken" } },
      { productId: "prod_V8lAjMRJn8PScz", label: { zh: "鮪魚鰹魚雞胸肉", en: "Tuna, bonito & chicken" } },
      { productId: "prod_V8lAUga8Mwc3d0", label: { zh: "濃湯鮪魚", en: "Gravy tuna" } },
    ],
  },
  {
    key: "ginnospoon-mitsuboshi-cream-180g",
    selector: { zh: "選擇配方", en: "Choose a recipe" },
    label: { zh: "銀之匙 三ツ星グルメ 夾心奶油 180g", en: "Gin no Spoon Mitsuboshi Gourmet cream-filled 180g" },
    choices: [
      { productId: "prod_V8th51dTMblovb", label: { zh: "金槍魚・雞里脊味", en: "Tuna & chicken tender" } },
      { productId: "prod_V8th4gMOUDUrzu", label: { zh: "魚肉・雞里脊三拼", en: "Fish & chicken tender three-recipe" } },
    ],
  },
  {
    key: "ginnospoon-mitsuboshi-shimi-192g",
    selector: { zh: "選擇配方", en: "Choose a recipe" },
    label: { zh: "銀之匙 三ツ星グルメ 鮮旨香 192g", en: "Gin no Spoon Mitsuboshi Gourmet Shimi-Uma 192g" },
    choices: [
      { productId: "prod_V8thsQJq4RYszQ", label: { zh: "金槍魚・雞里脊・鰹魚", en: "Tuna, chicken tender & bonito" } },
      { productId: "prod_V8thk9qKECj0in", label: { zh: "金槍魚・鯛魚・鰹魚", en: "Tuna, sea bream & bonito" } },
    ],
  },
  {
    key: "freeze-dried-chicken-gizzard",
    selector: { zh: "選擇規格", en: "Choose a size" },
    label: { zh: "雞胸肉雞肫凍乾", en: "Freeze-dried chicken breast & gizzard" },
    choices: [
      { productId: "prod_V8W072ieTWyOZ7", label: { zh: "18g", en: "18g" } },
      { productId: "prod_V8W06fowHsMOSF", label: { zh: "120g", en: "120g" } },
    ],
  },
  {
    key: "freeze-dried-chicken-liver",
    selector: { zh: "選擇規格", en: "Choose a size" },
    label: { zh: "雞胸肉雞肝凍乾", en: "Freeze-dried chicken breast & liver" },
    choices: [
      { productId: "prod_V8VzYLI6mgAR3P", label: { zh: "18g", en: "18g" } },
      { productId: "prod_V8W0oMeIOyFLhp", label: { zh: "120g", en: "120g" } },
    ],
  },
  {
    key: "freeze-dried-cat-chicken-tenderloin",
    selector: { zh: "選擇規格", en: "Choose a size" },
    label: { zh: "雞里脊凍乾（貓用）", en: "Freeze-dried chicken tenderloin (cat)" },
    choices: [
      { productId: "prod_V8VzICRXhFqVtH", label: { zh: "30g", en: "30g" } },
      { productId: "prod_V8Vz4r6kx51OK2", label: { zh: "150g", en: "150g" } },
    ],
  },
  {
    key: "freeze-dried-cat-chicken-breast",
    selector: { zh: "選擇規格", en: "Choose a size" },
    label: { zh: "雞胸肉凍乾（貓用）", en: "Freeze-dried chicken breast (cat)" },
    choices: [
      { productId: "prod_V8VzTooOH64y65", label: { zh: "30g", en: "30g" } },
      { productId: "prod_V8VzG9Cs8B2Rjb", label: { zh: "150g", en: "150g" } },
    ],
  },
  {
    key: "aim30-indoor-adult-600g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "AIM30 室內成貓 600g", en: "AIM30 Indoor Adult Cat Food 600g" },
    choices: [
      { productId: "prod_V8xXuAW047ti4v", label: { zh: "雞肉味", en: "Chicken" } },
      { productId: "prod_V8xXIokF7G9Er0", label: { zh: "鮮魚味", en: "Fish" } },
    ],
  },
  {
    key: "monpetit-crispy-kiss-luxury-24g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "Mon Petit Crispy Kiss 奢華系列 24g", en: "Mon Petit Crispy Kiss Luxury 24g" },
    choices: [
      { productId: "prod_V8xXBfCtwPwxjK", label: { zh: "奢華鮮魚味", en: "Luxury fish" } },
      { productId: "prod_V8xX5m49XGPiSw", label: { zh: "奢華雞肉味", en: "Luxury chicken" } },
      { productId: "prod_V8xXV7x4AmWu89", label: { zh: "奢華三文魚味", en: "Luxury salmon" } },
    ],
  },
  {
    key: "monpetit-crispy-kiss-30g",
    selector: { zh: "選擇口味", en: "Choose a flavour" },
    label: { zh: "Mon Petit Crispy Kiss 30g", en: "Mon Petit Crispy Kiss 30g" },
    choices: [
      { productId: "prod_V8xXSx8MWb3Y8D", label: { zh: "芝士及雞肉味", en: "Cheese & chicken" } },
      { productId: "prod_V8xXYKr9wN7Aee", label: { zh: "鮮魚精選", en: "Fish select" } },
      { productId: "prod_V8xXmrlDUto85d", label: { zh: "海鮮味", en: "Seafood" } },
      { productId: "prod_V8xXZsF0TMS5c8", label: { zh: "真鯛、鰹魚及小魚高湯味", en: "Snapper, bonito & small fish broth" } },
      { productId: "prod_V8xXn4fyGQ2Iwg", label: { zh: "鰹魚及小魚高湯味", en: "Bonito & small fish broth" } },
      { productId: "prod_V8xXMB8UApWAYP", label: { zh: "三文魚、鰹魚及小魚味", en: "Salmon, bonito & small fish" } },
    ],
  },
  {
    key: "monpetit-crispy-kiss-variety-144g",
    selector: { zh: "選擇綜合包", en: "Choose an assortment" },
    label: { zh: "Mon Petit Crispy Kiss 綜合包 144g", en: "Mon Petit Crispy Kiss Assortment 144g" },
    choices: [
      { productId: "prod_V8xXRC7As2ra5W", label: { zh: "肉類精選", en: "Meat selection" } },
      { productId: "prod_V8xXFw4xx3NEuP", label: { zh: "海鮮及雞肉", en: "Seafood & chicken" } },
      { productId: "prod_V8xX3586zZhcZt", label: { zh: "海鮮、芝士及雞肉燒烤味", en: "Seafood, cheese & chicken grill" } },
      { productId: "prod_V8xXM2ONlpEcC3", label: { zh: "真鯛及海鮮", en: "Snapper & seafood" } },
    ],
  },
] as const;

const PRODUCT_FLAVOR_FAMILY_BY_PRODUCT_ID = new Map<string, ProductFlavorFamily>();
for (const family of PRODUCT_FLAVOR_FAMILIES) {
  for (const choice of family.choices) {
    PRODUCT_FLAVOR_FAMILY_BY_PRODUCT_ID.set(choice.productId, family);
  }
}

export function getProductFlavorFamily(productId: string): ProductFlavorFamily | undefined {
  return PRODUCT_FLAVOR_FAMILY_BY_PRODUCT_ID.get(productId);
}

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
  // The category relation persisted by Admin (category_id → categorySlug) is the
  // ONLY authoritative assignment. Never re-classify a managed product from its
  // name, description, tags or SKU wording: whatever category Admin picks is
  // exactly where the product appears, and nowhere else.
  return canonicalCategorySlug(product.categorySlug) ?? product.categorySlug;
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
  return uniqueProducts.filter((product) => productCategorySlug(product) === canonicalSlug);
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

const CAT_LIFE_STAGE_PATTERNS: Record<CatLifeStage, RegExp> = {
  kitten: /幼貓|kitten|成長期|0\s*[-~至]\s*12\s*(?:個月|个月|months?)/i,
  adult: /成貓|adult|室內成貓|室内成猫|adult\s*cat/i,
  senior: /老貓|高齡|高龄|senior|(?:7|10|11|14|15)\s*(?:歲|岁|歳|才)\s*(?:起|以上|\+)/i,
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
