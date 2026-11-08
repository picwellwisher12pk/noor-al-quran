"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import { setLanguagePreference as setVocabStorageLang, VocabLangPreference } from "@/services/vocabularyStorage";

export type AppLanguage = "bilingual" | "urdu" | "english";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isUrdu: boolean;
  isEnglish: boolean;
  isBilingual: boolean;
  t: (english: string, urdu: string) => string;
}

const GLOBAL_LANG_STORAGE_KEY = "naq_global_lang_pref";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("bilingual");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or fallback
  useEffect(() => {
    try {
      const savedGlobal = localStorage.getItem(GLOBAL_LANG_STORAGE_KEY) as AppLanguage | null;
      if (savedGlobal && (savedGlobal === "bilingual" || savedGlobal === "urdu" || savedGlobal === "english")) {
        setLanguageState(savedGlobal);
        try {
          useLearningStore.getState()?.setLangPreference?.(savedGlobal);
        } catch {}
        try {
          setVocabStorageLang(savedGlobal as VocabLangPreference);
        } catch {}
      } else {
        // Fallback to learning store or vocab storage if previously set
        const storePref = useLearningStore.getState()?.langPreference;
        if (storePref && (storePref === "bilingual" || storePref === "urdu" || storePref === "english")) {
          setLanguageState(storePref);
          try {
            localStorage.setItem(GLOBAL_LANG_STORAGE_KEY, storePref);
          } catch {}
          setVocabStorageLang(storePref as VocabLangPreference);
        } else {
          const savedVocab = localStorage.getItem("naq_vocab_lang_pref_v1");
          if (savedVocab) {
            const parsed = JSON.parse(savedVocab) as AppLanguage;
            if (parsed === "bilingual" || parsed === "urdu" || parsed === "english") {
              setLanguageState(parsed);
              try {
                localStorage.setItem(GLOBAL_LANG_STORAGE_KEY, parsed);
              } catch {}
              useLearningStore.getState()?.setLangPreference(parsed);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load global language preference:", e);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(GLOBAL_LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.error("Failed to persist global language preference:", e);
    }

    // Sync with Learning Store safely
    try {
      const learningStore = useLearningStore.getState();
      if (learningStore && typeof learningStore.setLangPreference === "function") {
        learningStore.setLangPreference(newLang);
      }
    } catch (e) {
      console.warn("Could not sync language with learning store:", e);
    }

    // Sync with Vocabulary Storage safely
    try {
      setVocabStorageLang(newLang as VocabLangPreference);
    } catch (e) {
      console.warn("Could not sync language with vocab storage:", e);
    }

    // Broadcast change for multi-window / tabs
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("naq_language_changed", { detail: newLang }));
    }
  }, []);

  // Listen to cross-component or cross-tab events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail && customEvent.detail !== language) {
        setLanguageState(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GLOBAL_LANG_STORAGE_KEY && e.newValue) {
        const val = e.newValue as AppLanguage;
        if (val === "bilingual" || val === "urdu" || val === "english") {
          setLanguageState(val);
          try {
            useLearningStore.getState()?.setLangPreference?.(val);
          } catch {}
          try {
            setVocabStorageLang(val as VocabLangPreference);
          } catch {}
        }
      }
    };

    window.addEventListener("naq_language_changed", handleCustomChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("naq_language_changed", handleCustomChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [language]);

  // Synchronize documentElement lang and data-lang attributes
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("lang", language === "urdu" ? "ur" : "en");
    root.dataset.lang = language;
  }, [language, mounted]);

  const t = useCallback(
    (english: string, urdu: string): string => {
      if (language === "urdu") return urdu;
      if (language === "bilingual") return `${urdu} • ${english}`;
      return english;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isUrdu: language === "urdu",
        isEnglish: language === "english",
        isBilingual: language === "bilingual",
        t,
      }}
    >
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
