import type { CategoryIconName } from "@/lib/categories";
import {
  WT_JAPAN_PRODUCTS,
  type WtJapanProduct,
} from "@/data/productsData";
import {
  CAT_SNACK_SERIES,
  WT_JAPAN_CAT_SNACK_PRODUCTS,
  type CatSnackSeries,
  type WtJapanCatSnackProduct,
} from "@/data/catSnacksData";
import { classifyCatalogProducts } from "@/lib/classifyPetFood";
import WT_JAPAN_DOG_PRODUCTS_JSON from "../../public/wt_japan_products.json";

export { CAT_SNACK_SERIES, type CatSnackSeries };

/** Cat-products sub-filter keys (shown under 「貓咪商品」). */
export const CAT_SUBCATEGORIES = [
  "貓罐罐",
  "貓乾糧",
  "冷凍脫水系列",
  "貓貓小食",
  "投藥餵藥專用小食",
] as const;

export type CatSubcategory = (typeof CAT_SUBCATEGORIES)[number];

/** Dog-products sub-filter keys (shown under 「狗狗商品」). */
export const DOG_SUBCATEGORIES = [
  "狗狗食品",
  "狗狗小食",
  "投藥餵藥專用小食",
] as const;

export type DogSubcategory = (typeof DOG_SUBCATEGORIES)[number];

/** Union of cat/dog food-zone subcategories used by product records. */
export type ProductSubcategory = CatSubcategory | DogSubcategory;

/** Display labels for cat-snack series (existing WT Japan collection folders). */
export const CAT_SNACK_SERIES_LABEL: Record<
  CatSnackSeries,
  { zh: string; en: string }
> = {
  無添加天然系列: { zh: "無添加天然系列", en: "No-additive natural" },
  老貓零食: { zh: "老貓零食", en: "Senior cat treats" },
  去毛球配方: { zh: "去毛球配方", en: "Hairball-care formula" },
  bb貓零食: { zh: "BB貓零食", en: "Kitten treats" },
};

/** URL query segment → cat snack series key. */
export const CAT_SNACK_SERIES_BY_SLUG: Record<string, CatSnackSeries> = {
  natural: "無添加天然系列",
  senior: "老貓零食",
  hairball: "去毛球配方",
  kitten: "bb貓零食",
};

/** Cat snack series key → URL segment. */
export const CAT_SNACK_SERIES_SLUG: Record<CatSnackSeries, string> = {
  無添加天然系列: "natural",
  老貓零食: "senior",
  去毛球配方: "hairball",
  bb貓零食: "kitten",
};

/** URL path segment → cat subcategory key. */
export const CAT_SUBCATEGORY_BY_SLUG: Record<string, CatSubcategory> = {
  "wet-cans": "貓罐罐",
  "dry-food": "貓乾糧",
  "freeze-dried": "冷凍脫水系列",
  snacks: "貓貓小食",
  "pill-treats": "投藥餵藥專用小食",
};

/** Cat subcategory key → URL path segment. */
export const CAT_SUBCATEGORY_SLUG: Record<CatSubcategory, string> = {
  貓罐罐: "wet-cans",
  貓乾糧: "dry-food",
  冷凍脫水系列: "freeze-dried",
  貓貓小食: "snacks",
  投藥餵藥專用小食: "pill-treats",
};

/** URL path segment → dog subcategory key. */
export const DOG_SUBCATEGORY_BY_SLUG: Record<string, DogSubcategory> = {
  food: "狗狗食品",
  snacks: "狗狗小食",
  "pill-treats": "投藥餵藥專用小食",
};

/** Dog subcategory key → URL path segment. */
export const DOG_SUBCATEGORY_SLUG: Record<DogSubcategory, string> = {
  狗狗食品: "food",
  狗狗小食: "snacks",
  投藥餵藥專用小食: "pill-treats",
};

export type Product = {
  id: string;
  categorySlug: string;
  /**
   * Optional food-zone sub-category for `/categories/cats` or `/categories/dogs`.
   * 「冷凍脫水系列」= cat-only freeze-dried snacks（冷凍食物專區）.
   * 「貓貓小食」= cat treats zone（無添加天然／老貓／去毛球／BB貓系列）.
   * 「狗狗小食」= dog treats zone under dog products.
   * 「投藥餵藥專用小食」= medication-assistance treats under cats or dogs.
   * Apparel / toys / supplies leave this undefined.
   */
  subcategory?: ProductSubcategory;
  /**
   * Local /public path or HTTP(S) URL to a real product photograph for this SKU.
   * Typical locations: `public/products/<id>.webp` or
   * `public/images/products/<id>.jpg`. The Google Sheet catalog may replace
   * this with a validated remote URL at runtime.
   */
  image: string;
  name: { zh: string; en: string };
  price: number;
  /**
   * Optional pre-discount price. When set, the /menu card shows a
   * strikethrough original price and a "限時優惠 / Limited-Time Deal" badge
   * next to the current `price`.
   */
  originalPrice?: number;
  /**
   * Optional brand/series line for list-style catalog cards
   * (e.g. 「MAMACOOK 但馬高原」 / 「無添加天然系列」 above the product name).
   */
  series?: { zh: string; en: string };
  /**
   * Optional cat-snack series key for `/categories/cats/snacks` filters.
   * Uses existing WT Japan folders: 無添加天然系列 / 老貓零食 / 去毛球配方 / bb貓零食.
   */
  snackSeries?: CatSnackSeries;
  /** Fallback icon, still used by the homepage category grid. */
  icon: CategoryIconName;
  /** Optional short blurb shown under the product name on the /menu catalog card. */
  description?: { zh: string; en: string };
  /**
   * Optional bilingual spec lines (material, size, contents, power, etc.)
   * shown in the product quick-view modal opened from the /menu card.
   */
  specs?: { zh: string; en: string }[];
  /**
   * Optional collection / selling-point tags used by keyword food-zone
   * classification（例如「冷凍脫水系列」「狗狗小食」「貓用」）.
   */
  tags?: string[];
  /** Optional WT Japan / vendor product type label. */
  productType?: string;
  /** Purchasable unless explicitly marked false. */
  inStock?: boolean;
  /** Normalized brand shown in search and governance exports. */
  brand?: string;
  /** Original supplier/vendor label when it differs from the storefront brand. */
  vendor?: string;
  /** Original product detail page used to curate this record. */
  sourceUrl?: string;
  /** Original remote image URL retained for attribution/governance. */
  sourceImageUrl?: string;
  /** Source-platform handle or stable slug, where available. */
  handle?: string;
  /** Source catalog breed recommendations, where available. */
  recommendedBreeds?: string[];
  /** Original source category label retained for governance. */
  sourceCategory?: string;
};

/** English storefront copy for WT Japan cans (zh lives in productsData.ts). */
const WT_JAPAN_EN: Record<
  string,
  { name: string; description: string; tagLabels?: Record<string, string> }
