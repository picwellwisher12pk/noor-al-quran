"use client";

import React, { useState } from "react";
import { VocabLangPreference, GameStatRecord, loadUserVocabProgress } from "@/services/vocabularyStorage";
import { useLanguage } from "@/context/LanguageContext";
import { MeaningQuizGame } from "./MeaningQuizGame";
import { GrammarClassifierGame } from "./GrammarClassifierGame";
import { RootFamilyGame } from "./RootFamilyGame";
import { AyahFillGame } from "./AyahFillGame";
import { VocabMatchBlitz } from "./VocabMatchBlitz";
import {
  Gamepad2,
  Trophy,
  Zap,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface GamesHubProps {
  langPreference?: VocabLangPreference;
  gameStats?: Record<string, GameStatRecord>;
  onScoreSaved?: () => void;
}

type ActiveGame = null | "meaning_quiz" | "grammar_match" | "root_family" | "ayah_fill" | "match_blitz";

export function GamesHub({
  langPreference: propLangPreference,
  gameStats: propGameStats,
  onScoreSaved: propOnScoreSaved,
}: GamesHubProps = {}) {
  const { language } = useLanguage();
  const langPreference: VocabLangPreference = propLangPreference || language;
  const [internalStats, setInternalStats] = useState<Record<string, GameStatRecord>>(() => {
    return propGameStats || loadUserVocabProgress().gameStats;
  });

  const onScoreSaved = () => {
    setInternalStats(loadUserVocabProgress().gameStats);
    propOnScoreSaved?.();
  };

  const gameStats = propGameStats || internalStats;

  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  if (activeGame === "meaning_quiz") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Games Arcade
        </button>
        <MeaningQuizGame langPreference={langPreference} onScoreSaved={onScoreSaved} />
      </div>
    );
  }

  if (activeGame === "grammar_match") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Games Arcade
        </button>
        <GrammarClassifierGame langPreference={langPreference} onScoreSaved={onScoreSaved} />
      </div>
    );
  }

  if (activeGame === "root_family") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Games Arcade
        </button>
        <RootFamilyGame langPreference={langPreference} onScoreSaved={onScoreSaved} />
      </div>
    );
  }

  if (activeGame === "ayah_fill") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Games Arcade
        </button>
        <AyahFillGame langPreference={langPreference} onScoreSaved={onScoreSaved} />
      </div>
    );
  }

  if (activeGame === "match_blitz") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Games Arcade
        </button>
        <VocabMatchBlitz onScoreSaved={onScoreSaved} />
      </div>
    );
  }

  const meaningHighScore = gameStats?.meaningQuiz?.highScore || 0;
  const grammarHighScore = gameStats?.grammarMatch?.highScore || 0;
  const rootHighScore = gameStats?.rootFamily?.highScore || 0;
  const ayahHighScore = gameStats?.ayahFill?.highScore || 0;
  const blitzHighScore = gameStats?.matchBlitz?.highScore || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Arcade Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
          <Gamepad2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Interactive Learning Arena</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Select a Quran Vocabulary & Grammar Challenge
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
          Reinforce your understanding of the 70% most frequent Quranic words through timed tests, grammatical classification, and verse completion.
        </p>
      </div>

      {/* 4 Clean Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Game 1: Meaning Quiz */}
        <div
          onClick={() => setActiveGame("meaning_quiz")}
          className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--surface-card)] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              {meaningHighScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                  <Trophy className="h-3 w-3" /> Best: {meaningHighScore} pts
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--foreground)]">Meaning Quiz</h3>
                <span className="font-arabic text-xs text-emerald-600 dark:text-emerald-400 font-semibold" dir="rtl">تحدي معاني الكلمات</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Rapid multiple-choice test: recognize meanings from Arabic words with countdown timers and combo multipliers.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Play Quiz (10 Questions)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Game 2: Grammar Classifier */}
        <div
          onClick={() => setActiveGame("grammar_match")}
          className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-teal-500/50 hover:bg-[var(--surface-card)] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              {grammarHighScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-400">
                  <Trophy className="h-3 w-3" /> Best: {grammarHighScore} pts
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--foreground)]">Grammar Classifier</h3>
                <span className="font-arabic text-xs text-teal-600 dark:text-teal-400 font-semibold" dir="rtl">قواعد وإعراب القرآن</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Master Arabic word divisions: classify Ism (اسم), Fi'l (فعل), or Harf (حرف) and learn authentic linguistic rules.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
            <span>Classify Words (10 Rounds)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Game 3: Root & Word Families */}
        <div
          onClick={() => setActiveGame("root_family")}
          className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-amber-500/50 hover:bg-[var(--surface-card)] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              {rootHighScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-400">
                  <Trophy className="h-3 w-3" /> Best: {rootHighScore} pts
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--foreground)]">Word Family Matcher</h3>
                <span className="font-arabic text-xs text-amber-600 dark:text-amber-400 font-semibold" dir="rtl">عائلات الجذور والمترادفات</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Group similar words with the same 3-letter root or shared meaning (e.g. Mercy, Faith, Sovereignty).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Group Words (5 Families)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Game 4: Ayah Verse Completion */}
        <div
          onClick={() => setActiveGame("ayah_fill")}
          className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-cyan-500/50 hover:bg-[var(--surface-card)] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              {ayahHighScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-400">
                  <Trophy className="h-3 w-3" /> Best: {ayahHighScore} pts
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--foreground)]">Ayah Verse Completion</h3>
                <span className="font-arabic text-xs text-cyan-400 font-semibold" dir="rtl">إكمال الآيات القرآنية</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Fill in the missing high-frequency word in authentic Quranic verses with full recitation audio.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Complete Verses (8 Ayahs)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Game 5: Speed Match Blitz */}
        <div
          onClick={() => setActiveGame("match_blitz")}
          className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-rose-500/50 hover:bg-[var(--surface-card)] transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden md:col-span-2"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <Flame className="h-5 w-5" />
              </div>
              {blitzHighScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-400">
                  <Trophy className="h-3 w-3" /> Best: {blitzHighScore} pts
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--foreground)]">Speed Match Blitz</h3>
                <span className="font-arabic text-xs text-rose-600 dark:text-rose-400 font-semibold" dir="rtl">مطابقة الكلمات السريعة</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Race against a 30-second countdown to pair Arabic Quranic words with their meanings. Chain consecutive pairs for combo multipliers!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Play Speed Blitz (30s Timer)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
