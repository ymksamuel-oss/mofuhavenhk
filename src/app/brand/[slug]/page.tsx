import type { Metadata } from "next";
import Link from "next/link";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { brandDescription, brandHref, type Brand } from "@/lib/brands";
import { formatMoney } from "@/lib/i18n/translations";
import { productHref } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

async function getBrand(slug: string): Promise<{ brand: Brand | null; products: Awaited<ReturnType<typeof getCatalogSnapshot>>["products"] }> {
  const catalog = await getCatalogSnapshot();
  const brand = catalog.brands.find((item) => item.slug === slug) || null;
  const products = brand ? catalog.products.filter((product) => product.brandId === brand.id || (!product.brandId && product.brandName?.toLowerCase() === brand.name.toLowerCase())) : [];
  return { brand, products };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await getBrand(slug);
  if (!brand) return { title: "品牌不存在 | 毛毛港 Mofu Haven" };
  return {
    title: `${brand.name} 全線日本寵物用品 | 毛毛港 Mofu Haven`,
    description: `瀏覽 毛毛港 Mofu Haven 精選 ${brand.name} 貓狗糧食、零食及保健用品，日本直送正貨。`,
    openGraph: { title: `${brand.name} 全線日本寵物用品 | 毛毛港 Mofu Haven`, description: brandDescription(brand), images: brand.logo_url ? [brand.logo_url] : undefined },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const { brand, products } = await getBrand(slug);
  if (!brand) return <main className="mx-auto max-w-5xl px-4 py-20 text-center"><h1 className="text-3xl font-semibold">找不到這個品牌</h1><Link href="/" className="mt-6 inline-block text-[#7a4b31] underline">返回首頁</Link></main>;
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-[color:var(--muted)]" aria-label="麵包屑"><Link href="/" className="hover:underline">首頁</Link><span className="px-2">/</span><span>{brand.name}</span></nav>
      <header className="rounded-3xl border border-[color:var(--line)] bg-[#fbf5ed] p-6 sm:p-10">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white p-4 shadow-sm">{brand.logo_url ? <img src={brand.logo_url} alt={`${brand.name} logo`} className="max-h-full max-w-full object-contain" /> : <span className="text-2xl font-semibold text-[#6c4d3d]">{brand.name.slice(0, 2)}</span>}</div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a36b42]">Brand Collection</p><h1 className="mt-2 text-3xl font-semibold text-[#3e2d25] sm:text-4xl">{brand.name}</h1><p className="mt-3 max-w-2xl leading-7 text-[color:var(--muted)]">{brandDescription(brand)}</p></div>
        </div>
      </header>
      {products.length === 0 ? <section className="py-16 text-center"><p className="text-[color:var(--muted)]">這個品牌暫時沒有上架產品，歡迎探索其他品牌。</p><Link href="/" className="mt-5 inline-block rounded-xl bg-[#7a4b31] px-5 py-3 font-semibold text-white">探索其他品牌</Link></section> : <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <li key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white"><Link href={productHref(product.id)} className="block aspect-square bg-[#fbf5ed]"><ProductImage src={product.images?.[0] || "catalog-placeholder"} alt={product.name.zh} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" /></Link><div className="flex flex-1 flex-col gap-3 p-3 sm:p-4"><Link href={productHref(product.id)} className="line-clamp-2 min-h-10 text-sm font-semibold text-[#3e2d25]">{product.name.zh}</Link><div className="mt-auto flex items-center justify-between gap-2"><div><strong className="text-lg text-[#7a4b31]">{formatMoney(product.price, "zh")}</strong>{product.originalPrice ? <span className="ml-2 text-xs text-[#8b7c70] line-through">{formatMoney(product.originalPrice, "zh")}</span> : null}</div><AddToCartButton productId={product.id} size="card" /></div></div></li>)}</ul>}
    </main>
  );
}
