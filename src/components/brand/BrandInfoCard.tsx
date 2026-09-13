"use client";

import Link from "next/link";
import { brandProfileLocalized, type Brand } from "@/lib/brands";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function BrandInfoCard({ brand }: { brand: Brand }) {
  const { locale } = useI18n();
  const profile = brandProfileLocalized(brand, locale);
  const isEnglish = locale === "en";

  return (
    <section className="mb-8 rounded-xl border border-neutral-200 bg-stone-50 p-5 sm:p-7" aria-labelledby="brand-title">
      <nav className="mb-6 text-sm text-stone-500" aria-label={isEnglish ? "Breadcrumb" : "麵包屑"}>
        <Link href="/" className="hover:text-[#7a4b31] hover:underline">{isEnglish ? "Home" : "首頁"}</Link>
        <span className="px-2">&gt;</span>
        <Link href="/" className="hover:text-[#7a4b31] hover:underline">{isEnglish ? "Brands" : "品牌專區"}</Link>
        <span className="px-2">&gt;</span>
        <span className="font-medium text-stone-900">{profile.displayName}</span>
      </nav>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a36b42]">Brand Knowledge</p>
      <h1 id="brand-title" className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">{profile.displayName}</h1>
      <div className="mt-5 flex flex-wrap gap-2" aria-label={isEnglish ? "Brand details" : "品牌規格"}>
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">{profile.origin}</span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{profile.audience}</span>
        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">{profile.specialty}</span>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">{profile.introduction}</p>
    </section>
  );
}
