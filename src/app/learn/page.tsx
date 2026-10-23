"use client";

import React, { useState, useEffect } from "react";
import {
  loadUserVocabProgress,
  setLanguagePreference,
  resetAllVocabProgress,
  UserVocabProgress,
  VocabLangPreference,
} from "@/services/vocabularyStorage";
import { QURAN_70_VOCABULARY } from "@/data/quranVocabularyData";
import { FlashcardDeck } from "@/components/learn/FlashcardDeck";
import { GamesHub } from "@/components/learn/GamesHub";
import { VocabularyGroupBrowser } from "@/components/learn/VocabularyGroupBrowser";
import {
  BookOpen,
  Sparkles,
  Flame,
  Layers,
  Gamepad2,
  RotateCcw,
  Languages,
  CheckCircle2,
  Compass,
} from "lucide-react";
import Link from "next/link";

type StudioPillar = "flashcards" | "games" | "word_bank";

export default function LearnPage() {
  const [activePillar, setActivePillar] = useState<StudioPillar>("flashcards");
  const [progress, setProgress] = useState<UserVocabProgress | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const refreshProgress = () => {
    const updated = loadUserVocabProgress();
    setProgress(updated);
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  const handleLangChange = (lang: VocabLangPreference) => {
    setLanguagePreference(lang);
    refreshProgress();
  };

  const handleConfirmReset = () => {
    resetAllVocabProgress();
    refreshProgress();
    setShowResetConfirm(false);
  };

  const langPref = progress?.langPreference || "bilingual";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-20 space-y-5">
      {/* 1. COMPACT STUDIO NAVBAR (REPLACES OVERSIZED HERO BANNER) */}
      <div className="p-3.5 rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Core Objective */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[var(--foreground)] tracking-tight">
                Quran Learning Studio
              </span>
              <span className="font-arabic text-xs text-emerald-400 font-semibold" dir="rtl">
                نادي التعلم
              </span>
            </div>
            <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)] block">
              70% Core Vocabulary & Grammar
            </span>
          </div>
        </div>

        {/* Center: The 3 Core Pillars */}
        <div className="p-1 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex items-center gap-1 shadow-inner text-xs">
          <button
            type="button"
            onClick={() => setActivePillar("flashcards")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activePillar === "flashcards"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("games")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activePillar === "games"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Games Arcade</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("word_bank")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activePillar === "word_bank"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Word Bank</span>
          </button>
        </div>

        {/* Right: Progress Pill & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Progress Mini Meter */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>{progress?.percentOfQuranUnlocked || 0}% Unlocked</span>
            </div>
            <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] font-mono">
              {progress?.masteredCount || 0}/{QURAN_70_VOCABULARY.length} words
            </span>
          </div>

          {/* Daily Streak */}
          {progress && progress.streakDays > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>{progress.streakDays}d</span>
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[11px]">
            <button
              type="button"
              onClick={() => handleLangChange("bilingual")}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                langPref === "bilingual"
                  ? "bg-emerald-600 text-white"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
              title="English and Urdu"
            >
              EN+اردو
            </button>
            <button
              type="button"
              onClick={() => handleLangChange("english")}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                langPref === "english"
                  ? "bg-emerald-600 text-white"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
              title="English Only"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLangChange("urdu")}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                langPref === "urdu"
                  ? "bg-emerald-600 text-white"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
              title="Urdu Only"
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PILLAR CANVAS */}
      <div className="w-full">
        {activePillar === "flashcards" && (
          <FlashcardDeck
            masteredIds={progress?.masteredWordIds || []}
            reviewIds={progress?.reviewWordIds || []}
            langPreference={langPref}
            onProgressUpdate={refreshProgress}
          />
        )}

        {activePillar === "games" && (
          <GamesHub
            langPreference={langPref}
            gameStats={progress?.gameStats || {}}
            onScoreSaved={refreshProgress}
          />
        )}

        {activePillar === "word_bank" && (
          <VocabularyGroupBrowser
            masteredIds={progress?.masteredWordIds || []}
            langPreference={langPref}
            onProgressUpdate={refreshProgress}
          />
        )}
      </div>

      {/* 3. FOOTER */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle,#1e2c26)] text-xs text-[var(--muted-foreground,#8e9b94)]">
        <Link
          href="/"
          className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
        >
          &larr; Back to Quran Reader
        </Link>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Reset All Learning Progress?</h3>
              <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-1">
                This will clear your mastered words list, review bookmarks, and game high scores.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--foreground)] font-semibold hover:bg-[var(--hover-bg,#1c2923)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
