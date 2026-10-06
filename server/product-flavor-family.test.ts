import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProductFlavorFamily,
  getProductMeatFamily,
  PRODUCT_FLAVOR_FAMILIES,
  type Product,
} from "../src/lib/products";
import { productMatchesIngredient } from "../src/components/menu/IngredientFilterPanel";

function meatProduct(id: string, nameZh: string, nameEn = ""): Product {
  return {
    id,
    name: { zh: nameZh, en: nameEn },
    tags: [],
    metadata: {},
  } as unknown as Product;
}
describe("verified product flavour families", () => {
  it("maps every product id to one unambiguous purchasable family", () => {
    const seenProductIds = new Set<string>();

    for (const family of PRODUCT_FLAVOR_FAMILIES) {
      expect(family.choices.length).toBeGreaterThan(1);
      for (const choice of family.choices) {
        expect(seenProductIds.has(choice.productId)).toBe(false);
        seenProductIds.add(choice.productId);
        expect(getProductFlavorFamily(choice.productId)).toBe(family);
      }
    }
  });

  it("passes the selected sibling product and its verified Stripe price to the basket", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/product/ProductDetail.tsx"),
      "utf8",
    );

    expect(source).toContain("const selectedProduct = selectedFamilyChoice?.product ?? product");
    expect(source).toContain("const selectedPriceId = selectedOption?.priceId ?? selectedProduct.priceId");
    expect(source).toContain("<AddToCartButton productId={selectedProduct.id} priceId={selectedPriceId}");
  });

  it("does not render imported informational specs as selectable product options", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/product/ProductDetail.tsx"),
      "utf8",
    );

    expect(source).toContain("getProductFlavorFamily");
    expect(source).toContain("selectedProduct.id");
    expect(source).not.toContain("product.specs?.length");
    expect(source).not.toContain("productSpecDefault");
  });

  it("classifies Kagoshima black pork as pork rather than venison", () => {
    const blackPork = meatProduct(
      "black-pork",
      "【鹿兒島產】黑豚原隻大豬耳特惠裝 5枚入",
      "Kagoshima Black Pork Whole Pig Ears 5pcs",
    );

    expect(getProductMeatFamily(blackPork)).toBe("PORK");
    expect(productMatchesIngredient(blackPork, ["pork"])).toBe(true);
  });

  it("keeps the pork filter exclusive to pork and never backfills lamb bones, horse, or venison", () => {
    const pork = meatProduct("pork", "鹿兒島黑豚豬耳");
    const lambBone = meatProduct("lamb", "天然羊骨磨牙棒");
    const horse = meatProduct("horse", "純馬肉乾");
    const venison = meatProduct("venison", "北海道野生鹿肉乾");
    const unclassified = meatProduct("unclassified", "天然肉骨零食");

    expect([lambBone, horse, venison, unclassified].filter((product) => productMatchesIngredient(product, ["pork"]))).toEqual([]);
    expect([pork, lambBone, horse, venison].filter((product) => productMatchesIngredient(product, ["pork"])).map((product) => product.id)).toEqual(["pork"]);
  });

  it("rejects mixed-protein titles instead of assigning them to either selected meat family", () => {
    const mixed = meatProduct("mixed", "豬肉＋馬肉雙拼零食");

    expect(getProductMeatFamily(mixed)).toBeNull();
    expect(productMatchesIngredient(mixed, ["pork"])).toBe(false);
    expect(productMatchesIngredient(mixed, ["horse"])).toBe(false);
  });
});
