import type { CategoryIconName } from "@/lib/categories";

export type Product = {
  id: string;
  categorySlug: string;
  name: { zh: string; en: string };
  price: number;
  /** No product photography yet, so each card uses a category-style icon as its image placeholder. */
  icon: CategoryIconName;
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
];

export function getProductsByCategory(slug: string | null): Product[] {
  if (!slug) return PRODUCTS;
  return PRODUCTS.filter((product) => product.categorySlug === slug);
}
