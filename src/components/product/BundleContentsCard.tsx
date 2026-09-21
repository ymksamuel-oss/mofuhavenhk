"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { getBundleProducts } from "@/lib/bundles";

export function BundleContentsCard({ product, catalog }: { product: Product; catalog: Product[] }) {
  const items = getBundleProducts(product, catalog);
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-[#ECE5D8] bg-[#FAF7F2] p-4 sm:p-5" aria-labelledby="bundle-contents-title">
      <h2 id="bundle-contents-title" className="text-lg font-bold text-stone-800">📦 套裝內含 {items.length} 大單品清單</h2>
      <p className="mt-1 text-sm text-stone-500">每款包裝及規格均以實際出貨商品為準。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(({ sku, nameZh, nameJa, weight, product: child }) => {
          const image = child?.images?.[0] ?? child?.image ?? "/images/catalog-placeholder.svg";
          return (
            <article key={sku} className="flex gap-3 rounded-xl border border-[#ECE5D8] bg-white p-3 shadow-sm">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#FAF7F2]">
                <Image src={image} alt={`${nameZh} ${nameJa}`} fill sizes="80px" className="object-contain mix-blend-multiply" unoptimized />
              </div>
              <div className="min-w-0 text-sm">
                <h3 className="font-bold text-stone-800">{nameZh}</h3>
                <p className="mt-0.5 text-xs text-stone-500">{nameJa}</p>
                <p className="mt-1 text-xs text-stone-600">規格：{weight}</p>
                <p className="text-xs text-stone-500">JAN：{sku}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
