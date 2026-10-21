/**
 * Word Translations Service: Fetches authentic multi-language word translations
 * and comparative scholar translations from Quran.com API v4.
 */

export interface WordTranslationItem {
  code: string;
  languageName: string;
  nativeName: string;
  direction: "rtl" | "ltr";
  translation: string;
}

export interface ScholarVerseTranslation {
  resourceId: number;
  authorName: string;
  language: "urdu" | "english";
  text: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "ur", languageName: "Urdu", nativeName: "اردو", direction: "rtl" as const },
  { code: "en", languageName: "English", nativeName: "English", direction: "ltr" as const },
  { code: "fa", languageName: "Persian", nativeName: "فارسی", direction: "rtl" as const },
  { code: "id", languageName: "Indonesian", nativeName: "Bahasa Indonesia", direction: "ltr" as const },
  { code: "tr", languageName: "Turkish", nativeName: "Türkçe", direction: "ltr" as const },
  { code: "bn", languageName: "Bengali", nativeName: "বাংলা", direction: "ltr" as const },
  { code: "hi", languageName: "Hindi", nativeName: "हिन्दी", direction: "ltr" as const },
];

const SCHOLAR_META: Record<number, { author: string; language: "urdu" | "english" }> = {
  158: { author: "Fateh Muhammad Jalandhari (فاتح محمد جالندھری)", language: "urdu" },
  97: { author: "Syed Abul A'la Maududi (تفہیم القرآن - مودودی)", language: "urdu" },
  234: { author: "Muhammad Junagarhi (محمد جوناگڑھی)", language: "urdu" },
  20: { author: "Sahih International", language: "english" },
  84: { author: "Mufti Taqi Usmani", language: "english" },
  85: { author: "M.A.S. Abdel Haleem (Oxford)", language: "english" },
  131: { author: "Dr. Mustafa Khattab (The Clear Quran)", language: "english" },
};

// Caches to avoid redundant network calls
const wordLangsCache = new Map<string, WordTranslationItem[]>();
const ayahScholarCache = new Map<string, ScholarVerseTranslation[]>();

/**
 * Fetches word-by-word translations across 7 authentic languages for a specific word.
 */
export async function getWordMultilingualTranslations(
  verseKey: string,
  wordPosition: number,
  fallbackUrdu?: string,
  fallbackEnglish?: string
): Promise<WordTranslationItem[]> {
  const cacheKey = `${verseKey}:${wordPosition}`;
  if (wordLangsCache.has(cacheKey)) {
    return wordLangsCache.get(cacheKey)!;
  }

  try {
    const promises = SUPPORTED_LANGUAGES.map(async (lang) => {
      // Optimize: if urdu or english already provided in word object, use as fallback
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&language=${lang.code}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const words = data.verse?.words || [];
        const match = words.find((w: any) => w.position === wordPosition);
        const text = match?.translation?.text?.trim() || "";
        return {
          code: lang.code,
          languageName: lang.languageName,
          nativeName: lang.nativeName,
          direction: lang.direction,
          translation: text,
        };
      } catch (e) {
        let fallback = "";
        if (lang.code === "ur" && fallbackUrdu) fallback = fallbackUrdu;
        if (lang.code === "en" && fallbackEnglish) fallback = fallbackEnglish;
        return {
          code: lang.code,
          languageName: lang.languageName,
          nativeName: lang.nativeName,
          direction: lang.direction,
          translation: fallback,
        };
      }
    });

    const results = await Promise.all(promises);
    const valid = results.filter((r) => r.translation.length > 0);
    wordLangsCache.set(cacheKey, valid);
    return valid;
  } catch (err) {
    console.error("Error fetching multilingual word translations:", err);
    return [];
  }
}

/**
 * Fetches comparative scholar translations for the complete Ayah.
 */
export async function getAyahComparativeTranslations(
  verseKey: string
): Promise<ScholarVerseTranslation[]> {
  if (ayahScholarCache.has(verseKey)) {
    return ayahScholarCache.get(verseKey)!;
  }

  try {
    const resourceIds = [158, 97, 234, 20, 84, 85];
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=${resourceIds.join(",")}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawTranslations = data.verse?.translations || [];

    const translations: ScholarVerseTranslation[] = rawTranslations
      .map((t: any) => {
        const meta = SCHOLAR_META[t.resource_id] || {
          author: `Scholar #${t.resource_id}`,
          language: "english" as const,
        };
        // Clean footnote tags e.g. <sup foot_note=195932>1</sup>
        const cleanText = (t.text || "").replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "").trim();
        return {
          resourceId: t.resource_id,
          authorName: meta.author,
          language: meta.language,
          text: cleanText,
        };
      })
      .filter((t: ScholarVerseTranslation) => t.text.length > 0);

    ayahScholarCache.set(verseKey, translations);
    return translations;
  } catch (err) {
    console.error("Error fetching comparative translations:", err);
    return [];
  }
}
