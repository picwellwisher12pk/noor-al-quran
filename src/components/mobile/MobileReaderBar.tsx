"use client";

import React, { useState } from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Verse } from "@/types/quran";

interface MobileReaderBarProps {
  chapterId: number;
  chapterName: string;
  chapterArabic: string;
  totalAyahs: number;
  verses?: Verse[];
  onJumpToAyah?: (num: number) => void;
}

export function MobileReaderBar({
  chapterId,
  chapterName,
  chapterArabic,
  totalAyahs,
  verses,
  onJumpToAyah,
}: MobileReaderBarProps) {
  const isMobile = useIsMobile();
  const { prefs, setArabicFontSize } = useReadingPreferences();
  const { isPlaying, playSurah, togglePlayPause, currentChapterId } = useAudio();
  const { isUrdu } = useLanguage();
  const { setIsMobileSurahDrawerOpen } = useDesktopWorkspace();

  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [ayahInput, setAyahInput] = useState("");

  if (!isMobile) return null;

  const isThisChapterPlaying = isPlaying && currentChapterId === chapterId;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(ayahInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalAyahs) {
      onJumpToAyah?.(num);
      setAyahInput("");
      setIsJumpOpen(false);
    }
  };

  const decreaseFontSize = () =>
    setArabicFontSize(Math.max(22, prefs.arabicFontSize - 2));
  const increaseFontSize = () =>
    setArabicFontSize(Math.min(56, prefs.arabicFontSize + 2));

  const handlePlayPause = () => {
    if (isThisChapterPlaying) {
      togglePlayPause();
    } else {
      playSurah(chapterId, 1, verses);
    }
  };

  return (
    <header
      className="w-full flex-none bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] text-[var(--foreground)] z-30 select-none shadow-xs pt-[env(safe-area-inset-top,0px)]"
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <div className="h-12 px-2.5 flex items-center justify-between gap-1">
        {/* Left: Back Arrow + Surah Info */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Back to Home Button */}
          <Link
            href="/"
            aria-label="Back to Surahs"
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Surah Badge */}
          <span className="flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] font-mono font-bold text-[11px] shrink-0">
            {chapterId}
          </span>

          {/* Surah Name English + Arabic */}
          <div className="min-w-0 flex items-baseline gap-1.5 truncate">
            <span className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
              {chapterName}
            </span>
            <span
              className="font-arabic text-[var(--primary)] text-xs sm:text-sm font-semibold shrink-0"
              dir="rtl"
            >
              {chapterArabic}
            </span>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Jump to Ayah Form / Button */}
          {isJumpOpen ? (
            <form onSubmit={handleJump} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={totalAyahs}
                value={ayahInput}
                onChange={(e) => setAyahInput(e.target.value)}
                placeholder={`1-${totalAyahs}`}
                autoFocus
                className="w-13 px-1.5 py-0.5 text-base sm:text-xs rounded bg-[var(--surface-card)] border border-[var(--primary)] text-[var(--foreground)] focus:outline-none font-mono text-center"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] font-bold"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setIsJumpOpen(false)}
                className="px-1 text-xs text-[var(--muted-foreground)]"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsJumpOpen(true)}
              title={`Jump to Ayah (1-${totalAyahs})`}
              className="px-2 py-1 rounded-md text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            >
              Ayah
            </button>
          )}

          {/* Font Size A- / A+ */}
          <button
            type="button"
            onClick={decreaseFontSize}
            disabled={prefs.arabicFontSize <= 22}
            aria-label="Decrease Font Size"
            className="p-1 min-w-[28px] h-7 rounded text-[11px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] disabled:opacity-40"
          >
            A-
          </button>
          <button
            type="button"
            onClick={increaseFontSize}
            disabled={prefs.arabicFontSize >= 56}
            aria-label="Increase Font Size"
            className="p-1 min-w-[28px] h-7 rounded text-[11px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] disabled:opacity-40"
          >
            A+
          </button>

          {/* Recite Whole Surah Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={isThisChapterPlaying ? "Pause Surah" : "Play Surah"}
            className={`p-1.5 rounded-lg transition-all active:scale-95 ${
              isThisChapterPlaying
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--primary)] hover:bg-[var(--primary)]/15"
            }`}
          >
            {isThisChapterPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Surahs Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMobileSurahDrawerOpen(true)}
            aria-label="Open Surahs Drawer"
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95"
            title="Browse all Surahs"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
