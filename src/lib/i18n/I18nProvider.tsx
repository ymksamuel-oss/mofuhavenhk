"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, translations, type Locale, type TranslationKey } from "./translations";

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
  brand: "Mofu Haven", documentTitle: "Mofu Haven｜日本のペット用品", documentDescription: "日本から厳選したペットフードとペット用品を香港へお届けします。",
  navHome: "ホーム", navMenu: "商品一覧", navCategories: "商品カテゴリー", navCategoriesCats: "猫ちゃん", navCategoriesDogs: "わんちゃん", navHeaderLifestyle: "ペット用品", navCheckout: "お会計", navCart: "カート",
  navCategoriesHint: "猫ちゃん、わんちゃん、毎日のペット用品", navCategoriesBrowseAll: "すべての商品を見る", headerLanguageLabel: "言語", navOpenMenu: "メニューを開く", navCloseMenu: "メニューを閉じる",
  homeCta: "今すぐ選ぶ", goToCatalog: "商品一覧へ", viewProductAria: "商品を見る", productViewDetails: "詳細を見る", cartDrawerTitle: "カート", cartDrawerCheckoutCta: "お会計へ", checkoutTitle: "お会計", placeOrder: "お支払いを確定",
  allProducts: "すべて", categoryCats: "猫ちゃん商品", categoryDogs: "わんちゃん商品", menuAddToCart: "カートに追加", menuAddedToCart: "カートに追加しました", productSoldOut: "売り切れ",
  productIngredientsLabel: "原材料", productGuaranteedAnalysisLabel: "保証成分", productOriginLabel: "原産国", productStorageLabel: "保存方法",
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
