"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  BookOpen,
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Target,
  GraduationCap,
} from "lucide-react";
import { useLearningStore } from "@/store/useLearningStore";
import { useLanguage } from "@/context/LanguageContext";
import { getAllSkillNodes } from "@/data/learning/curriculumData";
import { QURAN_70_VOCABULARY } from "@/data/quranVocabularyData";

export default function LearnDashboardPage() {
  const {
    completedNodeIds,
    activeNodeId,
    totalXP,
    barakahGems,
    currentStreak,
    srsWords,
    openModeSelector,
  } = useLearningStore();
  const { isUrdu } = useLanguage();

  const allNodes = React.useMemo(() => getAllSkillNodes(), []);
  const activeNode = allNodes.find((n) => n.id === activeNodeId) || allNodes[0];

  const totalNodesCount = allNodes.length;
  const completedNodesCount = completedNodeIds.length;
  const progressPercentage =
    totalNodesCount > 0 ? Math.round((completedNodesCount / totalNodesCount) * 100) : 0;

  const srsList = Object.values(srsWords || {});
  const masteredWordsCount = srsList.filter((w) => w.masteryLevel >= 3).length;
  const totalVocabWords = QURAN_70_VOCABULARY.length;
  const vocabMasteryPercentage =
    totalVocabWords > 0 ? Math.round((masteredWordsCount / totalVocabWords) * 100) : 0;

  const isFirstTimeUser = completedNodesCount === 0 && totalXP === 0;

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
      {/* 1. FIRST-RUN ONBOARDING BANNER (If new user) */}
      {isFirstTimeUser && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-transparent border border-emerald-500/30 shadow-sm">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUrdu ? "خوش آمدید" : "Welcome to Quranic Learning"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
              {isUrdu
                ? "قرآن مجید کے ۷۰٪ ذخیرہ الفاظ اور بنیادی قواعد کا آغاز کریں"
                : "Master 70% of Quranic Vocabulary & Fundamental Grammar"}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {isUrdu
                ? "صراطِ نور کے مرحلہ وار اسباق، صوتی مشقوں، فلیش کارڈز اور دلچسپ گیمز کے ذریعے قرآن فہمی کا سفر شروع کریں۔"
                : "Step onto the Sirat learning path. Through bite-sized interactive lessons, sound sniper challenges, and spaced-repetition flashcards, unlock the language of the Noble Quran."}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/learn/sirat"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>{isUrdu ? "پہلا سبق شروع کریں" : "Begin First Lesson"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn/flashcards"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>{isUrdu ? "فلیش کارڈز دریافت کریں" : "Explore Flashcards"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP ACTION ROW: CONTINUE LEARNING CTA & DAILY GOAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Lesson Spotlight Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm flex flex-col justify-between gap-6 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {isUrdu ? "اگلا سبق" : "Next Milestone"}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Stage {activeNode.phaseNumber} • Unit {activeNode.unitId}
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                {isUrdu ? activeNode.titleUrdu || activeNode.title : activeNode.title}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                {isUrdu ? activeNode.descriptionUrdu || activeNode.subtitle : activeNode.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                <Zap className="w-3.5 h-3.5 fill-purple-500" />
                +{activeNode.xpReward} XP
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                +{activeNode.gemReward} Gems
              </span>
              <span>•</span>
              <span>~{activeNode.estimatedMinutes} mins</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openModeSelector(activeNode)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isUrdu ? "سبق شروع کریں" : "Start Lesson"}</span>
              </button>
              <Link
                href="/learn/sirat"
                className="px-3 py-2.5 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--foreground)] transition-colors"
                title="View Full Curriculum Roadmap"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Daily Goal & Istiqamah Card */}
        <div className="p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm flex flex-col justify-between gap-4 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {isUrdu ? "روزانہ ہدف" : "Daily Goal"}
              </span>
              <Target className="w-4 h-4 text-amber-500" />
            </div>

            <h4 className="text-sm font-bold text-[var(--foreground)]">
              {currentStreak > 0
                ? isUrdu
                  ? `${currentStreak} دن کی استقامت برقرار!`
                  : `${currentStreak}-Day Streak Active!`
                : isUrdu
                ? "آج ایک سبق یا گیم مکمل کریں"
                : "Complete 1 lesson or game today"}
            </h4>

            <p className="text-xs text-[var(--muted-foreground)]">
              {isUrdu
                ? "روزانہ مستقل مزاجی (استقامت) سے قرآنی فہم تیزی سے مستحکم ہوتا ہے۔"
                : "Continuous daily practice builds authentic long-term Quranic Arabic comprehension."}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{currentStreak} Days</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
              <Zap className="w-4 h-4 text-purple-500 fill-purple-500" />
              <span>{totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AUTHENTIC METRIC HIGHLIGHTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Curriculum Lessons */}
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-1 transition-colors">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] text-xs">
            <span>{isUrdu ? "نصاب مکمل" : "Curriculum"}</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[var(--foreground)] font-mono">
            {completedNodesCount} / {totalNodesCount}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {progressPercentage}% {isUrdu ? "اسباق مکمل" : "lessons completed"}
          </p>
        </div>

        {/* Mastered Words */}
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-1 transition-colors">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] text-xs">
            <span>{isUrdu ? "حفظ شدہ الفاظ" : "Mastered Words"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[var(--foreground)] font-mono">
            {masteredWordsCount} / {totalVocabWords}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {vocabMasteryPercentage}% {isUrdu ? "الفاظ یاد شدہ" : "pool mastered"}
          </p>
        </div>

        {/* Barakah Gems */}
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-1 transition-colors">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] text-xs">
            <span>{isUrdu ? "برکت ہیرے" : "Barakah Gems"}</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-[var(--foreground)] font-mono">
            {barakahGems}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {isUrdu ? "ٹیسٹس سے کمائے گئے" : "earned from arenas"}
          </p>
        </div>

        {/* Total Experience */}
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-1 transition-colors">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] text-xs">
            <span>{isUrdu ? "مجموعی تجربہ" : "Total XP"}</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-[var(--foreground)] font-mono">
            {totalXP.toLocaleString()}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Level {Math.floor(totalXP / 300) + 1}
          </p>
        </div>
      </div>

      {/* 4. SECTION PORTALS (DEEP-LINK CARDS) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          {isUrdu ? "تعلیمی شعبے" : "Learning Portals"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. My Path (Sirat) */}
          <Link
            href="/learn/sirat"
            className="group p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--card-border)] hover:border-emerald-500/50 shadow-sm transition-all flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {isUrdu ? "صراطِ نور (میرا راستہ)" : "My Path (Sirat)"}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu
                  ? "مرحلہ وار اسباق، ٹیسٹس، اور صوتی مشقوں کا تفصیلی نصاب۔"
                  : "5-stage progressive curriculum from alphabet foundations to ayah immersion."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-[var(--border-subtle)]">
              <span>{isUrdu ? "راستہ دیکھیں" : "Explore Path"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Practice Cards (Flashcards) */}
          <Link
            href="/learn/flashcards"
            className="group p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--card-border)] hover:border-emerald-500/50 shadow-sm transition-all flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {isUrdu ? "مشقی کارڈز" : "Practice Cards"}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu
                  ? "قرآن کے ۷۰٪ ذخیرہ الفاظ کے انٹرایکٹو ۳D فلیش کارڈز۔"
                  : "Interactive 3D flashcards with audio recitation, roots, and sample ayahs."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2 border-t border-[var(--border-subtle)]">
              <span>{isUrdu ? "کارڈز شروع کریں" : "Flip Cards"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Mini Games (Arcade) */}
          <Link
            href="/learn/arcade"
            className="group p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--card-border)] hover:border-emerald-500/50 shadow-sm transition-all flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {isUrdu ? "گیمز آرکیڈ" : "Mini Games"}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu
                  ? "معانی کوئیز، گرامر میچ، روٹ فیملیز، اور آیت فل چیلنجز۔"
                  : "4 fast-paced arcade challenges to test your recall under pressure."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 pt-2 border-t border-[var(--border-subtle)]">
              <span>{isUrdu ? "آرکیڈ کھیلیں" : "Play Arcade"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Word Explorer (Word Bank) */}
          <Link
            href="/learn/word-bank"
            className="group p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--card-border)] hover:border-emerald-500/50 shadow-sm transition-all flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {isUrdu ? "ذخیرہ الفاظ" : "Word Explorer"}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu
                  ? "۳۷۵ قرآنی الفاظ کو تھیمز، اقسام، اور کثرتِ استعمال کے لحاظ سے تلاش کریں۔"
                  : "Browse 375 high-frequency words grouped by semantic themes and grammatical role."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 pt-2 border-t border-[var(--border-subtle)]">
              <span>{isUrdu ? "الفاظ دیکھیں" : "Browse Words"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
