import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n/translations";

export type CollectionGroup = "species" | "dog-function" | "dog-meat" | "outdoor";

type CollectionMatcher = (product: Product) => boolean;

export type CollectionConfig = {
  slug: string;
  title_zh: string;
  title_en: string;
  description: string;
  seo_title: string;
  group: CollectionGroup;
  targetCount?: number;
  match: CollectionMatcher;
};

const CAT_SKUS = new Set([
  "4976064013897",
  "4976064024725",
  "4976064024336",
  "4976064024688",
  "4976064015747",
  "4976064025500",
  "4976064024718",
]);

function productText(product: Product): string {
  return [
    product.name.zh,
    product.name.en,
    product.name.ja,
    product.description?.zh,
    product.description?.en,
    product.categorySlug,
    product.subcategory,
    product.brand,
    product.vendor,
    product.sourceCategory,
    ...(product.tags ?? []),
    ...Object.values(product.metadata ?? {}),
  ].filter(Boolean).join(" ").toLowerCase();
}

function productSku(product: Product): string {
  return String(product.metadata?.mofu_sku ?? product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) ?? "").trim();
}

function matchesAny(product: Product, patterns: RegExp[]): boolean {
  const text = productText(product);
  return patterns.some((pattern) => pattern.test(text));
}

function isDogProduct(product: Product): boolean {
  const text = productText(product);
  const catOnly = /貓專用|猫用|貓用|貓貓|cat[-_ ]?(?:only|food|treat|snack|product)|for cats?|feline/i.test(text);
  return !catOnly && /狗|犬|dog|for dogs?|犬用|canine/i.test(text);
}

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  "dental-chews": [/潔齒|潔牙|耐咬|牙棒|咬骨|dental|chew|tooth/i],
  "meal-toppers": [/拌飯|拌糧|撒料|餵飯粉|ふりかけ|topping|topper|seasoning/i],
  "training-treats": [/訓練|一口|小粒|獎勵|training|bite.?size|reward/i],
  "joint-care": [/關節|軟骨|joint|glucosamine|chondroitin/i],
  "skin-coat": [/亮毛|美膚|毛髮|皮膚|omega.?3|skin|coat|fur/i],
  "senior-puppy": [/幼犬|幼老犬|高齡|老犬|軟質|puppy|senior|soft/i],
};

const MEAT_PATTERNS: Record<string, RegExp[]> = {
  "horse-meat": [/馬肉|horse|うま肉|馬/i],
  venison: [/鹿肉|鹿|venison|deer|ベニソン/i],
  "beef-tendon": [/牛肉|牛筋|牛腱|beef|tendon/i],
  "chicken-poultry": [/雞肉|雞胸|禽肉|鶏|chicken|poultry|duck|鴨/i],
  "seafood-fish": [/魚|海鮮|魚介|fish|seafood|tuna|bonito|鰹|鮪/i],
  "pork-specialty": [/豬肉|黑豚|豚|pork|boar/i],
  "cheese-bakery": [/芝士|乳酪|起司|チーズ|cheese|bakery|烘焙|餅乾/i],
};

const OUTDOOR_PATTERNS: Record<string, RegExp[]> = {
  harnesses: [/胸背|胸帶|harness|ハーネス/i],
  leashes: [/牽引|牽繩|牽引帶|leash|lead|リード/i],
  collars: [/頸圈|項圈|半鏈|collar|チェーン/i],
  "walk-accessories": [/拾便|外出包|散步袋|便袋|walk|walking|poop|outdoor bag/i],
};

const DOG = (product: Product) => isDogProduct(product);
const CAT = (product: Product) => CAT_SKUS.has(productSku(product));
const OUTDOOR = (product: Product) => matchesAny(product, [/胸背|牽引|牽繩|頸圈|項圈|半鏈|拾便|外出|散步|harness|leash|lead|collar|walk|outdoor/i]);

