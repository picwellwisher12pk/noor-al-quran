/**
 * Reading Activity & Streak Tracking Service
 * 
 * Authentically records reading progress, verses, chapters, study time,
 * and maintains continuous daily streaks according to real user interactions.
 */

export interface DailyReadingRecord {
  date: string; // "YYYY-MM-DD"
  ayahsRead: number;
  verses: string[]; // e.g. ["1:1", "1:2"]
  chapters: number[]; // e.g. [1, 18]
  wordsStudied: number;
  minutesSpent: number;
  lastUpdated: string;
}

export interface ReadingStreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalAyahsRead: number;
  totalWordsStudied: number;
  totalMinutesSpent: number;
  lastActiveDate: string;
  todayRecord: DailyReadingRecord;
  records: Record<string, DailyReadingRecord>;
}

export interface WeekdayStat {
  dayName: string;
  dayShort: string;
  dayIndex: number; // 0 = Sun, 1 = Mon ...
  ayahsRead: number;
  activeCount: number;
}

export interface MonthlyAggregate {
  monthKey: string; // "YYYY-MM"
  monthName: string;
  year: number;
  ayahsRead: number;
  activeDays: number;
  wordsStudied: number;
  minutesSpent: number;
}

const STORAGE_KEY_ACTIVITY = "naq_reading_activity_v1";

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyRecord(date: string): DailyReadingRecord {
  return {
    date,
    ayahsRead: 0,
    verses: [],
    chapters: [],
    wordsStudied: 0,
    minutesSpent: 0,
    lastUpdated: new Date().toISOString(),
  };
}

function getSafeActivityStore(): {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  records: Record<string, DailyReadingRecord>;
} {
  if (typeof window === "undefined") {
    const today = getTodayString();
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      records: { [today]: createEmptyRecord(today) },
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (!raw) {
      const today = getTodayString();
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: "",
        records: { [today]: createEmptyRecord(today) },
      };
    }
    const parsed = JSON.parse(raw);
    return {
      currentStreak: Number(parsed.currentStreak) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
      lastActiveDate: parsed.lastActiveDate || "",
      records: parsed.records || {},
    };
  } catch (e) {
    console.error("Failed to parse reading activity store:", e);
    const today = getTodayString();
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      records: { [today]: createEmptyRecord(today) },
    };
  }
}

function saveActivityStore(data: {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  records: Record<string, DailyReadingRecord>;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist reading activity store:", e);
  }
}

/**
 * Calculates updated streak when new activity happens today
 */
function updateStreakOnActivity(currentStreak: number, longestStreak: number, lastActiveDate: string): {
  newStreak: number;
  newLongest: number;
} {
  const today = getTodayString();
  if (lastActiveDate === today) {
    // Already active today; streak maintained
    return {
      newStreak: Math.max(1, currentStreak),
      newLongest: Math.max(longestStreak, currentStreak),
    };
  }

  // Check if yesterday was active
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  const yesterdayStr = `${year}-${month}-${day}`;

  let nextStreak = 1;
  if (lastActiveDate === yesterdayStr) {
    nextStreak = currentStreak + 1;
  }

  const nextLongest = Math.max(longestStreak, nextStreak);
  return { newStreak: nextStreak, newLongest: nextLongest };
}

/**
 * Log reading a specific verse (e.g. from reading page or audio playback)
 */
export function logVerseRead(chapterId: number, verseNumber: number, minutesEstimate: number = 0.5): ReadingStreakSummary {
  const store = getSafeActivityStore();
  const today = getTodayString();
  const verseKey = `${chapterId}:${verseNumber}`;

  const currentRec = store.records[today] || createEmptyRecord(today);
  const versesSet = new Set(currentRec.verses);
  const isNewVerse = !versesSet.has(verseKey);
  versesSet.add(verseKey);

  const chaptersSet = new Set(currentRec.chapters);
  chaptersSet.add(chapterId);

  const updatedRec: DailyReadingRecord = {
    ...currentRec,
    ayahsRead: isNewVerse ? currentRec.ayahsRead + 1 : currentRec.ayahsRead,
    verses: Array.from(versesSet),
    chapters: Array.from(chaptersSet),
    minutesSpent: Number((currentRec.minutesSpent + minutesEstimate).toFixed(1)),
    lastUpdated: new Date().toISOString(),
  };

  const { newStreak, newLongest } = updateStreakOnActivity(
    store.currentStreak,
    store.longestStreak,
    store.lastActiveDate
  );

  const updatedStore = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
    records: {
      ...store.records,
      [today]: updatedRec,
    },
  };

  saveActivityStore(updatedStore);
  return loadReadingStreakSummary();
}

/**
 * Log vocabulary study session in Learn Studio
 */
