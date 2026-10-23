"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_CONFIG } from "@/config/version";
import { useTheme } from "@/context/ThemeContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { SearchModal } from "@/components/modals/SearchModal";
import { BookmarksModal } from "@/components/modals/BookmarksModal";
import { DraggableSettingsPanel } from "@/components/modals/DraggableSettingsPanel";
import { KhatmahModal } from "@/components/modals/KhatmahModal";
import {
  BookOpen,
  Search,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Flame,
  CalendarDays,
} from "lucide-react";

export function Header() {
  const { themeMode, toggleThemeMode } = useTheme();
  const { bookmarks } = useBookmarks();
  const { plan, targetInfo } = useKhatmah();
  const { currentStreak } = useReadingActivity();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKhatmahOpen, setIsKhatmahOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[var(--header-bg,#0e1513)]/90 backdrop-blur-md border-b border-[var(--card-border,#1e2c26)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[var(--foreground)]">
                  {APP_CONFIG.name}
                </span>
                <span className="font-arabic text-sm text-emerald-400 font-medium">
                  نور القرآن
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
                  v{APP_CONFIG.version}
                </span>
              </div>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reading Streak & Calendar Link */}
            <Link
              href="/calendar"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                currentStreak > 0
                  ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300"
                  : "bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)] hover:text-white"
              }`}
              title="Quran Reading Calendar & Daily Streak"
            >
              {currentStreak > 0 ? (
                <>
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>{currentStreak}d Streak</span>
                </>
              ) : (
                <>
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Calendar</span>
                </>
              )}
            </Link>

            {/* Learn 70% Words Button */}
            <Link
              href="/learn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all shadow-sm"
              title="Learn 70% Quran Words & Games"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Learn Words</span>
            </Link>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] transition-colors"
            >
              <Search className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Search Quran...</span>
            </button>

            {/* Khatmah Goal Tracker Button */}
            <button
              type="button"
              onClick={() => setIsKhatmahOpen(true)}
              aria-label="Khatmah reading plan"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
            >
              <Calendar className="h-4 w-4 text-emerald-400" />
              {plan && targetInfo ? (
                <span className="hidden md:inline font-medium text-emerald-400">
                  Day {targetInfo.dayNumber}/{targetInfo.totalDays}
                </span>
              ) : (
                <span className="hidden md:inline">Khatmah</span>
              )}
            </button>

            {/* Bookmarks Button */}
            <button
              type="button"
              onClick={() => setIsBookmarksOpen(true)}
              aria-label="Open bookmarks"
              className="relative p-2 rounded-xl bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {bookmarks.length > 9 ? "9+" : bookmarks.length}
                </span>
              )}
            </button>

            {/* Quick Dark/Light Toggle */}
            <button
              type="button"
              onClick={toggleThemeMode}
              aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
              className="p-2 rounded-xl bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
            >
              {themeMode === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-emerald-600" />
              )}
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
              className="p-2 rounded-xl bg-[var(--surface-raised,#141e1a)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Modals & Floating Draggable Settings */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <BookmarksModal isOpen={isBookmarksOpen} onClose={() => setIsBookmarksOpen(false)} />
      <DraggableSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <KhatmahModal isOpen={isKhatmahOpen} onClose={() => setIsKhatmahOpen(false)} />
    </>
  );
}
