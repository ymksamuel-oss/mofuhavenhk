import {
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  type Product,
} from "@/lib/products";

const products: Product[] = [
  {
    id: "cat-wet",
    categorySlug: "snacks",
    taxonomyTerms: ["貓咪商品", "罐罐 / 濕糧"],
    image: "https://example.test/cat-wet.jpg",
    name: { zh: "貓罐", en: "Cat wet food" },
    price: 10,
    icon: "cat",
  },
  {
    id: "cat-natural",
    categorySlug: "snacks",
    taxonomyTerms: ["cats", "cat treats", "No-additive natural"],
    image: "https://example.test/cat-natural.jpg",
    name: { zh: "天然小食", en: "Natural treat" },
    price: 10,
    icon: "cat",
  },
  {
    id: "cat-hairball",
    categorySlug: "snacks",
    taxonomyTerms: ["貓咪", "貓貓小食", "去毛球配方"],
    image: "https://example.test/cat-hairball.jpg",
    name: { zh: "去毛球小食", en: "Hairball treat" },
    price: 10,
    icon: "cat",
  },
  {
    id: "dog-treat",
    categorySlug: "snacks",
    taxonomyTerms: ["dogs", "dog treats"],
    image: "https://example.test/dog-treat.jpg",
    name: { zh: "狗狗小食", en: "Dog treat" },
    price: 10,
    icon: "dog",
  },
];

function assertIds(actual: Product[], expected: string[], label: string) {
  const actualIds = actual.map((product) => product.id).sort();
  if (actualIds.join(",") !== expected.sort().join(",")) {
    throw new Error(`${label}: expected ${expected.join(",")}, received ${actualIds.join(",")}`);
  }
}

assertIds(getCatProductsBySubcategory("貓罐罐", null, products), ["cat-wet"], "cat wet food");
assertIds(getCatProductsBySubcategory("貓貓小食", "無添加天然系列", products), ["cat-natural"], "English series tag");
assertIds(getCatProductsBySubcategory("貓貓小食", "去毛球配方", products), ["cat-hairball"], "Chinese series tag");
assertIds(getDogProductsBySubcategory("狗狗小食", products), ["dog-treat"], "English dog tag");

console.log("Product taxonomy filtering validation passed.");
