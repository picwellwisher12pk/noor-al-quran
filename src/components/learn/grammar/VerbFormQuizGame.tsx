"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QURANIC_VERB_FORMS,
  QuranicVerbExample,
  VerbFormNumber,
} from "@/data/learning/quranGrammarData";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
import { useLearningStore } from "@/store/useLearningStore";
import { getVerbFormLabel } from "@/services/terminologyService";
import { LearnerTierSwitcher } from "../LearnerTierSwitcher";
import {
  Sparkles,
  Trophy,
  Volume2,
  CheckCircle2,
  XCircle,
  Timer,
  RotateCcw,
  Flame,
  ArrowRight,
  Zap,
} from "lucide-react";

interface VerbQuizQuestion {
  example: QuranicVerbExample;
  options: {
    formNumber: VerbFormNumber;
    romanNumeral: string;
    arabicName: string;
    isCorrect: boolean;
  }[];
}

const TOTAL_QUESTIONS = 10;
const SECONDS_PER_Q = 15;

export function VerbFormQuizGame() {
  const { isUrdu } = useLanguage();
  const { playWord } = useAudio();
  const { addXP, addGems, learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";

  const [questions, setQuestions] = useState<VerbQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_Q);
  const [isGameOver, setIsGameOver] = useState(false);
  const [missedExamples, setMissedExamples] = useState<QuranicVerbExample[]>([]);

  // Collect all examples from all forms
  const generateRound = useCallback(() => {
    const allExamples: QuranicVerbExample[] = [];
    QURANIC_VERB_FORMS.forEach((form) => {
      allExamples.push(...form.examples);
    });

    const shuffledExamples = [...allExamples].sort(() => Math.random() - 0.5);
    const selectedTargets = shuffledExamples.slice(0, TOTAL_QUESTIONS);

    const generated: VerbQuizQuestion[] = selectedTargets.map((target) => {
      const correctFormInfo = QURANIC_VERB_FORMS.find((f) => f.formNumber === target.formNumber)!;
      
      // Select 3 distractors
      const otherForms = QURANIC_VERB_FORMS.filter((f) => f.formNumber !== target.formNumber);
      const distractors = [...otherForms]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((f) => ({
          formNumber: f.formNumber,
          romanNumeral: f.romanNumeral,
          arabicName: f.arabicName,
          isCorrect: false,
        }));

      const correctOption = {
        formNumber: correctFormInfo.formNumber,
        romanNumeral: correctFormInfo.romanNumeral,
        arabicName: correctFormInfo.arabicName,
        isCorrect: true,
      };

      const options = [...distractors, correctOption].sort(() => Math.random() - 0.5);

      return {
        example: target,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(SECONDS_PER_Q);
    setIsGameOver(false);
    setMissedExamples([]);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const currentQ = questions[currentIndex];

  // Countdown timer
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

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedIdx(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex >= 0 && currentQ.options[optionIndex]?.isCorrect;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 3);
      const streakBonus = streak * 20;
      const points = 100 + timeBonus + streakBonus;
      setScore((s) => s + points);
      setStreak((st) => {
        const next = st + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissedExamples((prev) => [...prev, currentQ.example]);
    }
  };

  const handleNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
      setTimeLeft(SECONDS_PER_Q);
    } else {
      setIsGameOver(true);
      const xpWon = Math.round(score / 5);
      const gemsWon = Math.max(5, Math.floor(score / 150));
      addXP(xpWon);
      addGems(gemsWon);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQ) return;
    const audioUrl = getWordAudioUrl(currentQ.example);
    if (audioUrl) {
      playWord(audioUrl);
    } else {
      playAudioSafely(undefined, currentQ.example.arabic);
    }
  };

  if (!currentQ && !isGameOver) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
        {isUrdu ? "کوئز تیار ہو رہا ہے..." : "Preparing Verb Form Quiz..."}
      </div>
    );
  }

  // --- GAME OVER VIEW ---
  if (isGameOver) {
    const accuracy = Math.round(((TOTAL_QUESTIONS - missedExamples.length) / TOTAL_QUESTIONS) * 100);
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isUrdu ? "ماشاء اللہ! ٹیسٹ مکمل ہو گیا" : "Quiz Round Completed!"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {isUrdu
              ? "آپ نے قرآنی ابواب اور اوزان کی شناخت کا ٹیسٹ مکمل کیا۔"
              : "You tested your recognition of authentic Quranic augmented verb forms."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
              Score
            </span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{score}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">
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

        {/* Review Missed */}
        {missedExamples.length > 0 && (
          <div className="text-left p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
              {isUrdu ? `توجہ طلب کلمات (${missedExamples.length}):` : `Verbs to Review (${missedExamples.length}):`}
            </span>
            <div className="flex flex-wrap gap-2">
              {missedExamples.map((ex, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-[var(--surface-card)] border border-amber-500/20 text-xs flex items-center gap-2"
                >
                  <span className="font-arabic font-bold text-[var(--foreground)]">{ex.arabic}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Form {ex.formNumber}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={generateRound}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
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
            Question {currentIndex + 1}/{TOTAL_QUESTIONS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--surface-card)] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 animate-pulse text-xs">
              <Flame className="h-3.5 w-3.5 fill-amber-500" /> {streak}x
            </span>
          )}
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
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

      {/* Target Verb Prompt Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] text-center shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            {currentQ.example.surahName} ({currentQ.example.surah}:{currentQ.example.ayah})
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
            Root: {currentQ.example.root}
          </span>
        </div>

        {/* Big Arabic Verb */}
        <div className="py-2 flex items-center justify-center gap-3">
          <h3 className="font-arabic-amiri text-4xl sm:text-5xl font-bold text-[var(--foreground)]" dir="rtl">
            {currentQ.example.arabic}
          </h3>
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-600 transition-colors cursor-pointer"
            title="Listen pronunciation"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          {ageGroup === "kids"
            ? (isUrdu ? "یہ قرآنی لفظ کون سے ایکشن والے سانچے (فارم) کا ہے؟" : "Which action pattern (form) does this word belong to?")
            : (isUrdu ? "یہ قرآنی فعل کس باب (Verb Form) کا ہے؟" : "Which augmented Verb Form does this Quranic verb belong to?")}
        </p>
      </div>

      {/* 4 Multi-Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const optMeta = getVerbFormLabel(opt.formNumber, ageGroup, isUrdu);
          let btnClass = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/40 text-[var(--foreground)]";

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
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {opt.romanNumeral}
                </span>
                <div className="text-left">
                  <span className="font-semibold text-xs block text-[var(--foreground)]">
                    {ageGroup === "kids" ? optMeta.badge : optMeta.title.split("(")[0]}
                  </span>
                  <span className="font-arabic-amiri text-base font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                    {opt.arabicName}
                  </span>
                </div>
              </div>

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

      {/* Feedback Bar & Next Button */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50 duration-200">
          <div className="space-y-0.5 text-xs">
            <span className="font-semibold text-[var(--foreground)]">
              {currentQ.example.english}
            </span>
            <span className="font-urdu-nastaliq text-[var(--muted-foreground)] block" dir="rtl">
              {currentQ.example.urdu}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-end"
          >
            <span>{currentIndex < TOTAL_QUESTIONS - 1 ? (isUrdu ? "اگلا سوال" : "Next Question") : (isUrdu ? "نتیجہ دیکھیں" : "See Results")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

