"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { SupplierBrandLogos } from "@/components/home/SupplierBrandLogos";

type LocalizedCopy = { zh: string; en: string };
type LocalizedValue = { icon: string; title: LocalizedCopy; body: LocalizedCopy };

const VALUES: LocalizedValue[] = [
  {
    icon: "🥩",
    title: { zh: "低溫慢火烘乾", en: "Slow-Dried with Care" },
    body: { zh: "鮮味深層濃縮，零化學防腐劑天然保鮮。", en: "Concentrates the natural aroma of meat without chemical preservatives." },
  },
  {
    icon: "🦷",
    title: { zh: "天然咀嚼潔牙", en: "Natural Dental Chewing" },
    body: { zh: "帶韌嚼勁鍛鍊下顎肌肉，刺激唾液維持口腔健康。", en: "Satisfying texture supports jaw exercise and everyday oral care." },
  },
  {
    icon: "🌿",
    title: { zh: "低敏單一肉源", en: "Single-Protein Recipes" },
    body: { zh: "純淨配方無複雜添加物，溫柔呵護敏感腸胃。", en: "Clear, uncomplicated recipes made to be gentle on sensitive stomachs." },
  },
];

export function BestPartnerValues() {
  const { locale } = useI18n();
  const isZh = locale === "zh";
  const copy = (value: LocalizedCopy) => (isZh ? value.zh : value.en);

  return (
    <section
      aria-labelledby="best-partner-values-title"
      className="border-y border-[#F1F1F1] bg-[#FFFFFF] px-4 py-8 sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#F1F1F1] bg-[#FFFFFF] px-5 py-7 shadow-[0_22px_55px_-34px_rgba(93,67,48,0.55)] sm:px-8 sm:py-9 lg:px-14">
        <div className="mx-auto mb-8 max-w-4xl text-center">
          <SupplierBrandLogos />
          <p className="mt-2 text-xs font-medium tracking-wide text-stone-600 sm:text-sm">
            {isZh
              ? "日本愛知縣百年本社 (創業1926年) × 毛毛港香港官方專營直送"
              : "Aichi, Japan heritage since 1926 × Mofu Haven official Hong Kong delivery"}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#b7c9b1] bg-[#e9f0e6] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#3d5a40]">
            <span aria-hidden="true">✦</span>
            {isZh ? "日本愛知縣原廠製造・正規進口" : "Made in Aichi, Japan • Officially Imported"}
          </span>
          <h2
            id="best-partner-values-title"
            className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-[#2D2926] sm:text-3xl lg:text-4xl"
          >
            {isZh
              ? "堅持「日本產・無添加・無著色」—— 每一口都是純粹安心"
              : "Japanese-made, additive-free and naturally coloured — pure peace of mind in every bite"}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#725e50] sm:text-base sm:leading-8">
            {isZh
              ? "從原料嚴選、慢火烘乾到無菌包裝，每個細節都嚴格把關，守護毛孩每日健康。"
              : "From ingredients and preparation to packaging, every detail is selected for clarity, quality and everyday confidence."}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
          {VALUES.map((value) => (
            <div
              key={value.title.en}
              className="group flex min-w-0 items-start gap-4 rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] px-4 py-5 shadow-[0_12px_24px_-22px_rgba(92,62,39,0.8)] transition duration-200 hover:-translate-y-0.5 hover:border-[#F1F1F1] hover:bg-white sm:px-5"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFFFF] text-2xl shadow-inner"
                aria-hidden="true"
              >
                {value.icon}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold tracking-wide text-[#49372c] sm:text-base">{copy(value.title)}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#806d5d] sm:text-sm sm:leading-6">{copy(value.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestPartnerValues;
