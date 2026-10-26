/**
 * Security & Input Sanitization Utilities
 *
 * Validates Quranic keys, audio streams, and search strings against
 * injection, path traversal, and malicious protocols.
 */

const VERSE_KEY_REGEX = /^(?:[1-9]|[1-9][0-9]|10[0-9]|11[0-4]):(?:[1-9]|[1-9][0-9]|[1-2][0-9]{2})$/;
const WORD_ID_REGEX = /^[a-zA-Z0-9_\-\.]{1,64}$/;

const ALLOWED_AUDIO_DOMAINS = new Set([
  "audio.qurancdn.com",
  "verses.quran.com",
  "cdn.islamic.network",
  "everyayah.com",
]);

/**
 * Validates whether a verse key conforms strictly to Surah:Ayah format (e.g. "1:1", "114:6").
 */
export function isValidVerseKey(verseKey: string): boolean {
  if (!verseKey || typeof verseKey !== "string") return false;
  return VERSE_KEY_REGEX.test(verseKey.trim());
}

/**
 * Validates whether a vocabulary or word ID is safe from path traversal or injection.
 */
export function isValidWordId(wordId: string): boolean {
  if (!wordId || typeof wordId !== "string") return false;
  return WORD_ID_REGEX.test(wordId.trim());
}

/**
 * Sanitizes a search query string:
 * - Trims whitespace
 * - Strips control characters
 * - Enforces max length
 */
export function sanitizeSearchQuery(query: string, maxLength = 100): string {
  if (!query || typeof query !== "string") return "";
  // Strip control characters (ASCII 0-31 and 127)
  const cleaned = query.replace(/[\x00-\x1F\x7F]/g, "").trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Validates that an audio URL is safe to load and play in an Audio element:
 * - Must use HTTPS
 * - Must belong to an authorized Quranic audio CDN
 */
export function isSafeAudioUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_AUDIO_DOMAINS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Constructs a safe word pronunciation audio URL from a validated word ID.
 */
export function buildSafeWordAudioUrl(wordId: string): string | null {
  if (!isValidWordId(wordId)) return null;
  return `https://audio.qurancdn.com/wbw/${encodeURIComponent(wordId.trim())}.mp3`;
}
