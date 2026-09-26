"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { languageOptions, translations, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "beatahead-language";

type I18nContextValue = {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return languageOptions.some((option) => option.code === value);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(savedLanguage)) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    const option = languageOptions.find((item) => item.code === language)!;
    document.documentElement.lang = language;
    document.documentElement.dir = option.direction;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Locale) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key],
    }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