> = {
  "wt-product-1": {
    name: "CIAO Cat Can — Bonito & Scallop 85g × 6",
    description:
      "Inaba CIAO classic cans pairing sweet bonito with scallop in a juicy broth. High-moisture formula encourages drinking, with green-tea deodorizing for a fresher home — a week's ocean feast in six cans.",
  },
  "wt-product-2": {
    name: "CIAO Cat Can — White Meat Tuna Trio 85g × 6",
    description:
      "Three tuna layers in one can: silky white meat, crispy tuna flakes, and rich tuna broth. Fine texture picky cats love — more hydration without sacrificing flavor.",
  },
  "wt-product-3": {
    name: "CIAO Cat Can — Chicken & Wagyu 85g × 6",
    description:
      "Tender chicken meets Japanese wagyu aroma for layered protein — great for larger or active cats. Juicy enough as a meal or a reward topping, with green-tea odor care.",
  },
  "wt-product-4": {
    name: "CIAO Fresh Meat Cup — Bonito, Tuna & Chicken (11+) 70g × 6",
    description:
      "Soft fresh-meat cups for cats 11+. Triple gentle proteins, easy to scoop, gentle to chew — a caring daily wet meal for senior appetites and hydration.",
  },
  "wt-product-5": {
    name: "CIAO Fresh Meat Cup — Tuna (11+) 70g × 6",
    description:
      "Pure tuna fresh-meat cups for seniors 11+. A clean single-seafood profile for sensitive palates — open, warm slightly, and serve when appetite dips.",
  },
  "wt-product-6": {
    name: "CIAO Cat Can — Chicken Breast & Sea Bream 85g × 6",
    description:
      "Lean chicken breast with delicate sea bream in light broth — elegant, lighter rotation for cats who prefer mild seafood and steady hydration.",
  },
  "wt-product-7": {
    name: "CIAO Cat Can — White Meat Tuna & Whitebait 85g × 6",
    description:
      "Silky white-meat tuna dotted with sparkling whitebait for playful crunch. Bright broth and fresh aroma — a happiness boost for curious everyday cats.",
  },
  "wt-product-8": {
    name: "CIAO Cat Can — Chicken, Golden Tuna & Bonito Flakes 85g × 6",
    description:
      "Chicken and golden tuna finished with aromatic bonito flakes — open the can for a Japanese dashi-like scent. Ideal alone or poured over kibble.",
  },
  "wt-product-9": {
    name: "CIAO Cat Can — White Meat Tuna & Koshihikari Rice 85g × 6",
    description:
      "Silky tuna meets soft Japanese Koshihikari rice — gentle to swallow and kind on sensitive tummies. A calm, comforting bowl for slower eaters.",
  },
  "wt-product-10": {
    name: "CIAO Cat Can — White Meat Tuna & Bonito Flakes 85g × 6",
    description:
      "Classic white-meat tuna with fragrant bonito flakes — CIAO's everyday hero. Clear broth, fine texture, green-tea odor care for weekly wet-food rotation.",
  },
  "wt-dry-food-1": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Bonito Flake (10 bags × 6)",
    description:
      "Inaba CIAO dry food with up to 1 trillion lactic acid bacteria for gut comfort. Fragrant bonito-flake flavor encourages picky eaters; green-tea odor care keeps home fresher. Individual sachets for portioning — six boxes of 10 bags each.",
  },
  "wt-dry-food-2": {
    name: "CIAO Probiotic Crunchy Sticks — Chicken (5 sticks × 6)",
    description:
      "Individually wrapped sticks (~22g each) with about 10 billion probiotics for gentle gut support. Savory chicken flavor works as a reward or kibble topper — Japan-made 5-stick packs, six boxes.",
  },
  "wt-dry-food-3": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Dried Tuna (10 bags × 6)",
    description:
      "Dried-tuna depth with a 1-trillion probiotic formula for taste and tummy comfort. Fine kibbles suit daily meals or wet–dry mixing, with green-tea odor care — six boxes of 10 bags.",
  },
  "wt-dry-food-4": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Triple Tuna Flavors (10 bags × 6)",
    description:
      "Three tuna flavor variations in one box keep mealtime interesting. 1 trillion probiotics plus green-tea odor care — a family pack of six boxes for seasonal rotation.",
  },
  "wt-dry-food-5": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Triple Bonito Flake Flavors (10 bags × 6)",
    description:
      "Dashi-like bonito aroma in three variations, paired with 1 trillion probiotics. Ideal for scent-driven cats — green-tea odor care for everyday calm.",
  },
  "wt-dry-food-6": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Triple Chicken Flavors (10 bags × 6)",
    description:
      "A gentle chicken trio for larger or active cats. 1 trillion probiotics and portion sachets — six-box family stocking for energetic households.",
  },
  "wt-dry-food-7": {
    name: "CIAO Probiotic Crunchy Sticks — Bonito (5 sticks × 6)",
    description:
      "Classic bonito aroma in ~22g sticks with about 10 billion probiotics. Great for training, travel, or crumbling over kibble — Japan-made 5×6 packs.",
  },
  "wt-dry-food-8": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Tuna (Kitten · 10 bags × 6)",
    description:
      "Tuna dry food tuned for cats under 1 year. 1 trillion probiotics support growing tummies; sachets help precise feeding — six boxes to grow with your kitten.",
  },
  "wt-dry-food-9": {
    name: "CIAO Probiotic Crunchy Sticks — Dried Tuna (5 sticks × 6)",
    description:
      "Rich dried-tuna sticks (~22g) with about 10 billion probiotics. Use as treats or a wet–dry flavor boost — Japan-made 5 sticks × 6 boxes.",
  },
  "wt-dry-food-10": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Triple Tuna & Bonito (10 bags × 6)",
    description:
      "Ocean layers of tuna and bonito in rotating flavors. 1 trillion probiotics and green-tea odor care — six-box stock for seafood-loving homes.",
  },
  "wt-dry-food-11": {
    name: "CIAO 1 Trillion Probiotic Dry Food — Triple Seafood Flavors (10 bags × 6)",
    description:
      "Three seafood profiles like a mini ocean menu. 1 trillion probiotics, green-tea odor care, and easy sachets — six boxes of 10 bags for seafood fans.",
  },
  "wt-freeze-dried-1": {
    name: "MAMACOOK Tajima Freeze-Dried Chicken Strips (Cat) 30g × 10",
    description:
      "Free-range Tajima chicken, flash freeze-dried into fragrant strips. No additives or preservatives — 100% pure chicken for training rewards or everyday treats. Ten 30g pouches.",
  },
  "wt-freeze-dried-2": {
    name: "MAMACOOK Tajima Freeze-Dried Chicken Breast & Liver (Cat) 18g × 10",
    description:
      "100% Japanese chicken — breast and liver in one freeze-dried bite. Rich aroma for picky cats; ten 18g pouches for daily rewards.",
  },
  "wt-freeze-dried-3": {
    name: "MAMACOOK Tajima Freeze-Dried Japanese Scallop (Cat) 11g × 10",
    description:
      "Scallops from Hokkaido–Aomori waters, freeze-dried to keep sweet thickness and amino acids. Additive-free luxury seafood snacks — ten 11g pouches.",
  },
  "wt-freeze-dried-4": {
    name: "MAMACOOK Tajima Freeze-Dried Whitebait (Cat) 10g × 10",
    description:
      "Whole whitebait freeze-dried crisp and ocean-fresh. Great for training or crumbling over meals — ten light 10g pouches.",
  },
  "wt-freeze-dried-5": {
    name: "MAMACOOK Tajima Freeze-Dried Japanese Rainbow Trout (Cat) 15g × 10",
    description:
      "Japanese rainbow trout freeze-dried with fragrant fish oils. High-protein seafood rotation — ten individually packed 15g pouches.",
  },
  "wt-freeze-dried-6": {
    name: "MAMACOOK Tajima Freeze-Dried Chicken Breast & Kidney (Cat) 18g × 10",
    description:
      "Japanese chicken breast with kidney for dual texture. Freeze-dried pure flavor — ten 18g pouches for rewards or wet–dry topping.",
  },
  "wt-freeze-dried-7": {
    name: "MAMACOOK Tajima Freeze-Dried Japanese Tuna (Cat) 14g × 10",
    description:
      "Luxury freeze-dried tuna — high protein, low fat, with DHA/EPA. Classic Japanese seafood joy in ten 14g pouches.",
  },
  "wt-freeze-dried-8": {
    name: "MAMACOOK Tajima Freeze-Dried Chicken Fillet (Cat) 30g × 10",
    description:
      "Lean Tajima chicken fillet, freeze-dried tender and aromatic. Additive-free 100% chicken — ten generous 30g pouches.",
  },
  "wt-freeze-dried-9": {
    name: "MAMACOOK Tajima Freeze-Dried Chicken Bites (Cat) 18g × 10",
    description:
      "Bite-size freeze-dried chicken — easy to hand-feed or sprinkle on kibble. Japan-made training treats in ten portable 18g pouches.",
  },
  "wt-freeze-dried-10": {
    name: "MAMACOOK Tajima Freeze-Dried Pork Heart (Cat) 25g × 10",
    description:
      "Freeze-dried pork heart with rich organ savor for meat-loving cats. Ten 25g pouches for measured, confident feeding.",
  },
  "wt-freeze-dried-11": {
    name: "MAMACOOK Tajima Freeze-Dried Additive-Free Pork Thigh (Cat) 20g × 10",
    description:
      "Clean pork-thigh freeze-dried strips with pure aroma and chew. Japan-made, additive-free — ten 20g pouches for flavor rotation.",
  },
  "wt-freeze-dried-12": {
    name: "MAMACOOK Tajima Freeze-Dried Shinshu Salmon (Cat) 17g × 10",
    description:
      "Azumino Shinshu salmon from Nagano — rich oils and layered aroma for special-day rewards. Ten luxurious 17g pouches.",
  },
  "wt-freeze-dried-13": {
    name: "Petio Freeze-Dried Salmon (Cat) 10g × 6",
    description:
      "Petio freeze-dried salmon from fresh ingredients — no preservatives or colorants. Feed whole, crumble on food, or soften into wet meals. Light 10g × 6 starter pack.",
  },
  "wt-freeze-dried-14": {
    name: "Petio Freeze-Dried Chicken, Liver & Kidney 15g × 6",
    description:
      "Triple chicken freeze-dried bites — meat, liver, and kidney. No preservatives or dyes; great as toppers or rewards. Approachable 15g × 6 pack.",
  },
  "wt-freeze-dried-15": {
    name: "Petio Freeze-Dried Tuna, Bonito & Salmon 9g × 6",
    description:
      "Three ocean flavors in one freeze-dried mix. Preservative-free; sprinkle or serve as chips. Compact 9g × 6 for seafood fans.",
  },
  "wt-freeze-dried-16": {
    name: "MAMACOOK Tajima Freeze-Dried Capelin (Cat) 10g × 10",
    description:
      "Whole capelin freeze-dried crisp and aromatic. Fun training rewards or meal toppers — ten Japan-made 10g pouches.",
  },
  "wt-freeze-dried-17": {
    name: "Japanese Additive-Free Freeze-Dried Chicken Liver (Cat) 40g × 8",
    description:
      "Japanese additive-free freeze-dried liver with deep aroma picky cats chase. Larger 40g × 8 stock pack — feed whole or crumble over meals.",
  },
  "wt-freeze-dried-18": {
    name: "Japanese Additive-Free Freeze-Dried Chicken (Cat) 40g × 8",
    description:
      "Japanese additive-free freeze-dried chicken — pure aroma, light crunch. 40g × 8 for everyday rewards or training; crumble over wet or dry food.",
  },
};

