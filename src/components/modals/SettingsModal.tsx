"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { useTheme } from "@/context/ThemeContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { APP_CONFIG } from "@/config/version";
import { Settings, Sparkles, Moon, Sun, Type, User } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { themeStyle, themeMode, setThemeStyle, setThemeMode, toggleThemeMode } = useTheme();
  const {
    prefs,
    setArabicFontSize,
    setEnglishFontSize,
    toggleShowTranslation,
    toggleShowWordByWord,
    toggleAutoScroll,
  } = useReadingPreferences();
  const { reciters, currentReciter, setReciter } = useAudio();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-500" />
          <span>Reading & Display Settings</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Theme Section */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-3">
            Theme Style & Palette
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => setThemeStyle("emerald")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                themeStyle === "emerald"
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500"
                  : "border-[var(--border-subtle,#22332c)] bg-[var(--surface-raised,#16211d)] text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
            >
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Emerald & Gold
                </div>
                <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)] mt-0.5">
                  Deep Islamic emerald & warm accents
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setThemeStyle("monochrome")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                themeStyle === "monochrome"
                  ? "border-zinc-400 bg-zinc-900 text-zinc-100 ring-1 ring-zinc-400"
                  : "border-[var(--border-subtle,#22332c)] bg-[var(--surface-raised,#16211d)] text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
            >
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <Moon className="h-4 w-4 text-zinc-300" />
                  Monochrome OLED
                </div>
                <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)] mt-0.5">
                  High-contrast minimal dark / pure light
                </div>
              </div>
            </button>
          </div>

          {/* Light / Dark Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)]">
            <div className="flex items-center gap-2 text-sm font-medium">
              {themeMode === "dark" ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>Mode: {themeMode === "dark" ? "Dark Theme" : "Light Theme"}</span>
            </div>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--card-border,#22332c)] hover:bg-emerald-600 hover:text-white transition-colors"
            >
              Switch to {themeMode === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Reciter Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-3">
            Audio Reciter
          </label>
          <div className="relative">
            <select
              value={currentReciter?.id || 7}
              onChange={(e) => {
                const selected = reciters.find((r) => r.id === Number(e.target.value));
                if (selected) setReciter(selected);
              }}
              className="w-full rounded-xl bg-[var(--surface-raised,#16211d)] px-4 py-3 text-sm text-[var(--foreground)] border border-[var(--border-subtle,#22332c)] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {reciters.map((r) => (
                <option key={r.id} value={r.id} className="bg-zinc-900 text-white">
                  {r.reciter_name} {r.style ? `(${r.style})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Font Size Sliders */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block">
            Typography & Font Scaling
          </label>

          {/* Arabic Font Size */}
          <div className="p-4 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-4 w-4 text-emerald-400" /> Arabic Script Size
              </span>
              <span className="text-emerald-400">{prefs.arabicFontSize}px</span>
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
            {/* Live Preview */}
            <div className="text-right pt-2" dir="rtl">
              <span
                className="font-arabic text-[var(--foreground)] leading-relaxed inline-block"
                style={{ fontSize: `${prefs.arabicFontSize}px` }}
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
            </div>
          </div>

          {/* English Font Size */}
          <div className="p-4 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-4 w-4 text-emerald-400" /> Translation Size
              </span>
              <span className="text-emerald-400">{prefs.englishFontSize}px</span>
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
            <p
              className="text-[var(--muted-foreground,#8e9b94)] pt-1"
              style={{ fontSize: `${prefs.englishFontSize}px` }}
            >
              In the Name of Allah—the Most Compassionate, Most Merciful.
            </p>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-2">
            Reading Features
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] cursor-pointer">
            <span className="text-sm">Word-by-word interactive analysis & audio</span>
            <input
              type="checkbox"
              checked={prefs.showWordByWord}
              onChange={toggleShowWordByWord}
              className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] cursor-pointer">
            <span className="text-sm">Show English Translation</span>
            <input
              type="checkbox"
              checked={prefs.showTranslation}
              onChange={toggleShowTranslation}
              className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] cursor-pointer">
            <span className="text-sm">Auto-scroll to reciting verse</span>
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
          <span className="px-2 py-0.5 rounded-full bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] font-mono">
            v{APP_CONFIG.version}
          </span>
        </div>
      </div>
    </Modal>
  );
}
