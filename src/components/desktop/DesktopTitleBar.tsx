"use client";

import React, { useEffect, useState } from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useTheme } from "@/context/ThemeContext";
import { useAudio } from "@/context/AudioContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { APP_CONFIG } from "@/config/version";
import {
  Search,
  Settings,
  CloudDownload,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Volume2,
  BookOpen,
  Sun,
  Moon,
  Sparkles,
  Flame,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

export function DesktopTitleBar() {
  const {
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isRightInspectorOpen,
    toggleRightInspector,
    setIsSearchOpen,
    setIsSettingsOpen,
    setIsDownloadManagerOpen,
    chapters,
    activeChapterId,
    activeAyahNumber,
  } = useDesktopWorkspace();

  const { themeMode, toggleThemeMode } = useTheme();
  const { isPlaying, currentVerseKey, togglePlayPause } = useAudio();
  const { currentStreak } = useReadingActivity();
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      setIsTauri(true);
    }
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  // Window Action Handlers (Supports both Native Tauri window and Browser fallback)
  const handleWindowClose = () => {
    if (isTauri) {
      import("@tauri-apps/api/window").then((w) => w.getCurrentWindow().close()).catch(() => {});
    } else {
      window.location.href = "/";
    }
  };

  const handleWindowMinimize = () => {
    if (isTauri) {
      import("@tauri-apps/api/window").then((w) => w.getCurrentWindow().minimize()).catch(() => {});
    } else {
      toggleLeftSidebar();
    }
  };

  const handleWindowMaximize = () => {
    if (isTauri) {
      import("@tauri-apps/api/window").then((w) => w.getCurrentWindow().toggleMaximize()).catch(() => {});
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="h-10 w-full flex-none flex items-center justify-between px-3 bg-[var(--surface-raised,#141e1a)] border-b border-[var(--border-subtle,#1e2c26)] select-none z-40 text-xs"
    >
      {/* Left: Window controls & App Branding */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        {/* Window Control Buttons */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-subtle,#24362e)]">
          <button
            type="button"
            onClick={handleWindowClose}
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors shadow-sm"
            title={isTauri ? "Close Application" : "Go to Home"}
          />
          <button
            type="button"
            onClick={handleWindowMinimize}
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors shadow-sm"
            title={isTauri ? "Minimize Window" : "Toggle Sidebar"}
          />
          <button
            type="button"
            onClick={handleWindowMaximize}
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-sm"
            title={isTauri ? "Maximize / Restore Window" : "Toggle Fullscreen"}
          />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
          title="Toggle Navigation Sidebar (Ctrl+B)"
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        {/* App Title & Version Pill */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 rounded-md bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <BookOpen className="h-3 w-3" />
          </div>
          <span className="font-semibold text-[var(--foreground)] tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="font-arabic text-xs text-emerald-400 opacity-90" dir="rtl">
            {APP_CONFIG.nameArabic}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
            v{APP_CONFIG.version}
          </span>
        </Link>
      </div>

      {/* Center: Command Search / Quick Jump Pill */}
      <div className="flex items-center gap-2 max-w-md w-full justify-center px-4" data-tauri-drag-region>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center justify-between w-64 md:w-80 px-2.5 py-1 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:border-emerald-500/40 text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] transition-all shadow-inner text-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {activeChapter ? `${activeChapter.id}. ${activeChapter.name_simple} (${activeChapter.name_arabic})` : "Search Surah, Ayah or Word..."}
            </span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Tools & Toggles */}
      <div className="flex items-center gap-1.5">
        {/* Reading Streak & Calendar Link */}
        <Link
          href="/calendar"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all shadow-sm ${
            currentStreak > 0
              ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
          }`}
          title="Quran Reading Calendar & Daily Streak"
        >
          {currentStreak > 0 ? (
            <>
              <Flame className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{currentStreak}d Streak</span>
            </>
          ) : (
            <>
              <CalendarDays className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:inline">Calendar</span>
            </>
          )}
        </Link>

        {/* Learn 70% Quran Words Link */}
        <Link
          href="/learn"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all shadow-sm"
          title="Learn 70% Quran Words, Flashcards & Games"
        >
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span className="hidden sm:inline">Learn Words</span>
        </Link>

        {/* Audio Playing Pill */}
        {isPlaying && (
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium animate-pulse"
          >
            <Volume2 className="h-3 w-3" />
            <span>Ayah {currentVerseKey || ""}</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-1.5 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
          title={`Switch Mode (Current: ${themeMode})`}
        >
          {themeMode === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Offline Storage & Pre-downloads */}
        <button
          type="button"
          onClick={() => setIsDownloadManagerOpen(true)}
          className="p-1.5 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
          title="Offline Storage & Pre-downloads"
        >
          <CloudDownload className="h-3.5 w-3.5 text-emerald-400" />
        </button>

        {/* Live Settings Gear */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
          title="Open Settings Panel"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Right Inspector Toggle */}
        <button
          type="button"
          onClick={toggleRightInspector}
          className={`p-1.5 rounded-md transition-colors ${
            isRightInspectorOpen
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
              : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
          }`}
          title="Toggle Linguistic & Tafseer Inspector (Ctrl+\)"
        >
          {isRightInspectorOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
        </button>
      </div>
    </header>
  );
}
