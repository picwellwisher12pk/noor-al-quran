"use client";

import React, { useState } from "react";
import { useKhatmah } from "@/context/KhatmahContext";
import { KhatmahModal } from "@/components/modals/KhatmahModal";
import { TOTAL_QURAN_VERSES } from "@/utils/quranMeta";
import { Calendar, Flame, ArrowRight, CheckCircle2, Award, Settings2 } from "lucide-react";
import Link from "next/link";

export function KhatmahWidget() {
  const { plan, targetInfo, markTodayGoalCompleted } = useKhatmah();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-6 shadow-md transition-all">
        {plan && targetInfo ? (
          /* Active Khatmah View */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[var(--foreground)]">
                      Daily Khatmah Goal
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/40 text-[11px] font-semibold text-emerald-400">
                      Day {targetInfo.dayNumber} of {targetInfo.totalDays}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Target pace: ~{targetInfo.dailyQuota} Ayahs/day • Min. 7-Day Sunnah Rule
                  </p>
                </div>
              </div>

              {/* Badges & Manage */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>{plan.currentStreak}d Streak</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Manage Khatmah settings"
                  className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[var(--muted-foreground)]">
                  Completed {plan.completedAyahsCount} of {TOTAL_QURAN_VERSES} Ayahs
                </span>
                <span className="text-emerald-400 font-semibold">
                  {targetInfo.percentageCompleted.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-[var(--surface-card)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${targetInfo.percentageCompleted}%` }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <div className="text-xs text-[var(--muted-foreground)] w-full sm:w-auto">
                <span className="text-[var(--foreground)] font-semibold">Today&apos;s Portion:</span>{" "}
                <span className="text-emerald-400 font-medium">
                  Surah {targetInfo.targetStart.chapterId}:{targetInfo.targetStart.verseNumber} → Surah {targetInfo.targetEnd.chapterId}:{targetInfo.targetEnd.verseNumber}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {targetInfo.todayQuotaCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Completed Today
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={markTodayGoalCompleted}
                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-emerald-950/40 border border-[var(--border-subtle)] text-emerald-400 text-xs font-semibold transition-colors"
                  >
                    Mark Today Done
                  </button>
                )}

                <Link
                  href={`/surah/${targetInfo.targetStart.chapterId}?ayah=${targetInfo.targetStart.verseNumber}`}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition-all"
                >
                  Continue Reading <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State / Call to Action */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                  Start a Daily Khatmah Reading Plan
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Complete the Noble Quran at a fixed daily pace (7-day Sunnah minimum, 14-day, or 30-day options).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Calendar className="h-4 w-4" /> Set Daily Goal
            </button>
          </div>
        )}
      </div>

      <KhatmahModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
