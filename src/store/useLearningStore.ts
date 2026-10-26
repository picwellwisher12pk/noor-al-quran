/**
 * Global Learning & Gamification State Store
 * Powered by Zustand with persistent local storage
 * 
 * Manages:
 * - Gamification Economy: XP, Barakah Gems, Daily Istiqamah Streak, and Hearts pool (max 5)
 * - Skill Tree Progression: Completed nodes (gold), active node (pulsing teal), locked nodes, checkpoint gates
 * - Spaced Repetition System (SRS): Word mastery (levels 0-5), SuperMemo SM-2 schedule, Review Vault
 * - Active Session State: Practice Sandbox vs. Test Arena vs. Weak-Word Blitz
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SkillNode, getAllSkillNodes } from "../data/learning/curriculumData";
import { WordSRSRecord, MasteryLevel, SRSRecallGrade, LearningLanguagePreference } from "../types/learning";
import { LearningSession, generateSession } from "../lib/quiz-engine";

export interface HeartsState {
  current: number;
  max: 5;
  lastRegenTimestamp: number; // Unix ms
}

export interface GameStatRecord {
  gamesPlayed: number;
  highScore: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPlayed: string;
}

export const DEFAULT_GAME_STATS: Record<string, GameStatRecord> = {
  meaningQuiz: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  grammarMatch: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  rootFamily: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
  ayahFill: { gamesPlayed: 0, highScore: 0, totalCorrect: 0, totalQuestions: 0, lastPlayed: "" },
};

export interface LearningStoreState {
  // Gamification Economy
  totalXP: number;
  barakahGems: number;
  currentStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  hearts: HeartsState;

  // Progression & Skill Tree
  completedNodeIds: string[];
  unlockedNodeIds: string[];
  nodeStars: Record<string, 1 | 2 | 3>;
  activeNodeId: string;

  // Spaced Repetition Review Vault
  srsWords: Record<string, WordSRSRecord>;

  // Unified Vocabulary & Arcade Progress
  masteredWordIds: string[];
  reviewWordIds: string[];
  gameStats: Record<string, GameStatRecord>;

  // Language Preference (Bilingual English+Urdu, Urdu first, or English)
  langPreference: LearningLanguagePreference;
  setLangPreference: (pref: LearningLanguagePreference) => void;

  // Modal & Drawer UI State
  selectedNode: SkillNode | null;
  isModeSelectorOpen: boolean;
  isReviewVaultOpen: boolean;

  // Active Interactive Session
  activeSession: LearningSession | null;
  activeSessionMode: "practice" | "test" | "blitz" | null;

  // Computed / Getter methods
  getWeakWords: () => WordSRSRecord[];
  getHeartCount: () => number;

  // Actions
  syncHearts: () => void;
  openModeSelector: (node: SkillNode) => void;
  closeModeSelector: () => void;
  toggleReviewVault: (open?: boolean) => void;
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  consumeHeart: () => boolean;
  refillHearts: () => void;
  touchStreak: () => void;
  completeNode: (nodeId: string, stars: 1 | 2 | 3, mode: "practice" | "test") => void;
  recordWordReview: (wordId: string, grade: SRSRecallGrade) => void;
  markWordMastered: (wordId: string) => void;
  markWordForReview: (wordId: string) => void;
  resetWordStatus: (wordId: string) => void;
  saveGameScore: (gameKey: string, score: number, correctCount?: number, questionCount?: number) => void;
  startSession: (mode: "practice" | "test" | "blitz", node?: SkillNode) => LearningSession;
  endSession: () => void;
  resetLearningProgress: () => void;
}

const HEART_REGEN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes per heart

function calculateRegeneratedHearts(hearts: HeartsState): HeartsState {
  if (hearts.current >= hearts.max) {
    return { ...hearts, current: hearts.max };
  }

  const now = Date.now();
  const elapsed = now - hearts.lastRegenTimestamp;
  const heartsToGain = Math.floor(elapsed / HEART_REGEN_INTERVAL_MS);

  if (heartsToGain > 0) {
    const newCurrent = Math.min(hearts.max, hearts.current + heartsToGain);
    const remainderMs = elapsed % HEART_REGEN_INTERVAL_MS;
    return {
      current: newCurrent,
      max: hearts.max,
      lastRegenTimestamp: now - remainderMs
    };
  }

  return hearts;
}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set, get) => ({
      // Default state
      langPreference: "bilingual",
      setLangPreference: (pref: LearningLanguagePreference) => set({ langPreference: pref }),
      totalXP: 0,
      barakahGems: 0,
      currentStreak: 0,
      lastActiveDate: "",
      hearts: {
        current: 5,
        max: 5,
        lastRegenTimestamp: Date.now()
      },

      completedNodeIds: [],
      unlockedNodeIds: ["s1_u1_n1"],
      nodeStars: {},
      activeNodeId: "s1_u1_n1",

      srsWords: {},

      // Unified Vocabulary Progress & Arcade Stats
      masteredWordIds: [],
      reviewWordIds: [],
      gameStats: DEFAULT_GAME_STATS,

      selectedNode: null,
      isModeSelectorOpen: false,
      isReviewVaultOpen: false,

      activeSession: null,
      activeSessionMode: null,

      // --- Computed Getters ---
      getWeakWords: () => {
        const words = Object.values(get().srsWords);
        const now = new Date().toISOString();
        return words.filter(
          (w) => w.masteryLevel <= 2 || w.nextReviewAt <= now
        );
      },

      getHeartCount: () => {
        return calculateRegeneratedHearts(get().hearts).current;
      },

      syncHearts: () => {
        const updated = calculateRegeneratedHearts(get().hearts);
        if (updated.current !== get().hearts.current) {
          set({ hearts: updated });
        }
      },

      // --- Actions ---
      openModeSelector: (node: SkillNode) => {
        set({ selectedNode: node, isModeSelectorOpen: true });
      },

      closeModeSelector: () => {
        set({ isModeSelectorOpen: false });
      },

      toggleReviewVault: (open?: boolean) => {
        const current = get().isReviewVaultOpen;
        set({ isReviewVaultOpen: typeof open === "boolean" ? open : !current });
      },

      addXP: (amount: number) => {
        set((state) => ({ totalXP: state.totalXP + amount }));
        get().touchStreak();
      },

      addGems: (amount: number) => {
        set((state) => ({ barakahGems: state.barakahGems + amount }));
      },

      consumeHeart: () => {
        const currentHearts = get().getHeartCount();
        if (currentHearts <= 0) return false;

        set((state) => ({
          hearts: {
            ...state.hearts,
            current: currentHearts - 1,
            lastRegenTimestamp: Date.now()
          }
        }));
        return true;
      },

      refillHearts: () => {
        set((state) => ({
          hearts: {
            ...state.hearts,
            current: state.hearts.max,
            lastRegenTimestamp: Date.now()
          }
        }));
      },

      touchStreak: () => {
        const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local timezone
        const { lastActiveDate, currentStreak } = get();

        if (lastActiveDate === today) return;

        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
        const newStreak = lastActiveDate === yesterday ? currentStreak + 1 : 1;

        set({
          currentStreak: newStreak,
          lastActiveDate: today
        });
      },

      completeNode: (nodeId: string, stars: 1 | 2 | 3, mode: "practice" | "test") => {
        const state = get();
        const allNodes = getAllSkillNodes();
        const currentNode = allNodes.find((n) => n.id === nodeId);

        const newCompleted = Array.from(new Set([...state.completedNodeIds, nodeId]));
        const newStars = {
          ...state.nodeStars,
          [nodeId]: Math.max(state.nodeStars[nodeId] || 0, stars) as 1 | 2 | 3
        };

        // Find subsequent node to unlock
        const nextNodes = allNodes.filter((n) => n.prerequisiteNodeId === nodeId);
        const newUnlocked = Array.from(
          new Set([...state.unlockedNodeIds, ...nextNodes.map((n) => n.id)])
        );

        const baseXP = currentNode?.xpReward || 30;
        const multiplier = mode === "test" ? 3 : 1;
        const xpGained = baseXP * multiplier;
        const gemsGained = mode === "test" ? (currentNode?.gemReward || 5) * 2 : currentNode?.gemReward || 5;

        set({
          completedNodeIds: newCompleted,
          unlockedNodeIds: newUnlocked,
          nodeStars: newStars,
          activeNodeId: nextNodes[0]?.id || state.activeNodeId,
          totalXP: state.totalXP + xpGained,
          barakahGems: state.barakahGems + gemsGained
        });

        get().touchStreak();
      },

      recordWordReview: (wordId: string, grade: SRSRecallGrade) => {
        const state = get();
        const current = state.srsWords[wordId] || {
          wordId,
          masteryLevel: 0,
          repetitionCount: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          lastReviewedAt: new Date().toISOString(),
          nextReviewAt: new Date().toISOString(),
          consecutiveCorrect: 0,
          totalReviews: 0,
          totalMistakes: 0
        };

        // SuperMemo SM-2 Calculation
        let { easeFactor, repetitionCount, intervalDays, consecutiveCorrect, totalMistakes, masteryLevel } = current;

        if (grade >= 3) {
          consecutiveCorrect += 1;
          repetitionCount += 1;
          if (repetitionCount === 1) {
            intervalDays = 1;
          } else if (repetitionCount === 2) {
            intervalDays = 3;
          } else {
            intervalDays = Math.round(intervalDays * easeFactor);
          }
          masteryLevel = Math.min(5, masteryLevel + 1) as MasteryLevel;
        } else {
          consecutiveCorrect = 0;
          repetitionCount = 0;
          intervalDays = 0; // review again within 24h
          totalMistakes += 1;
          masteryLevel = Math.max(0, masteryLevel - 1) as MasteryLevel;
        }

        // Adjust Ease Factor (minimum 1.3)
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

        const now = Date.now();
        const nextReviewDate = new Date(now + intervalDays * 86400000).toISOString();

        const updatedRecord: WordSRSRecord = {
          wordId,
          masteryLevel,
          repetitionCount,
          intervalDays,
          easeFactor: Number(easeFactor.toFixed(2)),
          lastReviewedAt: new Date().toISOString(),
          nextReviewAt: nextReviewDate,
          consecutiveCorrect,
          totalReviews: current.totalReviews + 1,
          totalMistakes
        };

        // Sync SRS recall grade with unified masteredWordIds and reviewWordIds
        let newMastered = state.masteredWordIds || [];
        let newReview = state.reviewWordIds || [];
        if (grade >= 4) {
          newMastered = Array.from(new Set([...newMastered, wordId]));
          newReview = newReview.filter((id) => id !== wordId);
        } else if (grade <= 2) {
          newReview = Array.from(new Set([...newReview, wordId]));
          newMastered = newMastered.filter((id) => id !== wordId);
        }

        set({
          srsWords: {
            ...state.srsWords,
            [wordId]: updatedRecord
          },
          masteredWordIds: newMastered,
          reviewWordIds: newReview
        });
      },

      markWordMastered: (wordId: string) => {
        set((state) => ({
          masteredWordIds: Array.from(new Set([...(state.masteredWordIds || []), wordId])),
          reviewWordIds: (state.reviewWordIds || []).filter((id) => id !== wordId)
        }));
        get().touchStreak();
      },

      markWordForReview: (wordId: string) => {
        set((state) => ({
          reviewWordIds: Array.from(new Set([...(state.reviewWordIds || []), wordId])),
          masteredWordIds: (state.masteredWordIds || []).filter((id) => id !== wordId)
        }));
        get().touchStreak();
      },

      resetWordStatus: (wordId: string) => {
        set((state) => ({
          masteredWordIds: (state.masteredWordIds || []).filter((id) => id !== wordId),
          reviewWordIds: (state.reviewWordIds || []).filter((id) => id !== wordId)
        }));
      },

      saveGameScore: (gameKey: string, score: number, correctCount = 0, questionCount = 0) => {
        const state = get();
        const currentStats = state.gameStats || DEFAULT_GAME_STATS;
        const current = currentStats[gameKey] || {
          gamesPlayed: 0,
          highScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          lastPlayed: ""
        };

        const updatedStats = {
          ...currentStats,
          [gameKey]: {
            gamesPlayed: current.gamesPlayed + 1,
            highScore: Math.max(current.highScore, score),
            totalCorrect: current.totalCorrect + correctCount,
            totalQuestions: current.totalQuestions + questionCount,
            lastPlayed: new Date().toISOString()
          }
        };

        const earnedXP = Math.max(10, score * 5);
        set({
          gameStats: updatedStats,
          totalXP: state.totalXP + earnedXP
        });
        get().touchStreak();
      },

      startSession: (mode: "practice" | "test" | "blitz", node?: SkillNode) => {
        const targetNode = node || get().selectedNode;
        const unitId = targetNode?.unitId || "default_unit";
        const weakWords = get().getWeakWords().map((w) => w.wordId);

        const session = generateSession(mode === "test" ? "test" : "practice", unitId, {
          targetWeakWordIds: weakWords,
          questionCount: mode === "test" ? 15 : mode === "blitz" ? 5 : 8
        });

        set({
          activeSession: session,
          activeSessionMode: mode,
          isModeSelectorOpen: false,
          isReviewVaultOpen: false
        });

        return session;
      },

      endSession: () => {
        set({ activeSession: null, activeSessionMode: null });
      },

      resetLearningProgress: () => {
        set({
          totalXP: 0,
          barakahGems: 0,
          currentStreak: 0,
          lastActiveDate: "",
          hearts: { current: 5, max: 5, lastRegenTimestamp: Date.now() },
          completedNodeIds: [],
          unlockedNodeIds: ["s1_u1_n1"],
          nodeStars: {},
          activeNodeId: "s1_u1_n1",
          srsWords: {},
          masteredWordIds: [],
          reviewWordIds: [],
          gameStats: DEFAULT_GAME_STATS,
          selectedNode: null,
          isModeSelectorOpen: false,
          isReviewVaultOpen: false,
          activeSession: null,
          activeSessionMode: null
        });
      }
    }),
    {
      name: "noor_learning_store_v2",
      partialize: (state) => ({
        totalXP: state.totalXP,
        barakahGems: state.barakahGems,
        currentStreak: state.currentStreak,
        lastActiveDate: state.lastActiveDate,
        hearts: state.hearts,
        completedNodeIds: state.completedNodeIds,
        unlockedNodeIds: state.unlockedNodeIds,
        nodeStars: state.nodeStars,
        activeNodeId: state.activeNodeId,
        srsWords: state.srsWords,
        masteredWordIds: state.masteredWordIds,
        reviewWordIds: state.reviewWordIds,
        gameStats: state.gameStats
      })
    }
  )
);
