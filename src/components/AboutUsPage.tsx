"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

type LocalizedCopy = { zh: string; en: string };
type PromiseCard = { icon: string; title: LocalizedCopy; body: LocalizedCopy };

const QUALITY_PROMISES: PromiseCard[] = [
  {
    icon: "01",
    title: { zh: "堅持『日本國產 ‧ 零添加 ‧ 無著色』", en: "Japanese-made · No additives · No artificial colours" },
    body: {
      zh: "我們深信化學添加物並非毛孩所需。全系列食品絕不添加人工防腐劑、合成香精與化學色素，讓毛孩每一口吃到的，都是食材本來的味道。",
      en: "We believe pets do not need unnecessary chemical additives. Our food range is free from artificial preservatives, synthetic flavourings and artificial colours, so every bite tastes like the ingredients themselves.",
    },
  },
  {
    icon: "02",
    title: { zh: "慢火低溫風乾，鎖住原肉嚼勁與口腔健康", en: "Slow-dried at low temperatures for satisfying texture and dental care" },
    body: {
      zh: "日本原廠以低溫慢火烘乾抽走水分，將肉香與鮮味濃縮至極致。天然原肉纖維讓毛孩在咀嚼時鍛鍊下顎咬合力、刺激唾液分泌，達到天然潔齒與口腔清潔的效果。",
      en: "Our Japanese producers gently remove moisture through low-temperature drying, concentrating the natural aroma and flavour of the meat. The original meat fibres encourage satisfying chewing and support everyday dental and oral care.",
    },
  },
  {
    icon: "03",
    title: { zh: "關注敏感體質，提供多元單一肉源", en: "Thoughtful single-protein choices for sensitive pets" },
    body: {
      zh: "北海道鹿肉、低敏馬肉、精選牛肉、純天然雞肉及深海魚介，讓不同體質的毛孩都能找到安心、無負擔的營養補給。",
      en: "From Hokkaido venison and gentle horse meat to selected beef, natural chicken and deep-sea fish, our range offers comforting, single-protein nourishment for different sensitivities and daily needs.",
    },
  },
];

const SERVICE_PROMISES: PromiseCard[] = [
  {
    icon: "📦",
    title: { zh: "順豐速運 ‧ 快速出貨", en: "SF Express · Prompt dispatch" },
    body: {
      zh: "香港現貨於 1–2 個工作天內發貨，全單滿 HK$399 即享本地順豐免運。",
      en: "Hong Kong in-stock orders are dispatched within 1–2 working days. Enjoy free local SF Express delivery on orders of HK$399 or more.",
    },
  },
  {
    icon: "🏷️",
    title: { zh: "正規經營 ‧ 原裝正品", en: "Authentic products · Trusted sourcing" },
    body: {
      zh: "我們持有有效香港商業登記，商品均由日本原裝進口，嚴格把關保質期與包裝完整性。",
      en: "We operate with a valid Hong Kong business registration. Products are imported from Japan in their original packaging, with careful checks on shelf life and condition.",
    },
  },
  {
    icon: "💬",
    title: { zh: "WhatsApp 專人諮詢", en: "Personal guidance via WhatsApp" },
    body: {
      zh: "無論是老犬幼犬的食物硬度，還是敏感體質的食材建議，都歡迎隨時與我們交流毛孩的飲食日常。",
      en: "Whether you need advice on texture for puppies and senior dogs or ingredients for sensitive pets, we are always happy to talk through your companion's everyday diet.",
    },
  },
];

