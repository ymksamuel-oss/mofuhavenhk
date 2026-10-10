import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const componentSource = readFileSync("src/components/home/HomeJournalHero.tsx", "utf8");
const issuePicks = [...componentSource.matchAll(/picks:\s*\[([\s\S]*?)\]/g)].map((match) => match[1]);

describe("homepage journal carousel based on dca07bd", () => {
  it("keeps three issues with nine configured products each (27 total)", () => {
    expect(issuePicks).toHaveLength(3);
    expect(issuePicks.map((picks) => (picks.match(/sku:/g) ?? []).length)).toEqual([9, 9, 9]);
  });

  it("preserves all nine product slots as skeletons when the catalog is empty", () => {
    expect(componentSource).toContain("issue.picks.map((pick) => ({");
    expect(componentSource).toContain("aria-busy={issueProducts[issueIndex].some(({ product }) => !product)}");
    expect(componentSource).toContain("product ? (");
    expect(componentSource).toContain("animate-pulse");
    expect(componentSource).not.toContain("bp-official-puppy-kitten-100-lineup.jpg");
  });

  it("keeps the original mobile product-first order, card sizing and touch swipe handlers", () => {
    expect(componentSource).toContain("relative order-1 col-span-12 min-w-0 md:order-1 md:col-span-7 md:px-10");
    expect(componentSource).toContain("order-2 z-10 col-span-12");
    expect(componentSource).toContain("onTouchStart={handleTouchStart}");
    expect(componentSource).toContain("onTouchEnd={handleTouchEnd}");
    expect(componentSource).toContain("max-w-[340px]");
    expect(componentSource).toContain("aspect-square");
    expect(componentSource).toContain("md:py-14 lg:py-8");
  });

  it("keeps full-width transform slides while compacting and anchoring desktop controls to the product column", () => {
    expect(componentSource).toContain("translateX(-${activeIssue * 100}%)");
    expect(componentSource).toContain("w-full min-w-full shrink-0");
    expect(componentSource).toContain("lg:min-h-[88px]");
    expect(componentSource).toContain("md:absolute md:left-0 md:top-1/2");
    expect(componentSource).toContain("md:absolute md:right-0 md:top-1/2");
    expect(componentSource).toContain("issueIndex === activeIssue &&");
    expect(componentSource).toContain("z-20 mt-4 flex items-center justify-center");
  });
});