const WT_TAG_EN: Record<string, string> = {
  高水分補給: "High moisture",
  海鮮雙拼: "Seafood duo",
  綠茶消臭: "Green-tea odor care",
  全齡貓適用: "All life stages",
  白肉金槍魚: "White-meat tuna",
  層次鮮味: "Layered flavor",
  挑嘴貓友好: "Picky-eater friendly",
  高蛋白配方: "High protein",
  和牛奢華: "Wagyu luxury",
  活力補給: "Energy support",
  熟齡貓專用: "Senior formula",
  軟質好入口: "Soft & easy",
  三重蛋白: "Triple protein",
  單一海鮮: "Single seafood",
  清爽好消化: "Light & digestible",
  杯裝便利: "Cup convenience",
  清淡海鮮: "Mild seafood",
  雞胸低負擔: "Lean chicken",
  輪替菜單: "Menu rotation",
  白飯魚點綴: "Whitebait topping",
  趣味口感: "Playful texture",
  木魚乾香氣: "Bonito aroma",
  乾濕混餵: "Wet–dry mix",
  活力菜單: "Active menu",
  柔滑好吞嚥: "Easy to swallow",
  越光米配方: "Koshihikari rice",
  腸胃溫和: "Gentle on tummy",
  軟食友好: "Soft-food friendly",
  經典日系味: "Classic Japanese",
  鰹魚乾點綴: "Bonito flakes",
  日常輪替: "Daily rotation",
  乾糧: "Dry food",
  "1兆乳酸菌": "1 trillion probiotics",
  鰹魚乾味: "Bonito flake flavor",
  日本直送: "Direct from Japan",
  乳酸菌: "Probiotics",
  雞肉味: "Chicken flavor",
  獨立包裝: "Individually wrapped",
  金槍魚乾: "Dried tuna",
  口味輪替: "Flavor rotation",
  金槍魚: "Tuna",
  雞肉蛋白: "Chicken protein",
  鰹魚味: "Bonito flavor",
  幼貓專用: "For kittens",
  海鮮味: "Seafood flavors",
  凍乾零食: "Freeze-dried treats",
  冷凍脫水系列: "Freeze-dried series",
  貓貓小食: "Cat treats",
  貓用: "For cats",
  "100%純肉": "100% pure meat",
  無添加: "No additives",
  但馬高原: "Tajima Highlands",
  雞肉: "Chicken",
  雞肝: "Chicken liver",
  日本國產: "Japanese-sourced",
  帆立貝: "Scallop",
  海鮮鮮味: "Ocean-fresh flavor",
  銀魚: "Whitebait",
  天然鮮味: "Natural savor",
  訓練獎勵: "Training reward",
  虹鮭魚: "Rainbow trout",
  高蛋白: "High protein",
  雞腎: "Chicken kidney",
  "DHA・EPA": "DHA / EPA",
  雞柳: "Chicken fillet",
  低脂肪: "Low fat",
  雞粒: "Chicken bites",
  一口大小: "Bite-size",
  豬心: "Pork heart",
  臟器鮮味: "Organ savor",
  豬大腿肉: "Pork thigh",
  肉條: "Meat strips",
  日本製: "Made in Japan",
  信州三文魚: "Shinshu salmon",
  贅沢鮮味: "Luxury savor",
  三文魚: "Salmon",
  全貓適用: "All cats",
  無防腐劑: "No preservatives",
  拌糧提味: "Meal topper",
  三重雞肉: "Triple chicken",
  海鮮三拼: "Seafood trio",
  西太公魚: "Capelin",
  整尾凍乾: "Whole-fish freeze-dried",
  大份裝: "Value pack",
  無添加天然系列: "No-additive natural series",
  老貓零食: "Senior cat treats",
  去毛球配方: "Hairball-care formula",
  bb貓零食: "Kitten treats",
  BB貓零食: "Kitten treats",
  毛玉配慮: "Hairball care",
  吐毛球配方: "Hairball formula",
  天然系列: "Natural series",
  糊仔: "Paste treats",
  膏狀小食: "Creamy treats",
  貓貓脆餅: "Cat crisps",
  烤鰹魚: "Grilled bonito",
  魚條: "Fish sticks",
  奶粉: "Milk powder",
  山羊奶: "Goat milk",
  狗狗小食: "Dog treats",
  狗用: "For dogs",
};

