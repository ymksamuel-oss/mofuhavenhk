/**
 * WT Japan cat catalog — curated for Mofu Haven.
 * Images sourced via scrape scripts; copy & tags hand-polished.
 * Sources:
 *   - 貓罐罐:     https://www.wt-japan.com/collections/貓罐罐/罐罐
 *   - 乾糧:       https://www.wt-japan.com/collections/乾糧
 *   - 冷凍脫水系列（貓貓冷凍食物專區）:
 *                 https://www.wt-japan.com/collections/冷凍脫水系列
 *                 (scrape_wt_japan_freeze_dried.py)
 *                 Storefront path: /categories/cats/freeze-dried
 *   - Cat snack series (see `@/data/catSnacksData`):
 *                 無添加天然系列 / 老貓零食 / 去毛球配方 / bb貓零食
 *                 Storefront path: /categories/cats/snacks
 * Freeze-dried treats are cat-only — never listed under dogs.
 * Keyword classifier (`classifyPetFood`) re-asserts cats / 冷凍脫水系列
 * from title tags「貓貓用」「冷凍脫水」.
 */

/** Canonical storefront category key used by `/categories/cats` (“貓咪商品”). */
export const CAT_PRODUCTS_CATEGORY = "貓咪商品" as const;
export const CAT_PRODUCTS_CATEGORY_SLUG = "cats" as const;

