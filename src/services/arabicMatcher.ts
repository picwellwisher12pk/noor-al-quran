/**
 * High-performance Arabic text normalization and fuzzy matcher.
 * Ported & enhanced from Quran Verse Identifier sibling project.
 * Matches live speech transcripts or Arabic text against 6,236 Quran verses,
 * with support for phonetic normalization, multi-ayah sliding windows,
 * inverted index indexing for sub-10ms queries, and ambiguity detection.
 */

// Strip diacritics / tashkeel & Quranic annotation marks
const TASHKEEL_REGEX = /[\u0617-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

const ARABIC_DIGITS_MAP: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
};

/**
 * Standard Arabic orthographic normalization
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";

  const stripped = text
    .replace(TASHKEEL_REGEX, "")
    .replace(/[٠-٩]/g, d => ARABIC_DIGITS_MAP[d] || d)
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  // Remove repeated single words or repeated phrase chunks (caused by mobile STT restarts)
  const words = stripped.split(/\s+/);
  const res: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i] !== words[i - 1]) res.push(words[i]);
  }
  for (let n = 4; n >= 2; n--) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i <= res.length - 2 * n; i++) {
        const p1 = res.slice(i, i + n).join(" ");
        const p2 = res.slice(i + n, i + 2 * n).join(" ");
        if (p1 === p2) {
          res.splice(i + n, n);
          changed = true;
          break;
        }
      }
    }
  }
  return res.join(" ");
}

/**
 * Map acoustically/phonetically confusable Arabic consonants to a common key
 * (e.g. non-native recitation slips: ص/س, ط/ت, ظ/ز/ذ, ض/د, ق/ك, ح/ه, ث/س)
 */
export function toPhoneticKey(text: string): string {
  if (!text) return "";
  return text
    .replace(/[سصث]/g, "س")
    .replace(/[ذزظ]/g, "ز")
    .replace(/[تط]/g, "ت")
    .replace(/[دض]/g, "د")
    .replace(/[هح]/g, "ه")
    .replace(/[كق]/g, "ك");
}

/**
 * Fast Levenshtein distance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row: number[] = [];
  for (let i = 0; i <= b.length; i++) row[i] = i;

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

export function stringRatio(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, ((maxLen - dist) / maxLen) * 100);
}

/**
 * Token Set Ratio (similar to RapidFuzz token_set_ratio)
 */
export function tokenSetRatio(str1: string, str2: string): number {
  const set1 = new Set(str1.split(" ").filter(Boolean));
  const set2 = new Set(str2.split(" ").filter(Boolean));

  const intersection: string[] = [];
  for (const s of set1) {
    if (set2.has(s)) intersection.push(s);
  }

  const sInter = intersection.sort().join(" ");
  const sDiff1 = [...set1].filter(x => !set2.has(x)).sort().join(" ");
  const sDiff2 = [...set2].filter(x => !set1.has(x)).sort().join(" ");

  const combined1 = [sInter, sDiff1].filter(Boolean).join(" ");
  const combined2 = [sInter, sDiff2].filter(Boolean).join(" ");

  const r1 = stringRatio(sInter, combined1);
  const r2 = stringRatio(sInter, combined2);
  const r3 = stringRatio(combined1, combined2);

  return Math.max(r1, r2, r3);
}

export interface RawVerseRecord {
  id: number;
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  english_translation: string;
  transliteration: string;
  urdu_translation: string;
  surah_name_arabic: string;
  surah_name_english: string;
  revelation_type: string;
}

export interface MatchCorpusEntry extends RawVerseRecord {
  normalized_text: string;
  phonetic_key: string;
  ayah_start?: number;
  ayah_end?: number;
  ayah_span?: string;
  is_multi_ayah?: boolean;
}

export interface VerseMatchResult {
  verse: {
    id: number | string;
    surah_number: number;
    ayah_number: number;
    ayah_start?: number;
    ayah_end?: number;
    ayah_span?: string;
    arabic_text: string;
    english_translation: string;
    transliteration: string;
    urdu_translation: string;
    surah_name_arabic: string;
    surah_name_english: string;
    revelation_type: string;
    is_multi_ayah?: boolean;
  };
  confidence: number;
  similarity_score: number;
  recognition_source: string;
  is_ambiguous?: boolean;
  ambiguity_reason?: string;
}

export class ArabicMatcher {
  private getAllVersesFn: () => Promise<RawVerseRecord[]>;
  private corpus: MatchCorpusEntry[] = [];
  private multiAyahCorpus: MatchCorpusEntry[] = [];
  private invertedIndex: Map<string, Set<number>> = new Map();
  private multiInvertedIndex: Map<string, Set<number>> = new Map();
  private isInitialized = false;

