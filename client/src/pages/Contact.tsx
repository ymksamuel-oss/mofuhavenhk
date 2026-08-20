import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle, Mail, Clock, MapPin, PhoneCall, Package, RefreshCcw, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <PhoneCall className="w-3.5 h-3.5" /> 專人為你解答
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 font-[family-name:var(--font-display)]">
              聯絡我們
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              無論係想查詢日本直送寵物罐罐口味、訂單發貨進度，定係需要貓狗保健品建議，毛毛港團隊隨時樂意協助！
            </p>
          </div>

          {/* Core Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">3-5日發貨</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                現貨商品確認後 3-5 個工作天內安排香港順豐發貨。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">7日退換貨</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                享有 7 日退換貨政策保障，購物更安心。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-foreground mb-1">私隱保障</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                嚴格保護客戶私隱，資料僅用於訂單配送與客服。
              </p>
            </div>
          </div>

          {/* Contact Methods Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* WhatsApp Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm flex flex-col justify-between hover:border-primary/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">WhatsApp 專人查詢</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  最快得到回覆嘅方式！無論係查詢存貨、口味推介定訂單進度，隨時 WhatsApp 搵我哋。
                </p>
              </div>
              <a
                href="https://wa.me/85298646585?text=Mofu%20Haven%20%E2%80%94%20WhatsApp%20%E5%B0%88%E4%BA%BA%E6%9F%A5%E8%A9%A2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
              >
                <MessageCircle className="w-4 h-4" /> 立即開啟 WhatsApp 對話
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm flex flex-col justify-between hover:border-primary/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">客戶服務電郵</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  如果您有較詳細嘅合作查詢、批發事宜或意見反饋，歡迎隨時發送電郵俾我哋。
                </p>
              </div>
              <a
                href="mailto:hello@mofuhavenhk.com"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-background border border-border text-foreground font-semibold text-sm shadow-sm hover:border-primary transition"
              >
                <Mail className="w-4 h-4" /> hello@mofuhavenhk.com
              </a>
            </div>
          </div>

          {/* Operating Hours & Address Info */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground pb-3 border-b border-border">
              營業與服務資訊
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">客服服務時間</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    週一至週五 10:00 – 19:00<br />
                    (公眾假期可能稍有延誤，見諒)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">香港營運基地</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    香港九龍（主要提供網上選品及順豐速運直送全港，暫不設門市現貨自取）
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
