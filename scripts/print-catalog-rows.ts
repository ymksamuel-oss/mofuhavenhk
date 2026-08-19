import { stripeProductsSnapshot } from "../shared/data/stripeProductsSnapshot";
import { normalizeProductCategories } from "../shared/productCatalog";

for (const product of stripeProductsSnapshot) {
  console.log([
    product.name,
    product.metadata.category ?? "",
    product.metadata.sub_category ?? "",
    product.metadata.subcategory_alt ?? "",
    normalizeProductCategories(product).join(","),
  ].join("\t"));
}
