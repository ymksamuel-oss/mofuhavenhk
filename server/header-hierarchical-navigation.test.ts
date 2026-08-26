import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("hierarchical header category navigation", () => {
  it("uses direct cat and dog top-level navigation instead of one combined mega-menu", () => {
    const header = source("src/components/Header.tsx");

    expect(header).toContain('import { CategorySubmenu, type CategoryMenuGroup }');
    expect(header).toContain('(["cats", "dogs"] as const).map((group)');
    expect(header).toContain('group === "cats" ? t("categoryCats") : t("categoryDogs")');
    expect(header).toContain('<CategorySubmenu group={group} onNavigate={() => setDesktopCategoryOpen(null)} />');
    expect(header).toContain('onClick={() => setDesktopCategoryOpen(group)}');
    expect(header).not.toContain("CategoryDropdownContent");
    expect(header).toContain("mobileCategoryOpen");
    expect(header).toContain('setMobileCategoryOpen((open) => (open === group ? null : group))');
  });

  it("keeps the direct vertical submenu links strictly scoped to the correct pet group", () => {
    const submenu = source("src/components/CategoryDropdown.tsx");

    expect(submenu).toContain('href: "/categories/cats/wet-cans"');
    expect(submenu).toContain('href: "/categories/cats/dry-food"');
    expect(submenu).toContain('href: "/categories/cats/freeze-dried"');
    expect(submenu).toContain('href: "/categories/cats/snacks"');
    expect(submenu).toContain('href: "/categories/cats/pill-treats"');
    expect(submenu).toContain('href: "/categories/dogs/food"');
    expect(submenu).toContain('href: "/categories/dogs/snacks"');
    expect(submenu).toContain('href: "/categories/dogs/pill-treats"');
    expect(submenu).toContain('min-w-56');
  });
});
