"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Product } from "@/lib/products";
import { HOME_FEATURED_PRODUCT_IDS } from "@/lib/home-featured-product-ids";

const NEW_ARRIVAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type ProductStatus = "featured" | "new-arrival" | "in-stock";

export function getProductStatuses(product: Pick<Product, "id" | "createdAt" | "inStock">): ProductStatus[] {
  const statuses: ProductStatus[] = [];
  if (HOME_FEATURED_PRODUCT_IDS.includes(product.id as (typeof HOME_FEATURED_PRODUCT_IDS)[number])) {
    statuses.push("featured");
  }
  if (product.createdAt && Date.now() - product.createdAt * 1000 <= NEW_ARRIVAL_WINDOW_MS) {
    statuses.push("new-arrival");
  }
  // 「現貨」只作為沒有精選或新上架提示時的可售狀態，避免三個
  // 真實標籤同時堆疊而遮擋產品圖片。
  if (product.inStock === true && statuses.length === 0) {
    statuses.push("in-stock");
  }
  return statuses;
}

const statusStyle: Record<ProductStatus, string> = {
  featured: "border-[#a97445]/45 bg-[#fff7e9]/95 text-[#704525]",
  "new-arrival": "border-[#63906f]/35 bg-[#edf7ef]/95 text-[#2f6240]",
  "in-stock": "border-[#7b9b83]/30 bg-white/95 text-[#4d7457]",
};

export function ProductStatusBadges({ product, className = "" }: { product: Product; className?: string }) {
  const { t } = useI18n();
  const statuses = getProductStatuses(product);
  if (!statuses.length) return null;

  return (
    <div className={`pointer-events-none absolute z-10 flex flex-col items-end gap-1 ${className}`} aria-label={t("badgeInStock")}>
      {statuses.map((status) => (
        <span
          key={status}
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold leading-4 shadow-[0_3px_12px_-8px_rgba(75,54,33,0.65)] ${statusStyle[status]}`}
        >
          {status === "featured"
            ? t("badgeFeatured")
            : status === "new-arrival"
              ? t("badgeNewArrival")
              : t("badgeInStock")}
        </span>
      ))}
    </div>
  );
}
