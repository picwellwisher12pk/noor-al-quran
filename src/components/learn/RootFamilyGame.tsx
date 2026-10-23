"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
  SEMANTIC_CLUSTERS,
  SemanticClusterInfo,
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
  Layers,
  ArrowRight,
  Flame,
  Check,
} from "lucide-react";

interface RootFamilyGameProps {
  langPreference: VocabLangPreference;
  onScoreSaved: () => void;
}

interface FamilyRound {
  cluster: SemanticClusterInfo;
  correctWords: QuranVocabWord[];
  candidatePool: QuranVocabWord[];
}

const TOTAL_ROUNDS = 5;

export function RootFamilyGame({ langPreference, onScoreSaved }: RootFamilyGameProps) {
  const { playWord } = useAudio();
  const [rounds, setRounds] = useState<FamilyRound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const generateRounds = useCallback(() => {
    // Pick clusters that have at least 3 words in vocabulary
    const eligibleClusters = SEMANTIC_CLUSTERS.filter((c) => {
      const words = QURAN_70_VOCABULARY.filter((w) => c.wordIds.includes(w.id));
      return words.length >= 2;
    });

    const shuffledClusters = [...eligibleClusters].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);

    const generated: FamilyRound[] = shuffledClusters.map((cluster) => {
      const correctWords = QURAN_70_VOCABULARY.filter((w) => cluster.wordIds.includes(w.id));
      const otherWords = QURAN_70_VOCABULARY.filter((w) => !cluster.wordIds.includes(w.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(3, 6 - correctWords.length));

      const candidatePool = [...correctWords, ...otherWords].sort(() => Math.random() - 0.5);

      return {
        cluster,
        correctWords,
        candidatePool,
      };
    });

    setRounds(generated);
    setCurrentIndex(0);
    setSelectedWordIds([]);
    setIsSubmitted(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    generateRounds();
  }, [generateRounds]);

  const currentRound = rounds[currentIndex];

  const handleToggleSelect = (wordId: string) => {
    if (isSubmitted) return;
    setSelectedWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  const handleSubmit = () => {
    if (isSubmitted || !currentRound) return;
    setIsSubmitted(true);

    const correctIdSet = new Set(currentRound.correctWords.map((w) => w.id));
    const selectedSet = new Set(selectedWordIds);

    let roundPoints = 0;
    let perfect = true;

    for (const w of currentRound.candidatePool) {
      const shouldBeSelected = correctIdSet.has(w.id);
      const isSelected = selectedSet.has(w.id);

      if (shouldBeSelected && isSelected) {
        roundPoints += 50;
      } else if (!shouldBeSelected && isSelected) {
        roundPoints -= 20;
        perfect = false;
      } else if (shouldBeSelected && !isSelected) {
        perfect = false;
      }
    }

    if (perfect) {
      roundPoints += 100; // Perfect bonus
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setScore((prev) => Math.max(0, prev + Math.max(0, roundPoints)));
  };

  const handleNext = () => {
    if (currentIndex < TOTAL_ROUNDS - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWordIds([]);
      setIsSubmitted(false);
    } else {
      setIsGameOver(true);
      saveGameScore("rootFamily", score, TOTAL_ROUNDS, TOTAL_ROUNDS);
      onScoreSaved();
    }
  };

  const handlePlayAudio = (e: React.MouseEvent, word: QuranVocabWord) => {
    e.stopPropagation();
    const { surah, ayah } = word.sampleAyah;
    const sStr = String(surah).padStart(3, "0");
    const aStr = String(ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(word.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)]">
        Loading family matching challenge...
      </div>
    );
  }

  // GAME OVER SCREEN
  if (isGameOver) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-md">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-950/60 border-emerald-800/40 text-emerald-400 mb-2">
            Semantic Groups & Roots
          </span>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Word Family Challenge Complete!</h2>
          <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-1">
            You successfully grouped high-frequency words sharing similar roots and meanings.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] max-w-xs mx-auto">
          <span className="text-xs uppercase font-bold text-emerald-400 block mb-1">Total Score</span>
          <span className="text-4xl font-extrabold text-[var(--foreground)]">{score} pts</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={generateRounds}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Play Another Match
          </button>
        </div>
      </div>
    );
  }

  const correctIdSet = new Set(currentRound.correctWords.map((w) => w.id));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top HUD */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--foreground)]">
            Round {currentIndex + 1} of {TOTAL_ROUNDS}
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

      {/* Target Semantic Cluster Banner */}
      <div className="p-6 rounded-3xl bg-[var(--surface-raised,#141e1a)] border-2 border-[var(--card-border,#1e2c26)] text-center shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
          <Layers className="h-3.5 w-3.5" /> Target Meaning Family
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
          {currentRound.cluster.title}
        </h3>
        <p className="font-arabic-amiri text-lg text-emerald-400 font-semibold" dir="rtl">
          {currentRound.cluster.titleAr}
        </p>
        <p className="text-xs text-[var(--muted-foreground,#8e9b94)] max-w-lg mx-auto">
          {langPreference === "urdu" ? currentRound.cluster.descriptionUrdu : currentRound.cluster.description}
        </p>
        <p className="text-[11px] font-semibold text-emerald-300 pt-1">
          Select all {currentRound.correctWords.length} words below that belong to this family:
        </p>
      </div>

      {/* Candidate Words Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {currentRound.candidatePool.map((word) => {
          const isSelected = selectedWordIds.includes(word.id);
          const isCorrect = correctIdSet.has(word.id);

          let chipStyle = "bg-[var(--surface-raised,#141e1a)] border-[var(--card-border,#1e2c26)] hover:border-emerald-500/50 hover:bg-[var(--surface-card,#182520)] text-[var(--foreground)]";

          if (isSelected && !isSubmitted) {
            chipStyle = "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md";
          }

          if (isSubmitted) {
            if (isCorrect && isSelected) {
              chipStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-950/50";
            } else if (!isCorrect && isSelected) {
              chipStyle = "bg-rose-950/50 border-rose-600 text-rose-300";
            } else if (isCorrect && !isSelected) {
              chipStyle = "border-amber-500/80 bg-amber-950/30 text-amber-300 border-dashed";
            } else {
              chipStyle = "opacity-35 bg-[var(--surface-raised,#141e1a)] border-[var(--border-subtle,#24362e)]";
            }
          }

          return (
            <div
              key={word.id}
              onClick={() => handleToggleSelect(word.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative group ${chipStyle}`}
            >
              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground,#8e9b94)] mb-1">
                <span className="font-mono">{word.root ? `Root: ${word.root}` : word.posLabelEn}</span>
                <button
                  type="button"
                  onClick={(e) => handlePlayAudio(e, word)}
                  className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
                  title="Listen"
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              </div>

              <div className="my-1.5 text-center">
                <span className="font-arabic-amiri text-2xl font-bold block" dir="rtl">
                  {word.arabic}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium block">
                  {word.transliteration}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block truncate">
                  {langPreference === "urdu" ? word.urdu : word.english}
                </span>
              </div>

              <div className="flex items-center justify-end mt-1">
                {isSubmitted ? (
                  isCorrect && isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : !isCorrect && isSelected ? (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  ) : isCorrect && !isSelected ? (
                    <span className="text-[10px] text-amber-400 font-semibold">Missed</span>
                  ) : null
                ) : (
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-[var(--border-subtle,#24362e)] bg-[var(--surface-card,#182520)]"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-[var(--muted-foreground,#8e9b94)]">
          Selected: {selectedWordIds.length} / {currentRound.correctWords.length} target words
        </span>

        {!isSubmitted ? (
          <button
            type="button"
            disabled={selectedWordIds.length === 0}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none"
          >
            Check Family Match
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
          >
            <span>Next Family</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
