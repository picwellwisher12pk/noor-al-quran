"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Award,
  Sparkles,
  Flame,
  Star,
  BookOpen,
  CalendarRange,
  Clock,
  Layers,
} from "lucide-react";
import {
  DailyReadingRecord,
  WeekdayStat,
  MonthlyAggregate,
  getWeekdayReadingStats,
  getMonthlyReadingAggregates,
  getTodayString,
} from "@/services/readingActivityService";

interface TimeframeInfographicsProps {
  records: Record<string, DailyReadingRecord>;
  onSelectDate: (dateStr: string) => void;
}

export function TimeframeInfographics({
  records,
  onSelectDate,
}: TimeframeInfographicsProps) {
  const [activeTab, setActiveTab] = useState<"days" | "weekdays" | "months">("days");
  const todayStr = getTodayString();

  // 14 Days Timeline Calculation
  const pastDaysList = useMemo(() => {
    const list: {
      dateStr: string;
      dayName: string;
      dayNumber: string;
      monthShort: string;
      fullDateLabel: string;
      ayahs: number;
      words: number;
      minutes: number;
      isToday: boolean;
      isFriday: boolean;
    }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      const rec = records[dateStr];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = String(d.getDate());
      const monthShort = d.toLocaleDateString("en-US", { month: "short" });
      const fullDateLabel = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      list.push({
        dateStr,
        dayName,
        dayNumber,
        monthShort,
        fullDateLabel,
        ayahs: rec?.ayahsRead || 0,
        words: rec?.wordsStudied || 0,
        minutes: rec?.minutesSpent || 0,
        isToday: dateStr === todayStr,
        isFriday: d.getDay() === 5,
      });
    }
    return list;
  }, [records, todayStr]);

  const maxDailyAyahs = useMemo(
    () => Math.max(1, ...pastDaysList.map((d) => d.ayahs)),
    [pastDaysList]
  );

  const total14DaysAyahs = useMemo(
    () => pastDaysList.reduce((acc, d) => acc + d.ayahs, 0),
    [pastDaysList]
  );

  const active14DaysCount = useMemo(
    () => pastDaysList.filter((d) => d.ayahs > 0 || d.words > 0).length,
    [pastDaysList]
  );

  const avg14DaysAyahs = useMemo(
    () =>
      active14DaysCount > 0 ? (total14DaysAyahs / active14DaysCount).toFixed(1) : "0",
    [total14DaysAyahs, active14DaysCount]
  );

  // Weekdays stats
  const weekdayStats: WeekdayStat[] = useMemo(
    () => getWeekdayReadingStats(records),
    [records]
  );
  const maxWeekdayAyahs = useMemo(
    () => Math.max(1, ...weekdayStats.map((w) => w.ayahsRead)),
    [weekdayStats]
  );
  const peakWeekday = useMemo(
    () =>
      weekdayStats.reduce(
        (prev, current) => (current.ayahsRead > prev.ayahsRead ? current : prev),
        weekdayStats[0]
      ),
    [weekdayStats]
  );

  const totalAyahsAllTime = useMemo(
    () => weekdayStats.reduce((sum, w) => sum + w.ayahsRead, 0),
    [weekdayStats]
  );

  // Monthly aggregates
  const monthlyAggregates: MonthlyAggregate[] = useMemo(
    () => getMonthlyReadingAggregates(records),
    [records]
  );

  // Arabic weekday names
  const arabicWeekdays: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الإثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-5 sm:p-7 shadow-xl shadow-emerald-950/5 dark:shadow-black/30 transition-all duration-300">
      {/* Header and Modern Segmented Tab Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 mb-1.5 shadow-xs">
            <Activity className="h-3.5 w-3.5" />
            <span>Infographic Analytics</span>
            <span className="opacity-40">&bull;</span>
            <span className="font-arabic text-[11px]" dir="rtl">
              تحليلات القراءة
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            Reading Breakdown Across Timeframes
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Visualize devotion metrics by individual dates, weekdays, and monthly trends
          </p>
        </div>

        {/* Modern Segmented Control (Solid Flat Theme) */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xs self-stretch sm:self-auto overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("days")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "days"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>14-Day Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weekdays")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "weekdays"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Days of Week</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("months")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "months"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Monthly Growth</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 14-DAY TIMELINE INFOGRAPHIC                            */}
      {/* ============================================================== */}
      {activeTab === "days" && (
        <div className="relative z-10 pt-5 space-y-4">
          {/* Top Quick Stats Pill Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)] tracking-tight">
                Daily Ayahs Read
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-card)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]">
                Last 14 Days
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                <BookOpen className="h-3 w-3" />
                <span>{total14DaysAyahs} total vs</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 text-xs font-bold">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>Peak: {maxDailyAyahs} vs</span>
              </span>
            </div>
          </div>

          {/* Modern Pillar Bar Chart */}
          <div className="relative rounded-2xl bg-[var(--surface-card)]/60 dark:bg-[var(--surface-card)]/40 border border-[var(--border-subtle)] p-4 sm:p-5 overflow-hidden">
            {/* Background reference gridlines */}
            <div className="absolute inset-x-4 top-6 bottom-16 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
              <div className="border-b border-dashed border-[var(--foreground)] w-full" />
              <div className="border-b border-dashed border-[var(--foreground)] w-full" />
              <div className="border-b border-dashed border-[var(--foreground)] w-full" />
            </div>

            {/* Scrollable Pillars Container */}
            <div className="overflow-x-auto pb-1 scrollbar-none">
              <div className="min-w-[480px] h-52 sm:h-60 flex items-end gap-2 sm:gap-2.5 pt-7 pb-2 px-1">
                {pastDaysList.map((day) => {
                  const heightPercent =
                    day.ayahs > 0
                      ? Math.max(12, Math.round((day.ayahs / maxDailyAyahs) * 100))
                      : 0;
                  const isPeak = day.ayahs === maxDailyAyahs && maxDailyAyahs > 0;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => onSelectDate(day.dateStr)}
                      className="group/col flex-1 min-w-[28px] sm:min-w-[34px] h-full flex flex-col justify-end items-center relative focus:outline-none cursor-pointer"
                      title={`${day.fullDateLabel}: ${day.ayahs} ayahs, ${day.words} words`}
                    >
                      {/* Floating Peak Badge */}
                      {isPeak && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider shadow-xs whitespace-nowrap z-20">
                          Peak
                        </div>
                      )}

                      {/* Number Display Above Bar */}
                      <span
                        className={`text-[10px] sm:text-[11px] font-mono font-bold mb-1.5 transition-all duration-200 ${
                          day.ayahs > 0
                            ? day.isToday
                              ? "text-amber-600 dark:text-amber-400 font-extrabold"
                              : isPeak
                              ? "text-emerald-700 dark:text-emerald-300 font-extrabold scale-105"
                              : "text-emerald-800 dark:text-emerald-300"
                            : "opacity-0 group-hover/col:opacity-60 text-[var(--muted-foreground)]"
                        }`}
                      >
                        {day.ayahs > 0 ? day.ayahs : "0"}
                      </span>

                      {/* Pillar Background Track */}
                      <div className="w-full h-full rounded-lg bg-[var(--surface-sunken)]/60 dark:bg-white/[0.03] border border-[var(--border-subtle)]/40 group-hover/col:border-emerald-500/50 transition-all flex flex-col justify-end p-1 relative overflow-hidden">
                        {/* Active Bar Fill (Solid Flat Theme - No Gradients) */}
                        {day.ayahs > 0 ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-md transition-all duration-300 relative ${
                              day.isToday
                                ? "bg-amber-500 dark:bg-amber-400 shadow-sm ring-1 ring-amber-400"
                                : isPeak
                                ? "bg-emerald-700 dark:bg-emerald-400 shadow-sm ring-1 ring-emerald-500"
                                : "bg-emerald-600 dark:bg-emerald-500 shadow-xs group-hover/col:bg-emerald-500 dark:group-hover/col:bg-emerald-400"
                            }`}
                          />
                        ) : (
                          // Quiet rest day indicator
                          <div className="w-full h-full flex items-end justify-center pb-1">
                            <span className="text-[11px] text-[var(--muted-foreground)]/30 group-hover/col:text-emerald-500 transition-colors select-none font-bold">
                              &middot;
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Day Label Below Pillar */}
                      <div className="mt-2 text-center w-full">
                        <div
                          className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                            day.isToday
                              ? "text-amber-600 dark:text-amber-400"
                              : day.isFriday
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {day.dayNumber}
                        </div>
                        <div
                          className={`text-[9px] uppercase tracking-wider ${
                            day.isToday
                              ? "text-amber-600 dark:text-amber-400 font-extrabold"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {day.dayName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Guide & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] pt-1">
            <span className="text-center sm:text-left">
              Click any pillar bar to inspect recorded verses and detailed logs
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-md bg-amber-400 ring-2 ring-amber-400/30" />
                Today
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 ring-2 ring-emerald-500/30" />
                Recited Days
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                Peak Day
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: WEEKDAYS INFOGRAPHIC (Sunday - Saturday)                */}
      {/* ============================================================== */}
      {activeTab === "weekdays" && (
        <div className="relative z-10 pt-5 space-y-4">
          {/* Peak Day Highlight Card */}
          {totalAyahsAllTime > 0 && peakWeekday.ayahsRead > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/30 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      Most Devoted Day: {peakWeekday.dayName}
                    </h4>
                    {peakWeekday.dayIndex === 5 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Jumu&apos;ah Mubarak
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    You have recited{" "}
                    <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      {peakWeekday.ayahsRead.toLocaleString()} verses
                    </strong>{" "}
                    across {peakWeekday.activeCount} active {peakWeekday.dayName}s.
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
                  {Math.round((peakWeekday.ayahsRead / totalAyahsAllTime) * 100)}%
                </span>
                <div className="text-[10px] text-[var(--muted-foreground)] font-medium">
                  of all-time recitation
                </div>
              </div>
            </div>
          )}

          {/* Weekday Distribution Cards */}
          <div className="grid grid-cols-1 gap-2.5">
            {weekdayStats.map((item) => {
              const percent =
                totalAyahsAllTime > 0
                  ? Math.round((item.ayahsRead / totalAyahsAllTime) * 100)
                  : 0;
              const barWidth =
                maxWeekdayAyahs > 0
                  ? Math.max(
                      item.ayahsRead > 0 ? 8 : 0,
                      Math.round((item.ayahsRead / maxWeekdayAyahs) * 100)
                    )
                  : 0;
              const isFriday = item.dayIndex === 5;
              const arabicName = arabicWeekdays[item.dayName] || "";

              return (
                <div
                  key={item.dayName}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                    isFriday
                      ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--foreground)] w-24 flex items-center gap-1.5">
                        <span>{item.dayName}</span>
                        {isFriday && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500 inline-block" />
                        )}
                      </span>
                      <span className="text-[11px] font-arabic opacity-70" dir="rtl">
                        {arabicName}
                      </span>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                        &bull; {item.activeCount} active {item.activeCount === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`font-bold ${
                          isFriday
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {item.ayahsRead} ayahs
                      </span>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
                        ({percent}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Track */}
                  <div className="h-2 w-full rounded-full bg-[var(--surface-sunken)]/60 dark:bg-white/[0.04] border border-[var(--border-subtle)]/40 overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFriday
                          ? "bg-amber-500 dark:bg-amber-400 shadow-xs"
                          : "bg-emerald-600 dark:bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MONTHLY AGGREGATES INFOGRAPHIC                          */}
      {/* ============================================================== */}
      {activeTab === "months" && (
        <div className="relative z-10 pt-5">
          {monthlyAggregates.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[var(--surface-card)]/50 border border-[var(--border-subtle)]">
              <CalendarRange className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-semibold text-[var(--foreground)]">
                No Historical Months Logged Yet
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1">
                As you continue reading Quran and studying vocabulary across the year, your month-by-month progress will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {monthlyAggregates.map((m) => (
                <div
                  key={m.monthKey}
                  className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)]">
                    <div>
                      <h4 className="text-base font-bold text-[var(--foreground)]">
                        {m.monthName} {m.year}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {m.activeDays} active devotion days
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 shadow-xs">
                      {m.ayahsRead.toLocaleString()} ayahs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                    <div className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--muted-foreground)] text-[11px] block">
                        Daily Pace
                      </span>
                      <span className="text-sm font-bold text-[var(--foreground)] mt-0.5 block">
                        {m.activeDays > 0 ? (m.ayahsRead / m.activeDays).toFixed(1) : 0} vs/day
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--muted-foreground)] text-[11px] block">
                        Words Studied
                      </span>
                      <span className="text-sm font-bold text-teal-700 dark:text-teal-300 mt-0.5 block">
                        {m.wordsStudied} words
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
