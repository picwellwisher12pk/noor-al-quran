/**
 * src/utils/quranWaqfMarks.ts
 *
 * Comprehensive definitions and parsing utilities for Quranic stopping marks
 * (رموز الأوقاف / Tajweed Waqf & Pause Signs).
 */

export type WaqfCategory = "must-stop" | "stop" | "dont-stop" | "optional" | "continue" | "pause" | "special";

export interface WaqfRuleInfo {
  code: string; // Unicode or symbol character
  symbol: string; // Visual symbol representation
  displayGlyph: string; // Standalone base glyph
  nameUrdu: string;
  nameEnglish: string;
  shortAdviceUrdu: string;
  shortAdviceEnglish: string;
  ruleUrdu: string;
  ruleEnglish: string;
  category: WaqfCategory;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconType: "stop" | "dont-stop" | "must-stop" | "optional" | "continue" | "pause" | "special";
}

export const WAQF_RULES_REGISTRY: Record<string, WaqfRuleInfo> = {
  // 1. Waqf Mutlaq (ط / ؕ)
  "\u0615": {
    code: "\u0615",
    symbol: "ؕ",
    displayGlyph: "ط",
    nameUrdu: "وقف مطلق (ط)",
    nameEnglish: "Waqf Mutlaq (Absolute Stop)",
    shortAdviceUrdu: "ٹھہر جائیں (وقف کریں)",
    shortAdviceEnglish: "Stop here (Recommended)",
    ruleUrdu: "یہاں بات مکمل ہو گئی ہے، لہٰذا ٹھہرنا بہتر اور اولیٰ ہے۔ اگلا جملہ نئے سرے سے شروع ہوتا ہے۔",
    ruleEnglish: "Indicates a complete thought or independent sentence. It is strongly recommended to stop here.",
    category: "stop",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    iconType: "stop",
  },
  // 2. Waqf Mamnoo (ۙ / لا)
  "\u06D9": {
    code: "\u06D9",
    symbol: "ۙ",
    displayGlyph: "لا",
    nameUrdu: "وقف ممنوع (لا تقف)",
    nameEnglish: "Waqf Mamnoo (Do Not Stop)",
    shortAdviceUrdu: "نہ ٹھہریں - ملا کر پڑھیں",
    shortAdviceEnglish: "Do not stop - continue reciting",
    ruleUrdu: "یہاں ٹھہرنا منع ہے کیونکہ بات ابھی نامکمل ہے اور ٹھہرنے سے مفہوم بگڑ سکتا ہے۔ اگر سانس ٹوٹ جائے تو پچھلا لفظ دہرا کر پڑھیں۔",
    ruleEnglish: "Do NOT stop here! Continuing is necessary to preserve the correct meaning. If you ran out of breath, backtrack one word.",
    category: "dont-stop",
    badgeBg: "bg-rose-500/10 dark:bg-rose-950/40",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-700 dark:text-rose-300",
    iconType: "dont-stop",
  },
  // 3. Waqf Lazim (ۘ / مـ)
  "\u06D8": {
    code: "\u06D8",
    symbol: "ۘ",
    displayGlyph: "مـ",
    nameUrdu: "وقف لازم (مـ)",
    nameEnglish: "Waqf Lazim (Compulsory Stop)",
    shortAdviceUrdu: "لازماً ٹھہریں (واجب وقف)",
    shortAdviceEnglish: "Must stop here (Mandatory)",
    ruleUrdu: "یہاں ٹھہرنا لازمی اور واجب ہے۔ نہ ٹھہرنے اور ملا کر پڑھنے کی صورت میں کلام کا مطلب اور معنی بدلنے کا شدید اندیشہ ہے۔",
    ruleEnglish: "Compulsory stop. Stopping is mandatory; continuing without stopping might drastically alter the divine meaning.",
    category: "must-stop",
    badgeBg: "bg-amber-500/15 dark:bg-amber-950/50",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-800 dark:text-amber-300",
    iconType: "must-stop",
  },
  // 4. Waqf Ja'iz (ۚ / ج)
  "\u06DA": {
    code: "\u06DA",
    symbol: "ۚ",
    displayGlyph: "ج",
    nameUrdu: "وقف جائز (ج)",
    nameEnglish: "Waqf Ja'iz (Permissible Stop)",
    shortAdviceUrdu: "ٹھہرنا یا چلنا دونوں جائز ہیں",
    shortAdviceEnglish: "Stop or continue (Both allowed)",
    ruleUrdu: "یہاں ٹھہرنا اور ملا کر پڑھنا دونوں برابر جائز اور درست ہیں، کوئی ممانعت نہیں۔",
    ruleEnglish: "Permissible stop. You may stop or continue reciting; both choices are equally valid.",
    category: "optional",
    badgeBg: "bg-sky-500/10 dark:bg-sky-950/40",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-700 dark:text-sky-300",
    iconType: "optional",
  },
  // 5. Al-Waqf Awla (ۗ / قلى)
  "\u06D7": {
    code: "\u06D7",
    symbol: "ۗ",
    displayGlyph: "قلی",
    nameUrdu: "الوقف أولى (قلى)",
    nameEnglish: "Al-Waqf Awla (Stopping is Better)",
    shortAdviceUrdu: "ٹھہرنا زیادہ بہتر ہے",
    shortAdviceEnglish: "Better to stop",
    ruleUrdu: "یہاں سانس توڑ کر ٹھہرنا زیادہ بہتر اور افضل ہے، اگرچہ ملا کر پڑھنا بھی جائز ہے۔",
    ruleEnglish: "Stopping is preferable and better than continuing, though continuing is allowed.",
    category: "stop",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    iconType: "stop",
  },
  // 6. Al-Wasl Awla (ۖ / صلى)
  "\u06D6": {
    code: "\u06D6",
    symbol: "ۖ",
    displayGlyph: "صلے",
    nameUrdu: "الوصل أولى (صلى)",
    nameEnglish: "Al-Wasl Awla (Continuing is Better)",
    shortAdviceUrdu: "ملا کر پڑھنا زیادہ بہتر ہے",
    shortAdviceEnglish: "Better to continue",
    ruleUrdu: "یہاں ملا کر آگے پڑھنا زیادہ بہتر ہے، اگرچہ سانس توڑ کر ٹھہرنا بھی درست ہے۔",
    ruleEnglish: "Continuing to recite without pausing is preferred, though stopping is permissible.",
    category: "continue",
    badgeBg: "bg-cyan-500/10 dark:bg-cyan-950/40",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    iconType: "continue",
  },
  // 7. Mu'anaqah (ۛ / ∴)
  "\u06DB": {
    code: "\u06DB",
    symbol: "ۛ",
    displayGlyph: "∴",
    nameUrdu: "معانقة (ۛ ۛ / ∴)",
    nameEnglish: "Mu'anaqah (Embracing Stop)",
    shortAdviceUrdu: "کسی ایک پر ٹھہریں، دونوں پر نہیں",
    shortAdviceEnglish: "Stop at one mark, not both",
    ruleUrdu: "یہ علامت جوڑے میں دو قریب الفاظ پر آتی ہے۔ کسی ایک جگہ ٹھہریں، دونوں جگہ یا تو نہ ٹھہریں یا صرف کسی ایک پر ٹھہریں۔",
    ruleEnglish: "Occurs in pairs. You may stop at either the first or the second point, but never at both.",
    category: "special",
    badgeBg: "bg-purple-500/10 dark:bg-purple-950/40",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    iconType: "special",
  },
  // 8. Saktah (ۜ / س)
  "\u06DC": {
    code: "\u06DC",
    symbol: "ۜ",
    displayGlyph: "س",
    nameUrdu: "سکتہ (سکتہ لطیفہ)",
    nameEnglish: "Saktah (Silence / Brief Pause)",
    shortAdviceUrdu: "بغیر سانس لیے آواز روکیں",
    shortAdviceEnglish: "Pause voice without breathing",
    ruleUrdu: "سانس توڑے بغیر ذرا سی دیر (دو حرکات کی مقدار) کے لیے آواز کو روکیں اور پھر اگلا کلمہ پڑھیں۔",
    ruleEnglish: "Pause your voice momentarily without breaking your breath, then continue reciting.",
    category: "pause",
    badgeBg: "bg-amber-500/10 dark:bg-amber-950/40",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconType: "pause",
  },
};

