/**
 * Vocabulary Learning Progress & Persistence Service
 * 
 * Safely tracks learned words, SRS review schedules, game scores, and streak
 * with live computation of authentic "% of Quran Unlocked" derived from actual occurrences.
 */

import { QURAN_70_VOCABULARY, TOTAL_QURAN_WORDS, QuranVocabWord } from "@/data/quranVocabularyData";
import { useLearningStore } from "@/store/useLearningStore";

const STORAGE_KEY_MASTERED = "naq_vocab_mastered_ids_v1";
const STORAGE_KEY_REVIEW = "naq_vocab_review_ids_v1";
const STORAGE_KEY_STATS = "naq_vocab_game_stats_v1";
const STORAGE_KEY_STREAK = "naq_vocab_streak_v1";
const STORAGE_KEY_LANG = "naq_vocab_lang_pref_v1";

export type VocabLangPreference = "bilingual" | "english" | "urdu";

export interface GameStatRecord {
  gamesPlayed: number;
  highScore: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPlayed: string;
}

export interface UserVocabProgress {
  masteredWordIds: string[];
  reviewWordIds: string[];
  masteredCount: number;
  reviewCount: number;
  totalWordsInPool: number;
  masteredOccurrences: number;
  poolTotalOccurrences: number;
  percentOfQuranUnlocked: number;
  percentOfPoolMastered: number;
  streakDays: number;
  gameStats: Record<string, GameStatRecord>;
  langPreference: VocabLangPreference;
}

const defaultStats: Record<string, GameStatRecord> = {
  meaningQuiz: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  grammarMatch: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  rootFamily: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  ayahFill: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  matchBlitz: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
};

function getSafeStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadUserVocabProgress(): UserVocabProgress {
  const store = useLearningStore.getState();
  let mastered = store.masteredWordIds || [];
  let review = store.reviewWordIds || [];
  let stats = store.gameStats || defaultStats;

  // Auto-migrate legacy localStorage data into unified Zustand store if needed
  if (typeof window !== "undefined" && mastered.length === 0 && review.length === 0) {
    const legacyMastered = getSafeStorageItem<string[]>(STORAGE_KEY_MASTERED, []);
    const legacyReview = getSafeStorageItem<string[]>(STORAGE_KEY_REVIEW, []);
    const legacyStats = getSafeStorageItem<Record<string, GameStatRecord>>(STORAGE_KEY_STATS, defaultStats);
    if (legacyMastered.length > 0 || legacyReview.length > 0) {
      mastered = legacyMastered;
      review = legacyReview;
      stats = legacyStats;
      useLearningStore.setState({
        masteredWordIds: legacyMastered,
        reviewWordIds: legacyReview,
        gameStats: legacyStats,
      });
      try {
        localStorage.removeItem(STORAGE_KEY_MASTERED);
        localStorage.removeItem(STORAGE_KEY_REVIEW);
        localStorage.removeItem(STORAGE_KEY_STATS);
        localStorage.removeItem(STORAGE_KEY_STREAK);
      } catch (e) {
        console.warn("Failed to clean up legacy vocab keys", e);
      }
    }
  }

  const wordMap = new Map<string, QuranVocabWord>(QURAN_70_VOCABULARY.map((w) => [w.id, w]));
  let masteredOccurrences = 0;
  for (const id of mastered) {
    const word = wordMap.get(id);
    if (word) {
      masteredOccurrences += word.frequency;
    }
  }

  const poolTotalOccurrences = QURAN_70_VOCABULARY.reduce((acc, w) => acc + w.frequency, 0);
  const percentOfQuranUnlocked = Number(((masteredOccurrences / TOTAL_QURAN_WORDS) * 100).toFixed(1));
  const percentOfPoolMastered = Number(((mastered.length / QURAN_70_VOCABULARY.length) * 100).toFixed(0));

  return {
    masteredWordIds: mastered,
    reviewWordIds: review,
    masteredCount: mastered.length,
    reviewCount: review.length,
    totalWordsInPool: QURAN_70_VOCABULARY.length,
    masteredOccurrences,
    poolTotalOccurrences,
    percentOfQuranUnlocked,
    percentOfPoolMastered,
    streakDays: store.currentStreak,
    gameStats: stats,
    langPreference: (store.langPreference as VocabLangPreference) || "bilingual",
  };
}

export function markWordMastered(wordId: string): UserVocabProgress {
  useLearningStore.getState().markWordMastered(wordId);
  return loadUserVocabProgress();
}

export function markWordForReview(wordId: string): UserVocabProgress {
  useLearningStore.getState().markWordForReview(wordId);
  return loadUserVocabProgress();
}

export function resetWordStatus(wordId: string): UserVocabProgress {
  useLearningStore.getState().resetWordStatus(wordId);
  return loadUserVocabProgress();
}

export function saveGameScore(gameKey: string, score: number, correctCount = 0, questionCount = 0): UserVocabProgress {
  useLearningStore.getState().saveGameScore(gameKey, score, correctCount, questionCount);
  return loadUserVocabProgress();
}

export function setLanguagePreference(pref: VocabLangPreference): void {
  useLearningStore.getState().setLangPreference(pref);
}

export function resetAllVocabProgress(): UserVocabProgress {
  useLearningStore.getState().resetLearningProgress();
  return loadUserVocabProgress();
}
