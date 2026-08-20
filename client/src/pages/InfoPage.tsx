import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type InfoPageKey = "about" | "faq" | "shipping-policy" | "returns-policy" | "privacy-policy";

type InfoPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
};

const pageContent: Record<InfoPageKey, InfoPageContent> = {
  about: {
    eyebrow: "關於 Mofu Haven",
    title: "讓每一次照顧，都有一點日系的溫柔",
    intro: "Mofu Haven 專注於嚴選日本寵物糧食與用品，為貓貓、狗狗及小動物整理安心、實用又有生活感的好物。",
    sections: [
      { heading: "我們的選物理念", body: "從日常飲食、零食到居家用品，我們優先選擇成分清晰、使用方便並且能融入家庭生活的產品。" },
      { heading: "給毛孩的慢慢挑選", body: "網站以清楚的商品分類、完整介紹和安全結帳流程，讓你可以按需要慢慢比較，不用急著作決定。" },
    ],
  },
  faq: {
    eyebrow: "常見問題",
    title: "購買前想知道的事",
    intro: "以下整理 Mofu Haven 最常見的購物問題。如仍需要協助，歡迎透過電郵或 WhatsApp 查詢。",
    sections: [
      { heading: "商品資料從哪裡來？", body: "商品名稱、價格、可售狀態及圖片會以目前已核實的商品資料為準；部分商品圖片仍在逐步補全。" },
      { heading: "如何查詢商品？", body: "你可以在商品頁輸入關鍵字，或使用貓咪、狗狗、零食及其他分類按鈕縮小範圍。" },
      { heading: "付款遇到問題怎麼辦？", body: "請保留錯誤畫面並聯絡我們，我們會協助核對商品價格及付款連接狀態。" },
    ],
  },
  "shipping-policy": {
    eyebrow: "顧客服務",
    title: "運送與發貨政策",
    intro: "我們會按照訂單資料及配送地區安排發貨，實際運送時間會受庫存、假期及物流安排影響。",
    sections: [
      { heading: "出貨安排", body: "訂單確認後，我們會先核對商品及地址資料，再安排包裝及交給物流配送。若商品需要補貨，客服會主動聯絡。" },
      { heading: "收貨提醒", body: "請於下單時確認收貨人姓名、電話及地址正確。物流派送期間請留意電話或短訊通知。" },
    ],
  },
  "returns-policy": {
    eyebrow: "顧客服務",
    title: "退換貨政策",
    intro: "如收到商品時發現運送損壞、錯誤或明顯品質問題，請盡快聯絡我們並提供訂單資料及照片。",
    sections: [
      { heading: "申請方式", body: "請在收貨後保留商品、包裝及相關證明，透過電郵或 WhatsApp 聯絡客服，以便我們核對情況。" },
      { heading: "食品及衛生用品", body: "基於衛生及安全考量，已開封或非品質問題的食品、零食及個人衛生用品一般不適用於退換。" },
    ],
  },
  "privacy-policy": {
    eyebrow: "網站政策",
    title: "私隱政策與服務條款",
    intro: "我們重視你的私隱，只會在處理訂單、回覆查詢及改善網站服務所需的範圍內使用資料。",
    sections: [
      { heading: "資料使用", body: "我們不會出售你的個人資料。訂單及聯絡資料只會按必要用途處理，並由授權服務供應商協助完成相關服務。" },
      { heading: "網站使用", body: "使用本網站即表示你同意以當時顯示的商品資料、價格、可售狀態及服務安排為準；如有疑問，請先聯絡我們。" },
    ],
  },
};

export default function InfoPage({ page }: { page: InfoPageKey }) {
  const content = pageContent[page];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-[#F7F3EE] py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="rounded-[2rem] border border-primary/15 bg-[#FFFDF9] jp-card-shadow p-6 md:p-12">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {content.eyebrow}
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-5xl">{content.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/70 md:text-lg">{content.intro}</p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {content.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-border/70 bg-[#FFFDF9] jp-card-shadow p-5 md:p-6">
                  <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
                  <p className="mt-3 text-sm leading-7 text-foreground/70">{section.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#B88A58] text-white hover:bg-[#A67C52]">
                <Link href="/products">瀏覽全部商品</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-[#B88A58]/60 text-[#736859] hover:bg-[#F7F3EE]">
                <Link href="/"><ArrowLeft className="h-4 w-4" />返回首頁</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
