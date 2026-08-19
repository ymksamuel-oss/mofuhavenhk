import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts, normalizeProductCategories } from "../shared/productCatalog";

const categories = ["all", "cats", "dogs", "treats", "wet-cans", "toys", "supplements", "small-pets", "deals", "bestsellers", "outdoor"] as const;
for (const category of categories) {
  const products = filterCatalogProducts(stripeProductsSnapshot, category);
  console.log(category, products.length);
}
const treats = filterCatalogProducts(stripeProductsSnapshot, "treats");
const dogs = filterCatalogProducts(stripeProductsSnapshot, "dogs");
console.log("treats∩dogs", treats.filter((product) => dogs.some((dog) => dog.id === product.id)).length);
console.log("treat samples");
for (const product of treats.slice(0, 20)) {
  console.log(JSON.stringify({ name: product.name, metadata: product.metadata, categories: normalizeProductCategories(product) }));
}
const likelyNonTreats = treats.filter((product) => !/(小食|零食|肉泥|燒鰹魚|糊仔|脆餅|餡餅|雞肉卷|脫水|treat|snack)/i.test([product.name, product.description ?? "", ...Object.values(product.metadata)].join(" ")));
console.log("likelyNonTreats", likelyNonTreats.length);
for (const product of likelyNonTreats.slice(0, 20)) console.log(JSON.stringify({ name: product.name, categories: normalizeProductCategories(product), metadata: product.metadata }));
console.log("dogsNotTreats");
for (const product of dogs.filter((product) => !treats.some((treat) => treat.id === product.id))) console.log(JSON.stringify({ name: product.name, categories: normalizeProductCategories(product), metadata: product.metadata }));
