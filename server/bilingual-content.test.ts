import { describe, expect, it } from "vitest";
import { parseFeaturedPets } from "../src/lib/featured-pets";
import { buildCategoryTree, categoryDisplayName } from "../src/lib/store-categories";

describe("bilingual managed content", () => {
  it("uses the actual locale to resolve parent and child category labels", () => {
    const [cats] = buildCategoryTree([
      { id: "cats", name: "🐱貓貓專區", name_zh: "貓咪商品", name_en: "Cats", slug: "cats", parent_id: null },
      { id: "wet", name: "🐱貓貓罐頭", name_zh: "貓咪濕糧／罐頭", name_en: "Wet Food & Cans", slug: "wet-cans", parent_id: "cats" },
    ]);

    expect(categoryDisplayName(cats, "zh")).toBe("貓咪商品");
    expect(categoryDisplayName(cats, "en")).toBe("Cats");
    expect(categoryDisplayName(cats.children[0], "zh")).toBe("貓咪濕糧／罐頭");
    expect(categoryDisplayName(cats.children[0], "en")).toBe("Wet Food & Cans");
  });

  it("retains a safe label fallback when an English category name is not yet entered", () => {
    const [category] = buildCategoryTree([
      { id: "small-pets", name: "小寵物", name_zh: "小寵物", slug: "small-pets", parent_id: null },
    ]);
    expect(categoryDisplayName(category, "en")).toBe("小寵物");
  });

  it("preserves English gallery title and story fields from CMS settings", () => {
    const [pet] = parseFeaturedPets(JSON.stringify([{
      image_url: "https://images.example.com/cat.jpg",
      title: "午後小睡",
      title_en: "An Afternoon Nap",
      description: "暖陽裡的小小休息時光。",
      description_en: "A quiet pause in the warm afternoon sun.",
      sort_order: 1,
      is_published: true,
    }]));

    expect(pet.title_en).toBe("An Afternoon Nap");
    expect(pet.description_en).toBe("A quiet pause in the warm afternoon sun.");
  });
});
