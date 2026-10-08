import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "網站使用條款及免責聲明",
  description:
    "毛毛港 Mofu Haven 網站使用條款、知識產權、產品資訊、寵物餵食免責聲明及適用法律。",
};

const sections = [
  {
    number: "一",
    title: "關於本網站與服務範疇",
    content: (
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[#8b573f]">
        <li>
          本網站專營日本直送之優質寵物食品、天然點心及寵物日常用品，服務對象主要為香港本地顧客。
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
          本店所售之零食大部分為 100% 天然純肉慢烘製成，絕無添加人工色素及防腐劑。每批次產品之顏色、形狀、氣味及乾燥度略有天然差異，或肉品表面呈現微白天然胺基酸結晶，均屬正常現象，並非品質瑕疵。
        </li>
        <li>
          <strong className="font-semibold text-[#4b352a]">寵物餵食與健康責任：</strong>
          <ul className="mt-3 list-disc space-y-3 pl-5 marker:text-[#a36b42]">
            <li>
              本網站提供的所有餵食指引、適口性說明及功效描述僅供日常養護參考，絕不構成專業醫療或獸醫診斷意見。
            </li>
            <li>
              每隻毛孩的年齡、體重、活動量、咀嚼習慣及過敏體質各有不同。餵食潔齒耐咬類產品時，主人務必在旁陪同監管，避免毛孩吞嚥過急造成哽塞。
            </li>
            <li>
              若愛寵患有特定疾病、嚴重過敏或正在接受治療，餵食前請務必諮詢閣下的註冊獸醫。因毛孩個人體質不適、挑食不進食或不當餵食引起的任何健康狀況，本店概不承擔任何法律責任。
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
          本網站如包含轉往第三方服務（包括但不限於 Stripe 支付平台、順豐速運物流追蹤、WhatsApp 聊天工具或外部社交平台）之連結，該等網站均由第三方獨立運營。閣下使用第三方服務所引致的任何損失或糾紛，本店概不負責。
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
          本店有權在不作事先通知之情況下，隨時對本網站內容、產品價格、促銷優惠、版面設計進行更正、補充、暫停或終止運作。
        </li>
        <li>
          對於因網絡連線中斷、電訊故障、伺服器維護、黑客攻擊或不可抗力事件（如天災、惡劣天氣暫停派送）而導致的任何使用不便或間接損失，本店在法律允許的最大範圍內免除一切責任。
        </li>
      </ol>
    ),
  },
  {
    number: "六",
    title: "適用法律及管轄權",
    content: (
      <p>
        本條款及條件受中華人民共和國香港特別行政區法律管轄並按其詮釋。因本網站服務所引起的任何爭議，均受香港特別行政區法院的專屬管轄權管轄。
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
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8a7163] sm:text-base">
            歡迎瀏覽「毛毛港 Mofu Haven」（以下簡稱「本網站」或「本店」）。本網站由毛毛港運營。在閣下使用本網站及進行任何訂購前，請仔細閱讀以下各項條款及政策。進入、瀏覽或使用本網站，即代表閣下已充分理解並同意受以下條款約束。
          </p>
        </header>

        <article className="mt-8 divide-y divide-stone-100 rounded-3xl border border-stone-100 bg-white shadow-sm sm:mt-10">
          {sections.map((section) => (
            <section key={section.number} className="px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7f1ed] text-sm font-semibold text-[#8b573f]">
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
