import { parseProductCatalogCsv, productRecordsToProducts } from "@/lib/catalog-overrides";

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

console.log("Product catalog validation passed: no static fallback catalog is present.");
