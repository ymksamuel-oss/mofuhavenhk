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

  it("keeps the Matcher and Care Match copy bound to locale keys", () => {
    const card = source("src/components/home/CareMatchCard.tsx");
    const header = source("src/components/matcher/MatcherPageHeader.tsx");
    const translations = source("src/lib/i18n/translations.ts");
    const wizard = source("src/components/matcher/PetMatcherWizard.tsx");
    expect(header).toContain('t("matcherHeroTitle")');
    expect(header).toContain('t("matcherHeroSubtitle")');
    expect(translations).toContain("Tailored Japanese Pet Essentials Matcher");
    expect(translations).toContain("Dealing with picky eaters, allergies, or dental care needs?");
    expect(card).toContain('t("careMatchEyebrow")');
    expect(card).toContain('t("careMatchTitle")');
    expect(card).toContain('t("careMatchSubtitle")');
    expect(card).toContain('t("careMatchCta")');
    expect(wizard).toContain('t("matcherFloatingCta")');
    expect(card).toContain('id="pet-matcher"');
    expect(card).toContain('href="/matcher"');
    expect(card).toContain("min-h-12");
  });

  it("exposes the dedicated matcher route as an auto-open matcher view", () => {
    const route = source("src/app/matcher/page.tsx");
    const wizard = source("src/components/matcher/PetMatcherWizard.tsx");
    expect(route).toContain('import { MatcherPageHeader } from "@/components/matcher/MatcherPageHeader"');
    expect(route).toContain('<MatcherPageHeader />');
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
