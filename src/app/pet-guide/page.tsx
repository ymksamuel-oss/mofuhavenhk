import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "探索寵物世界｜寵物圖鑑與日常護理｜毛毛港 Mofu Haven HK",
  description: "認識常見貓狗品種的性格、飲食與日常護理重點，為毛孩選擇更合適的天然食品與生活用品。",
};

const breeds = [
  {
    pet: "狗狗",
    name: "柴犬",
    personality: "獨立、聰明而忠誠，對熟悉的家人十分親近。",
    care: "需要穩定的日常活動量、耐心的正向訓練，以及定期梳理毛髮。",
    href: "/categories/dogs",
    action: "探索狗狗天然食品",
  },
  {
    pet: "狗狗",
    name: "貴婦狗",
    personality: "活潑、學習力高，喜歡與家人互動和遊戲。",
    care: "留意毛髮打結與牙齒清潔，並以適合體型的咀嚼小食作日常獎勵。",
    href: "/categories/dogs",
    action: "查看狗狗用品",
  },
  {
    pet: "貓咪",
    name: "英國短毛貓",
    personality: "溫和、穩重，享受安靜而有安全感的生活環境。",
    care: "準備固定休息位置、每日梳毛，並觀察飲水量及食慾變化。",
    href: "/categories/cats",
    action: "探索貓咪食品",
  },
  {
    pet: "貓咪",
    name: "布偶貓",
    personality: "親人、溫柔，通常喜歡陪伴並享受輕柔互動。",
    care: "長毛需要規律梳理，也要保持食具清潔及穩定的飲食節奏。",
    href: "/categories/cats",
    action: "查看貓咪用品",
  },
];

const careTopics = [
  {
    title: "每日飲食",
    body: "按照年齡、體型、活動量及敏感體質選擇合適食品。新食物應逐步加入，並持續觀察毛孩的食慾與排便狀況。",
  },
  {
    title: "天然小食",
    body: "小食適合作為訓練獎勵或日常陪伴，不應取代完整主食。選擇成分簡潔、肉源清晰的產品，份量亦要計入每日總熱量。",
  },
  {
    title: "外出與居家",
    body: "外出前檢查胸背帶、項圈及牽引繩是否合身；在家則保持休息區、食具和玩具潔淨，讓毛孩每天都能安心放鬆。",
  },
];

export default function PetGuidePage() {
  return (
    <main className="min-h-screen bg-[#fbf7f3] text-[color:var(--ink)]">
      <section className="border-b border-[color:var(--line)] bg-[#f4e7dc] px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
            ← 返回首頁
          </Link>
          <p className="mt-10 inline-flex rounded-full border border-[#d7bba7] bg-white/65 px-4 py-2 text-sm font-semibold tracking-wide text-[color:var(--accent)]">
            Mofu Haven 探索寵物世界
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-6xl">
            寵物圖鑑——了解你的寵物日常與護理
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-[color:var(--muted)] sm:text-xl">
            從品種性格到每日照顧，整理簡單實用的毛孩生活指南，陪你為貓狗選擇更貼合的食品與用品。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-10 sm:py-20" aria-labelledby="breed-guide-title">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[color:var(--accent)]">BREED GUIDE</p>
          <h2 id="breed-guide-title" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">常見貓犬品種性格</h2>
          <p className="mt-4 leading-8 text-[color:var(--muted)]">每隻毛孩都有獨特個性，以下內容只作日常參考；如有健康疑問，請向獸醫尋求專業意見。</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {breeds.map((breed) => (
            <article key={breed.name} className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-[0_18px_40px_-32px_rgba(74,54,38,0.55)]">
              <span className="text-sm font-semibold text-[color:var(--accent)]">{breed.pet}</span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">{breed.name}</h3>
              <dl className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
                <div><dt className="font-semibold text-[color:var(--ink)]">性格</dt><dd>{breed.personality}</dd></div>
                <div><dt className="font-semibold text-[color:var(--ink)]">護理重點</dt><dd>{breed.care}</dd></div>
              </dl>
              <Link href={breed.href} className="mt-6 inline-flex rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--hero-deep)]">
                {breed.action} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-10 sm:py-20" aria-labelledby="care-guide-title">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[color:var(--accent)]">DAILY CARE</p>
          <h2 id="care-guide-title" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">日常照顧與護理重點</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {careTopics.map((topic) => (
              <article key={topic.title} className="rounded-3xl bg-[#fbf7f3] p-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{topic.title}</h3>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)]">{topic.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 rounded-3xl bg-[#2f4a3c] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">為毛孩挑選合適的日常良品</h2>
            <p className="mt-2 text-sm leading-7 text-white/75">探索日本原裝天然食品，以及外出和生活用品。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/categories/dogs" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2f4a3c] transition hover:bg-[#f4e7dc]">狗狗專區</Link>
            <Link href="/categories/cats" className="rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">貓咪專區</Link>
            <Link href="/categories/supplies" className="rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">生活用品</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export const revalidate = 300;
