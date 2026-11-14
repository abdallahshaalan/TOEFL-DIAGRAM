import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en";
import ar from "./ar";
import { toast } from "sonner";

const dictionaries = { en, ar };

const LanguageContext = createContext(null);

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("uiLang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("uiLang", lang);
  }, [lang]);

  const value = useMemo(() => {
    const dict = dictionaries[lang] || en;
    const t = (path, fallback = path) => {
      const val = getNested(dict, path);
      return val == null ? fallback : val;
    };
    const setLang = (next) => {
      setLangState(next);
      toast.success(next === "ar" ? ar.settings.languageSaved : en.settings.languageSaved);
    };
    return { lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
