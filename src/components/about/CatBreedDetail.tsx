"use client";

import type { SyntheticEvent } from "react";
import Link from "next/link";
import { Zen_Maru_Gothic } from "next/font/google";
import {
  CAT_BREED_IMAGE_FALLBACK,
  type CatBreed,
} from "@/lib/catBreeds";
import { useI18n } from "@/lib/i18n/I18nProvider";

const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

function handleBreedImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = CAT_BREED_IMAGE_FALLBACK;
}

type CatBreedDetailProps = {
  breed: CatBreed;
};

/**
 * Detail view for a single cat breed — warm picture-book styling.
 */
export function CatBreedDetail({ breed }: CatBreedDetailProps) {
  const { locale, t } = useI18n();

  const facts = [
    { label: t("catBreedDetailOrigin"), value: breed.origin[locale] },
    { label: t("catBreedDetailLifespan"), value: breed.lifespan[locale] },
    { label: t("catBreedDetailWeight"), value: breed.weight[locale] },
  ];

  const sections = [
    {
      title: t("catBreedDetailPersonality"),
      body: breed.personality[locale],
    },
    {
      title: t("catBreedDetailCare"),
      body: breed.careTips[locale],
    },
    {
      title: t("catBreedDetailNutrition"),
      body: breed.nutritionAdvice[locale],
    },
  ];

  return (
    <div
      className={`${zenMaru.className} min-h-[70vh] bg-[#FAF6F0] text-[#4A3B32]`}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link
            href="/cat-breeds"
            className="text-sm font-medium text-[#4A3B32]/70 transition hover:text-[#4A3B32]"
          >
            ← {t("catBreedDetailBack")}
          </Link>
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]">
            <div className="relative aspect-[4/3] w-full bg-[#FAF6F0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={breed.image}
                alt={breed.imageAlt[locale]}
                className="absolute inset-0 h-full w-full object-cover"
                onError={handleBreedImageError}
              />
            </div>
          </div>

          <header>
            <p className="inline-flex rounded-full border border-[#4A3B32]/15 bg-[#FFFCFA] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/65">
              {breed.coatLabel[locale]}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {breed.name[locale]}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#4A3B32]/85 sm:text-lg">
              {breed.fullDescription[locale]}
            </p>
          </header>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {facts.map((fact) => (
            <li
              key={fact.label}
              className="rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-4 py-4 shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/55">
                {fact.label}
              </p>
              <p className="mt-2 text-sm font-medium leading-snug sm:text-[0.95rem]">
                {fact.value}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="max-w-3xl">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-[#4A3B32]/85 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <aside className="mt-12 rounded-2xl border border-[#4A3B32]/12 bg-[#FFFCFA] px-5 py-5 shadow-[0_16px_32px_-24px_rgba(74,59,50,0.4)] sm:mt-14 sm:px-6 sm:py-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#4A3B32]/55">
            {t("catBreedDetailNoteEyebrow")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#4A3B32]/85 sm:text-[0.95rem]">
            {t("catBreedDetailNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
