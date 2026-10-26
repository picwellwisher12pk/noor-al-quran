"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Heart,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  BookOpen,
  Zap,
} from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";
import { LanguageToggle } from "@/components/common/LanguageToggle";

export function GamificationHUD() {
  const {
    totalXP,
    barakahGems,
    currentStreak,
    langPreference,
    setLangPreference,
    getHeartCount,
    getWeakWords,
    toggleReviewVault,
    resetLearningProgress
  } = useLearningStore();

  const [heartsCount, setHeartsCount] = useState(5);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setHeartsCount(getHeartCount());
    const interval = setInterval(() => {
      setHeartsCount(getHeartCount());
    }, 10000);
    return () => clearInterval(interval);
  }, [getHeartCount]);

  const weakWords = getWeakWords();
  const level = Math.floor(totalXP / 300) + 1;
  const currentLevelXP = totalXP % 300;
  const progressPct = Math.min(100, Math.round((currentLevelXP / 300) * 100));

  return (
    <>
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[var(--header-bg)]/90 border-b border-[var(--border-subtle)] shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Level Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 border border-emerald-400/30">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--foreground)] tracking-wide">
                  {langPreference === "urdu"
                    ? "صراطِ نور"
                    : langPreference === "bilingual"
                    ? "Path of Light • صراطِ نور"
                    : "Path of Light"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                  Lvl {level}
                </span>
              </div>

              {/* Mini Level XP Progress Bar */}
              <div className="w-28 sm:w-36 h-1.5 bg-black/10 dark:bg-black/40 rounded-full mt-1 overflow-hidden border border-black/5 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center / Right: Vital Stats Bar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs font-semibold">
            {/* Daily Streak */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                currentStreak > 0
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)]"
              }`}
              title="Daily Istiqamah Streak (Active days in a row)"
            >
              <Flame
                className={`w-4 h-4 ${
                  currentStreak > 0 ? "text-amber-500 fill-amber-500 animate-pulse" : "text-[var(--muted-foreground)]"
                }`}
              />
              <span>
                {currentStreak}d {langPreference === "urdu" ? "استقامت" : "Streak"}
              </span>
            </div>

            {/* Total XP */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-800 dark:text-purple-300 shadow-sm"
              title="Total Experience Points earned"
            >
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-500" />
              <span>{totalXP.toLocaleString()} XP</span>
            </div>

            {/* Barakah Gems */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-800 dark:text-blue-300 shadow-sm"
              title="Barakah Gems (Earned from Tests & Checkpoints)"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{barakahGems}</span>
            </div>

            {/* Hearts Indicator */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                heartsCount <= 1
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-800 dark:text-rose-300 animate-pulse shadow-sm"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300"
              }`}
              title={`${heartsCount}/5 Hearts (Regenerates 1 every 30 mins)`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{heartsCount}/5</span>
            </div>

            {/* SRS Review Vault Badge Button */}
            <button
              type="button"
              onClick={() => toggleReviewVault(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                weakWords.length > 0
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/30 shadow-sm"
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
              }`}
              title="SRS Review Vault: Review missed words"
            >
              <ShieldAlert
                className={`w-4 h-4 ${weakWords.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--muted-foreground)]"}`}
              />
              <span>
                {langPreference === "urdu" ? "کمزور الفاظ" : "Review"} ({weakWords.length})
              </span>
            </button>

            {/* Global Language Preference Switcher Pill */}
            <LanguageToggle />

            {/* Reset Progress Shortcut (with modal confirmation) */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-all cursor-pointer"
              title="Reset Learning Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* App-based Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[var(--modal-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                {langPreference === "urdu" ? "سیکھنے کی پیش رفت دوبارہ شروع کریں؟" : "Reset Learning Progress?"}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {langPreference === "urdu"
                  ? "یہ عمل آپ کے تمام XP، انلاک شدہ نوڈز، کمزور الفاظ اور سیشن ہسٹری کو صفر کر دے گا۔"
                  : "This will reset your completed nodes, XP, streak, and review words back to Stage 1. This action cannot be undone."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] transition-all cursor-pointer"
              >
                {langPreference === "urdu" ? "منسوخ کریں" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetLearningProgress();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {langPreference === "urdu" ? "ہاں، دوبارہ شروع کریں" : "Yes, Reset Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
