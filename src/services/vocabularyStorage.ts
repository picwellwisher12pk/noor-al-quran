/**
 * Vocabulary Learning Progress & Persistence Service
 * 
 * Safely tracks learned words, SRS review schedules, game scores, and streak
 * with live computation of authentic "% of Quran Unlocked" derived from actual occurrences.
 */

import { QURAN_70_VOCABULARY, TOTAL_QURAN_WORDS, QuranVocabWord } from "@/data/quranVocabularyData";

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

function setSafeStorageItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage (${key}):`, e);
  }
}

export function loadUserVocabProgress(): UserVocabProgress {
  const mastered = getSafeStorageItem<string[]>(STORAGE_KEY_MASTERED, []);
  const review = getSafeStorageItem<string[]>(STORAGE_KEY_REVIEW, []);
  const stats = getSafeStorageItem<Record<string, GameStatRecord>>(STORAGE_KEY_STATS, defaultStats);
  const langPref = getSafeStorageItem<VocabLangPreference>(STORAGE_KEY_LANG, "bilingual");

  // Streak calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const streakData = getSafeStorageItem<{ current: number; lastActiveDate: string }>(STORAGE_KEY_STREAK, {
    current: 0,
    lastActiveDate: "",
  });

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
    streakDays: streakData.current,
    gameStats: stats,
    langPreference: langPref,
  };
}

export function markWordMastered(wordId: string): UserVocabProgress {
  const mastered = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_MASTERED, []));
  const review = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_REVIEW, []));

  mastered.add(wordId);
  review.delete(wordId);

  setSafeStorageItem(STORAGE_KEY_MASTERED, Array.from(mastered));
  setSafeStorageItem(STORAGE_KEY_REVIEW, Array.from(review));
  touchActiveStreak();

  return loadUserVocabProgress();
}

export function markWordForReview(wordId: string): UserVocabProgress {
  const mastered = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_MASTERED, []));
  const review = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_REVIEW, []));

  review.add(wordId);
  mastered.delete(wordId);

  setSafeStorageItem(STORAGE_KEY_MASTERED, Array.from(mastered));
  setSafeStorageItem(STORAGE_KEY_REVIEW, Array.from(review));
  touchActiveStreak();

  return loadUserVocabProgress();
}

export function resetWordStatus(wordId: string): UserVocabProgress {
  const mastered = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_MASTERED, []));
  const review = new Set(getSafeStorageItem<string[]>(STORAGE_KEY_REVIEW, []));

  mastered.delete(wordId);
  review.delete(wordId);

  setSafeStorageItem(STORAGE_KEY_MASTERED, Array.from(mastered));
  setSafeStorageItem(STORAGE_KEY_REVIEW, Array.from(review));

  return loadUserVocabProgress();
}

export function saveGameScore(gameKey: string, score: number, correctCount: number, questionCount: number): UserVocabProgress {
  const stats = getSafeStorageItem<Record<string, GameStatRecord>>(STORAGE_KEY_STATS, defaultStats);
  const current = stats[gameKey] || { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" };

  stats[gameKey] = {
    gamesPlayed: current.gamesPlayed + 1,
    highScore: Math.max(current.highScore, score),
    totalCorrect: current.totalCorrect + correctCount,
    totalQuestions: current.totalQuestions + questionCount,
    lastPlayed: new Date().toISOString(),
  };

  setSafeStorageItem(STORAGE_KEY_STATS, stats);
  touchActiveStreak();

  return loadUserVocabProgress();
}

export function setLanguagePreference(pref: VocabLangPreference): void {
  setSafeStorageItem(STORAGE_KEY_LANG, pref);
}

function touchActiveStreak(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const streakData = getSafeStorageItem<{ current: number; lastActiveDate: string }>(STORAGE_KEY_STREAK, {
    current: 0,
    lastActiveDate: "",
  });

  if (streakData.lastActiveDate === today) {
    return; // Already counted today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newStreak = 1;
  if (streakData.lastActiveDate === yesterday) {
    newStreak = (streakData.current || 0) + 1;
  }

  setSafeStorageItem(STORAGE_KEY_STREAK, {
    current: newStreak,
    lastActiveDate: today,
  });
}

export function resetAllVocabProgress(): UserVocabProgress {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_MASTERED);
    localStorage.removeItem(STORAGE_KEY_REVIEW);
    localStorage.removeItem(STORAGE_KEY_STATS);
    localStorage.removeItem(STORAGE_KEY_STREAK);
  }
  return loadUserVocabProgress();
}
