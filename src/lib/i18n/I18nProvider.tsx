"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, translations, type Locale, type TranslationKey } from "./translations";
import jaDictionary from "./ja.json";

export type LanguageMode = Locale;
type I18nContextValue = {
  locale: Locale;
  languageMode: Locale;
  setLocale: (locale: Locale) => void;
  setLanguageMode: (mode: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LANGUAGE_OPTIONS: Locale[] = ["ja", "zh", "en"];
const JA_LABELS: Partial<Record<TranslationKey, string>> = {
  ...(jaDictionary as Partial<Record<TranslationKey, string>>),
  brand: "Mofu Haven", documentTitle: "Mofu Haven｜日本のペット用品", documentDescription: "日本から厳選したペットフードとペット用品を香港へお届けします。",
  navHome: "ホーム", navMenu: "商品一覧", navCategories: "商品カテゴリー", navCategoriesCats: "猫ちゃん", navCategoriesDogs: "わんちゃん", navHeaderLifestyle: "ペット用品", navCheckout: "お会計", navCart: "カート",
  navCategoriesHint: "猫ちゃん、わんちゃん、毎日のペット用品", navCategoriesBrowseAll: "すべての商品を見る", headerLanguageLabel: "言語", navOpenMenu: "メニューを開く", navCloseMenu: "メニューを閉じる",
  homeCta: "今すぐ選ぶ", goToCatalog: "商品一覧へ", viewProductAria: "商品を見る", productViewDetails: "詳細を見る", cartDrawerTitle: "カート", cartDrawerCheckoutCta: "お会計へ", checkoutTitle: "お会計", placeOrder: "お支払いを確定",
  allProducts: "すべて", categoryCats: "猫ちゃん商品", categoryDogs: "わんちゃん商品", menuAddToCart: "カートに追加", menuAddedToCart: "カートに追加しました", productSoldOut: "売り切れ",
  productIngredientsLabel: "原材料", productGuaranteedAnalysisLabel: "保証成分", productOriginLabel: "原産国", productStorageLabel: "保存方法",
  checkoutSubtitle: "ご注文内容を確認してお支払い方法を選択してください", checkoutCustomerFallback: "お客様",
  originalSubtotal: "商品原価小計", bulkDiscount: "まとめ買い割引", freeOverHk450: "HK$450以上で送料無料",
  discountApplied: "{percent}%割引が適用されました",
  shippingContactTitle: "お届け先情報", shippingContactHint: "入力した情報は注文通知と電子レシートの送付に使用します。",
  customerNameLabel: "お名前", customerNamePlaceholder: "お名前を入力してください", customerNameRequired: "お名前を入力してください。",
  receiptEmailLabel: "メールアドレス", receiptEmailPlaceholder: "例：hello@example.com",
  customerPhoneLabel: "お電話番号", customerPhonePlaceholder: "例：91234567", customerPhonePlaceholderHk: "香港の電話番号（8桁）例：91234567", customerPhoneHintHk: "+852が初期設定です。香港の電話番号は8桁で入力してください。",
  phoneCountryLabel: "国／地域番号", shippingDistrictLabel: "地域", shippingDistrictPlaceholder: "地域を選択", shippingDistrictRequired: "地域を選択してください。",
  shippingAddressLabel: "お届け先住所", shippingAddressPlaceholder: "通り名・建物名・部屋番号", shippingAddressRequired: "お届け先住所を入力してください。",
  shippingAddressLine2Label: "建物名・部屋番号（任意）", shippingAddressLine2Placeholder: "建物名・部屋番号（任意）",
  sfStationLabel: "SF Express / ロッカー番号（任意）", sfStationPlaceholder: "例：FRT123 またはロッカー番号", sfStationHint: "SF Expressの駅またはスマートロッカーへの配送をご希望の場合は、ステーション／ロッカー番号を入力してください。",
  shipping: "送料", shippingNote: "1～2営業日で発送・お届けまで5～7営業日", total: "合計", orderSummary: "注文概要", qty: "数量", subtotal: "小計",
};

function dictionaryFor(locale: Locale) {
  return locale === "en" ? translations.en : translations.zh;
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "ja";
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query && LANGUAGE_OPTIONS.includes(query as Locale)) return query as Locale;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && LANGUAGE_OPTIONS.includes(stored as Locale) ? stored as Locale : "ja";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = readStoredLocale();
    setLocaleState(next);
    document.documentElement.lang = next === "zh" ? "zh-HK" : next;
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next === "zh" ? "zh-HK" : next;
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    languageMode: locale,
    setLocale,
    setLanguageMode: setLocale,
    t: (key) => locale === "ja" ? (JA_LABELS[key] || translations.zh[key]) : dictionaryFor(locale)[key],
  }), [locale, setLocale]);

  useEffect(() => {
    if (!hydrated) return;
    const fallback = dictionaryFor(locale);
    document.title = locale === "ja" ? (JA_LABELS.documentTitle || fallback.documentTitle) : fallback.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", locale === "ja" ? (JA_LABELS.documentDescription || fallback.documentDescription) : fallback.documentDescription);
  }, [hydrated, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { locale: "ja" as const, languageMode: "ja" as const, setLocale: () => {}, setLanguageMode: () => {}, t: (key: TranslationKey) => translations.zh[key] || key };
  return ctx;
}
