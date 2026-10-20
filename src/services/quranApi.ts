import { Chapter, Verse, Reciter, Juz, Tafsir, SearchResultItem } from "@/types/quran";

const BASE_URL = "https://api.quran.com/api/v4";
export const AUDIO_CDN_URL = "https://verses.quran.com";
export const WBW_CDN_URL = "https://audio.qurancdn.com";

// In-memory cache for chapters & reciters
let cachedChapters: Chapter[] | null = null;
let cachedReciters: Reciter[] | null = null;
let cachedJuzs: Juz[] | null = null;

export interface TafsirOption {
  id: number;
  name: string;
  author: string;
  language: "english" | "urdu" | "arabic";
  slug: string;
}

export const AVAILABLE_TAFSIRS: TafsirOption[] = [
  // English
  { id: 169, name: "Ibn Kathir (Abridged)", author: "Hafiz Ibn Kathir", language: "english", slug: "en-ibn-kathir" },
  { id: 168, name: "Ma'arif al-Qur'an", author: "Mufti Muhammad Shafi", language: "english", slug: "en-maarif" },
  { id: 817, name: "Tazkirul Quran", author: "Maulana Wahiduddin Khan", language: "english", slug: "en-tazkir" },
  // Urdu
  { id: 160, name: "تفسیر ابن کثیر (اردو)", author: "حافظ ابن کثیر", language: "urdu", slug: "ur-ibn-kathir" },
  { id: 159, name: "بیان القرآن", author: "ڈاکٹر اسرار احمد", language: "urdu", slug: "ur-bayan-ul-quran" },
  { id: 157, name: "فی ظلال القرآن", author: "سید قطب", language: "urdu", slug: "ur-fi-zilal" },
  { id: 818, name: "تذکیر القرآن", author: "مولانا وحید الدین خان", language: "urdu", slug: "ur-tazkir" },
  // Arabic
  { id: 16, name: "التفسير الميسر", author: "المیسر", language: "arabic", slug: "ar-muyassar" },
  { id: 14, name: "تفسير ابن كثير", author: "ابن كثير", language: "arabic", slug: "ar-ibn-kathir" },
  { id: 15, name: "تفسير الطبري", author: "الطبري", language: "arabic", slug: "ar-tabari" },
  { id: 91, name: "تيسير الكريم الرحمن (السعدي)", author: "السعدي", language: "arabic", slug: "ar-saadi" },
  { id: 90, name: "تفسير القرطبي", author: "القرطبي", language: "arabic", slug: "ar-qurtubi" },
];

export interface TranslationOption {
  id: number;
  name: string;
  author: string;
  language: "english" | "urdu";
}

export const AVAILABLE_TRANSLATIONS: TranslationOption[] = [
  // English
  { id: 20, name: "Saheeh International", author: "Saheeh International", language: "english" },
  { id: 85, name: "Abdel Haleem", author: "M.A.S. Abdel Haleem", language: "english" },
  { id: 84, name: "Mufti Taqi Usmani", author: "Taqi Usmani", language: "english" },
  // Urdu
  { id: 234, name: "فاتح محمد جالندھری", author: "Fatah Muhammad Jalandhari", language: "urdu" },
  { id: 97, name: "تفہیم القرآن (مودودی)", author: "Syed Abul Ala Maududi", language: "urdu" },
  { id: 54, name: "مولانا محمد جوناگڑھی", author: "Maulana Muhammad Junagarhi", language: "urdu" },
  { id: 158, name: "بیان القرآن (ڈاکٹر اسرار احمد)", author: "Dr. Israr Ahmad", language: "urdu" },
  { id: 151, name: "شیخ الہند محمود الحسن", author: "Shaykh al-Hind Mahmud al-Hasan", language: "urdu" },
];

