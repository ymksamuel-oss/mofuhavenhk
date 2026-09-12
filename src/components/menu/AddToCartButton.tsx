"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { MAX_QTY, MIN_QTY, PET_BUNDLE_QUANTITIES, petBundleDiscountPercent } from "@/lib/order";
import { useCart } from "@/lib/shop/cart";

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
};

const PET_QUICK_QUANTITIES = [8, 12, 16, 24] as const;

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
  const discountPercent = product && isPetProduct
    ? petBundleDiscountPercent(product, qty)
    : 0;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2250);
    return () => window.clearTimeout(timer);
  }, [added, toastKey]);

  const setSafeQty = (value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.min(MAX_QTY, Math.max(MIN_QTY, Math.floor(value)));
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
        aria-label={locale === "en" ? "Purchase quantity" : "購買件數"}
        className="h-9 w-16 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)]"
      />
      <button type="button" onClick={increase} disabled={!purchasable || qty >= MAX_QTY} aria-label={t("qtyIncrease")} className={stepperBtnClass}>+</button>
    </div>
  );
  const add = (event: React.MouseEvent) => {
    stop(event);
    if (!purchasable) return;
    addItem(productId, qty, priceId);
    setAdded(true);
    setToastKey((key) => key + 1);
    setSafeQty(MIN_QTY);
    if (typeof window !== "undefined" && size !== "card") {
      window.dispatchEvent(new CustomEvent("mofu:open-cart-drawer"));
    }
  };
  const discountMessage = discountPercent === 10
    ? locale === "en" ? "10% off applied" : "已享 9 折優惠"
    : discountPercent === 15
      ? locale === "en" ? "15% off applied" : "已享 85 折優惠"
      : null;
  const promotionHint = locale === "en"
    ? "💡 Buy 8 or more to enjoy 10% off! Buy 16 or more for 15% off!"
    : "💡 凡購買滿 8 件或以上即享 9 折優惠！滿 16 件更可享 85 折優惠！";
  const quickChoices = (
    <div className="flex flex-wrap justify-center gap-1.5" onClick={stop} aria-label={locale === "en" ? "Bulk quantity shortcuts" : "量販快捷選擇"}>
      {PET_QUICK_QUANTITIES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setSafeQty(option)}
          disabled={!purchasable}
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${qty === option ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}
        >
          {locale === "en" ? `${option} units` : `${option} 件`}
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
        aria-label={locale === "en" ? `Add ${product?.name.en ?? "product"} to cart` : `將${product?.name.zh ?? "商品"}加入購物車`}
        aria-live="polite"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 active:scale-90 disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 ${added ? "bg-emerald-600" : "bg-[color:var(--accent)] hover:bg-[color:var(--hero-deep)]"}`}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{!purchasable ? t("productSoldOut") : t("menuAddToCart")}</span>
      </button>
      {added && typeof document !== "undefined" ? createPortal(
        <div
          key={toastKey}
          role="status"
          aria-live="polite"
          className="cart-add-toast pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[100] flex w-[min(23rem,calc(100vw-2rem))] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(11,101,62,0.72)]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex-1">{locale === "en" ? "Added to cart successfully" : "已成功加入購物車"}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700">+1</span>
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
        {isPetProduct ? quickChoices : null}
        {isPetProduct ? <p className={`text-center font-semibold leading-5 text-[#c0483a] ${compact ? "text-[10px]" : "text-xs"}`} role="note">{promotionHint}</p> : null}
      </div> : null}
      {discountMessage ? <p className={`text-center font-semibold text-[#c0483a] ${compact ? "text-[10px]" : "text-xs"}`} role="status">{discountMessage}</p> : null}
      <button type="button" onClick={add} disabled={!purchasable} aria-live="polite" className={`inline-flex w-full items-center justify-center rounded-2xl font-semibold text-white shadow-[0_10px_24px_-12px_rgba(122,75,49,0.58)] transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[color:var(--muted)] disabled:opacity-70 disabled:shadow-none ${added ? "bg-emerald-600 hover:bg-emerald-600 animate-[fadeUp_0.25s_ease_both]" : "bg-[color:var(--accent)] hover:-translate-y-0.5 hover:bg-[color:var(--hero-deep)] hover:shadow-[0_14px_28px_-14px_rgba(84,57,45,0.6)]"} ${size === "modal" ? "px-4 py-3 text-sm" : "px-4 py-2.5 text-xs"}`}>
        {!purchasable ? t("productSoldOut") : added ? t("menuAddedToCart") : t("menuAddToCart")}
      </button>
    </div>
  );
}

export { PET_BUNDLE_QUANTITIES };
