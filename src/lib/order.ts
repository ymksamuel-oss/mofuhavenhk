import type { TranslationKey } from "@/lib/i18n/translations";

export type LineItem = {
  key: Extract<
    TranslationKey,
    "itemDogFood" | "itemCatTreats" | "itemPetSupplement"
  >;
  qty: number;
  unit: number;
};

export const LINE_ITEMS: LineItem[] = [
  { key: "itemDogFood", qty: 1, unit: 168 },
  { key: "itemCatTreats", qty: 2, unit: 45 },
  { key: "itemPetSupplement", qty: 1, unit: 158 },
];

export const SHIPPING = 25;

export function calcSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unit, 0);
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MH${y}${m}${d}-${rand}`;
}
