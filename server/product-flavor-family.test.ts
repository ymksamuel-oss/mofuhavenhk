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

  it("matches the 15 restored single-pack products by their meat cuts", () => {
    const chickenTenderloin = meatProduct("4976064025791", "【航天級凍乾】日本國產原條凍乾雞里肌肉 4本入");
    const beefTendon = meatProduct("4976064025890", "天然無添加牛蹄筋／牛大筋 50g");
    const beefHoof = meatProduct("4976064025333", "天然原隻牛蹄磨牙骨 1隻入");
    const sharkSkin = meatProduct("4976064026392", "天然鯊魚皮終極耐咬潔齒皮棒 20g");
    const horseTendon = meatProduct("horse-tendon", "北海道馬蹄筋馬肉脆片");

    expect(getProductMeatFamily(chickenTenderloin)).toBe("CHICKEN");
    expect(productMatchesIngredient(chickenTenderloin, ["chicken"])).toBe(true);
    expect(getProductMeatFamily(beefTendon)).toBe("BEEF");
    expect(getProductMeatFamily(beefHoof)).toBe("BEEF");
    expect(productMatchesIngredient(beefTendon, ["beef"])).toBe(true);
    expect(productMatchesIngredient(beefHoof, ["beef"])).toBe(true);
    expect(getProductMeatFamily(sharkSkin)).toBe("FISH");
    expect(productMatchesIngredient(sharkSkin, ["seafood"])).toBe(true);
    expect(getProductMeatFamily(horseTendon)).toBe("HORSE");
    expect(productMatchesIngredient(horseTendon, ["horse"])).toBe(true);
  });

  it("does not classify Kagoshima as venison", () => {
    const kagoshimaPork = meatProduct("kagoshima", "鹿兒島黑豚大豬耳");
    expect(getProductMeatFamily(kagoshimaPork)).toBe("PORK");
    expect(productMatchesIngredient(kagoshimaPork, ["venison"])).toBe(false);
  });
});
