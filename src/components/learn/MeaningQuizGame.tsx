"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
} from "@/data/quranVocabularyData";
import {
  saveGameScore,
  markWordMastered,
  markWordForReview,
  VocabLangPreference,
} from "@/services/vocabularyStorage";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
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
  BookOpen,
} from "lucide-react";

interface MeaningQuizGameProps {
  langPreference?: VocabLangPreference;
  onScoreSaved?: () => void;
}

interface Question {
  targetWord: QuranVocabWord;
  options: QuranVocabWord[];
  correctIndex: number;
}

const TOTAL_QUESTIONS_PER_ROUND = 10;
const SECONDS_PER_QUESTION = 15;

export function MeaningQuizGame({
  langPreference: propLangPreference,
  onScoreSaved,
}: MeaningQuizGameProps = {}) {
  const { language } = useLanguage();
  const langPreference = propLangPreference || (language as VocabLangPreference) || "bilingual";
  const { playWord } = useAudio();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [quizMode, setQuizMode] = useState<"ar_to_en" | "en_to_ar">("ar_to_en");
  const [missedWords, setMissedWords] = useState<QuranVocabWord[]>([]);

  // Generate a 10-question round
  const generateNewRound = useCallback(() => {
    const shuffledPool = [...QURAN_70_VOCABULARY].sort(() => Math.random() - 0.5);
    const selectedTargets = shuffledPool.slice(0, TOTAL_QUESTIONS_PER_ROUND);

    const generatedQuestions: Question[] = selectedTargets.map((target) => {
      // Pick 3 unique distractors
      const poolWithoutTarget = QURAN_70_VOCABULARY.filter((w) => w.id !== target.id);
      const distractors = poolWithoutTarget
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allFour = [...distractors, target].sort(() => Math.random() - 0.5);
      const correctIdx = allFour.findIndex((w) => w.id === target.id);

      return {
        targetWord: target,
        options: allFour,
        correctIndex: correctIdx,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setIsGameOver(false);
    setMissedWords([]);
  }, []);

  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

  const currentQ = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (isGameOver || isAnswered || !currentQ) return;

    if (timeLeft <= 0) {
      // Time is up -> Treat as wrong answer
      handleAnswer(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, isAnswered, currentQ]);

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionIndex(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      const timeBonus = Math.max(1, timeLeft * 10);
      const streakBonus = streak * 20;
      const points = 100 + timeBonus + streakBonus;
      setScore((prev) => prev + points);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      markWordMastered(currentQ.targetWord.id);
    } else {
      setStreak(0);
      setMissedWords((prev) => [...prev, currentQ.targetWord]);
      markWordForReview(currentQ.targetWord.id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < TOTAL_QUESTIONS_PER_ROUND - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      // Game Complete
      setIsGameOver(true);
      const finalCorrect = TOTAL_QUESTIONS_PER_ROUND - missedWords.length;
      saveGameScore("meaningQuiz", score, finalCorrect, TOTAL_QUESTIONS_PER_ROUND);
      onScoreSaved?.();
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQ) return;
    const { surah, ayah } = currentQ.targetWord.sampleAyah;
    const sStr = String(surah).padStart(3, "0");
    const aStr = String(ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(currentQ.targetWord.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
        Loading quiz challenge...
      </div>
    );
  }

  // GAME OVER SCREEN
  if (isGameOver) {
    const correctCount = TOTAL_QUESTIONS_PER_ROUND - missedWords.length;
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS_PER_ROUND) * 100);

    let ratingBadge = { text: "Mumtāz! (ممتاز)", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40" };
    if (accuracy < 60) {
      ratingBadge = { text: "Keep Practicing! (استمر)", color: "text-amber-400 bg-amber-950/60 border-amber-800/40" };
    } else if (accuracy < 90) {
      ratingBadge = { text: "Jayyid Jiddan! (جيد جداً)", color: "text-teal-400 bg-teal-950/60 border-teal-800/40" };
    }

    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${ratingBadge.color} mb-2`}>
            {ratingBadge.text}
          </span>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quiz Round Complete!</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            You tested your knowledge on authentic high-frequency Quranic words.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Score</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Accuracy</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">
              {accuracy}% <span className="text-xs text-[var(--muted-foreground)] font-normal">({correctCount}/{TOTAL_QUESTIONS_PER_ROUND})</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Best Streak</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-amber-400" /> {maxStreak}
            </span>
          </div>
        </div>

        {/* Missed Words Summary */}
        {missedWords.length > 0 && (
          <div className="text-left p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 space-y-2">
            <span className="text-xs font-semibold text-amber-400 block">
              Words to Review ({missedWords.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {missedWords.map((w) => (
                <span
                  key={w.id}
                  className="px-2.5 py-1 rounded-xl bg-[var(--surface-card)] border border-amber-500/20 text-xs text-[var(--foreground)] flex items-center gap-1.5"
                >
                  <span className="font-arabic font-semibold">{w.arabic}</span>
                  <span className="text-[var(--muted-foreground)]">({w.english})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={generateNewRound}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Play Another Round
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ QUESTION
  const renderOptionText = (word: QuranVocabWord) => {
    if (quizMode === "ar_to_en") {
      if (langPreference === "urdu") return word.urdu;
      if (langPreference === "english") return word.english;
      return (
        <span className="flex flex-col text-left">
          <span className="font-semibold text-xs sm:text-sm">{word.english}</span>
          <span className="font-urdu-nastaliq text-xs text-emerald-400" dir="rtl">{word.urdu}</span>
        </span>
      );
    } else {
      return (
        <span className="font-arabic-amiri text-lg sm:text-xl font-bold" dir="rtl">
          {word.arabic}
        </span>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Quiz Top Hud */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-xs shadow-sm">
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            Question {currentIndex + 1}/{TOTAL_QUESTIONS_PER_ROUND}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--surface-card)] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TOTAL_QUESTIONS_PER_ROUND) * 100}%` }}
            />
          </div>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="flex items-center gap-1 font-bold text-amber-400 animate-pulse text-xs">
              <Flame className="h-3.5 w-3.5" /> {streak}x Combo!
            </span>
          )}
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {score} pts
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-xl border ${
            timeLeft <= 5
              ? "bg-rose-950/60 border-rose-800/50 text-rose-400 animate-pulse"
              : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--foreground)]"
          }`}
        >
          <Timer className="h-3.5 w-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Target Word Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] text-center shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            {currentQ.targetWord.posLabelAr} ({currentQ.targetWord.posLabelEn})
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-mono">
            {currentQ.targetWord.frequency.toLocaleString()}x in Quran
          </span>
        </div>

        <div className="py-2">
          {quizMode === "ar_to_en" ? (
            <h3 className="font-arabic-amiri text-5xl md:text-6xl text-[var(--foreground)] font-bold tracking-wide leading-relaxed" dir="rtl">
              {currentQ.targetWord.arabic}
            </h3>
          ) : (
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              {langPreference === "urdu" ? currentQ.targetWord.urdu : currentQ.targetWord.english}
            </h3>
          )}
          <p className="text-sm text-emerald-400 font-medium mt-1">
            {currentQ.targetWord.transliteration}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Volume2 className="h-3.5 w-3.5" /> Listen Pronunciation
          </button>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((option, idx) => {
          let btnStyle = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--surface-card)] text-[var(--foreground)]";

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-950/50";
            } else if (idx === selectedOptionIndex) {
              btnStyle = "bg-rose-950/50 border-rose-600 text-rose-300 font-bold";
            } else {
              btnStyle = "opacity-40 bg-[var(--surface-raised)] border-[var(--border-subtle)]";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleAnswer(idx)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center justify-between gap-2 shadow-sm ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--muted-foreground)]">
                  {idx + 1}
                </span>
                <div>{renderOptionText(option)}</div>
              </div>

              {isAnswered && idx === currentQ.correctIndex && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              )}
              {isAnswered && idx === selectedOptionIndex && idx !== currentQ.correctIndex && (
                <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner & Next Question Button */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200 shadow-md">
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-emerald-400 block">
              Meaning Group: {currentQ.targetWord.semanticClusterTitle}
            </span>
            <span className="text-[var(--muted-foreground)]">
              Sample: Surah {currentQ.targetWord.sampleAyah.surahName} [{currentQ.targetWord.sampleAyah.surah}:{currentQ.targetWord.sampleAyah.ayah}]
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextQuestion}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <span>Next Question</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
