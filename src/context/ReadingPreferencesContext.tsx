"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ReadingPreferences, ArabicFontFamily } from "@/types/quran";

interface ReadingPreferencesContextType {
  prefs: ReadingPreferences;
  setArabicFontSize: (size: number) => void;
  setEnglishFontSize: (size: number) => void;
  setUrduFontSize: (size: number) => void;
  setArabicFont: (font: ArabicFontFamily) => void;
  toggleShowTranslation: () => void;
  toggleShowUrduTranslation: () => void;
  toggleShowTransliteration: () => void;
  toggleShowWordByWord: () => void;
  setWbwLanguage: (lang: "english" | "urdu" | "both") => void;
  toggleAutoScroll: () => void;
  setSelectedUrduTranslationId: (id: number) => void;
  setSelectedTafsirId: (id: number) => void;
  updatePreferences: (updates: Partial<ReadingPreferences>) => void;
}

const DEFAULT_PREFERENCES: ReadingPreferences = {
  arabicFontSize: 32,
  englishFontSize: 16,
  urduFontSize: 20,
  arabicFont: "amiri",
  wbwLanguage: "english",
  showTranslation: true,
  showUrduTranslation: true,
  showTransliteration: true,
  showWordByWord: true,
  autoScroll: true,
  selectedReciterId: 7,
  selectedReciterName: "Mishari Rashid al-`Afasy",
  selectedUrduTranslationId: 234,
  selectedTafsirId: 169,
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

  const setUrduFontSize = (size: number) => {
    setPrefs((prev) => ({ ...prev, urduFontSize: Math.max(14, Math.min(32, size)) }));
  };

  const setArabicFont = (font: ArabicFontFamily) => {
    setPrefs((prev) => ({ ...prev, arabicFont: font }));
  };

  const toggleShowTranslation = () => {
    setPrefs((prev) => ({ ...prev, showTranslation: !prev.showTranslation }));
  };

  const toggleShowUrduTranslation = () => {
    setPrefs((prev) => ({ ...prev, showUrduTranslation: !prev.showUrduTranslation }));
  };

  const toggleShowTransliteration = () => {
    setPrefs((prev) => ({ ...prev, showTransliteration: !prev.showTransliteration }));
  };

  const toggleShowWordByWord = () => {
    setPrefs((prev) => ({ ...prev, showWordByWord: !prev.showWordByWord }));
  };

  const setWbwLanguage = (lang: "english" | "urdu" | "both") => {
    setPrefs((prev) => ({ ...prev, wbwLanguage: lang }));
  };

  const toggleAutoScroll = () => {
    setPrefs((prev) => ({ ...prev, autoScroll: !prev.autoScroll }));
  };

  const setSelectedUrduTranslationId = (id: number) => {
    setPrefs((prev) => ({ ...prev, selectedUrduTranslationId: id }));
  };

  const setSelectedTafsirId = (id: number) => {
    setPrefs((prev) => ({ ...prev, selectedTafsirId: id }));
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
        setUrduFontSize,
        setArabicFont,
        toggleShowTranslation,
        toggleShowUrduTranslation,
        toggleShowTransliteration,
        toggleShowWordByWord,
        setWbwLanguage,
        toggleAutoScroll,
        setSelectedUrduTranslationId,
        setSelectedTafsirId,
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
