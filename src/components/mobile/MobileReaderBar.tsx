"use client";

import React, { useState } from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
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

  const [ayahInput, setAyahInput] = useState("");

  if (!isMobile) return null;

  const isThisChapterPlaying = isPlaying && currentChapterId === chapterId;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(ayahInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalAyahs) {
      onJumpToAyah?.(num);
      setAyahInput("");
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
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className="h-10 w-full flex-none flex items-center justify-between px-2 gap-1 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] select-none text-xs z-20"
    >
      {/* ── LEFT: Prev / Chapter badge / Next ── */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Prev Surah */}
        {chapterId > 1 ? (
          <Link
            href={`/surah/${chapterId - 1}`}
            aria-label={isUrdu ? "پچھلی سورت" : "Previous Surah"}
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <div className="w-8" />
        )}

        {/* Chapter badge + name */}
        <div className="flex items-center gap-1 px-1">
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-emerald-600 text-white text-[10px] font-bold leading-none">
            {chapterId}
          </span>
          <span className="text-[11px] font-semibold text-[var(--foreground)] max-w-[60px] truncate">
            {isUrdu ? chapterArabic : chapterName}
          </span>
        </div>

        {/* Next Surah */}
        {chapterId < 114 ? (
          <Link
            href={`/surah/${chapterId + 1}`}
            aria-label={isUrdu ? "اگلی سورت" : "Next Surah"}
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* ── CENTER: Ayah jump ── */}
      <form
        onSubmit={handleJump}
        className="flex items-center gap-1 flex-1 min-w-0 justify-center"
      >
        <input
          type="number"
          min={1}
          max={totalAyahs}
          value={ayahInput}
          onChange={(e) => setAyahInput(e.target.value)}
          placeholder={`1-${totalAyahs}`}
          aria-label={isUrdu ? "آیت نمبر" : "Ayah number"}
          className="w-14 px-1.5 py-0.5 text-[11px] rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono text-center"
        />
        <button
          type="submit"
          className="px-2 py-0.5 min-h-[26px] rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--muted-foreground)] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors active:scale-95"
        >
          {isUrdu ? "جاؤ" : "Go"}
        </button>
      </form>

      {/* ── RIGHT: Font size + Play/Pause ── */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* A- */}
        <button
          type="button"
          onClick={decreaseFontSize}
          disabled={prefs.arabicFontSize <= 22}
          aria-label={isUrdu ? "فونٹ چھوٹا کریں" : "Decrease font size"}
          title={isUrdu ? "فونٹ چھوٹا کریں" : "Decrease Arabic font size"}
          className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-[11px]"
        >
          A-
        </button>

        {/* A+ */}
        <button
          type="button"
          onClick={increaseFontSize}
          disabled={prefs.arabicFontSize >= 56}
          aria-label={isUrdu ? "فونٹ بڑا کریں" : "Increase font size"}
          title={isUrdu ? "فونٹ بڑا کریں" : "Increase Arabic font size"}
          className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-[11px]"
        >
          A+
        </button>

        {/* Play / Pause Surah */}
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={
            isThisChapterPlaying
              ? isUrdu ? "وقفہ" : "Pause"
              : isUrdu ? "سورت سنیں" : "Play Surah"
          }
          title={
            isThisChapterPlaying
              ? isUrdu ? "وقفہ" : "Pause Recitation"
              : isUrdu ? "پوری سورت سنیں" : "Recite Entire Surah"
          }
          className={`p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-colors active:scale-95 ${
            isThisChapterPlaying
              ? "bg-emerald-600 text-white"
              : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-800 dark:hover:text-emerald-300"
          }`}
        >
          {isThisChapterPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
