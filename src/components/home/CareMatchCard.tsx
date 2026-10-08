"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

const topics = [
  { zh: "🐶 物理潔齒耐咬", en: "🐶 Dental chews" },
  { zh: "🐱 挑食騙水拌糧", en: "🐱 Picky eaters" },
  { zh: "🥩 敏感低敏紅肉", en: "🥩 Sensitive tummies" },
  { zh: "🌿 關節骨骼養護", en: "🌿 Joint support" },
];

export function CareMatchCard() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <>
      <section id="pet-matcher" className="my-8 mx-auto w-full max-w-6xl scroll-mt-24 px-4" aria-labelledby="care-match-title">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-800">
                <span>{isEn ? "✨ Mofu Haven Pet Matcher" : "✨ 毛孩專屬日系好物配對"}</span>
              </div>
              <h2 id="care-match-title" className="mb-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {isEn ? "Tailored Japanese Pet Essentials" : "🐾 毛孩專屬日系好物配對"}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                {isEn
                  ? "Picky appetite, allergies or dental-care needs? Get Japanese natural meat-treat picks tailored to your pet in 30 seconds."
                  : "毛孩有挑食、過敏或潔齒需求？30秒為毛孩量身推薦日本天然原肉零食"}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                {topics.map((topic) => (
                  <span key={topic.en} className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-1">
                    {isEn ? topic.en : topic.zh}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 md:w-auto">
              <Link
                href="/matcher"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a5836] focus-visible:ring-offset-2 active:scale-[0.98] sm:text-base md:w-auto"
              >
                <span>{isEn ? "Start smart matching ➔" : "開始智能配對 ➔"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
