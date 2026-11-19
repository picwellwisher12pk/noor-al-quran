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

// ─────────────────────────────────────────────────────────────────────────────
// Authentic Sajdah (Prostration of Recitation / سجدۂ تلاوت) Metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface SajdahVerseData {
  sajdahNumber: number; // 1 to 15
  verseKey: string;     // e.g. "7:206"
  chapterId: number;    // e.g. 7
  verseNumber: number;  // e.g. 206
  juzNumber: number;    // e.g. 9
  hizbNumber: number;
  rukuNumber: number;
  isAgreed: boolean;    // true for the 14 universally agreed upon; false for 22:77 (Shafi'i & Hanbali sunnah)
  arabicSurahName: string;
  englishSurahName: string;
  urduSurahName: string;
  arabicSajdahWord: string;
}

export const SAJDAH_VERSES: Record<string, SajdahVerseData> = {
  "7:206": {
    sajdahNumber: 1,
    verseKey: "7:206",
    chapterId: 7,
    verseNumber: 206,
    juzNumber: 9,
    hizbNumber: 18,
    rukuNumber: 145,
    isAgreed: true,
    arabicSurahName: "الأعراف",
    englishSurahName: "Al-A'raf",
    urduSurahName: "الاعراف",
    arabicSajdahWord: "يَسْجُدُونَ",
  },
  "13:15": {
    sajdahNumber: 2,
    verseKey: "13:15",
    chapterId: 13,
    verseNumber: 15,
    juzNumber: 13,
    hizbNumber: 25,
    rukuNumber: 198,
    isAgreed: true,
    arabicSurahName: "الرعد",
    englishSurahName: "Ar-Ra'd",
    urduSurahName: "الرعد",
    arabicSajdahWord: "يَسْجُدُ",
  },
  "16:50": {
    sajdahNumber: 3,
    verseKey: "16:50",
    chapterId: 16,
    verseNumber: 50,
    juzNumber: 14,
    hizbNumber: 27,
    rukuNumber: 226,
    isAgreed: true,
    arabicSurahName: "النحل",
    englishSurahName: "An-Nahl",
    urduSurahName: "النحل",
    arabicSajdahWord: "يَفْعَلُونَ مَا يُؤْمَرُونَ",
  },
  "17:109": {
    sajdahNumber: 4,
    verseKey: "17:109",
    chapterId: 17,
    verseNumber: 109,
    juzNumber: 15,
    hizbNumber: 30,
    rukuNumber: 247,
    isAgreed: true,
    arabicSurahName: "الإسراء",
    englishSurahName: "Al-Isra",
    urduSurahName: "بنی اسرائیل",
    arabicSajdahWord: "يَخِرُّونَۤ لِلْأَذْقَانِ يَبْكُونَ",
  },
  "19:58": {
    sajdahNumber: 5,
    verseKey: "19:58",
    chapterId: 19,
    verseNumber: 58,
    juzNumber: 16,
    hizbNumber: 31,
    rukuNumber: 263,
    isAgreed: true,
    arabicSurahName: "مريم",
    englishSurahName: "Maryam",
    urduSurahName: "مریم",
    arabicSajdahWord: "خَرُّوا۟ سُجَّدًۭا وَبُكِيًّۭا",
  },
  "22:18": {
    sajdahNumber: 6,
    verseKey: "22:18",
    chapterId: 22,
    verseNumber: 18,
    juzNumber: 17,
    hizbNumber: 33,
    rukuNumber: 284,
    isAgreed: true,
    arabicSurahName: "الحج",
    englishSurahName: "Al-Hajj (First Sajdah)",
    urduSurahName: "الحج (پہلا سجدہ)",
    arabicSajdahWord: "يَسْجُدُ لَهُۥ",
  },
  "22:77": {
    sajdahNumber: 7,
    verseKey: "22:77",
    chapterId: 22,
    verseNumber: 77,
    juzNumber: 17,
    hizbNumber: 34,
    rukuNumber: 293,
    isAgreed: false,
    arabicSurahName: "الحج",
    englishSurahName: "Al-Hajj (Second Sajdah)",
    urduSurahName: "الحج (دوسرا سجدہ)",
    arabicSajdahWord: "وَٱسْجُدُوا۟ وَٱعْبُدُوا۟ رَبَّكُمُ",
  },
  "25:60": {
    sajdahNumber: 8,
    verseKey: "25:60",
    chapterId: 25,
    verseNumber: 60,
    juzNumber: 19,
    hizbNumber: 37,
    rukuNumber: 323,
    isAgreed: true,
    arabicSurahName: "الفرقان",
    englishSurahName: "Al-Furqan",
    urduSurahName: "الفرقان",
    arabicSajdahWord: "وَزَادَهُمْ نُفُورًۭا",
  },
  "27:26": {
    sajdahNumber: 9,
    verseKey: "27:26",
    chapterId: 27,
    verseNumber: 26,
    juzNumber: 19,
    hizbNumber: 38,
    rukuNumber: 341,
    isAgreed: true,
    arabicSurahName: "النمل",
    englishSurahName: "An-Naml",
    urduSurahName: "النمل",
    arabicSajdahWord: "رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ",
  },
  "32:15": {
    sajdahNumber: 10,
    verseKey: "32:15",
    chapterId: 32,
    verseNumber: 15,
    juzNumber: 21,
    hizbNumber: 42,
    rukuNumber: 361,
    isAgreed: true,
    arabicSurahName: "السجدة",
    englishSurahName: "As-Sajdah",
    urduSurahName: "السجدہ",
    arabicSajdahWord: "خَرُّوا۟ سُجَّدًۭا",
  },
  "38:24": {
    sajdahNumber: 11,
    verseKey: "38:24",
    chapterId: 38,
    verseNumber: 24,
    juzNumber: 23,
    hizbNumber: 45,
    rukuNumber: 395,
    isAgreed: true,
    arabicSurahName: "ص",
    englishSurahName: "Sad",
    urduSurahName: "ص",
    arabicSajdahWord: "وَخَرَّ رَاكِعًۭا وَأَنَابَ",
  },
  "41:38": {
    sajdahNumber: 12,
    verseKey: "41:38",
    chapterId: 41,
    verseNumber: 38,
    juzNumber: 24,
    hizbNumber: 48,
    rukuNumber: 419,
    isAgreed: true,
    arabicSurahName: "فصلت",
    englishSurahName: "Fussilat",
    urduSurahName: "فصلت",
    arabicSajdahWord: "وَهُمْ لَا يَسْـَٔمُونَ",
  },
  "53:62": {
    sajdahNumber: 13,
    verseKey: "53:62",
    chapterId: 53,
    verseNumber: 62,
    juzNumber: 27,
    hizbNumber: 53,
    rukuNumber: 472,
    isAgreed: true,
    arabicSurahName: "النجم",
    englishSurahName: "An-Najm",
    urduSurahName: "النجم",
    arabicSajdahWord: "فَٱسْجُدُوا۟ لِلَّهِ وَٱعْبُدُوا۟",
  },
  "84:21": {
    sajdahNumber: 14,
    verseKey: "84:21",
    chapterId: 84,
    verseNumber: 21,
    juzNumber: 30,
    hizbNumber: 59,
    rukuNumber: 529,
    isAgreed: true,
    arabicSurahName: "الانشقاق",
    englishSurahName: "Al-Inshiqaq",
    urduSurahName: "الانشقاق",
    arabicSajdahWord: "لَا يَسْجُدُونَ",
  },
  "96:19": {
    sajdahNumber: 15,
    verseKey: "96:19",
    chapterId: 96,
    verseNumber: 19,
    juzNumber: 30,
    hizbNumber: 60,
    rukuNumber: 543,
    isAgreed: true,
    arabicSurahName: "العلق",
    englishSurahName: "Al-Alaq",
    urduSurahName: "العلق",
    arabicSajdahWord: "وَٱسْجُدْ وَٱقْتَرِب",
  },
};

