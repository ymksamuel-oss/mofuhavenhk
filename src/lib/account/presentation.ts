export type AccountOrderItem = { id: string; name: string; quantity: number; unitPrice: number; image: string };

function clean(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseAccountOrderItems(value: unknown): AccountOrderItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const qty = Number(row.qty ?? row.quantity);
    const price = Number(row.price ?? row.unit ?? row.unit_price ?? 0);
    if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(price) || price < 0) return [];
    const nameValue = row.name;
    const name = typeof nameValue === "string"
      ? clean(nameValue)
      : nameValue && typeof nameValue === "object"
        ? clean((nameValue as Record<string, unknown>).zh || (nameValue as Record<string, unknown>).en)
        : "商品";
    return [{
      id: clean(row.id, 120) || `item-${index}`,
      name: name || "商品",
      quantity: Math.floor(qty),
      unitPrice: price,
      image: clean(row.image, 2000),
    }];
  });
}

export function accountOrderQuantity(items: unknown): number {
  return parseAccountOrderItems(items).reduce((sum, item) => sum + item.quantity, 0);
}

export function orderStatusLabel(status: unknown, locale: "zh" | "en"): string {
  const key = String(status ?? "").trim().toLowerCase().replaceAll("-", "_");
  const labels: Record<string, { zh: string; en: string }> = {
    pending: { zh: "待付款", en: "Awaiting payment" },
    awaiting_payment: { zh: "待付款", en: "Awaiting payment" },
    processing: { zh: "處理中", en: "Processing" },
    paid: { zh: "處理中", en: "Processing" },
    shipped: { zh: "已發貨", en: "Shipped" },
    completed: { zh: "已完成", en: "Completed" },
    fulfilled: { zh: "已完成", en: "Completed" },
    cancelled: { zh: "已取消", en: "Cancelled" },
    canceled: { zh: "已取消", en: "Cancelled" },
  };
  return labels[key]?.[locale] ?? (locale === "en" ? "Order update" : "訂單更新");
}

export function formatAccountMoney(value: unknown, locale: "zh" | "en"): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return "HK$0.00";
  return new Intl.NumberFormat(locale === "en" ? "en-HK" : "zh-HK", { style: "currency", currency: "HKD" }).format(number);
}

export function formatAccountDate(value: unknown, locale: "zh" | "en"): string {
  const date = new Date(String(value ?? ""));
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-HK" : "zh-HK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Hong_Kong" }).format(date);
}
