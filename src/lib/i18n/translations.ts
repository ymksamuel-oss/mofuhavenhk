export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "mofuhavenhk-locale";

export const translations = {
  zh: {
    brand: "Mofu Haven",
    navHome: "首頁",
    navMenu: "菜單",
    navCheckout: "結帳",
    langZh: "中",
    langEn: "EN",
    homeHeadline: "香港手作嫩豆腐甜品",
    homeSub: "現點現做，冷熱皆宜。把溫柔口感送到你手上。",
    homeCta: "前往結帳",
    checkoutTitle: "結帳",
    checkoutSubtitle: "確認訂單並選擇付款方式",
    orderSummary: "訂單摘要",
    itemMofu: "原味嫩豆腐",
    itemMatcha: "抹茶豆腐花",
    itemMango: "芒果豆腐雪糕",
    qty: "數量",
    subtotal: "小計",
    shipping: "運費",
    shippingNote: "香港本地配送",
    total: "總計",
    currency: "HK$",
    paymentTitle: "付款方式",
    paymentHint: "請選擇一種付款方式完成訂單",
    payOctopus: "八達通",
    payFps: "轉數快",
    payCard: "信用卡 / 扣帳卡",
    payPayme: "PayMe",
    placeOrder: "確認付款",
    secureNote: "付款資料經加密處理，安全可靠。",
  },
  en: {
    brand: "Mofu Haven",
    navHome: "Home",
    navMenu: "Menu",
    navCheckout: "Checkout",
    langZh: "中",
    langEn: "EN",
    homeHeadline: "Handmade silken tofu desserts in Hong Kong",
    homeSub: "Made to order, served hot or cold — soft texture, delivered with care.",
    homeCta: "Go to checkout",
    checkoutTitle: "Checkout",
    checkoutSubtitle: "Review your order and choose a payment method",
    orderSummary: "Order summary",
    itemMofu: "Classic silken tofu",
    itemMatcha: "Matcha tofu pudding",
    itemMango: "Mango tofu soft serve",
    qty: "Qty",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingNote: "Local Hong Kong delivery",
    total: "Total",
    currency: "HK$",
    paymentTitle: "Payment method",
    paymentHint: "Select one payment method to complete your order",
    payOctopus: "Octopus",
    payFps: "FPS",
    payCard: "Credit / debit card",
    payPayme: "PayMe",
    placeOrder: "Place order",
    secureNote: "Your payment details are encrypted and secure.",
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

export function formatMoney(amount: number, locale: Locale): string {
  const currency = translations[locale].currency;
  const formatted = amount.toLocaleString(locale === "zh" ? "zh-HK" : "en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}
