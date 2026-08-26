import { describe, expect, it } from "vitest";
import {
  getCatProductLifeStage,
  getCatProductsByLifeStage,
  resolveCatLifeStageSlug,
  type Product,
} from "../src/lib/products";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const products: Product[] = [
  {
    id: "kitten-dry",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    image: "/kitten.jpg",
    name: { zh: "幼貓雞肉乾糧", en: "Kitten chicken dry food" },
    price: 30,
    icon: "cat",
    metadata: { life_stage: "kitten" },
  },
  {
    id: "adult-dry",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    image: "/adult.jpg",
    name: { zh: "室內成貓雞肉乾糧", en: "Indoor adult cat chicken dry food" },
    price: 30,
    icon: "cat",
  },
  {
    id: "senior-wet",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    image: "/senior.jpg",
    name: { zh: "11歲以上高齡貓濕糧", en: "Senior cat wet food" },
    price: 30,
    icon: "cat",
  },
  {
    id: "age-unspecified-snack",
    categorySlug: "cats",
    subcategory: "貓貓小食",
    image: "/snack.jpg",
    name: { zh: "鮪魚小食", en: "Tuna treat" },
    price: 30,
    icon: "cat",
  },
  {
    id: "dog-senior",
    categorySlug: "dogs",
    subcategory: "狗狗乾糧",
    image: "/dog.jpg",
    name: { zh: "高齡犬乾糧", en: "Senior dog food" },
    price: 30,
    icon: "dog",
  },
];

describe("direct cat life-stage navigation", () => {
  it("resolves only the three direct life-stage route slugs", () => {
    expect(resolveCatLifeStageSlug("kitten")).toBe("kitten");
    expect(resolveCatLifeStageSlug("adult")).toBe("adult");
    expect(resolveCatLifeStageSlug("senior")).toBe("senior");
    expect(resolveCatLifeStageSlug("dry-food")).toBeNull();
  });

  it("assigns products only from explicit Stripe stage metadata or verified wording", () => {
    expect(getCatProductLifeStage(products[0])).toBe("kitten");
    expect(getCatProductLifeStage(products[1])).toBe("adult");
    expect(getCatProductLifeStage(products[2])).toBe("senior");
    expect(getCatProductLifeStage(products[3])).toBeNull();
  });

  it("keeps the direct kitten, adult and senior collections strict", () => {
    expect(getCatProductsByLifeStage("kitten", products).map((product) => product.id)).toEqual(["kitten-dry"]);
    expect(getCatProductsByLifeStage("adult", products).map((product) => product.id)).toEqual(["adult-dry"]);
    expect(getCatProductsByLifeStage("senior", products).map((product) => product.id)).toEqual(["senior-wet"]);
  });

  it("lists direct cat categories in the Header without nesting age stages under dry food", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/CategoryDropdown.tsx"), "utf8");
    expect(source).toContain('href: "/categories/cats/dry-food", label: t("catDirectDryFood")');
    expect(source).toContain('href: "/categories/cats/kitten", label: t("catDirectKitten")');
    expect(source).toContain('href: "/categories/cats/adult", label: t("catDirectAdult")');
    expect(source).toContain('href: "/categories/cats/senior", label: t("catDirectSenior")');
    expect(source).toContain('href: "/categories/cats/snacks", label: t("catDirectTreats")');
  });
});
