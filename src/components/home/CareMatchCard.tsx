"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function CareMatchCard() {
  const { t } = useI18n();
  const topics = [
    t("careMatchTopicDental"),
    t("careMatchTopicPicky"),
    t("careMatchTopicSensitive"),
    t("careMatchTopicJoint"),
  ];

  return (
    <>
      <section id="pet-matcher" className="my-8 mx-auto w-full max-w-6xl scroll-mt-24 px-4" aria-labelledby="care-match-title">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-800">
                <span>✨ {t("careMatchEyebrow")}</span>
              </div>
              <h2 id="care-match-title" className="mb-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {t("careMatchTitle")}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                {t("careMatchSubtitle")}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                {topics.map((topic) => (
                  <span key={topic} className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-1">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 md:w-auto">
              <Link
                href="/matcher"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a5836] focus-visible:ring-offset-2 active:scale-[0.98] sm:text-base md:w-auto"
              >
                <span>{t("careMatchCta")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
