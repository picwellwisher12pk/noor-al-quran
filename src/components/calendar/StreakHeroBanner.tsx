"use client";

import React from "react";
import { Flame, Trophy, CalendarDays, BookOpen, Clock, Sparkles } from "lucide-react";
import { ReadingStreakSummary } from "@/services/readingActivityService";

interface StreakHeroBannerProps {
  summary: ReadingStreakSummary;
}

export function StreakHeroBanner({ summary }: StreakHeroBannerProps) {
  const {
    currentStreak,
    longestStreak,
    totalAyahsRead,
    totalActiveDays,
    totalMinutesSpent,
    todayRecord,
  } = summary;

  const isTodayActive = (todayRecord.ayahsRead > 0 || todayRecord.wordsStudied > 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border,#1e2c26)] bg-[var(--surface-raised,#141e1a)] p-6 sm:p-7 shadow-lg">
      {/* Decorative emerald & amber background glow */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Streak Flame Badge */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center p-3 transition-all duration-300 ${
              currentStreak > 0
                ? "bg-gradient-to-tr from-amber-500/20 via-emerald-600/20 to-amber-400/20 border border-amber-400/40 shadow-lg shadow-amber-950/20 animate-pulse"
                : "bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]"
            }`}>
              <div className="relative">
                <Flame className={`h-9 w-9 sm:h-10 sm:w-10 ${currentStreak > 0 ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-[var(--muted-foreground,#8e9b94)]"}`} />
                {currentStreak > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground,#f1f5f9)]">{currentStreak}</span>
                <span className="text-[11px] uppercase font-bold text-amber-300">Days</span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Daily Quran Streak</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground,#f1f5f9)] mb-1">
              {currentStreak > 0 ? (
                <>
                  <span className="text-amber-400">{currentStreak}-Day</span> Devotion Streak
                </>
              ) : (
                "Begin Your Reading Journey"
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground,#8e9b94)] max-w-sm">
              {isTodayActive ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Today&apos;s recitation recorded! Streak protected.
                </span>
              ) : (
                "Recite any Ayah or review vocabulary today to keep your streak glowing."
              )}
            </p>
          </div>
        </div>

        {/* Right: Key Stats Pillars */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--muted-foreground,#8e9b94)] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Record</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--foreground,#f1f5f9)]">{longestStreak}</div>
              <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">Best Streak</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--muted-foreground,#8e9b94)] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Ayahs</span>
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{totalAyahsRead.toLocaleString()}</div>
              <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">Verses Read</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--muted-foreground,#8e9b94)] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active</span>
              <CalendarDays className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--foreground,#f1f5f9)]">{totalActiveDays}</div>
              <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">Total Days</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--muted-foreground,#8e9b94)] mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Time</span>
              <Clock className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[var(--foreground,#f1f5f9)]">
                {totalMinutesSpent >= 60
                  ? `${Math.floor(totalMinutesSpent / 60)}h ${totalMinutesSpent % 60}m`
                  : `${totalMinutesSpent}m`}
              </div>
              <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">Engaged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Prophetic encouragement quote */}
      <div className="mt-5 pt-4 border-t border-[var(--border-subtle,#24362e)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground,#8e9b94)]">
        <div className="italic text-center sm:text-left">
          &ldquo;The most beloved deed to Allah is the most regular and constant even if it were little.&rdquo;
          <span className="ml-1 text-emerald-400 font-semibold">— Sahih al-Bukhari 6464</span>
        </div>
        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
          Today: {todayRecord.ayahsRead} ayahs &bull; {todayRecord.wordsStudied} words studied
        </div>
      </div>
    </div>
  );
}
