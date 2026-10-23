"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  DailyReadingRecord,
  ReadingStreakSummary,
  loadReadingStreakSummary,
  logVerseRead as serviceLogVerseRead,
  logVocabularyStudyActivity,
  resetReadingActivityStore,
  getTodayString,
} from "@/services/readingActivityService";

interface ReadingActivityContextType {
  summary: ReadingStreakSummary;
  currentStreak: number;
  longestStreak: number;
  totalAyahsRead: number;
  totalWordsStudied: number;
  totalActiveDays: number;
  totalMinutesSpent: number;
  records: Record<string, DailyReadingRecord>;
  todayRecord: DailyReadingRecord;
  logVerseRead: (chapterId: number, verseNumber: number, minutesEstimate?: number) => void;
  logVocabularyStudy: (wordsCount?: number) => void;
  logMinutesSpent: (minutes: number) => void;
  refreshSummary: () => void;
  resetHistory: () => void;
}

const defaultSummary: ReadingStreakSummary = {
  currentStreak: 0,
  longestStreak: 0,
  totalActiveDays: 0,
  totalAyahsRead: 0,
  totalWordsStudied: 0,
  totalMinutesSpent: 0,
  lastActiveDate: "",
  todayRecord: {
    date: getTodayString(),
    ayahsRead: 0,
    verses: [],
    chapters: [],
    wordsStudied: 0,
    minutesSpent: 0,
    lastUpdated: new Date().toISOString(),
  },
  records: {},
};

const ReadingActivityContext = createContext<ReadingActivityContextType | undefined>(undefined);

export function ReadingActivityProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<ReadingStreakSummary>(defaultSummary);
  const [mounted, setMounted] = useState(false);

  const refreshSummary = useCallback(() => {
    const loaded = loadReadingStreakSummary();
    setSummary(loaded);
  }, []);

  useEffect(() => {
    refreshSummary();
    setMounted(true);
  }, [refreshSummary]);

  const logVerseRead = useCallback((chapterId: number, verseNumber: number, minutesEstimate = 0.5) => {
    const updated = serviceLogVerseRead(chapterId, verseNumber, minutesEstimate);
    setSummary(updated);
  }, []);

  const logVocabularyStudy = useCallback((wordsCount = 1) => {
    const updated = logVocabularyStudyActivity(wordsCount);
    setSummary(updated);
  }, []);

  const logMinutesSpent = useCallback((minutes: number) => {
    // If user spent quiet reflection time
    const updated = serviceLogVerseRead(0, 0, minutes);
    setSummary(updated);
  }, []);

  const resetHistory = useCallback(() => {
    const reset = resetReadingActivityStore();
    setSummary(reset);
  }, []);

  const value: ReadingActivityContextType = {
    summary,
    currentStreak: summary.currentStreak,
    longestStreak: summary.longestStreak,
    totalAyahsRead: summary.totalAyahsRead,
    totalWordsStudied: summary.totalWordsStudied,
    totalActiveDays: summary.totalActiveDays,
    totalMinutesSpent: summary.totalMinutesSpent,
    records: summary.records,
    todayRecord: summary.todayRecord,
    logVerseRead,
    logVocabularyStudy,
    logMinutesSpent,
    refreshSummary,
    resetHistory,
  };

  return (
    <ReadingActivityContext.Provider value={value}>
      {children}
    </ReadingActivityContext.Provider>
  );
}

export function useReadingActivity() {
  const context = useContext(ReadingActivityContext);
  if (!context) {
    throw new Error("useReadingActivity must be used within a ReadingActivityProvider");
  }
  return context;
}
