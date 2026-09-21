import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getCatalogSnapshot } from "@/lib/catalog-server";
import type { Product } from "@/lib/products";

const SITE_URL = "https://mofuhavenhk.com";
const VENISON_SKUS = ["4976064026545", "4976064026743", "4976064025081"] as const;

export const metadata: Metadata = {
  title: "【毛拔麻健康教室】日本獸醫鹿肉營養解析｜Mofu Haven",
  description: "由低脂高蛋白、天然 DHA 到低敏單一肉源，一次了解日本製鹿肉零食如何成為狗狗日常飲食的安心選擇。",
  alternates: { canonical: `${SITE_URL}/blog/dog-food-venison-benefits` },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/blog/dog-food-venison-benefits`,
    title: "【毛拔麻健康教室】點解日本獸醫大力推薦「鹿肉」？",
    description: "低脂防肥、罕見 DHA 護腦與低敏紅肉全解析。",
    images: [{ url: `${SITE_URL}/images/hero-natural-meat.jpg`, width: 1600, height: 900, alt: "狗狗天然原肉飲食專欄" }],
  },
};

function skuOf(product: Product): string {
  return product.metadata?.mofu_sku?.trim() || product.tags?.find((tag) => /^\d{8,14}$/.test(tag)) || "";
}

function venisonProducts(products: Product[]): Product[] {
  const bySku = new Map(products.map((product) => [skuOf(product), product]));
  return VENISON_SKUS.map((sku) => bySku.get(sku)).filter((product): product is Product => Boolean(product));
}

const tags = ["#低脂低卡", "#DHA護腦", "#過敏犬救星", "#北海道野生鹿肉"];

export default async function VenisonBenefitsPage() {
  let products: Product[] = [];
  try {
    products = venisonProducts((await getCatalogSnapshot()).products);
  } catch (error) {
    console.error("[blog] venison products unavailable", error);
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "【毛拔麻健康教室】點解日本獸醫大力推薦「鹿肉」？低脂防肥、罕見DHA護腦與低敏紅肉全解析",
    description: "由低脂高蛋白、天然 DHA 到低敏單一肉源，一次了解日本製鹿肉零食。",
    image: `${SITE_URL}/images/hero-natural-meat.jpg`,
    datePublished: "2026-09-21",
    dateModified: "2026-09-21",
    author: { "@type": "Organization", name: "Mofu Haven 毛毛港" },
    publisher: { "@type": "Organization", name: "Mofu Haven 毛毛港" },
    mainEntityOfPage: `${SITE_URL}/blog/dog-food-venison-benefits`,
  };

  return (
    <main className="min-h-screen bg-[#fbf7f3] text-[#4b352a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article>
        <header className="relative isolate overflow-hidden bg-[#ead6c4]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,.72),transparent_38%),linear-gradient(115deg,rgba(91,55,37,.72),rgba(91,55,37,.16))]" />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
            <div className="max-w-2xl text-white">
              <Link href="/" className="text-xs font-bold tracking-[0.18em] text-white/80 hover:text-white">毛毛港健康知識庫　/　DOG NUTRITION</Link>
              <p className="mt-8 inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.14em] backdrop-blur">毛拔麻健康教室 · 專業飲食筆記</p>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.13] tracking-tight sm:text-5xl lg:text-6xl">點解日本獸醫大力推薦「鹿肉」？</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/90 sm:text-xl">低脂防肥、罕見 DHA 護腦與低敏紅肉全解析，幫你為毛孩揀一款更清爽、更安心的日常肉源。</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((tag) => <span key={tag} className="rounded-full bg-[#fffaf4]/90 px-3 py-1.5 text-xs font-bold text-[#7d5037] shadow-sm">{tag}</span>)}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[#c99f7d] shadow-[0_24px_60px_-30px_rgba(60,37,25,.65)]">
              <img src="/images/hero-natural-meat.jpg" alt="天然鹿肉與日本原肉零食" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-[#634331] shadow-lg backdrop-blur">日本製造・產地透明・無添加</div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="rounded-3xl border border-[#ead9cb] bg-[#fffdf9] p-6 shadow-[0_20px_50px_-38px_rgba(84,57,45,.5)] sm:p-9">
            <p className="text-lg leading-8 text-[#634b3d] sm:text-xl">如果你家狗狗已絕育、容易增磅，或者食雞肉牛肉後成日抓癢，鹿肉可能是值得認真了解的替代肉源。它不是「神奇治療」；但以清晰來源、單一配方和適量餵食為前提，確實能成為日常獎勵與拌糧的漂亮選擇。</p>
            <p className="mt-5 text-sm leading-7 text-[#8a7163]">以下內容是一般寵物營養教育，不能代替獸醫診斷。若毛孩有慢性病、腎臟問題或已知食物過敏，轉糧前請先向主診獸醫確認。</p>
          </div>

          <section className="mt-14" aria-labelledby="benefit-protein">
            <div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8b573f] text-xl text-white">01</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">LEAN & LIGHT</p><h2 id="benefit-protein" className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#4b352a]">高蛋白、極低脂：絕育與減肥犬的清爽肉香</h2></div></div>
            <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr] md:items-center"><p className="text-base leading-8 text-[#634b3d]">鹿肉通常屬於較瘦的紅肉，蛋白質密度高、脂肪相對低，對需要留意體態的狗狗尤其吸引。把高油脂零食換成小份量鹿肉乾，不代表可以無上限食；重點仍然是將零食熱量計入每日總攝取，並按體重、活動量和獸醫建議調整。</p><aside className="rounded-3xl bg-[#f2e4d5] p-6"><p className="text-sm font-bold text-[#87583d]">毛拔麻小貼士</p><p className="mt-2 text-sm leading-7 text-[#634b3d]">以「小份量、慢慢轉、觀察便便與皮膚」為原則，比一次過換晒全餐更穩妥。</p></aside></div>
          </section>

          <section className="mt-14" aria-labelledby="benefit-brain">
            <div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#a76443] text-xl text-white">02</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">BRAIN & COAT</p><h2 id="benefit-brain" className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#4b352a]">罕見陸地肉含天然 DHA 與高鐵質：由腦部到毛色的日常支援</h2></div></div>
            <div className="overflow-hidden rounded-3xl border border-[#ead9cb] bg-white"><div className="grid md:grid-cols-2"><img src="/images/products/bp-4976064026545.jpg" alt="北海道天然蝦夷鹿肉乾" className="h-full min-h-64 w-full object-cover" /><div className="p-6 sm:p-8"><p className="text-base leading-8 text-[#634b3d]">鹿肉的脂肪酸與礦物質組合，令它成為不少毛拔麻用來輪替蛋白質的選擇。DHA 與鐵質是營養討論中常見的關鍵字，但真正重要的是整體配方、攝取量和毛孩本身需要：不要將零食當成治療品，亦不要用單一食材取代完整主食。</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#fbf2e7] p-4"><p className="text-2xl font-bold text-[#8b573f]">DHA</p><p className="mt-1 text-xs leading-5 text-[#76594a]">日常腦部與認知營養討論</p></div><div className="rounded-2xl bg-[#fbf2e7] p-4"><p className="text-2xl font-bold text-[#8b573f]">Fe</p><p className="mt-1 text-xs leading-5 text-[#76594a]">高鐵質紅肉的營養亮點</p></div></div></div></div></div>
          </section>

          <section className="mt-14" aria-labelledby="benefit-sensitive">
            <div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#c17b52] text-xl text-white">03</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#a76443]">SINGLE PROTEIN</p><h2 id="benefit-sensitive" className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#4b352a]">終極低敏單一肉源：告別雞肉牛肉過敏抓癢？</h2></div></div>
            <p className="text-base leading-8 text-[#634b3d]">對正在做飲食排查的狗狗，單一肉源、配料表簡潔的鹿肉零食較容易記錄反應。不過「低敏」不等於「零過敏」；每隻狗狗的觸發物都不同。選擇時要看完整配料、避免混合多種肉類，並在獸醫指導下保持觀察期的一致性。</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{[["看清配料", "Single protein"], ["記錄反應", "Observe 7–14 days"], ["循序轉換", "Go gently"]].map(([title, label]) => <div key={title} className="rounded-2xl border border-[#ead9cb] bg-[#fffdf9] p-5"><p className="text-xs font-bold tracking-[0.12em] text-[#a76443]">{label}</p><p className="mt-2 font-bold text-[#634b3d]">{title}</p></div>)}</div>
          </section>

          <section className="mt-14 rounded-3xl bg-[#5c4638] p-7 text-[#fffaf4] sm:p-9" aria-labelledby="selection-standard">
            <div className="mb-6 flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d9a87f] text-xl font-bold text-[#5c4638]">04</span><div><p className="text-xs font-bold tracking-[0.16em] text-[#eac4a5]">JAPAN EXPERT CHECKLIST</p><h2 id="selection-standard" className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">日本專家傳授：揀鹿肉，先看這三件事</h2></div></div>
            <div className="grid gap-4 md:grid-cols-3">{[["產地透明", "清楚標示製造國、原料來源與製造商，拒絕只寫「天然」但來源含糊。"], ["無鉛檢驗", "野生鹿肉更要重視來源管理與檢驗資訊，選擇願意交代安全標準的品牌。"], ["100% 無添加", "配料越簡潔越易觀察，優先選擇不加人工色素、防腐劑與多餘調味的產品。"]].map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-lg font-bold text-[#f7d8bc]">{title}</p><p className="mt-2 text-sm leading-7 text-white/80">{copy}</p></div>)}</div>
          </section>

          <section className="mt-16" aria-labelledby="shop-venison">
            <div className="text-center"><p className="text-xs font-bold tracking-[0.18em] text-[#a76443]">SHOP THE STORY</p><h2 id="shop-venison" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#4b352a] sm:text-4xl">從一小口安心鹿肉開始</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#76594a]">以下三款均以指定 SKU 從店內目錄即時載入，按下卡片上的購物車按鈕即可加入購物車。</p></div>
            {products.length ? <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} showPurchaseControls />)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-[#d8c2b0] bg-white/60 p-8 text-center text-sm text-[#76594a]">商品目錄正在更新，請稍後再回來選購鹿肉系列。</div>}
            <div className="mt-8 text-center"><Link href="/collections/venison" className="inline-flex rounded-full bg-[#8b573f] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#6f432f]">查看完整天然鹿肉系列 →</Link></div>
          </section>
        </div>
      </article>
    </main>
  );
}
