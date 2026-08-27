"use client";

import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n/I18nProvider";

type OutOfStockOrderButtonProps = {
  productId: string;
  productName: { zh: string; en: string };
  className?: string;
};

/**
 * A customer-initiated WhatsApp enquiry for an unavailable product.
 * It deliberately does not add a sold-out product to the basket or checkout.
 */
export function OutOfStockOrderButton({
  productId,
  productName,
  className = "",
}: OutOfStockOrderButtonProps) {
  const { locale, t } = useI18n();
  const name = productName[locale] || productName.zh || productName.en;
  const enquiryMessage = locale === "zh"
    ? `你好，我想查詢以下暫時缺貨商品的訂貨安排：\n\n商品：${name}\n商品編號：${productId}\n\n請問預計補貨／代訂時間及訂購方式？謝謝。`
    : `Hello, I would like to enquire about ordering this temporarily out-of-stock product:\n\nProduct: ${name}\nProduct ID: ${productId}\n\nCould you please advise the expected restock or special-order timing and ordering arrangement? Thank you.`;
  const href = getShopWhatsAppChatUrl(enquiryMessage);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl border border-[#25D366] bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
    >
      {t("productOrderInquiryCta")}
    </a>
  );
}
