"use client";

import { MessageCircle } from "lucide-react";
import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";

/**
 * Floating WhatsApp Widget
 * Position: Bottom-right corner across all pages
 * Design: High contrast, smooth hover/tap animation, mobile-friendly touch target.
 */
export function FloatingWhatsApp() {
  const chatUrl = getShopWhatsAppChatUrl(
    "Hello Mofu Haven! 🐾 我想查詢有關日本寵物用品及發貨詳情。"
  );

  if (!chatUrl) return null;

  return (
    <aside aria-label="WhatsApp 快速客服" className="fixed bottom-6 right-6 z-50">
      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="透過 WhatsApp 聯絡 @MofuHavenHK 專人查詢"
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-[0_14px_30px_-5px_rgba(37,211,102,0.6)] active:scale-95"
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
