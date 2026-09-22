"use client";

import { getShopWhatsAppChatUrl } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { trackMetaEvent } from "@/components/MetaPixel";

type OutOfStockOrderButtonProps = {
  productId: string;
  productName: { zh: string; en: string };
  mofuSku?: string;
  className?: string;
};

/**
 * A customer-initiated WhatsApp enquiry for an unavailable product.
 * It deliberately does not add a sold-out product to the basket or checkout.
 */
export function OutOfStockOrderButton({
  productId,
  productName,
  mofuSku,
  className = "",
}: OutOfStockOrderButtonProps) {
  const { locale, t } = useI18n();
  const name = (locale === "en" ? productName.en : productName.zh) || productName.en || productName.zh || "\u5546\u54c1";
  const storeSku = mofuSku?.trim();
  const identifier = storeSku
    ? `${t("productSkuLabel")}: ${storeSku}`
    : `${t("productIdLabel")}: ${productId}`;
  const enquiryMessage = locale === "zh"
    ? `\u4f60\u597d，\u6211\u60f3\u67e5\u8a62\u4ee5\u4e0b\u66ab\u6642\u7f3a\u8ca8\u5546\u54c1\u7684\u8a02\u8ca8\u5b89\u6392：\n\n\u5546\u54c1：${name}\n${identifier}\n\n\u8acb\u554f\u9810\u8a08\u88dc\u8ca8／\u4ee3\u8a02\u6642\u9593\u53ca\u8a02\u8cfc\u65b9\u5f0f？\u8b1d\u8b1d。`
    : `Hello, I would like to enquire about ordering this temporarily out-of-stock product:\n\nProduct: ${name}\n${identifier}\n\nCould you please advise the expected restock or special-order timing and ordering arrangement? Thank you.`;
  const href = getShopWhatsAppChatUrl(enquiryMessage);

  if (!href) return null;

  return (
    <a
      href={href}
      onClick={() => trackMetaEvent("Lead", { content_type: "product", content_ids: [storeSku || productId], content_name: name, content_sku: storeSku || productId })}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-2xl border border-[#25D366] bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
    >
      {t("productOrderInquiryCta")}
    </a>
  );
}
