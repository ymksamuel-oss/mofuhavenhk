import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("hierarchical header category navigation", () => {
  it("uses the requested cat and dog primary navigation without an all-products button", () => {
    const header = source("src/components/Header.tsx");

    expect(header).toContain('import { CategorySubmenu, type CategoryMenuGroup }');
    expect(header).toContain('(["cats", "dogs"] as const).map((group)');
    expect(header).toContain('group === "cats" ? t("navHeaderCats") : t("navHeaderDogs")');
    expect(header).toContain('<CategorySubmenu group={group} onNavigate={() => setDesktopCategoryOpen(null)} />');
    expect(header).toContain('onClick={() => setDesktopCategoryOpen(group)}');
    expect(header).toContain("mobileCategoryOpen");
    expect(header).toContain('setMobileCategoryOpen((open) => (open === group ? null : group))');
    expect(header).not.toContain('<Link href="/menu"');
    expect(header).not.toContain("CategoryDropdownContent");
  });

  it("uses only the requested vertical subcategory links for each pet group", () => {
    const submenu = source("src/components/CategoryDropdown.tsx");

    expect(submenu).toContain('href: "/categories/cats/wet-cans"');
    expect(submenu).toContain('href: "/categories/cats/snacks"');
    expect(submenu).toContain('href: "/categories/cats/freeze-dried"');
    expect(submenu).toContain('href: "/categories/cats/litter"');
    expect(submenu).toContain('href: "/categories/cats/toys-climbing"');
    expect(submenu).toContain('href: "/categories/dogs/dry-food"');
    expect(submenu).toContain('href: "/categories/dogs/wet-cans"');
    expect(submenu).toContain('href: "/categories/dogs/freeze-dried"');
    expect(submenu).toContain('href: "/categories/dogs/snacks"');
    expect(submenu).toContain('href: "/categories/dogs/toilet-pads"');
    expect(submenu).toContain('href: "/categories/dogs/toys"');
    expect(submenu).not.toContain('href: "/menu"');
    expect(submenu).not.toContain("navCategoriesAllCats");
    expect(submenu).not.toContain("navCategoriesAllDogs");
  });
});
