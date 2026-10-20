"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeStyle, ThemeMode } from "@/types/quran";

interface ThemeContextType {
  themeStyle: ThemeStyle;
  themeMode: ThemeMode;
  setThemeStyle: (style: ThemeStyle) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>("hadith");
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem("naq_theme_style") as ThemeStyle;
      const savedMode = localStorage.getItem("naq_theme_mode") as ThemeMode;
      if (savedStyle && (savedStyle === "hadith" || savedStyle === "emerald" || savedStyle === "monochrome")) {
        setThemeStyle(savedStyle);
      }
      if (savedMode && (savedMode === "dark" || savedMode === "light")) {
        setThemeMode(savedMode);
      }
    } catch {
      // LocalStorage might be restricted
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("naq_theme_style", themeStyle);
      localStorage.setItem("naq_theme_mode", themeMode);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    root.classList.remove("theme-hadith", "theme-emerald", "theme-monochrome", "dark", "light");
    root.classList.add(`theme-${themeStyle}`);
    root.classList.add(themeMode);
  }, [themeStyle, themeMode, mounted]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        themeStyle,
        themeMode,
        setThemeStyle,
        setThemeMode,
        toggleThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
