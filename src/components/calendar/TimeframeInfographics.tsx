"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  CalendarRange,
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

  // Calculate past 14 days timeline
  const todayStr = getTodayString();
  const pastDaysList = React.useMemo(() => {
    const list: { dateStr: string; label: string; ayahs: number; words: number }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      const rec = records[dateStr];
      const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      list.push({
        dateStr,
        label,
        ayahs: rec?.ayahsRead || 0,
        words: rec?.wordsStudied || 0,
      });
    }
    return list;
  }, [records]);

  const maxDailyAyahs = Math.max(1, ...pastDaysList.map((d) => d.ayahs));

  // Weekdays stats
  const weekdayStats: WeekdayStat[] = React.useMemo(
    () => getWeekdayReadingStats(records),
    [records]
  );
  const maxWeekdayAyahs = Math.max(1, ...weekdayStats.map((w) => w.ayahsRead));
  const peakWeekday = weekdayStats.reduce((prev, current) =>
    current.ayahsRead > prev.ayahsRead ? current : prev
  );

  // Monthly aggregates
  const monthlyAggregates: MonthlyAggregate[] = React.useMemo(
    () => getMonthlyReadingAggregates(records),
    [records]
  );

  const totalAyahsAllTime = weekdayStats.reduce((sum, w) => sum + w.ayahsRead, 0);

  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-5 sm:p-7 shadow-lg">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mb-1.5">
            <TrendingUp className="h-3 w-3" />
            <span>Infographic Analytics</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            Reading Breakdown Across Timeframes
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Visualize devotion metrics by individual dates, weekdays, and monthly trends
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center bg-[var(--surface-card)] p-1 rounded-2xl border border-[var(--border-subtle)] text-xs font-medium self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("days")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "days"
                ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            14-Day Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weekdays")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "weekdays"
                ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Days of Week
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("months")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "months"
                ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Monthly Growth
          </button>
        </div>
      </div>

      {/* Tab 1: 14-Day Timeline Infographic */}
      {activeTab === "days" && (
        <div className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Daily Ayahs Read (Last 14 Days)
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              Peak: {maxDailyAyahs} ayahs
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 sm:h-52 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] overflow-x-auto">
            {pastDaysList.map((day) => {
              const heightPercent =
                day.ayahs > 0 ? Math.max(14, Math.round((day.ayahs / maxDailyAyahs) * 100)) : 5;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => onSelectDate(day.dateStr)}
                  className="group flex-1 min-w-[28px] h-full flex flex-col justify-end items-center focus:outline-none cursor-pointer"
                  title={`${day.label}: ${day.ayahs} ayahs, ${day.words} words`}
                >
                  {/* Tooltip / value */}
                  <span
                    className={`text-[10px] font-mono mb-1 transition-opacity ${
                      day.ayahs > 0 ? "opacity-100 font-bold text-emerald-300" : "opacity-0 group-hover:opacity-75 text-[var(--muted-foreground)]"
                    }`}
                  >
                    {day.ayahs}
                  </span>

                  {/* Visual Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      day.ayahs > 0
                        ? isToday
                          ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          : "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                        : "bg-[var(--surface-raised)] border border-[var(--border-subtle)] group-hover:border-emerald-500/40"
                    }`}
                  />

                  {/* Day Label */}
                  <span
                    className={`text-[10px] mt-2 whitespace-nowrap truncate w-full text-center ${
                      isToday ? "text-amber-400 font-bold" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {day.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Click any date bar to inspect recorded verses and study logs</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Today
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Weekdays Infographic (Sunday - Saturday) */}
      {activeTab === "weekdays" && (
        <div className="pt-5 space-y-5">
          {/* Peak day highlight */}
          {totalAyahsAllTime > 0 && peakWeekday.ayahsRead > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    Most Devoted Day: {peakWeekday.dayName}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    You have recited {peakWeekday.ayahsRead.toLocaleString()} verses on {peakWeekday.dayName}s across your journey.
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {Math.round((peakWeekday.ayahsRead / totalAyahsAllTime) * 100)}%
                </span>
                <div className="text-[10px] text-[var(--muted-foreground)]">of total recitation</div>
              </div>
            </div>
          )}

          {/* Weekday distribution bars */}
          <div className="space-y-2.5">
            {weekdayStats.map((item) => {
              const percent =
                totalAyahsAllTime > 0
                  ? Math.round((item.ayahsRead / totalAyahsAllTime) * 100)
                  : 0;
              const barWidth =
                maxWeekdayAyahs > 0
                  ? Math.max(item.ayahsRead > 0 ? 8 : 0, Math.round((item.ayahsRead / maxWeekdayAyahs) * 100))
                  : 0;

              return (
                <div key={item.dayName} className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--foreground)] w-20">{item.dayName}</span>
                      <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
                        {item.activeCount} active {item.activeCount === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-emerald-400">{item.ayahsRead} ayahs</span>
                      <span className="text-[var(--muted-foreground)] text-[11px]">({percent}%)</span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.dayIndex === 5 // Friday
                          ? "bg-gradient-to-r from-amber-500 to-amber-300"
                          : "bg-gradient-to-r from-emerald-600 to-teal-400"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Aggregates Infographic */}
      {activeTab === "months" && (
        <div className="pt-5">
          {monthlyAggregates.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarRange className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-semibold text-[var(--foreground)]">No Historical Months Yet</h4>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1">
                As you continue reading Quran and studying vocabulary across the year, your month-by-month progress will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {monthlyAggregates.map((m) => (
                <div
                  key={m.monthKey}
                  className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <h4 className="text-base font-bold text-[var(--foreground)]">
                        {m.monthName} {m.year}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {m.activeDays} active reading days
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {m.ayahsRead} ayahs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--muted-foreground)] text-[11px] block">Daily Velocity</span>
                      <span className="text-sm font-bold text-[var(--foreground)]">
                        {m.activeDays > 0 ? Math.round(m.ayahsRead / m.activeDays) : 0} ayahs/day
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--muted-foreground)] text-[11px] block">Words Studied</span>
                      <span className="text-sm font-bold text-teal-300">
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
