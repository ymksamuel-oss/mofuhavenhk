"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";

const FACTORY_ADDRESS = "愛知県豊橋市下地町長池36番地";
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(`ベストパートナー株式会社 ${FACTORY_ADDRESS}`)}&output=embed`;

const FEATURES = [
  {
    number: "01",
    image: "/images/hero-natural-meat.jpg",
    imageAltZh: "原肉低溫慢烘後的天然肉乾與日常餵食情境",
    imageAltEn: "Natural meat treats prepared with gentle low-temperature drying",
    titleZh: "堅持日本國產・無添加・無著色",
    titleEn: "Japanese domestic ingredients · additive-free · colour-free",
    subtitle: "国産・無添加・無着色のこだわり",
    quoteZh: "「添加物は、あまり好ましいものでは無い」——盡可能做到純粹無添加。",
    quoteEn: "“Additives are not particularly desirable” — so we make every possible effort to keep the recipe pure and additive-free.",
    bodyZh: "不靠防腐劑與人工色素，以時間和耐心慢慢烘走水分，讓原肉保留自然緊緻、耐嚼的質地。啃咬時能促進唾液分泌，配合原肉與牙齒的物理摩擦，作為日常口腔清潔的一種溫和支持。",
    bodyEn: "Rather than relying on preservatives or artificial colour, time and patience gently draw out moisture. The result is a naturally firm, satisfying chew that encourages salivation and provides gentle physical friction as part of everyday oral care.",
  },
  {
    number: "02",
    image: "/images/products/best-partner-seafood-bundle-collage.jpg",
    imageAltZh: "多樣化 Best Partner 純肉零食與天然食材擺盤",
    imageAltEn: "A varied selection of Best Partner single-ingredient treats",
    titleZh: "豐富純肉陣容・為挑食與敏感體質而生",
    titleEn: "A rich pure-meat range · made for selective and sensitive pets",
    subtitle: "品揃えの豊富さ（アレルギー等への配慮、選ぶことの楽しさ）",
    quoteZh: "從單一原肉出發，讓每一次選擇都更清楚、更安心。",
    quoteEn: "Starting with a single ingredient makes every choice clearer and more reassuring.",
    bodyZh: "由雞、牛、鹿、馬到魚類，單一原肉配方有助避開常見過敏原，讓主人按毛孩體質與喜好細心挑選。無論是挑食、換牙階段，還是成犬日常潔齒，都能找到合適的天然咀嚼選擇。",
    bodyEn: "From chicken, beef, venison and horse to fish, single-ingredient recipes help avoid common allergens while giving families a clearer way to choose for each pet. There are natural options for selective eaters, teething pets and everyday dental chewing for adult dogs.",
  },
  {
    number: "03",
    image: "/images/best-partner-factory.jpg",
    imageAltZh: "藍天白雲下的 Best Partner 日本愛知縣豐橋市本社工廠實景",
    imageAltEn: "Best Partner head office and factory in Toyohashi, Aichi, Japan",
    titleZh: "日本原裝製造商認證・近百年歷史愛知縣職人工坊",
    titleEn: "Official Japanese manufacturer · an Aichi workshop with almost a century of history",
    subtitle: "愛知県豊橋市・自社工場から、香港の食卓へ",
    quoteZh: "1926年創業（昭和元年），從日本愛知縣豐橋市自社廠區，到香港毛孩餐桌，堅持透明產地與自社監控。",
    quoteEn: "Founded in 1926, Best Partner carries its own production standards from Toyohashi, Aichi, to everyday bowls in Hong Kong.",
    bodyZh: "從原料選擇、製造到包裝，均由日本原裝製造商以清晰產地與自社品質管理守護每一個細節。這份可追溯的安心，讓天然美味不只停留在包裝上的一句話。",
    bodyEn: "From ingredient selection and production to packing, the original Japanese manufacturer maintains clear origins and in-house quality control. That traceable care means natural quality is more than a promise printed on the pack.",
  },
] as const;

export function BestPartnerConceptContent() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-white text-stone-800">
      <header className="bg-white px-6 pb-10 pt-16 sm:pb-14 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
            {isEn ? "BEST PARTNER · JAPAN" : "日本原裝・Best Partner"}
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.025em] text-stone-800 sm:text-5xl lg:text-6xl">
            {isEn ? "The quiet craft behind everyday goodness" : "把日本職人的堅持，帶到毛孩的日常餐桌"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            {isEn
              ? "A closer look at Best Partner’s ingredients, thoughtful range and original Aichi workshop."
              : "從原料、選品到工坊，細看 Best Partner 如何以純粹工藝守護每一口天然美味。"}
          </p>
        </div>
      </header>

      <div className="bg-white">
        {FEATURES.map((feature) => (
          <section
            key={feature.number}
            className="grid grid-cols-1 items-center gap-10 border-t border-stone-100 px-6 py-12 md:grid-cols-12 md:gap-10 md:py-20 lg:py-24"
            aria-labelledby={`feature-${feature.number}-title`}
          >
            <div className="mx-auto w-full max-w-6xl md:col-span-12 md:grid md:grid-cols-12 md:items-center md:gap-10">
              <div className="md:col-span-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-stone-500">{feature.number} / BEST PARTNER</p>
                <h2 id={`feature-${feature.number}-title`} className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-[-0.025em] text-stone-800 sm:text-4xl lg:text-5xl">
                  {isEn ? feature.titleEn : feature.titleZh}
                </h2>
                <p className="mt-4 text-sm font-medium tracking-[0.08em] text-stone-500 sm:text-base">{feature.subtitle}</p>
                <blockquote className="mt-8 border-l-2 border-stone-300 pl-5 text-base font-medium leading-8 text-stone-700 sm:text-lg">
                  {isEn ? feature.quoteEn : feature.quoteZh}
                </blockquote>
                <p className="mt-7 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg sm:leading-9">
                  {isEn ? feature.bodyEn : feature.bodyZh}
                </p>

                {feature.number === "03" ? (
                  <div className="mt-9 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      {isEn ? "FACTORY LOCATION" : "工廠地址"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-700 sm:text-base">
                      〒440-0086 愛知県豊橋市下地町長池36番地
                    </p>
                    <div className="pointer-events-none mt-5 h-56 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm sm:h-64" aria-label={isEn ? "Static map showing the Best Partner factory in Toyohashi, Aichi" : "顯示愛知縣豐橋市 Best Partner 工廠位置的靜態地圖"}>
                      <iframe
                        title={isEn ? "Best Partner factory location" : "Best Partner 本社工廠位置"}
                        src={MAP_EMBED_URL}
                        className="h-full w-full border-0"
                        loading="lazy"
                        tabIndex={-1}
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <figure className="md:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
                  <Image
                    src={feature.image}
                    alt={isEn ? feature.imageAltEn : feature.imageAltZh}
                    fill
                    priority={feature.number === "01"}
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {feature.number === "03" ? (
                  <figcaption className="mt-3 text-xs leading-6 text-stone-500 sm:text-sm">
                    {isEn ? "🇯🇵 Best Partner head office and factory · Toyohashi, Aichi, Japan" : "🇯🇵 日本愛知縣豐橋市・Best Partner 本社工廠實景"}
                  </figcaption>
                ) : null}
              </figure>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
