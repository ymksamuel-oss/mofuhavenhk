import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { canonicalCatalogFields } from "../shared/productCatalog";

for (const product of stripeProductsSnapshot) {
  const assignment = canonicalCatalogFields(product);
  if (assignment.sub_category === "cat-wet-food" && !/(罐罐|罐頭|濕糧|濕食|鮮肉杯|wet|canned)/i.test(product.name)) {
    console.log(JSON.stringify({ name: product.name, description: product.description, metadata: product.metadata }));
  }
}
