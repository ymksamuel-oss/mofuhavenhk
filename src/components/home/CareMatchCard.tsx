"use client";

import type { MouseEvent } from "react";
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

  const handleScrollToProducts = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("products") ?? document.querySelector('[data-section="products"]');

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollBy({ top: 650, behavior: "smooth" });
  };

  return (
    <section className="my-8 w-full max-w-6xl mx-auto px-4" aria-labelledby="care-match-title">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-stone-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-800">
              <span>✨ Mofu Haven Care Match</span>
            </div>
            <h2 id="care-match-title" className="mb-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {isEn ? "Pet Food Care Match" : "寵物食品速配"}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-stone-600 sm:text-base">
              {isEn
                ? "Find ideal 100% natural Japanese treats tailored to your pet’s age, appetite, dental health or sensitive tummy in just 1 minute."
                : "1 分鐘根據毛孩體質、挑食或潔齒需求，智能速配最合適的日本 100% 天然原肉鮮食與磨牙零食！"}
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
            <a
              href="#products"
              onClick={handleScrollToProducts}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-800 active:scale-[0.98] sm:text-base md:w-auto"
            >
              <span>{isEn ? "Explore Matching Treats →" : "開始食品速配 →"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
