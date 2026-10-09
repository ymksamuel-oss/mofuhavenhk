"use client";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatMoney } from "@/lib/i18n/translations";
import { getLocalizedProductName } from "@/lib/translateProductName";
import type { Product } from "@/lib/products";

function packCount(product: Product): number {
  const value = Number(product.metadata?.bulk_pack_count);
  return Number.isInteger(value) && [6, 9, 12].includes(value) ? value : 0;
}
export function BulkBundleCard({ products, priority = false }: { products: Product[]; priority?: boolean }) {
  const { locale } = useI18n();
  const tiers = [...products].filter((product) => packCount(product) > 0).sort((a, b) => packCount(a) - packCount(b));
  const featured = tiers[0] ?? products[0];
  const name = (getLocalizedProductName(featured, locale) || featured?.name.zh || featured?.name.en || "")
    .replace(/\s+(?:【(?:6|9|12)包裝】[^\s]+|— (?:6-pack Sharing|9-pack Family|12-pack Value Case))$/u, "");
  const href = featured ? `/product/${encodeURIComponent(featured.id)}` : "/collections/value-bundles";
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E9DFD2] bg-[#FFFCF8] shadow-[0_14px_32px_-26px_rgba(84,57,45,0.42)] transition hover:-translate-y-0.5 hover:border-[#CFB79A]">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#F7F1E9]">
          <ProductImage src={featured?.images?.[0] ?? "catalog-placeholder"} alt={name} sizes="(max-width: 768px) 50vw, 25vw" priority={priority} className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          <span className="absolute left-3 top-3 rounded-full bg-[#6D4935] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">人氣量販</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h2 className="mb-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#362820] sm:text-base">{name}</h2>
        <div className="mt-auto space-y-2">
          {tiers.map((tier) => {
            const count = packCount(tier);
            const label = locale === "en"
              ? `${count}-pack ${count === 6 ? "Sharing" : count === 9 ? "Family" : "Value Case"}`
              : `【${count}包裝】${count === 6 ? "分享裝" : count === 9 ? "家庭裝" : "原箱量販裝"}`;
            return (
              <div key={tier.id} className="rounded-xl border border-[#E9DFD2] bg-white p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-4 text-[#664632]">{label}</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-[#8C796A]">{locale === "en" ? `Avg. ${formatMoney(tier.price / count, locale)} / pack` : `平均 ${formatMoney(tier.price / count, locale)}／包`}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {tier.originalPrice && tier.originalPrice > tier.price ? <p className="text-[10px] leading-4 text-[#A7978A] line-through">{formatMoney(tier.originalPrice, locale)}</p> : null}
                    <p className="text-sm font-extrabold tabular-nums text-[#362820]">{formatMoney(tier.price, locale)}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <AddToCartButton productId={tier.id} size="list" showQuantity={false} showBulkShortcuts={false} />
                </div>
              </div>
            );
          })}
        </div>
        {tiers.length !== 3 ? <p className="mt-2 text-xs text-amber-700">{locale === "en" ? "Some pack sizes are temporarily unavailable." : "部分量販規格暫時未能供應。"}</p> : null}
      </div>
    </article>
  );
}
