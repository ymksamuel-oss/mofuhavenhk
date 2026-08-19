import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { filterCatalogProducts } from "../shared/productCatalog";

const results = filterCatalogProducts(stripeProductsSnapshot, "all", "罐罐");
console.log("results", results.length);
for (const product of results) {
  const haystack = [product.name, product.description ?? "", ...Object.entries(product.metadata).map(([key, value]) => `${key}:${value}`)].join(" ");
  const matched = ["罐罐", "罐頭", "主食罐", "副食罐", "濕糧", "濕食", "濕罐"].filter((term) => haystack.includes(term));
  console.log(JSON.stringify({ name: product.name, matched, category: product.metadata.category, legacy: { SubCategory: product.metadata.SubCategory, child_category: product.metadata.child_category, type: product.metadata.type, subcategory: product.metadata.subcategory } }));
}
