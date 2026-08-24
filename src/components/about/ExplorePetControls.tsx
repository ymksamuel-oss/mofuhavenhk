"use client";

import type { AnimalTab, DogCoatFilter } from "@/components/about/ExplorePetWorldGallery";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function ExplorePetControls({
  animal,
  dogCoat,
  onAnimalChange,
  onDogCoatChange,
}: {
  animal: AnimalTab;
  dogCoat: DogCoatFilter;
  onAnimalChange: (value: AnimalTab) => void;
  onDogCoatChange: (value: DogCoatFilter) => void;
}) {
  const { t } = useI18n();
  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
      active
        ? "border-[#4B3621] bg-[#4B3621] text-white"
        : "border-[#4B3621]/18 bg-white/75 text-[#4B3621] hover:border-[#4B3621]/45 hover:bg-[#F7EFE8]"
    }`;

  return (
    <div className="mt-3 w-full rounded-2xl border border-[#4B3621]/15 bg-[#F7EFE8]/90 p-3 text-left shadow-[0_16px_28px_-24px_rgba(75,54,33,0.7)] sm:p-4">
      <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#4B3621]/70">{t("petGuideFilterLabel")}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={pill(animal === "cats")} onClick={() => onAnimalChange("cats")}>
          {t("exploreCats")}
        </button>
        <button type="button" className={pill(animal === "dogs")} onClick={() => onAnimalChange("dogs")}>
          {t("exploreDogs")}
        </button>
        {animal === "dogs" && (
          <>
            <span className="hidden h-8 w-px bg-[#4B3621]/15 sm:block" aria-hidden="true" />
            <button type="button" className={pill(dogCoat === "all")} onClick={() => onDogCoatChange("all")}>
              {t("allDogs")}
            </button>
            <button type="button" className={pill(dogCoat === "long")} onClick={() => onDogCoatChange("long")}>
              {t("longHairedDogs")}
            </button>
            <button type="button" className={pill(dogCoat === "short")} onClick={() => onDogCoatChange("short")}>
              {t("shortHairedDogs")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
