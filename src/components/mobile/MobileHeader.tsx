"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { APP_CONFIG } from "@/config/version";
import {
  Search,
  Mic,
  Menu,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  GraduationCap,
  Download,
} from "lucide-react";

export function MobileHeader() {
  const pathname = usePathname();
  const {
    chapters,
    activeChapterId,
    setIsSearchOpen,
    setIsVerseIdentifierOpen,
    setIsMobileMenuOpen,
  } = useDesktopWorkspace();

  const { resolvedMode, toggleThemeMode } = useTheme();
  const { isUrdu } = useLanguage();
  const { prefs, setQuranStudyMode } = useReadingPreferences();
  const studyMode = prefs.quranStudyMode || "read";

  const isReadingPage = pathname.startsWith("/surah");
  const currentChapter = isReadingPage
    ? chapters.find((c) => c.id === activeChapterId)
    : null;

  return (
    <header className="w-full flex-none bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] text-[var(--foreground)] z-30 select-none shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="h-13 px-3.5 flex items-center justify-between gap-2">
        {/* Left: Brand or Current Surah */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isReadingPage && currentChapter ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-none flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] font-bold text-xs font-mono">
                {currentChapter.id}
              </span>
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-xs sm:text-sm text-[var(--foreground)] truncate">
                    {currentChapter.name_simple}
                  </span>
                  <span className="font-arabic text-[var(--primary)] text-sm font-semibold flex-none" dir="rtl">
                    {currentChapter.name_arabic}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                  {currentChapter.verses_count} {isUrdu ? "آیات" : "Ayahs"}
                </span>
              </div>
            </div>
          ) : (
            <Link href="/app" className="flex items-center gap-2 min-w-0 group" title="Quran Reader">
              <div className="flex-none h-7 w-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate tracking-tight">
                  {APP_CONFIG.name}
                </span>
                <span className="font-arabic text-[11px] text-[var(--primary)] -mt-0.5 leading-tight" dir="rtl">
                  {APP_CONFIG.nameArabic}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-none">
          {/* Read / Learn Mode Pill on Surah pages */}
          {isReadingPage && (
            <button
              type="button"
              onClick={() => setQuranStudyMode(studyMode === "read" ? "learn" : "read")}
              className="px-2 py-1 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              title={
                studyMode === "read"
                  ? "Switch to Learn Mode (Word-by-word)"
                  : "Switch to Reading Mode"
              }
            >
              {studyMode === "learn" ? (
                <>
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{isUrdu ? "تعلیم" : "Learn"}</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isUrdu ? "تلاوت" : "Read"}</span>
                </>
              )}
            </button>
          )}

          {/* Recite to Identify Ayah */}
          <button
            type="button"
            onClick={() => setIsVerseIdentifierOpen(true)}
            aria-label="Recite to Identify Ayah"
            className="p-2 rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            title="Recite to Identify Verse"
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search Quran"
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            title="Search Quran"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Home & Downloads */}
          <Link
            href="/"
            aria-label="Home & Downloads"
            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="Home & Downloads"
          >
            <Download className="h-4 w-4" />
          </Link>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={toggleThemeMode}
            aria-label="Toggle dark / light theme"
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            title={resolvedMode === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {resolvedMode === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
            )}
          </button>

          {/* Full Menu Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open App Menu"
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
            title="App Menu & Profile"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

