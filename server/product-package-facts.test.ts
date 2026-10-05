import { describe, expect, it } from "vitest";
import { parseProductPackageFacts } from "@/lib/product-package-facts";
import { productSpecifications } from "@/lib/product-content";
import type { Product } from "@/lib/products";

describe("product package facts", () => {
  it("splits package specifications and guaranteed analysis embedded in backend copy", () => {
    const facts = parseProductPackageFacts({
      description: [
        "【📋 產品規格與保證營養】",
        "・品名：ささみ花ふりかけ ｜ 原產地：日本（国産 Made in Japan）",
        "・淨重規格：20g（附保鮮密封夾鏈） ｜ 條碼 (JAN)：4976064015716",
        "・成分：100% 日本國產雞里肌肉（鶏ささみ）",
        "・保證分析值：粗蛋白質 65.0% 以上、粗脂肪 3.0% 以上、粗纖維 0.5% 以下、粗灰分 5.0% 以下、水分 28.0% 以下",
        "・熱量：約 284 kcal / 100g",
        "・保存方法：置於乾燥陰涼處，開封後請排出空氣封緊夾鏈，建議冷藏保存。",
      ].join("\n"),
      specifications: ["淨重規格：20g", "條碼：4976064015716"],
      fallbackJan: "4976064015716",
      locale: "zh",
    });

    expect(facts.map(({ key }) => key)).toEqual([
      "ingredients", "origin", "protein", "fat", "fiber", "ash", "moisture", "calories", "netWeight", "storage", "jan",
    ]);
    expect(facts.find(({ key }) => key === "ingredients")?.value).toContain("雞里肌肉");
    expect(facts.find(({ key }) => key === "origin")?.value).toContain("日本");
    expect(facts.find(({ key }) => key === "protein")?.value).toBe("65.0% 以上");
    expect(facts.find(({ key }) => key === "fat")?.value).toBe("3.0% 以上");
    expect(facts.find(({ key }) => key === "fiber")?.value).toBe("0.5% 以下");
    expect(facts.find(({ key }) => key === "ash")?.value).toBe("5.0% 以下");
    expect(facts.find(({ key }) => key === "moisture")?.value).toBe("28.0% 以下");
    expect(facts.find(({ key }) => key === "calories")?.value).toContain("284 kcal");
    expect(facts.find(({ key }) => key === "netWeight")?.value).toContain("20g");
    expect(facts.find(({ key }) => key === "storage")?.value).toContain("冷藏保存");
    expect(facts.find(({ key }) => key === "jan")?.value).toBe("4976064015716");
  });

  it("does not fabricate absent analysis values and never leaves a barcode as a standalone fact", () => {
    const facts = parseProductPackageFacts({
      description: "原材料：鶏ささみ\n規格：20g",
      specifications: [],
      fallbackJan: "4976064015716",
      locale: "zh",
    });

    expect(facts.map(({ key }) => key)).toEqual(["ingredients", "netWeight", "jan"]);
    expect(facts.some(({ key }) => key === "protein")).toBe(false);
  });

  it("carries a database product_spec value into the net-weight fact", () => {
    const specifications = productSpecifications(
      { productSpec: "20g" } as unknown as Product,
      "4976064015716",
      "zh",
    );
    const facts = parseProductPackageFacts({
      description: "",
      specifications,
      fallbackJan: "4976064015716",
      locale: "zh",
    });

    expect(facts.find(({ key }) => key === "netWeight")?.value).toBe("20g");
    expect(facts.find(({ key }) => key === "jan")?.value).toBe("4976064015716");
  });
});
