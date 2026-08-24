"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { DogBreed } from "@/lib/dogBreeds";

export function DogBreedDetail({ breed }: { breed: DogBreed }) {
  const { t, locale } = useI18n();
  const isEn = locale === "en";
  const name = isEn ? breed.nameEn : breed.name;
  const coat = isEn ? breed.coatLabelEn : breed.coatLabel;
  const description = isEn ? breed.shortDescriptionEn : breed.shortDescription;
  const fullDescription = isEn ? (breed.fullDescriptionEn ?? description) : (breed.fullDescription ?? description);
  const appearance = isEn ? (breed.appearanceEn ?? []) : (breed.appearance ?? []);
  const health = isEn ? (breed.healthEn ?? []) : (breed.health ?? []);
  const adoptionNote = isEn ? (breed.adoptionNoteEn ?? "") : (breed.adoptionNote ?? "");
  const personality = isEn ? breed.personalityEn : breed.personality;
  const care = isEn ? breed.careEn : breed.care;
  const exercise = isEn ? breed.exerciseEn : breed.exercise;
  const facts = [
    { label: t("dogBreedsPersonality"), value: personality },
    { label: t("dogBreedsCare"), value: care },
    { label: t("dogBreedsExercise"), value: exercise },
  ];

  return (
    <div className="min-h-[70vh] bg-[#FBF9F6] text-[#2B2623]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-6">
          <Link href="/cat-breeds" className="text-sm font-medium text-[#2B2623]/70 transition hover:text-[#2B2623]">
            ← {t("catBreedDetailBack")}
          </Link>
        </p>
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-[#2B2623]/12 bg-white shadow-[0_18px_36px_-22px_rgba(74,59,50,0.4)]">
            {/* Dog breed assets are local, separate from product and cat-breed images. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={breed.imageUrl} alt={name} className="aspect-[4/3] w-full object-cover" />
          </div>
          <header>
            <p className="inline-flex rounded-full border border-[#2B2623]/15 bg-white px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#2B2623]/65">
              {coat}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
            <p className="mt-3 text-base leading-relaxed text-[#2B2623]/85 sm:text-lg">{fullDescription}</p>
          </header>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {facts.map((fact) => (
            <li key={fact.label} className="rounded-2xl border border-[#2B2623]/12 bg-white px-4 py-4 shadow-[0_12px_28px_-22px_rgba(74,59,50,0.35)]">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#2B2623]/55">{fact.label}</p>
              <p className="mt-2 text-sm leading-relaxed">{fact.value}</p>
            </li>
          ))}
        </ul>
        <section className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dogBreedDetailOverview")}</h2>
            <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">{fullDescription}</p>
          </div>
          {appearance.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dogBreedDetailAppearance")}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
                {appearance.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dogBreedDetailCareTitle")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
              <li>{personality}</li>
              <li>{care}</li>
              <li>{exercise}</li>
            </ul>
          </div>
          {health.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dogBreedDetailHealth")}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">
                {health.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
          {adoptionNote ? (
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("dogBreedDetailHongKong")}</h2>
              <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-[#2B2623]/85 sm:text-base">{adoptionNote}</p>
            </div>
          ) : null}
        </section>
        <aside className="mt-12 rounded-2xl border border-[#2B2623]/12 bg-white px-5 py-5 shadow-[0_16px_32px_-24px_rgba(74,59,50,0.4)] sm:px-6 sm:py-6">
          <p className="text-sm leading-relaxed text-[#2B2623]/80">{t("catBreedDetailNote")}</p>
        </aside>
      </div>
    </div>
  );
}
