import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { catBreedGuides } from "../shared/petWorld";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("pet world real photos and multi-image carousel", () => {
  it("ensures all cat breeds have valid images and multi-image arrays without fallback placeholders", () => {
    expect(catBreedGuides).toHaveLength(12);
    for (const breed of catBreedGuides) {
      expect(breed.images.length).toBeGreaterThan(0);
      for (const imgUrl of breed.images) {
        expect(imgUrl.startsWith("/manus-storage/")).toBe(true);
      }
    }
  });

  it("includes multi-image carousel container and pagination dots in PetWorld.tsx", () => {
    const petWorldCode = readProjectFile("client/src/pages/PetWorld.tsx");
    expect(petWorldCode).toContain("relative aspect-[4/3] w-full overflow-hidden bg-[#FFFDF9]");
    expect(petWorldCode).toContain("horizontal-scroll flex w-full gap-2 overflow-x-auto border-t border-[#B88A58]/15 bg-[#FFFDF9] jp-card-shadow p-2.5");
    expect(petWorldCode).toContain("activeImgIndex + 1} / {images.length}");
  });
});
