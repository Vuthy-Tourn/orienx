"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import km from "@/locales/km.json";

type Language = "km" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  tList: (path: string) => string[];
  getLocalized: (obj?: { en?: string; km?: string } | null) => string;
}

const dictionaries = { en, km };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("km");

  useEffect(() => {
    const saved = localStorage.getItem("futera_lang") as Language;
    if (saved === "en" || saved === "km") {
      // Hydration-safe: the server always renders "km", so the saved
      // preference can only be applied after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("futera_lang", lang);
  };

  const resolve = (path: string): unknown => {
    const keys = path.split(".");
    const read = (dictionary: unknown): unknown => {
      let current: unknown = dictionary;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const localized = read(dictionaries[language]);
    if (localized !== undefined) return localized;
    return read(dictionaries.en);
  };

  const t = (path: string, fallbackText?: string): string => {
    const value = resolve(path);
    return typeof value === "string" ? value : (fallbackText || path);
  };

  const tList = (path: string): string[] => {
    const value = resolve(path);
    return Array.isArray(value) ? value.map(String) : [];
  };

  const getLocalized = (obj?: { en?: string; km?: string } | null): string => {
    if (!obj) return "";
    if (language === "km" && obj.km) return obj.km;
    return obj.en || obj.km || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tList, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