function freezeDriedSeriesForVendor(
  vendor: string,
): { zh: string; en: string } | undefined {
  if (vendor === "MAMACOOK") {
    return { zh: "MAMACOOK 但馬高原", en: "MAMACOOK Tajima Highlands" };
  }
  if (vendor === "Petio") {
    return { zh: "Petio 冷凍脫水系列", en: "Petio Freeze-Dried Series" };
  }
  if (vendor) {
    return { zh: vendor, en: vendor };
  }
  return undefined;
}

/** Strip series/brand prefix so list cards can show series + name separately. */
export function freezeDriedProductName(
  fullName: string,
  series: string | undefined,
  locale: "zh" | "en",
): string {
  if (!series) return fullName;
  if (locale === "zh") {
    if (fullName.startsWith(series)) {
      return fullName.slice(series.length).replace(/^[・\s\-–—]+/, "").trim();
    }
    // Titles like「日本國產無添加冷凍脫水…」without a vendor series prefix.
    return fullName;
  }
  // English names usually already omit the series as a separate prefix.
  const withoutVendor = fullName
    .replace(/^MAMACOOK\s+Tajima\s+/i, "")
    .replace(/^Petio\s+Freeze-Dried\s+/i, "")
    .trim();
  return withoutVendor || fullName;
}

function wtJapanToProduct(p: WtJapanProduct): Product {
  const en = WT_JAPAN_EN[p.id];
  const series =
    p.subcategory === "冷凍脫水系列"
      ? freezeDriedSeriesForVendor(p.vendor)
      : undefined;
  const collectionTags =
    p.subcategory === "冷凍脫水系列"
      ? Array.from(new Set([...p.tags, "冷凍脫水系列", "貓貓小食", "貓用"]))
      : p.tags;
  return {
    id: p.id,
    // Keep in sync with productsData `category` / `categorySlug` (貓咪商品 → cats)
    categorySlug: p.categorySlug,
    subcategory: p.subcategory,
    image: p.imageUrl,
    name: {
      zh: p.title,
      en: en?.name ?? p.title,
    },
    price: p.price,
    originalPrice: p.originalPrice,
    series,
    icon: "cat",
    description: {
      zh: p.description,
      en: en?.description ?? p.description,
    },
    tags: collectionTags,
    productType: p.productType,
    inStock: true,
    brand: p.vendor,
    vendor: p.vendor,
    sourceUrl: p.sourceUrl,
    sourceImageUrl: p.sourceImageUrl,
    handle: p.handle,
    recommendedBreeds: p.recommendedBreeds,
    sourceCategory: p.category,
    specs: [
      { zh: `品牌：${p.vendor}`, en: `Brand: ${p.vendor}` },
      { zh: "規格：日本原裝進口・貓貓用", en: "Import: Japan original · for cats" },
      ...(p.subcategory === "冷凍脫水系列"
        ? [
            {
              zh: "專區：冷凍食物專區（冷凍脫水系列）",
              en: "Zone: Cat freeze-dried food (freeze-dried series)",
            },
            {
              zh: "Collection：/categories/cats/freeze-dried",
              en: "Collection: /categories/cats/freeze-dried",
            },
          ]
        : []),
      ...collectionTags.slice(0, 3).map((tag) => ({
        zh: tag,
        en: WT_TAG_EN[tag] ?? tag,
      })),
    ],
  };
}

/** WT Japan CIAO cans + dry food + freeze-dried — merged from `@/data/productsData`. */
export const WT_JAPAN_STOREFRONT_PRODUCTS: Product[] =
  WT_JAPAN_PRODUCTS.map(wtJapanToProduct);

function wtJapanCatSnackToProduct(p: WtJapanCatSnackProduct): Product {
  const seriesLabel = CAT_SNACK_SERIES_LABEL[p.series];
  const tags = Array.from(
    new Set([...p.tags, "貓貓小食", "貓用", p.series, seriesLabel.zh]),
  );
  return {
    id: p.id,
    categorySlug: p.categorySlug,
    subcategory: p.subcategory,
    image: p.imageUrl,
    name: {
      zh: p.title.replace(/\s+/g, " ").trim(),
      en: p.nameEn,
    },
    price: p.price,
    originalPrice: p.originalPrice,
    series: seriesLabel,
    snackSeries: p.series,
    icon: "cat",
    description: {
      zh: p.description,
      en: p.descriptionEn,
    },
    tags,
    productType: p.productType,
    inStock: true,
    brand: p.vendor,
    vendor: p.vendor,
    sourceUrl: p.sourceUrl,
    sourceImageUrl: p.sourceImageUrl,
    handle: p.handle,
    sourceCategory: p.category,
    specs: [
      { zh: `品牌：${p.vendor}`, en: `Brand: ${p.vendor}` },
      { zh: "規格：日本原裝進口・貓貓用", en: "Import: Japan original · for cats" },
      {
        zh: `專區：貓貓小食專區（${seriesLabel.zh}）`,
        en: `Zone: Cat treats (${seriesLabel.en})`,
      },
      {
        zh: "Collection：/categories/cats/snacks",
        en: "Collection: /categories/cats/snacks",
      },
      ...tags.slice(0, 3).map((tag) => ({
        zh: tag,
        en: WT_TAG_EN[tag] ?? tag,
      })),
    ],
  };
}

/** WT Japan cat snack series under 貓貓小食專區. */
export const WT_JAPAN_CAT_SNACK_STOREFRONT_PRODUCTS: Product[] =
  WT_JAPAN_CAT_SNACK_PRODUCTS.map(wtJapanCatSnackToProduct);

/** Raw fields in the single authoritative WT Japan dog-product JSON. */
export type WtJapanDogProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  spec: string;
  inStock: boolean;
};

const WT_JAPAN_DOG_EN: Record<string, { name: string; description: string }> = {
  "wt-japan-001": {
    name: "MAMACOOK Freeze-Dried Chicken Breast & Comb Mix for Dogs 18g × 10",
    description: "Japan-made MAMACOOK freeze-dried dog treats made from chicken breast and dried comb, in ten 18g pouches.",
  },
  "wt-japan-002": {
    name: "PetPro Japan-Made Additive-Free Chicken Liver Treats 100g × 10",
    description: "Japan-made PetPro chicken-liver treats with no added colorants or preservatives, in ten 100g pouches.",
  },
  "wt-japan-003": {
    name: "PetPro Japan-Made Additive-Free Sliced Beef Tongue Skin 50g × 10",
    description: "Thin-cut, Japan-made PetPro beef tongue skin treats with no added colorants or preservatives, in ten 50g pouches.",
  },
  "wt-japan-004": {
    name: "HappyDays Japan-Made Venison Slices for Dogs 30g × 10",
    description: "HappyDays venison slices made from Japanese deer, with no added colorants or preservatives, in ten 30g pouches.",
  },
  "wt-japan-005": {
    name: "PetPro Japan-Made Additive-Free Long Beef Achilles Treats 70g × 10",
    description: "Long-cut PetPro beef Achilles treats for a satisfying chew, made without added colorants, preservatives, or antioxidants, in ten 70g pouches.",
  },
};

const WT_JAPAN_DOG_SOURCE: Record<
  string,
  { brand?: string; sourceUrl: string; sourceImageUrl?: string; handle: string }
