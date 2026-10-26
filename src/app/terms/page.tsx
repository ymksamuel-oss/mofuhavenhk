"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

type TermsSection = {
  number: string;
  title: string;
  items?: Array<string | { label: string; body: string; bullets?: string[] }>;
  paragraph?: string;
};

const ZH_SECTIONS: TermsSection[] = [
  { number: "一", title: "關於本網站與服務範疇", items: [
    "本網站由毛毛港香港（Mofu Haven HK，以下稱「本店」）在香港特別行政區營運，提供寵物食品、零食及生活用品之展示、選購與相關顧客服務；商品供應以頁面最新資料、實際庫存及本店確認的訂單為準。",
    "閣下使用本網站之服務時，必須確保具備簽訂具法律約束力合約之行為能力，並確保所提供之登記及配送資料均屬真實、準確及完整。",
  ] },
  { number: "二", title: "知識產權與版權聲明", items: [
    "本網站刊登之所有內容，包括但不限於商標、文字、圖片、相片、影片、設計排版、網頁架構、程式代碼及資料庫，均屬毛毛港或已獲合法授權之合作方（包括日本 Best Partner 株式會社）擁有之知識產權，受香港及國際版權法保護。",
    "嚴禁任何人士在未經本店事先書面同意下，以任何形式將本網站之圖文內容用於任何商業目的或公開展示。",
    "「Mofu Haven」、「毛毛港」及相關標誌均為本店品牌商標，未經許可嚴禁冒用或仿冒。",
  ] },
  { number: "三", title: "產品資訊、餵食建議及免責聲明", items: [
    { label: "資訊準確度：", body: "本店竭力確保本網站刊登之產品圖片、成分、營養分析及原廠資料準確無誤。然而，製造商或會更換包裝、調整配方或更新規格，實際商品細節請以收到的實物標籤為準。" },
    { label: "天然原料差異：", body: "天然原料及不同生產批次的顏色、形狀、氣味、質感或乾燥度可能略有差異；天然差異本身不代表產品有品質問題。" },
    { label: "食品製作與初次餵食：", body: "本店所售零食均以天然食材製作，不添加防腐劑。每隻毛孩的體質、年齡、咬合力及食物過敏原各有不同；初次餵食建議先少量給予，並觀察 24 小時。" },
    { label: "寵物餵食與健康責任：", body: "耐咬潔齒骨類必須在飼主視線監護下餵食，避免毛孩急吞或哽塞。商品均非處方藥品，不能替代獸醫的診斷、治療或醫療建議。如毛孩患有疾病、嚴重過敏、特殊體質或正在接受治療，餵食前請先諮詢註冊獸醫。", bullets: ["耐咬產品必須全程看顧。", "餵食指引及功效描述僅供日常養護參考。", "若出現不適，應停止餵食並尋求獸醫協助。"] },
  ] },
  { number: "四", title: "外部連結與第三方網站", items: [
    "本網站歡迎其他正當合規網站建立連結，但拒絕來自涉及違法、欺詐、色情、侵權或違反公序良俗網站的連結。",
    "本網站可能連結至 Stripe、順豐速運、WhatsApp 或其他第三方服務，以處理付款、配送或聯絡。該等服務由第三方獨立營運，受其自身條款及私隱政策規管。",
  ] },
  { number: "五", title: "服務中斷、修改與限制責任", items: [
    "本店可在適用法律容許範圍內更新、調整、暫停或終止網站內容或服務，並會在合理可行的情況下維持網站正常運作。",
    "網絡故障、系統維護、第三方服務中斷或不可抗力事件可能影響網站服務。本店在適用法律容許的最大範圍內，不承擔因使用或無法使用本網站所造成的間接或衍生損失。",
  ] },
  { number: "六", title: "適用法律及管轄權", paragraph: "本條款受中華人民共和國香港特別行政區法律管轄並按其解釋。因本條款或使用本網站而產生的爭議，須提交香港特別行政區法院處理，但適用法律另有規定者除外。" },
];

