import type { Product } from "@/lib/products";

/**
 * Editorial demo cards for the new small-pets shelf.
 * These are intentionally not purchasable until real Stripe prices/images are connected.
 */
export const SMALL_PET_DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-small-pet-rabbit-hay",
    categorySlug: "small-pets",
    icon: "bone",
    image: "catalog-placeholder",
    name: {
      zh: "高纖提摩西兔兔牧草 示範商品",
      en: "High-Fibre Timothy Hay for Rabbits — Demo",
    },
    description: {
      zh: "適合兔兔日常咀嚼的高纖牧草，作為小寵物專區示範商品。",
      en: "High-fibre hay for everyday rabbit chewing, shown as a small-pets demo product.",
    },
    specs: [
      { zh: "適用：兔子、天竺鼠", en: "Suitable for: rabbits and guinea pigs" },
      { zh: "展示狀態：待接入實際商品資料", en: "Display status: awaiting live product data" },
    ],
    price: 88,
    inStock: false,
    metadata: { demo: "true", demo_category: "small-pets" },
    tags: ["小寵物", "兔子", "牧草", "demo"],
  },
  {
    id: "demo-small-pet-hamster-food",
    categorySlug: "small-pets",
    icon: "bone",
    image: "catalog-placeholder",
    name: {
      zh: "倉鼠均衡營養糧 示範商品",
      en: "Balanced Hamster Food — Demo",
    },
    description: {
      zh: "為倉鼠日常飲食而設的均衡配方，作為小寵物分類示範。",
      en: "A balanced everyday formula for hamsters, shown as a small-pets category demo.",
    },
    specs: [
      { zh: "適用：倉鼠、沙鼠", en: "Suitable for: hamsters and gerbils" },
      { zh: "展示狀態：待接入實際商品資料", en: "Display status: awaiting live product data" },
    ],
    price: 68,
    inStock: false,
    metadata: { demo: "true", demo_category: "small-pets" },
    tags: ["小寵物", "倉鼠", "主糧", "demo"],
  },
  {
    id: "demo-small-pet-guinea-pig-vitamin",
    categorySlug: "small-pets",
    icon: "health",
    image: "catalog-placeholder",
    name: {
      zh: "天竺鼠維他命 C 營養補充 示範商品",
      en: "Vitamin C Supplement for Guinea Pigs — Demo",
    },
    description: {
      zh: "小寵物日常營養補充示範，方便日後建立天竺鼠用品專區。",
      en: "A demo daily nutrition supplement for building the future guinea-pig range.",
    },
    specs: [
      { zh: "適用：天竺鼠", en: "Suitable for: guinea pigs" },
      { zh: "展示狀態：待接入實際商品資料", en: "Display status: awaiting live product data" },
    ],
    price: 98,
    inStock: false,
    metadata: { demo: "true", demo_category: "small-pets" },
    tags: ["小寵物", "天竺鼠", "營養保健", "demo"],
  },
  {
    id: "demo-small-pet-bedding",
    categorySlug: "small-pets",
    icon: "cleaning",
    image: "catalog-placeholder",
    name: {
      zh: "小寵物天然紙棉墊材 示範商品",
      en: "Natural Paper Bedding for Small Pets — Demo",
    },
    description: {
      zh: "柔軟潔淨的居住墊材示範，適合倉鼠、兔子及其他小寵物。",
      en: "Soft, clean bedding demo suitable for hamsters, rabbits and other small pets.",
    },
    specs: [
      { zh: "適用：倉鼠、兔子及小寵物", en: "Suitable for: hamsters, rabbits and small pets" },
      { zh: "展示狀態：待接入實際商品資料", en: "Display status: awaiting live product data" },
    ],
    price: 78,
    inStock: false,
    metadata: { demo: "true", demo_category: "small-pets" },
    tags: ["小寵物", "墊材", "居家用品", "demo"],
  },
];
