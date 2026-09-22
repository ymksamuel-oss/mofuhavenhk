"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { discountedUnitPrice, FREE_SHIPPING_THRESHOLD, MAX_QTY, MIN_QTY, PET_BUNDLE_QUANTITIES, petBundleDiscountPercent } from "@/lib/order";
import { formatMoney } from "@/lib/i18n/translations";
import { useCart } from "@/lib/shop/cart";
import { trackMetaEvent } from "@/components/MetaPixel";
import { celebrateBulkTier } from "@/lib/celebrateBulkTier";

type AddToCartButtonProps = {
  productId: string;
  priceId?: string;
  className?: string;
  size?: "card" | "modal" | "list";
  showQuantity?: boolean;
  /** Pet product surfaces show bulk quick choices alongside the free-entry stepper. */
  quantityOptions?: readonly number[];
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  compact?: boolean;
  showTotal?: boolean;
  unitPrice?: number;
  showBulkShortcuts?: boolean;
};

type ToastOrigin = { x: number; y: number };

const PET_QUICK_QUANTITIES = [4, 8, 12] as const;
const CELEBRATION_QUANTITIES = new Set(PET_QUICK_QUANTITIES);

export function AddToCartButton({
  productId,
  priceId,
  className = "",
  size = "card",
  showQuantity = true,
  quantityOptions,
  quantity: controlledQty,
  onQuantityChange,
  compact = false,
  showTotal = false,
  unitPrice,
  showBulkShortcuts = true,
}: AddToCartButtonProps) {
  const { t, locale } = useI18n();
  const { getProductById } = useCatalog();
  const { addItem } = useCart();
  const product = getProductById(productId);
  const purchasable = Boolean(product && product.inStock !== false);
  const isPetProduct = Boolean(quantityOptions?.length);
  const [internalQty, setInternalQty] = useState(MIN_QTY);
  const qty = controlledQty ?? internalQty;
  const [added, setAdded] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [toastOrigin, setToastOrigin] = useState<ToastOrigin | null>(null);
  const discountPercent = product && isPetProduct
    ? petBundleDiscountPercent(product, qty)
    : 0;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => {
      setAdded(false);
      setToastOrigin(null);
    }, size === "card" ? 1800 : 1600);
    return () => window.clearTimeout(timer);
  }, [added, size, toastKey]);

  const setSafeQty = (value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.min(MAX_QTY, Math.max(MIN_QTY, Math.floor(value)));
    if (next !== qty && CELEBRATION_QUANTITIES.has(next as (typeof PET_QUICK_QUANTITIES)[number])) celebrateBulkTier();
    onQuantityChange?.(next);
    if (controlledQty === undefined) setInternalQty(next);
  };
  const decrease = () => setSafeQty(qty - 1);
  const increase = () => setSafeQty(qty + 1);
  const stop = (event: React.MouseEvent | React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const stepperBtnClass = size === "list"
    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-base font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40";
  const stepper = (
    <div className="flex items-center gap-1.5" onClick={stop}>
      <button type="button" onClick={decrease} disabled={!purchasable || qty <= MIN_QTY} aria-label={t("qtyDecrease")} className={stepperBtnClass}>−</button>
      <input
        type="number"
        min={MIN_QTY}
        max={MAX_QTY}
        value={qty}
        onChange={(event) => setSafeQty(Number(event.target.value))}
        onClick={stop}
        aria-label={locale === "en" ? "Purchase quantity" : "\u8cfc\u8cb7\u4ef6\u6578"}
        className="h-9 w-16 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)]"
      />
      <button type="button" onClick={increase} disabled={!purchasable || qty >= MAX_QTY} aria-label={t("qtyIncrease")} className={stepperBtnClass}>+</button>
    </div>
  );
  const add = (event: React.MouseEvent<HTMLButtonElement>) => {
    stop(event);
    if (!purchasable) return;
    if (size === "card") {
      const rect = event.currentTarget.getBoundingClientRect();
      setToastOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    addItem(productId, qty, priceId);
    const contentSku = product?.metadata?.mofu_sku?.trim() || productId;
    trackMetaEvent("AddToCart", {
      content_type: "product",
      content_ids: [contentSku],
      content_sku: contentSku,
      content_name: product?.name.zh || product?.name.en,
      value: Number(((unitPrice ?? product?.price ?? 0) * qty).toFixed(2)),
      currency: "HKD",
      quantity: qty,
    });
    setAdded(true);
    setToastKey((key) => key + 1);
    setSafeQty(MIN_QTY);
  };
  const discountMessage = discountPercent === 5
    ? locale === "en" ? "🎉 Congratulations! 5% off applied" : "🎉 \u606d\u559c\u4f60！\u5df2\u7372\u5f97 95 \u6298\u512a\u60e0！"
    : discountPercent === 10
    ? locale === "en" ? "🎉 Congratulations! 10% off applied" : "🎉 \u606d\u559c\u4f60！\u5df2\u7372\u5f97 9 \u6298\u512a\u60e0！"
    : discountPercent === 15
      ? locale === "en" ? "🎉 Congratulations! 15% off applied" : "🎉 \u606d\u559c\u4f60！\u5df2\u4eab\u6709 85 \u6298\u6700\u9ad8\u91cf\u8ca9\u512a\u60e0！"
      : null;
  const currentTotal = product
    ? Number((discountedUnitPrice(product, unitPrice ?? product.price, qty) * qty).toFixed(2))
    : 0;
  const currentOriginalTotal = Number(((unitPrice ?? product?.price ?? 0) * qty).toFixed(2));
  const currentSavings = Number(Math.max(0, currentOriginalTotal - currentTotal).toFixed(2));
  const freeShippingMessage = locale === "en"
    ? `Free local shipping unlocked at HK$${FREE_SHIPPING_THRESHOLD}`
    : `\u5df2\u4eab\u9806\u8c50\u672c\u5730\u514d\u904b\u8cbb\u512a\u60e0（\u6eff HK$${FREE_SHIPPING_THRESHOLD}）`;
  const nextTier = qty < 4 ? 4 - qty : qty < 8 ? 8 - qty : qty < 12 ? 12 - qty : 0;
  const promotionHint = locale === "en"
    ? nextTier > 0 ? `Buy ${nextTier} more to unlock your next bulk discount.` : "Your best 15% bulk discount is unlocked!"
    : nextTier > 0 ? `\u518d\u8cb7 ${nextTier} \u4ef6\u5373\u4eab ${qty < 4 ? "95 \u6298" : qty < 8 ? "9 \u6298" : "85 \u6298"} \u512a\u60e0！` : "\u5df2\u4eab\u6709 85 \u6298\u6700\u9ad8\u91cf\u8ca9\u512a\u60e0！";
  const quickChoices = (
    <div className="flex min-w-0 flex-wrap items-stretch gap-2 py-1" onClick={stop} aria-label={locale === "en" ? "Bulk quantity shortcuts" : "\u91cf\u8ca9\u5feb\u6377\u9078\u64c7"}>
      {PET_QUICK_QUANTITIES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setSafeQty(option)}
          disabled={!purchasable}
          className={`flex min-w-[4.85rem] flex-1 flex-col items-center rounded-xl border px-2 py-2 text-xs font-semibold transition sm:min-w-[5.5rem] ${qty === option ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_8px_18px_-12px_rgba(122,75,49,0.7)]" : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}
        >
          <span className="text-sm font-bold leading-5">{locale === "en" ? `${option} units` : `${option} \u4ef6`}</span>
          <span className={`mt-0.5 text-[10px] leading-4 ${qty === option ? "text-white/90" : "text-[#b04f40]"}`}>
            {option === 4
              ? (locale === "en" ? "5% off" : "95\u6298\u512a\u60e0")
              : option >= 12
                ? (locale === "en" ? "15% off" : "85\u6298・\u8d85\u503c")
                : (locale === "en" ? "10% off" : "9\u6298\u512a\u60e0")}
          </span>
        </button>
      ))}
    </div>
  );

  if (size === "card") return (
    <div className={`relative mt-0 flex justify-end ${className}`}>
      <button
        type="button"
        onClick={add}
        disabled={!purchasable}
        aria-label={locale === "en" ? `Add ${product?.name.en ?? product?.name.zh ?? "product"} to cart` : `\u5c07${product?.name.zh ?? product?.name.en ?? "\u5546\u54c1"}\u52a0\u5165\u8cfc\u7269\u8eca`}
        aria-live="polite"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 active:scale-90 disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 ${added ? "bg-[color:var(--hero-deep)]" : "bg-[color:var(--accent)] hover:bg-[color:var(--hero-deep)]"}`}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{!purchasable ? t("productSoldOut") : t("menuAddToCart")}</span>
      </button>
      {added && toastOrigin && typeof document !== "undefined" ? createPortal(
        <div
          key={toastKey}
          role="status"
          aria-live="polite"
          style={{
            left: Math.min(
              Math.max(toastOrigin.x, 104),
              window.innerWidth - 104,
            ),
            top: toastOrigin.y,
            transform: "translate(-50%, -50%)",
          }}
          className="cart-add-badge pointer-events-none fixed z-[100] flex h-14 w-48 max-w-[calc(100vw-1rem)] items-center justify-center gap-2 rounded-full border border-[#806153] bg-[#54392d] px-4 text-white shadow-[0_18px_45px_-18px_rgba(54,35,28,0.68)]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0]">
            <ShoppingCart className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-wide">
            {locale === "en" ? "Added to cart ✨" : "\u6210\u529f\u52a0\u5165\u8cfc\u7269\u8eca ✨"}
          </span>
        </div>
      , document.body) : null}
    </div>
  );

  if (size === "list") return (
    <div className={`flex items-center gap-2 ${className}`}>
      {stepper}
      <button type="button" onClick={add} disabled={!purchasable} aria-live="polite" className={`inline-flex shrink-0 items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 ${added ? "bg-emerald-600" : "bg-[color:var(--accent)] hover:bg-[color:var(--hero-deep)]"}`}>
        {!purchasable ? t("productSoldOut") : added ? t("menuAddedToCart") : t("menuAddToCart")}
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col ${compact ? "mt-0.5 gap-1.5" : size === "modal" ? "mt-6 gap-3" : "mt-1 gap-2"} ${className}`}>
      {showQuantity ? <div className="flex flex-col items-center gap-2" onClick={stop}>
        {stepper}
        {isPetProduct && showBulkShortcuts ? <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-center text-xs font-bold tracking-wide text-[color:var(--accent)]">{locale === "en" ? "Bulk savings" : "\u91cf\u8ca9\u512a\u60e0"}</p>
          {quickChoices}
        </div> : null}
        {isPetProduct && showBulkShortcuts ? <p className={`text-center font-semibold leading-5 text-[#c0483a] ${compact ? "text-[10px]" : "text-xs"}`} role="note">{promotionHint}</p> : null}
      </div> : null}
      {discountMessage ? <p className={`text-center font-semibold text-[#c0483a] ${compact ? "text-[10px]" : "text-xs"}`} role="status">{discountMessage}</p> : null}
      {showTotal ? <div className="space-y-1 text-center" aria-live="polite">
        <p className="text-lg font-bold tabular-nums text-[color:var(--accent)]">{t("total")}：{formatMoney(currentTotal, locale)}</p>
        {currentSavings > 0 ? <p className="text-xs font-semibold text-emerald-700">{locale === "en" ? `You save ${formatMoney(currentSavings, locale)}` : `\u5df2\u7701 ${formatMoney(currentSavings, locale)}`}</p> : null}
        {currentTotal >= FREE_SHIPPING_THRESHOLD ? <p className="text-xs font-semibold text-emerald-700">{freeShippingMessage}</p> : null}
      </div> : null}
      <button type="button" onClick={add} disabled={!purchasable} aria-live="polite" className={`inline-flex w-full items-center justify-center rounded-2xl font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 disabled:shadow-none ${added ? "bg-emerald-600 hover:bg-emerald-600 animate-[fadeUp_0.25s_ease_both]" : "bg-[color:var(--accent)] hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)]"} ${size === "modal" ? "px-4 py-3 text-sm" : "px-4 py-2.5 text-xs"}`}>
        {!purchasable ? t("productSoldOut") : added ? t("menuAddedToCart") : t("menuAddToCart")}
      </button>
    </div>
  );
}

export { PET_BUNDLE_QUANTITIES };
