"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, AppLanguage } from "@/context/LanguageContext";
import { Languages, ChevronDown, Check } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
  variant?: "pill" | "segmented";
}

export function LanguageToggle({
  className = "",
  compact = true,
  variant = "pill",
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const options: Array<{
    id: AppLanguage;
    label: string;
    labelUrdu: string;
    badge: string;
    descriptionEn: string;
    descriptionUrdu: string;
  }> = [
    {
      id: "bilingual",
      label: "Bilingual",
      labelUrdu: "دو لسانی",
      badge: "EN+اردو",
      descriptionEn: "English + Urdu translations together",
      descriptionUrdu: "انگریزی اور اردو تراجم بیک وقت",
    },
    {
      id: "urdu",
      label: "Urdu",
      labelUrdu: "اردو",
      badge: "اردو",
      descriptionEn: "Urdu translations across all views",
      descriptionUrdu: "تمام حصوں میں صرف اردو متن و ترجمہ",
    },
    {
      id: "english",
      label: "English",
      labelUrdu: "انگریزی",
      badge: "EN",
      descriptionEn: "English translations across all views",
      descriptionUrdu: "تمام حصوں میں انگریزی متن و ترجمہ",
    },
  ];

  const currentOption = options.find((o) => o.id === language) || options[0];

  // Segmented Slider Variant (for settings or wide spaces)
  if (variant === "segmented" || !compact) {
    return (
      <div
        className={`flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs font-bold select-none shadow-inner ${className}`}
        role="group"
        aria-label="Language selection toggle"
      >
        {options.map((opt) => {
          const isActive = language === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLanguage(opt.id)}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold scale-[1.02]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
              }`}
              title={opt.descriptionEn}
            >
              <span className={opt.id === "urdu" ? "font-urdu text-sm" : ""}>{opt.badge}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Pill with Micro-Popover Dropdown (Default for Header)
  return (
    <div ref={containerRef} className={`relative inline-block select-none ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--foreground)] text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-98"
        title="Change Application Language: Bilingual, Urdu, or English"
      >
        <Languages className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span
          className={`px-1.5 py-0.2 rounded-md font-bold text-[11px] ${
            language === "urdu"
              ? "font-urdu bg-emerald-600/15 text-emerald-500 border border-emerald-500/30"
              : language === "bilingual"
              ? "bg-emerald-600/15 text-emerald-500 border border-emerald-500/30 font-mono"
              : "bg-emerald-600/15 text-emerald-500 border border-emerald-500/30 font-mono"
          }`}
        >
          {currentOption.badge}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Micro-Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-64 p-1.5 rounded-2xl bg-[var(--modal-bg)] border border-[var(--border-subtle)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 text-left backdrop-blur-md"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border-subtle)]/60 mb-1">
            Display Language / زبان
          </div>

          {options.map((opt) => {
            const isActive = language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setLanguage(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-emerald-600/15 border border-emerald-500/30 text-[var(--foreground)] font-semibold shadow-xs"
                    : "hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-transparent"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isActive ? "text-emerald-500 dark:text-emerald-400" : ""
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[11px] font-urdu text-[var(--muted-foreground)]" dir="rtl">
                      ({opt.labelUrdu})
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                    {opt.descriptionEn}
                  </p>
                </div>

                {isActive && (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
