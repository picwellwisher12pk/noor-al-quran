/**
 * Authentic Quranic Audio Resolver
 *
 * Provides authoritative, verified audio URLs for verses, word-by-word tokens,
 * vocabulary items, and particles across Noor Al-Quran.
 */

import vocabAudioMap from "@/data/quranVocabAudioMap.json";
import particlesAudioMap from "@/data/particlesAudioMap.json";
import verbExamplesAudioMap from "@/data/verbExamplesAudioMap.json";
import type { Word } from "@/types/quran";
import type { QuranVocabWord } from "@/data/quranVocabularyData";
import type { QuranicVerbExample } from "@/data/learning/quranGrammarData";

export const WBW_CDN_URL = "https://audio.qurancdn.com";
export const VERSES_CDN_URL = "https://verses.quran.com";

const typedVocabMap = vocabAudioMap as Record<string, string>;
const typedParticlesMap = particlesAudioMap as Record<string, string>;
const typedVerbMap = verbExamplesAudioMap as Record<string, string>;

/**
 * Normalizes any raw audio string into a fully qualified, valid URL.
 */
export function normalizeAudioUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. Protocol-relative URL (e.g. "//audio.qurancdn.com/...")
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // 2. Already full HTTPS / HTTP URL
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  // 3. Local absolute path in public directory (e.g. "/audio/alphabet/alif.mp3")
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  // 4. Quran CDN path starting with wbw/ (e.g. "wbw/001_001_001.mp3")
  if (trimmed.startsWith("wbw/")) {
    return `${WBW_CDN_URL}/${trimmed}`;
  }

  // 5. Raw filename or path
  return `${WBW_CDN_URL}/wbw/${trimmed.replace(/^\/+/, "")}`;
}

export type ResolvableWordItem =
  | Word
  | QuranVocabWord
  | QuranicVerbExample
  | {
      id?: string | number;
      word_id?: string | number;
      audioUrl?: string;
      audio_url?: string;
      audio?: { url?: string };
      verse_key?: string;
      position?: number;
      arabic?: string;
      textArabic?: string;
      text_uthmani?: string;
      verseKey?: string;
      location?: string;
      surah?: number;
      ayah?: number;
      sampleAyah?: { surah: number; ayah: number };
    };

/**
 * Resolves the authentic word pronunciation audio URL for any vocabulary word,
 * particle, or Quranic word token.
 */
export function getWordAudioUrl(itemOrId?: string | ResolvableWordItem | null): string | null {
  if (!itemOrId) return null;

  // 1. If passed an ID directly (string)
  if (typeof itemOrId === "string") {
    const id = itemOrId.trim();
    if (typedVocabMap[id]) return typedVocabMap[id];
    if (typedParticlesMap[id]) return typedParticlesMap[id];
    if (typedVerbMap[id]) return typedVerbMap[id];
    return normalizeAudioUrl(id);
  }

  const item = itemOrId as Record<string, unknown>;

  // 2. Direct audioUrl or audio_url property on object
  if (typeof item.audioUrl === "string") {
    const norm = normalizeAudioUrl(item.audioUrl);
    if (norm) return norm;
  }
  if (typeof item.audio_url === "string") {
    const norm = normalizeAudioUrl(item.audio_url);
    if (norm) return norm;
  }

  // 3. Lookup by word ID or arabic in verified authentic maps
  if (typeof item.id === "string" || typeof item.id === "number") {
    const idStr = String(item.id);
    if (typedVocabMap[idStr]) return typedVocabMap[idStr];
    if (typedParticlesMap[idStr]) return typedParticlesMap[idStr];
  }
  if (typeof item.arabic === "string") {
    if (typedVerbMap[item.arabic]) return typedVerbMap[item.arabic];
  }
  if (item.surah && item.ayah && typeof item.arabic === "string") {
    const key = `${item.surah}_${item.ayah}_${item.arabic}`;
    if (typedVerbMap[key]) return typedVerbMap[key];
  }

  // 4. Location string (e.g. "2:255:50")
  if (typeof item.location === "string") {
    const parts = item.location.split(":");
    if (parts.length >= 3) {
      const s = String(Number(parts[0])).padStart(3, "0");
      const a = String(Number(parts[1])).padStart(3, "0");
      const w = String(Number(parts[2])).padStart(3, "0");
      return `${WBW_CDN_URL}/wbw/${s}_${a}_${w}.mp3`;
    }
  }

  // 5. VerseKey and word position
  const vKey = typeof item.verseKey === "string" ? item.verseKey : (typeof item.verse_key === "string" ? item.verse_key : null);
  if (vKey && item.position) {
    const parts = vKey.split(":");
    if (parts.length >= 2) {
      const s = String(Number(parts[0])).padStart(3, "0");
      const a = String(Number(parts[1])).padStart(3, "0");
      const w = String(Number(item.position)).padStart(3, "0");
      return `${WBW_CDN_URL}/wbw/${s}_${a}_${w}.mp3`;
    }
  }

  // 6. SampleAyah fallback: if item has sampleAyah but no explicit word position
  if (item.sampleAyah && typeof item.sampleAyah === "object") {
    const sample = item.sampleAyah as { surah?: number; ayah?: number };
    if (sample.surah && sample.ayah) {
      const s = String(Number(sample.surah)).padStart(3, "0");
      const a = String(Number(sample.ayah)).padStart(3, "0");
      return `${WBW_CDN_URL}/wbw/${s}_${a}_001.mp3`;
    }
  }

  return null;
}

/**
 * Resolves the authentic Ayah recitation audio URL for an Ayah key (e.g. "1:1", "110:3").
 * Defaults to master Qari Mishari Rashid Alafasy.
 */
export function getVerseAudioUrl(verseKeyOrSurah: string | number, ayahNumber?: number): string {
  let surah = 1;
  let ayah = 1;

  if (typeof verseKeyOrSurah === "string" && verseKeyOrSurah.includes(":")) {
    const parts = verseKeyOrSurah.split(":");
    surah = Number(parts[0]) || 1;
    ayah = Number(parts[1]) || 1;
  } else {
    surah = Number(verseKeyOrSurah) || 1;
    ayah = Number(ayahNumber) || 1;
  }

  const sStr = String(surah).padStart(3, "0");
  const aStr = String(ayah).padStart(3, "0");
  return `${VERSES_CDN_URL}/Alafasy/mp3/${sStr}${aStr}.mp3`;
}

/**
 * Safely plays audio for an Arabic word or verse with graceful fallback to SpeechSynthesis.
 */
export function playAudioSafely(
  audioUrl?: string | null,
  fallbackArabicText?: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const resolvedUrl = normalizeAudioUrl(audioUrl);

    if (resolvedUrl) {
      try {
        const audio = new Audio(resolvedUrl);
        audio
          .play()
          .then(() => {
            audio.onended = () => resolve(true);
          })
          .catch(() => {
            // If browser audio blocked or 404, trigger speech synthesis fallback
            speakArabicFallback(fallbackArabicText);
            resolve(false);
          });
        audio.onerror = () => {
          speakArabicFallback(fallbackArabicText);
          resolve(false);
        };
        return;
      } catch {
        speakArabicFallback(fallbackArabicText);
        resolve(false);
      }
    } else {
      speakArabicFallback(fallbackArabicText);
      resolve(false);
    }
  });
}

function speakArabicFallback(arabicText?: string) {
  if (!arabicText || typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(arabicText);
    utter.lang = "ar-SA";
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  } catch {
    // Graceful no-op
  }
}
