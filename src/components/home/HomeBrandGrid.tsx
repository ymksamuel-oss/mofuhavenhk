import Link from "next/link";
import type { Brand } from "@/lib/brands";
import { brandDescription, brandHref } from "@/lib/brands";

export function HomeBrandGrid({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="popular-brands-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">毛毛港 Mofu Haven</p>
          <h2 id="popular-brands-title" className="mt-2 text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">人氣品牌</h2>
        </div>
        <span className="text-sm text-[color:var(--muted)]">探索日本直送正貨</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link key={brand.id} href={brandHref(brand.slug)} className="group flex min-h-44 flex-col rounded-2xl border border-[color:var(--line)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
            <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[#fbf5ed] p-3">
              {brand.logo_url ? <img src={brand.logo_url} alt={`${brand.name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" /> : <span className="text-xl font-semibold text-[#6c4d3d]">{brand.name.slice(0, 2)}</span>}
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#3e2d25] group-hover:text-[color:var(--accent)]">{brand.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">{brandDescription(brand)}</p>
            <span className="mt-auto pt-3 text-xs font-semibold text-[color:var(--accent)]">查看全線產品 →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
