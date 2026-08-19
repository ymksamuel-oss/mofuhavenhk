import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("homepage milk-tea UI and horizontal category scrolling", () => {
  it("keeps the homepage category rows single-line and touch-scrollable", () => {
    const categoryGrid = readProjectFile("client/src/components/CategoryGrid.tsx");

    expect(categoryGrid).toContain('aria-label="主分類" role="region" tabIndex={0}');
    expect(categoryGrid).toContain('aria-label="子分類" role="region" tabIndex={0}');
    expect(categoryGrid.match(/className="horizontal-scroll/g)?.length).toBe(2);
    expect(categoryGrid).toContain("flex-nowrap");
    expect(readProjectFile("client/src/index.css")).toContain("touch-action: pan-x;");
    expect(readProjectFile("client/src/index.css")).toContain("-webkit-overflow-scrolling: touch;");
  });

  it("uses one warm milky-beige background language across the storefront", () => {
    const css = readProjectFile("client/src/index.css");
    const home = readProjectFile("client/src/pages/Home.tsx");
    const categoryGrid = readProjectFile("client/src/components/CategoryGrid.tsx");
    const productGrid = readProjectFile("client/src/components/ProductGrid.tsx");
    const footer = readProjectFile("client/src/components/Footer.tsx");

    expect(css).toContain("--background: #F3E5D5;");
    expect(css).toContain("background-color: #F3E5D5;");
    expect(css).toContain("background-image: none;");
    expect(home).toContain("bg-[#F3E5D5]");
    expect(categoryGrid).toContain("bg-[#F3E5D5]");
    expect(productGrid).toContain("bg-[#F3E5D5]");
    expect(footer).toContain("bg-[#F3E5D5]");
  });

  it("keeps search, category pills, and product cards on clean light surfaces", () => {
    const categoryGrid = readProjectFile("client/src/components/CategoryGrid.tsx");
    const productGrid = readProjectFile("client/src/components/ProductGrid.tsx");

    expect(categoryGrid).toContain("bg-white/95");
    expect(categoryGrid).toContain("bg-white/90");
    expect(productGrid).toContain("bg-white/95");
    expect(productGrid).toContain("bg-white/90");
    expect(productGrid).toContain("bg-white/75");
  });
});
