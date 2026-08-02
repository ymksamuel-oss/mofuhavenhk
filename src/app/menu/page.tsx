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
  return `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
      : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/50"
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
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            return (
              <li
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]"
              >
                <div
                  className="relative flex h-32 items-center justify-center overflow-hidden p-3 sm:h-40"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 26%, var(--category-bg-light), var(--category-bg))",
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain p-3"
                  />
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
                  <p className="mt-auto text-base font-semibold tabular-nums text-[color:var(--ink)]">
                    {formatMoney(product.price, locale)}
                  </p>
                  <Link
                    href={`/checkout?category=${product.categorySlug}`}
                    className="mt-1 inline-flex items-center justify-center rounded-lg bg-[color:var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--hero-deep)]"
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
