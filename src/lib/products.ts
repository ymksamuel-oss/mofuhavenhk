import type { CategoryIconName } from "@/lib/categories";
import {
  WT_JAPAN_PRODUCTS,
  type WtJapanProduct,
} from "@/data/productsData";
import { classifyCatalogProducts } from "@/lib/classifyPetFood";

/** Cat-products sub-filter keys (shown under 「貓咪商品」). */
export const CAT_SUBCATEGORIES = [
  "貓罐罐",
  "貓乾糧",
  "冷凍脫水系列",
] as const;

export type CatSubcategory = (typeof CAT_SUBCATEGORIES)[number];

/** Dog-products sub-filter keys (shown under 「狗狗商品」). */
export const DOG_SUBCATEGORIES = ["狗狗食品", "狗狗小食"] as const;

export type DogSubcategory = (typeof DOG_SUBCATEGORIES)[number];

/** Union of cat/dog food-zone subcategories used by product records. */
export type ProductSubcategory = CatSubcategory | DogSubcategory;

/** URL path segment → cat subcategory key. */
export const CAT_SUBCATEGORY_BY_SLUG: Record<string, CatSubcategory> = {
  "wet-cans": "貓罐罐",
  "dry-food": "貓乾糧",
  "freeze-dried": "冷凍脫水系列",
};

/** Cat subcategory key → URL path segment. */
export const CAT_SUBCATEGORY_SLUG: Record<CatSubcategory, string> = {
  貓罐罐: "wet-cans",
  貓乾糧: "dry-food",
  冷凍脫水系列: "freeze-dried",
};

/** URL path segment → dog subcategory key. */
export const DOG_SUBCATEGORY_BY_SLUG: Record<string, DogSubcategory> = {
  food: "狗狗食品",
  snacks: "狗狗小食",
};

/** Dog subcategory key → URL path segment. */
export const DOG_SUBCATEGORY_SLUG: Record<DogSubcategory, string> = {
  狗狗食品: "food",
  狗狗小食: "snacks",
};