// Priority hierarchy when multiple waqf characters appear in one cluster (e.g. ۛۚۖ)
const WAQF_PRIORITY_ORDER = [
  "\u06D8", // لازم (Compulsory)
  "\u06DB", // معانقة (Embracing)
  "\u0615", // مطلق (Absolute)
  "\u06D9", // ممنوع (Do not stop)
  "\u06DC", // سکتہ (Silence)
  "\u06D7", // قلى (Better to stop)
  "\u06DA", // جائز (Permissible)
  "\u06D6", // صلى (Better to continue)
];

// Regex matching ONLY contiguous Quranic stopping mark character clusters
export const WAQF_CLUSTER_REGEX = /([\u0615\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC]+)/g;

const ONLY_WAQF_CHARS_REGEX = /^[\u0615\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC]+$/;

/**
 * Checks if a string consists exclusively of authentic Quranic Waqf symbols
 */
export function isWaqfCluster(str: string): boolean {
  if (!str) return false;
  return ONLY_WAQF_CHARS_REGEX.test(str.trim());
}

/**
 * Identify the primary Waqf rule from a character or contiguous cluster of characters
 * STRICT: Returns non-null ONLY for genuine Waqf clusters, never for regular Arabic words!
 */
export function getWaqfRuleInfo(charOrCluster: string): WaqfRuleInfo | null {
  if (!charOrCluster) return null;
  const trimmed = charOrCluster.trim();

  // STRICT VALIDATION: Must consist ONLY of recognized Waqf characters
  if (!ONLY_WAQF_CHARS_REGEX.test(trimmed)) {
    return null;
  }

  // Direct lookup
  if (WAQF_RULES_REGISTRY[trimmed]) {
    return WAQF_RULES_REGISTRY[trimmed];
  }

  // If cluster has multiple characters (e.g. ۛۚۖ): pick according to priority hierarchy
  for (const code of WAQF_PRIORITY_ORDER) {
    if (trimmed.includes(code) && WAQF_RULES_REGISTRY[code]) {
      return WAQF_RULES_REGISTRY[code];
    }
  }

  // Fallback to first recognized char
  for (const c of trimmed) {
    if (WAQF_RULES_REGISTRY[c]) {
      return WAQF_RULES_REGISTRY[c];
    }
  }

  return null;
}

/**
 * Extract all unique stopping marks present in an Arabic verse string
 */
export function extractWaqfMarksFromVerse(arabicText: string): WaqfRuleInfo[] {
  if (!arabicText) return [];
  const found: WaqfRuleInfo[] = [];
  const seen = new Set<string>();

  for (const char of arabicText) {
    if (WAQF_RULES_REGISTRY[char] && !seen.has(char)) {
      seen.add(char);
      found.push(WAQF_RULES_REGISTRY[char]);
    }
  }

  return found;
}
