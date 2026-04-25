'use client';

import React from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, type SupportedLanguage, isRTL } from "./languages";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (_lang: SupportedLanguage) => void;
  isRTL: boolean;
}

const STORAGE_KEY = "maghreb_language";
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): SupportedLanguage => {
  if (globalThis.window === undefined) return DEFAULT_LANGUAGE;
  const stored = globalThis.window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (stored && LANGUAGE_OPTIONS.some(option => option.value === stored)) {
    return stored;
  }
  const browserLang = globalThis.window.navigator.language.slice(0, 2).toLowerCase();
  if (browserLang === "ar") return "ar";
  if (browserLang === "en") return "en";
  return DEFAULT_LANGUAGE;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => getInitialLanguage());

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL(language) ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((value: SupportedLanguage) => {
    setLanguageState(value);
    if (globalThis.window !== undefined) {
      globalThis.window.localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, isRTL: isRTL(language) }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
