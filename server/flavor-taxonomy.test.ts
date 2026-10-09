import { describe, expect, it } from "vitest";
import { FLAVOR_TAXONOMY, matchesFlavorTaxonomy } from "../src/lib/flavor-taxonomy";

describe("flavor taxonomy", () => {
  it("covers Japanese and traditional Chinese chicken terms", () => {
    expect(matchesFlavorTaxonomy("CHICKEN", "国産ささみ砂肝")).toBe(true);
    expect(matchesFlavorTaxonomy("CHICKEN", "雞冠軟骨")).toBe(true);
  });

  it("recognizes detailed beef, horse, pork and fish terms", () => {
    expect(matchesFlavorTaxonomy("BEEF", "牛アキレス牛ハツ")).toBe(true);
    expect(matchesFlavorTaxonomy("HORSE", "馬蹄筋")).toBe(true);
    expect(matchesFlavorTaxonomy("PORK", "豬耳豚足")).toBe(true);
    expect(matchesFlavorTaxonomy("FISH", "北海道ホタテ鱧")).toBe(true);
  });

  it("does not classify Kagoshima place names as deer", () => {
    expect(matchesFlavorTaxonomy("DEER", "鹿兒島產黑豚豬耳")).toBe(false);
    expect(matchesFlavorTaxonomy("DEER", "北海道蝦夷鹿肉")).toBe(true);
  });

  it("exports the required taxonomy keys", () => {
    expect(Object.keys(FLAVOR_TAXONOMY)).toEqual(["CHICKEN", "BEEF", "HORSE", "DEER", "PORK", "FISH", "LAMB"]);
  });
});
