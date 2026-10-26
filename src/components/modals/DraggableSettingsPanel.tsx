"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { AVAILABLE_TRANSLATIONS } from "@/services/quranApi";
import { ArabicFontFamily, UrduFontFamily, ThemeStyle, WbwLanguage } from "@/types/quran";
import { APP_CONFIG } from "@/config/version";
import {
  GripHorizontal,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Moon,
  Sun,
  Type,
  Globe,
  Settings,
  LayoutList,
  AlignJustify,
  CloudDownload,
  Languages,
} from "lucide-react";
import { LanguageToggle } from "@/components/common/LanguageToggle";

interface DraggableSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DraggableSettingsPanel({ isOpen, onClose }: DraggableSettingsPanelProps) {
  const { themeStyle, themeMode, setThemeStyle, toggleThemeMode } = useTheme();
  const { readingMode, setReadingMode, setIsDownloadManagerOpen } = useDesktopWorkspace();
  const {
    prefs,
    setArabicFontSize,
    setEnglishFontSize,
    setUrduFontSize,
    setArabicFont,
    setUrduFont,
    setWbwLanguage,
    toggleShowTranslation,
    toggleShowUrduTranslation,
    toggleShowWordByWord,
    toggleAutoScroll,
    setSelectedUrduTranslationId,
  } = useReadingPreferences();
  const { reciters, currentReciter, setReciter } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 80,
  });

  // Position on right side of viewport initially on desktop
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initX = Math.max(20, window.innerWidth - 400);
      setPosition({ x: initX, y: 80 });
      dragRef.current.posX = initX;
      dragRef.current.posY = 80;
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.posX = position.x;
    dragRef.current.posY = position.y;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 340, dragRef.current.posX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 100, dragRef.current.posY + deltaY));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!isOpen) return null;

  const fontOptions: { id: ArabicFontFamily; name: string }[] = [
    { id: "amiri", name: "Amiri" },
    { id: "noto-sans-arabic", name: "Noto Sans" },
    { id: "scheherazade", name: "Scheherazade" },
    { id: "nastaliq", name: "Nastaliq" },
  ];

  const urduFontOptions: { id: UrduFontFamily; name: string }[] = [
    { id: "nastaliq", name: "Nastaliq (Urdu)" },
    { id: "noto-sans-arabic", name: "Noto Sans" },
    { id: "scheherazade", name: "Scheherazade" },
    { id: "amiri", name: "Amiri" },
  ];

  const themes: { id: ThemeStyle; name: string }[] = [
    { id: "hadith", name: "Hadith App" },
    { id: "emerald", name: "Emerald" },
    { id: "monochrome", name: "OLED" },
  ];

  const urduTranslations = AVAILABLE_TRANSLATIONS.filter((t) => t.language === "urdu");

  return (
    <aside
      aria-label="Interactive reading settings panel"
      className="fixed z-50 transition-shadow select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? "auto" : "360px",
      }}
    >
      {/* Container with Frosted Glass Styling */}
      <div className="rounded-2xl bg-[var(--surface-raised)]/95 backdrop-blur-md border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Drag Handle & Header */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`flex items-center justify-between px-3.5 py-2.5 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] cursor-grab active:cursor-grabbing ${
            isDragging ? "bg-emerald-950/40" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <GripHorizontal className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Settings className="h-3.5 w-3.5 text-emerald-400" />
            <span>Live Settings (Drag Me)</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? "Maximize settings" : "Minimize settings"}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-400 hover:bg-[var(--hover-bg)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Pill View */}
        {isMinimized ? (
          <div className="p-3 text-xs text-[var(--muted-foreground)] flex items-center gap-2">
            <span>Settings Minimized</span>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="text-emerald-400 font-semibold underline text-[11px]"
            >
              Expand
            </button>
          </div>
        ) : (
          /* Full Interactive Controls (Live Real-Time Feedback) */
          <div className="p-4 overflow-y-auto space-y-4 text-xs select-text max-h-[75vh]">
            {/* Theme & Mode Quick Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                <span>Theme & Mode</span>
                <button
                  type="button"
                  onClick={toggleThemeMode}
                  className="inline-flex items-center gap-1 text-emerald-400 font-medium capitalize"
                >
                  {themeMode === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                  {themeMode}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeStyle(t.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all border ${
                      themeStyle === t.id
                        ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--foreground)]"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Arabic Font Selector */}
            <div>
              <span className="block mb-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                Arabic Script Font
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {fontOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setArabicFont(f.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all border text-left ${
                      prefs.arabicFont === f.id
                        ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--foreground)]"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Urdu Translation Font Selector */}
            <div>
              <span className="block mb-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                Urdu Translation Font
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {urduFontOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setUrduFont(f.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all border text-left ${
                      (prefs.urduFont || "nastaliq") === f.id
                        ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--foreground)]"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Layout Mode (Compact vs Cards) */}
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <LayoutList className="h-3 w-3 text-emerald-400" /> Verse Stream Layout
                </span>
                <span className="text-[10px] text-emerald-400 font-mono capitalize">
                  {readingMode === "compact" ? "Compact (Default)" : "Cards"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setReadingMode("compact")}
                  className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all border flex items-center justify-center gap-1.5 ${
                    readingMode === "compact"
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <AlignJustify className="h-3 w-3" /> Compact (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setReadingMode("continuous")}
                  className={`py-1.5 px-2 rounded-lg font-medium text-[11px] transition-all border flex items-center justify-center gap-1.5 ${
                    readingMode === "continuous"
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <LayoutList className="h-3 w-3" /> Cards
                </button>
              </div>
            </div>

            {/* Global Application Language */}
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
                  <Languages className="h-3 w-3 text-emerald-400" /> Global App Language
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">All App Views</span>
              </div>
              <LanguageToggle className="w-full justify-center" />
            </div>

            {/* Word-By-Word Language Selector */}
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
                  <Globe className="h-3 w-3 text-emerald-400" /> Word-By-Word (WBW) Language
                </span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[10px] text-[var(--muted-foreground)]">Show WBW</span>
                  <input
                    type="checkbox"
                    checked={prefs.showWordByWord}
                    onChange={toggleShowWordByWord}
                    className="accent-emerald-500 rounded"
                  />
                </label>
              </div>

              {prefs.showWordByWord && (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWbwLanguage("english")}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
                      prefs.wbwLanguage === "english"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Eng (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWbwLanguage("urdu")}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-medium font-urdu border transition-all ${
                      prefs.wbwLanguage === "urdu"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    اردو
                  </button>
                  <button
                    type="button"
                    onClick={() => setWbwLanguage("both")}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all ${
                      prefs.wbwLanguage === "both"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Both
                  </button>
                </div>
              )}
            </div>

            {/* Font Sizing Controls */}
            <div className="space-y-2.5">
              <span className="block font-semibold text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                Live Font Scaling
              </span>

              {/* Arabic Size Slider */}
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span>Arabic Size</span>
                  <span className="font-mono text-emerald-400 font-semibold">{prefs.arabicFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={52}
                  step={2}
                  value={prefs.arabicFontSize}
                  onChange={(e) => setArabicFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded-lg accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Urdu Size Slider */}
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span>Urdu Size</span>
                  <span className="font-mono text-emerald-400 font-semibold">{prefs.urduFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={30}
                  step={1}
                  value={prefs.urduFontSize}
                  onChange={(e) => setUrduFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded-lg accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* English Size Slider */}
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span>English Size</span>
                  <span className="font-mono text-emerald-400 font-semibold">{prefs.englishFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={22}
                  step={1}
                  value={prefs.englishFontSize}
                  onChange={(e) => setEnglishFontSize(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded-lg accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Translation Toggles & Scholar Selector */}
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] cursor-pointer">
                <span>Show Urdu Translation</span>
                <input
                  type="checkbox"
                  checked={prefs.showUrduTranslation}
                  onChange={toggleShowUrduTranslation}
                  className="h-3.5 w-3.5 accent-emerald-500 rounded"
                />
              </label>

              {prefs.showUrduTranslation && (
                <div className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[10px] text-[var(--muted-foreground)] block">Urdu Translation Scholar:</span>
                  <select
                    value={prefs.selectedUrduTranslationId}
                    onChange={(e) => setSelectedUrduTranslationId(Number(e.target.value))}
                    className="w-full rounded-lg bg-[var(--surface-raised)] px-2 py-1 text-[11px] text-[var(--foreground)] border border-[var(--border-subtle)]"
                  >
                    {urduTranslations.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] cursor-pointer">
                <span>Show English Translation</span>
                <input
                  type="checkbox"
                  checked={prefs.showTranslation}
                  onChange={toggleShowTranslation}
                  className="h-3.5 w-3.5 accent-emerald-500 rounded"
                />
              </label>
            </div>

            {/* Audio Reciter */}
            <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] text-[var(--muted-foreground)] block">Reciter:</span>
              <select
                value={currentReciter?.id || 7}
                onChange={(e) => {
                  const selected = reciters.find((r) => r.id === Number(e.target.value));
                  if (selected) setReciter(selected);
                }}
                className="w-full rounded-lg bg-[var(--surface-raised)] px-2 py-1 text-[11px] text-[var(--foreground)] border border-[var(--border-subtle)]"
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reciter_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Offline Data & Downloads Manager */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsDownloadManagerOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <CloudDownload className="h-4 w-4" />
                <span>Pre-download Quran & Audios for Offline</span>
              </button>
            </div>

            {/* Footer version */}
            <div className="text-center text-[10px] text-[var(--muted-foreground)] pt-1">
              {APP_CONFIG.name} v{APP_CONFIG.version} • Real-time Live Settings
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
