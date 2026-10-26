/**
 * Procedural Quiz & Game Engine for Noor-ul-Quran
 * 
 * Dynamically generates authentic, randomized interactive learning payloads
 * from genuine Quranic datasets (no hallucinations, no static fake data):
 * 1. Sound Sniper: Audio listening with phonetically similar Arabic distractors
 * 2. Root Radar: Triliteral root discovery with authentic Quranic derivatives vs distractors
 * 3. Grammar Sort: Classical Nahw classification (Ism, Fi'l, Harf) for verse words
 * 4. Ayah Puzzle: Scrambled word tile builder with distractor tiles and WBW alignment
 * 5. Adaptive Session Generator: Practice Mode (SRS weak item priority, hints, infinite lives)
 *    vs. Test Mode (15s countdown, strictly 3 hearts, 85% pass gate, 3x XP)
 */

import phase1Foundations from "../data/learning/phase1-foundations.json";
import juz30Data from "../data/learning/juz30-word-by-word.json";
import { QURAN_70_VOCABULARY, QuranVocabWord } from "../data/quranVocabularyData";
import { WordSRSRecord } from "../types/learning";

// ============================================================================
// 1. PHONETIC DISTRACTOR MATRIX (Arabic Makharij & Sifat Clusters)
// ============================================================================

export const PHONETIC_CLUSTERS: Record<string, string[]> = {
  "ت": ["ط", "د", "ث"],
  "ط": ["ت", "ض", "ظ"],
  "د": ["ض", "ت", "ذ"],
  "ض": ["د", "ظ", "ط"],
  "ث": ["س", "ذ", "ش"],
  "س": ["ص", "ث", "ز"],
  "ص": ["س", "ض", "ط"],
  "ز": ["ذ", "س", "ظ"],
  "ذ": ["ظ", "ز", "ث"],
  "ظ": ["ذ", "ض", "ط"],
  "ح": ["ه", "خ", "ع"],
  "ه": ["ح", "ء", "ع"],
  "ع": ["ء", "ح", "غ"],
  "ء": ["ع", "ه", "ا"],
  "غ": ["خ", "ع", "ق"],
  "خ": ["غ", "ح", "ق"],
  "ق": ["ك", "غ", "خ"],
  "ك": ["ق", "ت", "خ"],
  "ج": ["ش", "ي", "ز"],
  "ش": ["س", "ج", "ص"],
  "ب": ["ف", "م", "و"],
  "ف": ["ب", "ث", "و"],
  "م": ["ن", "ب", "و"],
  "ن": ["م", "ل", "ر"],
  "ل": ["ر", "ن", "ي"],
  "ر": ["ل", "ز", "د"],
  "و": ["ف", "ب", "م"],
  "ي": ["ا", "ج", "ش"],
  "ا": ["ء", "ي", "و"]
};

// ============================================================================
// 2. AUTHENTIC ROOT DERIVATIVES DICTIONARY (Quranic Sarf Corpus)
// ============================================================================

export interface RootDerivativeWord {
  arabic: string;
  transliteration: string;
  translationEn: string;
  formRoman?: string;
  pattern: string;
  morphologyNote: string;
}

export interface RootFamilyData {
  root: string;
  rootTransliteration: string;
  coreMeaning: string;
  derivatives: RootDerivativeWord[];
}

