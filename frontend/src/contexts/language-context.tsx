"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import km from "@/locales/km.json";

type Language = "km" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  getLocalized: (obj?: { en?: string; km?: string } | null) => string;
}

const dictionaries = { en, km };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("km");

  useEffect(() => {
    const saved = localStorage.getItem("futera_lang") as Language;
    if (saved === "en" || saved === "km") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("futera_lang", lang);
  };

  const t = (path: string, fallbackText?: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[language];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback: any = dictionaries["en"];
        for (const fbK of keys) {
          if (fallback && typeof fallback === "object" && fbK in fallback) {
            fallback = fallback[fbK];
          } else {
            return fallbackText || path;
          }
        }
        return typeof fallback === "string" ? fallback : (fallbackText || path);
      }
    }
    return typeof current === "string" ? current : (fallbackText || path);
  };

  const getLocalized = (obj?: { en?: string; km?: string } | null): string => {
    if (!obj) return "";
    if (language === "km" && obj.km) return obj.km;
    return obj.en || obj.km || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
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

