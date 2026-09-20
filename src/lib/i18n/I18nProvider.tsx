"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, translations, type Locale, type TranslationKey } from "./translations";

export type LanguageMode = "zh" | "en";
type SupportedLocale = "zh" | "en";
type I18nContextValue = {
  locale: SupportedLocale;
  languageMode: SupportedLocale;
  setLocale: (locale: Locale) => void;
  setLanguageMode: (mode: SupportedLocale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "zh" || stored === "zh-HK" ? "zh" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [hydrated, setHydrated] = useState(false);

  const applyLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next === "zh" ? "zh-HK" : "en");
    document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next === "zh" ? "zh-HK" : "en";
  }, []);

  useEffect(() => {
    const next = readStoredLocale();
    applyLocale(next);
    setHydrated(true);
  }, [applyLocale]);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next === "zh" ? "zh" : "en");
  }, [applyLocale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    languageMode: locale,
    setLocale,
    setLanguageMode: applyLocale,
    t: (key) => translations[locale][key] ?? translations.en[key] ?? key,
  }), [applyLocale, locale, setLocale]);

  useEffect(() => {
    if (!hydrated) return;
    document.title = translations[locale].documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", translations[locale].documentDescription);
  }, [hydrated, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "en" as const,
      languageMode: "en" as const,
      setLocale: () => {},
      setLanguageMode: () => {},
      t: (key: TranslationKey) => translations.en[key] || key,
    };
  }
  return ctx;
}
