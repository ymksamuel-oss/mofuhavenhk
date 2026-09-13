import type { Metadata } from "next";
import Link from "next/link";
import { BrandInfoCard } from "@/components/brand/BrandInfoCard";
import { AddToCartButton } from "@/components/menu/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { brandDescription, type Brand } from "@/lib/brands";
import { formatMoney } from "@/lib/i18n/translations";
import { productHref } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };
type CatalogProduct = Awaited<ReturnType<typeof getCatalogSnapshot>>["products"][number];

async function getBrand(slug: string): Promise<{ brand: Brand | null; products: CatalogProduct[] }> {
  const catalog = await getCatalogSnapshot();
  const brand = catalog.brands.find((item) => item.slug === slug) || null;
  const products = brand
    ? catalog.products.filter((product) => product.brandId === brand.id || (!product.brandId && product.brandName?.toLowerCase() === brand.name.toLowerCase()))
    : [];
  return { brand, products };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await getBrand(slug);
  if (!brand) return { title: "品牌不存在 | 毛毛港 Mofu Haven" };
  return {
    title: `${brand.name} 全線日本寵物用品 | 毛毛港 Mofu Haven`,
    description: `瀏覽 毛毛港 Mofu Haven 精選 ${brand.name} 貓狗糧食、零食及保健用品，日本直送正貨。`,
    openGraph: { title: `${brand.name} 全線日本寵物用品 | 毛毛港 Mofu Haven`, description: brandDescription(brand) },
    twitter: { card: "summary_large_image" },
  };
}

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <Link href={productHref(product.id)} className="relative block aspect-square overflow-hidden bg-[#fbf5ed]">
        <ProductImage src={product.images?.[0] || "catalog-placeholder"} alt={product.name.zh} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <Link href={productHref(product.id)} className="line-clamp-2 min-h-10 text-sm font-semibold text-[#3e2d25]">{product.name.zh}</Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <strong className="text-lg text-[#7a4b31]">{formatMoney(product.price, "zh")}</strong>
            {product.originalPrice ? <span className="ml-2 text-xs text-[#8b7c70] line-through">{formatMoney(product.originalPrice, "zh")}</span> : null}
          </div>
          <AddToCartButton productId={product.id} size="card" />
        </div>
      </div>
    </li>
  );
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const { brand, products } = await getBrand(slug);
  if (!brand) return <main className="mx-auto max-w-5xl px-4 py-20 text-center"><h1 className="text-3xl font-semibold">找不到這個品牌</h1><Link href="/" className="mt-6 inline-block text-[#7a4b31] underline">返回首頁</Link></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <BrandInfoCard brand={brand} />
      {products.length === 0 ? <section className="py-12 text-center"><p className="text-neutral-500">這個品牌暫時沒有上架產品，歡迎探索其他品牌。</p><Link href="/" className="mt-5 inline-block rounded-xl bg-[#7a4b31] px-5 py-3 font-semibold text-white">探索其他品牌</Link></section> : <section aria-labelledby="brand-products-title"><h2 id="brand-products-title" className="sr-only">{brand.name} 商品</h2><ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</ul></section>}
    </main>
  );
}
