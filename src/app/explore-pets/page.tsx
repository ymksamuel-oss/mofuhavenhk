import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { KNOWLEDGE_ARTICLES } from "@/lib/knowledge";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value;
  const isEn = locale === "en" || locale === "en-HK";
  return {
    title: isEn ? "Explore Pet World | Mofu Haven HK" : "探索寵物世界 ｜ 毛毛港 Mofu Haven 日本寵物生活指南",
    description: isEn
      ? "Step into the everyday world of Japanese pets. From farm-to-bowl ingredients to picky-eater solutions, explore endless ways to keep your furry family healthy and happy."
      : "與你一同走進日本毛孩的生活日常。由食材產地、挑食解法到全方位照料指南，發掘讓毛孩快樂健康的無限可能。",
    alternates: { canonical: "https://www.mofuhavenhk.com/explore-pets" },
    openGraph: {
      title: isEn ? "Explore Pet World | Mofu Haven HK" : "探索寵物世界 ｜ 毛毛港 Mofu Haven 日本寵物生活指南",
      description: isEn
        ? "Step into the everyday world of Japanese pets. From farm-to-bowl ingredients to picky-eater solutions, explore endless ways to keep your furry family healthy and happy."
        : "與你一同走進日本毛孩的生活日常。由食材產地、挑食解法到全方位照料指南，發掘讓毛孩快樂健康的無限可能。",
      url: "https://www.mofuhavenhk.com/explore-pets",
      type: "website",
    },
  };
}

export default function ExplorePetsPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f3] text-[#4b352a]">
      <section className="border-b border-[#ead9cb] bg-[#f1ded1] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[0.2em] text-[#a76443]">MOFU HAVEN · EXPLORE PETS</p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            探索寵物世界
            <span className="mt-2 block text-2xl font-medium tracking-normal text-[#76594a] sm:text-4xl">Explore Pet World</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6d5141]">與你一同走進日本毛孩的生活日常。由食材產地、挑食解法到全方位照料指南，發掘讓毛孩快樂健康的無限可能。</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#76594a]">Step into the everyday world of Japanese pets. From farm-to-bowl ingredients to picky-eater solutions, explore endless ways to keep your furry family healthy and happy.</p>
          <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full bg-[#fffaf4] px-3 py-1.5 text-xs font-bold text-[#87583d]">實用照料</span><span className="rounded-full bg-[#fffaf4] px-3 py-1.5 text-xs font-bold text-[#87583d]">日本選物觀察</span><span className="rounded-full bg-[#fffaf4] px-3 py-1.5 text-xs font-bold text-[#87583d]">Everyday Pet Life</span></div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14" aria-labelledby="explore-pets-articles-heading">
        <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.18em] text-[#a76443]">LATEST NOTES</p><h2 id="explore-pets-articles-heading" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">毛孩照顧，從理解開始</h2></div><span className="hidden text-sm text-[#8a7163] sm:block">{KNOWLEDGE_ARTICLES.length} 篇精選文章</span></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {KNOWLEDGE_ARTICLES.map((article, index) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className={`group overflow-hidden rounded-3xl border border-[#ead9cb] bg-[#fffdf9] shadow-[0_18px_45px_-34px_rgba(84,57,45,.55)] transition hover:-translate-y-1 hover:border-[#cda789] hover:shadow-[0_25px_50px_-32px_rgba(84,57,45,.5)] ${index === 0 ? "md:col-span-2 lg:col-span-2" : ""}`}>
              <div className={`relative overflow-hidden bg-[#ead6c4] ${index === 0 ? "aspect-[2.2/1]" : "aspect-[1.45/1]"}`}><img src={article.cover} alt={article.coverAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span className="absolute left-4 top-4 rounded-full bg-[#fffaf4]/90 px-3 py-1.5 text-xs font-bold text-[#87583d] backdrop-blur">{article.category}</span></div>
              <div className="p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-semibold text-[#a76443]"><span>{article.readingTime}</span><span aria-hidden="true">·</span><span>探索寵物世界專欄</span></div><h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-[#4b352a] group-hover:text-[#8b573f] sm:text-2xl">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-[#76594a]">{article.excerpt}</p><div className="mt-5 flex flex-wrap gap-1.5">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-[#f5e9de] px-2.5 py-1 text-[11px] font-semibold text-[#87583d]">{tag}</span>)}</div><span className="mt-6 inline-flex text-sm font-bold text-[#8b573f]">閱讀全文 →</span></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
