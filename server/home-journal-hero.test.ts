import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const component = readFileSync(resolve(process.cwd(), "src/components/home/HomeJournalHero.tsx"), "utf8");

describe("homepage journal hero product grid", () => {
  it("keeps nine configured product slots in every issue", () => {
    const pickBlocks = [...component.matchAll(/picks:\s*\[([\s\S]*?)\n\s{4}\],/g)];

    expect(pickBlocks).toHaveLength(3);
    for (const [, picks] of pickBlocks) {
      expect(picks.match(/\{ sku:/g)).toHaveLength(9);
    }
  });

  it("renders a three-column grid with a stable minimum height and missing-product fallback", () => {
    expect(component).toContain("grid min-h-[320px]");
    expect(component).toContain("grid-cols-3");
    expect(component).toContain("md:min-h-[360px]");
    expect(component).toContain("issue.picks.map((pick) => ({");
    expect(component).toContain("product: productMap.get(pick.sku) ?? null");
    expect(component).toContain('product?.image ?? "catalog-placeholder"');
    expect(component).toContain("role=\"group\"");
    expect(component).not.toContain("issue.picks.flatMap");
  });
});
