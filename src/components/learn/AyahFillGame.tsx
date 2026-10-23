"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
} from "@/data/quranVocabularyData";
import { saveGameScore, VocabLangPreference } from "@/services/vocabularyStorage";
import { useAudio } from "@/context/AudioContext";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Flame,
  Trophy,
} from "lucide-react";

interface AyahFillGameProps {
  langPreference: VocabLangPreference;
  onScoreSaved: () => void;
}

interface AyahQuestion {
  word: QuranVocabWord;
  options: QuranVocabWord[];
  correctIndex: number;
  blankedVerseText: string;
}

const TOTAL_ROUNDS = 8;

export function AyahFillGame({ langPreference, onScoreSaved }: AyahFillGameProps) {
  const { playVerse } = useAudio();
  const [questions, setQuestions] = useState<AyahQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [missedWords, setMissedWords] = useState<QuranVocabWord[]>([]);

  const generateRounds = useCallback(() => {
    const shuffledPool = [...QURAN_70_VOCABULARY].sort(() => Math.random() - 0.5);
    const selectedTargets = shuffledPool.slice(0, TOTAL_ROUNDS);

    const generated: AyahQuestion[] = selectedTargets.map((target) => {
      const distractors = QURAN_70_VOCABULARY.filter((w) => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allFour = [...distractors, target].sort(() => Math.random() - 0.5);
      const correctIdx = allFour.findIndex((w) => w.id === target.id);

      // Replace highlightWord in verseText with [ _______ ]
      const rawText = target.sampleAyah.verseText;
      const highlight = target.sampleAyah.highlightWord;
      const blanked = rawText.includes(highlight)
        ? rawText.replace(highlight, " [ ＿＿＿＿ ] ")
        : rawText.replace(target.arabic, " [ ＿＿＿＿ ] ");

      return {
        word: target,
        options: allFour,
        correctIndex: correctIdx,
        blankedVerseText: blanked,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setMissedWords([]);
  }, []);

  useEffect(() => {
    generateRounds();
  }, [generateRounds]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOptionIndex(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      const points = 100 + streak * 25;
      setScore((s) => s + points);
      setStreak((st) => {
        const next = st + 1;
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
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      const correctCount = TOTAL_ROUNDS - missedWords.length;
      saveGameScore("ayahFill", score, correctCount, TOTAL_ROUNDS);
      onScoreSaved();
    }
  };

  const handlePlayAyahRecitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQ) return;
    const { surah, ayah } = currentQ.word.sampleAyah;
    const verseKey = `${surah}:${ayah}`;
    try {
      playVerse(surah, verseKey);
    } catch {
      console.log("Verse playback trigger for", verseKey);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)]">
        Loading Ayah completion challenges...
      </div>
    );
  }

  // GAME OVER SCREEN
  if (isGameOver) {
    const correctCount = TOTAL_ROUNDS - missedWords.length;
    const accuracy = Math.round((correctCount / TOTAL_ROUNDS) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-950/60 border-emerald-800/40 text-emerald-400 mb-2">
            Ayah Verse Completion
          </span>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Verse Challenge Complete!</h2>
          <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-1">
            You practiced recognizing high-frequency vocabulary in authentic Quranic verses.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Score</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Accuracy</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)]">
              {accuracy}% <span className="text-xs text-[var(--muted-foreground,#8e9b94)] font-normal">({correctCount}/{TOTAL_ROUNDS})</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Best Streak</span>
            <span className="text-2xl font-extrabold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-amber-400" /> {maxStreak}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={generateRounds}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
        </div>
      </div>
    );
  }

  const sample = currentQ.word.sampleAyah;
  const showUrdu = langPreference === "bilingual" || langPreference === "urdu";
  const showEnglish = langPreference === "bilingual" || langPreference === "english";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top HUD */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            Ayah {currentIndex + 1} of {TOTAL_ROUNDS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--surface-card,#182520)] overflow-hidden">
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

      {/* Ayah Card with Blank */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--surface-raised,#141e1a)] border-2 border-[var(--card-border,#1e2c26)] text-center shadow-lg relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground,#8e9b94)]">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Surah {sample.surahName} [{sample.surah}:{sample.ayah}]
          </span>
          <button
            type="button"
            onClick={handlePlayAyahRecitation}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Volume2 className="h-3.5 w-3.5" /> Listen Ayah Recitation
          </button>
        </div>

        {/* Verse Text with Blank */}
        <div className="py-4 px-2">
          <p
            className="font-arabic-amiri text-2xl md:text-3xl text-[var(--foreground)] font-bold leading-loose"
            dir="rtl"
          >
            {isAnswered ? sample.verseText : currentQ.blankedVerseText}
          </p>
        </div>

        {/* Translations with Context */}
        <div className="pt-2 border-t border-[var(--border-subtle,#24362e)] space-y-1.5 text-xs text-left">
          {showEnglish && (
            <p className="text-[var(--muted-foreground,#8e9b94)] italic">
              &ldquo;{sample.englishText}&rdquo;
            </p>
          )}
          {showUrdu && (
            <p className="font-urdu-nastaliq text-[var(--muted-foreground,#8e9b94)] text-right" dir="rtl">
              {sample.urduText}
            </p>
          )}
        </div>
      </div>

      {/* 4 Candidate Word Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((option, idx) => {
          let btnStyle = "bg-[var(--surface-raised,#141e1a)] border-[var(--card-border,#1e2c26)] hover:border-emerald-500/50 hover:bg-[var(--surface-card,#182520)] text-[var(--foreground)]";

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-950/50";
            } else if (idx === selectedOptionIndex) {
              btnStyle = "bg-rose-950/50 border-rose-600 text-rose-300";
            } else {
              btnStyle = "opacity-40 bg-[var(--surface-raised,#141e1a)] border-[var(--border-subtle,#24362e)]";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${btnStyle}`}
            >
              <span className="font-arabic-amiri text-2xl md:text-3xl font-bold" dir="rtl">
                {option.arabic}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {option.transliteration}
              </span>
              <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">
                {langPreference === "urdu" ? option.urdu : option.english}
              </span>
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Next Button */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200 shadow-md">
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-emerald-400 block">
              Word: {currentQ.word.arabic} ({currentQ.word.english})
            </span>
            <span className="text-[var(--muted-foreground,#8e9b94)]">
              {currentQ.word.frequency.toLocaleString()} occurrences in Quran &bull; {currentQ.word.posLabelAr}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <span>Next Ayah</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
