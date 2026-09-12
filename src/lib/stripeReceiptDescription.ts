import type { OrderItem } from "@/lib/order";

function money(value: number): string {
  return `HK$${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
}

/**
 * Stripe's hosted receipt uses the PaymentIntent description as its Summary
 * line and does not render arbitrary metadata as item rows. Keep the complete
 * compact order breakdown within Stripe's 500-character description limit.
 */
export function stripeReceiptDescription(
  items: readonly OrderItem[],
  orderNumber: string,
): string {
  const lines = items.map((item) => {
    const label = [item.name.en || item.name.zh || item.id, item.variantLabel?.en || item.variantLabel?.zh]
      .filter(Boolean)
      .join(" · ");
    return `${label} x${item.qty} @ ${money(item.unit)} = ${money(item.unit * item.qty)}`;
  });
  const prefix = `Mofu Haven order ${orderNumber}`;
  const full = `${prefix}\n${lines.join("\n")}`;
  return full.length <= 500 ? full : `${full.slice(0, 497)}...`;
}