export function AboutUsPage() {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const copy = <T extends LocalizedCopy>(value: T) => value[isEn ? "en" : "zh"];

  return (
    <main className="bg-[#FFFFFF]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
        >
          ← {isEn ? "Back to home" : "返回首頁"}
        </Link>

        <article className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9dccd] bg-[#FFFFFF] shadow-[0_28px_60px_-38px_rgba(91,65,45,0.38)]">
          <header className="relative overflow-hidden bg-[#FFFFFF] px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ead3bb]/55 blur-2xl" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#8a5d42]">MOFU HAVEN · ABOUT US</p>
              <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.2] tracking-tight text-[#49372c] sm:text-5xl lg:text-6xl">
                {isEn ? (
                  <>
                    <span className="block">The Purest Good for Your Furry Friends,</span>
                    <span className="block">Starting with Peace of Mind in Every Bite.</span>
                  </>
                ) : (
                  <>
                    <span className="block">給毛孩最純粹的好</span>
                    <span className="block">從一口安心開始</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-2xl font-[family-name:var(--font-display)] text-lg leading-8 text-[#725846] sm:text-xl">
                {isEn
                  ? '"As family to our pets, every time we check the ingredients label, all we look for is genuine peace of mind."'
                  : "「身為毛孩的家人，我們每一次翻看成分標籤，尋找的不過是一份踏實的安心。」"}
              </p>
            </div>
          </header>

          <section className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="origin-title">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR BEGINNING</p>
                <h2 id="origin-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">
                  {isEn ? "The Birth of Mofu Haven" : "毛毛港的誕生"}
                </h2>
              </div>
              <div className="space-y-5 text-[0.98rem] leading-8 text-[#725e50]">
                {isEn ? (
                  <>
                    <p>In a fast-paced city like Hong Kong, coming home after an exhausting day to a gentle greeting from our pets brings the deepest warmth.</p>
                    <p>Like you, we are pet parents who love our companions wholeheartedly. We know how difficult it can be to navigate treats with chemical flavour enhancers, preservatives, artificial colours, and unclear sourcing or ingredient labels.</p>
                    <p>Driven by the wish to find the cleanest, most natural food for our own pets, we founded Mofu Haven — a warm Hong Kong haven curating Japan&apos;s finest additive-free treats and everyday essentials for cats and dogs.</p>
                  </>
                ) : (
                  <>
                    <p>在香港這座快節奏的城市裡，每當疲憊歸家，看見毛孩搖著尾巴迎上來、或是蹭在腳邊發出呼嚕聲，那一刻的溫暖，是生活中最珍貴的治癒。</p>
                    <p>我們和你一樣，都是全心全意愛著毛孩的家長。我們深知市面上充斥著含有化學誘食劑、防腐劑與人工色素的零食，產地與原料標示亦往往模糊不清。</p>
                    <p>為了給家裡的毛孩尋找最乾淨、最純粹的食物，我們創立了「毛毛港 Mofu Haven」——一個專為香港貓狗精選日本原裝、天然無添加食品與生活良品的溫馨港灣。</p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="border-t border-[#eee2d5] bg-[#FFFFFF] px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="quality-title">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR STANDARD</p>
              <h2 id="quality-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">{isEn ? "Three Quality Promises" : "三大品質承諾"}</h2>
              <p className="mt-4 leading-7 text-[#725e50]">{isEn ? "We search close to the source in Japan and choose established, trusted producers. Every product that reaches Mofu Haven follows a quality standard we will not compromise." : "我們深入日本在地，嚴選歷史悠久、備受信賴的原廠品牌。每一件抵達毛毛港的產品，都遵循無可妥協的品質標準。"}</p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {QUALITY_PROMISES.map((promise) => (
                <article key={promise.icon} className="rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-5 shadow-[0_16px_30px_-28px_rgba(91,65,45,0.5)] sm:p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] text-xs font-bold text-[#8a5d42]">{promise.icon}</span>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold leading-7 text-[#49372c]">{copy(promise.title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#806d5d]">{copy(promise.body)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-6 py-12 sm:px-12 sm:py-16 lg:px-20" aria-labelledby="service-title">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#a36b49]">OUR CARE</p>
                <h2 id="service-title" className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#49372c] sm:text-3xl">{isEn ? "Local Care, Thoughtfully Delivered" : "在地安心服務"}</h2>
              </div>
              <div className="grid gap-3">
                {SERVICE_PROMISES.map((service) => (
                  <article key={service.icon} className="flex gap-4 rounded-2xl border border-[#F1F1F1] bg-[#FFFFFF] p-5 sm:p-6">
                    <span className="text-2xl" aria-hidden="true">{service.icon}</span>
                    <div>
                      <h3 className="font-semibold text-[#49372c]">{copy(service.title)}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#806d5d]">{copy(service.body)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-[#F1F1F1] bg-[#FFFFFF] px-6 py-12 text-center sm:px-12 sm:py-16 lg:px-20">
            <p className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-xl font-semibold leading-9 text-[#49372c] sm:text-2xl">
              {isEn ? "May every Japanese goodie delivered to your door become a gentle, grounded joy in your companion's everyday life." : "願每一份送到你手上的日本好物，都成為毛孩日常裡一份溫柔而踏實的幸福。"}
            </p>
            <Link href="/menu" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#7b4b31] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_-16px_rgba(91,65,45,0.8)] transition hover:-translate-y-0.5 hover:bg-[#694027] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4b31] focus-visible:ring-offset-2">
              {isEn ? "Explore the full collection" : "探索全店商品"}
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
