"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DailyReadingRecord, getTodayString } from "@/services/readingActivityService";

interface ReadingCalendarHeatmapProps {
  records: Record<string, DailyReadingRecord>;
  onSelectDate: (dateStr: string) => void;
}

export function ReadingCalendarHeatmap({
  records,
  onSelectDate,
}: ReadingCalendarHeatmapProps) {
  const todayStr = getTodayString();
  const [todayYear, todayMonth] = todayStr.split("-").map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth); // 1-12

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(todayYear);
    setCurrentMonth(todayMonth);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString("en-US", {
    month: "long",
  });

  // Calculate statistics for this month
  let monthTotalAyahs = 0;
  let monthActiveDays = 0;
  let monthWordsStudied = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const rec = records[dStr];
    if (rec) {
      if (rec.ayahsRead > 0 || rec.wordsStudied > 0) {
        monthActiveDays++;
        monthTotalAyahs += rec.ayahsRead;
        monthWordsStudied += rec.wordsStudied;
      }
    }
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Intensity tier helper (0 to 4)
  const getCellIntensity = (ayahs: number, words: number) => {
    const total = ayahs + words;
    if (total === 0) return 0;
    if (total <= 5) return 1;
    if (total <= 15) return 2;
    if (total <= 30) return 3;
    return 4;
  };

  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-5 sm:p-7 shadow-lg">
      {/* Month Header and Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 shadow-sm">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                {monthName} {currentYear}
              </h2>
              {currentYear === todayYear && currentMonth === todayMonth && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Click any date to inspect verses, chapters, and study logs
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-[var(--surface-card)] rounded-xl p-0.5 border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-emerald-400 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-emerald-400 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Badges */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-5">
        <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-center">
          <div className="text-xs text-[var(--muted-foreground)] font-medium">Active Days</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">
            {monthActiveDays} <span className="text-xs font-normal text-[var(--muted-foreground)]">/ {totalDaysInMonth}</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-center">
          <div className="text-xs text-[var(--muted-foreground)] font-medium">Monthly Ayahs</div>
          <div className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">
            {monthTotalAyahs.toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-center">
          <div className="text-xs text-[var(--muted-foreground)] font-medium">Words Studied</div>
          <div className="text-lg sm:text-xl font-bold text-teal-300 mt-0.5">
            {monthWordsStudied}
          </div>
        </div>
      </div>

      {/* Weekday Labels (Guaranteed 7-column grid via inline style) */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem" }}
        className="mb-2 text-center"
      >
        {weekdays.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold py-1.5 uppercase tracking-wider ${
              idx === 5 ? "text-amber-400" : "text-[var(--muted-foreground)]"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid (Guaranteed 7-column grid via inline style) */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem" }}
      >
        {/* Leading empty cells for month offset */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-16 sm:h-20 rounded-2xl bg-[var(--surface-card)]/40 border border-transparent opacity-20 pointer-events-none"
          />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: totalDaysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const rec = records[dateStr];
          const ayahs = rec?.ayahsRead || 0;
          const words = rec?.wordsStudied || 0;
          const intensity = getCellIntensity(ayahs, words);

          // Emerald gradient intensity tiers matching Noor Al-Quran theme
          let cellStyle = "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:border-emerald-500/40";
          if (intensity === 1) {
            cellStyle = "bg-emerald-950/40 border-emerald-800/40 text-emerald-300 hover:border-emerald-500/50";
          } else if (intensity === 2) {
            cellStyle = "bg-emerald-900/45 border-emerald-700/50 text-emerald-200 hover:border-emerald-400/60";
          } else if (intensity === 3) {
            cellStyle = "bg-emerald-800/55 border-emerald-600/60 text-white font-semibold hover:border-emerald-300";
          } else if (intensity === 4) {
            cellStyle = "bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400 text-white font-bold shadow-md shadow-emerald-950/50 hover:opacity-95";
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`group relative h-16 sm:h-20 rounded-2xl p-2 flex flex-col justify-between transition-all duration-150 border text-left cursor-pointer ${cellStyle} ${
                isToday ? "ring-2 ring-amber-400/80 ring-offset-2 ring-offset-[var(--surface-raised)]" : ""
              }`}
            >
              {/* Day Number and Today Marker */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs sm:text-sm font-semibold ${isToday ? "text-amber-400 font-bold" : "text-[var(--foreground)]"}`}>
                  {dayNumber}
                </span>
                {intensity > 0 && (
                  <Flame className={`h-3 w-3 ${intensity === 4 ? "text-amber-300 fill-amber-300" : "text-amber-400 fill-amber-400"}`} />
                )}
              </div>

              {/* Reading Volume Pill / Badge */}
              <div className="mt-auto">
                {ayahs > 0 ? (
                  <span className={`inline-block text-[10px] sm:text-xs font-mono font-medium px-1.5 py-0.5 rounded-md truncate max-w-full ${
                    intensity === 4
                      ? "bg-black/30 text-emerald-100"
                      : "bg-[var(--surface-raised)] text-emerald-400 border border-[var(--border-subtle)]"
                  }`}>
                    {ayahs} {ayahs === 1 ? "v" : "vs"}
                  </span>
                ) : words > 0 ? (
                  <span className={`inline-block text-[10px] sm:text-xs font-mono font-medium px-1.5 py-0.5 rounded-md truncate max-w-full ${
                    intensity === 4
                      ? "bg-black/30 text-amber-200"
                      : "bg-[var(--surface-raised)] text-amber-300 border border-[var(--border-subtle)]"
                  }`}>
                    {words}w
                  </span>
                ) : isToday ? (
                  <span className="text-[10px] font-semibold text-amber-400 hidden sm:inline-block">
                    Today
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Intensity Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <span>Recitation Intensity:</span>
          <span className="text-[11px] opacity-75">None</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)]" />
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-950/40 border border-emerald-800/40" />
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-900/45 border border-emerald-700/50" />
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-800/55 border border-emerald-600/60" />
            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400 shadow-sm" />
          </div>
          <span className="text-[11px] opacity-75">30+ Ayahs</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
            Gold Ring = Today
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
            Flame = Active Day
          </span>
        </div>
      </div>
    </div>
  );
}
