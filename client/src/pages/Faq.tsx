import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail, HelpCircle, Package, RefreshCcw, ShieldCheck } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb / Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> 常見問題與協助
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 font-[family-name:var(--font-display)]">
              常見問題 (FAQ)
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              為你解答關於日本直送寵物用品、發貨時效、退換貨政策以及私隱保障的所有疑問。
            </p>
          </div>

          {/* Quick Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">3-5日發貨承諾</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                現貨商品下單後 3-5 個工作天內安排香港順豐發貨，讓你和愛寵快速收件。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">7日退換貨政策</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                收到商品後享有 7 日退換貨保障，如有瑕疵或運送損壞專人協助更換。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">保護客戶私隱</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                嚴格保護閣下個人資料，訂單及聯絡資訊僅用於購物配送與貼心客服。
              </p>
            </div>
          </div>

          {/* Accordion Questions */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-10">
            <h2 className="text-xl font-bold text-foreground mb-6 pb-3 border-b border-border">
              熱門常見問題
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-background">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                  1. Mofu Haven 的商品是正版日本直送嗎？
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  是的！Mofu Haven（毛毛港）專營日本優質寵物糧食及用品，所有上架商品均由日本原裝直輸或經香港正規授權代理嚴選引進，100% 正版正貨，請各位家長放心選購。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-background">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                  2. 訂單發貨需要多少時間？（3-5日發貨）
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  針對現貨商品，我們承諾在確認付款後 <strong className="text-foreground font-semibold">3-5 個工作天內</strong> 安排香港順豐速運發貨。如屬日本預購商品，則會於每週定期集單後約 7-14 個工作天抵港寄出。若有急需或特殊安排，歡迎隨時 WhatsApp 聯絡我們查詢。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-background">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                  3. 如果收到商品有問題，有退換貨保障嗎？（7日退換貨）
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  我們提供 <strong className="text-foreground font-semibold">7 日退換貨政策</strong>。若閣下收到的商品出現破損、瑕疵或寄錯款式，請於簽收後 7 天內保持商品原貌及包裝完整，並拍照透過 WhatsApp 或電郵聯絡我們，我們將有專人為你安排退換貨服務。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-background">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                  4. Mofu Haven 如何保護我的個人私隱？
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  我們高度重視客戶私隱。閣下在網站填寫的姓名、電話、地址及電郵等資料，<strong className="text-foreground font-semibold">僅會嚴格用於處理訂單配送、順豐寄送通知及客戶服務聯絡</strong>，絕不會向第三方出售或泄露。付款過程亦經由 Stripe 等安全加密通道處理，確保交易萬無一失。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border/60 rounded-xl px-4 bg-background">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4">
                  5. 運送方式及運費點樣計算？
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  本店預設採用「順豐速運 (SF Express)」派遞，支援全港順豐站、智能櫃、工商及住宅地址。全店購物滿指定金額即享本地免運費優惠（詳情可參閱首頁公告或結帳頁面）。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Need More Help CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">還有其他疑問嗎？</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              我們的客服團隊隨時樂意為你解答關於毛孩糧食、過敏成分或訂單進度的任何問題。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/85298646585?text=Mofu%20Haven%20%E2%80%94%20WhatsApp%20%E5%B0%88%E4%BA%BA%E6%9F%A5%E8%A9%A2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-90 transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp 專人查詢
              </a>
              <a
                href="mailto:hello@mofuhavenhk.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background border border-border text-foreground font-semibold text-sm shadow-sm hover:border-primary transition"
              >
                <Mail className="w-4 h-4" /> 發送電郵查詢
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
