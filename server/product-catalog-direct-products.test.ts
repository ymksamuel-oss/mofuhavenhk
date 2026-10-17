import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type SnapshotProduct = {
  id: string;
  image_url?: unknown;
};

type CatalogSnapshot = {
  products: SnapshotProduct[];
};

const projectRoot = process.cwd();
const source = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");
const snapshot = JSON.parse(
  source("src/data/catalog-fallback.json"),
) as CatalogSnapshot;

describe("static catalog product images", () => {
  it("uses the bundled 251-product snapshot as the storefront catalog", () => {
    const productCatalog = source("src/components/menu/ProductCatalog.tsx");
    const fallbackMapper = source("src/lib/catalog-fallback.ts");

    expect(productCatalog).toContain(
      "const { products: catalogProducts, categories } = useCatalog();",
    );
    expect(productCatalog).toContain(
      'const storefrontProducts = collectionSlug === "value-bundles"',
    );
    expect(productCatalog).toContain(
      "getCollectionProducts(storefrontProducts, collection)",
    );
    expect(fallbackMapper).toContain('source: "static"');
    expect(snapshot.products).toHaveLength(251);
    expect(new Set(snapshot.products.map((product) => product.id)).size).toBe(251);
  });

  it("uses same-origin image paths that exist in public and never requires Supabase Storage", () => {
    const imagePaths = snapshot.products
      .map((product) => product.image_url)
      .filter((image): image is string => typeof image === "string" && image.length > 0);

    expect(imagePaths.length).toBeGreaterThan(0);
    expect(imagePaths.every((image) => image.startsWith("/images/"))).toBe(true);
    expect(imagePaths.some((image) => image.startsWith("/images/products/"))).toBe(true);
    expect(imagePaths.some((image) => /supabase\.co/i.test(image))).toBe(false);

    for (const image of imagePaths) {
      expect(
        existsSync(resolve(projectRoot, "public", image.slice(1))),
        `missing public image: ${image}`,
      ).toBe(true);
    }
  });

  it("normalizes snapshot images and renders a local placeholder when a source is absent or fails", () => {
    const fallbackMapper = source("src/lib/catalog-fallback.ts");
    const imageComponent = source("src/components/product/ProductImage.tsx");
    const recommendations = source("src/components/recommendations/YouMayAlsoLike.tsx");

    expect(fallbackMapper).toContain("normalizeProductImageUrl(row.image_url)");
    expect(fallbackMapper).toContain("image: imageUrl ?? CATALOG_IMAGE_FALLBACK");
    expect(fallbackMapper).toContain("...(imageUrl ? { images: [imageUrl] } : {})");
    expect(imageComponent).toContain(".map(normalizeProductImageUrl)");
    expect(imageComponent).toContain("Array.isArray(src) ? src : [src]");
    expect(imageComponent).toContain('src="/images/catalog-placeholder.svg"');
    expect(imageComponent).toContain("onError={handleImageError}");
    expect(imageComponent).not.toContain("setTimeout");
    expect(recommendations).toContain("product.images?.length ? product.images : [product.image");
    expect(
      existsSync(resolve(projectRoot, "public/images/catalog-placeholder.svg")),
    ).toBe(true);
  });
});
