"use client";

import { ExploreCatBreedGallery } from "@/components/about/ExploreCatBreedGallery";
import { ExploreDogBreedGallery } from "@/components/about/ExploreDogBreedGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type AnimalTab = "cats" | "dogs";
export type DogCoatFilter = "all" | "short" | "long";

export function ExplorePetWorldGallery({
  animal,
  dogCoat,
}: {
  animal: AnimalTab;
  dogCoat: DogCoatFilter;
}) {
  const { t } = useI18n();

  return (
    <div id="pet-breed-guide" className="mt-10">
      <p className="mb-4 text-sm font-semibold text-[#2B2623]/65">{t("petGuideFilterLabel")}</p>
      {animal === "cats" ? <ExploreCatBreedGallery /> : <ExploreDogBreedGallery coatFilter={dogCoat} />}
    </div>
  );
}
