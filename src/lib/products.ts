import type { CategoryIconName } from "@/lib/categories";

export type Product = {
  id: string;
  categorySlug: string;
  name: { zh: string; en: string };
  price: number;
  /** No product photography yet, so each card uses a category-style icon as its image placeholder. */
  icon: CategoryIconName;
  /** Optional short blurb shown under the product name on the /menu catalog card. */
  description?: { zh: string; en: string };
};

export const PRODUCTS: Product[] = [
  // 貓咪商品 / Cat Products
  {
    id: "cat-food-1kg",
    categorySlug: "cats",
    name: { zh: "日本天然貓糧 1kg", en: "Japanese Natural Cat Food 1kg" },
    price: 138,
    icon: "cat",
  },
  {
    id: "cat-scratcher-set",
    categorySlug: "cats",
    name: { zh: "貓咪抓板組合", en: "Cat Scratcher Set" },
    price: 98,
    icon: "cat",
  },
  {
    id: "litter-deodorizer",
    categorySlug: "cats",
    name: { zh: "貓砂盆除臭劑", en: "Litter Box Deodorizer" },
    price: 68,
    icon: "cat",
  },
  {
    id: "ciao-tuna-paste-20pk",
    categorySlug: "cats",
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
    name: { zh: "日本製豆腐貓砂 6L", en: "Japanese Tofu Cat Litter 6L" },
    price: 88,
    icon: "cat",
    description: {
      zh: "天然豆腐渣製造，凝結力強、可直接沖廁，對貓貓同環境都溫和。",
      en: "Made from natural tofu pulp — strong clumping, flushable, and gentle on cats and the environment.",
    },
  },

  // 狗狗商品 / Dog Products
  {
    id: "dog-food-1-5kg",
    categorySlug: "dogs",
    name: { zh: "日本天然狗糧 1.5kg", en: "Japanese Natural Dog Food 1.5kg" },
    price: 168,
    icon: "dog",
  },
  {
    id: "dog-dental-chews",
    categorySlug: "dogs",
    name: { zh: "狗狗潔牙骨 12支裝", en: "Dog Dental Chews (12pcs)" },
    price: 88,
    icon: "dog",
  },
  {
    id: "dog-warm-coat",
    categorySlug: "dogs",
    name: { zh: "狗狗保暖大衣", en: "Dog Warm Coat" },
    price: 158,
    icon: "dog",
  },
  {
    id: "dog-training-pads",
    categorySlug: "dogs",
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
    name: { zh: "日式和風頸帶連鈴鐺", en: "Japanese-Style Collar with Bell" },
    price: 68,
    icon: "dog",
    description: {
      zh: "手工和風布藝頸帶，附小鈴鐺，散步時清脆悅耳。",
      en: "Handcrafted wafuu fabric collar with a tiny bell that jingles softly on every walk.",
    },
  },

  // 寵物小食 / Pet Snacks
  {
    id: "cat-freeze-dried-treats",
    categorySlug: "snacks",
    name: { zh: "貓咪凍乾小食", en: "Freeze-Dried Cat Treats" },
    price: 45,
    icon: "bone",
  },
  {
    id: "dog-dried-meat-treats",
    categorySlug: "snacks",
    name: { zh: "狗狗肉乾小食", en: "Dried Meat Dog Treats" },
    price: 52,
    icon: "bone",
  },
  {
    id: "assorted-treats-giftbox",
    categorySlug: "snacks",
    name: { zh: "綜合寵物餅乾禮盒", en: "Assorted Pet Treats Gift Box" },
    price: 88,
    icon: "bone",
  },
  {
    id: "snack-chicken-jerky",
    categorySlug: "snacks",
    name: { zh: "日本雞胸肉乾", en: "Japanese Chicken Breast Jerky" },
    price: 48,
    icon: "bone",
    description: {
      zh: "100% 雞胸肉低溫烘乾製作，無添加防腐劑，健康零食首選。",
      en: "Slow low-temperature dried 100% chicken breast, no preservatives added.",
    },
  },
  {
    id: "snack-cheese-stick",
    categorySlug: "snacks",
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
    name: { zh: "貓咪魚肉夾心餅", en: "Cat Fish Sandwich Crackers" },
    price: 38,
    icon: "bone",
    description: {
      zh: "香脆餅乾夾住鮮甜魚肉醬，滿足貓貓嘴饞時刻。",
      en: "Crispy crackers filled with savory fish paste — a treat cats can't resist.",
    },
  },

  // 營養保健 / Health & Wellness
  {
    id: "pet-joint-supplement",
    categorySlug: "health",
    name: { zh: "寵物關節保健品", en: "Pet Joint Health Supplement" },
    price: 158,
    icon: "health",
  },
  {
    id: "cat-probiotics",
    categorySlug: "health",
    name: { zh: "貓咪腸胃益生菌", en: "Cat Digestive Probiotics" },
    price: 118,
    icon: "health",
  },
  {
    id: "dog-coat-oil",
    categorySlug: "health",
    name: { zh: "狗狗美毛營養油", en: "Dog Coat Shine Oil" },
    price: 138,
    icon: "health",
  },
  {
    id: "health-omega3",
    categorySlug: "health",
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
    name: { zh: "高齡寵物綜合維他命", en: "Senior Pet Multivitamin" },
    price: 178,
    icon: "health",
    description: {
      zh: "專為老年貓狗設計，補充日常所需維他命同礦物質。",
      en: "Formulated for older cats and dogs to supplement daily vitamins and minerals.",
    },
  },

  // 居家清潔 / Home Cleaning
  {
    id: "pet-odor-spray",
    categorySlug: "cleaning",
    name: { zh: "寵物除臭噴霧", en: "Pet Odor Eliminator Spray" },
    price: 58,
    icon: "cleaning",
  },
  {
    id: "litter-cleaning-kit",
    categorySlug: "cleaning",
    name: { zh: "貓砂盆清潔套裝", en: "Litter Box Cleaning Kit" },
    price: 98,
    icon: "cleaning",
  },
  {
    id: "pet-shampoo",
    categorySlug: "cleaning",
    name: { zh: "寵物專用洗毛精", en: "Pet Shampoo" },
    price: 88,
    icon: "cleaning",
  },
  {
    id: "cleaning-lint-roller",
    categorySlug: "cleaning",
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
    name: { zh: "寵物潔爪濕紙巾 (80片)", en: "Pet Paw Cleaning Wipes (80pcs)" },
    price: 45,
    icon: "cleaning",
    description: {
      zh: "溫和配方，散步後快速清潔腳掌，減少細菌帶入屋企。",
      en: "Gentle formula quickly cleans paws after walks, keeping germs out of the house.",
    },
  },

  // 限時優惠 / Limited-Time Deals
  {
    id: "deal-food-bundle",
    categorySlug: "deals",
    name: { zh: "貓狗糧限時特惠裝", en: "Cat & Dog Food Bundle Deal" },
    price: 199,
    icon: "clock",
  },
  {
    id: "deal-treats-3pack",
    categorySlug: "deals",
    name: { zh: "寵物小食限時3件裝", en: "3-Pack Pet Treats Deal" },
    price: 99,
    icon: "clock",
  },
  {
    id: "deal-supplement-bogo",
    categorySlug: "deals",
    name: { zh: "寵物保健品限時買一送一", en: "Buy 1 Get 1 Pet Supplement" },
    price: 158,
    icon: "clock",
  },
  {
    id: "deal-cleaning-bundle",
    categorySlug: "deals",
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
    name: { zh: "寵物迎新福袋", en: "Pet New Year Lucky Bag" },
    price: 199,
    icon: "clock",
    description: {
      zh: "精選小食同用品福袋，限量發售，數量有限、售完即止。",
      en: "Curated treats and essentials in a limited lucky bag — while supplies last.",
    },
  },

  // 熱賣商品 / Best Sellers
  {
    id: "bestseller-dog-giftbox",
    categorySlug: "bestsellers",
    name: { zh: "人氣日本狗零食禮盒", en: "Popular Japanese Dog Treat Gift Box" },
    price: 128,
    icon: "fire",
  },
  {
    id: "bestseller-cat-scratcher",
    categorySlug: "bestsellers",
    name: { zh: "人氣貓抓板組合", en: "Popular Cat Scratcher Set" },
    price: 98,
    icon: "fire",
  },
  {
    id: "bestseller-pet-bed",
    categorySlug: "bestsellers",
    name: { zh: "人氣寵物保暖窩", en: "Popular Pet Warm Bed" },
    price: 188,
    icon: "fire",
  },
  {
    id: "bestseller-cat-tower",
    categorySlug: "bestsellers",
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
    name: { zh: "人氣全封閉貓砂盆", en: "Popular Fully-Enclosed Litter Box" },
    price: 268,
    icon: "fire",
    description: {
      zh: "全封閉設計減少砂粒飛濺，內置活性碳除臭層，熱賣首選。",
      en: "Enclosed design reduces litter scatter, with a built-in activated carbon odor filter.",
    },
  },

  // 外出用品 / Outdoor Gear
  {
    id: "pet-travel-backpack",
    categorySlug: "outdoor",
    name: { zh: "寵物外出背包", en: "Pet Travel Backpack" },
    price: 228,
    icon: "bag",
  },
  {
    id: "pet-foldable-bottle",
    categorySlug: "outdoor",
    name: { zh: "摺疊寵物飲水器", en: "Foldable Pet Water Bottle" },
    price: 68,
    icon: "bag",
  },
  {
    id: "pet-leash-set",
    categorySlug: "outdoor",
    name: { zh: "寵物牽引帶套裝", en: "Pet Leash Set" },
    price: 98,
    icon: "bag",
  },
  {
    id: "outdoor-pet-stroller",
    categorySlug: "outdoor",
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
    name: { zh: "寵物外出手提包", en: "Pet Travel Carrier Bag" },
    price: 198,
    icon: "bag",
    description: {
      zh: "透氣網面設計，肩背手提兩用，短途外出首選。",
      en: "Breathable mesh design, wearable as a shoulder or hand bag — perfect for short trips.",
    },
  },
];

export function getProductsByCategory(slug: string | null): Product[] {
  if (!slug) return PRODUCTS;
  return PRODUCTS.filter((product) => product.categorySlug === slug);
}
