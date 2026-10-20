export interface Chapter {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Word {
  id: number;
  position: number;
  audio_url?: string;
  char_type_name: string;
  verse_key: string;
  verse_id: number;
  location: string;
  text_uthmani: string;
  page_number: number;
  line_number: number;
  text: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  words?: Word[];
  translations?: Translation[];
  audio?: {
    url: string;
  };
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface Juz {
  id: number;
  juz_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface Tafsir {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  text?: string;
}

export interface SearchResultItem {
  verse_key: string;
  verse_id: number;
  text: string;
  translations?: Array<{
    name: string;
    text: string;
  }>;
}

export interface Bookmark {
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  chapter_name: string;
  text_uthmani: string;
  translation_text?: string;
  created_at: string;
  note?: string;
}

export interface KhatmahPlan {
  id: string;
  name: string;
  targetDays: number; // strictly >= 7 as per Prophetic tradition
  startDate: string; // ISO string
  lastReadVerseKey: string; // e.g. "1:1"
  lastReadChapterId: number;
  lastReadAyahNumber: number;
  completedAyahsCount: number; // out of 6,236 total Quranic ayahs
  dailyLogs: Record<string, number>; // "YYYY-MM-DD" -> count of ayahs read
  currentStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  isCompleted: boolean;
}

export type ThemeMode = "emerald" | "monochrome" | "parchment";

export interface ReadingPreferences {
  arabicFontSize: number; // 24 to 48
  englishFontSize: number; // 14 to 22
  showTranslation: boolean;
  showTransliteration: boolean;
  showWordByWord: boolean;
  autoScroll: boolean;
  selectedReciterId: number;
  selectedReciterName: string;
}
