"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GRAMMAR_QUIZ_QUESTIONS,
  GrammarQuizQuestion,
} from "@/data/learning/quranGrammarData";
import { useLanguage } from "@/context/LanguageContext";
import { useLearningStore } from "@/store/useLearningStore";
import {
  BookMarked,
  Trophy,
  CheckCircle2,
  XCircle,
  Timer,
  RotateCcw,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const TOTAL_ROUNDS = Math.min(10, GRAMMAR_QUIZ_QUESTIONS.length);
const SECONDS_PER_Q = 20;

export function GrammarRuleQuizGame() {
  const { isUrdu } = useLanguage();
  const { addXP, addGems, learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";

  const [questions, setQuestions] = useState<GrammarQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_Q);
  const [isGameOver, setIsGameOver] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<GrammarQuizQuestion[]>([]);

  const generateRound = useCallback(() => {
    const shuffled = [...GRAMMAR_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(SECONDS_PER_Q);
    setIsGameOver(false);
    setMissedQuestions([]);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (isGameOver || isAnswered || !currentQ) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isGameOver, currentQ]);

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedIdx(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx >= 0 && currentQ.options[optionIdx]?.isCorrect;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2.5);
      const streakBonus = streak * 25;
      const points = 120 + timeBonus + streakBonus;
      setScore((s) => s + points);
      setStreak((st) => {
        const next = st + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissedQuestions((prev) => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex < TOTAL_ROUNDS - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
      setTimeLeft(SECONDS_PER_Q);
    } else {
      setIsGameOver(true);
      const xpWon = Math.round(score / 5);
      const gemsWon = Math.max(5, Math.floor(score / 140));
      addXP(xpWon);
      addGems(gemsWon);
    }
  };

  if (!currentQ && !isGameOver) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
        {isUrdu ? "کوئز تیار ہو رہا ہے..." : "Preparing Grammar Quiz..."}
      </div>
    );
  }

  // --- GAME OVER VIEW ---
  if (isGameOver) {
    const accuracy = Math.round(((TOTAL_ROUNDS - missedQuestions.length) / TOTAL_ROUNDS) * 100);
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-500 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isUrdu ? "ماشاء اللہ! نحوی ٹیسٹ مکمل ہو گیا" : "Grammar Mastery Round Complete!"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {isUrdu
              ? "آپ نے اعراب، مرکبات اور جملوں کے قرآنی قواعد کا کامیابی سے امتحان دیا۔"
              : "You tested your understanding of Quranic I'rab cases, compounds, and syntax rules."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">
              Score
            </span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{score}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
              Accuracy
            </span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{accuracy}%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
              Best Streak
            </span>
            <span className="text-2xl font-extrabold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-amber-500" /> {maxStreak}
            </span>
          </div>
        </div>

        {missedQuestions.length > 0 && (
          <div className="text-left p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
              {isUrdu ? `توجہ طلب آیات (${missedQuestions.length}):` : `Ayahs to Review (${missedQuestions.length}):`}
            </span>
            <div className="space-y-1.5 text-xs">
              {missedQuestions.map((q) => (
                <div key={q.id} className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-amber-500/20">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    <span>{q.surahReference}</span>
                    <span className="font-arabic">{q.highlightWord}</span>
                  </div>
                  <p className="text-[var(--muted-foreground)]">{isUrdu ? q.explanationUrdu : q.explanationEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={generateRound}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isUrdu ? "دوبارہ ٹیسٹ کھیلیں" : "Play Another Round"}</span>
        </button>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION VIEW ---
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            Question {currentIndex + 1}/{TOTAL_ROUNDS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--surface-card)] overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 animate-pulse text-xs">
              <Flame className="h-3.5 w-3.5 fill-amber-500" /> {streak}x
            </span>
          )}
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
            {score} pts
          </span>
        </div>

        <div
          className={`flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-xl border ${
            timeLeft <= 5
              ? "bg-rose-500/15 border-rose-500/30 text-rose-600 animate-pulse"
              : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--foreground)]"
          }`}
        >
          <Timer className="h-3.5 w-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Quranic Verse Scenario Card */}
      <div className="p-6 md:p-7 rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            {currentQ.surahReference}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">
            {isUrdu ? "نحوی تجزیہ" : "Grammar Challenge"}
          </span>
        </div>

        {/* Big Quranic Ayah */}
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-right">
          <p className="font-arabic-amiri text-2xl sm:text-3xl text-[var(--foreground)] leading-loose" dir="rtl">
            {currentQ.promptVerseAr}
          </p>
        </div>

        {/* Translation */}
        <p className="text-xs text-[var(--muted-foreground)] italic">
          "{currentQ.promptVerseEn}"
        </p>

        {/* Specific Question Prompt */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--foreground)]">
            {isUrdu ? currentQ.questionUrdu : currentQ.questionEn}
          </h4>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          let btnClass = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-blue-500/40 text-[var(--foreground)]";

          if (isAnswered) {
            if (opt.isCorrect) {
              btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm";
            } else if (isSelected) {
              btnClass = "bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200";
            } else {
              btnClass = "opacity-40 bg-[var(--surface-raised)] border-[var(--card-border)]";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${btnClass}`}
            >
              <span className="text-xs sm:text-sm font-medium">
                {isUrdu ? opt.textUrdu : opt.textEn}
              </span>

              {isAnswered && (
                opt.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : isSelected ? (
                  <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                ) : null
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Grammar Explanation on Answer */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] space-y-3 animate-in fade-in-50 duration-200">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-blue-600 dark:text-blue-400 block">
              {isUrdu ? "نحوی توضیح و ضابطہ:" : "Linguistic Rule Explanation:"}
            </span>
            <p className="text-[var(--foreground)] leading-relaxed">
              {isUrdu ? currentQ.explanationUrdu : currentQ.explanationEn}
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{currentIndex < TOTAL_ROUNDS - 1 ? (isUrdu ? "اگلا سوال" : "Next Question") : (isUrdu ? "نتیجہ دیکھیں" : "See Results")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

