"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";

const FACTORY_ADDRESS = "愛知県豊橋市下地町長池36番地";
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(`ベストパートナー株式会社 ${FACTORY_ADDRESS}`)}&output=embed`;

const COMPANY_ROWS = [
  { key: "name", zh: "社名", en: "Company", valueZh: "ベストパートナー株式会社", valueEn: "Best Partner Co., Ltd." },
  { key: "history", zh: "創立歷史", en: "History", valueZh: "1926 年創業（昭和元年，近百年歷史）／1948 年設立", valueEn: "Founded in 1926 (Showa 1) · Established in 1948" },
  { key: "representative", zh: "代表者", en: "Representative", valueZh: "中西 孝友", valueEn: "Takatomo Nakanishi" },
  { key: "capital", zh: "資本金", en: "Capital", valueZh: "3,000 萬日圓", valueEn: "JPY 30 million" },
  { key: "location", zh: "本社所在地", en: "Head office", valueZh: "〒440-0086 愛知県豊橋市下地町長池36番地", valueEn: "36 Nagaike, Shimoji-cho, Toyohashi, Aichi 440-0086, Japan" },
  { key: "business", zh: "事業內容", en: "Business", valueZh: "Best Partner 品牌寵物零食研發製造與批發", valueEn: "Development, manufacturing and wholesale of Best Partner pet treats" },
] as const;

export function SupplierProfileSection() {
  const { locale } = useI18n();
  const isZh = locale === "zh";

  const copy = isZh
    ? {
        eyebrow: "✦ 日本官方供應商 ✦",
        title: "日本原裝製造商認證・近百年歷史愛知縣職人工坊",
        intro: "從日本愛知縣豐橋市的自社工廠，到香港毛孩家庭的日常餐桌，Best Partner 堅持以透明產地與細緻工藝，守護每一口天然美味。",
        photoCaption: "🇯🇵 日本愛知縣豐橋市・Best Partner 本社工廠實景",
        mapTitle: "本社位置",
        profileTitle: "會社概要",
        promiseTitle: "毛毛港 3 大正品承諾",
        official: "官方製造商資料",
      }
    : {
        eyebrow: "✦ OFFICIAL JAPANESE SUPPLIER ✦",
        title: "Made in Japan · An Aichi workshop with almost a century of craft",
        intro: "From Best Partner's own facility in Toyohashi, Aichi, to everyday bowls in Hong Kong homes, every selection is grounded in transparent origins and careful craft.",
        photoCaption: "🇯🇵 Best Partner head office and factory · Toyohashi, Aichi, Japan",
        mapTitle: "Head office location",
        profileTitle: "Company profile",
        promiseTitle: "Three Mofu Haven assurances",
        official: "Official manufacturer information",
      };

  const promises = isZh
    ? ["🥩 100% 國產天然原肉", "🌿 0 化學防腐劑・0 人工誘食劑", "🚚 毛毛港官方正品直送"]
    : ["🥩 100% Japanese natural meat", "🌿 Zero chemical preservatives or attractants", "🚚 Official Mofu Haven direct shipping"];

  return (
    <section className="border-y border-[#F1F1F1] bg-[#FFFFFF]" aria-labelledby="supplier-profile-title">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold tracking-[0.28em] text-[#a36b42] sm:text-xs">{copy.eyebrow}</p>
          <h2 id="supplier-profile-title" className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#49372c] sm:text-4xl">{copy.title}</h2>
          <p className="mt-5 text-sm leading-7 text-[#725e50] sm:text-base sm:leading-8">{copy.intro}</p>
        </div>

        <div className="mt-10 flex flex-col space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
          <div className="space-y-8">
            <figure>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#e9dfd3] shadow-sm">
                <Image src="/images/best-partner-factory.jpg" alt={copy.photoCaption} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-xs leading-5 text-[#806b5d]">{copy.photoCaption}</figcaption>
            </figure>

            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.22em] text-[#a36b42]">{isZh ? "工廠地址" : "FACTORY LOCATION"}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#49372c]">{copy.mapTitle}</h3>
                </div>
                <span className="text-xs text-[#9a8170]">{isZh ? "日本・愛知縣" : "Aichi · Japan"}</span>
              </div>
              <div className="pointer-events-none h-56 overflow-hidden rounded-2xl border border-[#E6E0D6] bg-[#FFFFFF] sm:h-64">
                <iframe title={copy.mapTitle} src={MAP_EMBED_URL} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-2xl border border-[#E6E0D6] bg-white shadow-[0_18px_42px_-32px_rgba(93,67,48,0.55)]">
              <div className="border-b border-[#E6E0D6] bg-[#FFFFFF] px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#a36b42]">{isZh ? "公司資料" : "COMPANY PROFILE"}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#49372c]">{copy.profileTitle}</h3>
              </div>
              <dl>
                {COMPANY_ROWS.map((row, index) => (
                  <div key={row.key} className={`grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 px-5 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:px-6 ${index % 2 === 1 ? "bg-[#F9F7F2]" : "bg-white"}`}>
                    <dt className="text-sm font-semibold leading-6 text-[#6b5143]">{isZh ? row.zh : row.en}</dt>
                    <dd className="text-sm leading-6 text-[#49372c]">{isZh ? row.valueZh : row.valueEn}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-5 sm:p-6">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#a36b42]">{isZh ? "毛毛港正品承諾" : "MOFU HAVEN PROMISE"}</p>
              <h3 className="mt-1 text-xl font-semibold text-[#49372c]">{copy.promiseTitle}</h3>
              <ul className="mt-5 space-y-3">
                {promises.map((promise) => <li key={promise} className="rounded-xl bg-white/75 px-4 py-3 text-sm font-medium leading-6 text-[#5c463a]">{promise}</li>)}
              </ul>
              <p className="mt-5 text-xs leading-5 text-[#806b5d]">{copy.official}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