> = {
  "wt-japan-001": {
    sourceUrl: "https://www.mamacook.co.jp/lineup/?detail=20181016104753",
    handle: "freeze-dried-chicken-breast-comb-mix-dog-18g",
  },
  "wt-japan-002": {
    sourceUrl: "https://petpro.jp/",
    handle: "made-in-japan-additive-free-chicken-liver-100g",
  },
  "wt-japan-003": {
    sourceUrl: "https://petpro.jp/",
    handle: "made-in-japan-additive-free-beef-tongue-skin-50g",
  },
  "wt-japan-004": {
    brand: "HappyDays",
    sourceUrl: "https://petpro.jp/post-24445/",
    handle: "happydays-japan-venison-slices-dog-30g",
  },
  "wt-japan-005": {
    sourceUrl: "https://petpro.jp/16680-2/",
    sourceImageUrl: "https://petpro.jp/wp-content/uploads/2022/11/4981528362633-1.jpg",
    handle: "made-in-japan-additive-free-beef-achilles-long-70g",
  },
};

/** Convert one statically imported WT Japan dog record to the unified catalog. */
export function wtJapanDogProductToProduct(p: WtJapanDogProduct): Product {
  const english = WT_JAPAN_DOG_EN[p.id];
  const source = WT_JAPAN_DOG_SOURCE[p.id];
  const brand = source?.brand ?? p.brand;
  return {
    id: p.id,
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    image: `/images/products/${p.id}.webp`,
    name: {
      zh: p.name,
      en: english?.name ?? p.name,
    },
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    series: { zh: brand, en: brand },
    icon: "dog",
    description: {
      zh: `${brand} 日本原裝狗狗小食；${p.categoryName}，每箱 ${p.spec}。`,
      en: english?.description ?? `${brand} dog treats imported from Japan.`,
    },
    specs: [
      { zh: `品牌：${brand}`, en: `Brand: ${brand}` },
      { zh: `規格：${p.spec}`, en: `Spec: ${p.spec}` },
      { zh: "產地：日本・狗狗用", en: "Origin: Japan · for dogs" },
      { zh: `分類：${p.categoryName}`, en: "Category: Dog treats" },
    ],
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", brand],
    productType: "狗狗小食",
    inStock: p.inStock,
    brand,
    vendor: p.brand,
    sourceUrl: source?.sourceUrl,
    sourceImageUrl: source?.sourceImageUrl,
    handle: source?.handle,
    sourceCategory: p.categoryName,
  };
}

/** Five WT Japan dog treats, statically imported from the single public JSON. */
export const WT_JAPAN_DOG_STOREFRONT_PRODUCTS: Product[] =
  (WT_JAPAN_DOG_PRODUCTS_JSON as WtJapanDogProduct[]).map(
    wtJapanDogProductToProduct,
  );

