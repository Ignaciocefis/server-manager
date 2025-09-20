"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

export type Language = "es" | "en";
type Translations = typeof es;

interface LanguageContextProps {
  language: Language;
  t: Translations;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");
  const [t, setT] = useState<Translations>(es);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && (saved === "es" || saved === "en")) {
      setLanguage(saved);
      setT(saved === "es" ? es : en);
    }
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setT(lang === "es" ? es : en);
    localStorage.setItem("language", lang);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage debe usarse dentro de un LanguageProvider");
  }
  return context;
}
