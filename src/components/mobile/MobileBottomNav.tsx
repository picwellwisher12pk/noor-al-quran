"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  BookOpen,
  Layers,
  GraduationCap,
  Flame,
  Settings,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentStreak } = useReadingActivity();
  const { isUrdu } = useLanguage();
  const {
    setIsMobileSurahDrawerOpen,
    setIsSettingsOpen,
    activeChapterId,
  } = useDesktopWorkspace();

  const isReadingActive = pathname === "/" || pathname.startsWith("/surah");
  const isLearnActive = pathname.startsWith("/learn");
  const isCalendarActive = pathname.startsWith("/calendar");

  return (
    <nav className="lg:hidden w-full flex-none bg-[var(--surface-raised)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] text-[var(--foreground)] z-30 select-none pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="h-14 grid grid-cols-5 items-center px-1">
        {/* 1. Read / Surah Reader */}
        <Link
          href={activeChapterId ? `/surah/${activeChapterId}` : "/"}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isReadingActive
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className="relative">
            <BookOpen className="h-5 w-5" />
            {isReadingActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 truncate">
            {isUrdu ? "تلاوت" : "Read"}
          </span>
        </Link>

        {/* 2. Surahs & Juz Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileSurahDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px] mt-1 truncate">
            {isUrdu ? "سورتیں" : "Surahs"}
          </span>
        </button>

        {/* 3. Learn Quranic Arabic */}
        <Link
          href="/learn"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isLearnActive
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className="relative">
            <GraduationCap className="h-5 w-5" />
            {isLearnActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 truncate">
            {isUrdu ? "تعلیم" : "Learn"}
          </span>
        </Link>

        {/* 4. Calendar & Streak */}
        <Link
          href="/calendar"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            isCalendarActive
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className="relative">
            <Flame className={`h-5 w-5 ${currentStreak > 0 ? "text-amber-500 fill-amber-500/20" : ""}`} />
            {currentStreak > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 leading-none">
                {currentStreak}
              </span>
            )}
            {isCalendarActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 truncate">
            {isUrdu ? "تسلسل" : "Streak"}
          </span>
        </Link>

        {/* 5. Settings Modal */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1 truncate">
            {isUrdu ? "سیٹنگز" : "Settings"}
          </span>
        </button>
      </div>
    </nav>
  );
}

