"use client";

import React from "react";
import { X, Calendar, BookOpen, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { DailyReadingRecord } from "@/services/readingActivityService";

interface DayDetailModalProps {
  record: DailyReadingRecord | null;
  selectedDate: string;
  onClose: () => void;
}

export function DayDetailModal({
  record,
  selectedDate,
  onClose,
}: DayDetailModalProps) {
  if (!selectedDate) return null;

  const [yearStr, monthStr, dayStr] = selectedDate.split("-");
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ayahsRead = record?.ayahsRead || 0;
  const wordsStudied = record?.wordsStudied || 0;
  const minutesSpent = record?.minutesSpent || 0;
  const verses = record?.verses || [];
  const chapters = record?.chapters || [];

  const hasActivity = ayahsRead > 0 || wordsStudied > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col text-[var(--foreground,#f1f5f9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle,#24362e)]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              hasActivity
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                : "bg-[var(--surface-card,#182520)] text-[var(--muted-foreground,#8e9b94)] border border-[var(--border-subtle,#24362e)]"
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground,#f1f5f9)] leading-tight">{formattedDate}</h3>
              <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-0.5">
                {hasActivity ? "Quranic Activity Log" : "No Activity Logged"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground,#f1f5f9)] hover:bg-[var(--hover-bg,#1a2621)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 overflow-y-auto space-y-4">
          {/* Key Metrics row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] font-semibold">Ayahs</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{ayahsRead}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] font-semibold">Words</span>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{wordsStudied}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-center">
              <span className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] font-semibold">Minutes</span>
              <div className="text-xl font-bold text-[var(--foreground,#f1f5f9)] mt-0.5">{minutesSpent}m</div>
            </div>
          </div>

          {/* Chapters and Verses list */}
          {hasActivity ? (
            <div className="space-y-4">
              {chapters.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    Chapters Visited ({chapters.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {chapters.map((ch) => (
                      <span
                        key={ch}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                      >
                        Surah #{ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {verses.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Recorded Verses ({verses.length})
                  </h4>
                  <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex flex-wrap gap-1.5">
                    {verses.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-raised,#141e1a)] text-slate-200 border border-[var(--border-subtle,#24362e)]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {wordsStudied > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    You reviewed <span className="font-bold text-amber-300">{wordsStudied} vocabulary words</span> in Learn Studio on this day.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-7 text-center">
              <div className="w-11 h-11 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex items-center justify-center mx-auto mb-2.5 text-[var(--muted-foreground,#8e9b94)]">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground,#f1f5f9)]">No Quran reading or study logged for this date.</p>
              <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-1 max-w-xs mx-auto">
                Reading activity is automatically recorded whenever you read ayahs, listen with audio, or practice vocabulary.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--border-subtle,#24362e)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
