import { fetchChapters, fetchJuzs } from "@/services/quranApi";
import { Chapter, Juz } from "@/types/quran";
import { QuranDirectoryTabs } from "@/components/home/QuranDirectoryTabs";
import { KhatmahWidget } from "@/components/home/KhatmahWidget";
import { ResumeReadingCard } from "@/components/home/ResumeReadingCard";
import { BookOpen, Sparkles, Compass, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  let chapters: Chapter[] = [];
  let juzs: Juz[] = [];
  let error: string | null = null;

  try {
    [chapters, juzs] = await Promise.all([fetchChapters(), fetchJuzs()]);
  } catch (e) {
    console.error("Failed to load initial Quran data:", e);
    error = "Unable to connect to Quran.com API. Please check your network connection and reload.";
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-20 space-y-4 sm:space-y-6">
      {/* Desktop & Mobile Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-4 sm:p-6 md:p-8 text-center shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-amber-500/5 pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/30 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Authentic Uthmani Script & Multi-Reciter Studio
        </div>

        <h1 className="font-arabic text-2xl sm:text-4xl md:text-5xl text-[var(--foreground)] mb-2 leading-relaxed" dir="rtl">
          إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        </h1>
        <p className="text-xs sm:text-base text-[var(--muted-foreground)] max-w-2xl mx-auto mb-4 sm:mb-5 leading-normal px-2">
          &ldquo;Indeed, this Qur&rsquo;an guides to that which is most suitable and gives good tidings to the believers.&rdquo;
          <span className="block text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-bold">Surah Al-Isra [17:9]</span>
        </p>

        {/* Quick Launch Actions - Mobile-First Stacked, Desktop Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/learn"
            className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber-300" /> Learn 70% Words & Games
          </Link>
          <Link
            href="/surah/1"
            className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 active:scale-95"
          >
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Start Reading: Surah Al-Fatihah
          </Link>
          <Link
            href="/surah/18"
            className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 active:scale-95"
          >
            <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Read Surah Al-Kahf
          </Link>
          <Link
            href="/surah/36"
            className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Read Surah Ya-Sin
          </Link>
        </div>

        {/* Quick Specs - 2-col on mobile, flex on desktop */}
        <div className="mt-5 sm:mt-6 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-6 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] text-left sm:text-center">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-none" /> 114 Chapters
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-none" /> 30 Juzs (Parts)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-none" /> Word Roots &amp; Grammar
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-none" /> Sunnah Pacing
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-950/40 border border-red-800/50 p-6 text-center text-red-200">
          <p className="font-semibold mb-1">Live Connection Issue</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Resume Reading Banner */}
          <ResumeReadingCard />

          {/* Khatmah & Daily Goal Tracker */}
          <KhatmahWidget />

          {/* Directory Tabs (Surahs vs Juzs) */}
          <QuranDirectoryTabs chapters={chapters} juzs={juzs} />
        </>
      )}
    </div>
  );
}
