"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ReadingPreferences } from "@/types/quran";

interface ReadingPreferencesContextType {
  prefs: ReadingPreferences;
  setArabicFontSize: (size: number) => void;
  setEnglishFontSize: (size: number) => void;
  toggleShowTranslation: () => void;
  toggleShowTransliteration: () => void;
  toggleShowWordByWord: () => void;
  toggleAutoScroll: () => void;
  updatePreferences: (updates: Partial<ReadingPreferences>) => void;
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  arabicFontSize: 32,
  englishFontSize: 16,
  showTranslation: true,
  showTransliteration: true,
  showWordByWord: true,
  autoScroll: true,
  selectedReciterId: 7,
  selectedReciterName: "Mishari Rashid al-`Afasy",
};

const ReadingPreferencesContext = createContext<ReadingPreferencesContextType | undefined>(undefined);

export function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ReadingPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naq_reading_prefs");
      if (saved) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error("Failed to load reading preferences:", e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("naq_reading_prefs", JSON.stringify(prefs));
    } catch (e) {
      console.error("Failed to persist reading preferences:", e);
    }
  }, [prefs, mounted]);

  const setArabicFontSize = (size: number) => {
    setPrefs((prev) => ({ ...prev, arabicFontSize: Math.max(20, Math.min(56, size)) }));
  };

  const setEnglishFontSize = (size: number) => {
    setPrefs((prev) => ({ ...prev, englishFontSize: Math.max(12, Math.min(26, size)) }));
  };

  const toggleShowTranslation = () => {
    setPrefs((prev) => ({ ...prev, showTranslation: !prev.showTranslation }));
  };

  const toggleShowTransliteration = () => {
    setPrefs((prev) => ({ ...prev, showTransliteration: !prev.showTransliteration }));
  };

  const toggleShowWordByWord = () => {
    setPrefs((prev) => ({ ...prev, showWordByWord: !prev.showWordByWord }));
  };

  const toggleAutoScroll = () => {
    setPrefs((prev) => ({ ...prev, autoScroll: !prev.autoScroll }));
  };

  const updatePreferences = (updates: Partial<ReadingPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ReadingPreferencesContext.Provider
      value={{
        prefs,
        setArabicFontSize,
        setEnglishFontSize,
        toggleShowTranslation,
        toggleShowTransliteration,
        toggleShowWordByWord,
        toggleAutoScroll,
        updatePreferences,
      }}
    >
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export function useReadingPreferences() {
  const context = useContext(ReadingPreferencesContext);
  if (!context) {
    throw new Error("useReadingPreferences must be used within a ReadingPreferencesProvider");
  }
  return context;
}
