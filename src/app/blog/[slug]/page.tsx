import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import { getKnowledgeArticle, KNOWLEDGE_ARTICLES, type KnowledgeArticle } from "@/lib/knowledge";
import type { Product } from "@/lib/products";

const SITE_URL = "https://mofuhavenhk.com";

export function generateStaticParams() {
  return KNOWLEDGE_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);
  if (!article) return { title: "文章不存在 | Mofu Haven" };
  return {
    title: `${article.title} | 毛拔麻知識庫`,
    description: article.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${article.slug}` },
    openGraph: { type: "article", url: `${SITE_URL}/blog/${article.slug}`, title: article.title, description: article.excerpt, images: [{ url: `${SITE_URL}${article.cover}`, alt: article.coverAlt }] },
  };
}

function productSku(product: Product): string {
  return product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) || "";
}

function pickProducts(products: Product[], skus: string[]): Product[] {
  const bySku = new Map(products.map((product) => [productSku(product), product]));
  return skus.map((sku) => bySku.get(sku)).filter((product): product is Product => Boolean(product));
}

function ArticleHeader({ article }: { article: KnowledgeArticle }) {
  return <header className="relative isolate overflow-hidden bg-[#ead6c4]"><div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(91,55,37,.74),rgba(91,55,37,.18))]" /><div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24"><div className="max-w-3xl text-white"><Link href="/knowledge" className="text-xs font-bold tracking-[0.18em] text-white/80 hover:text-white">毛拔麻知識庫　/　{article.category}</Link><div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-full border border-white/35 bg-white/15 px-3 py-1.5 backdrop-blur">{article.category}</span><span className="text-white/75">閱讀時間 {article.readingTime}</span></div><h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.13] tracking-tight sm:text-5xl lg:text-6xl">{article.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{article.excerpt}</p><div className="mt-7 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-[#fffaf4]/90 px-3 py-1.5 text-xs font-bold text-[#7d5037] shadow-sm">{tag}</span>)}</div></div><div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[#c99f7d] shadow-[0_24px_60px_-30px_rgba(60,37,25,.65)]"><img src={article.cover} alt={article.coverAlt} className="aspect-[4/3] w-full object-cover" /><div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-[#634331] shadow-lg backdrop-blur">Mofu Haven · 毛拔麻健康教室</div></div></div></header>;
}

export default async function KnowledgeArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);
  if (!article) notFound();
  let products: Product[] = [];
  try { products = pickProducts((await getCatalogSnapshot()).products, article.productSkus); } catch (error) { console.error("[knowledge] catalog unavailable", error); }
  const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, image: `${SITE_URL}${article.cover}`, datePublished: "2026-09-21", dateModified: "2026-09-21", author: { "@type": "Organization", name: "Mofu Haven 毛毛港" }, publisher: { "@type": "Organization", name: "Mofu Haven 毛毛港" }, mainEntityOfPage: `${SITE_URL}/blog/${article.slug}` };
  return <main className="min-h-screen bg-[#fbf7f3] text-[#4b352a]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} /><ArticleHeader article={article} /><article className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14"><div className="rounded-3xl border border-[#ead9cb] bg-[#fffdf9] p-6 shadow-[0_20px_50px_-38px_rgba(84,57,45,.5)] sm:p-9"><p className="text-lg leading-8 text-[#634b3d] sm:text-xl">{article.intro}</p><p className="mt-5 text-sm leading-7 text-[#8a7163]">本文為一般寵物健康教育，不能代替獸醫診斷。若毛孩有持續症狀、慢性病或正在服藥，轉換飲食前請先向主診獸醫確認。</p></div><div className="mt-14 space-y-14">{article.sections.map((section, index) => <section key={section.heading} aria-labelledby={`section-${index}`}><div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8b573f] text-xl text-white">{String(index + 1).padStart(2, "0")}</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">{section.eyebrow}</p><h2 id={`section-${index}`} className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[#4b352a]">{section.heading}</h2></div></div><p className="text-base leading-8 text-[#634b3d]">{section.body}</p>{section.bullets ? <ul className="mt-5 grid gap-3 sm:grid-cols-3">{section.bullets.map((bullet) => <li key={bullet} className="rounded-2xl border border-[#ead9cb] bg-[#fffdf9] p-4 text-sm font-semibold leading-6 text-[#76594a]">✓ {bullet}</li>)}</ul> : null}</section>)}</div><section className="mt-16 rounded-3xl bg-[#5c4638] p-7 text-[#fffaf4] sm:p-9" aria-labelledby="article-cta"><p className="text-xs font-bold tracking-[0.18em] text-[#eac4a5]">SHOP THE STORY</p><h2 id="article-cta" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">{article.cta}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">以下商品按文章主題精選，從店內目錄即時載入；商品卡上的購物車按鈕可以一鍵加入購物車。</p>{products.length ? <div className="mt-7 grid gap-5 sm:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} showPurchaseControls />)}</div> : <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-6 text-sm text-white/75">商品目錄正在更新，請稍後再回來查看推薦商品。</div>}<Link href="/knowledge" className="mt-8 inline-flex text-sm font-bold text-[#f7d8bc] hover:text-white">返回知識庫 →</Link></section></article></main>;
}
