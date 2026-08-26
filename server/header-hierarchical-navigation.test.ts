import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("hierarchical header category navigation", () => {
  it("shares the six requested primary groups across desktop and mobile without a header all-products button", () => {
    const header = source("src/components/Header.tsx");
    const submenu = source("src/components/CategoryDropdown.tsx");

    expect(header).toContain("HEADER_MENU_GROUPS");
    expect(header).toContain("HEADER_MENU_LABEL_KEY");
    expect(header).toContain("HEADER_MENU_GROUPS.map((group)");
    expect(header).toContain("mobileCategoryOpen");
    expect(header).toContain('setMobileCategoryOpen((open) => (open === group ? null : group))');
    expect(header).toContain('<CategorySubmenu group={group} onNavigate={() => setDesktopCategoryOpen(null)} />');
    expect(header).toContain('onPointerDown={(event) => {');
    expect(header).toContain('event.stopPropagation();');
    expect(header).toContain('onClick={() => setDesktopCategoryOpen(group)}');
    expect(header).toContain('className="relative -mb-3 pb-3"');
    expect(header).toContain('sticky top-0 z-[60]');
    expect(submenu).toContain('hover:bg-[#f1ded1]');
    expect(submenu).toContain('group-hover:text-[#583827]');
    expect(header).not.toContain('<Link href="/menu"');
    expect(header).not.toContain("CategoryDropdownContent");

    expect(submenu).toContain('"cats"');
    expect(submenu).toContain('"dogs"');
    expect(submenu).toContain('"small-pets"');
    expect(submenu).toContain('"lifestyle"');
    expect(submenu).toContain('"explore"');
    expect(submenu).toContain('"shopping"');
  });

  it("lists all requested product, exploration and shopping destinations without generic all-products routes", () => {
    const submenu = source("src/components/CategoryDropdown.tsx");

    [
      "/categories/cats/wet-cans",
      "/categories/cats/snacks",
      "/categories/cats/freeze-dried",
      "/categories/cats/litter",
      "/categories/cats/toys-climbing",
      "/categories/dogs/dry-food",
      "/categories/dogs/wet-cans",
      "/categories/dogs/freeze-dried",
      "/categories/dogs/snacks",
      "/categories/dogs/toilet-pads",
      "/categories/dogs/toys",
      "/categories/small-pets/rabbits",
      "/categories/small-pets/hamsters-gerbils",
      "/categories/small-pets/guinea-pigs-chinchillas",
      "/categories/small-pets/food-treats",
      "/categories/small-pets/hay-bedding",
      "/categories/small-pets/habitats",
      "/categories/small-pets/toys-health",
      "/categories/lifestyle/feeding",
      "/categories/lifestyle/beds-home",
      "/categories/lifestyle/outdoor-travel",
      "/categories/lifestyle/cleaning-odour",
      "/categories/lifestyle/grooming",
      "/categories/lifestyle/training-safety",
      "/categories/lifestyle/storage-accessories",
      "/cat-breeds",
      "/cat-breeds?animal=dogs",
      "/categories/small-pets",
      "/shipping-policy",
      "/returns",
      "/terms",
    ].forEach((href) => expect(submenu).toContain(`href: "${href}"`));

    expect(submenu).not.toContain('href: "/menu"');
    expect(submenu).not.toContain("navCategoriesAllCats");
    expect(submenu).not.toContain("navCategoriesAllDogs");
  });
});