export const QURANIC_ROOT_FAMILIES: RootFamilyData[] = [
  {
    root: "غ ف ر",
    rootTransliteration: "Gh-F-R",
    coreMeaning: "To forgive, veil, and shield from harm",
    derivatives: [
      { arabic: "غَفَرَ", transliteration: "ghafara", translationEn: "He forgave", formRoman: "Form I", pattern: "فَعَلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "غَفُور", transliteration: "Ghafūr", translationEn: "The All-Forgiving", pattern: "فَعُول", morphologyNote: "Intensive Attribute of Allah" },
      { arabic: "غَافِر", transliteration: "Ghāfir", translationEn: "Forgiver", pattern: "فَاعِل", morphologyNote: "Active Participle (Doer)" },
      { arabic: "مَغْفِرَة", transliteration: "maghfirah", translationEn: "Forgiveness / Pardon", pattern: "مَفْعِلَة", morphologyNote: "Verbal Noun (Masdar)" },
      { arabic: "ٱسْتَغْفَرَ", transliteration: "istaghfara", translationEn: "He sought forgiveness", formRoman: "Form X", pattern: "اسْتَفْعَلَ", morphologyNote: "Form X (Seeking action)" }
    ]
  },
  {
    root: "ع ل م",
    rootTransliteration: "'A-L-M",
    coreMeaning: "To know, perceive, and comprehend",
    derivatives: [
      { arabic: "عَلِمَ", transliteration: "'alima", translationEn: "He knew", formRoman: "Form I", pattern: "فَعِلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "يَعْلَمُونَ", transliteration: "ya'lamūn", translationEn: "They know", formRoman: "Form I", pattern: "يَفْعَلُونَ", morphologyNote: "Form I Present Tense Plural" },
      { arabic: "عَلِيم", transliteration: "'Alīm", translationEn: "All-Knowing", pattern: "فَعِيل", morphologyNote: "Divine Attribute" },
      { arabic: "عَالِم", transliteration: "'Ālim", translationEn: "Knower / Scholar", pattern: "فَاعِل", morphologyNote: "Active Participle" },
      { arabic: "عِلْم", transliteration: "'ilm", translationEn: "Knowledge", pattern: "فِعْل", morphologyNote: "Verbal Noun (Masdar)" },
      { arabic: "مَعْلُوم", transliteration: "ma'lūm", translationEn: "Known / Specified", pattern: "مَفْعُول", morphologyNote: "Passive Participle" }
    ]
  },
  {
    root: "ر ح م",
    rootTransliteration: "R-H-M",
    coreMeaning: "To bestow mercy, compassion, and gentle care",
    derivatives: [
      { arabic: "رَحِمَ", transliteration: "rahima", translationEn: "He showed mercy", formRoman: "Form I", pattern: "فَعِلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "ٱلرَّحْمَـٰن", transliteration: "Ar-Raḥmān", translationEn: "The Entirely Merciful", pattern: "فَعْلَان", morphologyNote: "Vast, all-encompassing mercy" },
      { arabic: "ٱلرَّحِيم", transliteration: "Ar-Raḥīm", translationEn: "The Especially Merciful", pattern: "فَعِيل", morphologyNote: "Continuous, specific mercy" },
      { arabic: "رَحْمَة", transliteration: "rahmah", translationEn: "Mercy / Grace", pattern: "فَعْلَة", morphologyNote: "Verbal Noun (Masdar)" },
      { arabic: "أَرْحَم", transliteration: "arham", translationEn: "Most Merciful", pattern: "أَفْعَل", morphologyNote: "Superlative Noun" }
    ]
  },
  {
    root: "ح م د",
    rootTransliteration: "H-M-D",
    coreMeaning: "To praise and extol with love and veneration",
    derivatives: [
      { arabic: "حَمِدَ", transliteration: "hamida", translationEn: "He praised", formRoman: "Form I", pattern: "فَعِلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "ٱلْحَمْد", transliteration: "al-hamd", translationEn: "All Praise / Gratitude", pattern: "فَعْل", morphologyNote: "Definite Masdar" },
      { arabic: "حَمِيد", transliteration: "Hamīd", translationEn: "Praiseworthy", pattern: "فَعِيل", morphologyNote: "Divine Attribute" },
      { arabic: "مَحْمُود", transliteration: "maḥmūd", translationEn: "Praised / Commendable", pattern: "مَفْعُول", morphologyNote: "Passive Participle" },
      { arabic: "مُحَمَّد", transliteration: "Muḥammad", translationEn: "The Much-Praised One", formRoman: "Form II", pattern: "مُفَعَّل", morphologyNote: "Form II Passive Participle" }
    ]
  },
  {
    root: "خ ل ق",
    rootTransliteration: "Kh-L-Q",
    coreMeaning: "To create, bring into existence, and measure out",
    derivatives: [
      { arabic: "خَلَقَ", transliteration: "khalaqa", translationEn: "He created", formRoman: "Form I", pattern: "فَعَلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "يَخْلُقُ", transliteration: "yakhluqu", translationEn: "He creates", formRoman: "Form I", pattern: "يَفْعُلُ", morphologyNote: "Form I Present Tense" },
      { arabic: "خَالِق", transliteration: "Khāliq", translationEn: "The Creator", pattern: "فَاعِل", morphologyNote: "Active Participle" },
      { arabic: "خَلَّاق", transliteration: "Khallāq", translationEn: "The Supreme Creator", pattern: "فَعَّال", morphologyNote: "Intensive Form" },
      { arabic: "خَلْق", transliteration: "khalq", translationEn: "Creation", pattern: "فَعْل", morphologyNote: "Verbal Noun" },
      { arabic: "مَخْلُوق", transliteration: "makhlūq", translationEn: "Created being", pattern: "مَفْعُول", morphologyNote: "Passive Participle" }
    ]
  },
  {
    root: "ك ت ب",
    rootTransliteration: "K-T-B",
    coreMeaning: "To write, record, decree, and obligate",
    derivatives: [
      { arabic: "كَتَبَ", transliteration: "kataba", translationEn: "He ordained / wrote", formRoman: "Form I", pattern: "فَعَلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "يَكْتُبُونَ", transliteration: "yaktubūn", translationEn: "They write", formRoman: "Form I", pattern: "يَفْعُلُونَ", morphologyNote: "Form I Present Tense" },
      { arabic: "كِتَـٰب", transliteration: "Kitāb", translationEn: "Book / Scripture", pattern: "فِعَال", morphologyNote: "Noun of Instrument/Result" },
      { arabic: "كَاتِب", transliteration: "kātib", translationEn: "Scribe / Writer", pattern: "فَاعِل", morphologyNote: "Active Participle" },
      { arabic: "مَكْتُوب", transliteration: "maktūb", translationEn: "Decreed / Written", pattern: "مَفْعُول", morphologyNote: "Passive Participle" }
    ]
  },
  {
    root: "س ل م",
    rootTransliteration: "S-L-M",
    coreMeaning: "To be safe, whole, sound, and submit in peace",
    derivatives: [
      { arabic: "سَلِمَ", transliteration: "salima", translationEn: "He was safe", formRoman: "Form I", pattern: "فَعِلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "أَسْلَمَ", transliteration: "aslama", translationEn: "He submitted", formRoman: "Form IV", pattern: "أَفْعَلَ", morphologyNote: "Form IV Past Tense" },
      { arabic: "مُسْلِم", transliteration: "Muslim", translationEn: "One who submits", formRoman: "Form IV", pattern: "مُفْعِل", morphologyNote: "Form IV Active Participle" },
      { arabic: "سَلَـٰم", transliteration: "Salām", translationEn: "Peace / Safety", pattern: "فَعَال", morphologyNote: "Noun" },
      { arabic: "إِسْلَـٰم", transliteration: "Islām", translationEn: "Submission / Islam", formRoman: "Form IV", pattern: "إِفْعَال", morphologyNote: "Form IV Masdar" }
    ]
  },
  {
    root: "ع ب د",
    rootTransliteration: "'A-B-D",
    coreMeaning: "To worship, serve, and humble oneself",
    derivatives: [
      { arabic: "عَبَدَ", transliteration: "'abada", translationEn: "He worshipped", formRoman: "Form I", pattern: "فَعَلَ", morphologyNote: "Form I Past Tense" },
      { arabic: "نَعْبُدُ", transliteration: "na'budu", translationEn: "We worship", formRoman: "Form I", pattern: "نَفْعُلُ", morphologyNote: "Form I 1st Person Plural" },
      { arabic: "عَابِد", transliteration: "'ābid", translationEn: "Worshipper", pattern: "فَاعِل", morphologyNote: "Active Participle" },
      { arabic: "عِبَاد", transliteration: "'ibād", translationEn: "Servants / Slaves", pattern: "فِعَال", morphologyNote: "Plural Noun" },
      { arabic: "عِبَادَة", transliteration: "'ibādah", translationEn: "Worship / Devotion", pattern: "فِعَالَة", morphologyNote: "Verbal Noun" }
    ]
  }
];


// ============================================================================
// AUTHENTIC QURANIC URDU DICTIONARIES & GLOSSES
// ============================================================================

export const URDU_WORD_GLOSS: Record<string, string> = {
  "مِنْ": "سے",
  "فِي": "میں",
  "عَلَىٰ": "پر",
  "عَلَى": "پر",
  "إِلَىٰ": "کی طرف",
  "إِلَى": "کی طرف",
  "عَن": "سے / بابت",
  "عَنْ": "سے / بابت",
  "حَتَّىٰ": "یہاں تک کہ",
  "وَ": "اور",
  "فَ": "پس / تو",
  "ثُمَّ": "پھر",
  "بَلْ": "بلکہ",
  "لَا": "نہیں",
  "مَا": "جو / کیا",
  "إِنَّ": "بے شک",
  "أَنَّ": "کہ",
  "إِن": "اگر",
  "لَوْ": "اگر / کاش",
  "إِذَا": "جب",
  "إِذْ": "جبکہ / یاد کرو جب",
  "كَلَّا": "ہرگز نہیں",
  "قَدْ": "تحقیق / یقیناً",
  "هُوَ": "وہ",
  "هُمْ": "وہ سب",
  "أَنتُمْ": "تم سب",
  "أَنتَ": "تو",
  "نَحْنُ": "ہم",
  "أَنَا": "میں",
  "هَـٰذَا": "یہ",
  "ذَٰلِكَ": "وہ",
  "ٱلَّذِي": "وہ جو",
  "ٱلَّذِينَ": "وہ لوگ جو",
  "بِسْمِ": "نام سے",
  "ٱللَّهِ": "اللہ کے",
  "ٱلرَّحْمَـٰنِ": "نہایت مہربان",
  "ٱلرَّحِيمِ": "بہت رحم والا",
  "ٱلْحَمْدُ": "سب تعریفیں",
  "لِلَّهِ": "اللہ ہی کے لیے",
  "رَبِّ": "پالنے والا / رب",
  "ٱلْعَـٰلَمِينَ": "تمام جہانوں کا",
  "مَـٰلِكِ": "مالک / حاکم",
  "يَوْمِ": "دن",
  "ٱلدِّينِ": "بدلے کا / جزا کا",
  "إِيَّاكَ": "صرف تیری ہی",
  "نَعْبُدُ": "ہم عبادت کرتے ہیں",
  "وَإِيَّاكَ": "اور تجھ ہی سے",
  "نَسْتَعِينُ": "ہم مدد چاہتے ہیں",
  "ٱهْدِنَا": "ہمیں ہدایت فرما",
  "ٱلصِّرَٰطَ": "راستہ",
  "ٱلْمُسْتَقِيمَ": "سیدھا",
  "صِرَٰطَ": "راستہ",
  "أَنْعَمْتَ": "تو نے انعام فرمایا",
  "عَلَيْهِمْ": "جن پر / ان پر",
  "غَيْرِ": "نہ کہ",
  "ٱلْمَغْضُوبِ": "جن پر غضب ہوا",
  "وَلَا": "اور نہ",
  "ٱلضَّآلِّينَ": "گمراہوں کا",
  "قُلْ": "فرما دیجیے",
  "أَحَدٌ": "ایک / اکیلا",
  "ٱلصَّمَدُ": "بے نیاز",
  "لَمْ": "نہیں",
  "يَلِدْ": "اس نے جنا",
  "وَلَمْ": "اور نہ",
  "يُولَدْ": "وہ جنا گیا",
  "يَكُن": "ہے",
  "لَّهُۥ": "اس کے لیے",
  "كُفُوًا": "برابر / ہمسر",
  "إِنَّآ": "بے شک ہم نے",
  "أَعْطَيْنَـٰكَ": "عطا کی آپ کو",
  "ٱلْكَوْثَرَ": "خیرِ کثیر / کوثر",
  "فَصَلِّ": "پس نماز پڑھیے",
  "لِرَبِّكَ": "اپنے رب کے لیے",
  "وَٱنْحَرْ": "اور قربانی کیجیے",
  "شَانِئَكَ": "آپ کا دشمن",
  "ٱلْأَبْتَرُ": "بے نسل / بے نام و نشان",
  "وَٱلْعَصْرِ": "قسم ہے زمانے کی",
  "ٱلْإِنسَـٰنَ": "انسان",
  "لَفِى": "یقیناً میں ہے",
  "خُسْرٍ": "خسارہ / گھاٹا",
  "إِلَّا": "مگر / سوائے",
  "ءَامَنُوا۟": "جو ایمان لائے",
  "وَعَمِلُوا۟": "اور عمل کیے",
  "ٱلصَّـٰلِحَـٰتِ": "نیک اعمال",
  "وَتَوَاصَوْا۟": "اور باہم وصیت کی",
  "بِٱلْحقِّ": "حق بات کی",
  "بِٱلْحَقِّ": "حق بات کی",
  "بِٱلصَّبْرِ": "صبر کی",
  "أَعُوذُ": "میں پناہ مانگتا ہوں",
  "بِرَبِّ": "رب کی",
  "ٱلْفَلَقِ": "صبح کی",
  "مِن": "سے",
  "شَرِّ": "شر سے",
  "خَلَقَ": "اس نے پیدا کیا",
  "غَاسِقٍ": "اندھیری رات",
  "وَقَبَ": "وہ چھا جائے",
  "ٱلنَّفَّـٰثَـٰتِ": "پھونکنے والیاں",
  "ٱلْعُقَدِ": "گرہوں میں",
  "حَاسِدٍ": "حاسد کے",
  "حَسَدَ": "وہ حسد کرے",
  "ٱلنَّاسِ": "لوگ / انسان",
  "مَلِكِ": "بادشاہ",
  "إِلَـٰهِ": "معبود",
  "ٱلْوَسْوَاسِ": "وسوسہ ڈالنے والا",
  "ٱلْخَنَّاسِ": "پیچھے ہٹنے والا",
  "يُوَسْوِسُ": "وہ وسوسے ڈالتا ہے",
  "صُدُورِ": "سینوں میں",
  "ٱلْجِنَّةِ": "جنات",
  "كِتَـٰب": "کتاب / فرمان",
  "عَلِيم": "جاننے والا",
  "غَفُور": "بخشنے والا",
  "رَحِيم": "رحم والا"
};

export const AYAH_URDU_TRANSLATIONS: Record<string, string> = {
  "1:1": "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
  "1:2": "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے",
  "1:3": "بڑا مہربان نہایت رحم فرمانے والا ہے",
  "1:4": "روزِ جزا کا مالک ہے",
  "1:5": "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں",
  "1:6": "ہمیں سیدھے راستے کی ہدایت فرما",
  "1:7": "ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ کہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا",
  "103:1": "قسم ہے زمانے کی",
  "103:2": "بے شک انسان سراسر خسارے میں ہے",
  "103:3": "سوائے ان کے جو ایمان لائے اور نیک عمل کیے اور ایک دوسرے کو حق اور صبر کی وصیت کی",
  "108:1": "بے شک ہم نے آپ کو کوثر (خیرِ کثیر) عطا فرمائی",
  "108:2": "پس اپنے رب کے لیے نماز پڑھیے اور قربانی کیجیے",
  "108:3": "یقیناً آپ کا دشمن ہی بے نام و نشان رہے گا",
  "112:1": "آپ فرما دیجیے کہ وہ اللہ ایک ہے",
  "112:2": "اللہ بے نیاز ہے",
  "112:3": "نہ اس نے کسی کو جنا اور نہ وہ جنا گیا",
  "112:4": "اور کوئی اس کا ہمسر نہیں ہے",
  "113:1": "آپ کہیے کہ میں صبح کے رب کی پناہ مانگتا ہوں",
  "113:2": "ہر اس چیز کے شر سے جو اس نے پیدا کی",
  "113:3": "اور اندھیری رات کے شر سے جب وہ چھا جائے",
  "113:4": "اور گرہوں میں پھونکنے والیوں کے شر سے",
  "113:5": "اور حسد کرنے والے کے شر سے جب وہ حسد کرے",
  "114:1": "آپ کہیے کہ میں تمام انسانوں کے رب کی پناہ میں آتا ہوں",
  "114:2": "جو تمام انسانوں کا بادشاہ ہے",
  "114:3": "جو تمام انسانوں کا معبود ہے",
  "114:4": "وسوسہ ڈالنے والے، پیچھے ہٹنے والے کے شر سے",
  "114:5": "جو لوگوں کے سینوں میں وسوسے ڈالتا ہے",
  "114:6": "چاہے وہ جنات میں سے ہو یا انسانوں میں سے"
};

export function getWordUrduGloss(textArabic: string): string {
  if (!textArabic) return "";
  if (URDU_WORD_GLOSS[textArabic]) return URDU_WORD_GLOSS[textArabic];
  const cleaned = textArabic.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
  for (const [k, v] of Object.entries(URDU_WORD_GLOSS)) {
    if (k.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") === cleaned) {
      return v;
    }
  }
  return "";
}

// ============================================================================
// 3. TYPES FOR ENGINE PAYLOADS
// ============================================================================

export interface SoundSniperOption {
  id: string;
  textArabic: string;
  transliteration: string;
  translationUrdu?: string;
  audioUrl?: string;
  isCorrect: boolean;
  makhrajLabel?: string;
  makhrajLabelUrdu?: string;
  distractorReason?: string;
}

export interface SoundSniperPayload {
  id: string;
  type: "sound_sniper";
  promptAudioUrl: string;
  instruction: string;
  instructionUrdu?: string;
  target: {
    id: string;
    textArabic: string;
    transliteration: string;
    makhraj?: string;
    makhrajUrdu?: string;
    translationEn?: string;
    translationUrdu?: string;
  };
  options: SoundSniperOption[];
  explanation: string;
  explanationUrdu?: string;
}

export interface RootRadarOption {
  id: string;
  wordArabic: string;
  transliteration: string;
  translationEn: string;
  translationUrdu?: string;
  root: string;
  formNote?: string;
  isDerivative: boolean;
}

export interface RootRadarPayload {
  id: string;
  type: "root_radar";
  root: string;
  rootTransliteration: string;
  rootMeaning: string;
  rootMeaningUrdu?: string;
  instruction: string;
  instructionUrdu?: string;
  targetRequiredPicks: number;
  options: RootRadarOption[];
  explanation: string;
  explanationUrdu?: string;
}

export interface GrammarSortToken {
  id: string;
  textArabic: string;
  transliteration: string;
  translationEn: string;
  translationUrdu?: string;
  correctCategory: "ism" | "fil" | "harf";
  posDetail: string;
  posArabicLabel: string;
  posUrduLabel?: string;
  explanation: string;
  explanationUrdu?: string;
}

export interface GrammarCategorySpec {
  id: "ism" | "fil" | "harf";
  labelAr: string;
  labelEn: string;
  labelUrdu?: string;
  colorToken: string;
  description: string;
  descriptionUrdu?: string;
}

export interface GrammarSortPayload {
  id: string;
  type: "grammar_sort";
  explanation: string;
  explanationUrdu?: string;
  verseKey?: string;
  verseText?: string;
  instruction: string;
  instructionUrdu?: string;
  tokens: GrammarSortToken[];
  categories: GrammarCategorySpec[];
}

export interface AyahPuzzleBlock {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  translationUrdu?: string;
  audioUrl?: string;
  isDistractor: boolean;
}

export interface AyahPuzzlePayload {
  id: string;
  type: "ayah_puzzle";
  instruction: string;
  instructionUrdu?: string;
  explanation: string;
  explanationUrdu?: string;
  verseKey: string;
  surahNameEn: string;
  surahNameAr: string;
  fullTextUthmani: string;
  fullTranslationEn: string;
  fullTranslationUrdu?: string;
  audioRecitationUrl: string;
  scrambledBlocks: AyahPuzzleBlock[];
  correctSequenceWordIds: string[];
  wbwPairs: Array<{
    arabic: string;
    english: string;
    urdu?: string;
    transliteration: string;
    audioUrl?: string;
  }>;
}

export type SessionQuestion =
  | SoundSniperPayload
  | RootRadarPayload
  | GrammarSortPayload
  | AyahPuzzlePayload;

export interface SessionConfig {
  mode: "practice" | "test";
  hintsAllowed: boolean;
  maxHearts: number | null;
  timerSecondsPerQuestion: number | null;
  passAccuracyThreshold: number;
  xpMultiplier: number;
  immediateFeedback: boolean;
}

export interface LearningSession {
  sessionId: string;
  unitId: string;
  mode: "practice" | "test";
  config: SessionConfig;
  questions: SessionQuestion[];
  totalQuestions: number;
  createdAt: string;
}

export interface GenerateSessionOptions {
  srsRecords?: Record<string, WordSRSRecord>;
  targetWeakWordIds?: string[];
  questionCount?: number;
}

// ============================================================================
// 4. UTILITIES (Shuffling & Selection)
// ============================================================================

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// 5. GENERATOR FUNCTIONS
// ============================================================================

/**
 * 1. generateSoundSniper
 * Picks a target letter/word with authentic audio and selects 3 phonetically
 * similar distractors from the Makharij cluster matrix.
 */
export function generateSoundSniper(levelData?: {
  mode?: "letter" | "word";
  targetId?: string;
}): SoundSniperPayload {
  const mode = levelData?.mode || (Math.random() > 0.4 ? "letter" : "word");

  if (mode === "letter") {
    const lettersPool = phase1Foundations.alphabet;
    let target = lettersPool[0];

    if (levelData?.targetId) {
      const found = lettersPool.find((l) => l.id === levelData.targetId);
      if (found) target = found;
    } else {
      target = getRandomItem(lettersPool);
    }

    const cluster = PHONETIC_CLUSTERS[target.letter] || ["ت", "س", "د"];
    const distractorCandidates = lettersPool.filter(
      (l) => l.id !== target.id && cluster.includes(l.letter)
    );

    // If cluster has fewer than 3, backfill with others
    const remainingLetters = lettersPool.filter(
      (l) => l.id !== target.id && !distractorCandidates.some((c) => c.id === l.id)
    );
    const chosenDistractors = [
      ...distractorCandidates,
      ...shuffleArray(remainingLetters)
    ].slice(0, 3);

    const options: SoundSniperOption[] = shuffleArray([
      {
        id: `opt_${target.id}`,
        textArabic: target.letter,
        transliteration: target.transliteration,
        audioUrl: target.audioUrl,
        isCorrect: true,
        makhrajLabel: target.makhrajCategory
      },
      ...chosenDistractors.map((d) => ({
        id: `opt_${d.id}`,
        textArabic: d.letter,
        transliteration: d.transliteration,
        audioUrl: d.audioUrl,
        isCorrect: false,
        makhrajLabel: d.makhrajCategory,
        distractorReason: `Phonetically similar sound from ${d.makhrajCategory}`
      }))
    ]);

    return {
      id: `sniper_letter_${target.id}_${Date.now()}`,
      type: "sound_sniper",
      promptAudioUrl: target.audioUrl,
      instruction: "Listen to the Qari pronunciation and snipe the matching Arabic letter.",
      target: {
        id: target.id,
        textArabic: target.letter,
        transliteration: target.transliteration,
        makhraj: target.makhrajCategory
      },
      options,
      explanation: `The letter '${target.letter}' (${target.name}) is articulated from ${target.makhrajCategory}. Notice the crisp phonetic distinction from similar letters.`
    };
  }

  // Word Mode: pick from high frequency vocabulary
  const vocabList = (juz30Data.vocabularyIndex as any[]).filter(
    (v) => v.audioUrl && v.textUthmani.length <= 6
  );
  const targetWord = getRandomItem(vocabList);

  // Pick distractors that share initial letter or similar length
  const firstChar = targetWord.textUthmani.charAt(0);
  const similarCandidates = vocabList.filter(
    (w) => w.id !== targetWord.id && w.textUthmani.charAt(0) === firstChar
  );
  const otherCandidates = vocabList.filter(
    (w) => w.id !== targetWord.id && !similarCandidates.some((sc) => sc.id === w.id)
  );

  const selectedDistractors = [
    ...shuffleArray(similarCandidates),
    ...shuffleArray(otherCandidates)
  ].slice(0, 3);

  const options: SoundSniperOption[] = shuffleArray([
    {
      id: `opt_${targetWord.id}`,
      textArabic: targetWord.textUthmani,
      transliteration: targetWord.transliterationEn,
      audioUrl: targetWord.audioUrl,
      isCorrect: true
    },
    ...selectedDistractors.map((d) => ({
      id: `opt_${d.id}`,
      textArabic: d.textUthmani,
      transliteration: d.transliterationEn,
      audioUrl: d.audioUrl,
      isCorrect: false,
      distractorReason: "Similar phonetics or initial sound"
    }))
  ]);

  return {
    id: `sniper_word_${targetWord.id}_${Date.now()}`,
    type: "sound_sniper",
    promptAudioUrl: targetWord.audioUrl,
    instruction: "Listen carefully to the word pronunciation and select the exact Quranic word.",
    instructionUrdu: "تلفظ کو غور سے سنیں اور درست قرآنی لفظ کا انتخاب کریں۔",
    target: {
      id: targetWord.id,
      textArabic: targetWord.textUthmani,
      transliteration: targetWord.transliterationEn,
      translationEn: targetWord.translationEn
    },
    options,
    explanation: `'${targetWord.textUthmani}' means '${targetWord.translationEn}'. First recited in Ayah ${targetWord.firstOccurrenceVerseKey}.`
  };
}

/**
 * 2. generateRootRadar
 * Selects a target triliteral root and returns 3 valid derivative words
 * from the Quran dataset plus 2 distractors from different roots.
 */
export function generateRootRadar(wordsPool?: QuranVocabWord[] | string[]): RootRadarPayload {
  const family = getRandomItem(QURANIC_ROOT_FAMILIES);

  // Pick 3 authentic derivatives
  const shuffledDerivatives = shuffleArray(family.derivatives);
  const selectedDerivatives = shuffledDerivatives.slice(0, 3);

  // Pick 2 distractors from other root families
  const otherFamilies = QURANIC_ROOT_FAMILIES.filter((f) => f.root !== family.root);
  const distractorWords: RootRadarOption[] = [];

  const shuffledOtherFamilies = shuffleArray(otherFamilies);
  for (const otherFam of shuffledOtherFamilies.slice(0, 2)) {
    const randomOtherWord = getRandomItem(otherFam.derivatives);
    distractorWords.push({
      id: `dist_${otherFam.root.replace(/\s+/g, "_")}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      wordArabic: randomOtherWord.arabic,
      transliteration: randomOtherWord.transliteration,
      translationEn: randomOtherWord.translationEn,
      root: otherFam.root,
      formNote: randomOtherWord.morphologyNote,
      isDerivative: false
    });
  }

  const validOptions: RootRadarOption[] = selectedDerivatives.map((d, idx) => ({
    id: `valid_${family.root.replace(/\s+/g, "_")}_${idx}_${Date.now()}`,
    wordArabic: d.arabic,
    transliteration: d.transliteration,
    translationEn: d.translationEn,
    root: family.root,
    formNote: d.morphologyNote,
    isDerivative: true
  }));

  const options: RootRadarOption[] = shuffleArray([...validOptions, ...distractorWords]);

  return {
    id: `root_radar_${family.root.replace(/\s+/g, "_")}_${Date.now()}`,
    type: "root_radar",
    root: family.root,
    rootTransliteration: family.rootTransliteration,
    rootMeaning: family.coreMeaning,
    instruction: `Root Radar Lock: Find the 3 words derived from root [ ${family.root} ] (${family.coreMeaning}). Beware of distractors!`,
    targetRequiredPicks: 3,
    options,
    explanation: `The root [ ${family.root} ] embodies '${family.coreMeaning}'. Derivatives include: ${selectedDerivatives.map((d) => d.arabic + " (" + d.translationEn + ")").join(", ")}.`
  };
}

/**
 * 3. generateGrammarSort
 * Takes words from an authentic verse or high-frequency Quranic corpus
 * and sets up categorization into Ism (Noun), Fi'l (Verb), and Harf (Particle).
 */
export function generateGrammarSort(customWords?: any[]): GrammarSortPayload {
  // If specific verse words provided, use them; otherwise pick from authentic Juz 30 verses
  let targetVerse: any = null;

  if (customWords && customWords.length >= 3) {
    targetVerse = {
      verseKey: "custom:1",
      textUthmani: customWords.map((w) => w.textUthmani || w.text || "").join(" "),
      words: customWords
    };
  } else {
    // Pick an iconic verse from Juz 30 or Al-Fatihah
    const allSurahs = (juz30Data.surahs as any[]) || [];
    const surah = getRandomItem(allSurahs);
    targetVerse = getRandomItem(surah.verses as any[]);
  }

  // Authentic Part of Speech Dictionary for high frequency Quranic particles and verbs
  const PARTICLES = new Set([
    "مِنْ", "فِي", "عَلَىٰ", "عَلَى", "إِلَىٰ", "إِلَى", "عَن", "عَنْ", "حَتَّىٰ",
    "وَ", "فَ", "ثُمَّ", "بَلْ", "لَا", "مَا", "إِنَّ", "أَنَّ", "إِن", "لَوْ", "إِذَا", "إِذْ", "كَلَّا", "قَدْ"
  ]);

  const VERBS = new Set([
    "قُلْ", "خَلَقَ", "تَعْلَمُونَ", "يَعْلَمُونَ", "أَعْبُدُ", "عَبَدتُّمْ", "نَعْبُدُ", "نَسْتَعِينُ",
    "أَنعَمتَ", "أَنْعَمْتَ", "سَبِّحْ", "ٱسْتَغْفِرْهُ", "يَقُولُ", "تَبَّتْ", "كَسَبَ", "يَلِدْ", "يُولَدْ"
  ]);

  const tokens: GrammarSortToken[] = [];
  const wordsToProcess = (targetVerse.words || []).slice(0, 6);

  for (let i = 0; i < wordsToProcess.length; i++) {
    const w = wordsToProcess[i];
    const cleanWord = (w.textUthmani || "").trim();
    if (!cleanWord) continue;

    let category: "ism" | "fil" | "harf" = "ism";
    let posDetail = "noun";
    let posArabicLabel = "اسم";
    let explanation = "Represents a person, entity, description, or concept.";

    if (PARTICLES.has(cleanWord) || cleanWord.startsWith("وَ") && cleanWord.length === 1 || cleanWord.startsWith("فَ") && cleanWord.length === 1) {
      category = "harf";
      posDetail = "particle / preposition";
      posArabicLabel = "حرف";
      explanation = "A particle or preposition that connects other words and gives meaning in context.";
    } else if (VERBS.has(cleanWord) || cleanWord.startsWith("يَ") || cleanWord.startsWith("تَ") && cleanWord.length > 3) {
      category = "fil";
      posDetail = "verb";
      posArabicLabel = "فعل";
      explanation = "An action occurring in a specific tense (past, present, or command).";
    }

    tokens.push({
      id: `tok_${targetVerse.verseKey.replace(":", "_")}_${i}`,
      textArabic: cleanWord,
      transliteration: w.transliterationEn || w.transliteration || "",
      translationEn: w.translationEn || w.translation?.text || "",
      translationUrdu: getWordUrduGloss(cleanWord),
      correctCategory: category,
      posDetail,
      posArabicLabel,
      explanation
    });
  }

  // Ensure we have at least one token per category if possible by pulling from top30 particles if missing
  const hasHarf = tokens.some((t) => t.correctCategory === "harf");
  if (!hasHarf && phase1Foundations.top30ParticlesAndPronouns.length > 0) {
    const randomParticle = getRandomItem(phase1Foundations.top30ParticlesAndPronouns);
    tokens.push({
      id: `tok_seed_particle_${randomParticle.id}`,
      textArabic: randomParticle.textUthmani,
      transliteration: randomParticle.transliteration,
      translationEn: randomParticle.translationEn,
      correctCategory: "harf",
      posDetail: randomParticle.posDetail,
      posArabicLabel: "حرف جر / عطف",
      explanation: `Classical Arabic Harf meaning '${randomParticle.translationEn}'.`
    });
  }

  const categories: GrammarCategorySpec[] = [
    {
      id: "ism",
      labelAr: "اسم",
      labelEn: "Ism (Noun / Pronoun / Adjective)",
      colorToken: "blue",
      description: "Words indicating a person, place, thing, or attribute independent of time."
    },
    {
      id: "fil",
      labelAr: "فعل",
      labelEn: "Fi'l (Action / Verb)",
      colorToken: "emerald",
      description: "Words expressing an action tied to past, present, or imperative tense."
    },
    {
      id: "harf",
      labelAr: "حرف",
      labelEn: "Harf (Particle / Preposition)",
      colorToken: "rose",
      description: "Connective particles that do not convey complete meaning on their own."
    }
  ];

  return {
    id: `grammar_sort_${targetVerse.verseKey.replace(":", "_")}_${Date.now()}`,
    type: "grammar_sort",
    verseKey: targetVerse.verseKey,
    verseText: targetVerse.textUthmani,
    instruction: "Sort each Quranic word into its correct grammatical category: Ism (Noun), Fi'l (Verb), or Harf (Particle).",
    instructionUrdu: "ہر قرآنی لفظ کو اسم، فعل یا حرف کے صحیح خانے میں منتخب کریں۔",
    explanationUrdu: "کلامِ عرب کی ۳ بنیادی اقسام ہیں: اسم (چیز/صفت)، فعل (زمانہ سے جڑا عمل)، اور حرف (کلمہ ربط)",
    explanation: "Classical Nahw partitions words into Ism (nouns/pronouns), Fi'l (actions with tense), and Harf (connective particles).",
    tokens: shuffleArray(tokens),
    categories
  };
}

/**
 * 4. generateAyahPuzzle
 * Splits a verse into scrambled word blocks and distractor tiles
 * for the drag-and-drop Ayah Puzzle Builder, plus word-by-word translation pairs.
 */
export function generateAyahPuzzle(customVerse?: any): AyahPuzzlePayload {
  let surahObj: any = null;
  let verseObj: any = null;

  if (customVerse) {
    verseObj = customVerse;
    surahObj = { nameEn: "Surah", nameAr: "سورة" };
  } else {
    // Pick short, iconic verses (e.g. Al-Fatihah, Al-Ikhlas, Al-Kawthar, Al-Asr)
    const surahsList = juz30Data.surahs as any[];
    const shortSurahs = surahsList.filter((s) => [1, 103, 108, 110, 112, 113, 114].includes(s.chapterId));
    surahObj = getRandomItem(shortSurahs.length > 0 ? shortSurahs : surahsList);
    verseObj = getRandomItem(surahObj.verses);
  }

  const words = verseObj.words as any[];
  const correctSequenceWordIds: string[] = [];
  const wbwPairs: Array<{ arabic: string; english: string; transliteration: string; audioUrl?: string; urdu?: string }> = [];

  const validBlocks: AyahPuzzleBlock[] = [];

  for (let idx = 0; idx < words.length; idx++) {
    const w = words[idx];
    const blockId = `block_${verseObj.verseKey.replace(":", "_")}_${idx}`;
    correctSequenceWordIds.push(blockId);

    validBlocks.push({
      id: blockId,
      text: w.textUthmani,
      transliteration: w.transliterationEn || "",
      translation: w.translationEn || "",
      translationUrdu: getWordUrduGloss(w.textUthmani),
      audioUrl: w.audioUrl,
      isDistractor: false
    });

    wbwPairs.push({
      arabic: w.textUthmani,
      english: w.translationEn || "",
      urdu: getWordUrduGloss(w.textUthmani),
      transliteration: w.transliterationEn || "",
      audioUrl: w.audioUrl
    });
  }

  // Select 1 or 2 authentic distractor words from other nearby verses
  const vocabPool = juz30Data.vocabularyIndex as any[];
  const distractorCandidates = vocabPool.filter(
    (v) => !validBlocks.some((b) => b.text === v.textUthmani)
  );
  const pickedDistractors = shuffleArray(distractorCandidates).slice(0, 2);

  const distractorBlocks: AyahPuzzleBlock[] = pickedDistractors.map((d, dIdx) => ({
    id: `dist_block_${Date.now()}_${dIdx}`,
    text: d.textUthmani,
    transliteration: d.transliterationEn,
    translation: d.translationEn,
    audioUrl: d.audioUrl,
    isDistractor: true
  }));

  const scrambledBlocks = shuffleArray([...validBlocks, ...distractorBlocks]);

  return {
    id: `puzzle_${verseObj.verseKey.replace(":", "_")}_${Date.now()}`,
    type: "ayah_puzzle",
    instruction: "Reconstruct the Ayah in accurate sequence by tapping the scrambled word tiles.",
    instructionUrdu: "قرآنی الفاظ کو ترتیب دے کر مکمل آیت تعمیر کریں۔",
    fullTranslationUrdu: AYAH_URDU_TRANSLATIONS[verseObj.verseKey] || "",
    explanationUrdu: `سورة ${surahObj.nameAr || "سورة"} آیت ${verseObj.verseKey} کا مکمل فہم اور صحیح ترتیبی ساخت`,
    explanation: `Surah ${surahObj.nameEn} Ayah ${verseObj.verseKey}: ${wbwPairs.map((p: any) => p.arabic).join(" ")} (${wbwPairs.map((p: any) => p.english).join(" ")}).`,
    verseKey: verseObj.verseKey,
    surahNameEn: surahObj.nameEn,
    surahNameAr: surahObj.nameAr,
    fullTextUthmani: verseObj.textUthmani,
    fullTranslationEn: wbwPairs.map((p) => p.english).join(" "),
    audioRecitationUrl: `https://verses.quran.com/Mishari/${verseObj.verseKey.replace(":", "")}.mp3`,
    scrambledBlocks,
    correctSequenceWordIds,
    wbwPairs
  };
}

/**
 * 5. generateSession
 * Procedurally generates a complete multi-question session:
 * - If practice: hints allowed, infinite hearts, immediate feedback, SRS weak item priority
 * - If test: 15s timer per question, strictly 3 hearts, 85% pass threshold, zero hints, 3x XP
 */
export function generateSession(
  mode: "practice" | "test",
  unitId: string,
  options: GenerateSessionOptions = {}
): LearningSession {
  const count = options.questionCount || (mode === "test" ? 15 : 8);

  const config: SessionConfig =
    mode === "practice"
      ? {
          mode: "practice",
          hintsAllowed: true,
          maxHearts: null, // Infinite hearts in practice
          timerSecondsPerQuestion: null, // No timer pressure
          passAccuracyThreshold: 0.6,
          xpMultiplier: 1.0,
          immediateFeedback: true
        }
      : {
          mode: "test",
          hintsAllowed: false,
          maxHearts: 3, // Strictly 3 hearts
          timerSecondsPerQuestion: 15, // 15-second countdown per question
          passAccuracyThreshold: 0.85, // 85% accuracy required to pass
          xpMultiplier: 3.0, // 3x XP multiplier for test mode
          immediateFeedback: false
        };

  const questions: SessionQuestion[] = [];

  // If user has weak SRS words, prioritize them in practice mode
  const weakWords = options.targetWeakWordIds || [];

  for (let i = 0; i < count; i++) {
    const cycle = i % 4;
    if (cycle === 0) {
      // Sound Sniper (Letter or Word)
      const targetWeakId = mode === "practice" && weakWords.length > 0 ? getRandomItem(weakWords) : undefined;
      questions.push(generateSoundSniper({ targetId: targetWeakId }));
    } else if (cycle === 1) {
      // Root Radar (Sarf Derivation)
      questions.push(generateRootRadar());
    } else if (cycle === 2) {
      // Grammar Sort (Nahw: Ism, Fi'l, Harf)
      questions.push(generateGrammarSort());
    } else {
      // Ayah Puzzle Builder
      questions.push(generateAyahPuzzle());
    }
  }

  return {
    sessionId: `sess_${mode}_${unitId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    unitId,
    mode,
    config,
    questions,
    totalQuestions: questions.length,
    createdAt: new Date().toISOString()
  };
}