/** Medication-assistance treats shared by the cat and dog storefront zones. */
const PILL_TREAT_PRODUCTS: Product[] = [
  {
    id: "pill-pocket-greenies-dog-chicken",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/pill-pocket-greenies-dog-chicken.webp",
    name: {
      zh: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（雞肉風味）",
      en: "GREENIES Pill Pockets Dog Treat - Chicken Flavor",
    },
    price: 98,
    originalPrice: 110,
    series: { zh: "GREENIES", en: "GREENIES" },
    icon: "dog",
    description: {
      zh: "專為隱藏藥丸與膠囊設計的軟質餡餅，專利空腔可輕鬆捏合封口。濃郁雞肉香氣有效遮蓋藥物氣味。",
      en: "Soft treats designed to hide pills and capsules. The patented pocket is easy to pinch closed, while the rich chicken aroma helps mask medicine odors.",
    },
    specs: [
      { zh: "品牌：GREENIES", en: "Brand: GREENIES" },
      { zh: "規格：30 顆裝 (224g)", en: "Spec: 30 pieces (224g)" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "雞肉風味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "GREENIES",
    vendor: "GREENIES",
  },
  {
    id: "pill-pocket-greenies-dog-peanut-butter",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/pill-pocket-greenies-dog-peanut-butter.webp",
    name: {
      zh: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（花生醬風味）",
      en: "GREENIES Pill Pockets Dog Treat - Peanut Butter Flavor",
    },
    price: 98,
    originalPrice: 110,
    series: { zh: "GREENIES", en: "GREENIES" },
    icon: "dog",
    description: {
      zh: "濃郁花生醬香氣能完美遮蔽藥物味道，質地柔軟可捏合密封。",
      en: "A rich peanut-butter aroma helps mask the taste of medicine, and the soft texture can be pinched closed around a pill.",
    },
    specs: [
      { zh: "品牌：GREENIES", en: "Brand: GREENIES" },
      { zh: "規格：30 顆裝 (224g)", en: "Spec: 30 pieces (224g)" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "花生醬風味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "GREENIES",
    vendor: "GREENIES",
  },
  {
    id: "pill-assist-royal-canin-cat",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/pill-assist-royal-canin-cat.webp",
    name: {
      zh: "ROYAL CANIN 皇家 Pill Assist 貓用投藥輔助軟錠",
      en: "ROYAL CANIN Pill Assist Cat Treats",
    },
    price: 72,
    originalPrice: 80,
    series: { zh: "ROYAL CANIN", en: "ROYAL CANIN" },
    icon: "cat",
    description: {
      zh: "獸醫師參與研發，柔軟易塑形，完整包覆藥丸。高達 91% 服藥成功率，每顆約 3 kcal。",
      en: "Developed with veterinarians, these soft, moldable treats fully enclose pills. They offer a medication acceptance rate of up to 91%, with about 3 kcal per piece.",
    },
    specs: [
      { zh: "品牌：ROYAL CANIN", en: "Brand: ROYAL CANIN" },
      { zh: "規格：45g (約30顆)", en: "Spec: 45g (about 30 pieces)" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "ROYAL CANIN",
    vendor: "ROYAL CANIN",
  },
  {
    id: "pill-assist-royal-canin-dog-small",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/pill-assist-royal-canin-dog-small.webp",
    name: {
      zh: "ROYAL CANIN 皇家 Pill Assist 小型犬用投藥輔助軟錠",
      en: "ROYAL CANIN Pill Assist Small Dog Treats",
    },
    price: 78,
    originalPrice: 88,
    series: { zh: "ROYAL CANIN", en: "ROYAL CANIN" },
    icon: "dog",
    description: {
      zh: "專為體重 10kg 以下小型犬設計，質地柔軟易包裹藥丸，幫助減少服藥抗拒。",
      en: "Designed for small dogs under 10kg, the soft texture wraps easily around pills and helps reduce resistance to medication.",
    },
    specs: [
      { zh: "品牌：ROYAL CANIN", en: "Brand: ROYAL CANIN" },
      { zh: "規格：90g (約30顆)", en: "Spec: 90g (about 30 pieces)" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "小型犬"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "ROYAL CANIN",
    vendor: "ROYAL CANIN",
  },
  {
    id: "mediball-vets-labo-dog-cheese",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/mediball-vets-labo-dog-cheese.webp",
    name: {
      zh: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（起司味）",
      en: "VET'S Labo Mediball Dog Pill Treats - Cheese Flavor",
    },
    price: 48,
    originalPrice: 55,
    series: { zh: "VET'S Labo", en: "VET'S Labo" },
    icon: "dog",
    description: {
      zh: "日本獸醫師團隊研發，質地柔軟黏性佳，不易掉渣且能完美包覆藥丸。",
      en: "Developed by a team of Japanese veterinarians, these soft, tacky treats resist crumbling and wrap neatly around pills.",
    },
    specs: [
      { zh: "品牌：VET'S Labo", en: "Brand: VET'S Labo" },
      { zh: "規格：15 顆裝 (20g)", en: "Spec: 15 pieces (20g)" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "起司味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "VET'S Labo",
    vendor: "VET'S Labo",
  },
  {
    id: "mediball-vets-labo-dog-chicken",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/mediball-vets-labo-dog-chicken.webp",
    name: {
      zh: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（雞肉味）",
      en: "VET'S Labo Mediball Dog Pill Treats - Chicken Flavor",
    },
    price: 48,
    originalPrice: 55,
    series: { zh: "VET'S Labo", en: "VET'S Labo" },
    icon: "dog",
    description: {
      zh: "日本獸醫師推薦，高延展性與軟Q口感，能將錠劑或膠囊密實搓揉成小丸子餵食。",
      en: "Recommended by Japanese veterinarians, the pliable, soft-chewy texture can be shaped tightly around tablets or capsules for feeding.",
    },
    specs: [
      { zh: "品牌：VET'S Labo", en: "Brand: VET'S Labo" },
      { zh: "規格：15 顆裝 (20g)", en: "Spec: 15 pieces (20g)" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "雞肉味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "VET'S Labo",
    vendor: "VET'S Labo",
  },
  {
    id: "mediball-vets-labo-cat-tuna",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/mediball-vets-labo-cat-tuna.webp",
    name: {
      zh: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鮪魚味）",
      en: "VET'S Labo Mediball Cat Pill Treats - Tuna Flavor",
    },
    price: 48,
    originalPrice: 55,
    series: { zh: "VET'S Labo", en: "VET'S Labo" },
    icon: "cat",
    description: {
      zh: "日本國產品質，高適口性鮪魚風味。質地柔細延展性高，能輕易密合藥丸。",
      en: "Made in Japan with a highly palatable tuna flavor, the fine, flexible texture seals easily around pills.",
    },
    specs: [
      { zh: "品牌：VET'S Labo", en: "Brand: VET'S Labo" },
      { zh: "規格：15 顆裝 (20g)", en: "Spec: 15 pieces (20g)" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥", "鮪魚味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "VET'S Labo",
    vendor: "VET'S Labo",
  },
  {
    id: "mediball-vets-labo-cat-bonito",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/mediball-vets-labo-cat-bonito.webp",
    name: {
      zh: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鰹魚味）",
      en: "VET'S Labo Mediball Cat Pill Treats - Bonito Flavor",
    },
    price: 48,
    originalPrice: 55,
    series: { zh: "VET'S Labo", en: "VET'S Labo" },
    icon: "cat",
    description: {
      zh: "濃郁鰹魚香氣，專為挑食貓咪設計。軟Q質地不掉屑，可將硬錠完全捏入肉丸中。",
      en: "Rich bonito aroma makes this suitable for picky cats. The soft-chewy, low-crumb texture can completely enclose hard tablets.",
    },
    specs: [
      { zh: "品牌：VET'S Labo", en: "Brand: VET'S Labo" },
      { zh: "規格：15 顆裝 (20g)", en: "Spec: 15 pieces (20g)" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥", "鰹魚味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "VET'S Labo",
    vendor: "VET'S Labo",
  },
  {
    id: "ciao-churu-vet-pill-paste",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/ciao-churu-vet-pill-paste.webp",
    name: {
      zh: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（鮪魚味）",
      en: "CIAO Churu Vet High-Viscosity Pill Paste - Tuna Flavor",
    },
    price: 38,
    originalPrice: 45,
    series: { zh: "CIAO", en: "CIAO" },
    icon: "cat",
    description: {
      zh: "專為餵藥設計的高黏度濃稠肉泥，能緊密包覆藥粉、藥水或碎藥丸。",
      en: "A thick, high-viscosity puree designed for medication, helping closely coat powders, liquids, or crushed pills.",
    },
    specs: [
      { zh: "品牌：CIAO", en: "Brand: CIAO" },
      { zh: "規格：12g x 4 本", en: "Spec: 12g × 4 tubes" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥", "鮪魚味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "CIAO",
    vendor: "CIAO",
  },
  {
    id: "ciao-churu-vet-pill-paste-chicken",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/ciao-churu-vet-pill-paste-chicken.webp",
    name: {
      zh: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（雞肉味）",
      en: "CIAO Churu Vet High-Viscosity Pill Paste - Chicken Flavor",
    },
    price: 38,
    originalPrice: 45,
    series: { zh: "CIAO", en: "CIAO" },
    icon: "cat",
    description: {
      zh: "日本 CIAO 獸醫通路限定版，高黏稠度配方可將藥粉及顆粒牢牢包覆。",
      en: "A Japan-market CIAO veterinary-channel formula whose high viscosity holds medicine powders and granules securely.",
    },
    specs: [
      { zh: "品牌：CIAO", en: "Brand: CIAO" },
      { zh: "規格：12g x 4 本", en: "Spec: 12g × 4 tubes" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥", "雞肉味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "CIAO",
    vendor: "CIAO",
  },
  {
    id: "tomlyn-pill-mask-bacon",
    categorySlug: "dogs",
    subcategory: "投藥餵藥專用小食",
    image: "/products/tomlyn-pill-mask-bacon.webp",
    name: {
      zh: "Tomlyn 湯姆林 投藥軟膏/偽裝膏（煙燻培根風味）",
      en: "Tomlyn Pill-Mask Paste for Dogs - Bacon Flavor",
    },
    price: 85,
    originalPrice: 98,
    series: { zh: "Tomlyn", en: "Tomlyn" },
    icon: "dog",
    description: {
      zh: "可任意捏塑形狀的投藥肉膏，無論多大顆或形狀奇特的藥丸都能完美包裹。",
      en: "A moldable pill paste that can wrap medicine of virtually any size or unusual shape.",
    },
    specs: [
      { zh: "品牌：Tomlyn", en: "Brand: Tomlyn" },
      { zh: "規格：113g", en: "Spec: 113g" },
    ],
    tags: ["投藥餵藥專用小食", "狗用", "投藥", "餵藥", "煙燻培根風味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "Tomlyn",
    vendor: "Tomlyn",
  },
  {
    id: "easy-pill-cat-poultry",
    categorySlug: "cats",
    subcategory: "投藥餵藥專用小食",
    image: "/products/easy-pill-cat-poultry.webp",
    name: {
      zh: "EasyPill 貓用投藥軟膏（禽肉風味）",
      en: "EasyPill Cat Pill Treat - Poultry Flavor",
    },
    price: 65,
    originalPrice: 75,
    series: { zh: "EasyPill", en: "EasyPill" },
    icon: "cat",
    description: {
      zh: "法國進口專業獸醫投藥產品，具備極高適口性與柔軟延展性，輕鬆包裹藥物。",
      en: "A professional veterinary pill product imported from France, with high palatability and a soft, flexible texture that wraps easily around medicine.",
    },
    specs: [
      { zh: "品牌：EasyPill", en: "Brand: EasyPill" },
      { zh: "規格：10g x 3 條", en: "Spec: 10g × 3 sticks" },
    ],
    tags: ["投藥餵藥專用小食", "貓用", "投藥", "餵藥", "禽肉風味"],
    productType: "投藥餵藥專用小食",
    inStock: true,
    brand: "EasyPill",
    vendor: "EasyPill",
  },
];

/**
 * Raw hand-authored + WT Japan catalog before keyword food-zone classification.
 * Prefer exporting {@link PRODUCTS}, which runs {@link classifyCatalogProducts}.
 */
const PRODUCTS_RAW: Product[] = [
  // 貓咪商品 / Cat Products
  {
    id: "cat-bonito-flakes",
    categorySlug: "cats",
    image: "/products/cat-bonito-flakes.webp",
    name: { zh: "日本北海道鰹魚薄片", en: "Hokkaido Bonito Flakes" },
    price: 42,
    icon: "cat",
    description: {
      zh: "日本北海道直送鰹魚薄片，香氣濃郁，撒在糧面秒變豪華大餐。",
      en: "Shaved straight from Hokkaido, Japan — irresistibly aromatic sprinkled on any meal.",
    },
  },
  // WT Japan 貓食品、貓小食及狗小食在陣列尾端各統一加入一次。

  ...PILL_TREAT_PRODUCTS,

  // 狗狗商品 / Dog Products
  // Food zones use subcategory 「狗狗食品」 / 「狗狗小食」; gear stays untagged.
  // Final category/subcategory are enforced by classifyCatalogProducts() keywords.
  {
    id: "dog-food-1-5kg",
    categorySlug: "dogs",
    subcategory: "狗狗食品",
    image: "/products/dog-food-1-5kg.webp",
    name: { zh: "日本天然狗糧 1.5kg", en: "Japanese Natural Dog Food 1.5kg" },
    price: 168,
    icon: "dog",
    tags: ["狗狗食品", "狗糧"],
    description: {
      zh: "日本配方天然狗糧，均衡營養適合日常主食。",
      en: "Japanese-formula natural kibble — balanced nutrition for everyday meals.",
    },
  },
  {
    id: "dog-dental-chews",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    image: "/products/dog-dental-chews.webp",
    name: { zh: "狗狗潔牙骨 12支裝", en: "Dog Dental Chews (12pcs)" },
    price: 88,
    icon: "dog",
    tags: ["狗狗小食", "狗用", "潔牙骨"],
    description: {
      zh: "潔牙小食雙效設計，磨牙同時清潔齒垢，訓練獎勵都合適。",
      en: "Dental chew treats that scrub tartar while dogs gnaw — great as a reward too.",
    },
  },
  {
    id: "dog-dried-meat-treats",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    image: "/products/dog-dried-meat-treats.webp",
    name: { zh: "狗狗肉乾小食", en: "Dried Meat Dog Treats" },
    price: 52,
    icon: "dog",
    tags: ["狗狗小食", "狗用", "肉乾"],
    description: {
      zh: "風乾肉乾小食，高蛋白低負擔，適合日常獎勵同訓練。",
      en: "Air-dried meat treats — high protein, everyday rewards and training.",
    },
  },
  {
    id: "snack-chicken-jerky",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    image: "/products/snack-chicken-jerky.webp",
    name: { zh: "日本雞胸肉乾（狗用）", en: "Japanese Chicken Breast Jerky (for dogs)" },
    price: 48,
    icon: "dog",
    tags: ["狗狗小食", "狗用", "肉乾"],
    description: {
      zh: "100% 雞胸肉低溫烘乾製作，無添加防腐劑，狗狗健康零食首選。",
      en: "Slow low-temperature dried 100% chicken breast for dogs — no preservatives.",
    },
  },

  // 寵物小食 / Pet Snacks（貓狗共用／貓向小食）
  // Cat freeze-dried treats live under cats only (subcategory 「冷凍脫水系列」).
  // Dog-only treats live under dogs (subcategory 「狗狗小食」).
  {
    id: "assorted-treats-giftbox",
    categorySlug: "snacks",
    image: "/products/assorted-treats-giftbox.webp",
    name: { zh: "綜合寵物餅乾禮盒", en: "Assorted Pet Treats Gift Box" },
    price: 88,
    icon: "bone",
  },
  {
    id: "snack-cheese-stick",
    categorySlug: "snacks",
    image: "/products/snack-cheese-stick.webp",
    name: { zh: "貓狗共用芝士條", en: "Cheese Sticks for Cats & Dogs" },
    price: 55,
    icon: "bone",
    description: {
      zh: "香濃芝士味，質地軟韌，訓練獎勵、日常小食兩相宜。",
      en: "Rich cheesy flavor with a soft chewy texture — great for training rewards or everyday treats.",
    },
  },
  {
    id: "snack-fish-cracker",
    categorySlug: "snacks",
    image: "/products/snack-fish-cracker.webp",
    name: { zh: "貓咪魚肉夾心餅", en: "Cat Fish Sandwich Crackers" },
    price: 38,
    icon: "bone",
    description: {
      zh: "香脆餅乾夾住鮮甜魚肉醬，滿足貓貓嘴饞時刻。",
      en: "Crispy crackers filled with savory fish paste — a treat cats can't resist.",
    },
  },
  {
    id: "snack-sweet-potato-chips",
    categorySlug: "snacks",
    image: "/products/snack-sweet-potato-chips.webp",
    name: { zh: "日本蕃薯脆片", en: "Japanese Sweet Potato Chips" },
    price: 42,
    icon: "bone",
    description: {
      zh: "純天然蕃薯烘焙而成，香甜酥脆，貓狗皆宜嘅健康小食。",
      en: "Baked from all-natural sweet potato — sweet, crispy, and healthy for cats and dogs alike.",
    },
  },
  {
    id: "snack-scallop-jerky",
    categorySlug: "snacks",
    image: "/products/snack-scallop-jerky.webp",
    name: { zh: "北海道帆立貝乾", en: "Hokkaido Scallop Jerky" },
    price: 68,
    icon: "bone",
    description: {
      zh: "北海道直送帆立貝乾，鮮味十足，貓貓最愛嘅奢華小食。",
      en: "Shipped straight from Hokkaido — a rich, savory luxury treat cats can't resist.",
    },
  },

  // 寵物玩具 / Pet Toys

  // 營養保健 / Health & Wellness
  {
    id: "pet-joint-supplement",
    categorySlug: "health",
    image: "/products/pet-joint-supplement.webp",
    name: { zh: "寵物關節保健品", en: "Pet Joint Health Supplement" },
    price: 158,
    icon: "health",
  },
  {
    id: "cat-probiotics",
    categorySlug: "health",
    image: "/products/cat-probiotics.webp",
    name: { zh: "貓咪腸胃益生菌", en: "Cat Digestive Probiotics" },
    price: 118,
    icon: "health",
  },
  {
    id: "dog-coat-oil",
    categorySlug: "health",
    image: "/products/dog-coat-oil.webp",
    name: { zh: "狗狗美毛營養油", en: "Dog Coat Shine Oil" },
    price: 138,
    icon: "health",
  },
  {
    id: "health-omega3",
    categorySlug: "health",
    image: "/products/health-omega3.webp",
    name: { zh: "寵物深海魚油 Omega-3", en: "Pet Omega-3 Fish Oil" },
    price: 168,
    icon: "health",
    description: {
      zh: "挪威深海魚油提煉，有助毛髮亮麗、關節靈活。",
      en: "Extracted from deep-sea Norwegian fish oil to support a shiny coat and flexible joints.",
    },
  },
  {
    id: "health-dental-water",
    categorySlug: "health",
    image: "/products/health-dental-water.webp",
    name: { zh: "寵物潔牙漱口水添加劑", en: "Pet Dental Water Additive" },
    price: 98,
    icon: "health",
    description: {
      zh: "混入日常飲用水即可，有效減少牙菌膜同口氣問題。",
      en: "Simply add to drinking water to reduce plaque buildup and bad breath.",
    },
  },
  {
    id: "health-senior-multivitamin",
    categorySlug: "health",
    image: "/products/health-senior-multivitamin.webp",
    name: { zh: "高齡寵物綜合維他命", en: "Senior Pet Multivitamin" },
    price: 178,
    icon: "health",
    description: {
      zh: "專為老年貓狗設計，補充日常所需維他命同礦物質。",
      en: "Formulated for older cats and dogs to supplement daily vitamins and minerals.",
    },
  },
  {
    id: "health-urinary-support",
    categorySlug: "health",
    image: "/products/health-urinary-support.webp",
    name: { zh: "貓咪泌尿道保健品", en: "Cat Urinary Tract Support" },
    price: 148,
    icon: "health",
    description: {
      zh: "添加蔓越莓精華，有助維持泌尿系統健康，適合長期護理。",
      en: "Formulated with cranberry extract to help maintain long-term urinary health.",
    },
  },
  {
    id: "health-calming-chews",
    categorySlug: "health",
    image: "/products/health-calming-chews.webp",
    name: { zh: "寵物舒緩鎮定咀嚼錠", en: "Pet Calming Chews" },
    price: 128,
    icon: "health",
    description: {
      zh: "天然舒緩配方，幫助寵物放鬆情緒，適合怕生或緊張嘅寵物。",
      en: "A natural soothing formula that helps anxious or easily-startled pets relax.",
    },
  },

  // 居家清潔 / Home Cleaning

  // 限時優惠 / Limited-Time Deals
  {
    id: "deal-food-bundle",
    categorySlug: "deals",
    image: "/products/deal-food-bundle.webp",
    name: { zh: "貓狗糧限時特惠裝", en: "Cat & Dog Food Bundle Deal" },
    price: 199,
    icon: "clock",
  },
  {
    id: "deal-treats-3pack",
    categorySlug: "deals",
    image: "/products/deal-treats-3pack.webp",
    name: { zh: "寵物小食限時3件裝", en: "3-Pack Pet Treats Deal" },
    price: 99,
    icon: "clock",
  },
  {
    id: "deal-supplement-bogo",
    categorySlug: "deals",
    image: "/products/deal-supplement-bogo.webp",
    name: { zh: "寵物保健品限時買一送一", en: "Buy 1 Get 1 Pet Supplement" },
    price: 158,
    icon: "clock",
  },
  {
    id: "deal-health-trio",
    categorySlug: "deals",
    image: "/products/deal-health-trio.webp",
    name: { zh: "保健品三重組合限時優惠", en: "3-in-1 Supplement Bundle Deal" },
    price: 258,
    icon: "clock",
    description: {
      zh: "關節、腸胃、美毛三合一保健品組合，限時特價發售。",
      en: "Joint, digestive, and coat-care supplements bundled together at a limited-time price.",
    },
  },

  // 熱賣商品 / Best Sellers
  // Dog treat gift boxes carry 狗狗／狗零食 keywords → auto-filed to dogs/狗狗小食.
  {
    id: "bestseller-dog-giftbox",
    categorySlug: "bestsellers",
    image: "/products/bestseller-dog-giftbox.webp",
    name: { zh: "人氣日本狗零食禮盒", en: "Popular Japanese Dog Treat Gift Box" },
    price: 128,
    icon: "fire",
    tags: ["狗狗小食", "狗零食", "禮盒"],
    description: {
      zh: "人氣日本狗零食禮盒，適合狗狗日常獎勵同送禮。",
      en: "Popular Japanese dog-treat gift box — everyday rewards and gifting.",
    },
  },
  {
    id: "bestseller-cat-food",
    categorySlug: "bestsellers",
    image: "/products/bestseller-cat-food.webp",
    name: { zh: "人氣日本貓糧", en: "Popular Japanese Cat Food" },
    price: 158,
    icon: "fire",
    description: {
      zh: "全港貓奴力推嘅人氣貓糧，均衡營養，長期熱賣冠軍。",
      en: "A fan favorite among cat parents citywide — balanced nutrition and a long-time bestseller.",
    },
  },
  {
    id: "bestseller-dog-treats",
    categorySlug: "bestsellers",
    image: "/products/bestseller-dog-treats.webp",
    name: { zh: "人氣狗狗肉乾禮盒", en: "Popular Dog Jerky Gift Box" },
    price: 118,
    icon: "fire",
    tags: ["狗狗小食", "狗用", "肉乾", "禮盒"],
    description: {
      zh: "多口味肉乾組合禮盒，狗狗最愛嘅人氣小食首選。",
      en: "A multi-flavor jerky gift box — dogs' favorite go-to treat.",
    },
  },

  // 外出用品 / Outdoor Gear
  ...WT_JAPAN_STOREFRONT_PRODUCTS,
  ...WT_JAPAN_CAT_SNACK_STOREFRONT_PRODUCTS,
  ...WT_JAPAN_DOG_STOREFRONT_PRODUCTS,
];

/**
 * Storefront catalog after keyword food-zone classification.
 * - 冷凍脫水／貓貓・貓用 → cats / 冷凍脫水系列
 * - 貓貓小食系列（無添加／老貓／去毛球／BB）→ cats / 貓貓小食
 * - 狗狗／狗用 edible snacks & staple food → dogs / 狗狗小食 or 狗狗食品
 * - WT Japan dog treats (statically imported from wt_japan_products.json) → dogs / 狗狗小食
 */
export const PRODUCTS: Product[] = classifyCatalogProducts(PRODUCTS_RAW);

export function getProductsByCategory(
  slug: string | null,
  products: readonly Product[] = PRODUCTS,
): Product[] {
  if (!slug) return [...products];
  return products.filter((product) => product.categorySlug === slug);
}

/** Filter cat products by optional subcategory / snack-series pill (`null` = all). */
export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
  snackSeries: CatSnackSeries | null = null,
  products: readonly Product[] = PRODUCTS,
): Product[] {
  const cats = getProductsByCategory("cats", products);
  if (!subcategory) return cats;
  const bySub = cats.filter((product) => product.subcategory === subcategory);
  if (!snackSeries || subcategory !== "貓貓小食") return bySub;
  return bySub.filter((product) => product.snackSeries === snackSeries);
}

/** Filter dog products by optional subcategory pill (`null` = all). */
export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
  products: readonly Product[] = PRODUCTS,
): Product[] {
  const dogs = getProductsByCategory("dogs", products);
  if (!subcategory) return dogs;
  return dogs.filter((product) => product.subcategory === subcategory);
}

export function getProductById(
  id: string | null | undefined,
  products: readonly Product[] = PRODUCTS,
): Product | null {
  if (!id) return null;
  return products.find((product) => product.id === id) ?? null;
}

/** Resolve a subcategory path segment for cats or dogs; `null` if unknown. */
export function resolveCategorySubSlug(
  categorySlug: string,
  subSlug: string | null | undefined,
): ProductSubcategory | null {
  if (!subSlug) return null;
  if (categorySlug === "cats") {
    return CAT_SUBCATEGORY_BY_SLUG[subSlug] ?? null;
  }
  if (categorySlug === "dogs") {
    return DOG_SUBCATEGORY_BY_SLUG[subSlug] ?? null;
  }
  return null;
}

/** Resolve `?series=` on `/categories/cats/snacks`; `null` if unknown / absent. */
export function resolveCatSnackSeriesSlug(
  seriesSlug: string | null | undefined,
): CatSnackSeries | null {
  if (!seriesSlug) return null;
  return CAT_SNACK_SERIES_BY_SLUG[seriesSlug] ?? null;
}

/** Canonical product detail path. */
export function productHref(id: string): string {
  return `/product/${id}`;
}
