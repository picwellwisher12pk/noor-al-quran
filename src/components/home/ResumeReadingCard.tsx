"use client";

import React from "react";
import Link from "next/link";
import { useBookmarks } from "@/context/BookmarksContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, BookOpen, History } from "lucide-react";

function formatRelativeTime(isoDate: string, isUrdu: boolean): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (isNaN(diffMs) || diffMs < 0) return "";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return isUrdu ? "ابھی ابھی" : "Just now";
  if (mins < 60) return isUrdu ? `${mins} منٹ پہلے` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isUrdu ? `${hours} گھنٹے پہلے` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return isUrdu ? "کل" : "Yesterday";
  if (days < 7) return isUrdu ? `${days} دن پہلے` : `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function ResumeReadingCard() {
  const { lastRead } = useBookmarks();
  const { isUrdu } = useLanguage();

  if (!lastRead) return null;

  const relativeTime = formatRelativeTime(lastRead.updatedAt, isUrdu);

  return (
    <div className="rounded-2xl bg-[var(--surface-raised)] border border-emerald-500/35 p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center gap-3.5 relative z-10 min-w-0">
        <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <History className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isUrdu ? "تلاوت جاری رکھیں" : "Continue Where You Stopped"}
            </span>
            {relativeTime && (
              <span className="text-[11px] text-[var(--muted-foreground)]">
                • {relativeTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] truncate">
              {lastRead.chapterId}. Surah {lastRead.chapterName}
            </h3>
            {lastRead.chapterArabic && (
              <span
                className="font-arabic text-base text-emerald-700 dark:text-emerald-400 font-semibold"
                dir="rtl"
              >
                {lastRead.chapterArabic}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {isUrdu ? `آیت ${lastRead.verseNumber}` : `Ayah ${lastRead.verseNumber}`}
            {lastRead.juzNumber ? ` • ${isUrdu ? `پارہ ${lastRead.juzNumber}` : `Juz ${lastRead.juzNumber}`}` : ""}
          </p>
        </div>
      </div>

      <Link
        href={`/surah/${lastRead.chapterId}?ayah=${lastRead.verseNumber}`}
        className="relative z-10 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
      >
        <BookOpen className="h-4 w-4" />
        <span>{isUrdu ? "تلاوت شروع کریں" : "Resume Reading"}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

