import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Partner 品牌概念 | 毛毛港 Mofu Haven HK",
  description: "了解日本 Best Partner 堅持國產、無添加、無著色，以及低溫慢火烘乾的品牌理念。",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "堅持無添加與無著色",
    body: "核心思想為「添加物對寵物健康並非最好」。製造過程中盡可能排除人工防腐劑、色素及化學添加物，讓每一口都回到食材本身的純粹。",
  },
  {
    number: "02",
    title: "100% 日本國產食材",
    body: "嚴選日本在地捕獲或飼養的肉品與蔬果，產地透明、來源清楚，給飼主最踏實的安心，也讓毛孩享受真正熟悉的日本風土美味。",
  },
  {
    number: "03",
    title: "低溫慢火烘乾技術",
    body: "不依賴防腐劑，以時間慢火抽乾水分，鎖住鮮味與營養。天然硬度能鍛鍊牙齒與下顎、刺激唾液分泌，帶來天然潔齒效果。",
  },
] as const;

const PRODUCT_LINES = [
  {
    eyebrow: "FOR DOG",
    title: "犬用零食",
    body: "涵蓋國產雞胸肉、雞軟骨、牛肉乾、野生鹿肉、馬肉乾；丁香魚乾、魚片；凍乾蔬果點心；中大型犬耐咬潔牙骨，以及挑食救星拌飯粉。",
    href: "/categories/dogs",
    cta: "選購狗狗零食",
  },
  {
    eyebrow: "FOR CAT",
    title: "貓用零食",
    body: "無添加魚肉凍乾、雞肉乾及海鮮乾，保留天然香氣與口感，讓挑剔的貓咪也能找到安心喜愛的日常獎勵。",
    href: "/categories/cats",
    cta: "探索貓咪零食",
  },
  {
    eyebrow: "SUPPLIES",
    title: "生活用品",
    body: "天然成分的寵物護理與外出生活周邊，從日常照顧到陪伴出門，都以安全、實用與舒適為選物標準。",
    href: "/categories/supplies",
    cta: "查看生活良品",
  },
] as const;

export default function BestPartnerConceptPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f2] text-[#49372c]">
      <section className="relative overflow-hidden border-b border-[#eadbcb] bg-[#f5eadf] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#ead3bc]/45 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#e7d1b9]/35 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold tracking-[0.28em] text-[#9a6547] sm:text-sm">BEST PARTNER · JAPAN</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-5xl lg:text-6xl">
            日本 Best Partner ‧ 堅持国産、無添加與無著色
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#725e50] sm:text-lg">
            為愛寵提供最安心的純粹美味，讓幸福從每一份日常好食開始。
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="principles-title">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">OUR PRINCIPLES</p>
            <h2 id="principles-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">把安心，放在每一個製作細節</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <article key={principle.number} className="rounded-[1.75rem] border border-[#eadbcb] bg-[#fffdf9] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.6)] sm:p-8">
                <span className="text-sm font-bold tracking-[0.18em] text-[#b27b50]">{principle.number}</span>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-[#49372c]">{principle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#725e50]">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadbcb] bg-[#f5eadf] px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="product-lines-title">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.24em] text-[#a36b42]">PRODUCT LINES</p>
            <h2 id="product-lines-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-4xl">為每一位毛孩，準備剛剛好的日常</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <article key={line.title} className="flex flex-col rounded-[1.75rem] bg-[#fffdf9] p-6 shadow-[0_18px_42px_-32px_rgba(93,67,48,0.55)] sm:p-8">
                <p className="text-[11px] font-bold tracking-[0.24em] text-[#b27b50]">{line.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold text-[#49372c]">{line.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#725e50]">{line.body}</p>
                <Link href={line.href} className="mt-7 inline-flex w-fit items-center rounded-full bg-[#7a4b31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5e3928]">
                  {line.cta} <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-labelledby="recommendation-title">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#ddc5ad] bg-[#fffaf4] px-6 py-9 text-center shadow-[0_20px_48px_-34px_rgba(93,67,48,0.6)] sm:px-12 sm:py-12">
          <p className="text-2xl" aria-hidden="true">✦</p>
          <h2 id="recommendation-title" className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">非常推薦給重視純粹日常的毛孩家庭</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#725e50] sm:text-base">
            非常推薦給高齡犬、容易過敏、腸胃敏感，以及注重「純天然、非加工食品」的毛孩。
          </p>
          <div className="mt-7 rounded-2xl bg-[#f5eadf] px-5 py-4 text-sm font-semibold leading-7 text-[#684a38]">
            正品保障：香港正規商業登記 ‧ 毛毛港（Mofu Haven HK）日本原廠直送正品
          </div>
        </div>
      </section>
    </main>
  );
}
