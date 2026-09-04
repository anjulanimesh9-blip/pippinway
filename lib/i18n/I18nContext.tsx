"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FALLBACK_LANGUAGE,
  getLanguage,
  type LanguageCode,
} from "./languages";
import {
  applyDocumentLanguage,
  persistLanguage,
  readStoredLanguage,
} from "./persistLanguage";
import { translate } from "./translate";
import en from "./locales/en.json";
import sn from "./locales/sn.json";
import nd from "./locales/nd.json";
import si from "./locales/si.json";
import ta from "./locales/ta.json";
import zu from "./locales/zu.json";
import xh from "./locales/xh.json";
import af from "./locales/af.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import zh from "./locales/zh.json";
import ms from "./locales/ms.json";
import th from "./locales/th.json";
import dv from "./locales/dv.json";

const LOCALES: Record<LanguageCode, Record<string, unknown>> = {
  en,
  sn,
  nd,
  si,
  ta,
  zu,
  xh,
  af,
  es,
  fr,
  hi,
  zh,
  ms,
  th,
  dv,
};

type TranslateVars = Record<string, string | number>;

type I18nContextValue = {
  language: LanguageCode;
  loaded: boolean;
  isRTL: boolean;
  t: (key: string, vars?: TranslateVars) => string;
  categoryLabel: (name: string) => string;
  countryLabel: (name: string | null | undefined) => string;
  applyLanguage: (code: LanguageCode) => void;
  requestLanguageChange: (code: LanguageCode) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(FALLBACK_LANGUAGE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    setLanguage(stored);
    applyDocumentLanguage(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    applyDocumentLanguage(language);
  }, [language, loaded]);

  const applyLanguage = useCallback((code: LanguageCode) => {
    setLanguage(code);
    persistLanguage(code);
    applyDocumentLanguage(code);
  }, []);

  const t = useCallback(
    (key: string, vars?: TranslateVars) =>
      translate(LOCALES[language] ?? en, en, key, vars),
    [language]
  );

  const requestLanguageChange = useCallback(
    (code: LanguageCode) => {
      if (code === language) return;
      const next = getLanguage(code);
      const ok =
        typeof window !== "undefined" &&
        window.confirm(
          `${t("language.confirmTitle")}\n\n${t("language.confirmBody", {
            language: next.nativeName,
          })}`
        );
      if (ok) applyLanguage(code);
    },
    [applyLanguage, language, t]
  );

  const categoryLabel = useCallback(
    (name: string) => {
      if (!name) return t("categories.All");
      const translated = t(`categories.${name}`);
      return translated === `categories.${name}` ? name : translated;
    },
    [t]
  );

  const countryLabel = useCallback(
    (name: string | null | undefined) => {
      if (!name || name === "All") return t("countries.all");
      const translated = t(`countries.${name}`);
      return translated === `countries.${name}` ? name : translated;
    },
    [t]
  );

  const meta = getLanguage(language);
  const isRTL = Boolean(meta.rtl);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      loaded,
      isRTL,
      t,
      categoryLabel,
      countryLabel,
      applyLanguage,
      requestLanguageChange,
    }),
    [
      applyLanguage,
      categoryLabel,
      countryLabel,
      isRTL,
      language,
      loaded,
      requestLanguageChange,
      t,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
