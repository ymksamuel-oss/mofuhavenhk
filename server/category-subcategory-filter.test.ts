import { describe, expect, it } from "vitest";
import {
  getCatProductsBySubcategory,
  getDogProductsBySubcategory,
  type Product,
} from "../src/lib/products";

const products: Product[] = [
  {
    id: "cat-dry-food",
    categorySlug: "cats",
    subcategory: "貓乾糧",
    image: "/cat-dry.jpg",
    name: { zh: "貓乾糧", en: "Cat dry food" },
    price: 30,
    icon: "cat",
  },
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
    id: "dog-food",
    categorySlug: "dogs",
    subcategory: "狗狗食品",
    image: "/dog-food.jpg",
    name: { zh: "狗狗食品", en: "Dog food" },
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
];

describe("strict category subcategory filtering", () => {
  it("shows only cat dry food on the cat dry-food route", () => {
    expect(getCatProductsBySubcategory("貓乾糧", null, products).map((product) => product.id)).toEqual([
      "cat-dry-food",
    ]);
  });

  it("shows only cat wet cans on the cat wet-cans route", () => {
    expect(getCatProductsBySubcategory("貓罐罐", null, products).map((product) => product.id)).toEqual([
      "cat-wet-cans",
    ]);
  });

  it("shows only dog food on the dog food route", () => {
    expect(getDogProductsBySubcategory("狗狗食品", products).map((product) => product.id)).toEqual([
      "dog-food",
    ]);
  });

  it("shows only dog treats on the dog snacks route", () => {
    expect(getDogProductsBySubcategory("狗狗小食", products).map((product) => product.id)).toEqual([
      "dog-treats",
    ]);
  });
});
