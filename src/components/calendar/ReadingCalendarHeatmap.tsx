"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar as CalendarIcon,
  CalendarCheck,
  BookOpen,
  Sparkles,
  Star,
  Moon,
} from "lucide-react";
import { DailyReadingRecord, getTodayString } from "@/services/readingActivityService";

interface ReadingCalendarHeatmapProps {
  records: Record<string, DailyReadingRecord>;
  onSelectDate: (dateStr: string) => void;
}

/**
 * Format Hijri Month Range (e.g. "Jumada I – Jumada II 1448 AH") and Arabic equivalent
 */
function getHijriMonthInfo(year: number, month: number) {
  try {
    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0);

    const enFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      month: "short",
      year: "numeric",
    });
    const arFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      month: "long",
      year: "numeric",
    });

    const startEn = enFormatter.format(firstDate);
    const endEn = enFormatter.format(lastDate);
    const startAr = arFormatter.format(firstDate);
    const endAr = arFormatter.format(lastDate);

    if (startEn === endEn) {
      return { en: startEn, ar: startAr };
    }

    const startMonthOnly = startEn.replace(/\s*\d+.*$/, "");
    const cleanedStartAr = startAr.replace(/\s*[\d٠-٩]+\s*هـ?/, "");

    return {
      en: `${startMonthOnly} – ${endEn}`,
      ar: startAr === endAr ? startAr : `${cleanedStartAr} – ${endAr}`,
    };
  } catch {
    return { en: "", ar: "" };
  }
}

/**
 * Arabic numeral representation of Hijri day (e.g. "٩")
 */
