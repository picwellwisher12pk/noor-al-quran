"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
  PartOfSpeechType,
} from "@/data/quranVocabularyData";
import { saveGameScore, VocabLangPreference } from "@/services/vocabularyStorage";
import { useAudio } from "@/context/AudioContext";
import {
  Sparkles,
  Trophy,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  HelpCircle,
} from "lucide-react";

interface GrammarClassifierGameProps {
  langPreference?: VocabLangPreference;
  onScoreSaved?: () => void;
}

interface GrammarQuestion {
  word: QuranVocabWord;
  primaryPos: "noun" | "verb" | "particle";
  subCategory: string;
}

const TOTAL_ROUNDS = 10;

export function GrammarClassifierGame({ onScoreSaved }: GrammarClassifierGameProps = {}) {
  const { playWord } = useAudio();
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPos, setSelectedPos] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [missedWords, setMissedWords] = useState<QuranVocabWord[]>([]);

  const generateRound = useCallback(() => {
    const shuffled = [...QURAN_70_VOCABULARY].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_ROUNDS);

    const generated: GrammarQuestion[] = selected.map((w) => {
      let primary: "noun" | "verb" | "particle" = "noun";
      if (w.pos === "verb") primary = "verb";
      else if (w.pos === "particle" || w.pos === "preposition") primary = "particle";
      else primary = "noun"; // nouns, pronouns, demonstratives are Asmaa' (أسماء) in Arabic grammar

      return {
        word: w,
        primaryPos: primary,
        subCategory: w.posLabelAr,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedPos(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setMissedWords([]);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const currentQ = questions[currentIndex];

  const handleSelectPos = (pos: "noun" | "verb" | "particle") => {
    if (isAnswered || !currentQ) return;

    setSelectedPos(pos);
    setIsAnswered(true);

    const isCorrect = pos === currentQ.primaryPos;

    if (isCorrect) {
      const points = 100 + streak * 25;
      setScore((prev) => prev + points);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissedWords((prev) => [...prev, currentQ.word]);
    }
  };

  const handleNext = () => {
    if (currentIndex < TOTAL_ROUNDS - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedPos(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      const correctCount = TOTAL_ROUNDS - missedWords.length;
      saveGameScore("grammarMatch", score, correctCount, TOTAL_ROUNDS);
      onScoreSaved?.();
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQ) return;
    const { surah, ayah } = currentQ.word.sampleAyah;
    const sStr = String(surah).padStart(3, "0");
    const aStr = String(ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(currentQ.word.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
        Loading grammar challenges...
      </div>
    );
  }

  // GAME OVER SCREEN
  if (isGameOver) {
    const correctCount = TOTAL_ROUNDS - missedWords.length;
    const accuracy = Math.round((correctCount / TOTAL_ROUNDS) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-950/60 border-emerald-800/40 text-emerald-400 mb-2">
            Arabic Grammar Mastery
          </span>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Grammar Challenge Complete!</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            You practiced identifying the three fundamental branches of Quranic words (الاسم، الفعل، الحرف).
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Score</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Accuracy</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">
              {accuracy}% <span className="text-xs text-[var(--muted-foreground)] font-normal">({correctCount}/{TOTAL_ROUNDS})</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Streak</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-amber-400" /> {maxStreak}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={generateRound}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top HUD */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            Word {currentIndex + 1} of {TOTAL_ROUNDS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--surface-card)] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="flex items-center gap-1 font-bold text-amber-400 text-xs animate-pulse">
              <Flame className="h-3.5 w-3.5" /> {streak}x
            </span>
          )}
          <span className="font-mono font-bold text-emerald-400 text-sm">{score} pts</span>
        </div>
      </div>

      {/* Word Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] text-center shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            Meaning: {currentQ.word.english} ({currentQ.word.urdu})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-mono">
            {currentQ.word.frequency.toLocaleString()}x in Quran
          </span>
        </div>

        <div className="py-2">
          <h3 className="font-arabic-amiri text-5xl md:text-6xl text-[var(--foreground)] font-bold tracking-wide leading-relaxed" dir="rtl">
            {currentQ.word.arabic}
          </h3>
          <p className="text-sm text-emerald-400 font-medium mt-1">
            {currentQ.word.transliteration}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Volume2 className="h-3.5 w-3.5" /> Audio Pronunciation
          </button>
        </div>

        <p className="text-xs text-[var(--muted-foreground)] pt-2">
          Which part of speech is this word in Quranic Arabic grammar?
        </p>
      </div>

      {/* 3 Core Arabic Grammatical Divisions (Ism, Fi'l, Harf) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* ISM (NOUN / PRONOUN) */}
        {(() => {
          let btnStyle = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--surface-card)]";
          if (isAnswered) {
            if (currentQ.primaryPos === "noun") {
              btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
            } else if (selectedPos === "noun") {
              btnStyle = "bg-rose-950/50 border-rose-600 text-rose-300 font-bold";
            } else {
              btnStyle = "opacity-40 bg-[var(--surface-raised)] border-[var(--border-subtle)]";
            }
          }

          return (
            <button
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectPos("noun")}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm ${btnStyle}`}
            >
              <span className="font-arabic-amiri text-3xl font-bold text-[var(--foreground)]" dir="rtl">
                اِسْم (Ism)
              </span>
              <span className="text-xs font-semibold text-emerald-400">Noun / Pronoun</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                Person, place, thing, attribute, or pronoun
              </span>
            </button>
          );
        })()}

        {/* FI'L (VERB) */}
        {(() => {
          let btnStyle = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--surface-card)]";
          if (isAnswered) {
            if (currentQ.primaryPos === "verb") {
              btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
            } else if (selectedPos === "verb") {
              btnStyle = "bg-rose-950/50 border-rose-600 text-rose-300 font-bold";
            } else {
              btnStyle = "opacity-40 bg-[var(--surface-raised)] border-[var(--border-subtle)]";
            }
          }

          return (
            <button
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectPos("verb")}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm ${btnStyle}`}
            >
              <span className="font-arabic-amiri text-3xl font-bold text-[var(--foreground)]" dir="rtl">
                فِعْل (Fi‘l)
              </span>
              <span className="text-xs font-semibold text-emerald-400">Verb / Action</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                Action bounded by time (past, present, imperative)
              </span>
            </button>
          );
        })()}

        {/* HARF (PARTICLE / PREPOSITION) */}
        {(() => {
          let btnStyle = "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--surface-card)]";
          if (isAnswered) {
            if (currentQ.primaryPos === "particle") {
              btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
            } else if (selectedPos === "particle") {
              btnStyle = "bg-rose-950/50 border-rose-600 text-rose-300 font-bold";
            } else {
              btnStyle = "opacity-40 bg-[var(--surface-raised)] border-[var(--border-subtle)]";
            }
          }

          return (
            <button
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectPos("particle")}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm ${btnStyle}`}
            >
              <span className="font-arabic-amiri text-3xl font-bold text-[var(--foreground)]" dir="rtl">
                حَرْف (Ḥarf)
              </span>
              <span className="text-xs font-semibold text-emerald-400">Particle / Preposition</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                Prepositions, conjunctions, conditionals, negation
              </span>
            </button>
          );
        })()}
      </div>

      {/* Grammar Breakdown & Next Button */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200 shadow-md">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">
                Correct: {currentQ.subCategory} ({currentQ.word.posLabelEn})
              </span>
              {currentQ.word.root && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-card)] font-mono text-[var(--foreground)]">
                  Root: {currentQ.word.root}
                </span>
              )}
            </div>
            {currentQ.word.grammarNotes && (
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {currentQ.word.grammarNotes}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <span>Next Word</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