export type Product = {
  id: string;
  categorySlug: string;
  /**
   * Optional food-zone sub-category for `/categories/cats` or `/categories/dogs`.
   * 「冷凍脫水系列」= cat-only freeze-dried food zone（凍乾零食／冷凍食物專區）.
   * 「狗狗小食」= dog treats zone under dog products.
   * Apparel / toys / supplies leave this undefined.
   */
  subcategory?: ProductSubcategory;
  /**
   * Path (under /public) to a real product photograph for this SKU.
   * Typical locations: `public/products/<id>.webp` or
   * `public/images/products/<id>.jpg` — never use AI-generated art,
   * cartoons, or shared category illustrations.
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
   * (e.g. 「MAMACOOK 但馬高原」 above the product name).
   */
  series?: { zh: string; en: string };
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

/**
 * Raw hand-authored + WT Japan catalog before keyword food-zone classification.
 * Prefer exporting {@link PRODUCTS}, which runs {@link classifyCatalogProducts}.
 */
const PRODUCTS_RAW: Product[] = [
  // 貓咪商品 / Cat Products
  // Temporarily hidden dummy / test products (not shown on storefront):
  // {
  //   id: "cat-food-1kg",
  //   categorySlug: "cats",
  //   image: "/products/cat-food-1kg.webp",
  //   name: { zh: "日本天然貓糧 1kg", en: "Japanese Natural Cat Food 1kg" },
  //   price: 138,
  //   icon: "cat",
  // },
  // {
  //   id: "cat-scratcher-set",
  //   categorySlug: "cats",
  //   image: "/products/cat-scratcher-set.webp",
  //   name: { zh: "貓咪抓板組合", en: "Cat Scratcher Set" },
  //   price: 98,
  //   icon: "cat",
  // },
  // {
  //   id: "litter-deodorizer",
  //   categorySlug: "cats",
  //   image: "/products/litter-deodorizer.webp",
  //   name: { zh: "貓砂盆除臭劑", en: "Litter Box Deodorizer" },
  //   price: 68,
  //   icon: "cat",
  // },
  {
    id: "ciao-tuna-paste-20pk",
    categorySlug: "cats",
    image: "/products/ciao-tuna-paste-20pk.webp",
    name: {
      zh: "CIAO 貓咪極上吞拿魚肉泥 (20支裝)",
      en: "CIAO Cat Tuna Paste Treats (20 sticks)",
    },
    price: 88,
    icon: "bone",
    description: {
      zh: "日本原裝進口，貓貓最愛的經典美味肉泥。",
      en: "Imported directly from Japan — the classic tuna paste treat cats love.",
    },
  },
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
  {
    id: "cat-auto-water-fountain",
    categorySlug: "cats",
    image: "/products/cat-auto-water-fountain.webp",
    name: { zh: "貓咪靜音循環飲水機", en: "Cat Auto Water Fountain" },
    price: 258,
    icon: "cat",
    description: {
      zh: "活性碳循環過濾，鼓勵貓貓多飲水，維持泌尿系統健康。",
      en: "Quiet carbon-filtered circulation encourages cats to drink more for urinary health.",
    },
  },
  {
    id: "cat-tofu-litter-6l",
    categorySlug: "cats",
    image: "/products/cat-tofu-litter-6l.webp",
    name: { zh: "日本製豆腐貓砂 6L", en: "Japanese Tofu Cat Litter 6L" },
    price: 88,
    icon: "cat",
    description: {
      zh: "天然豆腐渣製造，凝結力強、可直接沖廁，對貓貓同環境都溫和。",
      en: "Made from natural tofu pulp — strong clumping, flushable, and gentle on cats and the environment.",
    },
  },
  {
    id: "cat-catnip-toy",
    categorySlug: "cats",
    image: "/products/cat-catnip-toy.webp",
    name: { zh: "貓草玩具球", en: "Catnip Toy Ball" },
    price: 35,
    icon: "cat",
    description: {
      zh: "天然貓草填充玩具球，逗貓解悶，紓緩壓力好幫手。",
      en: "Filled with natural catnip — a fun way to relieve stress and beat boredom.",
    },
  },
  {
    id: "cat-window-perch",
    categorySlug: "cats",
    image: "/products/cat-window-perch.webp",
    name: { zh: "貓咪吸盤窗台跳台", en: "Suction Cup Window Perch" },
    price: 328,
    icon: "cat",
    description: {
      zh: "強力吸盤穩固安裝，讓貓貓享受曬太陽同賞街景嘅樂趣。",
      en: "Strong suction cups hold it firmly in place so cats can sunbathe and watch the world go by.",
    },
  },
  // Real WT Japan 冷凍脫水系列 (cat freeze-dried food zone) live in WT_JAPAN_STOREFRONT_PRODUCTS.

  // CIAO 貓罐罐 + 乾糧 + 冷凍脫水系列（WT Japan 貓貓冷凍食物專區）
  ...WT_JAPAN_STOREFRONT_PRODUCTS,

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
  {
    id: "dog-warm-coat",
    categorySlug: "dogs",
    image: "/products/dog-warm-coat.webp",
    name: { zh: "狗狗保暖大衣", en: "Dog Warm Coat" },
    price: 158,
    icon: "dog",
  },
  {
    id: "dog-training-pads",
    categorySlug: "dogs",
    image: "/products/dog-training-pads.webp",
    name: { zh: "狗狗尿墊 (30片裝)", en: "Dog Training Pads (30pcs)" },
    price: 118,
    icon: "dog",
    description: {
      zh: "高效吸水鎖味，加大加厚設計，室內如廁訓練必備。",
      en: "Extra-large, super-absorbent pads that lock in odor — essential for indoor potty training.",
    },
  },
  {
    id: "dog-raincoat",
    categorySlug: "dogs",
    image: "/products/dog-raincoat.webp",
    name: { zh: "狗狗反光防水雨衣", en: "Dog Reflective Raincoat" },
    price: 128,
    icon: "dog",
    description: {
      zh: "輕便防水物料配合反光條設計，落雨天散步都安心。",
      en: "Lightweight waterproof fabric with reflective strips for safe rainy-day walks.",
    },
  },
  {
    id: "dog-wafuu-collar",
    categorySlug: "dogs",
    image: "/products/dog-wafuu-collar.webp",
    name: { zh: "日式和風頸帶連鈴鐺", en: "Japanese-Style Collar with Bell" },
    price: 68,
    icon: "dog",
    description: {
      zh: "手工和風布藝頸帶，附小鈴鐺，散步時清脆悅耳。",
      en: "Handcrafted wafuu fabric collar with a tiny bell that jingles softly on every walk.",
    },
  },
  {
    id: "dog-chew-toy",
    categorySlug: "dogs",
    image: "/products/dog-chew-toy.webp",
    name: { zh: "耐咬橡膠潔齒玩具", en: "Durable Rubber Dental Chew Toy" },
    price: 78,
    icon: "dog",
    description: {
      zh: "天然橡膠製造，耐咬耐磨，同時清潔牙齒去除牙石。",
      en: "Made from natural rubber — tough and long-lasting while helping clean teeth and reduce tartar.",
    },
  },
  {
    id: "dog-travel-bowl",
    categorySlug: "dogs",
    image: "/products/dog-travel-bowl.webp",
    name: { zh: "摺疊旅行飯碗連袋", en: "Foldable Travel Bowl with Pouch" },
    price: 48,
    icon: "dog",
    description: {
      zh: "矽膠摺疊設計輕巧防漏，出門散步餵食都方便。",
      en: "Silicone foldable design is lightweight and leak-proof — perfect for feeding on walks.",
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
  {
    id: "toy-neko-ichi-wobble-wand",
    categorySlug: "toys",
    image: "/products/toy-neko-ichi-wobble-wand.webp",
    name: {
      zh: "【貓壱 (Neko Ichi)】貓用不倒翁羽毛逗貓棒玩具",
      en: "Neko Ichi Wobble Feather Teaser Toy",
    },
    price: 88,
    originalPrice: 128,
    icon: "toy",
    description: {
      zh: "底部重心設計不倒翁造型，配合天然羽毛與鈴鐺，吸引貓咪自主玩耍。",
      en: "A weighted wobble base paired with natural feathers and a bell keeps cats engaged in independent play.",
    },
    specs: [
      { zh: "材質：ABS樹脂、天然羽毛", en: "Material: ABS resin, natural feathers" },
      { zh: "尺寸：7 x 7 x 15 cm", en: "Size: 7 x 7 x 15 cm" },
    ],
  },
  {
    id: "toy-petio-silvervine-chew",
    categorySlug: "toys",
    image: "/products/toy-petio-silvervine-chew.webp",
    name: {
      zh: "【Petio (培ティオ)】貓用天然木天蓼潔齒咀嚼玩具",
      en: "Petio Natural Silvervine Chew Toy",
    },
    price: 48,
    originalPrice: 68,
    icon: "toy",
    description: {
      zh: "精選日本天然木天蓼及高品質麻繩編織，舒緩壓力、磨牙潔齒。",
      en: "Woven from premium Japanese silvervine (matatabi) and quality hemp rope to relieve stress while cleaning teeth.",
    },
    specs: [
      { zh: "規格：1入裝", en: "Pack size: 1 piece" },
      { zh: "長度約 18cm", en: "Length: approx. 18cm" },
    ],
  },
  {
    id: "toy-richell-treat-ball",
    categorySlug: "toys",
    image: "/products/toy-richell-treat-ball.webp",
    name: {
      zh: "【Richell (利其爾)】貓咪趣味滾動零食發聲球",
      en: "Richell Rolling Treat-Dispensing Sound Ball",
    },
    price: 118,
    originalPrice: 158,
    icon: "toy",
    description: {
      zh: "結合益智與餵食功能，滾動時掉落小零食並發出輕柔聲響。",
      en: "Combines puzzle play with feeding — treats drop out as it rolls, with a gentle rattling sound.",
    },
    specs: [
      { zh: "材質：食用級PP塑料", en: "Material: Food-grade PP plastic" },
      { zh: "直徑約 8cm", en: "Diameter: approx. 8cm" },
    ],
  },
  {
    id: "toy-doggyman-cotton-rope-bone",
    categorySlug: "toys",
    image: "/products/toy-doggyman-cotton-rope-bone.webp",
    name: {
      zh: "【DoggyMan】狗狗耐咬潔齒棉繩骨頭玩具",
      en: "DoggyMan Bite-Resistant Cotton Rope Bone Toy",
    },
    price: 55,
    originalPrice: 75,
    icon: "toy",
    description: {
      zh: "天然棉線緊密編織，強韌耐咬，深入牙縫清除牙垢與牙菌斑。",
      en: "Tightly woven from natural cotton rope — tough and chew-resistant, reaching into gaps to clear plaque and tartar.",
    },
    specs: [{ zh: "尺寸：M號 (約 25cm)", en: "Size: M (approx. 25cm)" }],
  },
  {
    id: "toy-supercat-disc-launcher",
    categorySlug: "toys",
    image: "/products/toy-supercat-disc-launcher.webp",
    name: {
      zh: "【Super Cat】貓用跳躍捕捉飛碟彈射玩具",
      en: "Super Cat Jump & Catch Disc Launcher",
    },
    price: 95,
    originalPrice: 130,
    icon: "toy",
    description: {
      zh: "輕輕一按將旋轉飛碟彈向空中，激發貓咪極致跳躍與撲克本能。",
      en: "A gentle press launches a spinning disc into the air, triggering your cat's ultimate jump-and-pounce instincts.",
    },
    specs: [
      { zh: "內容物：發射器 x1 + 飛碟 x4", en: "Contents: 1x launcher + 4x discs" },
    ],
  },
  {
    id: "toy-adies-tunnel-scratcher",
    categorySlug: "toys",
    image: "/products/toy-adies-tunnel-scratcher.webp",
    name: {
      zh: "【Adies】貓咪立體紙箱隧道抓板兩用玩具",
      en: "Adies 2-in-1 Cardboard Tunnel & Scratcher",
    },
    price: 138,
    originalPrice: 188,
    icon: "toy",
    description: {
      zh: "集隧道躲藏、磨爪抓板於一體，高密度瓦楞紙耐磨耐抓。",
      en: "Combines a hide-and-seek tunnel with a scratching pad, made from dense, wear-resistant corrugated cardboard.",
    },
    specs: [{ zh: "尺寸：50 x 30 x 25 cm", en: "Size: 50 x 30 x 25 cm" }],
  },
  {
    id: "toy-petio-plush-squeaky-animal",
    categorySlug: "toys",
    image: "/products/toy-petio-plush-squeaky-animal.webp",
    name: {
      zh: "【Petio (培ティオ)】狗狗互動毛絨發聲小動物玩具",
      en: "Petio Plush Squeaky Animal Toy",
    },
    price: 62,
    originalPrice: 88,
    icon: "toy",
    description: {
      zh: "柔軟毛絨材質，內置安全發聲器，陪伴狗狗度過無聊時光。",
      en: "Soft plush fabric with a built-in safe squeaker to keep dogs entertained through idle moments.",
    },
    specs: [
      { zh: "材質：聚酯纖維", en: "Material: Polyester fiber" },
      { zh: "長度約 20cm", en: "Length: approx. 20cm" },
    ],
  },
  {
    id: "toy-mindup-feather-wand",
    categorySlug: "toys",
    image: "/products/toy-mindup-feather-wand.webp",
    name: {
      zh: "【Mind Up】貓用安全逗貓羽毛伸縮棒",
      en: "Mind Up Retractable Feather Teaser Wand",
    },
    price: 72,
    originalPrice: 98,
    icon: "toy",
    description: {
      zh: "高彈性碳纖維伸縮桿，揮動輕盈不費力，多款可替換鈴鐺羽毛。",
      en: "A high-elasticity carbon-fiber wand that's light and effortless to swing, with interchangeable bell-and-feather attachments.",
    },
    specs: [
      { zh: "桿長：可伸縮 40cm 至 95cm", en: "Rod length: extends from 40cm to 95cm" },
    ],
  },
  {
    id: "toy-planetdog-bounce-ball",
    categorySlug: "toys",
    image: "/products/toy-planetdog-bounce-ball.webp",
    name: {
      zh: "【Planet Dog】狗狗高彈力耐咬尋回球",
      en: "Planet Dog High-Bounce Retrieving Ball",
    },
    price: 85,
    originalPrice: 110,
    icon: "toy",
    description: {
      zh: "無毒環保高彈橡膠，彈力極佳且能浮在水面上，戶外玩耍首選。",
      en: "Non-toxic, eco-friendly rubber with excellent bounce that floats on water — perfect for outdoor fetch.",
    },
    specs: [{ zh: "尺寸：S/M 號直徑 6.5cm", en: "Size: S/M, 6.5cm diameter" }],
  },
  {
    id: "toy-cattyman-spinning-butterfly",
    categorySlug: "toys",
    image: "/products/toy-cattyman-spinning-butterfly.webp",
    name: {
      zh: "【CattyMan】貓用智能電動旋轉蝴蝶逗趣玩具",
      en: "CattyMan Smart Spinning Butterfly Toy",
    },
    price: 158,
    originalPrice: 218,
    icon: "toy",
    description: {
      zh: "360度不規則旋轉蝴蝶，模擬真實昆蟲飛舞軌跡。",
      en: "Spins a butterfly through unpredictable 360° paths, mimicking the flight of a real insect.",
    },
    specs: [
      { zh: "電源：乾電池式 (AA x 3)", en: "Power: 3x AA batteries (not included)" },
    ],
  },
  {
    id: "toy-richell-snuffle-mat",
    categorySlug: "toys",
    image: "/products/toy-richell-snuffle-mat.webp",
    name: {
      zh: "【Richell (利其爾)】幼犬益智慢食藏食嗅聞墊玩具",
      en: "Richell Puppy Snuffle Mat & Slow Feeder",
    },
    price: 145,
    originalPrice: 190,
    icon: "toy",
    description: {
      zh: "多層次藏食設計，嗅聞尋找零食，消耗精力並緩解焦慮。",
      en: "A multi-layered hide-and-seek mat that encourages sniffing for treats, burning energy and easing anxiety.",
    },
    specs: [
      { zh: "尺寸：45 x 45 cm", en: "Size: 45 x 45 cm" },
      { zh: "可機洗", en: "Machine washable" },
    ],
  },
  {
    id: "toy-petio-catnip-fish-pillow",
    categorySlug: "toys",
    image: "/products/toy-petio-catnip-fish-pillow.webp",
    name: {
      zh: "【Petio (培ティオ)】貓草夾心毛絨耐咬魚形抱枕",
      en: "Petio Catnip-Filled Plush Fish Pillow",
    },
    price: 58,
    originalPrice: 78,
    icon: "toy",
    description: {
      zh: "內含濃郁貓薄荷粉，外層耐抓厚實帆布，適合抱著踢腳啃咬。",
      en: "Filled with potent catnip powder and wrapped in durable, scratch-resistant canvas — perfect for kicking and biting.",
    },
    specs: [{ zh: "長度：約 22cm", en: "Length: approx. 22cm" }],
  },
  {
    id: "toy-doggyman-dumbbell-chew",
    categorySlug: "toys",
    image: "/products/toy-doggyman-dumbbell-chew.webp",
    name: {
      zh: "【DoggyMan】狗狗潔齒橡膠漏食啞鈴玩具",
      en: "DoggyMan Dumbbell Treat-Dispensing Chew Toy",
    },
    price: 78,
    originalPrice: 105,
    icon: "toy",
    description: {
      zh: "啞鈴造型方便爪握與啃咬，凹槽可填入肉泥，兼具潔齒與益智。",
      en: "A dumbbell shape that's easy to paw and chew, with grooves for filling with pâté — combining dental care with mental stimulation.",
    },
    specs: [
      { zh: "材質：天然橡膠", en: "Material: Natural rubber" },
      { zh: "長度 16cm", en: "Length: 16cm" },
    ],
  },
  {
    id: "toy-nekoichi-bowl-scratcher",
    categorySlug: "toys",
    image: "/products/toy-nekoichi-bowl-scratcher.webp",
    name: {
      zh: "【貓壱 (Neko Ichi)】貓咪專用趣味紙箱抓盤玩具",
      en: "Neko Ichi Bowl-Shaped Scratcher & Ball Track",
    },
    price: 98,
    originalPrice: 138,
    icon: "toy",
    description: {
      zh: "圓形碗狀貼合身體曲線，內含滾動軌道小球，邊磨爪邊追逐。",
      en: "A round, body-hugging bowl shape with a built-in rolling ball track for scratching and chasing at once.",
    },
    specs: [
      { zh: "直徑：38cm", en: "Diameter: 38cm" },
      { zh: "深度 12cm", en: "Depth: 12cm" },
    ],
  },
  {
    id: "toy-koneko-bell-ball-set",
    categorySlug: "toys",
    image: "/products/toy-koneko-bell-ball-set.webp",
    name: {
      zh: "【Koneko】幼貓專用鈴鐺彩球毛絨玩具套裝",
      en: "Koneko Kitten Bell Ball Toy Set",
    },
    price: 42,
    originalPrice: 60,
    icon: "toy",
    description: {
      zh: "6件不同材質小體積彩球，內置清脆鈴鐺，專為幼貓設計。",
      en: "A set of 6 small, differently-textured balls with crisp bells inside, designed specifically for kittens.",
    },
    specs: [
      { zh: "數量：6入裝", en: "Quantity: 6-piece set" },
      { zh: "直徑約 4cm", en: "Diameter: approx. 4cm each" },
    ],
  },
  {
    id: "toy-petio-laser-chaser",
    categorySlug: "toys",
    image: "/products/toy-petio-laser-chaser.webp",
    name: {
      zh: "【Petio (培ティオ)】貓用互動雷射光自動追逐玩具",
      en: "Petio Automatic Laser Chase Toy",
    },
    price: 128,
    originalPrice: 168,
    icon: "toy",
    description: {
      zh: "自動不規則紅外線雷射軌跡，解放主人雙手進行體能鍛鍊。",
      en: "Projects an unpredictable infrared laser path automatically, giving cats a workout hands-free.",
    },
    specs: [
      { zh: "自動關機保護：15分鐘", en: "Auto shut-off: after 15 minutes" },
    ],
  },
  {
    id: "toy-doggyman-ring-frisbee",
    categorySlug: "toys",
    image: "/products/toy-doggyman-ring-frisbee.webp",
    name: {
      zh: "【DoggyMan】飛盤耐咬環形訓練玩具",
      en: "DoggyMan Bite-Resistant Ring Frisbee",
    },
    price: 68,
    originalPrice: 92,
    icon: "toy",
    description: {
      zh: "輕量化高韌性EVA材質，飛行穩定，適合戶外草地拋接。",
      en: "Lightweight, high-durability EVA material with stable flight — ideal for outdoor fetch on grass.",
    },
    specs: [
      { zh: "直徑：22cm", en: "Diameter: 22cm" },
      { zh: "厚度 3cm", en: "Thickness: 3cm" },
    ],
  },
  {
    id: "toy-richell-cardboard-house",
    categorySlug: "toys",
    image: "/products/toy-richell-cardboard-house.webp",
    name: {
      zh: "【Richell (利其爾)】貓咪躲藏立體紙箱屋玩具",
      en: "Richell Hideaway Cardboard Cat House",
    },
    price: 168,
    originalPrice: 230,
    icon: "toy",
    description: {
      zh: "日系簡約木紋印花紙箱屋，多個圓孔與抓板設計。",
      en: "A minimalist Japanese-style wood-grain print cardboard house with multiple peekaboo holes and a built-in scratcher.",
    },
    specs: [{ zh: "尺寸：40 x 40 x 40 cm", en: "Size: 40 x 40 x 40 cm" }],
  },
  {
    id: "toy-supercat-catnip-mouse",
    categorySlug: "toys",
    image: "/products/toy-supercat-catnip-mouse.webp",
    name: {
      zh: "【Super Cat】貓草噴霧絨毛仿真老鼠玩具",
      en: "Super Cat Catnip Spray Plush Mouse",
    },
    price: 45,
    originalPrice: 65,
    icon: "toy",
    description: {
      zh: "仿真外型搭配專用濃縮貓草噴霧，散發致命吸引力。",
      en: "A lifelike plush mouse paired with a concentrated catnip spray for irresistible appeal.",
    },
    specs: [
      { zh: "長度：12cm", en: "Length: 12cm" },
      { zh: "附 15ml 貓草噴霧", en: "Includes 15ml catnip spray" },
    ],
  },
  {
    id: "toy-petio-slider-puzzle",
    categorySlug: "toys",
    image: "/products/toy-petio-slider-puzzle.webp",
    name: {
      zh: "【Petio (培ティオ)】狗狗益智尋寶翻蓋滑塊玩具",
      en: "Petio Treasure Hunt Slider Puzzle Toy",
    },
    price: 155,
    originalPrice: 208,
    icon: "toy",
    description: {
      zh: "推動滑塊、掀開蓋子才能吃到獎勵零食，開發狗狗智力。",
      en: "Dogs must slide and flip covers to reach the reward treats underneath — a fun way to build problem-solving skills.",
    },
    specs: [{ zh: "尺寸：30 x 30 cm", en: "Size: 30 x 30 cm" }],
  },
  {
    id: "toy-cattyman-ball-tower",
    categorySlug: "toys",
    image: "/products/toy-cattyman-ball-tower.webp",
    name: {
      zh: "【CattyMan】貓用三層旋轉彩球軌道塔",
      en: "CattyMan 3-Tier Spinning Ball Track Tower",
    },
    price: 112,
    originalPrice: 150,
    icon: "toy",
    description: {
      zh: "三層獨立轉動軌道，彩色小球高速滾動不飛出，多貓家庭首選。",
      en: "Three independently spinning tracks let colorful balls race around without flying out — great for multi-cat households.",
    },
    specs: [
      { zh: "底座直徑：25cm", en: "Base diameter: 25cm" },
      { zh: "高度 18cm", en: "Height: 18cm" },
    ],
  },
  {
    id: "toy-doggyman-dental-tennis-balls",
    categorySlug: "toys",
    image: "/products/toy-doggyman-dental-tennis-balls.webp",
    name: {
      zh: "【DoggyMan】狗狗潔齒潔牙網球玩具組",
      en: "DoggyMan Dental Tennis Ball Set",
    },
    price: 59,
    originalPrice: 82,
    icon: "toy",
    description: {
      zh: "不傷牙齒表層絨毛設計，內置發聲器，高彈力網球。",
      en: "Gentle felt exterior that's kind on teeth, with a built-in squeaker and high-bounce rubber core.",
    },
    specs: [
      { zh: "規格：2入裝", en: "Pack size: 2 pieces" },
      { zh: "直徑 6cm", en: "Diameter: 6cm" },
    ],
  },
  {
    id: "toy-nekoichi-feather-spring",
    categorySlug: "toys",
    image: "/products/toy-nekoichi-feather-spring.webp",
    name: {
      zh: "【貓壱 (Neko Ichi)】貓咪專用羽毛不倒翁彈簧玩具",
      en: "Neko Ichi Feather Spring Wobble Toy",
    },
    price: 82,
    originalPrice: 115,
    icon: "toy",
    description: {
      zh: "強力吸盤固定底座配合鋼製彈簧，頂端天然羽毛隨風搖曳。",
      en: "A strong suction-cup base with a steel spring — the natural feather on top sways enticingly in the air.",
    },
    specs: [{ zh: "高度：約 25cm", en: "Height: approx. 25cm" }],
  },
  {
    id: "toy-richell-sisal-mouse",
    categorySlug: "toys",
    image: "/products/toy-richell-sisal-mouse.webp",
    name: {
      zh: "【Richell (利其爾)】貓咪舒壓劍麻編織老鼠玩具",
      en: "Richell Sisal-Wrapped Mouse Toy",
    },
    price: 49,
    originalPrice: 69,
    icon: "toy",
    description: {
      zh: "天然環保劍麻材質纏繞，耐咬耐抓不掉屑，清潔指甲。",
      en: "Wrapped in natural, eco-friendly sisal fiber — chew- and scratch-resistant without shedding, and great for nail health.",
    },
    specs: [{ zh: "長度：14cm", en: "Length: 14cm" }],
  },
  {
    id: "toy-petio-cooling-chew-bone",
    categorySlug: "toys",
    image: "/products/toy-petio-cooling-chew-bone.webp",
    name: {
      zh: "【Petio (培ティオ)】狗狗耐咬冰涼舒緩磨牙骨玩具",
      en: "Petio Cooling Chew Bone Toy",
    },
    price: 75,
    originalPrice: 99,
    icon: "toy",
    description: {
      zh: "可注水後放冰箱冷藏，冰涼觸感舒緩炎熱煩躁與出牙不適。",
      en: "Fill with water and chill in the fridge — the cool texture soothes summer discomfort and teething irritation.",
    },
    specs: [{ zh: "材質：TPR食品級橡膠", en: "Material: Food-grade TPR rubber" }],
  },
  {
    id: "toy-cattyman-crinkle-tunnel",
    categorySlug: "toys",
    image: "/products/toy-cattyman-crinkle-tunnel.webp",
    name: {
      zh: "【CattyMan】貓用羽毛紙鈴聲響隧道玩具",
      en: "CattyMan Crinkle Tunnel with Feather",
    },
    price: 99,
    originalPrice: 139,
    icon: "toy",
    description: {
      zh: "內層加入沙沙聲響紙，配合出口處垂掛羽毛。",
      en: "Lined with crinkly paper for an enticing rustle, with a feather dangling at the exit to lure cats in and out.",
    },
    specs: [
      { zh: "展開尺寸：長 50cm", en: "Extended length: 50cm" },
      { zh: "直徑 25cm", en: "Diameter: 25cm" },
    ],
  },
  {
    id: "toy-doggyman-tugofwar-rope-ball",
    categorySlug: "toys",
    image: "/products/toy-doggyman-tugofwar-rope-ball.webp",
    name: {
      zh: "【DoggyMan】狗狗拔河專用結實麻繩球玩具",
      en: "DoggyMan Tug-of-War Rope Ball Toy",
    },
    price: 65,
    originalPrice: 88,
    icon: "toy",
    description: {
      zh: "超強韌棉麻繩索編織大球，手柄設計方便拔河互動。",
      en: "A large ball woven from ultra-tough cotton-hemp rope with a built-in handle for interactive tug-of-war play.",
    },
    specs: [
      { zh: "總長：35cm", en: "Total length: 35cm" },
      { zh: "球體徑 9cm", en: "Ball diameter: 9cm" },
    ],
  },
  {
    id: "toy-supercat-chirping-bird",
    categorySlug: "toys",
    image: "/products/toy-supercat-chirping-bird.webp",
    name: {
      zh: "【Super Cat】貓薄荷充絨發聲小鳥玩具",
      en: "Super Cat Catnip Chirping Bird Toy",
    },
    price: 52,
    originalPrice: 72,
    icon: "toy",
    description: {
      zh: "精製日系小鳥造型，內含天然貓薄荷與仿真鳥叫發聲器。",
      en: "A finely-crafted Japanese-style bird plush filled with natural catnip and a realistic chirping squeaker.",
    },
    specs: [{ zh: "尺寸：13 x 8 cm", en: "Size: 13 x 8 cm" }],
  },

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
  {
    id: "pet-odor-spray",
    categorySlug: "cleaning",
    image: "/products/pet-odor-spray.webp",
    name: { zh: "寵物除臭噴霧", en: "Pet Odor Eliminator Spray" },
    price: 58,
    icon: "cleaning",
  },
  {
    id: "litter-cleaning-kit",
    categorySlug: "cleaning",
    image: "/products/litter-cleaning-kit.webp",
    name: { zh: "貓砂盆清潔套裝", en: "Litter Box Cleaning Kit" },
    price: 98,
    icon: "cleaning",
  },
  {
    id: "pet-shampoo",
    categorySlug: "cleaning",
    image: "/products/pet-shampoo.webp",
    name: { zh: "寵物專用洗毛精", en: "Pet Shampoo" },
    price: 88,
    icon: "cleaning",
  },
  {
    id: "cleaning-lint-roller",
    categorySlug: "cleaning",
    image: "/products/cleaning-lint-roller.webp",
    name: { zh: "寵物毛髮黏塵滾筒", en: "Pet Hair Lint Roller" },
    price: 38,
    icon: "cleaning",
    description: {
      zh: "強力黏性設計，快速清走衣物同梳化上嘅寵物毛髮。",
      en: "Strong adhesive design quickly lifts pet hair off clothes and furniture.",
    },
  },
  {
    id: "cleaning-air-freshener",
    categorySlug: "cleaning",
    image: "/products/cleaning-air-freshener.webp",
    name: { zh: "寵物專用室內除臭噴霧", en: "Pet Odor Eliminating Room Spray" },
    price: 68,
    icon: "cleaning",
    description: {
      zh: "天然香氛配方中和寵物異味，還原室內清新空氣。",
      en: "Natural fragrance formula neutralizes pet odors for a fresh home.",
    },
  },
  {
    id: "cleaning-paw-wipes",
    categorySlug: "cleaning",
    image: "/products/cleaning-paw-wipes.webp",
    name: { zh: "寵物潔爪濕紙巾 (80片)", en: "Pet Paw Cleaning Wipes (80pcs)" },
    price: 45,
    icon: "cleaning",
    description: {
      zh: "溫和配方，散步後快速清潔腳掌，減少細菌帶入屋企。",
      en: "Gentle formula quickly cleans paws after walks, keeping germs out of the house.",
    },
  },
  {
    id: "cleaning-deodorizing-mat",
    categorySlug: "cleaning",
    image: "/products/cleaning-deodorizing-mat.webp",
    name: { zh: "貓砂盆除臭墊", en: "Litter Box Deodorizing Mats" },
    price: 58,
    icon: "cleaning",
    description: {
      zh: "高效吸附異味墊片，配合貓砂使用，維持室內清新。",
      en: "Highly absorbent mats that pair with litter to keep odors under control.",
    },
  },
  {
    id: "cleaning-pet-toothbrush-kit",
    categorySlug: "cleaning",
    image: "/products/cleaning-pet-toothbrush-kit.webp",
    name: { zh: "寵物潔牙套裝 (牙刷連牙膏)", en: "Pet Toothbrush & Toothpaste Kit" },
    price: 68,
    icon: "cleaning",
    description: {
      zh: "專為寵物設計嘅牙刷牙膏套裝，日常護理輕鬆做到。",
      en: "A dedicated brush-and-paste set that makes daily dental care easy.",
    },
  },

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
    id: "deal-cleaning-bundle",
    categorySlug: "deals",
    image: "/products/deal-cleaning-bundle.webp",
    name: { zh: "居家清潔用品限時套裝", en: "Home Cleaning Essentials Bundle" },
    price: 129,
    icon: "clock",
    description: {
      zh: "精選清潔用品組合，限時優惠價，家居清潔一次搞掂。",
      en: "Curated cleaning essentials at a limited-time bundle price — home cleaning sorted in one go.",
    },
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
  {
    id: "deal-newyear-hamper",
    categorySlug: "deals",
    image: "/products/deal-newyear-hamper.webp",
    name: { zh: "寵物迎新福袋", en: "Pet New Year Lucky Bag" },
    price: 199,
    icon: "clock",
    description: {
      zh: "精選小食同用品福袋，限量發售，數量有限、售完即止。",
      en: "Curated treats and essentials in a limited lucky bag — while supplies last.",
    },
  },
  {
    id: "deal-toy-clearance",
    categorySlug: "deals",
    image: "/products/deal-toy-clearance.webp",
    name: { zh: "玩具清倉限時優惠", en: "Toy Clearance Sale" },
    price: 59,
    icon: "clock",
    description: {
      zh: "精選寵物玩具清倉價發售，數量有限，售完即止。",
      en: "Selected pet toys at clearance prices — limited stock, while supplies last.",
    },
  },
  {
    id: "deal-outdoor-combo",
    categorySlug: "deals",
    image: "/products/deal-outdoor-combo.webp",
    name: { zh: "外出用品限時套裝優惠", en: "Outdoor Essentials Combo Deal" },
    price: 259,
    icon: "clock",
    description: {
      zh: "牽引帶、飲水器同背包組合優惠價，方便帶寵物出街。",
      en: "Leash, water bottle, and backpack bundled together at a special price for outings.",
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
    id: "bestseller-cat-scratcher",
    categorySlug: "bestsellers",
    image: "/products/bestseller-cat-scratcher.webp",
    name: { zh: "人氣貓抓板組合", en: "Popular Cat Scratcher Set" },
    price: 98,
    icon: "fire",
  },
  {
    id: "bestseller-pet-bed",
    categorySlug: "bestsellers",
    image: "/products/bestseller-pet-bed.webp",
    name: { zh: "人氣寵物保暖窩", en: "Popular Pet Warm Bed" },
    price: 188,
    icon: "fire",
  },
  {
    id: "bestseller-cat-tower",
    categorySlug: "bestsellers",
    image: "/products/bestseller-cat-tower.webp",
    name: { zh: "人氣貓咪跳台", en: "Popular Cat Tower" },
    price: 328,
    icon: "fire",
    description: {
      zh: "多層設計滿足貓貓攀爬同磨爪需求，長期熱賣人氣之選。",
      en: "Multi-level design satisfies climbing and scratching needs — a long-time bestseller.",
    },
  },
  {
    id: "bestseller-dog-harness",
    categorySlug: "bestsellers",
    image: "/products/bestseller-dog-harness.webp",
    name: { zh: "人氣狗狗胸背帶", en: "Popular Dog Harness" },
    price: 138,
    icon: "fire",
    description: {
      zh: "透氣網布物料均勻分散拉力，減少頸部負擔，大受歡迎。",
      en: "Breathable mesh fabric evenly distributes pulling force to reduce neck strain.",
    },
  },
  {
    id: "bestseller-litter-box",
    categorySlug: "bestsellers",
    image: "/products/bestseller-litter-box.webp",
    name: { zh: "人氣全封閉貓砂盆", en: "Popular Fully-Enclosed Litter Box" },
    price: 268,
    icon: "fire",
    description: {
      zh: "全封閉設計減少砂粒飛濺，內置活性碳除臭層，熱賣首選。",
      en: "Enclosed design reduces litter scatter, with a built-in activated carbon odor filter.",
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
  {
    id: "pet-travel-backpack",
    categorySlug: "outdoor",
    image: "/products/pet-travel-backpack.webp",
    name: { zh: "寵物外出背包", en: "Pet Travel Backpack" },
    price: 228,
    icon: "bag",
  },
  {
    id: "pet-foldable-bottle",
    categorySlug: "outdoor",
    image: "/products/pet-foldable-bottle.webp",
    name: { zh: "摺疊寵物飲水器", en: "Foldable Pet Water Bottle" },
    price: 68,
    icon: "bag",
  },
  {
    id: "pet-leash-set",
    categorySlug: "outdoor",
    image: "/products/pet-leash-set.webp",
    name: { zh: "寵物牽引帶套裝", en: "Pet Leash Set" },
    price: 98,
    icon: "bag",
  },
  {
    id: "outdoor-pet-stroller",
    categorySlug: "outdoor",
    image: "/products/outdoor-pet-stroller.webp",
    name: { zh: "寵物四輪推車", en: "Pet Stroller (4 Wheels)" },
    price: 588,
    icon: "bag",
    description: {
      zh: "適合年長或體弱寵物出行，穩固四輪設計，輕鬆推行。",
      en: "Great for senior or less mobile pets — sturdy four-wheel design for easy pushing.",
    },
  },
  {
    id: "outdoor-collapsible-bowl-set",
    categorySlug: "outdoor",
    image: "/products/outdoor-collapsible-bowl-set.webp",
    name: { zh: "摺疊寵物飯盒套裝", en: "Collapsible Pet Bowl Set" },
    price: 58,
    icon: "bag",
    description: {
      zh: "輕便可摺疊設計方便攜帶，外出用餐都方便衛生。",
      en: "Lightweight, foldable design — convenient and hygienic for meals on the go.",
    },
  },
  {
    id: "outdoor-pet-carrier",
    categorySlug: "outdoor",
    image: "/products/outdoor-pet-carrier.webp",
    name: { zh: "寵物外出手提包", en: "Pet Travel Carrier Bag" },
    price: 198,
    icon: "bag",
    description: {
      zh: "透氣網面設計，肩背手提兩用，短途外出首選。",
      en: "Breathable mesh design, wearable as a shoulder or hand bag — perfect for short trips.",
    },
  },
  {
    id: "outdoor-led-collar",
    categorySlug: "outdoor",
    image: "/products/outdoor-led-collar.webp",
    name: { zh: "寵物LED發光頸圈", en: "Pet LED Light-Up Collar" },
    price: 58,
    icon: "bag",
    description: {
      zh: "夜間散步必備，USB充電發光頸圈，提升寵物出行安全。",
      en: "USB-rechargeable glowing collar — a night-walk essential for extra visibility and safety.",
    },
  },
  {
    id: "outdoor-car-seat-cover",
    categorySlug: "outdoor",
    image: "/products/outdoor-car-seat-cover.webp",
    name: { zh: "寵物汽車防護座墊", en: "Pet Car Seat Protector" },
    price: 168,
    icon: "bag",
    description: {
      zh: "防水防刮設計，保護車廂座椅，寵物乘車更安心。",
      en: "Waterproof and scratch-resistant design protects your seats for worry-free car rides.",
    },
  },
];

/**
 * Storefront catalog after keyword food-zone classification.
 * - 冷凍脫水／貓貓・貓用 → cats / 冷凍脫水系列
 * - 狗狗／狗用 edible snacks & staple food → dogs / 狗狗小食 or 狗狗食品
 */
export const PRODUCTS: Product[] = classifyCatalogProducts(PRODUCTS_RAW);

export function getProductsByCategory(slug: string | null): Product[] {
  if (!slug) return PRODUCTS;
  return PRODUCTS.filter((product) => product.categorySlug === slug);
}

/** Filter cat products by optional subcategory pill (`null` = all). */
export function getCatProductsBySubcategory(
  subcategory: CatSubcategory | null,
): Product[] {
  const cats = getProductsByCategory("cats");
  if (!subcategory) return cats;
  return cats.filter((product) => product.subcategory === subcategory);
}

/** Filter dog products by optional subcategory pill (`null` = all). */
export function getDogProductsBySubcategory(
  subcategory: DogSubcategory | null,
): Product[] {
  const dogs = getProductsByCategory("dogs");
  if (!subcategory) return dogs;
  return dogs.filter((product) => product.subcategory === subcategory);
}

export function getProductById(id: string | null | undefined): Product | null {
  if (!id) return null;
  return PRODUCTS.find((product) => product.id === id) ?? null;
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

/** Canonical product detail path. */
export function productHref(id: string): string {
  return `/product/${id}`;
}