export async function fetchChapters(): Promise<Chapter[]> {
  if (cachedChapters && cachedChapters.length > 0) {
    return cachedChapters;
  }
  try {
    const res = await fetch(`${BASE_URL}/chapters?language=en`);
    if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.statusText}`);
    const data = await res.json();
    cachedChapters = data.chapters || [];
    return cachedChapters as Chapter[];
  } catch (err) {
    console.error("fetchChapters error:", err);
    throw err;
  }
}

export async function fetchChapter(chapterId: number | string): Promise<Chapter | null> {
  const chapters = await fetchChapters();
  return chapters.find((c) => c.id === Number(chapterId)) || null;
}

export async function fetchVersesByChapter(
  chapterId: number | string,
  page = 1,
  perPage = 50,
  englishTranslationId = 20, // Saheeh International
  urduTranslationId = 234 // Fatah Muhammad Jalandhari
): Promise<{ verses: Verse[]; pagination: { total_records: number; total_pages: number; current_page: number } }> {
  try {
    const paramsEn = new URLSearchParams({
      language: "en",
      words: "true",
      translations: String(englishTranslationId),
      fields: "text_uthmani,chapter_id,verse_number,verse_key,juz_number,hizb_number,rub_el_hizb_number,page_number",
      word_fields: "verse_key,verse_id,page_number,location,text_uthmani,audio_url",
      page: String(page),
      per_page: String(perPage),
    });

    const paramsUr = new URLSearchParams({
      translations: String(urduTranslationId),
      page: String(page),
      per_page: String(perPage),
    });

    const [resEn, resUr] = await Promise.all([
      fetch(`${BASE_URL}/verses/by_chapter/${chapterId}?${paramsEn.toString()}`),
      fetch(`${BASE_URL}/verses/by_chapter/${chapterId}?${paramsUr.toString()}`),
    ]);

    if (!resEn.ok) throw new Error(`Failed to fetch verses: ${resEn.statusText}`);
    const dataEn = await resEn.json();
    const dataUr = resUr.ok ? await resUr.json() : { verses: [] };

    // Merge Urdu translations into each verse
    const urduMap = new Map<string, any>();
    for (const v of dataUr.verses || []) {
      if (v.translations && v.translations[0]) {
        urduMap.set(v.verse_key, v.translations[0]);
      }
    }

    const mergedVerses: Verse[] = (dataEn.verses || []).map((v: Verse) => {
      const urduTranslation = urduMap.get(v.verse_key);
      const translations = [...(v.translations || [])];
      if (urduTranslation) {
        translations.push(urduTranslation);
      }
      return {
        ...v,
        translations,
      };
    });

    return {
      verses: mergedVerses,
      pagination: dataEn.pagination || { total_records: 0, total_pages: 1, current_page: page },
    };
  } catch (err) {
    console.error("fetchVersesByChapter error:", err);
    throw err;
  }
}

export async function fetchReciters(): Promise<Reciter[]> {
  if (cachedReciters && cachedReciters.length > 0) {
    return cachedReciters;
  }
  try {
    const res = await fetch(`${BASE_URL}/resources/recitations?language=en`);
    if (!res.ok) throw new Error(`Failed to fetch reciters: ${res.statusText}`);
    const data = await res.json();
    cachedReciters = data.recitations || [];
    return cachedReciters as Reciter[];
  } catch (err) {
    console.error("fetchReciters error:", err);
    throw err;
  }
}

export async function fetchChapterAudio(reciterId: number, chapterId: number): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.audio_file?.audio_url || null;
  } catch (err) {
    console.error("fetchChapterAudio error:", err);
    return null;
  }
}

export async function fetchVerseAudioUrl(reciterId: number, verseKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/recitations/${reciterId}/by_ayah/${verseKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    const relativeUrl = data.audio_files?.[0]?.url;
    if (!relativeUrl) return null;
    return relativeUrl.startsWith("http") ? relativeUrl : `${AUDIO_CDN_URL}/${relativeUrl}`;
  } catch (err) {
    console.error("fetchVerseAudioUrl error:", err);
    return null;
  }
}

export async function fetchJuzs(): Promise<Juz[]> {
  if (cachedJuzs && cachedJuzs.length > 0) {
    return cachedJuzs;
  }
  try {
    const res = await fetch(`${BASE_URL}/juzs`);
    if (!res.ok) throw new Error(`Failed to fetch juzs: ${res.statusText}`);
    const data = await res.json();
    const uniqueMap = new Map<number, Juz>();
    for (const j of data.juzs || []) {
      if (!uniqueMap.has(j.juz_number)) {
        uniqueMap.set(j.juz_number, j);
      }
    }
    cachedJuzs = Array.from(uniqueMap.values()).sort((a, b) => a.juz_number - b.juz_number);
    return cachedJuzs;
  } catch (err) {
    console.error("fetchJuzs error:", err);
    throw err;
  }
}

export async function fetchTafsirForAyah(
  tafsirId = 169,
  verseKey: string
): Promise<{ text: string; author: string; name: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    const matchedOption = AVAILABLE_TAFSIRS.find((t) => t.id === tafsirId);
    return {
      text: data.tafsir?.text || "No Tafsir text available for this ayah in the selected commentary.",
      author: data.tafsir?.author_name || matchedOption?.author || "Commentary Author",
      name: matchedOption?.name || "Tafsir",
    };
  } catch (err) {
    console.error("fetchTafsirForAyah error:", err);
    return null;
  }
}

export async function searchQuran(query: string, page = 1): Promise<{ results: SearchResultItem[]; total: number }> {
  if (!query.trim()) return { results: [], total: 0 };
  try {
    const res = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&size=20&page=${page}&language=en`
    );
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    return {
      results: data.search?.results || [],
      total: data.search?.total_results || 0,
    };
  } catch (err) {
    console.error("searchQuran error:", err);
    return { results: [], total: 0 };
  }
}
