export const TOTAL_QURAN_VERSES = 6236;

export const CHAPTER_VERSE_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6,
];

// Authentic Manzils (7-day portions)
export const MANZIL_7_DAYS = [
  { day: 1, startChapter: 1, startAyah: 1, endChapter: 4, endAyah: 176, title: "Al-Fatihah to An-Nisa (Surahs 1–4)" },
  { day: 2, startChapter: 5, startAyah: 1, endChapter: 9, endAyah: 129, title: "Al-Ma'idah to At-Tawbah (Surahs 5–9)" },
  { day: 3, startChapter: 10, startAyah: 1, endChapter: 16, endAyah: 128, title: "Yunus to An-Nahl (Surahs 10–16)" },
  { day: 4, startChapter: 17, startAyah: 1, endChapter: 25, endAyah: 77, title: "Al-Isra to Al-Furqan (Surahs 17–25)" },
  { day: 5, startChapter: 26, startAyah: 1, endChapter: 36, endAyah: 83, title: "Ash-Shu'ara to Ya-Sin (Surahs 26–36)" },
  { day: 6, startChapter: 37, startAyah: 1, endChapter: 49, endAyah: 18, title: "As-Saffat to Al-Hujurat (Surahs 37–49)" },
  { day: 7, startChapter: 50, startAyah: 1, endChapter: 114, endAyah: 6, title: "Qaf to An-Nas (Surahs 50–114)" },
];

/**
 * Converts a chapterId and verseNumber into a 1-based absolute index (1 to 6236).
 */
export function getAbsoluteVerseIndex(chapterId: number, verseNumber: number): number {
  let count = 0;
  for (let i = 0; i < chapterId - 1; i++) {
    count += CHAPTER_VERSE_COUNTS[i];
  }
  return Math.min(TOTAL_QURAN_VERSES, count + verseNumber);
}

/**
 * Converts a 1-based absolute index (1 to 6236) back to chapterId and verseNumber.
 */
export function getVerseFromAbsoluteIndex(absIndex: number): { chapterId: number; verseNumber: number } {
  let remaining = Math.max(1, Math.min(TOTAL_QURAN_VERSES, absIndex));
  for (let i = 0; i < CHAPTER_VERSE_COUNTS.length; i++) {
    const chapterVerses = CHAPTER_VERSE_COUNTS[i];
    if (remaining <= chapterVerses) {
      return {
        chapterId: i + 1,
        verseNumber: remaining,
      };
    }
    remaining -= chapterVerses;
  }
  return { chapterId: 114, verseNumber: 6 };
}
