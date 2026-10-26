"use client";

import React from "react";
import { useLanguage, AppLanguage } from "@/context/LanguageContext";

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export function LanguageToggle({ className = "", compact = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px] font-bold select-none ${className}`}
      title="Global Language Mode: Bilingual (English+Urdu), Urdu First, or English"
      role="group"
      aria-label="Language selection toggle"
    >
      <button
        type="button"
        onClick={() => setLanguage("bilingual")}
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          language === "bilingual"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
        title="Bilingual Mode: Show both English and Urdu translations"
      >
        EN+اردو
      </button>
      <button
        type="button"
        onClick={() => setLanguage("urdu")}
        className={`px-2 py-1 rounded-lg font-urdu transition-all cursor-pointer ${
          language === "urdu"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
        title="Urdu Mode: Show Urdu text and translations across all views"
      >
        اردو
      </button>
      <button
        type="button"
        onClick={() => setLanguage("english")}
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
          language === "english"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
        title="English Mode: Show English text and translations across all views"
      >
        EN
      </button>
    </div>
  );
}