/**
 * Authentic Prophetic Supplications for Sajdah Tilawat
 */
export const SAJDAH_DUAS = [
  {
    id: "dua-primary",
    titleArabic: "الدعاء المأثور الأول (سجد وجهي)",
    titleEnglish: "Primary Sunnah Supplication",
    titleUrdu: "پہلی مسنون دعا",
    arabic: "سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ، فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ",
    transliteration: "Sajada wajhiya lilladhee khalaqahu wa shaqqa sam'ahu wa basarahu, bihawlihi wa quwwatih, fatabaarak Allaahu ahsanul-khaaliqeen",
    english: "My face fell prostrate before He who created it and brought forth its hearing and sight by His might and power. Blessed is Allah, the Best of creators.",
    urdu: "میرے چہرے نے اس ذات کو سجدہ کیا جس نے اسے پیدا کیا، اور اپنی قوت اور طاقت سے اس کے کان اور آنکھیں بنائیں۔ پس بہت بابرکت ہے اللہ جو سب سے بہترین پیدا کرنے والا ہے۔",
    source: "Sunan at-Tirmidhi (580), Sunan Abi Dawud (1414) - Sahih",
  },
  {
    id: "dua-secondary",
    titleArabic: "دعاء ابن عباس رضي الله عنهما",
    titleEnglish: "Supplication of Ibn Abbas (RA)",
    titleUrdu: "حضرت ابن عباس رضی اللہ عنہما کی دعا",
    arabic: "اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ",
    transliteration: "Allaahumma-ktub lee bihaa 'indaka ajran, wa da' 'annee bihaa wizran, waj'alhaa lee 'indaka dhukhran, wa taqabbalhaa minnee kamaa taqabbaltahaa min 'abdika Daawood",
    english: "O Allah, record for me a reward with You for this prostration, remove a sin from me by it, store it for me as a treasure with You, and accept it from me as You accepted it from Your servant Dawud.",
    urdu: "اے اللہ! میرے لیے اس سجدے کے بدلے اپنے پاس اجر لکھ دے، اس کی وجہ سے میرا گناہ مٹا دے، اسے اپنے پاس میرے لیے ذخیرہ بنا لے، اور اسے مجھ سے قبول فرما جیسا کہ تو نے اپنے بندے داؤد علیہ السلام سے قبول فرمایا تھا۔",
    source: "Sunan at-Tirmidhi (579), Sunan Ibn Majah (1053) - Hasan",
  },
];

