"use client";

import { ProductImage } from "@/components/product/ProductImage";
import type { Product } from "@/lib/products";
import { getBundleProducts } from "@/lib/bundles";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getLocalizedProductName } from "@/lib/translateProductName";

export function BundleContentsCard({ product, catalog }: { product: Product; catalog: Product[] }) {
  const { locale, t } = useI18n();
  const items = getBundleProducts(product, catalog);
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-4 sm:p-5" aria-labelledby="bundle-contents-title">
      <h2 id="bundle-contents-title" className="text-lg font-bold text-stone-800">{t("bundleContentsTitle").replace("{count}", String(items.length))}</h2>
      <p className="mt-1 text-sm text-stone-500">{t("bundleContentsHint")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(({ sku, nameZh, nameEn, nameJa, weight, product: child }) => {
          const image = child?.images?.[0] ?? child?.image ?? "/images/catalog-placeholder.svg";
          const name = child ? getLocalizedProductName(child, locale) : locale === "en" ? nameEn : nameZh;
          return (
            <article key={sku} className="flex gap-3 rounded-xl border border-[#F1F1F1] bg-white p-3 shadow-sm">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#FFFFFF]">
                <ProductImage src={image} alt={`${name} ${nameJa}`} sizes="80px" className="object-contain mix-blend-multiply" />
              </div>
              <div className="min-w-0 text-sm">
                <h3 className="font-bold text-stone-800">{name}</h3>
                <p className="mt-0.5 text-xs text-stone-500">{nameJa}</p>
                <p className="mt-1 text-xs text-stone-600">{t("bundleContentsSpecification")}{weight}</p>
                <p className="text-xs text-stone-500">{t("bundleContentsJan")}{sku}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
