"use client";

import Link from "next/link";
import {
  BagIcon,
  BoneIcon,
  CatIcon,
  CleaningIcon,
  ClockIcon,
  DogIcon,
  FireIcon,
  HealthIcon,
  ToyIcon,
} from "@/components/icons/CategoryIcons";
import { CATEGORIES, categoryHref, type CategoryIconName } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";

const ICONS: Record<CategoryIconName, typeof CatIcon> = {
  cat: CatIcon,
  dog: DogIcon,
  bone: BoneIcon,
  health: HealthIcon,
  cleaning: CleaningIcon,
  clock: ClockIcon,
  fire: FireIcon,
  bag: BagIcon,
  toy: ToyIcon,
};

export function CategoryGrid() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="category-grid-title"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 max-w-2xl">
        <h2
          id="category-grid-title"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-3xl"
        >
          {t("categoryGridTitle")}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)] sm:text-base">
          {t("categoryGridSubtitle")}
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-4 md:grid-cols-9 md:gap-x-2">
        {CATEGORIES.map(({ slug, labelKey, icon }) => {
          const Icon = ICONS[icon];
          return (
            <li key={slug}>
              <Link
                href={categoryHref(slug)}
                prefetch
                className="group flex flex-col items-center gap-2.5 text-center"
              >
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[color:var(--category-ink)] shadow-[inset_0_2px_3px_rgba(255,255,255,0.35),0_8px_18px_-9px_rgba(92,54,38,0.55)] ring-1 ring-white/40 will-change-transform transition-[transform,box-shadow] duration-[250ms] ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.07] group-hover:shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),0_18px_28px_-10px_rgba(92,54,38,0.68)] group-active:-translate-y-1 group-active:scale-[1.06] group-active:shadow-[inset_0_2px_3px_rgba(255,255,255,0.4),0_14px_24px_-10px_rgba(92,54,38,0.62)] sm:h-20 sm:w-20"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 26%, var(--category-bg-light), var(--category-bg))",
                  }}
                >
                  <Icon className="h-8 w-8 transition-transform duration-[250ms] ease-out group-hover:scale-105 group-active:scale-105 sm:h-10 sm:w-10" />
                </span>
                <span className="text-xs font-medium leading-tight text-[color:var(--ink)] transition-colors duration-[250ms] group-hover:text-[color:var(--accent)] group-active:text-[color:var(--accent)] sm:text-sm">
                  {t(labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