export const COLLECTIONS: readonly CollectionConfig[] = [
  { slug: "dogs", title_zh: "🐶 狗狗全系列", title_en: "🐶 All Dog Products", description: "為狗狗挑選日本直送食品、機能零食及安心日常用品。", seo_title: "狗狗全系列｜日本狗狗食品、零食及用品", group: "species", targetCount: 245, match: DOG },
  { slug: "cats", title_zh: "🐱 貓咪專區", title_en: "🐱 Cat Collection", description: "精選指定的 7 款日本貓咪商品，讓愛貓享受安心日常。", seo_title: "貓咪專區｜7 款日本貓咪精選商品", group: "species", targetCount: 7, match: CAT },
  { slug: "outdoor-gear", title_zh: "🦺 戶外漫步裝備", title_en: "🦺 Outdoor Walking Gear", description: "從胸背帶到外出配件，為每次散步做好準備。", seo_title: "戶外漫步裝備｜寵物胸背帶、牽引帶及外出用品", group: "species", targetCount: 45, match: OUTDOOR },
  { slug: "dental-chews", title_zh: "物理潔齒耐咬", title_en: "Dental Chews", description: "以自然咀嚼與適口口感陪伴狗狗日常潔齒。", seo_title: "物理潔齒耐咬｜狗狗潔牙零食", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["dental-chews"]) },
  { slug: "meal-toppers", title_zh: "挑食拌糧神粉", title_en: "Meal Toppers", description: "為挑食狗狗增添香氣與食慾的日常拌糧選擇。", seo_title: "挑食拌糧神粉｜狗狗天然拌飯粉", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["meal-toppers"]) },
  { slug: "training-treats", title_zh: "隨身訓練一口丁", title_en: "Training Treats", description: "細小方便、適合外出訓練與即時獎勵的狗狗小食。", seo_title: "隨身訓練一口丁｜狗狗訓練零食", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["training-treats"]) },
  { slug: "joint-care", title_zh: "關節軟骨保養", title_en: "Joint Care", description: "為狗狗日常活動力與關節保養而設的機能選擇。", seo_title: "關節軟骨保養｜狗狗關節護理食品", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["joint-care"]) },
  { slug: "skin-coat", title_zh: "亮毛美膚 Omega-3", title_en: "Skin & Coat Omega-3", description: "從日常營養入手，照顧狗狗皮膚與毛髮狀態。", seo_title: "亮毛美膚 Omega-3｜狗狗皮膚毛髮護理", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["skin-coat"]) },
  { slug: "senior-puppy", title_zh: "幼老犬軟質點心", title_en: "Soft Treats for Puppies & Seniors", description: "適合幼犬與高齡犬的柔軟、易入口日常點心。", seo_title: "幼老犬軟質點心｜狗狗溫和小食", group: "dog-function", match: (p) => DOG(p) && matchesAny(p, FUNCTION_PATTERNS["senior-puppy"]) },
  { slug: "horse-meat", title_zh: "極致低敏馬肉", title_en: "Hypoallergenic Horse Meat", description: "以馬肉為主題的低敏狗狗肉源選擇。", seo_title: "極致低敏馬肉｜日本狗狗馬肉零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["horse-meat"]) },
  { slug: "venison", title_zh: "北海道野生鹿肉", title_en: "Hokkaido Venison", description: "探索北海道野生鹿肉及天然肉源小食。", seo_title: "北海道野生鹿肉｜狗狗鹿肉零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS.venison) },
  { slug: "beef-tendon", title_zh: "日本產純牛肉／牛筋", title_en: "Japanese Beef & Tendon", description: "日本產純牛肉與牛筋的耐咬、肉香選擇。", seo_title: "日本產純牛肉牛筋｜狗狗牛肉零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["beef-tendon"]) },
  { slug: "chicken-poultry", title_zh: "國產純雞肉／機能禽肉", title_en: "Japanese Chicken & Poultry", description: "國產雞肉及機能禽肉，適合日常獎勵與餵食。", seo_title: "國產純雞肉｜狗狗雞肉及禽肉零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["chicken-poultry"]) },
  { slug: "seafood-fish", title_zh: "深海海鮮全魚", title_en: "Deep-Sea Fish & Seafood", description: "以魚類及海鮮為主題的天然狗狗小食。", seo_title: "深海海鮮全魚｜狗狗魚類海鮮零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["seafood-fish"]) },
  { slug: "pork-specialty", title_zh: "黑豚與特選肉", title_en: "Specialty Pork & Meats", description: "黑豚及特選肉源的日本狗狗零食。", seo_title: "黑豚與特選肉｜日本狗狗豬肉零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["pork-specialty"]) },
  { slug: "cheese-bakery", title_zh: "芝士與和風烘焙", title_en: "Cheese & Japanese Bakery", description: "芝士、乳酪與和風烘焙點心，為狗狗帶來香脆獎勵。", seo_title: "芝士與和風烘焙｜狗狗芝士及烘焙零食", group: "dog-meat", match: (p) => DOG(p) && matchesAny(p, MEAT_PATTERNS["cheese-bakery"]) },
  { slug: "harnesses", title_zh: "胸背帶", title_en: "Harnesses", description: "舒適穩妥的狗狗胸背帶，陪伴每日散步。", seo_title: "寵物胸背帶｜戶外漫步裝備", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.harnesses) },
  { slug: "leashes", title_zh: "牽引帶", title_en: "Leashes", description: "適合日常散步與外出的牽引帶選擇。", seo_title: "寵物牽引帶｜戶外漫步裝備", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.leashes) },
  { slug: "collars", title_zh: "頸圈／半鏈", title_en: "Collars & Half Chains", description: "實用耐用的頸圈及半鏈外出裝備。", seo_title: "寵物頸圈半鏈｜戶外漫步裝備", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS.collars) },
  { slug: "walk-accessories", title_zh: "拾便袋與外出包", title_en: "Walk Accessories", description: "拾便袋、外出包及散步時不可缺少的貼心配件。", seo_title: "拾便袋與外出包｜寵物散步配件", group: "outdoor", match: (p) => OUTDOOR(p) && matchesAny(p, OUTDOOR_PATTERNS["walk-accessories"]) },
] as const;

export const COLLECTION_NAV_GROUPS: readonly { key: CollectionGroup; title_zh: string; title_en: string; slugs: readonly string[] }[] = [
  { key: "species", title_zh: "物種專區", title_en: "By Pet", slugs: ["dogs", "cats", "outdoor-gear"] },
  { key: "dog-function", title_zh: "狗狗機能分類", title_en: "Dog Functions", slugs: ["dental-chews", "meal-toppers", "training-treats", "joint-care", "skin-coat", "senior-puppy"] },
  { key: "dog-meat", title_zh: "狗狗肉源分類", title_en: "Dog Ingredients", slugs: ["horse-meat", "venison", "beef-tendon", "chicken-poultry", "seafood-fish", "pork-specialty", "cheese-bakery"] },
  { key: "outdoor", title_zh: "戶外裝備", title_en: "Outdoor Gear", slugs: ["harnesses", "leashes", "collars", "walk-accessories"] },
] as const;

export function getCollection(slug: string): CollectionConfig | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getCollectionProducts(products: Product[], collection: CollectionConfig): Product[] {
  return products.filter(collection.match);
}

export function getCollectionLabel(collection: CollectionConfig, locale: Locale): string {
  return locale === "en" ? collection.title_en : collection.title_zh;
}

export { CAT_SKUS };
