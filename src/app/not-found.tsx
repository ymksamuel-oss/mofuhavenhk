"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="min-h-[70vh] overflow-hidden bg-[#FFFFFF] px-5 py-10 sm:px-8 sm:py-16">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#e2d0bf] bg-[#FFFFFF] shadow-[0_28px_70px_-44px_rgba(70,47,34,0.6)]">
        <Image
          src="/images/mofu-visuals/not-found-healing.jpg"
          alt={t("notFoundImageAlt")}
          width={2048}
          height={1150}
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff]/95 via-[#ffffff]/82 to-[#ffffff]/8 sm:from-[#ffffff]/92 sm:via-[#ffffff]/66 sm:to-transparent" />
        <div className="relative flex min-h-[34rem] max-w-xl flex-col justify-center px-7 py-14 sm:min-h-[38rem] sm:px-14 lg:px-20">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d9c5b3] bg-white/75 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#835d49] backdrop-blur-sm">
            MOFU HAVEN · LET&apos;S FIND THE WAY HOME
          </p>
          <p className="mt-8 font-[family-name:var(--font-display)] text-7xl leading-none text-[#5b3d2e] sm:text-9xl">404</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-wide text-[#51372a] sm:text-5xl">
            {t("notFoundTitleLine1")}
            <br />
            {t("notFoundTitleLine2")}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#775e50] sm:text-base">
            {t("notFoundBody")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#694633] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_22px_-15px_rgba(74,44,29,0.8)] transition hover:-translate-y-0.5 hover:bg-[#563526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8e644d] focus-visible:ring-offset-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("notFoundHomeCta")}
            </Link>
            <Link href="/menu" className="inline-flex items-center gap-2 rounded-full border border-[#cdb49e] bg-white/75 px-5 py-3 text-sm font-semibold text-[#694633] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8e644d] focus-visible:ring-offset-2">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {t("notFoundCatalogCta")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
