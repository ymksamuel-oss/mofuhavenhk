import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" /> 資訊安全與保障
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 font-[family-name:var(--font-display)]">
              私隱政策與服務條款
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Mofu Haven（毛毛港）極度重視閣下的個人私隱。本政策詳細說明我們如何收集、使用及保護您的個人資料。
            </p>
          </div>

          {/* Core Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">嚴格保護私隱</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                所有客戶資料均受嚴密加密保護，絕不外洩予第三方商業用途。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">3-5日發貨與承諾</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                現貨商品確認後 3-5 個工作天內安排發貨，並提供 7 日退換貨保障。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">透明公開使用</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                資料僅限於訂單配送、順豐速運通知及專人客戶服務聯絡。
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-10 space-y-8 text-sm md:text-base leading-relaxed text-foreground/80">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 1. 保護客戶私隱政策聲明
              </h2>
              <p>
                Mofu Haven（毛毛港）尊重並嚴格保護每一位顧客的個人私隱。當您瀏覽本網站或使用我們的網上選購與結帳服務時，我們承諾遵從香港《個人資料（私隱）條例》（PDPO）之規定，妥善保管閣下的個人資料。
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 2. 我們收集的資料及使用目的
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">聯絡及配送資料：</strong>包括收件人姓名、香港電話號碼、送貨地址及順豐站/智能櫃代碼，僅用於安排商品派遞及發貨通知。</li>
                <li><strong className="text-foreground">交易及通訊紀錄：</strong>如閣下透過 WhatsApp 或電郵與我們聯絡或查詢寵物用品細節，相關紀錄將有助我們提供更貼心的售後支援。</li>
                <li><strong className="text-foreground">付款安全保障：</strong>信用卡及電子錢包（如 Apple Pay、WeChat Pay、AlipayHK）付款均經由獲 PCI-DSS 認證的 Stripe 安全加密處理，本網站不會儲存您的完整信用卡敏感資料。</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 3. 發貨時效與物流安排（3-5日發貨）
              </h2>
              <p>
                為確保愛寵能盡快享用優質日本糧食與好物，Mofu Haven 現貨商品承諾在確認訂單及付款後之 <strong className="text-foreground font-semibold">3-5 個工作天內</strong> 安排香港順豐速運寄出；日本直送及預購商品則於集單後約 7-14 個工作天到港發貨。若因公眾假期或特殊情況導致延誤，我們將主動通知您。
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 4. 退換貨政策（7日退換貨保障）
              </h2>
              <p>
                我們致力提供最高標準的商品品質。若閣下收到商品後發現包裝破損、貨品瑕疵或寄錯款式，享有 <strong className="text-foreground font-semibold">7 日退換貨保障</strong>。請於簽收後 7 天內保持商品原貌、未開封及包裝完整，並拍照經 WhatsApp 聯絡我們，我們將盡快為你安排退換貨或退款事宜。
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 5. 條款修改與查詢
              </h2>
              <p>
                本私隱政策與服務條款可能會隨時更新，修改後之版本將直接發佈於本頁面上。如對本政策或資料私隱有任何疑問，歡迎隨時透過電郵 <a href="mailto:hello@mofuhavenhk.com" className="text-primary underline">hello@mofuhavenhk.com</a> 或 WhatsApp 與我們聯絡。
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