export function logVocabularyStudyActivity(wordsCount: number = 1): ReadingStreakSummary {
  const store = getSafeActivityStore();
  const today = getTodayString();

  const currentRec = store.records[today] || createEmptyRecord(today);
  const updatedRec: DailyReadingRecord = {
    ...currentRec,
    wordsStudied: currentRec.wordsStudied + wordsCount,
    minutesSpent: Number((currentRec.minutesSpent + 0.3).toFixed(1)),
    lastUpdated: new Date().toISOString(),
  };

  const { newStreak, newLongest } = updateStreakOnActivity(
    store.currentStreak,
    store.longestStreak,
    store.lastActiveDate
  );

  const updatedStore = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
    records: {
      ...store.records,
      [today]: updatedRec,
    },
  };

  saveActivityStore(updatedStore);
  return loadReadingStreakSummary();
}

/**
 * Loads current complete summary with authentic stats derived from genuine records
 */
export function loadReadingStreakSummary(): ReadingStreakSummary {
  const store = getSafeActivityStore();
  const today = getTodayString();
  const records = store.records;

  let totalAyahsRead = 0;
  let totalWordsStudied = 0;
  let totalMinutesSpent = 0;
  let totalActiveDays = 0;

  for (const date in records) {
    const rec = records[date];
    if (rec.ayahsRead > 0 || rec.wordsStudied > 0 || rec.minutesSpent > 0) {
      totalActiveDays++;
      totalAyahsRead += rec.ayahsRead;
      totalWordsStudied += rec.wordsStudied;
      totalMinutesSpent += rec.minutesSpent;
    }
  }

  // Check if streak is still valid today or broken
  let activeStreak = store.currentStreak;
  if (store.lastActiveDate && store.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");
    const yesterdayStr = `${year}-${month}-${day}`;

    // If last active was neither today nor yesterday, streak has reset to 0 until next activity
    if (store.lastActiveDate !== yesterdayStr) {
      activeStreak = 0;
    }
  }

  return {
    currentStreak: activeStreak,
    longestStreak: Math.max(store.longestStreak, activeStreak),
    totalActiveDays,
    totalAyahsRead,
    totalWordsStudied,
    totalMinutesSpent: Math.round(totalMinutesSpent),
    lastActiveDate: store.lastActiveDate,
    todayRecord: records[today] || createEmptyRecord(today),
    records,
  };
}

/**
 * Aggregates reading data across weekdays (Sunday through Saturday)
 */
export function getWeekdayReadingStats(records: Record<string, DailyReadingRecord>): WeekdayStat[] {
  const days = [
    { dayName: "Sunday", dayShort: "Sun", dayIndex: 0, ayahsRead: 0, activeCount: 0 },
    { dayName: "Monday", dayShort: "Mon", dayIndex: 1, ayahsRead: 0, activeCount: 0 },
    { dayName: "Tuesday", dayShort: "Tue", dayIndex: 2, ayahsRead: 0, activeCount: 0 },
    { dayName: "Wednesday", dayShort: "Wed", dayIndex: 3, ayahsRead: 0, activeCount: 0 },
    { dayName: "Thursday", dayShort: "Thu", dayIndex: 4, ayahsRead: 0, activeCount: 0 },
    { dayName: "Friday", dayShort: "Fri", dayIndex: 5, ayahsRead: 0, activeCount: 0 },
    { dayName: "Saturday", dayShort: "Sat", dayIndex: 6, ayahsRead: 0, activeCount: 0 },
  ];

  for (const dateStr in records) {
    const rec = records[dateStr];
    if (rec.ayahsRead > 0) {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      if (days[dayOfWeek]) {
        days[dayOfWeek].ayahsRead += rec.ayahsRead;
        days[dayOfWeek].activeCount += 1;
      }
    }
  }

  return days;
}

/**
 * Aggregates reading data across calendar months
 */
export function getMonthlyReadingAggregates(records: Record<string, DailyReadingRecord>): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (const dateStr in records) {
    const rec = records[dateStr];
    if (!rec || (rec.ayahsRead === 0 && rec.wordsStudied === 0)) continue;

    const [y, m] = dateStr.split("-").map(Number);
    const monthKey = `${y}-${String(m).padStart(2, "0")}`;

    let item = map.get(monthKey);
    if (!item) {
      item = {
        monthKey,
        monthName: monthNames[m - 1] || `Month ${m}`,
        year: y,
        ayahsRead: 0,
        activeDays: 0,
        wordsStudied: 0,
        minutesSpent: 0,
      };
      map.set(monthKey, item);
    }

    item.ayahsRead += rec.ayahsRead;
    item.wordsStudied += rec.wordsStudied;
    item.minutesSpent += rec.minutesSpent;
    if (rec.ayahsRead > 0 || rec.wordsStudied > 0) {
      item.activeDays += 1;
    }
  }

  const list = Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return list;
}

/**
 * Reset all reading history (strictly client-side with user confirmation)
 */
export function resetReadingActivityStore(): ReadingStreakSummary {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
  }
  return loadReadingStreakSummary();
}
