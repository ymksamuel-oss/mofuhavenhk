import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("storefront static asset routing", () => {
  it("serves persistent storefront assets ahead of the SPA rewrite", () => {
    const config = JSON.parse(source("vercel.json"));
    expect(config.rewrites).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "/assets/:asset*", destination: "/api/asset?asset=:asset*" }),
    ]));
  });

  it("routes recovered product images through the controlled asset endpoint", () => {
    const assetHandler = source("api/asset.js");
    expect(assetHandler).toContain("recoveredProductImageStorageMap");
    expect(assetHandler).toContain('requested.startsWith("product/")');
  });

  it("uses the Vercel-compatible asset route instead of unresolved Manus-relative image paths", () => {
    const imageComponents = [
      "client/src/components/Header.tsx",
      "client/src/components/Footer.tsx",
      "client/src/components/HeroBanner.tsx",
      "client/src/components/SubBanner.tsx",
      "client/src/components/ProductGrid.tsx",
      "client/src/components/CartDrawer.tsx",
      "client/src/pages/Home.tsx",
    ].map(source).join("\n");

    expect(imageComponents).toContain('"/assets/');
    expect(imageComponents).not.toContain('src="/manus-storage/');
    expect(imageComponents).not.toContain('= "/manus-storage/');
  });
});
