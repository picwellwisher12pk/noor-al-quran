"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { useTheme } from "@/context/ThemeContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { AVAILABLE_TRANSLATIONS, AVAILABLE_TAFSIRS } from "@/services/quranApi";
import { ArabicFontFamily, ThemeStyle } from "@/types/quran";
import { APP_CONFIG } from "@/config/version";
import { Settings, Sparkles, Moon, Sun, Type, BookOpen, Layers } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { themeStyle, themeMode, setThemeStyle, toggleThemeMode } = useTheme();
  const {
    prefs,
    setArabicFontSize,
    setEnglishFontSize,
    setUrduFontSize,
    setArabicFont,
    toggleShowTranslation,
    toggleShowUrduTranslation,
    toggleShowWordByWord,
    toggleAutoScroll,
    setSelectedUrduTranslationId,
    setSelectedTafsirId,
  } = useReadingPreferences();
  const { reciters, currentReciter, setReciter } = useAudio();

  const fontOptions: { id: ArabicFontFamily; name: string; sample: string; fontClass: string }[] = [
    { id: "amiri", name: "Amiri (Medina Calligraphy)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-amiri" },
    { id: "noto-sans-arabic", name: "Noto Sans Arabic (Hadith Style)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-noto" },
    { id: "scheherazade", name: "Scheherazade New (Classical)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-scheherazade" },
    { id: "nastaliq", name: "Noto Nastaliq (Indo-Pak / Urdu)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-nastaliq" },
  ];

  const themes: { id: ThemeStyle; name: string; note: string }[] = [
    { id: "hadith", name: "Hadith Theme", note: "Teal accents & warm parchment / midnight navy" },
    { id: "emerald", name: "Emerald & Gold", note: "Deep Islamic emerald & warm gold" },
    { id: "monochrome", name: "Monochrome OLED", note: "High-contrast minimal dark / pure white" },
  ];

  const urduTranslations = AVAILABLE_TRANSLATIONS.filter((t) => t.language === "urdu");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-500" />
          <span>Reading & Display Preferences</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Theme Section */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-3">
            Theme Architecture & Palette
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
            {themes.map((t) => {
              const active = themeStyle === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeStyle(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    active
                      ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500"
                      : "border-[var(--border-subtle,#24362e)] bg-[var(--surface-raised,#141e1a)] text-[var(--foreground)] opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    {t.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground,#8e9b94)] leading-tight">
                    {t.note}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)]">
            <div className="flex items-center gap-2 text-sm font-medium">
              {themeMode === "dark" ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>Mode: {themeMode === "dark" ? "Dark Theme" : "Light Theme"}</span>
            </div>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:bg-emerald-600 hover:text-white transition-colors"
            >
              Switch to {themeMode === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Arabic Font Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-3">
            Quranic Arabic Font Script
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fontOptions.map((f) => {
              const isSelected = prefs.arabicFont === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setArabicFont(f.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500"
                      : "border-[var(--border-subtle,#24362e)] bg-[var(--surface-raised,#141e1a)] hover:border-emerald-500/40"
                  }`}
                >
                  <div className="text-xs font-semibold text-[var(--foreground)] mb-1 flex items-center justify-between">
                    <span>{f.name}</span>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                  </div>
                  <div className={`text-right text-lg text-[var(--foreground)] ${f.fontClass}`} dir="rtl">
                    {f.sample}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation Settings (Urdu & English) */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block">
            Translations & Language Settings
          </label>

          {/* Urdu Translation Toggle & Selector */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Show Urdu Translation (اردو ترجمہ)</span>
              <input
                type="checkbox"
                checked={prefs.showUrduTranslation}
                onChange={toggleShowUrduTranslation}
                className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            {prefs.showUrduTranslation && (
              <div className="pt-2 border-t border-[var(--border-subtle,#24362e)]">
                <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)] block mb-1">
                  Select Urdu Scholar / Translation:
                </span>
                <select
                  value={prefs.selectedUrduTranslationId}
                  onChange={(e) => setSelectedUrduTranslationId(Number(e.target.value))}
                  className="w-full rounded-xl bg-[var(--surface-card,#182520)] px-3 py-2 text-xs text-[var(--foreground)] border border-[var(--border-subtle,#24362e)] focus:outline-none focus:border-emerald-500"
                >
                  {urduTranslations.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.author})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* English Translation Toggle */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Show English Translation</span>
              <input
                type="checkbox"
                checked={prefs.showTranslation}
                onChange={toggleShowTranslation}
                className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Default Tafsir Preference */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-2">
            Default Tafseer Commentary
          </label>
          <select
            value={prefs.selectedTafsirId}
            onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
            className="w-full rounded-xl bg-[var(--surface-raised,#141e1a)] px-4 py-2.5 text-xs text-[var(--foreground)] border border-[var(--border-subtle,#24362e)] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {AVAILABLE_TAFSIRS.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.language.toUpperCase()}] {t.name} — {t.author}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Reciter */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-2">
            Audio Reciter
          </label>
          <select
            value={currentReciter?.id || 7}
            onChange={(e) => {
              const selected = reciters.find((r) => r.id === Number(e.target.value));
              if (selected) setReciter(selected);
            }}
            className="w-full rounded-xl bg-[var(--surface-raised,#141e1a)] px-4 py-2.5 text-xs text-[var(--foreground)] border border-[var(--border-subtle,#24362e)] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.reciter_name} {r.style ? `(${r.style})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Font Sizing Controls */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block">
            Typography Scaling
          </label>

          {/* Arabic Font Size */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-4 w-4 text-emerald-400" /> Arabic Script Size
              </span>
              <span className="text-emerald-400 font-mono">{prefs.arabicFontSize}px</span>
            </div>
            <input
              type="range"
              min={22}
              max={52}
              step={2}
              value={prefs.arabicFontSize}
              onChange={(e) => setArabicFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Urdu Font Size */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-4 w-4 text-emerald-400" /> Urdu Translation Size
              </span>
              <span className="text-emerald-400 font-mono">{prefs.urduFontSize}px</span>
            </div>
            <input
              type="range"
              min={15}
              max={30}
              step={1}
              value={prefs.urduFontSize}
              onChange={(e) => setUrduFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* English Font Size */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-4 w-4 text-emerald-400" /> English Translation Size
              </span>
              <span className="text-emerald-400 font-mono">{prefs.englishFontSize}px</span>
            </div>
            <input
              type="range"
              min={13}
              max={22}
              step={1}
              value={prefs.englishFontSize}
              onChange={(e) => setEnglishFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Display Toggles */}
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] cursor-pointer">
            <span className="text-xs font-medium">Word-by-word interactive pronunciation</span>
            <input
              type="checkbox"
              checked={prefs.showWordByWord}
              onChange={toggleShowWordByWord}
              className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] cursor-pointer">
            <span className="text-xs font-medium">Auto-scroll to reciting verse</span>
            <input
              type="checkbox"
              checked={prefs.autoScroll}
              onChange={toggleAutoScroll}
              className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* App Version Info */}
        <div className="pt-4 border-t border-[var(--border-subtle,#1e2925)] flex items-center justify-between text-xs text-[var(--muted-foreground,#8e9b94)]">
          <span>{APP_CONFIG.name}</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] font-mono">
            v{APP_CONFIG.version}
          </span>
        </div>
      </div>
    </Modal>
  );
}
