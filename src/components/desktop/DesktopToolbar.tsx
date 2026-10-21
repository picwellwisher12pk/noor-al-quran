"use client";

import React from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Type,
  LayoutList,
  AlignJustify,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DesktopToolbarProps {
  chapterId: number;
  chapterName: string;
  chapterArabic: string;
  totalAyahs: number;
}

export function DesktopToolbar({
  chapterId,
  chapterName,
  chapterArabic,
  totalAyahs,
}: DesktopToolbarProps) {
  const router = useRouter();
  const {
    readingMode,
    setReadingMode,
    toggleRightInspector,
    isRightInspectorOpen,
  } = useDesktopWorkspace();

  const {
    prefs,
    setArabicFontSize,
    setWbwLanguage,
    toggleShowWordByWord,
  } = useReadingPreferences();

  const { isPlaying, playVerse, togglePlayPause, currentChapterId } = useAudio();
  const isThisChapterPlaying = isPlaying && currentChapterId === chapterId;

  const handleAyahJump = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("ayahNum") as HTMLInputElement)?.value;
    const num = Number(input);
    if (!isNaN(num) && num >= 1 && num <= totalAyahs) {
      const el = document.getElementById(`ayah-${num}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="h-11 w-full flex-none flex items-center justify-between px-4 bg-[var(--surface-raised,#141e1a)] border-b border-[var(--border-subtle,#1e2c26)] select-none text-xs z-20">
      {/* Left: Previous / Next Surah & Chapter Title */}
      <div className="flex items-center gap-2">
        {/* Prev Surah */}
        {chapterId > 1 ? (
          <Link
            href={`/surah/${chapterId - 1}`}
            className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
            title="Previous Surah"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-6" />
        )}

        {/* Current Surah Title */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[var(--foreground)]">
            {chapterId}. {chapterName}
          </span>
          <span className="font-arabic text-base text-emerald-400 font-semibold" dir="rtl">
            {chapterArabic}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)]">
            ({totalAyahs} Ayahs)
          </span>
        </div>

        {/* Next Surah */}
        {chapterId < 114 ? (
          <Link
            href={`/surah/${chapterId + 1}`}
            className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
            title="Next Surah"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-6" />
        )}

        {/* Jump to Ayah Form */}
        <form onSubmit={handleAyahJump} className="hidden sm:flex items-center gap-1 ml-2">
          <input
            name="ayahNum"
            type="number"
            min={1}
            max={totalAyahs}
            placeholder={`1..${totalAyahs}`}
            className="w-14 px-2 py-0.5 text-[11px] rounded bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-[var(--surface-card,#182520)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle,#24362e)] text-[10px] font-semibold text-[var(--muted-foreground,#8e9b94)] transition-colors"
          >
            Jump
          </button>
        </form>
      </div>

      {/* Center: Word-by-Word & Layout Controls */}
      <div className="flex items-center gap-2">
        {/* WBW Selector */}
        <div className="flex items-center rounded-lg bg-[var(--surface-card,#182520)] p-0.5 border border-[var(--border-subtle,#24362e)] text-[10px]">
          <span className="px-1.5 py-0.5 text-[var(--muted-foreground,#8e9b94)] font-semibold">
            WBW:
          </span>
          <button
            type="button"
            onClick={() => setWbwLanguage("urdu")}
            className={`px-2 py-0.5 rounded font-urdu ${
              prefs.showWordByWord && prefs.wbwLanguage === "urdu"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => setWbwLanguage("english")}
            className={`px-2 py-0.5 rounded ${
              prefs.showWordByWord && prefs.wbwLanguage === "english"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            Eng
          </button>
          <button
            type="button"
            onClick={() => setWbwLanguage("both")}
            className={`px-2 py-0.5 rounded ${
              prefs.showWordByWord && prefs.wbwLanguage === "both"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            Both
          </button>
        </div>

        {/* Layout Mode */}
        <div className="hidden md:flex items-center rounded-lg bg-[var(--surface-card,#182520)] p-0.5 border border-[var(--border-subtle,#24362e)] text-[10px]">
          <button
            type="button"
            onClick={() => setReadingMode("continuous")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 ${
              readingMode === "continuous"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
            title="Continuous Verse Stream"
          >
            <LayoutList className="h-3 w-3" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setReadingMode("compact")}
            className={`px-2 py-0.5 rounded flex items-center gap-1 ${
              readingMode === "compact"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
            title="High Density Compact Mode"
          >
            <AlignJustify className="h-3 w-3" /> Compact
          </button>
        </div>
      </div>

      {/* Right: Font Controls & Play Surah */}
      <div className="flex items-center gap-2">
        {/* Font Size A- / A+ */}
        <div className="flex items-center rounded-lg bg-[var(--surface-card,#182520)] p-0.5 border border-[var(--border-subtle,#24362e)] text-[11px]">
          <button
            type="button"
            onClick={() => setArabicFontSize(Math.max(22, prefs.arabicFontSize - 2))}
            className="px-2 py-0.5 text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] font-bold"
            title="Decrease Arabic Font Size"
          >
            A-
          </button>
          <span className="px-1 font-mono text-[10px] text-emerald-400">
            {prefs.arabicFontSize}px
          </span>
          <button
            type="button"
            onClick={() => setArabicFontSize(Math.min(56, prefs.arabicFontSize + 2))}
            className="px-2 py-0.5 text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] font-bold"
            title="Increase Arabic Font Size"
          >
            A+
          </button>
        </div>

        {/* Play Surah Button */}
        <button
          type="button"
          onClick={() => {
            if (isThisChapterPlaying) {
              togglePlayPause();
            } else {
              playVerse(chapterId, `${chapterId}:1`);
            }
          }}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isThisChapterPlaying
              ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {isThisChapterPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isThisChapterPlaying ? "Pause" : "Play Surah"}</span>
        </button>
      </div>
    </div>
  );
}