const EN_SECTIONS: TermsSection[] = [
  { number: "1", title: "About this website and our services", items: [
    "Mofu Haven HK operates this website in Hong Kong and provides information, purchasing access and customer support for pet food, treats and everyday pet essentials. Availability is subject to the latest page information, actual stock and our confirmed order arrangement.",
    "By using this website, you confirm that you have the capacity to enter a legally binding agreement and that all registration and delivery information you provide is true, accurate and complete.",
  ] },
  { number: "2", title: "Intellectual property and copyright", items: [
    "All content on this website, including trademarks, text, images, photography, video, visual design, site structure, code and databases, belongs to Mofu Haven or its authorised partners, including Best Partner Co., Ltd. in Japan, and is protected by Hong Kong and international copyright laws.",
    "You may not scrape, screenshot, reproduce, modify, distribute or publicly display this content for commercial purposes without our prior written consent.",
    "Mofu Haven, 毛毛港 and the associated marks are our trademarks and may not be used or imitated without permission.",
  ] },
  { number: "3", title: "Product information, feeding guidance and disclaimer", items: [
    { label: "Accuracy of information: ", body: "We work to keep product images, ingredients, analysis and manufacturer information accurate. Manufacturers may change packaging, recipes or specifications; the physical label on the product you receive is the final reference." },
    { label: "Natural variation: ", body: "Natural ingredients and production batches may vary slightly in colour, shape, aroma, texture or dryness. Natural variation alone does not indicate a quality issue." },
    { label: "First feeding: ", body: "Our treats are made from natural ingredients without preservatives. Every pet differs in age, body condition, chewing strength and sensitivities; introduce any new treat in a small amount and observe for 24 hours." },
    { label: "Pet health responsibility: ", body: "Long-lasting chews must be given under direct supervision to reduce the risk of gulping or choking. Our products are not prescription medicines and cannot replace veterinary diagnosis, treatment or advice. Consult a registered veterinarian before feeding if your pet has a disease, serious allergy, special condition or ongoing treatment.", bullets: ["Supervise pets throughout chewing. ", "Feeding guidance and product benefits are for everyday-care reference only.", "Stop feeding and seek veterinary help if your pet shows an adverse reaction."] },
  ] },
  { number: "4", title: "External links and third-party websites", items: [
    "We welcome links from legitimate, compliant websites but do not accept links from websites involving illegal, fraudulent, sexual, infringing or otherwise unlawful content.",
    "This website may link to Stripe, SF Express, WhatsApp and other third-party services for payment, delivery or communication. Those services operate independently under their own terms and privacy policies.",
  ] },
  { number: "5", title: "Service interruption, changes and limitation of liability", items: [
    "We may update, adjust, suspend or discontinue website content or services within the limits of applicable law, while taking reasonable steps to keep the website operating normally.",
    "Network failures, maintenance, third-party interruptions or events beyond our control may affect the service. To the fullest extent permitted by law, we are not liable for indirect or consequential loss arising from use of, or inability to use, this website.",
  ] },
  { number: "6", title: "Governing law and jurisdiction", paragraph: "These terms are governed by and interpreted under the laws of the Hong Kong Special Administrative Region of the People’s Republic of China. Disputes arising from these terms or use of this website will be submitted to the courts of Hong Kong, unless applicable law provides otherwise." },
];

export default function TermsPage() {
  const { locale } = useI18n();
  const en = locale === "en";
  const sections = en ? EN_SECTIONS : ZH_SECTIONS;
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#62493b] sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="inline-flex text-sm font-medium text-[#8a7163] transition hover:text-[#a36b42]">← {en ? "Back to home" : "返回首頁"}</Link>
        <header className="mt-8 border-b border-stone-100 pb-8 sm:mt-10 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a36b42]">Mofu Haven · Terms &amp; Disclaimer</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-[#4b352a] sm:text-4xl">{en ? "Terms of Use & Disclaimer" : "網站使用條款及免責聲明"}</h1>
          <p className="mt-3 text-sm text-stone-500">{en ? "Last updated: 8 October 2026" : "最後更新：2026 年 10 月 8 日"}</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8a7163] sm:text-base">{en ? "Please read these terms before using this website or placing an order. Supply and order arrangements follow the latest page information, actual stock, our confirmation and applicable shopping policies." : "使用本網站或提交訂單前，請閱讀以下條款；網站供應及訂單安排以最新頁面資料、實際庫存、本店確認及適用購物政策為準。"}</p>
        </header>
        <article className="mt-8 divide-y divide-stone-100 rounded-3xl border border-stone-100 bg-white shadow-sm sm:mt-10">
          {sections.map((section) => <section key={section.number} className="px-5 py-7 sm:px-8 sm:py-9"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white text-sm font-semibold text-[#8b573f]">{section.number}</span><div className="min-w-0 flex-1"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-[#4b352a] sm:text-2xl">{section.title}</h2><div className="mt-5 text-[0.95rem] leading-8 text-[#62493b] sm:text-base">{section.paragraph ? <p>{section.paragraph}</p> : <ol className="list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[#8b573f]">{section.items?.map((item, index) => <li key={index}>{typeof item === "string" ? item : <><strong className="font-semibold text-[#4b352a]">{item.label}</strong>{item.body}{item.bullets ? <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#a36b42]">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</>}</li>)}</ol>}</div></div></div></section>)}
        </article>
        <p className="mt-8 text-center text-xs leading-6 text-[#a08b7e]">{en ? "If you have any questions about these terms, please contact Mofu Haven customer service through the WhatsApp or email details in the site footer." : "如對本條款有任何疑問，歡迎透過網站頁尾的 WhatsApp 或電郵聯絡毛毛港顧客服務。"}</p>
      </div>
    </main>
  );
}