export type WtJapanProduct = {
  id: string;
  title: string;
  /** Storefront price in HKD (as listed on WT Japan). */
  price: number;
  /** Local path under /public for the downloaded hero image. */
  imageUrl: string;
  /** Original remote CDN URL used for the download. */
  sourceImageUrl: string;
  /** Mofu Haven storefront blurb (plain text). */
  description: string;
  vendor: string;
  /**
   * Human-readable category label — must match the 「貓咪商品」filter chip.
   * Prefer `categorySlug` for routing/filtering.
   */
  category: typeof CAT_PRODUCTS_CATEGORY;
  /** Storefront filter key (`CATEGORIES[].slug`) — must be `"cats"`. */
  categorySlug: typeof CAT_PRODUCTS_CATEGORY_SLUG;
  /**
   * Cat-products sub-filter key.
   * - 貓罐罐 → wet cans
   * - 貓乾糧 → dry / staple food
   * - 冷凍脫水系列 → cat freeze-dried food zone（冷凍食物專區）
   */
  subcategory: "貓罐罐" | "貓乾糧" | "冷凍脫水系列";
  /** Optional compare-at / list price when on sale. */
  originalPrice?: number;
  /** Selling-point tags shown on product cards (2–4). */
  tags: string[];
  /** Cat breed slugs from `@/lib/catBreeds` that suit this recipe. */
  recommendedBreeds: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

/** Canonical storefront category key used by `/categories/dogs` (“狗狗商品”). */
export const DOG_PRODUCTS_CATEGORY = "狗狗商品" as const;
export const DOG_PRODUCTS_CATEGORY_SLUG = "dogs" as const;

export type WtJapanDogProduct = {
  id: string;
  title: string;
  titleEn: string;
  /** Storefront price in HKD (as listed on WT Japan). */
  price: number;
  /** Local path under /public for the downloaded hero image. */
  imageUrl: string;
  /** Mofu Haven storefront blurb (plain text). */
  description: string;
  descriptionEn: string;
  vendor: string;
  /** Must be the canonical 狗狗商品 category label. */
  category: typeof DOG_PRODUCTS_CATEGORY;
  /** Storefront filter key (`CATEGORIES[].slug`) — must be `"dogs"`. */
  categorySlug: typeof DOG_PRODUCTS_CATEGORY_SLUG;
  subcategory: "狗狗小食";
  /** Optional compare-at / list price when on sale. */
  originalPrice?: number;
  spec: string;
  tags: string[];
  handle: string;
  productType: "狗狗小食";
  sourceUrl: string;
  sourceImageUrl?: string;
  inStock: boolean;
};

/**
 * WT Japan dog-treat catalog. Every dog item uses the dogs category and its
 * matching downloaded WebP image, rather than sharing the cat product array.
 */
export const WT_JAPAN_DOG_PRODUCTS: WtJapanDogProduct[] = [
  {
    id: "wt-japan-001",
    titleEn: "MAMACOOK Freeze-Dried Chicken Breast & Comb Mix for Dogs 18g × 10",
    title: "但馬高原 - 冷凍脫水雞胸肉雞冠 (狗狗用) 18g x 10袋",
    price: 425.0,
    originalPrice: 440.0,
    spec: "18g x 10袋",
    imageUrl: "/images/products/wt-japan-001.webp",
    description: "MAMACOOK 日本製冷凍脫水雞胸肉配雞冠，18g 獨立小包共 10 袋，適合狗狗作日常獎勵小食。",
    descriptionEn: "Japan-made MAMACOOK freeze-dried dog treats made from chicken breast and dried comb, in ten 18g pouches.",
    vendor: "MAMACOOK",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", "雞肉系列"],
    handle: "freeze-dried-chicken-breast-comb-mix-dog-18g",
    productType: "狗狗小食",
    sourceUrl: "https://www.mamacook.co.jp/lineup/?detail=20181016104753",
    inStock: true,
  },
  {
    id: "wt-japan-002",
    titleEn: "PetPro Japan-Made Additive-Free Chicken Liver Treats 100g × 10",
    title: "日本國產無添加狗狗小食 - 雞肝乾 100g x 10",
    price: 588.0,
    spec: "100g x 10",
    imageUrl: "/images/products/wt-japan-002.webp",
    description: "PETPRO 日本國產無添加雞肝乾，100g 包裝共 10 袋；不添加色素及防腐劑。",
    descriptionEn: "Japan-made PetPro chicken-liver treats with no added colorants or preservatives, in ten 100g pouches.",
    vendor: "PETPRO",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", "內臟系列"],
    handle: "made-in-japan-additive-free-chicken-liver-100g",
    productType: "狗狗小食",
    sourceUrl: "https://petpro.jp/",
    inStock: true,
  },
  {
    id: "wt-japan-003",
    titleEn: "PetPro Japan-Made Additive-Free Sliced Beef Tongue Skin 50g × 10",
    title: "日本國產無添加狗狗小食 - 薄切牛舌乾 50g x 10",
    price: 558.0,
    spec: "50g x 10",
    imageUrl: "/images/products/wt-japan-003.webp",
    description: "PETPRO 日本國產無添加薄切牛舌乾，50g 包裝共 10 袋；不添加色素及防腐劑。",
    descriptionEn: "Thin-cut, Japan-made PetPro beef tongue skin treats with no added colorants or preservatives, in ten 50g pouches.",
    vendor: "PETPRO",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", "牛肉系列"],
    handle: "made-in-japan-additive-free-beef-tongue-skin-50g",
    productType: "狗狗小食",
    sourceUrl: "https://petpro.jp/",
    inStock: true,
  },
  {
    id: "wt-japan-004",
    titleEn: "HappyDays Japan-Made Venison Slices for Dogs 30g × 10",
    title: "HappyDays 日本國產狗狗小食 - 鹿肉薄片 30g x 10",
    price: 558.0,
    spec: "30g x 10",
    imageUrl: "/images/products/wt-japan-004.webp",
    description: "HappyDays 日本國產鹿肉薄片，30g 包裝共 10 袋；不添加色素及防腐劑。",
    descriptionEn: "HappyDays venison slices made from Japanese deer, with no added colorants or preservatives, in ten 30g pouches.",
    vendor: "HappyDays",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", "鹿肉系列"],
    handle: "happydays-japan-venison-slices-dog-30g",
    productType: "狗狗小食",
    sourceUrl: "https://petpro.jp/post-24445/",
    inStock: true,
  },
  {
    id: "wt-japan-005",
    titleEn: "PetPro Japan-Made Additive-Free Long Beef Achilles Treats 70g × 10",
    title: "日本國產無添加狗狗小食 - 牛筋長條 (牛アキレスロング) 70g x 10",
    price: 558.0,
    spec: "70g x 10",
    imageUrl: "/images/products/wt-japan-005.webp",
    description: "PETPRO 日本國產無添加牛筋長條，70g 包裝共 10 袋；不添加色素、防腐劑及抗氧化劑。",
    descriptionEn: "Long-cut PetPro beef Achilles treats for a satisfying chew, made without added colorants, preservatives, or antioxidants, in ten 70g pouches.",
    vendor: "PETPRO",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    tags: ["狗狗小食", "狗用", "日本國產", "無添加", "牛肉系列"],
    handle: "made-in-japan-additive-free-beef-achilles-long-70g",
    productType: "狗狗小食",
    sourceUrl: "https://petpro.jp/16680-2/",
    inStock: true,
    sourceImageUrl: "https://petpro.jp/wp-content/uploads/2022/11/4981528362633-1.jpg",
  },
];

export const WT_JAPAN_PRODUCTS: WtJapanProduct[] = [
  {
    id: "wt-product-1",
    title: "CIAO 貓罐罐 - 鰹魚 帆立貝 85g x 6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133061684.jpg?v=1583201240",
    description:
      "日本 Inaba CIAO 經典罐罐，以鮮甜鰹魚搭配北海道風味帆立貝，湯汁豐盈、肉質細嫩。高水分配方鼓勵貓貓主動進食補水，綠茶消臭成分溫和鎖味，日常主食或拌糧加餐都合適。一盒 6 罐，輕鬆備好一週的海洋盛宴。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "高水分補給", "海鮮雙拼", "綠茶消臭"],
    recommendedBreeds: ["ragdoll", "maine-coon", "siamese", "norwegian-forest"],
    handle: "ciao-貓罐罐-鰹魚-帆立貝-85g-x-6個",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-鰹魚-帆立貝-85g-x-6個",
  },
  {
    id: "wt-product-2",
    title: "CIAO 貓罐罐 - 白肉金槍魚、金槍魚乾、金槍魚汁 85g　x6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133062278.jpg?v=1583200361",
    description:
      "三層金槍魚層次一次滿足：柔滑白肉、香脆金槍魚乾，再浸入濃郁金槍魚汁。挑嘴貓也難擋的日系鮮味，質地細緻易入口，適合想提升飲水量、又不想犧牲口感的毛孩。原裝進口 6 罐裝，新鮮感與便利兼具。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "白肉金槍魚", "層次鮮味", "高水分補給"],
    recommendedBreeds: ["bengal", "siamese", "american-shorthair", "mix-shorthair"],
    handle: "ciao-貓罐罐-白肉金槍魚-金槍魚乾-金槍魚汁-85g-x6個",
    productType: "貓罐罐",
    sourceUrl:
      "https://www.wt-japan.com/products/ciao-貓罐罐-白肉金槍魚-金槍魚乾-金槍魚汁-85g-x6個",
  },
  {
    id: "wt-product-3",
    title: "CIAO 貓罐罐 - 雞肉, 和牛 85g　x 6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133836367.jpg?v=1583197671",
    description:
      "柔嫩雞肉遇上日式和牛的豐潤香氣，蛋白質層次分明，適合需要額外動能與肌肉維持的中大型或活潑貓咪。湯汁潤澤好入口，亦可拆罐分餐作獎勵。綠茶消臭配方照顧居家氣味，讓美味與日常舒適並行。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "高蛋白配方", "和牛奢華", "活力補給"],
    recommendedBreeds: ["maine-coon", "norwegian-forest", "bengal", "british-shorthair"],
    handle: "ciao-貓罐罐-雞肉-和牛-85g-x-6",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-雞肉-和牛-85g-x-6",
  },
  {
    id: "wt-product-4",
    title: "CIAO　鮮肉杯　-　鰹魚, 金槍魚, 雞肉 （11歳起食用）70g x 6",
    price: 78.0,
    imageUrl: "/images/products/wt-product-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133863370.jpg?v=1585745407",
    description:
      "專為 11 歲以上熟齡貓研發的鮮肉杯：鰹魚、金槍魚與雞肉三重溫和蛋白，杯裝柔軟好挖、份量適中。細嫩質地減輕咀嚼負擔，高水分協助日常補水與食慾維持，是長輩貓日常護理餐的貼心選擇。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "熟齡貓專用", "軟質好入口", "三重蛋白"],
    recommendedBreeds: ["persian", "british-shorthair", "exotic-shorthair", "scottish-fold"],
    handle: "ciao-鮮肉杯-鰹魚-金槍魚-雞肉-11歳起食用-70g-x-6",
    productType: "貓罐罐",
    sourceUrl:
      "https://www.wt-japan.com/products/ciao-鮮肉杯-鰹魚-金槍魚-雞肉-11歳起食用-70g-x-6",
  },
  {
    id: "wt-product-5",
    title: "CIAO　鮮肉杯　- 金槍魚 (11歳起食用)70g x 6",
    price: 78.0,
    imageUrl: "/images/products/wt-product-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133863387.jpg?v=1585745253",
    description:
      "純粹金槍魚鮮肉杯，專為 11 歲起熟齡貓打造。單一海鮮主軸、味道清爽不厚重，適合口味敏感或需要簡單配方的長輩貓。杯裝易開即食，溫熱後香氣更誘人，輕鬆照顧食慾起伏的日子。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "熟齡貓專用", "單一海鮮", "清爽好消化"],
    recommendedBreeds: ["persian", "ragdoll", "russian-blue", "exotic-shorthair"],
    handle: "ciao-鮮肉杯-金槍魚-11歳起食用70g-x-6",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-鮮肉杯-金槍魚-11歳起食用70g-x-6",
  },
  {
    id: "wt-product-6",
    title: "CIAO 貓罐罐 - 雞胸肉 鯛魚 鯛魚汁 85g x6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133062285.jpg?v=1583200947",
    description:
      "低脂雞胸肉與日系鯛魚相遇，再浸入清甜鯛魚汁，口感清雅、負擔較輕。適合偏好清淡海鮮、或需要溫和蛋白輪替的貓咪。細緻肉塊搭配豐盈湯汁，日常補水與換口味都能優雅完成。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "清淡海鮮", "雞胸低負擔", "高水分補給"],
    recommendedBreeds: ["russian-blue", "devon-rex", "sphynx", "siamese"],
    handle: "ciao-貓罐罐-雞胸肉-鯛魚-鯛魚汁-85g-x6個",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-雞胸肉-鯛魚-鯛魚汁-85g-x6個",
  },
  {
    id: "wt-product-7",
    title: "CIAO 貓罐罐 - 白肉金槍魚, 白飯魚85g x6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133061158.jpg?v=1583200705",
    description:
      "細嫩白肉金槍魚綴上晶瑩白飯魚，視覺與口感同樣討喜。小魚乾帶來輕脆咬感，刺激好奇心旺盛的貓貓主動進食。湯汁充足、氣味清新，無論家中唐貓或小型品種，都是一罐就能提升幸福感的日常罐罐。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "白飯魚點綴", "趣味口感", "高水分補給"],
    recommendedBreeds: ["munchkin", "mix-shorthair", "siamese", "devon-rex"],
    handle: "ciao-貓罐罐-白肉金槍魚-白飯魚85g-x6個",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-白肉金槍魚-白飯魚85g-x6個",
  },
  {
    id: "wt-product-8",
    title: "CIAO 貓罐罐 - 雞肉, 黃金槍魚, 木魚乾 85g x6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133061349.jpg?v=1583198665",
    description:
      "雞肉基底搭配黃金槍魚，再撒上香氣濃郁的木魚乾，打開罐蓋即是滿滿日式高湯氣息。層次分明的鮮味特別適合嗅覺靈敏、愛「聞香下飯」的活躍貓。可單獨享用，亦可淋在乾糧上瞬間升級成豪華濕食餐。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "木魚乾香氣", "乾濕混餵", "活力菜單"],
    recommendedBreeds: ["bengal", "american-shorthair", "maine-coon", "mix-shorthair"],
    handle: "ciao-貓罐罐-雞肉-黃金槍魚-木魚乾-85g",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-雞肉-黃金槍魚-木魚乾-85g",
  },
  {
    id: "wt-product-9",
    title: "CIAO 貓罐罐 - 白肉金槍魚、越光米 85g  x 6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133061172.jpg?v=1583202528",
    description:
      "柔滑白肉金槍魚遇見日本越光米的溫潤口感，質地綿密、好吞嚥，適合需要溫和腸胃體驗或偏好軟食的貓咪。魚肉提供優質蛋白，米粒增添飽足層次，是節奏較慢、愛慢慢品嚐的毛孩的安心選擇。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "柔滑好吞嚥", "越光米配方", "腸胃溫和"],
    recommendedBreeds: ["british-shorthair", "persian", "exotic-shorthair", "ragdoll"],
    handle: "ciao-貓罐罐-白肉金槍魚-越光米-85g-x-6個",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-白肉金槍魚-越光米-85g-x-6個",
  },
  {
    id: "wt-product-10",
    title: "CIAO 貓罐罐 - 白肉金槍魚、鰹魚乾 85g  x 6個",
    price: 78.0,
    imageUrl: "/images/products/wt-product-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133062162.jpg?v=1583202365",
    description:
      "經典白肉金槍魚罐底，點綴香醇鰹魚乾，是 CIAO 最耐看的日常味道。湯汁清亮、肉質細緻，適合當作每週濕食輪替的主力款。綠茶消臭成分照顧家居氣味，讓開罐時刻既幸福、也安心。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    tags: ["貓罐罐", "濕糧", "經典日系味", "鰹魚乾點綴", "日常輪替"],
    recommendedBreeds: ["mix-shorthair", "ragdoll", "norwegian-forest", "american-shorthair"],
    handle: "ciao-貓罐罐-白肉金槍魚-鰹魚乾-85g-x-6個",
    productType: "貓罐罐",
    sourceUrl: "https://www.wt-japan.com/products/ciao-貓罐罐-白肉金槍魚-鰹魚乾-85g-x-6個",
  },

  // ——— WT Japan 乾糧 / Dry food (https://www.wt-japan.com/collections/乾糧) ———
  {
    id: "wt-dry-food-1",
    title: "CIAO 1兆個乳酸菌乾糧 · 鰹魚乾味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651663.jpg?v=1606713062",
    description:
      "日本 Inaba CIAO 乳酸菌乾糧，每盒盛載高達 1 兆個乳酸菌守護腸道節奏。鮮香鰹魚乾味鼓勵挑嘴貓主動進食，綠茶消臭成分溫和照顧家居氣味。獨立小袋方便分餐與外出攜帶，一箱 6 盒（每盒 10 袋）為日常乾糧輪替做足儲備。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "1兆乳酸菌", "鰹魚乾味"],
    recommendedBreeds: ["siamese", "ragdoll", "mix-shorthair", "russian-blue"],
    handle: "ciao-1兆個乳酸菌乾糧-鰹魚乾味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-鰹魚乾味-10袋-x-6",
  },
  {
    id: "wt-dry-food-2",
    title: "CIAO 乳酸糧脆條 · 雞肉味（5條裝 × 6盒）",
    price: 155.0,
    imageUrl: "/images/products/wt-dry-food-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651571.jpg?v=1593663832",
    description:
      "獨立包裝脆條，每條約 22g，內含約 100 億個乳酸菌，溫柔守護腸胃健康。香濃雞肉味適合愛肉的活潑貓，可作獎勵零食或拌乾糧提升食慾。日本原裝 5 條 × 6 盒，出街旅行都合適。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "乳酸菌", "雞肉味"],
    recommendedBreeds: ["maine-coon", "bengal", "american-shorthair", "british-shorthair"],
    handle: "ciao-乳酸糧-5條裝-雞肉味-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-乳酸糧-5條裝-雞肉味-x-6",
  },
  {
    id: "wt-dry-food-3",
    title: "CIAO 1兆個乳酸菌乾糧 · 金槍魚乾味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651656.jpg?v=1606713192",
    description:
      "以金槍魚乾的層次鮮味為軸心，搭配 1 兆乳酸菌配方，兼顧美味與腸道舒適。細緻顆粒易入口，適合日常主食乾糧或與濕食混餵。綠茶消臭照顧家中氣味，一箱 6 盒（每盒 10 袋）安心備糧。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "1兆乳酸菌", "金槍魚乾"],
    recommendedBreeds: ["bengal", "siamese", "american-shorthair", "devon-rex"],
    handle: "ciao-1兆個乳酸菌乾糧-金槍魚乾味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-金槍魚乾味-10袋-x-6",
  },
  {
    id: "wt-dry-food-4",
    title: "CIAO 1兆個乳酸菌乾糧 · 三款金槍魚味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651694.jpg?v=1606712478",
    description:
      "一盒收納三種金槍魚風味變化，讓貓貓每餐都有新鮮感。1 兆乳酸菌呵護腸道，綠茶消臭配方更貼心。適合想用乾糧輪替口味、又不想犧牲腸胃舒適度的家庭——6 盒家庭裝，輕鬆應付一季的日系小確幸。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "口味輪替", "1兆乳酸菌"],
    recommendedBreeds: ["ragdoll", "norwegian-forest", "mix-shorthair", "siamese"],
    handle: "ciao-1兆個乳酸菌乾糧-3款金槍魚味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款金槍魚味-10袋-x-6",
  },
  {
    id: "wt-dry-food-5",
    title: "CIAO 1兆個乳酸菌乾糧 · 三款木魚乾味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651700.jpg?v=1606712358",
    description:
      "木魚乾的日式高湯香氣，打開袋口就像一碗暖心的鰹節風味。三款變化搭配 1 兆乳酸菌，挑嘴貓也願意主動靠近糧碗。綠茶消臭溫和鎖味，適合嗅覺敏銳、愛「聞香下飯」的貓貓日常。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "木魚乾香氣", "1兆乳酸菌"],
    recommendedBreeds: ["bengal", "maine-coon", "american-shorthair", "mix-shorthair"],
    handle: "ciao-1兆個乳酸菌乾糧-3款木魚乾味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款木魚乾味-10袋-x-6",
  },
  {
    id: "wt-dry-food-6",
    title: "CIAO 1兆個乳酸菌乾糧 · 三款雞肉味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651717.jpg?v=1606712183",
    description:
      "柔和雞肉三重奏，蛋白質層次分明，適合中大型或動能充沛的貓貓。1 兆乳酸菌照顧腸道節奏，獨立小袋精準控量。一箱 6 盒，是活力家庭最穩妥的日系乾糧備貨選擇。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "雞肉蛋白", "1兆乳酸菌"],
    recommendedBreeds: ["maine-coon", "norwegian-forest", "bengal", "british-shorthair"],
    handle: "ciao-1兆個乳酸菌乾糧-3款雞肉味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款雞肉味-10袋-x-6",
  },
  {
    id: "wt-dry-food-7",
    title: "CIAO 乳酸糧脆條 · 鰹魚味（5條裝 × 6盒）",
    price: 155.0,
    imageUrl: "/images/products/wt-dry-food-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/chanet_260725.jpg?v=1705570114",
    description:
      "經典鰹魚香氣的乳酸菌脆條，每條約 22g、獨立包裝，內含約 100 億乳酸菌。可作訓練獎勵、出遊小食，亦可掰碎撒在乾糧上瞬間提升誘食力。日本製 5 條 × 6 盒，方便又實用。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "乳酸菌", "鰹魚味"],
    recommendedBreeds: ["siamese", "russian-blue", "ragdoll", "mix-shorthair"],
    handle: "ciao-乳酸糧-5條裝-鰹魚味-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-乳酸糧-5條裝-鰹魚味-x-6",
  },
  {
    id: "wt-dry-food-8",
    title: "CIAO 1兆個乳酸菌乾糧 · 金槍魚味（幼貓用｜10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651687.jpg?v=1606712643",
    description:
      "專為 1 歲前幼貓調配的金槍魚味乳酸菌乾糧，顆粒與營養節奏更貼合成長期需求。1 兆乳酸菌溫柔呵護幼嫩腸胃，綠茶消臭照顧家居氣味。小袋分裝方便爸媽精準餵食，一箱 6 盒陪伴毛孩快樂長大。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "幼貓專用", "1兆乳酸菌"],
    recommendedBreeds: ["bengal", "maine-coon", "munchkin", "mix-shorthair"],
    handle: "ciao-1兆個乳酸菌乾糧-金槍魚味-幼貓用-10袋-x-6",
    productType: "乾糧",
    sourceUrl:
      "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-金槍魚味-幼貓用-10袋-x-6",
  },
  {
    id: "wt-dry-food-9",
    title: "CIAO 乳酸糧脆條 · 金槍魚乾味（5條裝 × 6盒）",
    price: 155.0,
    imageUrl: "/images/products/wt-dry-food-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651540.jpg?v=1593663733",
    description:
      "金槍魚乾的濃郁鮮味收進輕巧脆條，每條約 22g 獨立包裝，內含約 100 億乳酸菌。適合當零食獎勵，也適合掰碎做乾濕混餵的提味小幫手。日本原裝 5 條 × 6 盒，日常與旅行都帶得走。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "乳酸菌", "金槍魚乾"],
    recommendedBreeds: ["persian", "exotic-shorthair", "british-shorthair", "scottish-fold"],
    handle: "ciao-乳酸糧-5條裝-金槍魚乾味-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-乳酸糧-5條裝-金槍魚乾味-x-6",
  },
  {
    id: "wt-dry-food-10",
    title: "CIAO 1兆個乳酸菌乾糧 · 三款金槍魚鰹魚味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651724.jpg?v=1606712073",
    description:
      "金槍魚與鰹魚雙重海洋風味輪替，鮮味層次豐富。1 兆乳酸菌守護腸道，綠茶消臭成分讓開糧時刻更安心。適合喜歡海鮮系乾糧、又想用口味變化維持食慾的貓家庭——6 盒家庭裝一次備足。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "海鮮雙拼", "1兆乳酸菌"],
    recommendedBreeds: ["siamese", "ragdoll", "norwegian-forest", "devon-rex"],
    handle: "ciao-1兆個乳酸菌乾糧-3款金槍魚鰹魚味-10袋-x-6",
    productType: "乾糧",
    sourceUrl:
      "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款金槍魚鰹魚味-10袋-x-6",
  },
  {
    id: "wt-dry-food-11",
    title: "CIAO 1兆個乳酸菌乾糧 · 三款海鮮味（10袋 × 6盒）",
    price: 268.0,
    imageUrl: "/images/products/wt-dry-food-11.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133651731.jpg?v=1606711831",
    description:
      "三款海鮮風味一次收藏，像為貓貓準備迷你海洋菜單。1 兆乳酸菌呵護腸胃舒適，綠茶消臭溫和鎖住居家氣味。獨立小袋控量方便，一箱 6 盒（每盒 10 袋）是海鮮控毛孩的日系乾糧首選。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    tags: ["貓乾糧", "主糧", "乾糧", "海鮮味", "1兆乳酸菌"],
    recommendedBreeds: ["siamese", "bengal", "russian-blue", "mix-shorthair"],
    handle: "ciao-1兆個乳酸菌乾糧-3款海鮮味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款海鮮味-10袋-x-6",
  },

  // ——— WT Japan 冷凍脫水系列 / Cat freeze-dried food zone ———
  {
    id: "wt-freeze-dried-1",
    title: "MAMACOOK 但馬高原冷凍脫水雞條（貓貓用）30g × 10袋",
    price: 550.0,
    imageUrl: "/images/products/wt-freeze-dried-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207270315.jpg?v=1625708824",
    description:
      "兵庫縣但馬高原走地雞，急速冷凍乾燥成香口雞條。無添加、無防腐，100% 純雞肉鎖住鮮香，適合訓練獎勵或日常點心。小包裝 30g × 10 袋，開袋即餵、保鮮方便。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "100%純肉", "無添加", "但馬高原", "雞肉"],
    recommendedBreeds: ["bengal", "maine-coon", "american-shorthair", "mix-shorthair"],
    handle: "但馬高原冷凍脫水雞條-30g-x-10袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/但馬高原冷凍脫水雞條-30g-x-10袋",
  },
  {
    id: "wt-freeze-dried-2",
    title: "MAMACOOK 但馬高原冷凍脫水雞胸肉・雞肝（貓貓用）18g × 10袋",
    price: 425.0,
    originalPrice: 440.0,
    imageUrl: "/images/products/wt-freeze-dried-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273811.jpg?v=1655184311",
    description:
      "日本國產雞原料 100%，雞胸肉與雞肝雙重風味一次滿足。凍乾鎖住濃郁肉香與營養，適合愛肝臟鮮味的挑嘴貓。18g × 10 袋獨立分裝，日常獎勵剛剛好。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "100%純肉", "雞肝", "無添加", "日本國產"],
    recommendedBreeds: ["siamese", "ragdoll", "british-shorthair", "mix-shorthair"],
    handle: "但馬高原-冷凍脫水雞胸肉-雞肝-貓貓用-20g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞胸肉-雞肝-貓貓用-20g-x-10袋",
  },
  {
    id: "wt-freeze-dried-3",
    title: "MAMACOOK 但馬高原冷凍日本國產帆立貝（貓貓用）11g × 10袋",
    price: 580.0,
    imageUrl: "/images/products/wt-freeze-dried-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273583.jpg?v=1591032305",
    description:
      "北海道・青森一帶水域國產帆立貝，急速凍乾保留肉厚甘甜與豐富氨基酸。無添加、無防腐，海鮮控毛孩的贅沢小食。11g × 10 袋，開袋飄起海洋鮮香。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "帆立貝", "日本國產", "無添加", "海鮮鮮味"],
    recommendedBreeds: ["siamese", "bengal", "norwegian-forest", "russian-blue"],
    handle: "但馬高原冷凍日本國產帆立貝貓貓用-30g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/但馬高原冷凍日本國產帆立貝貓貓用-30g-x-10袋",
  },
  {
    id: "wt-freeze-dried-4",
    title: "MAMACOOK 但馬高原冷凍脫水銀魚（貓貓用）10g × 10袋",
    price: 580.0,
    imageUrl: "/images/products/wt-freeze-dried-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/D1964676-D322-4736-AA1A-54C2F90715EC.jpg?v=1620652162",
    description:
      "整尾銀魚急速凍乾，脆香小巧、天然鈣質與海洋鮮味並存。適合當訓練獎勵或拌糧提味，讓挑嘴貓也願意主動靠近食碗。10g × 10 袋輕巧便攜。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "銀魚", "天然鮮味", "無添加", "訓練獎勵"],
    recommendedBreeds: ["munchkin", "devon-rex", "american-shorthair", "mix-shorthair"],
    handle: "但馬高原-冷凍脫水銀魚貓貓用-13g-x-10袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/但馬高原-冷凍脫水銀魚貓貓用-13g-x-10袋",
  },
  {
    id: "wt-freeze-dried-5",
    title: "MAMACOOK 但馬高原冷凍日本國產虹鮭魚（貓貓用）15g × 10袋",
    price: 560.0,
    imageUrl: "/images/products/wt-freeze-dried-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/1F170A58-6933-439D-9919-680D2D9C59DE.jpg?v=1623686507",
    description:
      "日本國產虹鮭魚凍乾小食，鮮美魚脂香氣一開袋就飄出。高蛋白、低負擔，適合日常輪替海鮮零食。15g × 10 袋獨立包裝，保鮮又好控量。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "虹鮭魚", "日本國產", "高蛋白", "海鮮鮮味"],
    recommendedBreeds: ["siamese", "ragdoll", "norwegian-forest", "bengal"],
    handle: "但馬高原冷凍日本國產虹鮭魚貓貓用-17g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/但馬高原冷凍日本國產虹鮭魚貓貓用-17g-x-10袋",
  },
  {
    id: "wt-freeze-dried-6",
    title: "MAMACOOK 但馬高原冷凍脫水雞胸肉・雞腎（貓貓用）18g × 10袋",
    price: 425.0,
    originalPrice: 440.0,
    imageUrl: "/images/products/wt-freeze-dried-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273828.jpg?v=1651764774",
    description:
      "日本國產雞胸肉搭配雞腎，雙重口感滿足愛嚼的貓貓。凍乾工藝鎖住鮮味，無多餘添加，適合當獎勵或乾濕混餵提味。18g × 10 袋日常備貨剛剛好。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "雞腎", "100%純肉", "無添加", "日本國產"],
    recommendedBreeds: ["maine-coon", "british-shorthair", "bengal", "mix-shorthair"],
    handle: "但馬高原-冷凍脫水雞胸肉-雞腎-貓貓用-20g-x-10袋-1",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/但馬高原-冷凍脫水雞胸肉-雞腎-貓貓用-20g-x-10袋-1",
  },
  {
    id: "wt-freeze-dried-7",
    title: "MAMACOOK 但馬高原冷凍日本國產金槍魚（貓貓用）14g × 10袋",
    price: 580.0,
    imageUrl: "/images/products/wt-freeze-dried-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273965.jpg?v=1666144524",
    description:
      "贅沢凍乾金槍魚，高蛋白、低脂，含 DHA／EPA。日系經典海鮮味，適合愛吞拿的貓貓當日常小確幸。14g × 10 袋，開袋即享海洋鮮香。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "金槍魚", "高蛋白", "DHA・EPA", "日本國產"],
    recommendedBreeds: ["siamese", "ragdoll", "russian-blue", "devon-rex"],
    handle: "mamacook-但馬高原冷凍日本國產金槍魚貓貓用-14g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/mamacook-但馬高原冷凍日本國產金槍魚貓貓用-14g-x-10袋",
  },
  {
    id: "wt-freeze-dried-8",
    title: "MAMACOOK 但馬高原冷凍脫水雞柳（貓貓用）30g × 10袋",
    price: 580.0,
    originalPrice: 680.0,
    imageUrl: "/images/products/wt-freeze-dried-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172__30.jpg?v=1591031738",
    description:
      "但馬高原走地雞低脂雞柳，急速凍乾保留嫩滑肉香。無添加、無防腐，100% 純雞肉，適合想控脂又不想犧牲美味的日常獎勵。30g × 10 袋份量實在。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "雞柳", "低脂肪", "100%純肉", "但馬高原"],
    recommendedBreeds: ["persian", "exotic-shorthair", "british-shorthair", "scottish-fold"],
    handle: "但馬高原冷凍脫水雞柳貓貓用-30g-x-10袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/但馬高原冷凍脫水雞柳貓貓用-30g-x-10袋",
  },
  {
    id: "wt-freeze-dried-9",
    title: "MAMACOOK 但馬高原冷凍脫水雞粒（貓貓用）18g × 10袋",
    price: 425.0,
    originalPrice: 440.0,
    imageUrl: "/images/products/wt-freeze-dried-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273835.jpg?v=1655185560",
    description:
      "一口大小的凍乾雞粒，方便餵食也適合撒在乾糧上提味。日本製純雞肉風味，訓練、出遊或日常點心都合適。18g × 10 袋輕巧好攜帶。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "雞粒", "一口大小", "訓練獎勵", "無添加"],
    recommendedBreeds: ["munchkin", "american-shorthair", "mix-shorthair", "devon-rex"],
    handle: "mamacook-但馬高原冷凍脫水雞粒貓貓用-18g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/mamacook-但馬高原冷凍脫水雞粒貓貓用-18g-x-10袋",
  },
  {
    id: "wt-freeze-dried-10",
    title: "MAMACOOK 但馬高原冷凍脫水豬心（貓貓用）25g × 10袋",
    price: 580.0,
    imageUrl: "/images/products/wt-freeze-dried-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273101.jpg?v=1604838290",
    description:
      "冷凍脫水豬心，濃郁臟器鮮味吸引肉食本能。適合想輪替蛋白質來源、又愛「真・肉味」的貓貓。25g × 10 袋獨立包裝，控量餵食更安心。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "豬心", "臟器鮮味", "高蛋白", "無添加"],
    recommendedBreeds: ["maine-coon", "bengal", "norwegian-forest", "mix-shorthair"],
    handle: "但馬高原-冷凍脫水豬心貓貓用-25g-x-10袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/但馬高原-冷凍脫水豬心貓貓用-25g-x-10袋",
  },
  {
    id: "wt-freeze-dried-11",
    title: "MAMACOOK 但馬高原冷凍脫水無添加豬大腿肉（貓貓用）20g × 10袋",
    price: 580.0,
    imageUrl: "/images/products/wt-freeze-dried-11.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273910.jpg?v=1638513912",
    description:
      "無添加豬大腿肉凍乾條，純粹豬肉香氣、口感有嚼勁。適合想換換口味、又堅持「乾淨原料」的家庭。20g × 10 袋，日本製日常小食首選。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "豬大腿肉", "無添加", "肉條", "日本製"],
    recommendedBreeds: ["british-shorthair", "ragdoll", "american-shorthair", "persian"],
    handle: "但馬高原-冷凍脫水無添加豬大腿肉貓貓用-20g-x10",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/但馬高原-冷凍脫水無添加豬大腿肉貓貓用-20g-x10",
  },
  {
    id: "wt-freeze-dried-12",
    title: "MAMACOOK 但馬高原冷凍日本國產信州三文魚（貓貓用）17g × 10袋",
    price: 769.0,
    imageUrl: "/images/products/wt-freeze-dried-12.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4580207273675.jpg?v=1655182725",
    description:
      "長野縣安曇野信州三文魚，贅沢凍乾成高檔海鮮小食。油脂豐潤、香氣層次分明，適合想犒賞毛孩的特別日子。17g × 10 袋，海洋奢華一口滿足。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "信州三文魚", "贅沢鮮味", "日本國產", "海鮮鮮味"],
    recommendedBreeds: ["siamese", "ragdoll", "norwegian-forest", "bengal"],
    handle: "mamacook-但馬高原冷凍日本國產信州三文魚貓貓用-17g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/mamacook-但馬高原冷凍日本國產信州三文魚貓貓用-17g-x-10袋",
  },
  {
    id: "wt-freeze-dried-13",
    title: "Petio 冷凍脫水系列・三文魚（貓貓用）10g × 6",
    price: 148.0,
    imageUrl: "/images/products/wt-freeze-dried-13.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/2DAE8CB7-6097-49FD-97E6-41438B4E5EF5.jpg?v=1596097084",
    description:
      "Petio 冷凍脫水三文魚，新鮮素材、不含防腐劑與色素。可直接餵、碎灑拌糧，或稍浸軟混入濕糧——全貓適用的入門凍乾。10g × 6 包裝輕巧試味。",
    vendor: "Petio",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "三文魚", "全貓適用", "無防腐劑", "拌糧提味"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "munchkin"],
    handle: "貓貓零食-petio-冷凍脫水系列-三文魚-10g-x-6",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/貓貓零食-petio-冷凍脫水系列-三文魚-10g-x-6",
  },
  {
    id: "wt-freeze-dried-14",
    title: "Petio 冷凍脫水系列・雞肉・雞肝・雞腎 15g × 6",
    price: 148.0,
    imageUrl: "/images/products/wt-freeze-dried-14.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/B99FBCFB-1642-47E0-AC40-05CE0B1B7E64.jpg?v=1596092712",
    description:
      "雞肉、雞肝、雞腎三重風味凍乾，一口滿足肉食本能。新鮮素材無防腐、無色素，適合拌乾濕糧或直接當獎勵。15g × 6，全貓日常好入手。",
    vendor: "Petio",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "三重雞肉", "全貓適用", "無防腐劑", "拌糧提味"],
    recommendedBreeds: ["maine-coon", "british-shorthair", "bengal", "mix-shorthair"],
    handle: "貓貓零食-petio-冷凍脫水系列-雞肉-雞肝-雞腎-15g-x-6",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/貓貓零食-petio-冷凍脫水系列-雞肉-雞肝-雞腎-15g-x-6",
  },
  {
    id: "wt-freeze-dried-15",
    title: "Petio 冷凍脫水系列・金槍魚・鰹魚・三文魚 9g × 6",
    price: 148.0,
    imageUrl: "/images/products/wt-freeze-dried-15.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/F0346315-7736-4E14-A5C3-FB848B9950E8.jpg?v=1596097695",
    description:
      "金槍魚、鰹魚、三文魚三重海鮮凍乾，海洋鮮味輪替不怕膩。無防腐、無色素，碎灑或原片餵食都合適。9g × 6 輕巧包裝，海鮮控入門首選。",
    vendor: "Petio",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "海鮮三拼", "全貓適用", "無防腐劑", "拌糧提味"],
    recommendedBreeds: ["siamese", "ragdoll", "russian-blue", "norwegian-forest"],
    handle: "貓貓零食-petio-冷凍脫水系列-金槍魚-鰹魚-三文魚9g-x-6",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/貓貓零食-petio-冷凍脫水系列-金槍魚-鰹魚-三文魚9g-x-6",
  },
  {
    id: "wt-freeze-dried-16",
    title: "MAMACOOK 但馬高原冷凍脫水西太公魚（貓貓用）10g × 10袋",
    price: 425.0,
    imageUrl: "/images/products/wt-freeze-dried-16.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/172_4580207274177_1.jpg?v=1735386603",
    description:
      "西太公魚整尾凍乾，小巧香脆、天然海鮮味。適合當趣味獎勵或拌糧提香，讓嗅覺敏銳的貓貓主動靠近。10g × 10 袋日本製，輕便好存放。",
    vendor: "MAMACOOK",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "西太公魚", "整尾凍乾", "無添加", "訓練獎勵"],
    recommendedBreeds: ["bengal", "siamese", "devon-rex", "mix-shorthair"],
    handle: "mamacook-但馬高原-冷凍脫水西太公魚貓貓用-10g-x-10袋",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/mamacook-但馬高原-冷凍脫水西太公魚貓貓用-10g-x-10袋",
  },
  {
    id: "wt-freeze-dried-17",
    title: "日本國產無添加冷凍脫水雞肝（貓貓用）40g × 8",
    price: 504.0,
    imageUrl: "/images/products/wt-freeze-dried-17.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/cat_gugufd40g_chickenliver.jpg?v=1650518829",
    description:
      "日本國產無添加凍乾雞肝，濃郁肝香是挑嘴貓的心頭好。大份裝 40g × 8，適合長期備貨的家庭；直接餵或掰碎拌糧，鮮味立刻升級。",
    vendor: "日本國產",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "雞肝", "無添加", "日本國產", "大份裝"],
    recommendedBreeds: ["maine-coon", "british-shorthair", "persian", "mix-shorthair"],
    handle: "貓貓小食-日本國產無添加冷凍脫水雞肝貓貓用-40g-x-8",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/貓貓小食-日本國產無添加冷凍脫水雞肝貓貓用-40g-x-8",
  },
  {
    id: "wt-freeze-dried-18",
    title: "日本國產無添加冷凍脫水雞肉（貓貓用）40g × 8",
    price: 428.0,
    imageUrl: "/images/products/wt-freeze-dried-18.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/cat_gugufd40g_sasami.jpg?v=1650518652",
    description:
      "日本國產無添加凍乾雞肉，純粹雞香、口感輕脆。40g × 8 大份裝適合天天獎勵或訓練使用，掰碎拌乾濕糧也很有誘食力。賞味期約一年，安心備貨。",
    vendor: "日本國產",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    tags: ["冷凍脫水系列", "雞肉", "無添加", "日本國產", "大份裝"],
    recommendedBreeds: ["american-shorthair", "ragdoll", "munchkin", "mix-shorthair"],
    handle: "貓貓小食-日本國產無添加冷凍脫水雞肉貓貓用-40g-x-8",
    productType: "貓貓小食",
    sourceUrl:
      "https://www.wt-japan.com/products/貓貓小食-日本國產無添加冷凍脫水雞肉貓貓用-40g-x-8",
  },
];
export interface Product {
  id: string;
  slug: string;
  category: string;
  categoryName: string;
  categoryNameEn: string;
  subcategory: string;
  name: string;
  nameEn: string;
  price: string;
  originalPrice?: string;
  status: string;
  brand: string;
  brandEn: string;
  series: string;
  seriesEn: string;
  type: string;
  typeEn: string;
  description: string;
  descriptionEn: string;
  tags: string;
  spec: string;
  specEn: string;
  target: string;
  image: string;
  originalImage?: string;
  detailUrl?: string;
  subCategorySlug?: string;
}

