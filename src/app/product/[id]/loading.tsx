"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProductLoading() {
  const { locale } = useI18n();
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-8" aria-busy="true" aria-label={locale === "en" ? "Loading product details" : "正在載入商品資料"}>
      <div className="mb-5 h-4 w-48 rounded bg-stone-200" />
      <div className="grid gap-6 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
        <div className="aspect-square rounded-2xl bg-stone-100" />
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <div className="h-8 w-4/5 rounded bg-stone-200" />
          <div className="mt-5 h-8 w-32 rounded bg-stone-200" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="h-4 w-5/6 rounded bg-stone-100" />
            <div className="h-12 w-full rounded-full bg-stone-200" />
          </div>
        </section>
      </div>
    </main>
  );
}
