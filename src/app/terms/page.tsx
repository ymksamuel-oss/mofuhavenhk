import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "網站使用條款及免責聲明 | Mofu Haven",
  description:
    "毛毛港 Mofu Haven 網站使用條款、知識產權、產品資訊、寵物餵食免責聲明及適用法律。",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    number: "一",
    title: "關於本網站與服務範疇",
    content: (
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          本網站由毛毛港香港（Mofu Haven HK，以下稱「本店」）在香港特別行政區營運，提供寵物食品、零食及生活用品之展示、選購與相關顧客服務；商品供應以頁面最新資料、實際庫存及本店確認的訂單為準。
        </li>
        <li>
          閣下使用本網站之服務時，必須確保具備簽訂具法律約束力合約之行為能力，並確保所提供之登記及配送資料均屬真實、準確及完整。
        </li>
      </ol>
    ),
  },
  {
    number: "二",
    title: "知識產權與版權聲明",
    content: (
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          本網站刊登之所有內容，包括但不限於商標、文字、圖片、相片、影片、設計排版、網頁架構、程式代碼及資料庫，均屬毛毛港或已獲合法授權之合作方（包括日本 Best Partner 株式會社）擁有之知識產權，受香港及國際版權法保護。
        </li>
        <li>
          嚴禁任何人士在未經本店事先書面同意下，以任何形式（包括但不限於爬蟲抓取、截圖、轉載、複製、修改或散播）將本網站之圖文內容用於任何商業目的或公開展示。
        </li>
        <li>
          「Mofu Haven」、「毛毛港」及相關標誌均為本店品牌商標，未經許可嚴禁冒用或仿冒。
        </li>
      </ol>
    ),
  },
  {
    number: "三",
    title: "產品資訊、餵食建議及免責聲明",
    content: (
      <ol className="list-decimal space-y-5 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          <strong className="font-semibold text-[#4b352a]">資訊準確度：</strong>
          本店竭力確保本網站刊登之產品圖片、成分、營養分析及原廠資料準確無誤。然而，日本製造商或會不時更換包裝、調整產品配方或更新規格，實際商品細節請以收到的實物標籤為準。
        </li>
            <li>
              <strong className="font-semibold text-[#4b352a]">天然原料差異：</strong>
              部分產品以天然食材製成；天然原料及不同生產批次的顏色、形狀、氣味、質感或乾燥度可能略有差異。產品成分及特色請以該商品頁面和製造商包裝標示為準，天然差異本身不代表產品有品質問題。
            </li>
            <li>
              <strong className="font-semibold text-[#4b352a]">食品製作與初次餵食：</strong>
              本店所售零食均以 100% 天然食材製作，不添加防腐劑。每隻毛孩的體質、年齡、咬合力及食物過敏原各有不同；初次餵食建議先少量給予，並觀察 24 小時。
            </li>
            <li>
              <strong className="font-semibold text-[#4b352a]">寵物餵食與健康責任：</strong>
              <ul className="mt-3 list-disc space-y-3 pl-5 marker:text-[#a36b42]">
                <li>
                  耐咬潔齒骨類（例如牛大筋、原隻牛蹄）必須在飼主視線監護下餵食，避免毛孩急吞或哽塞。
                </li>
                <li>
                  本店商品均非處方藥品，不能替代專業獸醫的診斷、治療或醫療建議。本網站的餵食指引、適口性說明及功效描述僅供日常養護參考。
                </li>
                <li>
                  如毛孩患有疾病、嚴重過敏、特殊體質或正在接受治療，餵食前請先諮詢註冊獸醫；若出現不適，應停止餵食並尋求獸醫協助。任何重大健康決定均應遵從獸醫專業意見。本條不排除適用法律不得排除或限制的責任。
                </li>
          </ul>
        </li>
      </ol>
    ),
  },
  {
    number: "四",
    title: "外部連結與第三方網站",
    content: (
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          本網站歡迎其他正當合規網站建立連結，但嚴格拒絕來自涉及違法、欺詐、色情、侵權或違反公序良俗網站的連結。
        </li>
        <li>
          本網站可能連結至 Stripe、順豐速運、WhatsApp 或其他第三方服務，以處理付款、配送或聯絡。該等服務由第三方獨立營運，受其自身條款及私隱政策規管。本店不控制第三方網站的內容、可用性或資料處理，亦不就其服務中斷或其網站內容承擔責任；連結僅為方便使用，並不構成保證或背書。
        </li>
      </ol>
    ),
  },
  {
    number: "五",
    title: "服務中斷、修改與限制責任",
    content: (
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          本店可在適用法律容許範圍內更新、調整、暫停或終止網站內容或服務，並會在合理可行的情況下維持網站正常運作。
        </li>
        <li>
          網絡故障、系統維護、第三方服務中斷或不可抗力事件可能影響網站服務。本店在適用法律容許的最大範圍內，不承擔因使用或無法使用本網站所造成的間接或衍生損失；本條不排除或限制法律不得排除或限制的責任。
        </li>
      </ol>
    ),
  },
  {
    number: "六",
    title: "適用法律及管轄權",
    content: (
      <p>
        本條款受中華人民共和國香港特別行政區法律管轄並按其解釋。因本條款或使用本網站而產生的爭議，須提交香港特別行政區法院處理，但適用法律另有規定者除外。
      </p>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#62493b] sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[#8a7163] transition hover:text-[#a36b42]"
        >
          ← 返回首頁
        </Link>

        <header className="mt-8 border-b border-stone-100 pb-8 sm:mt-10 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a36b42]">
            Mofu Haven · Terms &amp; Disclaimer
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-[#4b352a] sm:text-4xl">
            網站使用條款及免責聲明
          </h1>
          <p className="mt-3 text-sm text-stone-500">最後更新：2026 年 10 月 8 日</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8a7163] sm:text-base">
            使用本網站或提交訂單前，請閱讀以下條款；網站供應及訂單安排以最新頁面資料、實際庫存、本店確認及適用購物政策為準。
          </p>
        </header>

        <article className="mt-8 divide-y divide-stone-100 rounded-3xl border border-stone-100 bg-white shadow-sm sm:mt-10">
          {sections.map((section) => (
            <section key={section.number} className="px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white text-sm font-semibold text-[#8b573f]">
                  {section.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-[#4b352a] sm:text-2xl">
                    {section.title}
                  </h2>
                  <div className="mt-5 text-[0.95rem] leading-8 text-[#62493b] sm:text-base">
                    {section.content}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </article>

        <p className="mt-8 text-center text-xs leading-6 text-[#a08b7e]">
          如對本條款有任何疑問，歡迎透過網站頁尾的 WhatsApp 或電郵聯絡毛毛港顧客服務。
        </p>
      </div>
    </main>
  );
}
