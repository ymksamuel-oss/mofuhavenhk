"use client";

import { useState } from "react";
import { ExploreCatBreedGallery } from "@/components/about/ExploreCatBreedGallery";
import { ExploreDogBreedGallery } from "@/components/about/ExploreDogBreedGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

type AnimalTab = "cats" | "dogs";
type DogCoatFilter = "all" | "short" | "long";

export function ExplorePetWorldGallery() {
  const { t } = useI18n();
  const [animal, setAnimal] = useState<AnimalTab>("cats");
  const [dogCoat, setDogCoat] = useState<DogCoatFilter>("all");

  const tabClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition sm:px-5 ${
      active
        ? "border-[#4B3621] bg-[#4B3621] text-white"
        : "border-[#4B3621]/18 bg-white/70 text-[#4B3621] hover:border-[#4B3621]/45 hover:bg-[#F7EFE8]"
    }`;

  return (
    <div id="pet-breed-guide" className="mt-10">
      <div className="mb-5 flex flex-wrap items-center gap-2 border-y border-[#2B2623]/10 py-4">
        <span className="mr-1 text-sm font-semibold text-[#2B2623]/65">{t("petGuideFilterLabel")}</span>
        <button type="button" className={tabClass(animal === "cats")} onClick={() => setAnimal("cats")}>
          {t("exploreCats")}
        </button>
        <button type="button" className={tabClass(animal === "dogs")} onClick={() => setAnimal("dogs")}>
          {t("exploreDogs")}
        </button>
        {animal === "dogs" && (
          <>
            <span className="mx-1 hidden h-5 w-px bg-[#2B2623]/15 sm:block" aria-hidden="true" />
            <button type="button" className={tabClass(dogCoat === "all")} onClick={() => setDogCoat("all")}>
              {t("allDogs")}
            </button>
            <button type="button" className={tabClass(dogCoat === "long")} onClick={() => setDogCoat("long")}>
              {t("longHairedDogs")}
            </button>
            <button type="button" className={tabClass(dogCoat === "short")} onClick={() => setDogCoat("short")}>
              {t("shortHairedDogs")}
            </button>
          </>
        )}
      </div>
      {animal === "cats" ? <ExploreCatBreedGallery /> : <ExploreDogBreedGallery coatFilter={dogCoat} />}
    </div>
  );
}
