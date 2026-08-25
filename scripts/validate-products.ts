import { parseProductCatalogCsv, productRecordsToProducts } from "@/lib/catalog-overrides";
import {
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  getProductsByCategory,
  type Product,
} from "@/lib/products";
import { buildOrderItemsFromLines } from "@/lib/order";
import { compareAtPriceFromMetadata } from "@/lib/compare-at-price";

const emptyCatalog = productRecordsToProducts(new Map());
if (emptyCatalog.length !== 0) {
  throw new Error("An empty catalog must remain empty");
}

let rejectedEmptySheet = false;
try {
  parseProductCatalogCsv("");
} catch {
  rejectedEmptySheet = true;
}
if (!rejectedEmptySheet) {
  throw new Error("An empty Google Sheet must not produce product data");
}

const stripeCategoryFixtures: Product[] = [
  {
    id: "cat-wet",
    metadata: { category: "貓罐罐" },
    categorySlug: "snacks",
    image: "https://example.com/cat-wet.jpg",
    name: { zh: "貓罐罐", en: "Cat wet food" },
    price: 10,
    icon: "cat",
  },
  {
    id: "dog-snack",
    metadata: { category: "狗狗小食" },
    categorySlug: "snacks",
    image: "https://example.com/dog-snack.jpg",
    name: { zh: "狗狗小食", en: "Dog snack" },
    price: 10,
    icon: "dog",
  },
  {
    id: "small-pet",
    metadata: { category: "小動物" },
    categorySlug: "small-pets",
    image: "https://example.com/small-pet.jpg",
    name: { zh: "小動物用品", en: "Small pet supply" },
    price: 10,
    icon: "bone",
  },
];

function assertIds(actual: Product[], expected: string[], label: string) {
  const ids = actual.map((product) => product.id);
  if (ids.join(",") !== expected.join(",")) {
    throw new Error(`${label}: expected ${expected.join(",")}, received ${ids.join(",")}`);
  }
}

assertIds(
  getProductsByCategory("cats", stripeCategoryFixtures),
  ["cat-wet"],
  "Cat category metadata filter",
);
assertIds(
  getProductsByCategory("dogs", stripeCategoryFixtures),
  ["dog-snack"],
  "Dog category metadata filter",
);
assertIds(
  getProductsByCategory("small-pets", stripeCategoryFixtures),
  ["small-pet"],
  "Small pet category metadata filter",
);
assertIds(
  getCatProductsBySubcategory("貓罐罐", null, stripeCategoryFixtures),
  ["cat-wet"],
  "Cat subcategory metadata filter",
);
assertIds(
  getDogProductsBySubcategory("狗狗小食", stripeCategoryFixtures),
  ["dog-snack"],
  "Dog subcategory metadata filter",
);

if (compareAtPriceFromMetadata({ compare_at_price_hkd: "120" }, 77.1) !== 120) {
  throw new Error("A valid metadata compare-at price must be available to storefront display");
}
if (compareAtPriceFromMetadata({ compare_at_price_hkd: "77.10" }, 77.1) !== undefined) {
  throw new Error("A compare-at price equal to the current price must remain hidden");
}
if (compareAtPriceFromMetadata({ compare_at_price_hkd: "0" }, 77.1) !== undefined) {
  throw new Error("The unset compare-at sentinel must remain hidden");
}
if (compareAtPriceFromMetadata({ compare_at_price_hkd: "invalid" }, 77.1) !== undefined) {
  throw new Error("Malformed compare-at metadata must remain hidden");
}

const priceProtectedFixture: Product = {
  id: "prod_retail_test",
  priceId: "price_retail_test_hkd",
  categorySlug: "snacks",
  icon: "bone",
  image: "catalog-placeholder",
  metadata: { image_pending: "true" },
  name: { zh: "雞胸肉 30g", en: "Chicken Breast 30g" },
  price: 77.1,
  inStock: true,
};
const rebuiltOrder = buildOrderItemsFromLines(
  [{ id: "prod_retail_test", qty: 2 }],
  [priceProtectedFixture],
);
if (rebuiltOrder.length !== 1 || rebuiltOrder[0].stripePriceId !== "price_retail_test_hkd") {
  throw new Error("Checkout order rebuild must retain the verified Stripe Price ID");
}

console.log("Product catalog validation passed: no static fallback catalog is present.");