/**
 * Step-by-Step Fiqh Guide on performing Sajdah Tilawat
 */
export const SAJDAH_METHOD_GUIDE = {
  english: [
    {
      step: 1,
      title: "Taharah (Wudhu) & Facing Qiblah",
      description: "Ensure ritual purity (wudhu) and face the direction of the Qiblah with proper coverage, just as in prayer.",
    },
    {
      step: 2,
      title: "Takbeer (Without Raising Hands)",
      description: "From standing or sitting position, make the intention in your heart and say 'Allahu Akbar' without raising hands to the ears.",
    },
    {
      step: 3,
      title: "Single Prostration with Supplication",
      description: "Prostrate once on the ground. Say 'Subhana Rabbiyal-A'la' (3 times) and recite the authentic Sunnah supplications above.",
    },
    {
      step: 4,
      title: "Rise with Takbeer",
      description: "Rise from prostration saying 'Allahu Akbar'. According to the majority of scholars, no Tashahhud or Salam is required.",
    },
  ],
  urdu: [
    {
      step: 1,
      title: "طہارت (وضو) اور قبلہ رخ ہونا",
      description: "نماز کی طرح باوضو ہو کر اور ستر پوشی کے ساتھ قبلہ کی طرف رخ کریں۔",
    },
    {
      step: 2,
      title: "تکبیر کہنا (بغیر ہاتھ اٹھائے)",
      description: "کھڑے یا بیٹھے ہوئے دل میں سجدۂ تلاوت کی نیت کر کے ہاتھ اٹھائے بغیر 'اللہ اکبر' کہیں۔",
    },
    {
      step: 3,
      title: "ایک سجدہ اور مسنون دعائیں",
      description: "سجدے میں جا کر کم از کم تین بار 'سُبْحَانَ رَبِّيَ الأَعْلَى' اور مسنون دعائیں خشوع و خضوع کے ساتھ پڑھیں۔",
    },
    {
      step: 4,
      title: "تکبیر کہہ کر سر اٹھانا",
      description: "'اللہ اکبر' کہتے ہوئے سجدے سے اٹھ جائیں۔ جمہور علمائے کرام کے مطابق تشہد اور سلام پھیرنے کی ضرورت نہیں ہے۔",
    },
  ],
};

/**
 * Checks whether a given verseKey is an authentic Sajdah verse
 */
export function isSajdahVerse(verseKey: string): boolean {
  return verseKey in SAJDAH_VERSES;
}

/**
 * Returns SajdahVerseData for a given verseKey or API sajdahNumber
 */
export function getSajdahInfo(verseKey: string, apiSajdahNumber?: number | null): SajdahVerseData | null {
  if (verseKey in SAJDAH_VERSES) {
    return SAJDAH_VERSES[verseKey];
  }
  if (apiSajdahNumber && apiSajdahNumber > 0) {
    const found = Object.values(SAJDAH_VERSES).find((s) => s.sajdahNumber === apiSajdahNumber);
    if (found) return found;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Performed Sajdah Tracking (Persisted in localStorage)
// ─────────────────────────────────────────────────────────────────────────────

const SAJDAH_STORAGE_KEY = "naq_performed_sajdahs";

export function getPerformedSajdahs(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SAJDAH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isSajdahPerformed(verseKey: string): boolean {
  const map = getPerformedSajdahs();
  return Boolean(map[verseKey]);
}

export function toggleSajdahPerformed(verseKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const map = getPerformedSajdahs();
    let isNowDone = false;
    if (map[verseKey]) {
      delete map[verseKey];
      isNowDone = false;
    } else {
      map[verseKey] = Date.now();
      isNowDone = true;
    }
    localStorage.setItem(SAJDAH_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("naq:sajdah-updated", { detail: { verseKey, isNowDone } }));
    return isNowDone;
  } catch {
    return false;
  }
}

