/**
 * WT Japan dog freeze-dried treats.
 * Reuses old WT collection「冷凍脫水系列」 (same Shopify folder as cats;
 * products filtered to 狗狗用／狗用 only).
 * Storefront: /categories/dogs/freeze-dried
 * Source: https://www.wt-japan.com/collections/冷凍脫水系列
 * Scraper: scrape_wt_japan_dog_freeze_dried.py
 */

/** Canonical storefront category key used by `/categories/dogs` (“狗狗商品”). */
export const DOG_PRODUCTS_CATEGORY = "狗狗商品" as const;
export const DOG_PRODUCTS_CATEGORY_SLUG = "dogs" as const;

export type WtJapanDogFreezeDriedProduct = {
  id: string;
  title: string;
  /** Storefront sale price in HKD (as listed on WT Japan). */
  price: number;
  /** Optional list / compare-at price when on sale. */
  originalPrice?: number;
  /** Local path under /public for the downloaded hero image. */
  imageUrl: string;
  /** Original remote CDN URL used for the download. */
  sourceImageUrl: string;
  /** Mofu Haven storefront blurb (plain text). */
  description: string;
  vendor: string;
  category: typeof DOG_PRODUCTS_CATEGORY;
  categorySlug: typeof DOG_PRODUCTS_CATEGORY_SLUG;
  /** Dog-products sub-filter key — freeze-dried treats / 狗狗小食. */
  subcategory: "冷凍脫水系列";
  /** Selling-point tags shown on product cards (2–4). */
  tags: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

export const WT_JAPAN_DOG_FREEZE_DRIED_PRODUCTS: WtJapanDogFreezeDriedProduct[] =
  [
    {
      id: "wt-dog-freeze-dried-1",
      title: "Petio 冷凍脫水系列・紅蘿蔔、南瓜、椰菜（狗狗用）20g × 6",
      price: 156.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-1.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/0CEC2704-A396-4A08-84D5-C333B5A8FF4F.jpg?v=1596096052",
      description:
        "Petio 冷凍脫水蔬菜三重奏：紅蘿蔔、南瓜、椰菜。新鮮素材製成，不含防腐劑與色素，適合所有狗隻。可碎灑拌乾濕糧、浸軟混餵，或直接當小食——多包裝 20g × 6，日常輪替方便。",
      vendor: "Petio",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "狗狗小食", "蔬菜三重奏", "無防腐劑"],
      handle: "狗狗零食-petio-冷凍脫水系列-紅蘿蔔-南瓜-椰菜-20g",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/狗狗零食-petio-冷凍脫水系列-紅蘿蔔-南瓜-椰菜-20g",
    },
    {
      id: "wt-dog-freeze-dried-2",
      title: "Petio 冷凍脫水系列・蘋果、香蕉、蜜瓜（狗狗用）20g × 6",
      price: 158.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-2.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/61B3C8C4-299F-455B-B081-9233C1208B48.jpg?v=1596096836",
      description:
        "Petio 冷凍脫水果香三重奏：蘋果、香蕉、蜜瓜。新鮮素材、無防腐無色素，全犬適用。多包裝 20g × 6，可直接餵食、浸軟混濕糧，或以原片原味獎勵——水果控狗狗的日常小確幸。",
      vendor: "Petio",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "狗狗小食", "水果三重奏", "多包裝"],
      handle: "狗狗零食-petio-冷凍脫水系列-蘋果-香蕉-蜜瓜20g",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/狗狗零食-petio-冷凍脫水系列-蘋果-香蕉-蜜瓜20g",
    },
    {
      id: "wt-dog-freeze-dried-3",
      title: "MAMACOOK 但馬高原冷凍脫水雞條（狗狗用）30g × 10袋",
      price: 580.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-3.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207270018.jpg?v=1584349659",
      description:
        "兵庫縣但馬高原走地雞，急速冷凍乾燥成香口雞條。無添加、無防腐，100% 純雞肉鎖住鮮香，適合訓練獎勵或日常點心。小包裝 30g × 10 袋，開袋即餵、保鮮方便。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "100%純肉", "但馬高原", "雞肉"],
      handle: "但馬高原-冷凍脫水雞條狗狗用-30g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞條狗狗用-30g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-4",
      title: "MAMACOOK 但馬高原冷凍脫水豬心（狗狗用）25g × 10袋",
      price: 580.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-4.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273057.jpg?v=1604839085",
      description:
        "冷凍脫水豬心，濃郁臟器鮮味吸引肉食本能。適合想輪替蛋白質來源、又愛「真・肉味」的狗狗。25g × 10 袋獨立包裝，控量餵食更安心。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "豬心", "臟器鮮味", "但馬高原"],
      handle: "但馬高原-冷凍脫水豬心狗狗用-25g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水豬心狗狗用-25g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-5",
      title: "MAMACOOK 但馬高原冷凍脫水雞肝（狗狗用）24g × 10袋",
      price: 580.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-5.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273071.jpg?v=1604838585",
      description:
        "日本製冷凍脫水雞肝，濃郁肝香是挑嘴狗狗的心頭好。24g × 10 袋獨立分裝，適合訓練獎勵或拌糧提味，鮮味立刻升級。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "雞肝", "但馬高原", "訓練獎勵"],
      handle: "但馬高原-冷凍脫水雞肝狗狗用-24g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞肝狗狗用-24g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-6",
      title: "MAMACOOK 但馬高原冷凍脫水雞胸肉・雞肝（狗狗用）18g × 10袋",
      price: 425.0,
      originalPrice: 440.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-6.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273750.jpg?v=1655183663",
      description:
        "日本國產雞原料 100%，雞胸肉與雞肝雙重風味一次滿足。凍乾鎖住濃郁肉香與營養，18g × 10 袋獨立分裝，日常獎勵剛剛好。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "100%純肉", "雞肝", "日本國產"],
      handle: "但馬高原-冷凍脫水雞胸肉-雞肝-狗狗用-20g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞胸肉-雞肝-狗狗用-20g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-7",
      title: "MAMACOOK 但馬高原冷凍脫水雞胸肉・雞軟骨（狗狗用）18g × 10袋",
      price: 425.0,
      originalPrice: 440.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-7.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273774.jpg?v=1655184070",
      description:
        "日本國產雞原料 100%，雞胸肉搭配爽脆雞軟骨，雙重口感滿足愛嚼的狗狗。18g × 10 袋獨立包裝，訓練或日常點心都合適。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "雞軟骨", "100%純肉", "但馬高原"],
      handle: "但馬高原-冷凍脫水雞胸肉-雞軟骨-狗狗用-20g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞胸肉-雞軟骨-狗狗用-20g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-8",
      title: "MAMACOOK 但馬高原冷凍脫水豬肝（狗狗用）30g × 10袋",
      price: 580.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-8.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273064.jpg?v=1604838969",
      description:
        "冷凍脫水豬肝，濃郁臟器鮮味、高蛋白補給。30g × 10 袋獨立分裝，適合想輪替內臟營養的狗狗家庭，控量餵食更安心。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "豬肝", "臟器鮮味", "但馬高原"],
      handle: "但馬高原-冷凍脫水豬肝狗狗用-30g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水豬肝狗狗用-30g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-9",
      title: "MAMACOOK 但馬高原冷凍脫水雞條（狗狗用）150g × 15袋",
      price: 2795.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-9.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273385.jpg?v=1591030767",
      description:
        "但馬高原走地雞冷凍脫水雞條大份裝——健康無添加原隻雞柳條，急速凍乾鎖住鮮香。150g × 15 袋家庭備貨，訓練密集或多犬家庭首選。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "大份裝", "100%純肉", "雞肉"],
      handle: "但馬高原-冷凍脫水雞條狗狗用-150g-x-15袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞條狗狗用-150g-x-15袋",
    },
    {
      id: "wt-dog-freeze-dried-10",
      title: "MAMACOOK 但馬高原冷凍脫水雞胸肉軟骨（狗狗用）120g × 15袋",
      price: 2500.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-10.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/4580207274320_01.jpg?v=1784815314",
      description:
        "日本製冷凍脫水雞胸肉軟骨大份裝，肉香與軟骨爽脆一口滿足。120g × 15 袋適合長期備貨，訓練獎勵或日常點心都份量實在。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "雞軟骨", "大份裝", "雞肉"],
      handle: "mamacook-但馬高原-冷凍脫水雞胸肉軟骨-狗狗用-120g-x-15袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/mamacook-但馬高原-冷凍脫水雞胸肉軟骨-狗狗用-120g-x-15袋",
    },
    {
      id: "wt-dog-freeze-dried-11",
      title: "MAMACOOK 但馬高原冷凍脫水西太公魚（狗狗用）10g × 10袋",
      price: 425.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-11.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/4580207274214.jpg?v=1735386676",
      description:
        "西太公魚整尾凍乾，小巧香脆、天然海鮮味。適合當趣味獎勵或拌糧提香。10g × 10 袋日本製，輕便好存放。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "西太公魚", "整尾凍乾", "訓練獎勵"],
      handle: "mamacook-但馬高原-冷凍脫水西太公魚狗狗用-10g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/mamacook-但馬高原-冷凍脫水西太公魚狗狗用-10g-x-10袋",
    },
    {
      id: "wt-dog-freeze-dried-12",
      title: "MAMACOOK 但馬高原冷凍脫水鹿肉（狗狗用）14g × 10袋",
      price: 680.0,
      imageUrl: "/images/products/wt-dog-freeze-dried-12.jpg",
      sourceImageUrl:
        "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/172_4580207274085-1.jpg?v=1706873910",
      description:
        "冷凍脫水鹿肉，低脂高蛋白的贅沢野味選擇。14g × 10 袋獨立包裝，適合敏感腸胃或想輪替新奇蛋白質的狗狗。",
      vendor: "MAMACOOK",
      category: "狗狗商品",
      categorySlug: "dogs",
      subcategory: "冷凍脫水系列",
      tags: ["冷凍脫水系列", "鹿肉", "高蛋白", "但馬高原"],
      handle: "mamacook-但馬高原-冷凍脫水鹿肉狗狗用-14g-x-10袋",
      productType: "狗狗小食",
      sourceUrl:
        "https://www.wt-japan.com/products/mamacook-但馬高原-冷凍脫水鹿肉狗狗用-14g-x-10袋",
    },
  ];
