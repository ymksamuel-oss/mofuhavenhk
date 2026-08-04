import type { ShippingContact } from "@/components/checkout/ShippingContactForm";
import type { OrderItem } from "@/lib/order";

export const RECEIPT_STORAGE_KEY = "mofuhavenhk-receipts";

export type ReceiptRecord = {
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentLabel: string;
  customerName: string;
  contact: ShippingContact;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveReceipt(record: ReceiptRecord) {
  if (!canUseStorage()) return;
  try {
    const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, ReceiptRecord>) : {};
    parsed[record.orderNumber] = record;
    window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Best-effort convenience storage only.
  }
}

export function getReceipt(orderNumber: string): ReceiptRecord | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, ReceiptRecord>;
    return parsed[orderNumber] ?? null;
  } catch {
    return null;
  }
}
