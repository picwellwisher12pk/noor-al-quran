"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Flame,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { StreakHeroBanner } from "@/components/calendar/StreakHeroBanner";
import { ReadingCalendarHeatmap } from "@/components/calendar/ReadingCalendarHeatmap";
import { TimeframeInfographics } from "@/components/calendar/TimeframeInfographics";
import { ReadingMilestonesGrid } from "@/components/calendar/ReadingMilestonesGrid";
import { DayDetailModal } from "@/components/calendar/DayDetailModal";

export default function CalendarPage() {
  const { summary, records, currentStreak } = useReadingActivity();
  const [inspectDate, setInspectDate] = useState<string | null>(null);

  const selectedRecord = inspectDate ? records[inspectDate] || null : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-24 space-y-6 text-[var(--foreground)]">
      {/* 1. COMPACT CALENDAR NAVBAR */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 sm:p-2.5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] transition-colors border border-[var(--border-subtle)]"
            title="Return to Quran Reader"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                Reading Calendar &amp; Streak
              </h1>
              <span className="font-arabic text-xs sm:text-sm text-emerald-400 font-semibold hidden sm:inline" dir="rtl">
                سجل القراءة والاستمرارية
              </span>
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>{currentStreak}d Streak</span>
                </div>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5">
              Daily consistency, verses read across calendar dates, and devotion infographics
            </p>
          </div>
        </div>

        {/* Quick Nav shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            href="/learn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-emerald-400 border border-[var(--border-subtle)] transition-colors"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Learn Studio</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Read Quran</span>
          </Link>
        </div>
      </div>

      {/* 2. Streak Hero Banner */}
      <StreakHeroBanner summary={summary} />

      {/* 3. Interactive Reading Calendar Heatmap */}
      <ReadingCalendarHeatmap
        records={records}
        onSelectDate={(dateStr) => setInspectDate(dateStr)}
      />

      {/* 4. Infographics Analytics (14-day timeline, weekday breakdown, monthly growth) */}
      <TimeframeInfographics
        records={records}
        onSelectDate={(dateStr) => setInspectDate(dateStr)}
      />

      {/* 5. Reading Milestones & Badges */}
      <ReadingMilestonesGrid summary={summary} />

      {/* 6. App-Based Day Detail Inspector Modal */}
      {inspectDate && (
        <DayDetailModal
          selectedDate={inspectDate}
          record={selectedRecord}
          onClose={() => setInspectDate(null)}
        />
      )}
    </div>
  );
}
