"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Flame, Clock, Sparkles, CheckCircle2, RotateCcw, Trophy, ArrowRight } from "lucide-react";
import { useLearningStore } from "@/store/useLearningStore";
import { useLanguage } from "@/context/LanguageContext";
import { QURAN_70_VOCABULARY, QuranVocabWord } from "@/data/quranVocabularyData";
import { saveGameScore } from "@/services/vocabularyStorage";

export interface BlitzWordPair {
  id: string;
  textArabic: string;
  translationEn: string;
  translationUrdu?: string;
  transliteration?: string;
  audioUrl?: string;
}

export interface VocabMatchBlitzProps {
  words?: BlitzWordPair[];
  onComplete?: (accuracy: number, mistakes: number, xpEarned: number) => void;
  timeLimitSec?: number;
  onScoreSaved?: () => void;
}

interface BlitzCard {
  cardId: string;
  pairId: string;
  type: "arabic" | "meaning";
  label: string;
  subLabel?: string;
  audioUrl?: string;
  isRtl?: boolean;
}

function getRandomSubset(pool: QuranVocabWord[], count: number): BlitzWordPair[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((w) => ({
    id: w.id,
    textArabic: w.arabic,
    translationEn: w.english,
    translationUrdu: w.urdu,
    transliteration: w.transliteration,
  }));
}

