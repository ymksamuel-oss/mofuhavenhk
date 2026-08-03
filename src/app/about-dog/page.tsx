"use client";

import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Placeholder guide page for dogs — full picture book coming later. */
export default function AboutDogPage() {
  const { t } = useI18n();

  return (
    <div
      className="min-h-[60vh] w-full"
      style={{ backgroundColor: "#FAF6F0", color: "#4A3B32" }}
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-5">
          <Link
            href="/menu"
            className="text-sm font-medium text-[#8A7360] transition hover:text-[#A97C50]"
          >
            ← {t("aboutCatBackToMenu")}
          </Link>
        </p>
        <article className="rounded-2xl border border-[#E8DCC8] bg-[#FFFCFA] p-6 shadow-[0_18px_36px_-24px_rgba(74,59,50,0.4)] sm:p-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#A97C50]">
            {t("explorePetWorld")}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[#4A3B32] sm:text-3xl">
            {t("aboutDogTitle")}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[#6B574C]">
            {t("aboutDogBody")}
          </p>
          <div className="mt-8">
            <Link
              href={categoryHref("dogs")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#A97C50] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_-14px_rgba(169,124,80,0.85)] transition hover:-translate-y-0.5 hover:bg-[#966c45]"
            >
              {t("aboutDogShopCta")}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
