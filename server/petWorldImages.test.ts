import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { catBreedGuides } from "../shared/petWorld";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("pet world real photos and multi-image carousel", () => {
  it("uses Vercel-compatible controlled image paths for all verified cat photos", () => {
    expect(catBreedGuides).toHaveLength(12);
    for (const breed of catBreedGuides) {
      if (breed.images.length > 0) {
        for (const imgUrl of breed.images) {
          expect(imgUrl.startsWith("/assets/pet/")).toBe(true);
        }
      }
    }
  });

  it("maps every verified Pet World image through the Vercel asset handler", () => {
    const assetHandler = readProjectFile("api/asset.js");
    for (const breed of catBreedGuides) {
      for (const imageUrl of breed.images) {
        expect(assetHandler).toContain(imageUrl.replace("/assets/pet/", ""));
      }
    }
  });

  it("keeps the corrected breeds bound to their own verified image and Commons source", () => {
    const corrected = {
      "俄羅斯藍貓": ["/assets/pet/russian-blue-verified.jpg", "File:Cat_Russian_Blue_02.jpg"],
      "波斯貓": ["/assets/pet/persian-verified.jpg", "File:Fluffy_White_Persian_Cat.jpg"],
      "孟加拉貓": ["/assets/pet/bengal-verified.jpg", "File:A_Bengal_Cat_(cropped).jpg"],
      "挪威森林貓": ["/assets/pet/norwegian-forest-verified.jpg", "File:Norwegian_forest_cat.jpg"],
      "斯芬克斯貓": ["/assets/pet/sphynx-verified.jpg", "File:Sphynx_-_cat._img_031.jpg"],
      "阿比西尼亞貓": ["/assets/pet/abyssinian-verified.jpg", "File:Abyssinian_cat_-_Patricia.jpg"],
    } as const;

    for (const [name, [image, source]] of Object.entries(corrected)) {
      const breed = catBreedGuides.find((guide) => guide.name === name);
      expect(breed).toMatchObject({ image, images: [image], isRealPhoto: true });
      expect(breed?.sourceUrl).toContain(source);
      expect(breed?.photoCredit).toContain("Wikimedia Commons");
    }
  });

  it("provides six controlled, non-repeating photos for British Shorthair, American Shorthair and Ragdoll cats", () => {
    for (const name of ["英國短毛貓", "美國短毛貓", "布偶貓"]) {
      const breed = catBreedGuides.find((guide) => guide.name === name);
      expect(breed?.images).toHaveLength(6);
      expect(new Set(breed?.images).size).toBe(6);
      expect(breed?.image).toBe(breed?.images[0]);
      expect(breed?.sourceUrl).toBeUndefined();
      expect(breed?.photoCredit).toContain("Wikimedia Commons");
    }
  });

  it("does not reuse any primary breed photo for a different cat breed", () => {
    const primaryImages = catBreedGuides.map((breed) => breed.image);
    expect(new Set(primaryImages).size).toBe(catBreedGuides.length);
  });

  it("includes multi-image carousel container and pagination dots in PetWorld.tsx", () => {
    const petWorldCode = readProjectFile("client/src/pages/PetWorld.tsx");
    expect(petWorldCode).toContain("relative aspect-[4/3] w-full overflow-hidden bg-[#FFFDF9]");
    expect(petWorldCode).toContain("horizontal-scroll flex w-full gap-2 overflow-x-auto border-t border-[#B88A58]/15 bg-[#FFFDF9] jp-card-shadow p-2.5");
    expect(petWorldCode).toContain("activeImgIndex + 1} / {images.length}");
    expect(petWorldCode).toContain("圖片授權：{breed.photoCredit}");
    expect(petWorldCode).not.toContain("href={breed.sourceUrl}");
    expect(petWorldCode).not.toContain("暫未找到可核對的真實品種相片");
    expect(petWorldCode).toContain("const handlePrimaryImageError");
    expect(petWorldCode).toContain('retryUrl.searchParams.set("pet-image-retry"');
    expect(petWorldCode).toContain("handlePrimaryImageError(breed.name, event)");
  });
});
