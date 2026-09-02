import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = () =>
  readFileSync(resolve(process.cwd(), "src/lib/catalog-server.ts"), "utf8");

describe("Supabase catalog image selection", () => {
  it("selects the verified images array column from products", () => {
    const catalogServer = source();

    expect(catalogServer).toContain(
      '.select("id,name,price,original_price,stock,description,images,category_id,created_at,is_published,mofu_sku,status,source_product_id,source_price_id")',
    );
    expect(catalogServer).toContain("const dbImages = databaseProductImageUrls(row);");
    expect(catalogServer).toContain("image: images[0] || CATALOG_IMAGE_FALLBACK");
  });
});