  constructor(getAllVersesFn: () => Promise<RawVerseRecord[]>) {
    this.getAllVersesFn = getAllVersesFn;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.corpus.length > 0) return;

    const rows = await this.getAllVersesFn();
    this.corpus = [];
    this.invertedIndex.clear();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const normText = normalizeArabic(r.arabic_text);
      const entry: MatchCorpusEntry = {
        ...r,
        normalized_text: normText,
        phonetic_key: toPhoneticKey(normText),
        is_multi_ayah: false,
      };
      this.corpus.push(entry);

      // Index words for fast candidate pruning
      const words = normText.split(" ").filter(w => w.length > 1);
      for (const w of words) {
        if (!this.invertedIndex.has(w)) this.invertedIndex.set(w, new Set());
        this.invertedIndex.get(w)!.add(i);

        const phon = toPhoneticKey(w);
        if (phon !== w) {
          if (!this.invertedIndex.has(phon)) this.invertedIndex.set(phon, new Set());
          this.invertedIndex.get(phon)!.add(i);
        }
      }
    }

    // Build multi-ayah sliding window
    this.multiAyahCorpus = [];
    this.multiInvertedIndex.clear();

    for (let i = 0; i < this.corpus.length - 1; i++) {
      const v1 = this.corpus[i];
      const v2 = this.corpus[i + 1];
      if (v1.surah_number === v2.surah_number) {
        const combinedNorm = `${v1.normalized_text} ${v2.normalized_text}`.trim();
        const multiIdx = this.multiAyahCorpus.length;
        this.multiAyahCorpus.push({
          id: -(v1.id * 10000 + v2.id), // composite numeric id
          surah_number: v1.surah_number,
          ayah_number: v1.ayah_number,
          ayah_start: v1.ayah_number,
          ayah_end: v2.ayah_number,
          ayah_span: `${v1.ayah_number}-${v2.ayah_number}`,
          arabic_text: `${v1.arabic_text} ۝ ${v2.arabic_text}`,
          english_translation: `${v1.english_translation} | ${v2.english_translation}`,
          transliteration: `${v1.transliteration} | ${v2.transliteration}`,
          urdu_translation: `${v1.urdu_translation} | ${v2.urdu_translation}`,
          surah_name_arabic: v1.surah_name_arabic,
          surah_name_english: v1.surah_name_english,
          revelation_type: v1.revelation_type,
          normalized_text: combinedNorm,
          phonetic_key: toPhoneticKey(combinedNorm),
          is_multi_ayah: true,
        });

        // Index multi words
        const words = combinedNorm.split(" ").filter(w => w.length > 1);
        for (const w of words) {
          if (!this.multiInvertedIndex.has(w)) this.multiInvertedIndex.set(w, new Set());
          this.multiInvertedIndex.get(w)!.add(multiIdx);
        }
      }
    }

    this.isInitialized = true;
  }

  calculateSimilarity(
    normQuery: string,
    target: string,
    phoneticQuery = "",
    phoneticTarget = ""
  ): number {
    let score = 0;

    if (normQuery === target) {
      score = 100.0;
    } else if (target.includes(normQuery)) {
      const coverage = normQuery.length / target.length;
      score = 85.0 + (coverage * 15.0);
    } else if (normQuery.includes(target)) {
      const coverage = target.length / normQuery.length;
      score = 85.0 + (coverage * 15.0);
    } else {
      const tokenScore = tokenSetRatio(normQuery, target);
      if (tokenScore > 50) {
        const ratio = stringRatio(normQuery, target);
        score = (tokenScore * 0.6) + (ratio * 0.4);
      } else {
        score = tokenScore * 0.8;
      }

      // Check phonetic fallback boost if standard score is moderate
      if (phoneticQuery && phoneticTarget && score < 85) {
        const phonToken = tokenSetRatio(phoneticQuery, phoneticTarget);
        if (phonToken > score) {
          score = Math.max(score, (score * 0.4) + (phonToken * 0.6));
        }
      }
    }

    return Math.round(Math.min(score / 100.0, 1.0) * 1000) / 1000;
  }

  matchText(query: string, limit = 5, minConfidence = 0.35): VerseMatchResult[] {
    if (!query || !query.trim()) return [];

    const normQuery = normalizeArabic(query.trim());
    if (!normQuery || normQuery.length < 2) return [];

    const phoneticQuery = toPhoneticKey(normQuery);
    const queryWords = normQuery.split(" ").filter(w => w.length > 1);
    const queryWordCount = queryWords.length;
    const candidates: VerseMatchResult[] = [];

    // Pre-filtering candidate verses using inverted index with hit-count weighting
    const hitMap = new Map<number, number>();
    for (const w of queryWords) {
      const direct = this.invertedIndex.get(w);
      if (direct) direct.forEach(idx => hitMap.set(idx, (hitMap.get(idx) || 0) + 1));

      const phon = this.invertedIndex.get(toPhoneticKey(w));
      if (phon) phon.forEach(idx => hitMap.set(idx, (hitMap.get(idx) || 0) + 0.5));
    }

    // Prioritize candidates with highest keyword hits
    let singleIndices: number[] = [];
    if (hitMap.size > 0) {
      singleIndices = Array.from(hitMap.keys()).sort((a, b) => (hitMap.get(b) || 0) - (hitMap.get(a) || 0));
      // Fast path: if we have more than 80 candidates, take top 80
      if (singleIndices.length > 80) {
        singleIndices = singleIndices.slice(0, 80);
      }
    } else {
      singleIndices = this.corpus.map((_, i) => i);
    }

    // 1. Scan single verses
    for (let k = 0; k < singleIndices.length; k++) {
      const entry = this.corpus[singleIndices[k]];
      const target = entry.normalized_text;
      if (!target) continue;

      const confidence = this.calculateSimilarity(normQuery, target, phoneticQuery, entry.phonetic_key);

      if (confidence >= minConfidence) {
        candidates.push({
          verse: {
            id: entry.id,
            surah_number: entry.surah_number,
            ayah_number: entry.ayah_number,
            arabic_text: entry.arabic_text,
            english_translation: entry.english_translation,
            transliteration: entry.transliteration,
            urdu_translation: entry.urdu_translation,
            surah_name_arabic: entry.surah_name_arabic,
            surah_name_english: entry.surah_name_english,
            revelation_type: entry.revelation_type,
            is_multi_ayah: false,
          },
          confidence,
          similarity_score: confidence,
          recognition_source: "speech_recognition",
        });
      }
    }

    // 2. Scan multi-ayah sliding window if query has 3+ words
    if (queryWordCount >= 3) {
      const multiHitMap = new Map<number, number>();
      for (const w of queryWords) {
        const hits = this.multiInvertedIndex.get(w);
        if (hits) hits.forEach(idx => multiHitMap.set(idx, (multiHitMap.get(idx) || 0) + 1));
      }

      let multiIndices: number[] = [];
      if (multiHitMap.size > 0) {
        multiIndices = Array.from(multiHitMap.keys()).sort((a, b) => (multiHitMap.get(b) || 0) - (multiHitMap.get(a) || 0));
        if (multiIndices.length > 60) {
          multiIndices = multiIndices.slice(0, 60);
        }
      }

      for (let k = 0; k < multiIndices.length; k++) {
        const entry = this.multiAyahCorpus[multiIndices[k]];
        const target = entry.normalized_text;
        if (!target) continue;

        const confidence = this.calculateSimilarity(normQuery, target, phoneticQuery, entry.phonetic_key);

        if (confidence >= minConfidence + 0.05) {
          candidates.push({
            verse: {
              id: entry.id,
              surah_number: entry.surah_number,
              ayah_number: entry.ayah_number,
              ayah_start: entry.ayah_start,
              ayah_end: entry.ayah_end,
              ayah_span: entry.ayah_span,
              arabic_text: entry.arabic_text,
              english_translation: entry.english_translation,
              transliteration: entry.transliteration,
              urdu_translation: entry.urdu_translation,
              surah_name_arabic: entry.surah_name_arabic,
              surah_name_english: entry.surah_name_english,
              revelation_type: entry.revelation_type,
              is_multi_ayah: true,
            },
            confidence,
            similarity_score: confidence,
            recognition_source: "speech_recognition_multi_ayah",
          });
        }
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);

    // 3. Mark Ambiguity on Near-Ties (e.g. repeated Quranic phrases)
    if (candidates.length >= 2) {
      const topDiff = Math.abs(candidates[0].confidence - candidates[1].confidence);
      const isDistinctLocation =
        candidates[0].verse.surah_number !== candidates[1].verse.surah_number ||
        candidates[0].verse.ayah_number !== candidates[1].verse.ayah_number;

      if (topDiff <= 0.035 && candidates[0].confidence >= 0.55 && isDistinctLocation) {
        for (let k = 0; k < Math.min(candidates.length, 3); k++) {
          candidates[k].is_ambiguous = true;
          candidates[k].ambiguity_reason = "Repeated phrase or multiple close verses found across Surahs";
        }
      }
    }

    return candidates.slice(0, limit);
  }
}
