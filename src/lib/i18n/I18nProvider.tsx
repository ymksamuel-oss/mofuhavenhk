"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, translations, type Locale, type TranslationKey } from "./translations";

export type LanguageMode = "en";
type I18nContextValue = {
  locale: "en";
  languageMode: "en";
  setLocale: (locale: Locale) => void;
  setLanguageMode: (mode: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): "en" {
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<"en">("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = readStoredLocale();
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    document.documentElement.lang = "en";
    setHydrated(true);
  }, []);

  const setLocale = useCallback((_next: Locale) => {
    setLocaleState("en");
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    document.documentElement.lang = "en";
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    languageMode: locale,
    setLocale,
    setLanguageMode: setLocale,
    t: (key) => translations.en[key],
  }), [locale, setLocale]);

  useEffect(() => {
    if (!hydrated) return;
    document.title = translations.en.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", translations.en.documentDescription);
  }, [hydrated]);

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
