/**
 * WT Japan 狗餅 — curated for Mofu Haven.
 * Reuses WT collection「餅乾類」filtered by tag「狗餅」.
 * Source: https://www.wt-japan.com/collections/餅乾類
 * Storefront: /categories/dogs/dog-biscuits
 */

export const DOG_BISCUITS_CATEGORY = "狗狗商品" as const;
export const DOG_BISCUITS_CATEGORY_SLUG = "dogs" as const;

export type WtJapanDogBiscuitProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  sourceImageUrl: string;
  description: string;
  vendor: string;
  category: typeof DOG_BISCUITS_CATEGORY;
  categorySlug: typeof DOG_BISCUITS_CATEGORY_SLUG;
  subcategory: "狗餅";
  tags: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

export const WT_JAPAN_DOG_BISCUIT_PRODUCTS: WtJapanDogBiscuitProduct[] = [
  {
    id: "wt-dog-biscuit-1",
    title: "Smack 狗狗百力滋  雞肉味 30g x 6",
    price: 180.0,
    originalPrice: 288.0,
    imageUrl: "/images/products/wt-dog-biscuit-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4970022011918.jpg?v=1585893909",
    description:
      "低脂肪 使用人類食用級食材製造 每盒內有3小包(10g)，方便攜帶 日本國內生產，確保由新鮮食材製造",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "smack-狗狗百力滋-雞肉味-30g-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/smack-%E7%8B%97%E7%8B%97%E7%99%BE%E5%8A%9B%E6%BB%8B-%E9%9B%9E%E8%82%89%E5%91%B3-30g-x-6",
  },
  {
    id: "wt-dog-biscuit-2",
    title: "Combo 狗狗脆餅 -芝士雞味 （腸胃健康配方） 36g x6",
    price: 192.0,
    imageUrl: "/images/products/wt-dog-biscuit-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/9A4B2B2D-7F0F-4D8B-B848-47FAF3BC941A.jpg?v=1596554303",
    description:
      "一包12小袋 內有活性乳酸菌、保持狗狗腸胃健康 日本製",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["乳酸菌", "營養", "狗狗小食", "狗餅", "狗用"],
    handle: "combo-狗狗脆餅-腸胃健康配方-36g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/combo-%E7%8B%97%E7%8B%97%E8%84%86%E9%A4%85-%E8%85%B8%E8%83%83%E5%81%A5%E5%BA%B7%E9%85%8D%E6%96%B9-36g-x6",
  },
  {
    id: "wt-dog-biscuit-3",
    title: "Combo 狗狗脆餅 -芝士雞味 （潔齒、口腔護理 ） 36g x6",
    price: 192.0,
    imageUrl: "/images/products/wt-dog-biscuit-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/22A2BEA1-6FEE-4785-9CD8-0D0496FAAFAB.jpg?v=1596553363",
    description:
      "日本寵物小食「Combo 狗狗脆餅 -芝士雞味 （潔齒、口腔護理 ） 36g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["口腔護理", "潔齒", "營養", "狗狗小食", "狗餅", "狗用"],
    handle: "combo-狗狗脆餅-潔齒-口腔護理-36g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/combo-%E7%8B%97%E7%8B%97%E8%84%86%E9%A4%85-%E6%BD%94%E9%BD%92-%E5%8F%A3%E8%85%94%E8%AD%B7%E7%90%86-36g-x6",
  },
  {
    id: "wt-dog-biscuit-4",
    title: "Smack 狗狗百力滋 低脂肪蔬菜味 30g x 6",
    price: 180.0,
    originalPrice: 288.0,
    imageUrl: "/images/products/wt-dog-biscuit-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4970022011932.jpg?v=1585894124",
    description:
      "低脂肪 使用人類食用級食材製造 每盒內有3小包(10g)，方便攜帶 日本國內生產，確保由新鮮食材製造",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "smack-狗狗百力滋-低脂肪蔬菜味-30g-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/smack-%E7%8B%97%E7%8B%97%E7%99%BE%E5%8A%9B%E6%BB%8B-%E4%BD%8E%E8%84%82%E8%82%AA%E8%94%AC%E8%8F%9C%E5%91%B3-30g-x-6",
  },
  {
    id: "wt-dog-biscuit-5",
    title: "Smack 狗狗百力滋 芝士味 30g x 6",
    price: 180.0,
    originalPrice: 288.0,
    imageUrl: "/images/products/wt-dog-biscuit-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4970022011901.jpg?v=1585893645",
    description:
      "低脂肪 使用人類食用級食材製造 每盒內有3小包(10g)，方便攜帶 日本國內生產，確保由新鮮食材製造",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "smack-狗狗百力滋-芝士味-30g-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/smack-%E7%8B%97%E7%8B%97%E7%99%BE%E5%8A%9B%E6%BB%8B-%E8%8A%9D%E5%A3%AB%E5%91%B3-30g-x-6",
  },
  {
    id: "wt-dog-biscuit-6",
    title: "MAMACOOK 但馬高原 - 雞肉免治餅乾 60g x 10袋",
    price: 355.0,
    imageUrl: "/images/products/wt-dog-biscuit-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273729.jpg?v=1655186372",
    description:
      "日本寵物小食「MAMACOOK 但馬高原 - 雞肉免治餅乾 60g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["但馬高原", "狗狗小食", "狗餅", "狗用"],
    handle: "但馬高原-雞肉免治餅乾-65g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F-%E9%9B%9E%E8%82%89%E5%85%8D%E6%B2%BB%E9%A4%85%E4%B9%BE-65g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-7",
    title: "Combo 狗狗脆餅 - 芝士雞味（維持關節健康配方） 36g x6",
    price: 192.0,
    imageUrl: "/images/products/wt-dog-biscuit-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/DE5F1291-1F5C-4BA0-B67C-73E27547A4E0.jpg?v=1596553666",
    description:
      "一包12袋 內含N-乙酰氨基葡萄糖軟骨素、增強狗狗腳骨力 日本製",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["營養", "狗狗小食", "狗餅", "狗用"],
    handle: "combo-狗狗脆餅-維持關節健康配方-36g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/combo-%E7%8B%97%E7%8B%97%E8%84%86%E9%A4%85-%E7%B6%AD%E6%8C%81%E9%97%9C%E7%AF%80%E5%81%A5%E5%BA%B7%E9%85%8D%E6%96%B9-36g-x6",
  },
  {
    id: "wt-dog-biscuit-8",
    title: "petio 乳酸菌善玉菌棒 40g x 6",
    price: 168.0,
    imageUrl: "/images/products/wt-dog-biscuit-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4B14082B-17A8-49F3-9ADC-2F550EECA37D.jpg?v=1595954540",
    description:
      "日本寵物小食「petio 乳酸菌善玉菌棒 40g x 6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["乳酸菌", "狗狗小食", "狗餅", "狗用"],
    handle: "petio-乳酸菌善玉菌棒-40g-x-6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E4%B9%B3%E9%85%B8%E8%8F%8C%E5%96%84%E7%8E%89%E8%8F%8C%E6%A3%92-40g-x-6",
  },
  {
    id: "wt-dog-biscuit-9",
    title: "Q-pet 6000億乳酸菌餅乾條 - 雞肉乳酪味 150g x 3",
    price: 105.0,
    imageUrl: "/images/products/wt-dog-biscuit-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/9946290E-7D09-44DA-B549-95515E97E368.jpg?v=1593067045",
    description:
      "日本寵物小食「Q-pet 6000億乳酸菌餅乾條 - 雞肉乳酪味 150g x 3」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["乳酸菌", "狗狗小食", "狗餅", "雞肉", "狗用"],
    handle: "q-pet-6000億乳酸菌餅乾條-雞肉乳酪味-150g-x-3",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/q-pet-6000%E5%84%84%E4%B9%B3%E9%85%B8%E8%8F%8C%E9%A4%85%E4%B9%BE%E6%A2%9D-%E9%9B%9E%E8%82%89%E4%B9%B3%E9%85%AA%E5%91%B3-150g-x-3",
  },
  {
    id: "wt-dog-biscuit-10",
    title: "Petio 乳酸菌奶酪小饅頭 120g x6",
    price: 252.0,
    originalPrice: 348.0,
    imageUrl: "/images/products/wt-dog-biscuit-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/chanet_265605.jpg?v=1655616487",
    description:
      "日本寵物小食「Petio 乳酸菌奶酪小饅頭 120g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "petio-乳酸菌奶酪小饅頭-120g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E4%B9%B3%E9%85%B8%E8%8F%8C%E5%A5%B6%E9%85%AA%E5%B0%8F%E9%A5%85%E9%A0%AD-120g-x6",
  },
  {
    id: "wt-dog-biscuit-11",
    title: "MAMACOOK 但馬高原 - 沙丁魚乾 60g x 10袋",
    price: 355.0,
    imageUrl: "/images/products/wt-dog-biscuit-11.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273712.jpg?v=1655186217",
    description:
      "日本寵物小食「MAMACOOK 但馬高原 - 沙丁魚乾 60g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["但馬高原", "狗狗小食", "狗餅", "貓貓小食", "貓貓脆餅", "餅"],
    handle: "但馬高原-沙丁鱼乾-65g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F-%E6%B2%99%E4%B8%81%E9%B1%BC%E4%B9%BE-65g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-12",
    title: "MAMACOOK 但馬高原 - 蘋果味餅乾 60g x 10袋",
    price: 355.0,
    imageUrl: "/images/products/wt-dog-biscuit-12.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273743.jpg?v=1655186515",
    description:
      "日本寵物小食「MAMACOOK 但馬高原 - 蘋果味餅乾 60g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["但馬高原", "狗狗小食", "狗餅", "狗用"],
    handle: "但馬高原-蘋果味餅乾-65g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F-%E8%98%8B%E6%9E%9C%E5%91%B3%E9%A4%85%E4%B9%BE-65g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-13",
    title: "MAMACOOK 但馬高原 - 芝士餅乾 60g x 10袋",
    price: 355.0,
    imageUrl: "/images/products/wt-dog-biscuit-13.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273736.jpg?v=1655186427",
    description:
      "日本寵物小食「MAMACOOK 但馬高原 - 芝士餅乾 60g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["但馬高原", "狗狗小食", "狗餅", "芝士", "狗用"],
    handle: "但馬高原-芝士餅乾-65g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F-%E8%8A%9D%E5%A3%AB%E9%A4%85%E4%B9%BE-65g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-14",
    title: "狗狗小食 - 蔬菜餅140g x 6袋",
    price: 312.0,
    originalPrice: 408.0,
    imageUrl: "/images/products/wt-dog-biscuit-14.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588114151.jpg?v=1583427063",
    description:
      "日本寵物小食「狗狗小食 - 蔬菜餅140g x 6袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "餅", "狗用"],
    handle: "狗狗小食-蔬菜餅140g-x-6袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/%E7%8B%97%E7%8B%97%E5%B0%8F%E9%A3%9F-%E8%94%AC%E8%8F%9C%E9%A4%85140g-x-6%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-15",
    title: "MAMACOOK 但馬高原玄米棒(狗狗用) 30g x 10袋",
    price: 425.0,
    imageUrl: "/images/products/wt-dog-biscuit-15.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/files/172_4580207274054_1.jpg?v=1684376359",
    description:
      "日本寵物小食「MAMACOOK 但馬高原玄米棒(狗狗用) 30g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["但馬高原", "狗狗小食", "狗餅", "餅", "狗用"],
    handle: "mamacook-但馬高原玄米棒狗狗用-30g-x-10袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/mamacook-%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F%E7%8E%84%E7%B1%B3%E6%A3%92%E7%8B%97%E7%8B%97%E7%94%A8-30g-x-10%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-16",
    title: "MAMACOOK 但馬高原 - 高知県羊奶餅乾 40g x 10袋",
    price: 355.0,
    imageUrl: "/images/products/wt-dog-biscuit-16.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/172_4580207273927.jpg?v=1655434185",
    description:
      "日本寵物小食「MAMACOOK 但馬高原 - 高知県羊奶餅乾 40g x 10袋」。適合狗狗日常獎勵或訓練使用。",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "mamacook-但馬高原-高知県羊奶餅乾-40g-x-10袋",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/mamacook-%E4%BD%86%E9%A6%AC%E9%AB%98%E5%8E%9F-%E9%AB%98%E7%9F%A5%E7%9C%8C%E7%BE%8A%E5%A5%B6%E9%A4%85%E4%B9%BE-40g-x-10%E8%A2%8B",
  },
  {
    id: "wt-dog-biscuit-17",
    title: "Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 蕃薯味 120g x6",
    price: 205.0,
    imageUrl: "/images/products/wt-dog-biscuit-17.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588135620.jpg?v=1606714250",
    description:
      "日本寵物小食「Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 蕃薯味 120g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "petio-狗狗零食-無添加小食贅沢野菜小餅乾-蕃薯味-120g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E7%84%A1%E6%B7%BB%E5%8A%A0%E5%B0%8F%E9%A3%9F%E8%B4%85%E6%B2%A2%E9%87%8E%E8%8F%9C%E5%B0%8F%E9%A4%85%E4%B9%BE-%E8%95%83%E8%96%AF%E5%91%B3-120g-x6",
  },
  {
    id: "wt-dog-biscuit-18",
    title: "Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 南瓜味 120g x6",
    price: 205.0,
    imageUrl: "/images/products/wt-dog-biscuit-18.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588135637.jpg?v=1606714151",
    description:
      "日本寵物小食「Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 南瓜味 120g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "petio-狗狗零食-無添加小食贅沢野菜小餅乾-南瓜味-120g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E7%84%A1%E6%B7%BB%E5%8A%A0%E5%B0%8F%E9%A3%9F%E8%B4%85%E6%B2%A2%E9%87%8E%E8%8F%9C%E5%B0%8F%E9%A4%85%E4%B9%BE-%E5%8D%97%E7%93%9C%E5%91%B3-120g-x6",
  },
  {
    id: "wt-dog-biscuit-19",
    title: "Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 紅蘿蔔味 120g x6",
    price: 205.0,
    imageUrl: "/images/products/wt-dog-biscuit-19.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588135644.jpg?v=1606714038",
    description:
      "日本寵物小食「Petio 狗狗零食 - 無添加小食贅沢野菜小餅乾- 紅蘿蔔味 120g x6」。適合狗狗日常獎勵或訓練使用。",
    vendor: "Petio",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["狗狗小食", "狗餅", "狗用"],
    handle: "petio-狗狗零食-無添加小食贅沢野菜小餅乾-紅蘿蔔味-120g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E7%8B%97%E7%8B%97%E9%9B%B6%E9%A3%9F-%E7%84%A1%E6%B7%BB%E5%8A%A0%E5%B0%8F%E9%A3%9F%E8%B4%85%E6%B2%A2%E9%87%8E%E8%8F%9C%E5%B0%8F%E9%A4%85%E4%B9%BE-%E7%B4%85%E8%98%BF%E8%94%94%E5%91%B3-120g-x6",
  },
  {
    id: "wt-dog-biscuit-20",
    title: "Combo 狗狗脆餅 -芝士雞味 （幼犬用）36g x6",
    price: 192.0,
    imageUrl: "/images/products/wt-dog-biscuit-20.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/461F4D17-DDC1-4DAF-9969-95214DE43FD9.jpg?v=1597673306",
    description:
      "一包12小袋 內有幼犬所需β-葡聚醣和DHA 幫助腦部發展 日本製",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["營養", "狗狗小食", "狗餅", "狗用"],
    handle: "combo-狗狗脆餅-芝士雞味-幼犬用-36g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/combo-%E7%8B%97%E7%8B%97%E8%84%86%E9%A4%85-%E8%8A%9D%E5%A3%AB%E9%9B%9E%E5%91%B3-%E5%B9%BC%E7%8A%AC%E7%94%A8-36g-x6",
  },
  {
    id: "wt-dog-biscuit-21",
    title: "Combo 狗狗脆餅 -芝士雞味 （高齡狗用）36g x6",
    price: 192.0,
    imageUrl: "/images/products/wt-dog-biscuit-21.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/A5C2252B-5E99-483E-A2A0-B29745BC59A8.jpg?v=1596555229",
    description:
      "一包12小袋 內含高齡犬必需的輔酶Q10 日本製",
    vendor: "WT",
    category: "狗狗商品",
    categorySlug: "dogs",
    subcategory: "狗餅",
    tags: ["營養", "狗狗小食", "狗餅", "狗用"],
    handle: "combo-狗狗脆餅-芝士雞味-高齡狗用-36g-x6",
    productType: "狗狗小食",
    sourceUrl: "https://www.wt-japan.com/products/combo-%E7%8B%97%E7%8B%97%E8%84%86%E9%A4%85-%E8%8A%9D%E5%A3%AB%E9%9B%9E%E5%91%B3-%E9%AB%98%E9%BD%A1%E7%8B%97%E7%94%A8-36g-x6",
  },
];
