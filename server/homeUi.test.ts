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

    expect(css).toContain("--background: #F7F3EE;");
    expect(css).toContain("background-color: #F7F3EE;");
    expect(css).toContain("background-image: none;");
    expect(home).toContain("bg-[#F7F3EE]");
    expect(categoryGrid).toContain("bg-[#F7F3EE]");
    expect(productGrid).toContain("bg-[#F7F3EE]");
    expect(footer).toContain("bg-[#F7F3EE]");
  });

  it("keeps search, category pills, and product cards on clean light surfaces", () => {
    const categoryGrid = readProjectFile("client/src/components/CategoryGrid.tsx");
    const productGrid = readProjectFile("client/src/components/ProductGrid.tsx");

    expect(categoryGrid).toContain("bg-[#FFFDF9]");
    expect(productGrid).toContain("bg-[#FFFDF9]");
  });
});


describe("visual cleanup", () => {
  it("uses the single warm beige site background and white product surfaces", () => {
    const css = readProjectFile("client/src/index.css");
    const productGrid = readProjectFile("client/src/components/ProductGrid.tsx");
    const header = readProjectFile("client/src/components/Header.tsx");

    expect(css).toContain("--background: #F7F3EE;");
    expect(css).toContain("background-color: #F7F3EE;");
    expect(css).toContain("--card: #FFFDF9;");
    expect(productGrid).toContain("bg-[#FFFDF9]");
    expect(productGrid).toContain("jp-card-shadow");
    expect(header).toContain("bg-[#F7F3EE]");
  });

  it("hides only identifiable Manus branding overlays", () => {
    const css = readProjectFile("client/src/index.css");

    expect(css).toContain("#manus-badge");
    expect(css).toContain("#manus-watermark");
    expect(css).toContain("[data-manus-badge]");
    expect(css).toContain("display: none !important;");
  });
});
