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
const LANGUAGE_OPTIONS: Locale[] = ["zh", "en"];

function dictionaryFor(locale: Locale) {
  return locale === "en" ? translations.en : translations.zh;
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query && LANGUAGE_OPTIONS.includes(query as Locale)) return query as Locale;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && LANGUAGE_OPTIONS.includes(stored as Locale) ? stored as Locale : "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = readStoredLocale();
    setLocaleState(next);
    document.documentElement.lang = next === "zh" ? "zh-HK" : "en";
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next === "zh" ? "zh-HK" : "en";
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    languageMode: locale,
    setLocale,
    setLanguageMode: setLocale,
    t: (key) => dictionaryFor(locale)[key],
  }), [locale, setLocale]);

  useEffect(() => {
    if (!hydrated) return;
    const dictionary = dictionaryFor(locale);
    document.title = dictionary.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", dictionary.documentDescription);
  }, [hydrated, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { locale: "zh" as const, languageMode: "zh" as const, setLocale: () => {}, setLanguageMode: () => {}, t: (key: TranslationKey) => translations.zh[key] || key };
  return ctx;
}
