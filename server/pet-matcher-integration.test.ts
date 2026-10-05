import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("pet matcher homepage and navigation integration", () => {
  it("places the existing matcher entry below featured products and before the FAQ", () => {
    const home = source("src/app/page.tsx");
    expect(home).toContain('import { CareMatchCard } from "@/components/home/CareMatchCard"');
    expect(home.indexOf("<HomepageFeaturedShowcase products={products} />")).toBeLessThan(home.indexOf("<CareMatchCard />"));
    expect(home.indexOf("<CareMatchCard />")).toBeLessThan(home.indexOf("<FAQAccordion />"));
  });

  it("uses the requested Traditional Chinese copy and keeps the CTA touch-sized", () => {
    const card = source("src/components/home/CareMatchCard.tsx");
    expect(card).toContain("毛孩有挑食、過敏或潔齒需求？30秒為毛孩量身推薦日本天然原肉零食");
    expect(card).toContain("開始智能配對 ➔");
    expect(card).toContain('id="pet-matcher"');
    expect(card).toContain("min-h-12");
    expect(card).toContain('new Event("mofu:open-matcher")');
  });

  it("sends mobile and desktop Explore Pet World navigation to the auto-open matcher view", () => {
    const header = source("src/components/Header.tsx");
    const route = source("src/app/matcher/page.tsx");
    const wizard = source("src/components/matcher/PetMatcherWizard.tsx");
    expect(header).toContain('const matcherHref = "/matcher"');
    expect(header).toContain('href={matcherHref}');
    expect(route).toContain("autoOpen");
    expect(wizard).toContain("autoOpen = false");
    expect(wizard).toContain("useState(autoOpen)");
  });

  it("offers pet → breed → age/size → need, then one-tap product add-to-cart", () => {
    const wizard = source("src/components/matcher/PetMatcherWizard.tsx");
    expect(wizard).toContain("step === 2 ? Boolean(breed) : step === 3 ? Boolean(age !== null && size)");
    expect(wizard).toContain("step === 2 && pet ? <div className=\"mt-5\"><label htmlFor=\"pet-matcher-breed\"");
    expect(wizard).toContain("step === 3 ? <div className=\"mt-5 grid gap-3\"");
    expect(wizard).toContain("pet === \"cat\" ? CAT_SIZE_LABELS[size] : SIZE_LABELS[size]");
    expect(wizard).toContain("addItem(product.id)");
    expect(wizard).toContain("onClick={() => addOne(product)}");
    expect(wizard).toContain("min-h-11 min-w-[4.5rem]");
    expect(wizard).toContain("recommendations.map((product)");
  });
});
