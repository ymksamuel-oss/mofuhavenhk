import { Separator } from "@/components/ui/separator";
import { Mail, MessageCircle } from "lucide-react";

/**
 * Footer Component
 * Design: Japanese Healing Aesthetic
 * - Warm background
 * - Clear information hierarchy
 * - Contact methods highlighted
 * - Enhanced brand identity
 */
export default function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 bg-gradient-to-b from-secondary/10 to-primary/5 border-t border-border mt-16 md:mt-24">
      <div className="container py-12 md:py-16">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Section - Enhanced Wordmark */}
          <div className="md:col-span-1">
            <a href="/" className="inline-block group mb-4">
              <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                <span className="flex w-8 h-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                  毛
                </span>
                <div>
                  <h3 className="font-bold text-foreground">毛毛港</h3>
                  <p className="text-xs text-primary font-semibold">Mofu Haven</p>
                </div>
              </div>
            </a>
            <p className="text-sm text-foreground/70 leading-relaxed">
              專營日本優質寵物糧食及用品，為愛寵提供最安心的選擇。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">快捷連結</h4>
            <ul className="space-y-2">
              {[
                { label: "全部商品", href: "#products" },
                { label: "關於我們", href: "#about" },
                { label: "常見問題", href: "#contact" }
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200 relative group/link"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover/link:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">顧客服務</h4>
            <ul className="space-y-2">
              {[
                { label: "運送與發貨政策", href: "#contact" },
                { label: "退換貨政策", href: "#contact" },
                { label: "私隱政策與服務條款", href: "#contact" }
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200 relative group/link"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover/link:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Highlighted */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">聯絡我們</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/85298646585?text=Mofu%20Haven%20%E2%80%94%20WhatsApp%20%E5%B0%88%E4%BA%BA%E6%9F%A5%E8%A9%A2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors duration-200 group/contact"
              >
                <MessageCircle className="w-4 h-4 group-hover/contact:scale-110 transition-transform" />
                WhatsApp 查詢
              </a>
              <a
                href="mailto:hello@mofuhavenhk.com"
                className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors duration-200 group/contact"
              >
                <Mail className="w-4 h-4 group-hover/contact:scale-110 transition-transform" />
                hello@mofuhavenhk.com
              </a>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                <span className="font-semibold text-foreground/70">服務時間</span><br />
                週一至週五 10:00 – 19:00
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 Mofu Haven. All Rights Reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs text-muted-foreground font-medium">接受付款方式：</span>
            <div className="flex items-center gap-3">
              {["WeChat Pay", "AlipayHK", "Visa", "Mastercard"].map((method, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium text-foreground/70 px-2 py-1 bg-white/50 rounded-full"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
