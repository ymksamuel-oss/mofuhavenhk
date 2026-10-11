import { describe, expect, it } from "vitest";
import { categoryStaticParams, subcategoryStaticParams } from "../src/lib/category-route-params";
import type { StoreCategory } from "../src/lib/store-categories";

const categories: StoreCategory[] = [
  {
    id: "dogs",
    name: "Dogs",
    slug: "dogs",
    parent_id: null,
    children: [
      {
        id: "dog-treats",
        name: "Dog Treats",
        slug: "dog-treats",
        parent_id: "dogs",
        children: [],
      },
    ],
  },
];

describe("static category route parameters", () => {
  it("includes canonical, fallback, and database root categories once", () => {
    const slugs = categoryStaticParams(categories).map(({ slug }) => slug);
    expect(slugs).toContain("cats");
    expect(slugs).toContain("supplies");
    expect(slugs).toContain("dogs");
    expect(slugs.filter((slug) => slug === "dogs")).toHaveLength(1);
  });

  it("pairs subcategory slugs with their actual parent slugs", () => {
    expect(subcategoryStaticParams(categories)).toEqual([
      { slug: "dogs", sub: "dog-treats" },
    ]);
  });
});
