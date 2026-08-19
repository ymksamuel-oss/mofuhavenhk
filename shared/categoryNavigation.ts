import type { ProductCategory } from "./productCatalog";

export type StorefrontCategory = Exclude<ProductCategory, "all">;

export type StorefrontCategoryItem = {
  slug: StorefrontCategory;
  label: string;
  desc: string;
};

/**
 * The storefront order intentionally omits the legacy "all" pill. The full
 * catalog remains available through the Products route and the empty-state CTA.
 */
export const storefrontCategories: StorefrontCategoryItem[] = [
  { slug: "cats", label: "貓咪商品", desc: "為貓咪精心挑選" },
  { slug: "dogs", label: "狗狗商品", desc: "狗狗的最愛" },
  { slug: "small-pets", label: "小寵物商品", desc: "小動物的貼心照護" },
  { slug: "treats", label: "寵物零食", desc: "健康小食" },
  { slug: "wet-cans", label: "貓咪罐罐", desc: "濕糧與罐頭" },
  { slug: "toys", label: "寵物玩具", desc: "快樂時光" },
  { slug: "supplements", label: "營養保健", desc: "健康守護" },
  { slug: "deals", label: "限時優惠", desc: "驚喜好康" },
  { slug: "bestsellers", label: "熱賣商品", desc: "人氣推薦" },
  { slug: "outdoor", label: "外出用品", desc: "便利同行" },
];

export const storefrontCategorySlugs = storefrontCategories.map(({ slug }) => slug);