export function VocabMatchBlitz({
  words: propWords,
  onComplete,
  timeLimitSec = 30,
  onScoreSaved,
}: VocabMatchBlitzProps) {
  const { langPreference, addXP, addGems } = useLearningStore();
  const { isUrdu } = useLanguage();

  const [roundKey, setRoundKey] = useState(0);
  const words = useMemo(() => {
    if (propWords && propWords.length >= 4) return propWords.slice(0, 4);
    return getRandomSubset(QURAN_70_VOCABULARY, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propWords, roundKey]);

  const [cards, setCards] = useState<BlitzCard[]>([]);
  const [selectedArabicId, setSelectedArabicId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalXpEarned, setFinalXpEarned] = useState(0);

  // Initialize and shuffle 4 Arabic and 4 Meaning cards based on langPreference
  useEffect(() => {
    const arabicCards: BlitzCard[] = words.map((w) => ({
      cardId: `ar_${w.id}`,
      pairId: w.id,
      type: "arabic",
      label: w.textArabic,
      subLabel: w.transliteration,
      audioUrl: w.audioUrl,
      isRtl: true,
    }));

    const meaningCards: BlitzCard[] = words.map((w) => {
      let label = w.translationEn;
      let subLabel: string | undefined = undefined;
      let isRtl = false;

      if (langPreference === "urdu") {
        label = w.translationUrdu || w.translationEn;
        isRtl = Boolean(w.translationUrdu);
      } else if (langPreference === "bilingual") {
        if (w.translationUrdu) {
          label = w.translationUrdu;
          subLabel = w.translationEn;
          isRtl = true;
        } else {
          label = w.translationEn;
        }
      }

      return {
        cardId: `meaning_${w.id}`,
        pairId: w.id,
        type: "meaning",
        label,
        subLabel,
        isRtl,
      };
    });

    const shuffled = [...arabicCards, ...meaningCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setTimeLeft(timeLimitSec);
    setMatchedPairIds([]);
    setMistakes(0);
    setCombo(1);
    setScore(0);
    setIsGameOver(false);
    setSelectedArabicId(null);
    setSelectedMeaningId(null);
  }, [words, timeLimitSec, langPreference]);

  const handleEnd = useCallback((timeRanOut: boolean, completedCount?: number) => {
    setIsGameOver(true);
    const matched = completedCount ?? matchedPairIds.length;
    const totalAttempts = matched + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((matched / totalAttempts) * 100) : 0;
    const baseXP = matched * 25;
    const comboBonus = (combo - 1) * 15;
    const finalXP = Math.max(20, baseXP + comboBonus);

    setFinalAccuracy(accuracy);
    setFinalXpEarned(finalXP);

    // Save score and award rewards
    saveGameScore("matchBlitz", score + finalXP);
    addXP(finalXP);
    if (accuracy >= 80) {
      addGems(3);
    }
    onScoreSaved?.();

    if (onComplete) {
      onComplete(accuracy, mistakes, finalXP);
    }
  }, [matchedPairIds.length, mistakes, combo, score, addXP, addGems, onScoreSaved, onComplete]);

  // Countdown timer
  useEffect(() => {
    if (isGameOver || matchedPairIds.length === 4) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEnd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, matchedPairIds.length, handleEnd]);

  const playSound = (url?: string) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.play().catch(() => {});
    } catch {
      // Audio playback silently handled
    }
  };

  const evaluatePair = (arabicPairId: string, meaningPairId: string) => {
    if (arabicPairId === meaningPairId) {
      // MATCH!
      const newMatched = [...matchedPairIds, arabicPairId];
      setMatchedPairIds(newMatched);
      setScore((s) => s + 50 * combo);
      setCombo((c) => Math.min(4, c + 1));
      setSelectedArabicId(null);
      setSelectedMeaningId(null);

      if (newMatched.length === 4) {
        handleEnd(false, newMatched.length);
      }
    } else {
      // MISTAKE
      setMistakes((m) => m + 1);
      setCombo(1);
      setTimeout(() => {
        setSelectedArabicId(null);
        setSelectedMeaningId(null);
      }, 500);
    }
  };

  const handleCardClick = (card: BlitzCard) => {
    if (isGameOver || matchedPairIds.includes(card.pairId)) return;

    if (card.type === "arabic") {
      playSound(card.audioUrl);

      if (selectedArabicId === card.cardId) {
        setSelectedArabicId(null);
        return;
      }
      setSelectedArabicId(card.cardId);

      if (selectedMeaningId) {
        const meaningCard = cards.find((c) => c.cardId === selectedMeaningId);
        if (meaningCard) {
          evaluatePair(card.pairId, meaningCard.pairId);
        }
      }
    } else {
      if (selectedMeaningId === card.cardId) {
        setSelectedMeaningId(null);
        return;
      }
      setSelectedMeaningId(card.cardId);

      if (selectedArabicId) {
        const arabicCard = cards.find((c) => c.cardId === selectedArabicId);
        if (arabicCard) {
          evaluatePair(arabicCard.pairId, card.pairId);
        }
      }
    }
  };

  const restartRound = () => {
    setRoundKey((k) => k + 1);
  };

  const pctTimeLeft = Math.max(0, Math.min(100, Math.round((timeLeft / timeLimitSec) * 100)));

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 animate-in fade-in duration-200 text-left">
      {/* Blitz Header: Combo, Score & Fast Timer */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm">
        {/* Combo Multiplier Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black flex items-center gap-1 transition-all ${
              combo > 1
                ? "bg-amber-500 text-amber-950 shadow-md shadow-amber-500/30 scale-105 animate-pulse"
                : "bg-[var(--surface-card)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {combo}x COMBO
          </div>
          <span className="text-xs font-bold text-[var(--muted-foreground)] font-mono">Score: {score}</span>
        </div>

        {/* Dynamic Countdown Timer */}
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${timeLeft <= 5 ? "text-rose-500 animate-spin" : "text-emerald-500"}`} />
          <span
            className={`font-mono text-sm font-black ${
              timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-[var(--foreground)]"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-2 bg-[var(--surface-card)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 5
              ? "bg-rose-500 shadow-md shadow-rose-500/50"
              : "bg-gradient-to-r from-emerald-500 to-teal-500"
          }`}
          style={{ width: `${pctTimeLeft}%` }}
        />
      </div>

      {/* Instructions Prompt */}
      <p className="text-xs text-center text-[var(--muted-foreground)] font-medium">
        {langPreference === "urdu"
          ? "عربی اور اردو کے ملتے ہوئے کارڈز کو تیزی سے منتخب کریں!"
          : langPreference === "bilingual"
          ? "تیزی سے جوڑیں: Match each Arabic word with its meaning!"
          : "Tap matching pairs of Arabic words and English meanings as fast as you can!"}
      </p>

      {/* 4x2 Grid of Blitz Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isSelected =
            card.type === "arabic"
              ? selectedArabicId === card.cardId
              : selectedMeaningId === card.cardId;

          return (
            <button
              key={card.cardId}
              type="button"
              disabled={isMatched || isGameOver}
              onClick={() => handleCardClick(card)}
              dir={card.isRtl ? "rtl" : "ltr"}
              className={`min-h-[96px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                isMatched
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 opacity-60 scale-95"
                  : isSelected
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-lg shadow-amber-500/20 scale-105"
                  : "bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] hover:border-emerald-500/30 border-[var(--card-border)] text-[var(--foreground)] active:scale-95"
              }`}
            >
              {isMatched && (
                <div className="absolute top-1.5 right-1.5 text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}

              {card.type === "arabic" ? (
                <>
                  <span
                    className="text-xl sm:text-2xl font-black tracking-wide"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    {card.label}
                  </span>
                  {card.subLabel && (
                    <span className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5" dir="ltr">
                      {card.subLabel}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-2 ${card.isRtl ? "leading-relaxed" : ""}`}>
                    {card.label}
                  </span>
                  {card.subLabel && (
                    <span className="text-[9px] text-[var(--muted-foreground)] font-medium mt-0.5 line-clamp-1" dir="ltr">
                      {card.subLabel}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Status Modal / Card */}
      {isGameOver && (
        <div className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <h4 className="text-lg font-black text-[var(--foreground)]">
              {matchedPairIds.length === 4
                ? (isUrdu ? "ماشاء الله! شاندار رفتار" : "Masha'Allah! Blitz Cleared!")
                : (isUrdu ? "وقت ختم ہو گیا!" : "Time's Up!")}
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {matchedPairIds.length === 4
                ? (isUrdu
                    ? `تمام ۴ جوڑے ${timeLimitSec - timeLeft} سیکنڈ میں کلیئر ہو گئے • غلطیاں: ${mistakes}`
                    : `All 4 pairs cleared in ${timeLimitSec - timeLeft}s with ${mistakes} mistakes!`)
                : `Matched ${matchedPairIds.length} of 4 pairs.`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-mono py-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              +{finalXpEarned} XP
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)]">
              {finalAccuracy}% Accuracy
            </span>
          </div>

          <button
            type="button"
            onClick={restartRound}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Blitz Round</span>
          </button>
        </div>
      )}
    </div>
  );
}
