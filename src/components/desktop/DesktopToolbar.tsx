"use client";

import React from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { Verse } from "@/types/quran";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface DesktopToolbarProps {
  chapterId: number;
  chapterName: string;
  chapterArabic: string;
  totalAyahs: number;
  verses?: Verse[];
  onJumpToAyah?: (ayahNumber: number) => void;
}

export function DesktopToolbar({
  chapterId,
  chapterName,
  chapterArabic,
  totalAyahs,
  verses,
  onJumpToAyah,
}: DesktopToolbarProps) {
  const router = useRouter();
  const {
    setIsSettingsOpen,
  } = useDesktopWorkspace();

  const {
    prefs,
    setArabicFontSize,
    setQuranStudyMode,
    setQuranScript,
  } = useReadingPreferences();

  const studyMode = prefs.quranStudyMode || "read";

  const { isPlaying, playSurah, togglePlayPause, currentChapterId } = useAudio();
  const { isUrdu } = useLanguage();
  const isThisChapterPlaying = isPlaying && currentChapterId === chapterId;

  const handleAyahJump = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("ayahNum") as HTMLInputElement)?.value;
    const num = Number(input);
    if (!isNaN(num) && num >= 1 && num <= totalAyahs) {
      if (onJumpToAyah) {
        onJumpToAyah(num);
      } else {
        const el = document.getElementById(`ayah-${num}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div className="h-11 w-full flex-none flex items-center justify-between px-4 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] select-none text-xs z-20">
      {/* Left: Previous / Next Surah & Chapter Title */}
      <div className="flex items-center gap-2">
        {/* Prev Surah */}
        {chapterId > 1 ? (
          <Link
            href={`/surah/${chapterId - 1}`}
            className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            title="Previous Surah"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-6" />
        )}

        {/* Current Surah Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate max-w-[100px] sm:max-w-none">
            {chapterId}. {chapterName}
          </span>
          <span className="font-arabic text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline" dir="rtl">
            {chapterArabic}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] hidden md:inline">
            ({totalAyahs} {isUrdu ? "آیات" : "Ayahs"})
          </span>
        </div>

        {/* Next Surah */}
        {chapterId < 114 ? (
          <Link
            href={`/surah/${chapterId + 1}`}
            className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            title={isUrdu ? "اگلی سورت" : "Next Surah"}
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
            className="w-14 px-2 py-0.5 text-[11px] rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-0.5 rounded bg-[var(--surface-card)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--muted-foreground)] transition-colors"
          >
            {isUrdu ? "چھلانگ" : "Jump"}
          </button>
        </form>
      </div>

      {/* Right: Mode Switcher, Font Controls, Preferences & Play Surah */}
      <div className="flex items-center gap-2">
        {/* Read / Learn Mode Toggle */}
        <div
          className="flex items-center rounded-lg bg-[var(--surface-card)] p-0.5 border border-[var(--border-subtle)] text-[11px]"
          role="group"
          aria-label="Quran Study Mode"
        >
          <button
            type="button"
            onClick={() => setQuranStudyMode("read")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              studyMode === "read"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title={
              isUrdu
                ? "تلاوت موڈ: عربی، ایک ترجمہ اور تفسیر (لفظ بہ لفظ ترجمہ کے بغیر)"
                : "Reading Mode: Arabic, single translation & Tafseer (no word-by-word)"
            }
          >
            <BookOpen className="h-3 w-3" />
            <span>{isUrdu ? "تلاوت" : "Read"}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuranStudyMode("learn")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              studyMode === "learn"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title={
              isUrdu
                ? "تعلیم موڈ: لفظ بہ لفظ ترجمہ، تمام تراجم اور تفسیر"
                : "Learn Mode: Word-by-word translation, all translations & Tafseer"
            }
          >
            <GraduationCap className="h-3 w-3" />
            <span>{isUrdu ? "تعلیم" : "Learn"}</span>
          </button>
        </div>

        {/* Quran Script Toggle: Uthmani vs Indo-Pak */}
        <div
          className="flex items-center rounded-lg bg-[var(--surface-card)] p-0.5 border border-[var(--border-subtle)] text-[11px]"
          role="group"
          aria-label="Quran Script Style"
        >
          <button
            type="button"
            onClick={() => setQuranScript("uthmani")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              prefs.quranScript !== "indopak"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title={
              isUrdu
                ? "عثمانی رسم الخط (مصحف مدینہ)"
                : "Uthmani Script (Medina Mushaf)"
            }
          >
            <span>{isUrdu ? "عثمانی" : "Uthmani"}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuranScript("indopak")}
            className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              prefs.quranScript === "indopak"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title={
              isUrdu
                ? "پاکستانی / انڈو-پاک رسم الخط (اسلام 360 / برصغیر)"
                : "Indo-Pak Script (Pakistani Mushaf / Islam 360)"
            }
          >
            <span>{isUrdu ? "پاکستانی (انڈو-پاک)" : "Indo-Pak"}</span>
          </button>
        </div>

        {/* Font Size A- / A+ */}
        <div className="flex items-center rounded-lg bg-[var(--surface-card)] p-0.5 border border-[var(--border-subtle)] text-[11px]">
          <button
            type="button"
            onClick={() => setArabicFontSize(Math.max(22, prefs.arabicFontSize - 2))}
            className="px-2 py-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
            title={isUrdu ? "عربی فونٹ سائز چھوٹا کریں" : "Decrease Arabic Font Size"}
          >
            A-
          </button>
          <div className="w-px h-3.5 bg-[var(--border-subtle)]" />
          <button
            type="button"
            onClick={() => setArabicFontSize(Math.min(56, prefs.arabicFontSize + 2))}
            className="px-2 py-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
            title={isUrdu ? "عربی فونٹ سائز بڑا کریں" : "Increase Arabic Font Size"}
          >
            A+
          </button>
        </div>


        {/* Preferences Shortcut Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reading Preferences & Display Settings"
        >
          <Settings className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline font-medium">{isUrdu ? "ترتیبات" : "Preferences"}</span>
        </button>

        {/* Play Surah Button */}
        <button
          type="button"
          onClick={() => {
            if (isThisChapterPlaying) {
              togglePlayPause();
            } else {
              playSurah(chapterId, 1, verses);
            }
          }}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isThisChapterPlaying
              ? "bg-emerald-600 text-white shadow-emerald-900/30"
              : "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-emerald-100"
          }`}
          title={isThisChapterPlaying ? "Pause Recitation" : "Recite Entire Surah"}
        >
          {isThisChapterPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isUrdu ? "وقفہ" : "Pause"}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isUrdu ? "سورت سنیں" : "Play Surah"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
