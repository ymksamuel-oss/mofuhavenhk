import { describe, expect, it } from "vitest";
import {
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  type Product,
} from "../src/lib/products";

const products: Product[] = [
  {
    id: "cat-wet-cans",
    categorySlug: "cats",
    subcategory: "貓罐罐",
    image: "/cat-wet.jpg",
    name: { zh: "貓罐罐", en: "Cat wet cans" },
    price: 30,
    icon: "cat",
  },
  {
    id: "cat-treats",
    categorySlug: "cats",
    subcategory: "貓貓小食",
    image: "/cat-treat.jpg",
    name: { zh: "貓咪小食", en: "Cat treats" },
    price: 30,
    icon: "cat",
  },
  {
    id: "cat-freeze-dried",
    categorySlug: "cats",
    subcategory: "冷凍脫水系列",
    image: "/cat-freeze.jpg",
    name: { zh: "貓咪凍乾", en: "Cat freeze-dried food" },
    price: 30,
    icon: "cat",
  },
  {
    id: "cat-litter",
    categorySlug: "cats",
    subcategory: "貓砂及貓砂盆",
    image: "/cat-litter.jpg",
    name: { zh: "貓砂", en: "Cat litter" },
    price: 30,
    icon: "cat",
  },
  {
    id: "cat-toys",
    categorySlug: "cats",
    subcategory: "貓咪玩具及攀爬設施",
    image: "/cat-toy.jpg",
    name: { zh: "貓咪玩具", en: "Cat toys" },
    price: 30,
    icon: "cat",
  },
  {
    id: "dog-dry-food",
    categorySlug: "dogs",
    subcategory: "狗狗乾糧",
    image: "/dog-dry.jpg",
    name: { zh: "狗狗乾糧", en: "Dog dry food" },
    price: 30,
    icon: "dog",
  },
  {
    id: "dog-wet-cans",
    categorySlug: "dogs",
    subcategory: "狗狗罐頭及濕糧",
    image: "/dog-wet.jpg",
    name: { zh: "狗狗罐頭", en: "Dog wet cans" },
    price: 30,
    icon: "dog",
  },
  {
    id: "dog-freeze-dried",
    categorySlug: "dogs",
    subcategory: "狗狗冷凍脫水食品",
    image: "/dog-freeze.jpg",
    name: { zh: "狗狗凍乾", en: "Dog freeze-dried food" },
    price: 30,
    icon: "dog",
  },
  {
    id: "dog-treats",
    categorySlug: "dogs",
    subcategory: "狗狗小食",
    image: "/dog-treat.jpg",
    name: { zh: "狗狗小食", en: "Dog treats" },
    price: 30,
    icon: "dog",
  },
  {
    id: "dog-toilet-pads",
    categorySlug: "dogs",
    subcategory: "狗狗廁所及尿墊",
    image: "/dog-pads.jpg",
    name: { zh: "狗狗尿墊", en: "Dog training pads" },
    price: 30,
    icon: "dog",
  },
  {
    id: "dog-toys",
    categorySlug: "dogs",
    subcategory: "狗狗玩具",
    image: "/dog-toy.jpg",
    name: { zh: "狗狗玩具", en: "Dog toys" },
    price: 30,
    icon: "dog",
  },
];

describe("strict category subcategory filtering", () => {
  it("shows only the selected cat shelf and never falls back to the broader catalog", () => {
    expect(getCatProductsBySubcategory("貓罐罐", null, products).map((product) => product.id)).toEqual([
      "cat-wet-cans",
    ]);
    expect(getCatProductsBySubcategory("貓砂及貓砂盆", null, products).map((product) => product.id)).toEqual([
      "cat-litter",
    ]);
    expect(getCatProductsBySubcategory("貓咪玩具及攀爬設施", null, products).map((product) => product.id)).toEqual([
      "cat-toys",
    ]);
  });

  it("keeps dog dry food, wet cans, freeze-dried food, treats, toilet supplies, and toys separate", () => {
    expect(getDogProductsBySubcategory("狗狗乾糧", products).map((product) => product.id)).toEqual([
      "dog-dry-food",
    ]);
    expect(getDogProductsBySubcategory("狗狗罐頭及濕糧", products).map((product) => product.id)).toEqual([
      "dog-wet-cans",
    ]);
    expect(getDogProductsBySubcategory("狗狗冷凍脫水食品", products).map((product) => product.id)).toEqual([
      "dog-freeze-dried",
    ]);
    expect(getDogProductsBySubcategory("狗狗小食", products).map((product) => product.id)).toEqual([
      "dog-treats",
    ]);
    expect(getDogProductsBySubcategory("狗狗廁所及尿墊", products).map((product) => product.id)).toEqual([
      "dog-toilet-pads",
    ]);
    expect(getDogProductsBySubcategory("狗狗玩具", products).map((product) => product.id)).toEqual([
      "dog-toys",
    ]);
  });
});
