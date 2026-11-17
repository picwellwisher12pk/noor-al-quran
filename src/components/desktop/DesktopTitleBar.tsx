"use client";

import React, { useEffect, useState } from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useTheme } from "@/context/ThemeContext";
import { useAudio } from "@/context/AudioContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { APP_CONFIG } from "@/config/version";
import {
  Search,
  Mic,
  Settings,
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
  Minus,
  Square,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isTauri as checkIsTauri,
  isMac as checkIsMac,
  safeCloseWindow,
  safeMinimizeWindow,
  safeToggleMaximize,
} from "@/utils/platform";
import { useLanguage } from "@/context/LanguageContext";

export function DesktopTitleBar() {
  const pathname = usePathname();
  const isReadingPage = pathname === "/" || pathname.startsWith("/surah");
  const isLearnRoute = pathname.startsWith("/learn");
  const isCalendarRoute = pathname.startsWith("/calendar");

  const {
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isRightInspectorOpen,
    toggleRightInspector,
    setIsSearchOpen,
    setIsVerseIdentifierOpen,
    setIsSettingsOpen,
    chapters,
    activeChapterId,
    activeAyahNumber,
  } = useDesktopWorkspace();

  const { themeMode, resolvedMode, toggleThemeMode } = useTheme();
  const { isPlaying, currentVerseKey, togglePlayPause } = useAudio();
  const { currentStreak } = useReadingActivity();
  const { isUrdu } = useLanguage();
  const [isTauri, setIsTauri] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    setIsTauri(checkIsTauri());
    setIsMac(checkIsMac());

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Track native window maximize state in Tauri
    let unlistenResize: (() => void) | undefined;
    if (checkIsTauri()) {
      import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        win.isMaximized().then(setIsMaximized);
        win.onResized(async () => {
          setIsMaximized(await win.isMaximized());
        }).then((unlisten) => {
          unlistenResize = unlisten;
        });
      }).catch(() => {});
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      unlistenResize?.();
    };
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  // Window Action Handlers
  const handleWindowClose = () => {
    safeCloseWindow();
  };

  const handleWindowMinimize = () => {
    safeMinimizeWindow();
  };

  const handleWindowMaximize = () => {
    safeToggleMaximize();
  };

  return (
    <header
      className="h-10 w-full flex-none flex items-center justify-between px-3 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] select-none z-40 text-xs"
      data-tauri-drag-region
      onDoubleClick={isTauri ? handleWindowMaximize : undefined}
    >
      {/* Left: Window controls (macOS Tauri) & App Branding */}
      <div className="flex items-center gap-2.5 shrink-0" data-tauri-drag-region-exclude>
        {/* macOS Traffic Light Buttons (Only on native macOS Desktop) */}
        {isTauri && isMac && (
          <div className="flex items-center gap-1.5 pr-2.5 mr-1 border-r border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleWindowClose}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer"
              title="Close Application"
            />
            <button
              type="button"
              onClick={handleWindowMinimize}
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
              title="Minimize Window"
            />
            <button
              type="button"
              onClick={handleWindowMaximize}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              title="Maximize / Restore Window"
            />
          </div>
        )}

        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
          title="Toggle Navigation Sidebar (Ctrl+B)"
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        {/* App Title & Branding */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-5 h-5 rounded-md bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] group-hover:scale-105 transition-transform">
            <BookOpen className="h-3 w-3" />
          </div>
          <span className="font-semibold text-[var(--foreground)] tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="font-arabic text-xs text-[var(--primary)] opacity-90" dir="rtl">
            {APP_CONFIG.nameArabic}
          </span>
        </Link>
      </div>

      {/* Draggable spacer between left branding and center search */}
      <div className="flex-1 h-full min-w-4 cursor-default" data-tauri-drag-region />

      {/* Center: Command Search / Quick Jump Pill */}
      <div className="flex items-center gap-2 max-w-md w-full justify-center px-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center justify-between w-64 md:w-80 px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all shadow-inner text-xs cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {activeChapter ? `${activeChapter.id}. ${activeChapter.name_simple} (${activeChapter.name_arabic})` : (isUrdu ? "سورت، آیت یا لفظ تلاش کریں..." : "Search Surah, Ayah or Word...")}
            </span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--muted-foreground)]">
            Ctrl+K
          </kbd>
        </button>

        {/* Recite to Identify Ayah Pill */}
        <button
          type="button"
          onClick={() => setIsVerseIdentifierOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all text-xs font-semibold cursor-pointer shadow-xs"
          title="Recite to Identify Verse (Voice / Audio Search)"
        >
          <Mic className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{isUrdu ? "تلاوت" : "Recite"}</span>
        </button>
      </div>

      {/* Draggable spacer between center search and right tools */}
      <div className="flex-1 h-full min-w-4 cursor-default" data-tauri-drag-region />

      {/* Right: Tools & Toggles */}
      <div className="flex items-center gap-1.5 shrink-0" data-tauri-drag-region-exclude>
        {/* Audio Playing Pill (only while audio is active) */}
        {isPlaying && (
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-[11px] font-medium animate-pulse cursor-pointer shadow-sm"
            title="Pause recitation"
          >
            <Volume2 className="h-3 w-3" />
            <span>Ayah {currentVerseKey || ""}</span>
          </button>
        )}

        {/* Desktop Theme Mode Toggle (Light / Dark) */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={toggleThemeMode}
          className="p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
          title={resolvedMode === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label="Toggle dark / light theme"
        >
          {resolvedMode === "dark" ? (
            <Sun className="h-3.5 w-3.5 text-amber-500 hover:text-amber-400 transition-colors" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" />
          )}
        </button>

        {/* Right Inspector Toggle (Only visible on Quran reading pages) */}
        {isReadingPage && (
          <button
            type="button"
            onClick={toggleRightInspector}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isRightInspectorOpen
                ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
              }`}
            title="Toggle Linguistic & Tafseer Inspector (Ctrl+\)"
          >
            {isRightInspectorOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Fullscreen Mode Toggle (Universal across Web and Desktop) */}
        <button
          type="button"
          onClick={safeToggleMaximize}
          className="p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
          title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
          )}
        </button>

        {/* Windows / Linux Native Window Controls (Only in Tauri Desktop on Windows/Linux) */}
        {isTauri && !isMac && (
          <div className="flex items-center h-10 ml-1.5 border-l border-[var(--border-subtle)] -mr-3">
            <button
              type="button"
              onClick={safeMinimizeWindow}
              className="h-full px-3.5 hover:bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
              title="Minimize Window"
              aria-label="Minimize Window"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={safeToggleMaximize}
              className="h-full px-3.5 hover:bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
              title={isMaximized ? "Restore Window" : "Maximize Window"}
              aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Square className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={handleWindowClose}
              className="h-full px-3.5 hover:bg-rose-600 hover:text-white text-[var(--muted-foreground)] transition-colors flex items-center justify-center cursor-pointer"
              title="Close Application"
              aria-label="Close Application"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
