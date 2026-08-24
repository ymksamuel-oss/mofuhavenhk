"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

/**
 * Floating WhatsApp Widget
 * Position: Bottom-right corner across all pages
 * Design: High contrast, smooth hover/tap animation, mobile-friendly touch target.
 */
export function FloatingWhatsApp() {
  const [footerVisible, setFooterVisible] = useState(false);
  const chatUrl = getShopWhatsAppChatUrl(
    "Hello Mofu Haven! 🐾 我想查詢有關日本寵物用品及發貨詳情。"
  );

  useEffect(() => {
    const footer = document.getElementById("site-footer-root");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!chatUrl) return null;

  return (
    <aside
      aria-label="WhatsApp 快速客服"
      className={`fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-4 z-50 transition-all duration-200 sm:bottom-6 sm:right-6 ${
        footerVisible
          ? "pointer-events-none translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="透過 WhatsApp 聯絡 @MofuHavenHK 專人查詢"
        className="group relative flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-white sm:gap-2.5 sm:px-4 sm:py-3 shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-[0_14px_30px_-5px_rgba(37,211,102,0.6)] active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        <MessageCircle className="h-6 w-6 fill-current text-white" />
        <span className="hidden text-sm font-semibold tracking-wide sm:inline-block">
          @MofuHavenHK 專人查詢
        </span>
      </a>
    </aside>
  );
}
