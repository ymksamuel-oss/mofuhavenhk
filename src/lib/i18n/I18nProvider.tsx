"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, translations, type Locale, type TranslationKey } from "./translations";

type LanguageMode = "bilingual" | "en";
type I18nContextValue = {
  locale: Locale;
  languageMode: LanguageMode;
  setLocale: (locale: Locale) => void;
  setLanguageMode: (mode: LanguageMode) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LANGUAGE_MODE_STORAGE_KEY = "mofuhavenhk-language-mode";
const BILINGUAL_JA: Partial<Record<TranslationKey, string>> = {
  navHome: "ホーム", navCheckout: "お会計", navCart: "カート", navMenu: "メニュー",
  navCategories: "商品カテゴリー", navCategoriesCats: "猫用", navCategoriesDogs: "犬用",
  homeCta: "今すぐ選ぶ", goToCatalog: "商品一覧へ", viewProductAria: "商品を見る",
  productViewDetails: "詳細を見る", cartDrawerTitle: "カート",
  cartDrawerCheckoutCta: "お会計へ", checkoutTitle: "お会計", placeOrder: "お支払いを確定",
  productIngredientsLabel: "原材料", productGuaranteedAnalysisLabel: "保証成分",
  productOriginLabel: "原産国", productStorageLabel: "保存方法",
};

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const queryLocale = new URLSearchParams(window.location.search).get("lang");
  if (queryLocale === "en" || queryLocale === "zh") return queryLocale;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "zh" ? stored : "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [languageMode, setLanguageModeState] = useState<LanguageMode>("bilingual");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setLanguageModeState(window.localStorage.getItem(LANGUAGE_MODE_STORAGE_KEY) === "en" ? "en" : "bilingual");
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next === "zh" ? "zh-HK" : "en";
  }, []);

  const setLanguageMode = useCallback((next: LanguageMode) => {
    setLanguageModeState(next);
    setLocaleState(next === "en" ? "en" : "zh");
    window.localStorage.setItem(LANGUAGE_MODE_STORAGE_KEY, next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next === "en" ? "en" : "zh");
    document.documentElement.lang = next === "en" ? "en" : "zh-HK";
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = languageMode === "en" ? "en" : "zh-HK";
    document.title = languageMode === "en" ? translations.en.documentTitle : translations.zh.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", languageMode === "en" ? translations.en.documentDescription : translations.zh.documentDescription);
  }, [hydrated, languageMode]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    languageMode,
    setLocale,
    setLanguageMode,
    t: (key) => {
      if (languageMode === "en") return translations.en[key];
      const ja = BILINGUAL_JA[key];
      return ja ? `${translations.zh[key]} / ${ja}` : translations.zh[key];
    },
  }), [languageMode, locale, setLanguageMode, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "zh" as const,
      languageMode: "bilingual" as const,
      setLocale: () => {},
      setLanguageMode: () => {},
      t: (key: TranslationKey) => translations.zh[key] || key,
    };
  }
  return ctx;
}
