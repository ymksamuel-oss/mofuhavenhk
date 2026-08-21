import { parseProductCatalogCsv, productRecordsToProducts } from "@/lib/catalog-overrides";
import {
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  getProductsByCategory,
  type Product,
} from "@/lib/products";

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
    categorySlug: "cats",
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

console.log("Product catalog validation passed: canonical metadata category wins safely.");
