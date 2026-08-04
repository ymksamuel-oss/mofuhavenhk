/**
 * WT Japan cat catalog — curated for Mofu Haven.
 * Images sourced via scrape scripts; copy & tags hand-polished.
 * Sources:
 *   - 貓罐罐: https://www.wt-japan.com/collections/貓罐罐/罐罐
 *   - 乾糧:   https://www.wt-japan.com/collections/乾糧
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
  /** Selling-point tags shown on product cards (2–4). */
  tags: string[];
  /** Cat breed slugs from `@/lib/catBreeds` that suit this recipe. */
  recommendedBreeds: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

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
    tags: ["高水分補給", "海鮮雙拼", "綠茶消臭", "全齡貓適用"],
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
    tags: ["白肉金槍魚", "層次鮮味", "高水分補給", "挑嘴貓友好"],
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
    tags: ["高蛋白配方", "和牛奢華", "活力補給", "綠茶消臭"],
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
    tags: ["熟齡貓專用", "軟質好入口", "三重蛋白", "高水分補給"],
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
    tags: ["熟齡貓專用", "單一海鮮", "清爽好消化", "杯裝便利"],
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
    tags: ["清淡海鮮", "雞胸低負擔", "高水分補給", "輪替菜單"],
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
    tags: ["白飯魚點綴", "趣味口感", "高水分補給", "全齡貓適用"],
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
    tags: ["木魚乾香氣", "乾濕混餵", "活力菜單", "挑嘴貓友好"],
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
    tags: ["柔滑好吞嚥", "越光米配方", "腸胃溫和", "軟食友好"],
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
    tags: ["經典日系味", "鰹魚乾點綴", "日常輪替", "綠茶消臭"],
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
    tags: ["乾糧", "1兆乳酸菌", "鰹魚乾味", "日本直送"],
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
    tags: ["乾糧", "乳酸菌", "雞肉味", "獨立包裝"],
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
    tags: ["乾糧", "1兆乳酸菌", "金槍魚乾", "日本直送"],
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
    tags: ["乾糧", "口味輪替", "1兆乳酸菌", "金槍魚"],
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
    tags: ["乾糧", "木魚乾香氣", "1兆乳酸菌", "日本直送"],
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
    tags: ["乾糧", "雞肉蛋白", "1兆乳酸菌", "活力菜單"],
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
    tags: ["乾糧", "乳酸菌", "鰹魚味", "獨立包裝"],
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
    tags: ["乾糧", "幼貓專用", "1兆乳酸菌", "金槍魚"],
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
    tags: ["乾糧", "乳酸菌", "金槍魚乾", "獨立包裝"],
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
    tags: ["乾糧", "海鮮雙拼", "1兆乳酸菌", "日本直送"],
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
    tags: ["乾糧", "海鮮味", "1兆乳酸菌", "口味輪替"],
    recommendedBreeds: ["siamese", "bengal", "russian-blue", "mix-shorthair"],
    handle: "ciao-1兆個乳酸菌乾糧-3款海鮮味-10袋-x-6",
    productType: "乾糧",
    sourceUrl: "https://www.wt-japan.com/products/ciao-1兆個乳酸菌乾糧-3款海鮮味-10袋-x-6",
  },
];

export function getWtJapanProductById(
  id: string | null | undefined,
): WtJapanProduct | null {
  if (!id) return null;
  return WT_JAPAN_PRODUCTS.find((p) => p.id === id) ?? null;
}

/** Products recommended for a given cat breed slug. */
export function getWtJapanProductsByBreed(breedSlug: string): WtJapanProduct[] {
  return WT_JAPAN_PRODUCTS.filter((p) => p.recommendedBreeds.includes(breedSlug));
}
