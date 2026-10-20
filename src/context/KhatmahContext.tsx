"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { KhatmahPlan } from "@/types/quran";
import {
  TOTAL_QURAN_VERSES,
  getAbsoluteVerseIndex,
  getVerseFromAbsoluteIndex,
  MANZIL_7_DAYS,
} from "@/utils/quranMeta";

interface DailyTargetInfo {
  dayNumber: number;
  totalDays: number;
  dailyQuota: number;
  todayAyahsRead: number;
  todayQuotaCompleted: boolean;
  targetStart: { chapterId: number; verseNumber: number };
  targetEnd: { chapterId: number; verseNumber: number };
  paceStatus: "ahead" | "on_track" | "behind";
  percentageCompleted: number;
  daysRemaining: number;
}

interface KhatmahContextType {
  plan: KhatmahPlan | null;
  targetInfo: DailyTargetInfo | null;
  startKhatmahPlan: (targetDays: number, name?: string) => { success: boolean; message?: string };
  recordReadingProgress: (chapterId: number, verseNumber: number) => void;
  resetKhatmahPlan: () => void;
  markTodayGoalCompleted: () => void;
}

const KhatmahContext = createContext<KhatmahContextType | undefined>(undefined);

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function KhatmahProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<KhatmahPlan | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("naq_khatmah_plan");
      if (saved) {
        setPlan(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load Khatmah plan:", e);
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      if (plan) {
        localStorage.setItem("naq_khatmah_plan", JSON.stringify(plan));
      } else {
        localStorage.removeItem("naq_khatmah_plan");
      }
    } catch (e) {
      console.error("Failed to persist Khatmah plan:", e);
    }
  }, [plan, mounted]);

  // Start or configure a new Khatmah plan with strict minimum 7 days rule
  const startKhatmahPlan = (targetDays: number, name?: string): { success: boolean; message?: string } => {
    if (targetDays < 7) {
      return {
        success: false,
        message: "As per the authentic Prophetic Sunnah (Sahih al-Bukhari 5052), the Quran must not be completed in less than 7 days.",
      };
    }

    const today = getTodayString();
    const newPlan: KhatmahPlan = {
      id: `khatmah_${Date.now()}`,
      name: name || `${targetDays}-Day Khatmah`,
      targetDays,
      startDate: new Date().toISOString(),
      lastReadVerseKey: "1:1",
      lastReadChapterId: 1,
      lastReadAyahNumber: 1,
      completedAyahsCount: 0,
      dailyLogs: { [today]: 0 },
      currentStreak: 1,
      lastActiveDate: today,
      isCompleted: false,
    };

    setPlan(newPlan);
    return { success: true };
  };

  // Record reading progress when an ayah is read or marked
  const recordReadingProgress = (chapterId: number, verseNumber: number) => {
    if (!plan) return;

    const newAbsIndex = getAbsoluteVerseIndex(chapterId, verseNumber);
    const prevAbsIndex = getAbsoluteVerseIndex(plan.lastReadChapterId, plan.lastReadAyahNumber);

    const diff = Math.max(0, newAbsIndex - prevAbsIndex);
    const today = getTodayString();
    const todayLog = (plan.dailyLogs[today] || 0) + diff;

    // Check streak
    let newStreak = plan.currentStreak;
    if (plan.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (plan.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newCompletedCount = Math.min(TOTAL_QURAN_VERSES, Math.max(plan.completedAyahsCount, newAbsIndex));
    const isCompleted = newCompletedCount >= TOTAL_QURAN_VERSES;

    setPlan({
      ...plan,
      lastReadVerseKey: `${chapterId}:${verseNumber}`,
      lastReadChapterId: chapterId,
      lastReadAyahNumber: verseNumber,
      completedAyahsCount: newCompletedCount,
      dailyLogs: {
        ...plan.dailyLogs,
        [today]: todayLog,
      },
      currentStreak: newStreak,
      lastActiveDate: today,
      isCompleted,
    });
  };

  // Mark today's quota as finished
  const markTodayGoalCompleted = () => {
    if (!plan || !targetInfo) return;
    const targetAbs = getAbsoluteVerseIndex(targetInfo.targetEnd.chapterId, targetInfo.targetEnd.verseNumber);
    recordReadingProgress(targetInfo.targetEnd.chapterId, targetInfo.targetEnd.verseNumber);
  };

  const resetKhatmahPlan = () => {
    setPlan(null);
  };

  // Compute live target info derived authentically from the plan
  const targetInfo: DailyTargetInfo | null = React.useMemo(() => {
    if (!plan) return null;

    const startDate = new Date(plan.startDate);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - startDate.getTime());
    const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayNumber = Math.min(plan.targetDays, dayIndex + 1);

    const dailyQuota = Math.ceil(TOTAL_QURAN_VERSES / plan.targetDays);
    const today = getTodayString();
    const todayAyahsRead = plan.dailyLogs[today] || 0;

    // Start & End verses for today's portion
    let targetStart: { chapterId: number; verseNumber: number };
    let targetEnd: { chapterId: number; verseNumber: number };

    if (plan.targetDays === 7 && dayNumber <= 7) {
      const manzil = MANZIL_7_DAYS[dayNumber - 1];
      targetStart = { chapterId: manzil.startChapter, verseNumber: manzil.startAyah };
      targetEnd = { chapterId: manzil.endChapter, verseNumber: manzil.endAyah };
    } else {
      const startAbs = (dayNumber - 1) * dailyQuota + 1;
      const endAbs = Math.min(TOTAL_QURAN_VERSES, dayNumber * dailyQuota);
      targetStart = getVerseFromAbsoluteIndex(startAbs);
      targetEnd = getVerseFromAbsoluteIndex(endAbs);
    }

    const expectedAyahsByToday = dayNumber * dailyQuota;
    let paceStatus: "ahead" | "on_track" | "behind" = "on_track";
    if (plan.completedAyahsCount > expectedAyahsByToday + 50) {
      paceStatus = "ahead";
    } else if (plan.completedAyahsCount < expectedAyahsByToday - 50) {
      paceStatus = "behind";
    }

    const percentageCompleted = Math.min(100, (plan.completedAyahsCount / TOTAL_QURAN_VERSES) * 100);
    const daysRemaining = Math.max(0, plan.targetDays - dayNumber);
    const todayQuotaCompleted = todayAyahsRead >= dailyQuota || plan.completedAyahsCount >= getAbsoluteVerseIndex(targetEnd.chapterId, targetEnd.verseNumber);

    return {
      dayNumber,
      totalDays: plan.targetDays,
      dailyQuota,
      todayAyahsRead,
      todayQuotaCompleted,
      targetStart,
      targetEnd,
      paceStatus,
      percentageCompleted,
      daysRemaining,
    };
  }, [plan]);

  return (
    <KhatmahContext.Provider
      value={{
        plan,
        targetInfo,
        startKhatmahPlan,
        recordReadingProgress,
        resetKhatmahPlan,
        markTodayGoalCompleted,
      }}
    >
      {children}
    </KhatmahContext.Provider>
  );
}

export function useKhatmah() {
  const context = useContext(KhatmahContext);
  if (!context) {
    throw new Error("useKhatmah must be used within a KhatmahProvider");
  }
  return context;
}
