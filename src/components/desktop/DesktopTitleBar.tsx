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
  Menu,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isTauri as checkIsTauri, safeCloseWindow, safeMinimizeWindow, safeToggleMaximize } from "@/utils/platform";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { AppMenuDrawer } from "./AppMenuDrawer";

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
    setIsSettingsOpen,
    chapters,
    activeChapterId,
    activeAyahNumber,
  } = useDesktopWorkspace();

  const { themeMode, toggleThemeMode } = useTheme();
  const { isPlaying, currentVerseKey, togglePlayPause } = useAudio();
  const { currentStreak } = useReadingActivity();
  const { isUrdu } = useLanguage();
  const { user, isSignedIn, isSyncing } = useGoogleAuth();
  const [isTauri, setIsTauri] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsTauri(checkIsTauri());
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  // Window Action Handlers (Supports both Native Tauri window and Browser fallback)
  const handleWindowClose = () => {
    safeCloseWindow();
  };

  const handleWindowMinimize = () => {
    if (isTauri) {
      safeMinimizeWindow();
    } else {
      toggleLeftSidebar();
    }
  };

  const handleWindowMaximize = () => {
    safeToggleMaximize();
  };

  return (
    <header
      className="h-10 w-full flex-none flex items-center justify-between px-3 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] select-none z-40 text-xs"
    >
      {/* Left: Window controls & App Branding */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Window Control Buttons */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={handleWindowClose}
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer"
            title={isTauri ? "Close Application" : "Go to Home"}
          />
          <button
            type="button"
            onClick={handleWindowMinimize}
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
            title={isTauri ? "Minimize Window" : "Toggle Sidebar"}
          />
          <button
            type="button"
            onClick={handleWindowMaximize}
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            title={isTauri ? "Maximize / Restore Window" : "Toggle Fullscreen"}
          />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
          title="Toggle Navigation Sidebar (Ctrl+B)"
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        {/* App Title & Version Pill */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
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
      </div>

      {/* Draggable spacer between center search and right tools */}
      <div className="flex-1 h-full min-w-4 cursor-default" data-tauri-drag-region />

      {/* Right: Tools & Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Audio Playing Pill (only while audio is active) */}
        {isPlaying && (
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium animate-pulse cursor-pointer shadow-sm"
            title="Pause recitation"
          >
            <Volume2 className="h-3 w-3" />
            <span>Ayah {currentVerseKey || ""}</span>
          </button>
        )}

        {/* Global Language Toggle Pill */}
        <LanguageToggle compact={true} />

        {/* Right Inspector Toggle (Only visible on Quran reading pages) */}
        {isReadingPage && (
          <button
            type="button"
            onClick={toggleRightInspector}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isRightInspectorOpen
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
            }`}
            title="Toggle Linguistic & Tafseer Inspector (Ctrl+\)"
          >
            {isRightInspectorOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Application Menu & User Profile Trigger */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--foreground)] text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-98"
          title="Open Noor Al-Quran Hub & Menu (Backup, Themes, Navigation & Settings)"
        >
          {isSignedIn && user ? (
            <div className="flex items-center gap-1.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full border border-emerald-500/50"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
              {isSyncing ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline font-bold">{isUrdu ? "مینو" : "Menu"}</span>
            </div>
          )}
        </button>
      </div>

      {/* Centralized Application Hub & Menu Drawer */}
      <AppMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