export const productData: Product[] = [
  // ── 狗狗商品 (Dog Products) ──
  {
    id: "98",
    slug: "freeze-dried-chicken-breast-comb-mix-dog-18g",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "狗狗小食",
    name: "但馬高原 - 冷凍脫水雞胸肉雞冠 (狗狗用) 18g x 10袋",
    nameEn: "MAMACOOK Freeze-Dried Chicken Breast & Comb Mix for Dogs 18g × 10",
    price: "HK$425.00",
    originalPrice: "HK$440.00",
    status: "在售",
    brand: "MAMACOOK",
    brandEn: "MAMACOOK",
    series: "MAMACOOK",
    seriesEn: "MAMACOOK",
    type: "狗狗小食",
    typeEn: "Dog treats",
    description: "MAMACOOK 日本原裝狗狗小食；狗狗小食 / 雞肉系列，每箱 18g x 10袋。",
    descriptionEn: "Japan-made MAMACOOK freeze-dried dog treats made from chicken breast and dried comb, in ten 18g pouches.",
    tags: "狗狗小食；狗用；日本國產；無添加；MAMACOOK",
    spec: "18g x 10袋",
    specEn: "18g x 10袋",
    target: "日本・狗狗用",
    image: "/images/products/wt-japan-001.webp",
    originalImage: "https://www.wt-japan.com/cdn/shop/products/172_4580207273781_2048x2048.jpg?v=1655184972",
    detailUrl: "https://www.mamacook.co.jp/lineup/?detail=20181016104753",
    subCategorySlug: "狗狗小食 / 雞肉系列"
  },
  {
    id: "99",
    slug: "made-in-japan-additive-free-chicken-liver-100g",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "狗狗小食",
    name: "日本國產無添加狗狗小食 - 雞肝乾 100g x 10",
    nameEn: "PetPro Japan-Made Additive-Free Chicken Liver Treats 100g × 10",
    price: "HK$588.00",
    status: "在售",
    brand: "PETPRO",
    brandEn: "PETPRO",
    series: "PETPRO",
    seriesEn: "PETPRO",
    type: "狗狗小食",
    typeEn: "Dog treats",
    description: "PETPRO 日本原裝狗狗小食；狗狗小食 / 內臟系列，每箱 100g x 10。",
    descriptionEn: "Japan-made PetPro chicken-liver treats with no added colorants or preservatives, in ten 100g pouches.",
    tags: "狗狗小食；狗用；日本國產；無添加；PETPRO",
    spec: "100g x 10",
    specEn: "100g x 10",
    target: "日本・狗狗用",
    image: "/images/products/wt-japan-002.webp",
    originalImage: "https://www.wt-japan.com/products/petpro-日本國產無添加狗狗小食-雞肝乾100g-x10",
    detailUrl: "https://petpro.jp/",
    subCategorySlug: "狗狗小食 / 內臟系列"
  },
  {
    id: "100",
    slug: "made-in-japan-additive-free-beef-tongue-skin-50g",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "狗狗小食",
    name: "日本國產無添加狗狗小食 - 薄切牛舌乾 50g x 10",
    nameEn: "PetPro Japan-Made Additive-Free Sliced Beef Tongue Skin 50g × 10",
    price: "HK$558.00",
    status: "在售",
    brand: "PETPRO",
    brandEn: "PETPRO",
    series: "PETPRO",
    seriesEn: "PETPRO",
    type: "狗狗小食",
    typeEn: "Dog treats",
    description: "PETPRO 日本原裝狗狗小食；狗狗小食 / 牛肉系列，每箱 50g x 10。",
    descriptionEn: "Thin-cut, Japan-made PetPro beef tongue skin treats with no added colorants or preservatives, in ten 50g pouches.",
    tags: "狗狗小食；狗用；日本國產；無添加；PETPRO",
    spec: "50g x 10",
    specEn: "50g x 10",
    target: "日本・狗狗用",
    image: "/images/products/wt-japan-003.webp",
    detailUrl: "https://petpro.jp/",
    subCategorySlug: "狗狗小食 / 牛肉系列"
  },
  {
    id: "101",
    slug: "happydays-japan-venison-slices-dog-30g",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "狗狗小食",
    name: "HappyDays 日本國產狗狗小食 - 鹿肉薄片 30g x 10",
    nameEn: "HappyDays Japan-Made Venison Slices for Dogs 30g × 10",
    price: "HK$558.00",
    status: "在售",
    brand: "HappyDays",
    brandEn: "HappyDays",
    series: "HappyDays",
    seriesEn: "HappyDays",
    type: "狗狗小食",
    typeEn: "Dog treats",
    description: "HappyDays 日本原裝狗狗小食；狗狗小食 / 鹿肉系列，每箱 30g x 10。",
    descriptionEn: "HappyDays venison slices made from Japanese deer, with no added colorants or preservatives, in ten 30g pouches.",
    tags: "狗狗小食；狗用；日本國產；無添加；HappyDays",
    spec: "30g x 10",
    specEn: "30g x 10",
    target: "日本・狗狗用",
    image: "/images/products/wt-japan-004.webp",
    detailUrl: "https://petpro.jp/post-24445/",
    subCategorySlug: "狗狗小食 / 鹿肉系列"
  },
  {
    id: "102",
    slug: "made-in-japan-additive-free-beef-achilles-long-70g",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "狗狗小食",
    name: "日本國產無添加狗狗小食 - 牛筋長條 (牛アキレスロング) 70g x 10",
    nameEn: "PetPro Japan-Made Additive-Free Long Beef Achilles Treats 70g × 10",
    price: "HK$558.00",
    status: "在售",
    brand: "PETPRO",
    brandEn: "PETPRO",
    series: "PETPRO",
    seriesEn: "PETPRO",
    type: "狗狗小食",
    typeEn: "Dog treats",
    description: "PETPRO 日本原裝狗狗小食；狗狗小食 / 牛肉系列，每箱 70g x 10。",
    descriptionEn: "Long-cut PetPro beef Achilles treats for a satisfying chew, made without added colorants, preservatives, or antioxidants, in ten 70g pouches.",
    tags: "狗狗小食；狗用；日本國產；無添加；PETPRO",
    spec: "70g x 10",
    specEn: "70g x 10",
    target: "日本・狗狗用",
    image: "/images/products/wt-japan-005.webp",
    originalImage: "https://petpro.jp/wp-content/uploads/2022/11/4981528362633-1.jpg",
    detailUrl: "https://petpro.jp/16680-2/",
    subCategorySlug: "狗狗小食 / 牛肉系列"
  },
  {
    id: "103",
    slug: "pill-pocket-greenies-dog-chicken",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（雞肉風味）",
    nameEn: "GREENIES Pill Pockets Dog Treat - Chicken Flavor",
    price: "HK$98.00",
    originalPrice: "HK$110.00",
    status: "在售",
    brand: "GREENIES",
    brandEn: "GREENIES",
    series: "投藥專用系列",
    seriesEn: "Pill Pocket Series",
    type: "餵藥小食",
    typeEn: "犬用投藥餡餅",
    description: "專為隱藏藥丸與膠囊設計的軟質餡餅，專利空腔可輕鬆捏合封口。濃郁雞肉香氣有效遮蓋藥物氣味，讓狗狗輕鬆服藥。",
    descriptionEn: "Soft pill pockets designed to hide tablets and capsules. Easily pinch closed with a rich chicken flavor that masks medicine odor.",
    tags: "投藥小食；餵藥神器；犬用；綠的；雞肉味",
    spec: "30 顆裝 (224g)",
    specEn: "30 Pockets (224g)",
    target: "全犬種",
    image: "/products/pill-pocket-greenies-dog-chicken.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "104",
    slug: "pill-pocket-greenies-dog-peanut-butter",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "GREENIES 綠的 Pill Pockets 健綠犬用投藥零食（花生醬風味）",
    nameEn: "GREENIES Pill Pockets Dog Treat - Peanut Butter Flavor",
    price: "HK$98.00",
    originalPrice: "HK$110.00",
    status: "在售",
    brand: "GREENIES",
    brandEn: "GREENIES",
    series: "投藥專用系列",
    seriesEn: "Pill Pocket Series",
    type: "餵藥小食",
    typeEn: "犬用投藥餡餅",
    description: "專為狗隻服藥設計，濃郁花生醬香氣能完美遮蔽藥物味道，質地柔軟可捏合密封。",
    descriptionEn: "Soft pill pockets with peanut butter flavor to disguise tablets and capsules easily for dogs.",
    tags: "投藥小食；餵藥神器；犬用；綠的；花生醬味",
    spec: "30 顆裝 (224g)",
    specEn: "30 Pockets (224g)",
    target: "全犬種",
    image: "/products/pill-pocket-greenies-dog-peanut-butter.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "106",
    slug: "pill-assist-royal-canin-dog-small",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "ROYAL CANIN 皇家 小型犬用投藥輔助軟錠",
    nameEn: "ROYAL CANIN Pill Assist Small Dog Treats",
    price: "HK$78.00",
    originalPrice: "HK$88.00",
    status: "在售",
    brand: "ROYAL CANIN",
    brandEn: "ROYAL CANIN",
    series: "投藥專用系列",
    seriesEn: "Pill Assist Series",
    type: "餵藥小食",
    typeEn: "犬用投藥軟錠",
    description: "專為體重 10kg 以下小型犬設計，質地柔軟易包裹藥丸，幫助減少服藥抗拒。",
    descriptionEn: "Specially designed for small breed dogs (<10kg) with soft texture to wrap around tablets easily.",
    tags: "投藥小食；餵藥神器；小型犬；皇家",
    spec: "90g (約30顆)",
    specEn: "90g (~30 pieces)",
    target: "小型犬",
    image: "/products/pill-assist-royal-canin-dog-small.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "107",
    slug: "mediball-vets-labo-dog-cheese",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（起司味）",
    nameEn: "VET'S Labo Mediball Dog Pill Treats - Cheese Flavor",
    price: "HK$48.00",
    originalPrice: "HK$55.00",
    status: "在售",
    brand: "VET'S Labo",
    brandEn: "VET'S Labo",
    series: "Mediball 系列",
    seriesEn: "Mediball Series",
    type: "餵藥小食",
    typeEn: "犬用投藥丸子",
    description: "日本獸醫師團隊研發，質地柔軟黏性佳，不易掉渣且能完美包覆藥丸，讓服藥過程輕鬆愉快。",
    descriptionEn: "Developed by Japanese vets. Extremely soft and pliable to roll around medicine easily without crumbling.",
    tags: "投藥小食；餵藥神器；犬用；日本獸醫推薦；起司味",
    spec: "15 顆裝 (20g)",
    specEn: "15 Pieces (20g)",
    target: "全犬種",
    image: "/products/mediball-vets-labo-dog-cheese.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "108",
    slug: "mediball-vets-labo-dog-chicken",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "VET'S Labo Mediball 獸醫研發犬用投藥小丸子（雞肉味）",
    nameEn: "VET'S Labo Mediball Dog Pill Treats - Chicken Flavor",
    price: "HK$48.00",
    originalPrice: "HK$55.00",
    status: "在售",
    brand: "VET'S Labo",
    brandEn: "VET'S Labo",
    series: "Mediball 系列",
    seriesEn: "Mediball Series",
    type: "餵藥小食",
    typeEn: "犬用投藥丸子",
    description: "日本獸醫師推薦，高延展性與軟Q口感，能將錠劑或膠囊密實搓揉成小丸子餵食。",
    descriptionEn: "Soft and stretchy Japanese treat easily kneaded into balls around capsules and tablets for dogs.",
    tags: "投藥小食；餵藥神器；犬用；日本國產；雞肉味",
    spec: "15 顆裝 (20g)",
    specEn: "15 Pieces (20g)",
    target: "全犬種",
    image: "/products/mediball-vets-labo-dog-chicken.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "113",
    slug: "tomlyn-pill-mask-bacon",
    category: "dogs",
    categoryName: "狗狗商品",
    categoryNameEn: "Dog Products",
    subcategory: "投藥／餵藥專用小食",
    name: "Tomlyn 湯姆林 投藥軟膏/偽裝膏（煙燻培根風味）",
    nameEn: "Tomlyn Pill-Mask Paste for Dogs - Bacon Flavor",
    price: "HK$85.00",
    originalPrice: "HK$98.00",
    status: "在售",
    brand: "Tomlyn",
    brandEn: "Tomlyn",
    series: "投藥輔助系列",
    seriesEn: "Pill Mask Series",
    type: "餵藥膏",
    typeEn: "犬用投藥膏",
    description: "可任意捏塑形狀的投藥肉膏，無論多大顆或形狀奇特的藥丸都能完美包裹，高適口性培根香氣。",
    descriptionEn: "Wrap-around bacon paste that can be molded to fit any shape or size tablet and capsule.",
    tags: "投藥膏；餵藥神器；犬用；培根味；可塑形",
    spec: "113g",
    specEn: "113g (4 oz)",
    target: "全犬種",
    image: "/products/tomlyn-pill-mask-bacon.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },

  // ── 貓咪商品 (Cat Products) ──
  {
    id: "105",
    slug: "pill-assist-royal-canin-cat",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "ROYAL CANIN 皇家 Pill Assist 貓用投藥輔助軟錠",
    nameEn: "ROYAL CANIN Pill Assist Cat Treats",
    price: "HK$72.00",
    originalPrice: "HK$80.00",
    status: "在售",
    brand: "ROYAL CANIN",
    brandEn: "ROYAL CANIN",
    series: "投藥專用系列",
    seriesEn: "Pill Assist Series",
    type: "餵藥小食",
    typeEn: "貓用投藥軟錠",
    description: "獸醫師參與研發，柔軟易塑形，能完整包覆各種形狀藥丸。高達 91% 服藥成功率，每顆僅約 3 kcal。",
    descriptionEn: "Developed with veterinarians. Soft and moldable to encapsulate pills easily with a 91% acceptance rate and only ~3 kcal per treat.",
    tags: "投藥小食；餵藥神器；貓用；皇家；低熱量",
    spec: "45g (約30顆)",
    specEn: "45g (~30 pieces)",
    target: "全貓種",
    image: "/products/pill-assist-royal-canin-cat.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "109",
    slug: "mediball-vets-labo-cat-tuna",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鮪魚味）",
    nameEn: "VET'S Labo Mediball Cat Pill Treats - Tuna Flavor",
    price: "HK$48.00",
    originalPrice: "HK$55.00",
    status: "在售",
    brand: "VET'S Labo",
    brandEn: "VET'S Labo",
    series: "Mediball 系列",
    seriesEn: "Mediball Series",
    type: "餵藥小食",
    typeEn: "貓用投藥丸子",
    description: "日本國產品質，高適口性鮪魚風味。質地柔細延展性高，能輕易密合藥丸，降低貓咪吐藥機率。",
    descriptionEn: "Japanese-made with high palatability tuna flavor. Ultra-soft texture perfectly wraps around medicine for cats.",
    tags: "投藥小食；餵藥神器；貓用；日本國產；鮪魚味",
    spec: "15 顆裝 (20g)",
    specEn: "15 Pieces (20g)",
    target: "全貓種",
    image: "/products/mediball-vets-labo-cat-tuna.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "110",
    slug: "mediball-vets-labo-cat-bonito",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "VET'S Labo Mediball 獸醫研發貓用投藥小丸子（鰹魚味）",
    nameEn: "VET'S Labo Mediball Cat Pill Treats - Bonito Flavor",
    price: "HK$48.00",
    originalPrice: "HK$55.00",
    status: "在售",
    brand: "VET'S Labo",
    brandEn: "VET'S Labo",
    series: "Mediball 系列",
    seriesEn: "Mediball Series",
    type: "餵藥小食",
    typeEn: "貓用投藥丸子",
    description: "濃郁鰹魚香氣，專為挑食貓咪設計。軟Q質地不掉屑，可將硬錠完全捏入肉丸中。",
    descriptionEn: "Aromatic bonito flavor formulated for picky cats. Soft texture locks tablets completely inside.",
    tags: "投藥小食；餵藥神器；貓用；日本獸醫推薦；鰹魚味",
    spec: "15 顆裝 (20g)",
    specEn: "15 Pieces (20g)",
    target: "全貓種",
    image: "/products/mediball-vets-labo-cat-bonito.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "111",
    slug: "ciao-churu-vet-pill-paste",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（鮪魚味）",
    nameEn: "CIAO Churu Vet High-Viscosity Pill Paste - Tuna Flavor",
    price: "HK$38.00",
    originalPrice: "HK$45.00",
    status: "在售",
    brand: "CIAO",
    brandEn: "Inaba CIAO",
    series: "Churu Vet 系列",
    seriesEn: "Churu Vet Series",
    type: "餵藥小食",
    typeEn: "貓用投藥肉泥",
    description: "專為餵藥設計的高黏度濃稠肉泥，能緊密包覆藥粉、藥水或碎藥丸，不易分離，適合難以吞食軟錠的貓咪。",
    descriptionEn: "High-viscosity treat paste specifically formulated to blend and hold powder, liquid, or pill fragments smoothly.",
    tags: "投藥小食；投藥肉泥；貓用；CIAO；高黏度",
    spec: "12g x 4 本",
    specEn: "12g x 4 Tubes",
    target: "全貓種",
    image: "/products/ciao-churu-vet-pill-paste.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "112",
    slug: "ciao-churu-vet-pill-paste-chicken",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "CIAO 獸醫專用高黏度投藥輔助肉泥膏（雞肉味）",
    nameEn: "CIAO Churu Vet High-Viscosity Pill Paste - Chicken Flavor",
    price: "HK$38.00",
    originalPrice: "HK$45.00",
    status: "在售",
    brand: "CIAO",
    brandEn: "Inaba CIAO",
    series: "Churu Vet 系列",
    seriesEn: "Churu Vet Series",
    type: "餵藥小食",
    typeEn: "貓用投藥肉泥",
    description: "日本 CIAO 獸醫通路限定版，高黏稠度配方可將藥粉及顆粒牢牢包覆，輕鬆解決貓咪餵藥難題。",
    descriptionEn: "Japan CIAO Vet-exclusive extra thick paste that coats medicine powders and tablets for effortless feeding.",
    tags: "投藥小食；投藥肉泥；貓用；CIAO；雞肉味",
    spec: "12g x 4 本",
    specEn: "12g x 4 Tubes",
    target: "全貓種",
    image: "/products/ciao-churu-vet-pill-paste-chicken.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  },
  {
    id: "114",
    slug: "easy-pill-cat-poultry",
    category: "cats",
    categoryName: "貓咪商品",
    categoryNameEn: "Cat Products",
    subcategory: "投藥／餵藥專用小食",
    name: "EasyPill 貓用投藥軟膏（禽肉風味）",
    nameEn: "EasyPill Cat Pill Treat - Poultry Flavor",
    price: "HK$65.00",
    originalPrice: "HK$75.00",
    status: "在售",
    brand: "EasyPill",
    brandEn: "EasyPill",
    series: "EasyPill 系列",
    seriesEn: "EasyPill Series",
    type: "餵藥小食",
    typeEn: "貓用投藥膏",
    description: "法國進口專業獸醫投藥產品，具備極高適口性與柔軟延展性，切取適量即可輕鬆包裹藥物。",
    descriptionEn: "French veterinary pill-masking soft treat with exceptional palatability and easy moldability for cats.",
    tags: "投藥小食；投藥膏；貓用；法國進口；高適口性",
    spec: "10g x 3 條",
    specEn: "10g x 3 Bars",
    target: "全貓種",
    image: "/products/easy-pill-cat-poultry.webp",
    subCategorySlug: "投藥／餵藥專用小食"
  }
];
