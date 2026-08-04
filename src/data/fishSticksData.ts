/**
 * WT Japan 魚條 series — curated for Mofu Haven.
 * Reuses existing WT collection handle「魚條」.
 * Source: https://www.wt-japan.com/collections/魚條
 * Storefront: /categories/cats/fish-sticks
 * Freeze-dried SKUs that also appear in this collection stay under
 * 「冷凍脫水系列」 only (no duplicate listings).
 */

export const FISH_STICKS_CATEGORY = "貓咪商品" as const;
export const FISH_STICKS_CATEGORY_SLUG = "cats" as const;

export type WtJapanFishStickProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  sourceImageUrl: string;
  description: string;
  vendor: string;
  category: typeof FISH_STICKS_CATEGORY;
  categorySlug: typeof FISH_STICKS_CATEGORY_SLUG;
  /** Reuse WT collection「魚條」. */
  subcategory: "魚條";
  tags: string[];
  recommendedBreeds: string[];
  handle: string;
  productType: string;
  sourceUrl: string;
};

export const WT_JAPAN_FISH_STICK_PRODUCTS: WtJapanFishStickProduct[] = [
  {
    id: "wt-fish-stick-1",
    title: "CIAO 燒鏗魚 - 多汁鰹魚味5條裝x 6",
    price: 255.0,
    imageUrl: "/images/products/wt-fish-stick-1.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/EA42B75D-2147-446A-A18F-A6AADC9F405F.jpg?v=1586669558",
    description:
      "CIAO 經典燒鰹魚條，多汁鰹魚味一開袋就飄香。一袋 5 條 × 6 袋共 30 條，適合日常獎勵或拌糧提味；綠茶消臭成分溫和鎖味，全齡貓適用。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "烤鰹魚", "綠茶消臭成分", "貓貓小食"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鏗魚-多汁鰹魚味5條裝x-6",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%8F%97%E9%AD%9A-%E5%A4%9A%E6%B1%81%E9%B0%B9%E9%AD%9A%E5%91%B35%E6%A2%9D%E8%A3%9Dx-6",
  },
  {
    id: "wt-fish-stick-2",
    title: "CIAO 燒鏗魚 - 多魚汁 5條裝x 6",
    price: 255.0,
    imageUrl: "/images/products/wt-fish-stick-2.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/394122B9-1305-4BFE-8DCC-8E93CD268BC9.jpg?v=1586669268",
    description:
      "CIAO 燒鰹魚・多魚汁配方，魚湯鮮味更濃郁。一袋 5 條 × 6 袋，訓練獎勵、嘴饞時刻都合適；日本 Inaba 經典烤鰹魚工藝。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "烤鰹魚", "綠茶消臭成分", "貓貓小食"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鏗魚-多魚汁-5條裝x-6",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%8F%97%E9%AD%9A-%E5%A4%9A%E9%AD%9A%E6%B1%81-5%E6%A2%9D%E8%A3%9Dx-6",
  },
  {
    id: "wt-fish-stick-3",
    title: "CIAO 燒鏗魚 - 木魚乾味5條裝x 6",
    price: 255.0,
    imageUrl: "/images/products/wt-fish-stick-3.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/2A7ABE5D-2C01-48DA-B5DA-EAA245B3990A.jpg?v=1586668703",
    description:
      "CIAO 燒鰹魚・木魚乾味，柴魚香氣層次分明。一袋 5 條 × 6 袋便於分裝，適合挑嘴貓日常小食。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "木魚乾", "烤鰹魚", "綠茶消臭成分"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鏗魚-木魚味5條裝x-6",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%8F%97%E9%AD%9A-%E6%9C%A8%E9%AD%9A%E5%91%B35%E6%A2%9D%E8%A3%9Dx-6",
  },
  {
    id: "wt-fish-stick-4",
    title: "CIAO 燒鏗魚 - 高齡貓用 5條裝x 6袋",
    price: 255.0,
    imageUrl: "/images/products/wt-fish-stick-4.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/image.jpg?v=1586668108",
    description:
      "CIAO 燒鰹魚高齡貓配方，一袋 5 條 × 6 袋。質地偏軟好入口，專為熟齡貓設計，獎勵同加餐都合適。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["11歳起", "CIAO", "INABA", "烤鰹魚", "老貓零食"],
    recommendedBreeds: ["british-shorthair", "persian", "ragdoll", "mix-shorthair"],
    handle: "ciao-燒鏗魚-高齡貓用-5條裝x-6袋",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%8F%97%E9%AD%9A-%E9%AB%98%E9%BD%A1%E8%B2%93%E7%94%A8-5%E6%A2%9D%E8%A3%9Dx-6%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-5",
    title: "CIAO 燒鏗魚 - 骨膠原添加  (高齡貓用) x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-5.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133710315_a857f7ce-2633-40ab-8976-8f5065d08f1f.jpg?v=1580399365",
    description:
      "CIAO 燒鰹魚添加骨膠原，高齡貓友善。獨立小袋約 24 袋裝，方便控量餵食，日常關懷熟齡毛孩。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["11歳起", "CIAO", "INABA", "烤鰹魚", "綠茶消臭成分"],
    recommendedBreeds: ["british-shorthair", "persian", "ragdoll", "mix-shorthair"],
    handle: "ciao-燒鏗魚-骨膠原添加-高齡貓用-x-48袋",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%8F%97%E9%AD%9A-%E9%AA%A8%E8%86%A0%E5%8E%9F%E6%B7%BB%E5%8A%A0-%E9%AB%98%E9%BD%A1%E8%B2%93%E7%94%A8-x-48%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-6",
    title: "CIAO 燒鰹魚 - 帆立貝味 x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-6.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133636219.jpg?v=1580399832",
    description:
      "CIAO 燒鰹魚・帆立貝味，鮮甜貝香搭配烤鰹魚。約 24 袋裝，綠茶消臭，適合想輪替海鮮味嘅日常小食。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "帆立貝", "烤鰹魚", "綠茶消臭成分"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鰹魚-帆立貝味-x-48袋",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%B0%B9%E9%AD%9A-%E5%B8%86%E7%AB%8B%E8%B2%9D%E5%91%B3-x-48%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-7",
    title: "CIAO 燒鰹魚 - 帆立貝味 (高齡貓用) x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-7.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133636257_b885d37a-0a39-410f-8fa4-3458fb9535d2.jpg?v=1582784360",
    description:
      "CIAO 燒鰹魚・帆立貝味（高齡貓用），軟嫩好入口。約 24 袋裝，專為 11 歲起熟齡貓準備。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["11歳起", "CIAO", "INABA", "帆立貝", "烤鰹魚"],
    recommendedBreeds: ["british-shorthair", "persian", "ragdoll", "mix-shorthair"],
    handle: "ciao-燒鰹魚-帆立貝味-高齡貓用-x-24袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%B0%B9%E9%AD%9A-%E5%B8%86%E7%AB%8B%E8%B2%9D%E5%91%B3-%E9%AB%98%E9%BD%A1%E8%B2%93%E7%94%A8-x-24%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-8",
    title: "CIAO 燒鰹魚 - 鰹魚多汁 x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-8.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133636233.jpg?v=1582784467",
    description:
      "CIAO 燒鰹魚・鰹魚多汁，濃郁魚汁鎖住鮮味。約 24 袋裝，訓練獎勵或日常點心都方便。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "烤鰹魚", "綠茶消臭成分", "貓貓小食"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鰹魚-鰹魚多汁-x-24袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%B0%B9%E9%AD%9A-%E9%B0%B9%E9%AD%9A%E5%A4%9A%E6%B1%81-x-24%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-9",
    title: "CIAO 燒鰹魚 - 木魚乾味  x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-9.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133636202.jpg?v=1580399607",
    description:
      "CIAO 燒鰹魚・木魚乾味獨立小袋約 24 袋。經典柴魚香，綠茶消臭，全齡貓日常小食首選。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["CIAO", "INABA", "烤鰹魚", "綠茶消臭成分", "貓貓小食"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "ciao-燒鰹魚-木魚乾味-x-48-袋",
    productType: "魚條",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%B0%B9%E9%AD%9A-%E6%9C%A8%E9%AD%9A%E4%B9%BE%E5%91%B3-x-48-%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-10",
    title: "CIAO 燒鰹魚 - 燒鰹魚 - 1歳前食用 x 24袋",
    price: 240.0,
    imageUrl: "/images/products/wt-fish-stick-10.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4901133710308_dd590604-e858-482b-8d10-e97824ed0dc7.jpg?v=1582784401",
    description:
      "CIAO 燒鰹魚・1 歲前幼貓適用配方，質地溫和。約 24 袋裝，適合成長期小貓獎勵同適應固體小食。",
    vendor: "CIAO",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["1歳前", "CIAO", "INABA", "烤鰹魚", "綠茶消臭成分"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "maine-coon", "siamese"],
    handle: "ciao-燒鰹魚-燒鰹魚-1歳前食用-x-24袋",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/ciao-%E7%87%92%E9%B0%B9%E9%AD%9A-%E7%87%92%E9%B0%B9%E9%AD%9A-1%E6%AD%B3%E5%89%8D%E9%A3%9F%E7%94%A8-x-24%E8%A2%8B",
  },
  {
    id: "wt-fish-stick-11",
    title: "Petio 蟹肉絲 45g x 6",
    price: 240.0,
    originalPrice: 270.0,
    imageUrl: "/images/products/wt-fish-stick-11.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4903588125881.jpg?v=1585743599",
    description:
      "Petio 蟹肉絲，纖細絲狀好撕餵。45g × 6 包裝，海鮮鮮味吸引挑嘴貓，可直接餵或拌糧提味。",
    vendor: "Petio",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["蟹肉", "貓貓小食", "魚條", "貓用"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "petio-蟹肉絲-45g-x-6",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/petio-%E8%9F%B9%E8%82%89%E7%B5%B2-45g-x-6",
  },
  {
    id: "wt-fish-stick-12",
    title: "Sunrise 貓草魚肉條 40g x 12",
    price: 264.0,
    imageUrl: "/images/products/wt-fish-stick-12.jpg",
    sourceImageUrl:
      "https://cdn.shopify.com/s/files/1/0280/1428/0749/products/4973321929649.jpg?v=1593658717",
    description:
      "Sunrise 貓草魚肉條，魚肉搭配貓草清香。40g × 12，適合想加點綠意同咀嚼樂趣嘅日常小食。",
    vendor: "WT",
    category: "貓咪商品",
    categorySlug: "cats",
    subcategory: "魚條",
    tags: ["貓貓小食", "魚條", "貓用"],
    recommendedBreeds: ["mix-shorthair", "american-shorthair", "siamese", "british-shorthair"],
    handle: "sunrise-貓草魚肉條-40g-x-12",
    productType: "貓貓小食",
    sourceUrl: "https://www.wt-japan.com/products/sunrise-%E8%B2%93%E8%8D%89%E9%AD%9A%E8%82%89%E6%A2%9D-40g-x-12",
  },
];