function getHijriDayNumeral(year: number, month: number, day: number): string {
  try {
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
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

  const hijriInfo = getHijriMonthInfo(currentYear, currentMonth);

  // Calculate statistics for this month authentically from records
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

  const consistencyPct = Math.round((monthActiveDays / totalDaysInMonth) * 100);
  const avgAyahsPerActiveDay =
    monthActiveDays > 0 ? (monthTotalAyahs / monthActiveDays).toFixed(1) : "0";

  const weekdays = [
    { en: "Sun", ar: "الأحد" },
    { en: "Mon", ar: "الإثنين" },
    { en: "Tue", ar: "الثلاثاء" },
    { en: "Wed", ar: "الأربعاء" },
    { en: "Thu", ar: "الخميس" },
    { en: "Fri", ar: "الجمعة", isJumuah: true },
    { en: "Sat", ar: "السبت" },
  ];

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
    <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-5 sm:p-7 shadow-xl shadow-emerald-950/5 dark:shadow-black/30 transition-all duration-300">
      {/* Islamic 8-Point Geometric Star Watermark */}
      <svg
        className="absolute -right-8 -top-8 w-44 h-44 text-emerald-600/5 dark:text-emerald-400/5 pointer-events-none select-none transition-opacity duration-300"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="25" y="25" width="50" height="50" rx="4" />
        <rect x="25" y="25" width="50" height="50" rx="4" transform="rotate(45 50 50)" />
      </svg>

      {/* Month Header and Navigation */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm flex-shrink-0">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                {monthName} {currentYear}
              </h2>
              {currentYear === todayYear && currentMonth === todayMonth && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  Current
                </span>
              )}
            </div>

            {/* Hijri Calendar Subtitle */}
            {hijriInfo.en && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-700/90 dark:text-emerald-400/90 font-medium mt-1">
                <Moon className="h-3 w-3 inline text-emerald-600 dark:text-emerald-400" />
                <span>{hijriInfo.en}</span>
                {hijriInfo.ar && (
                  <>
                    <span className="opacity-40">&bull;</span>
                    <span className="font-arabic text-[11px]" dir="rtl">
                      {hijriInfo.ar}
                    </span>
                  </>
                )}
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5">
              Click any date to inspect verses, chapters, and study logs
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Jump to Current Month"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Today</span>
          </button>
          <div className="flex items-center bg-[var(--surface-card)] rounded-2xl p-1 border border-[var(--border-subtle)] shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--surface-raised)] transition-all cursor-pointer active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--surface-raised)] transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary KPI Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {/* Card 1: Active Days */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Active Days</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              {consistencyPct}%
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
              {monthActiveDays}
            </span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              / {totalDaysInMonth} days
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 w-full h-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-950/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, consistencyPct))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Monthly Ayahs */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-amber-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Monthly Ayahs</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
              Recited
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {monthTotalAyahs.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted-foreground)] truncate">
            {monthActiveDays > 0 ? (
              <span>
                Avg. <strong className="text-amber-700 dark:text-amber-300 font-semibold">{avgAyahsPerActiveDay}</strong> vs / active day
              </span>
            ) : (
              <span>No recitation recorded yet</span>
            )}
          </p>
        </div>

        {/* Card 3: Devotion & Study */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-teal-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Words &amp; Study</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25">
              Reflection
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300 tracking-tight">
              {monthWordsStudied.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">words</span>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted-foreground)] truncate">
            {monthWordsStudied > 0 ? (
              <span>Vocabulary mastery &amp; grammar reviews</span>
            ) : (
              <span>Review vocabulary in Learn Studio</span>
            )}
          </p>
        </div>
      </div>

      {/* Calendar Grid Container (Horizontal scroll on narrow mobile screens) */}
      <div className="relative z-10 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        <div className="min-w-[320px]">
          {/* Weekday Labels (Guaranteed 7-column grid via inline style) */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem" }}
            className="mb-2 text-center"
          >
            {weekdays.map((day) => (
              <div
                key={day.en}
                className={`rounded-xl py-1 sm:py-1.5 px-1 flex flex-col items-center justify-center transition-all ${day.isJumuah
                    ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs font-bold"
                    : "text-[var(--muted-foreground)] font-semibold"
                  }`}
              >
                <div className="flex items-center gap-1 text-[11px] sm:text-xs uppercase tracking-wider">
                  <span>{day.en}</span>
                  {day.isJumuah && (
                    <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 inline-block" />
                  )}
                </div>
                <span
                  className="text-[10px] font-arabic opacity-70 leading-none mt-0.5 hidden sm:inline"
                  dir="rtl"
                >
                  {day.ar}
                </span>
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
                className="min-h-[70px] sm:min-h-[84px] rounded-2xl border border-dashed border-[var(--border-subtle)]/40 bg-transparent opacity-20 pointer-events-none"
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
              const hijriDay = getHijriDayNumeral(currentYear, currentMonth, dayNumber);

              // Clean solid flat emerald & gold palette (strictly no gradients)
              let cellStyle =
                "bg-[var(--surface-card)] hover:bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-emerald-500/50 text-[var(--muted-foreground)] hover:-translate-y-0.5 hover:shadow-xs";

              if (intensity === 1) {
                cellStyle =
                  "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:-translate-y-0.5";
              } else if (intensity === 2) {
                cellStyle =
                  "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700/70 text-emerald-950 dark:text-emerald-50 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-xs hover:-translate-y-0.5";
              } else if (intensity === 3) {
                cellStyle =
                  "bg-emerald-200 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-white hover:border-emerald-600 dark:hover:border-emerald-400 shadow-sm hover:-translate-y-0.5";
              } else if (intensity === 4) {
                cellStyle =
                  "bg-emerald-600 dark:bg-emerald-500 text-white font-bold border-emerald-700 dark:border-emerald-400 shadow-sm hover:border-emerald-800 dark:hover:border-emerald-300 hover:-translate-y-0.5";
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  title={`${dateStr}${rec ? ` • ${ayahs} ayahs, ${words} words` : " • Click to inspect"}`}
                  className={`group relative min-h-[70px] sm:min-h-[84px] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 border text-left cursor-pointer active:scale-95 ${cellStyle} ${isToday
                      ? "ring-2 ring-amber-400 dark:ring-amber-400/90 ring-offset-2 ring-offset-[var(--surface-raised)] shadow-md shadow-amber-500/20"
                      : ""
                    }`}
                >
                  {/* Header row: Day Number + Hijri Day / Flame / Today Badge */}
                  <div className="flex items-start justify-between w-full gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs sm:text-sm font-bold ${intensity === 4
                            ? "text-white"
                            : isToday
                              ? "text-amber-700 dark:text-amber-400"
                              : intensity > 0
                                ? "text-emerald-950 dark:text-emerald-100"
                                : "text-[var(--foreground)]/80 group-hover:text-[var(--foreground)]"
                          }`}
                      >
                        {dayNumber}
                      </span>
                      {isToday && (
                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 shadow-xs">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Right corner: Flame icon if active, otherwise subtle Arabic Hijri day numeral */}
                    <div className="flex items-center gap-1">
                      {intensity > 0 ? (
                        <Flame
                          className={`${intensity === 4
                              ? "h-3.5 w-3.5 text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)] animate-pulse"
                              : intensity === 3
                                ? "h-3.5 w-3.5 text-amber-500 fill-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                                : "h-3 w-3 text-amber-500 fill-amber-500"
                            }`}
                        />
                      ) : (
                        hijriDay && (
                          <span
                            className="text-[10px] sm:text-[11px] font-arabic text-[var(--muted-foreground)]/50 group-hover:text-[var(--muted-foreground)]/80 leading-none select-none"
                            dir="rtl"
                            title={`Hijri day: ${hijriDay}`}
                          >
                            {hijriDay}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Recitation Volume Badge / Words Studied / Rest State */}
                  <div className="mt-auto pt-1 w-full flex items-center justify-between">
                    {ayahs > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-lg truncate max-w-full ${intensity === 4
                            ? "bg-black/35 text-amber-200 border border-amber-400/35 shadow-xs"
                            : intensity === 3
                              ? "bg-white/90 dark:bg-black/40 text-emerald-950 dark:text-emerald-100 border border-emerald-500/30 shadow-xs"
                              : intensity === 2
                                ? "bg-emerald-500/20 text-emerald-950 dark:text-emerald-100 border border-emerald-500/30"
                                : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25"
                          }`}
                      >
                        <span className="truncate">
                          {ayahs} {ayahs === 1 ? "v" : "vs"}
                        </span>
                      </span>
                    ) : words > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-lg truncate max-w-full ${intensity === 4
                            ? "bg-black/35 text-amber-200 border border-amber-400/40"
                            : "bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/30"
                          }`}
                      >
                        <span>{words}w</span>
                      </span>
                    ) : isToday ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 sm:hidden">
                        Today
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--muted-foreground)]/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:font-medium transition-colors select-none text-left pl-0.5">
                        &middot;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intensity Legend & Status */}
      <div className="relative z-10 mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
        {/* Swatch tiers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">Recitation Intensity:</span>
          <span className="text-[11px] opacity-75">None</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xs"
              title="0 Ayahs (None / Rest)"
            />
            <span
              className="w-4 h-4 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
              title="1–5 Ayahs (Light)"
            />
            <span
              className="w-4 h-4 rounded-md bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/70 shadow-xs"
              title="6–15 Ayahs (Steady)"
            />
            <span
              className="w-4 h-4 rounded-md bg-emerald-200 dark:bg-emerald-800/80 border border-emerald-400 dark:border-emerald-600 shadow-xs"
              title="16–30 Ayahs (Deep)"
            />
            <span
              className="w-4 h-4 rounded-md bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400 shadow-xs"
              title="30+ Ayahs (Khatmah Momentum)"
            />
          </div>
          <span className="text-[11px] opacity-75">30+ Ayahs</span>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/40 shadow-xs" />
            Gold Ring = Today
          </span>
          <span className="text-[var(--border-subtle)]">&bull;</span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Flame = Active Devotion
          </span>
          <span className="text-[var(--border-subtle)]">&bull;</span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Fri = Jumu&apos;ah
          </span>
        </div>
      </div>
    </div>
  );
}
