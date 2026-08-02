"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { CATEGORIES } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";

function chipClassName(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_20px_-12px_rgba(169,124,80,0.8)]"
      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/60 hover:text-[color:var(--accent)]"
  }`;
}

function MenuContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");
  const products = getProductsByCategory(activeSlug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <span className="mb-2 inline-block rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
          {t("menuEyebrow")}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
          {t("menuTitle")}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">{t("menuSubtitle")}</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/menu" className={chipClassName(!activeSlug)}>
          {t("menuAllCategories")}
        </Link>
        {CATEGORIES.map(({ slug, labelKey }) => (
          <Link
            key={slug}
            href={`/menu?category=${slug}`}
            className={chipClassName(activeSlug === slug)}
          >
            {t(labelKey)}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">{t("menuEmpty")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            return (
              <li
                key={product.id}
                className="milk-tea-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(74,54,38,0.6)]"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-[color:var(--accent-soft)] to-[color:var(--background)] p-4 sm:h-44">
                  {/* Product artwork is a circular illustration on a white
                      square canvas; cropping it into a round frame (instead
                      of showing it with object-contain) hides the square
                      canvas edges and reads as a clean, intentional badge. */}
                  <div className="relative aspect-square w-[78%] max-w-[9.5rem] overflow-hidden rounded-full shadow-[0_10px_22px_-10px_rgba(92,54,38,0.4)] ring-4 ring-white/80 transition-transform duration-300 ease-out group-hover:scale-105">
                    <Image
                      src={product.image}
                      alt={product.name[locale]}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-sm font-medium leading-snug text-[color:var(--ink)]">
                    {product.name[locale]}
                  </p>
                  {product.description ? (
                    <p className="text-xs leading-snug text-[color:var(--muted)]">
                      {product.description[locale]}
                    </p>
                  ) : null}
                  <p className="mt-auto text-lg font-semibold tabular-nums text-[color:var(--accent)]">
                    {formatMoney(product.price, locale)}
                  </p>
                  <Link
                    href={`/checkout?category=${product.categorySlug}`}
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_16px_-9px_rgba(169,124,80,0.75)] transition hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_10px_20px_-9px_rgba(92,58,34,0.65)]"
                  >
                    {t("menuAddToCheckout")}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}
