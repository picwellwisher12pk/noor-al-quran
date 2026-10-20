import { Chapter, Verse, Reciter, Juz, Tafsir, SearchResultItem } from "@/types/quran";

const BASE_URL = "https://api.quran.com/api/v4";
export const AUDIO_CDN_URL = "https://verses.quran.com";
export const WBW_CDN_URL = "https://audio.qurancdn.com";

// In-memory cache for chapters & reciters to avoid repeated network hits
let cachedChapters: Chapter[] | null = null;
let cachedReciters: Reciter[] | null = null;
let cachedJuzs: Juz[] | null = null;

export async function fetchChapters(): Promise<Chapter[]> {
  if (cachedChapters && cachedChapters.length > 0) {
    return cachedChapters;
  }
  try {
    const res = await fetch(`${BASE_URL}/chapters?language=en`, {
      next: { revalidate: 86400 }, // Cache for 24h
    });
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
  translationId = 131 // 131 = The Clear Quran (Dr. Mustafa Khattab)
): Promise<{ verses: Verse[]; pagination: { total_records: number; total_pages: number; current_page: number } }> {
  try {
    const params = new URLSearchParams({
      language: "en",
      words: "true",
      translations: String(translationId),
      fields: "text_uthmani,chapter_id,verse_number,verse_key,juz_number,hizb_number,rub_el_hizb_number,page_number",
      word_fields: "verse_key,verse_id,page_number,location,text_uthmani,audio_url",
      page: String(page),
      per_page: String(perPage),
    });

    const res = await fetch(`${BASE_URL}/verses/by_chapter/${chapterId}?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch verses: ${res.statusText}`);
    const data = await res.json();

    return {
      verses: data.verses || [],
      pagination: data.pagination || { total_records: 0, total_pages: 1, current_page: page },
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
    // API returns 60 entries (hizb/juz variations), group by unique juz_number
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

export async function fetchTafsirForAyah(tafsirId = 169, verseKey: string): Promise<{ text: string; author: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.tafsir?.text || "No Tafsir text available for this ayah.",
      author: data.tafsir?.author_name || "Ibn Kathir",
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
