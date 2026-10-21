/**
 * Morphology Service: Provides authentic linguistic, grammatical, and part-of-speech
 * breakdown for all 77,429 words of the Quran, based on the Quranic Arabic Corpus dataset.
 */

export interface MorphologySegment {
  arabic: string;
  posClass: string;
  posArabic: string;
  posEnglish: string;
  lemma?: string;
  root?: string;
  features: string[];
  grammarCase?: string;
  genderNumber?: string;
  isPrefix?: boolean;
  isSuffix?: boolean;
  isStem?: boolean;
}

export interface WordMorphology {
  location: string; // e.g. "1:1:1"
  root?: string;
  lemma?: string;
  segments: MorphologySegment[];
}

const MORPHOLOGY_URL = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";

// In-memory cache of "chapter:verse:word" -> raw segment lines
let morphologyIndex: Map<string, string[]> | null = null;
let fetchPromise: Promise<Map<string, string[]>> | null = null;

const POS_DICT: Record<string, { ar: string; en: string }> = {
  N: { ar: "اسم", en: "Noun" },
  PN: { ar: "اسم علم", en: "Proper Noun" },
  ADJ: { ar: "صفة / نعت", en: "Adjective" },
  V: { ar: "فعل", en: "Verb" },
  P: { ar: "حرف جر", en: "Preposition" },
  PRON: { ar: "ضمير", en: "Pronoun" },
  DEM: { ar: "اسم إشارة", en: "Demonstrative" },
  REL: { ar: "اسم موصول", en: "Relative Pronoun" },
  DET: { ar: "أداة تعريف", en: "Definite Article (al-)" },
  NEG: { ar: "أداة نفي", en: "Negative Particle" },
  INTG: { ar: "أداة استفهام", en: "Interrogative" },
  CONJ: { ar: "حرف عطف", en: "Conjunction" },
  SUB: { ar: "حرف مصدري", en: "Subordinating Particle" },
  COND: { ar: "حرف شرط", en: "Conditional Particle" },
  VOC: { ar: "حرف نداء", en: "Vocative Particle (ya-)" },
  RES: { ar: "أداة حصر", en: "Restriction Particle" },
  EMPH: { ar: "لام التوكيد", en: "Emphatic Particle" },
  INL: { ar: "حروف مقطعة", en: "Quranic Initials" },
  CIRC: { ar: "واو الحال", en: "Circumstantial Particle" },
  COM: { ar: "واو المعية", en: "Comitative Particle" },
  EQ: { ar: "همزة التسوية", en: "Equalization Particle" },
  EXH: { ar: "أداة تحضيض", en: "Exhortation Particle" },
  EXP: { ar: "أداة توضيح", en: "Explanation Particle" },
  FUT: { ar: "حرف استقبال (سوف)", en: "Future Particle" },
  INC: { ar: "حرف ابتداء", en: "Inceptive Particle" },
  INT: { ar: "أداة تفسير", en: "Interpretation Particle" },
  PREV: { ar: "حرف كاف", en: "Preventive Particle" },
  PRO: { ar: "حرف نهي", en: "Prohibition Particle" },
  REM: { ar: "حرف استئناف", en: "Resumption Particle" },
  RET: { ar: "حرف إضراب", en: "Retraction Particle" },
  SUR: { ar: "حرف مفاجأة", en: "Surprise Particle" },
  T: { ar: "حرف تأنيث", en: "Feminine Marker" },
};

const CASE_DICT: Record<string, { ar: string; en: string }> = {
  NOM: { ar: "مرفوع", en: "Nominative" },
  ACC: { ar: "منصوب", en: "Accusative" },
  GEN: { ar: "مجرور", en: "Genitive" },
};

const GENDER_NUMBER_DICT: Record<string, { ar: string; en: string }> = {
  MS: { ar: "مفرد مذكر", en: "Masculine Singular" },
  MD: { ar: "مثنى مذكر", en: "Masculine Dual" },
  MP: { ar: "جمع مذكر", en: "Masculine Plural" },
  FS: { ar: "مفرد مؤنث", en: "Feminine Singular" },
  FD: { ar: "مثنى مؤنث", en: "Feminine Dual" },
  FP: { ar: "جمع مؤنث", en: "Feminine Plural" },
  M: { ar: "مذكر", en: "Masculine" },
  F: { ar: "مؤنث", en: "Feminine" },
  S: { ar: "مفرد", en: "Singular" },
  D: { ar: "مثنى", en: "Dual" },
  P: { ar: "جمع", en: "Plural" },
};

/**
 * Loads and indexes the Quranic Arabic Corpus morphology dataset into memory.
 */
export async function loadMorphologyIndex(): Promise<Map<string, string[]>> {
  if (morphologyIndex) return morphologyIndex;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch(MORPHOLOGY_URL);
      if (!res.ok) throw new Error("Failed to load Quran morphology data");
      const text = await res.text();

      const index = new Map<string, string[]>();
      const lines = text.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const tabIdx = line.indexOf("\t");
        if (tabIdx === -1) continue;

        const loc = line.slice(0, tabIdx); // "1:1:1:1"
        const rest = line.slice(tabIdx + 1); // "بِ\tP\tP|PREF|LEM:ب"
        const lastColon = loc.lastIndexOf(":");
        const wordKey = loc.slice(0, lastColon); // "1:1:1"

        let arr = index.get(wordKey);
        if (!arr) {
          arr = [];
          index.set(wordKey, arr);
        }
        arr.push(rest);
      }

      morphologyIndex = index;
      return index;
    } catch (e) {
      console.error("Error loading morphology index:", e);
      return new Map();
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Retrieves the granular morphological breakdown for a specific word location (e.g. "1:1:1").
 */
export async function getWordMorphology(location: string): Promise<WordMorphology | null> {
  const index = await loadMorphologyIndex();
  const rawSegments = index.get(location);
  if (!rawSegments || rawSegments.length === 0) return null;

  let mainRoot: string | undefined;
  let mainLemma: string | undefined;

  const segments: MorphologySegment[] = rawSegments.map((line) => {
    // Format: "segment_arabic \t pos_class \t features"
    const parts = line.split("\t");
    const arabic = parts[0] || "";
    const posClass = parts[1] || "";
    const featureStr = parts[2] || "";
    const features = featureStr.split("|");

    let root: string | undefined;
    let lemma: string | undefined;
    let grammarCase: string | undefined;
    let genderNumber: string | undefined;
    let isPrefix = false;
    let isSuffix = false;
    let isStem = true;

    for (const f of features) {
      if (f.startsWith("ROOT:")) {
        root = f.slice(5);
        if (!mainRoot) mainRoot = root;
      } else if (f.startsWith("LEM:")) {
        lemma = f.slice(4);
        if (!mainLemma) mainLemma = lemma;
      } else if (f === "PREF") {
        isPrefix = true;
        isStem = false;
      } else if (f === "SUFF") {
        isSuffix = true;
        isStem = false;
      } else if (CASE_DICT[f]) {
        grammarCase = `${CASE_DICT[f].ar} (${CASE_DICT[f].en})`;
      } else if (GENDER_NUMBER_DICT[f]) {
        genderNumber = `${GENDER_NUMBER_DICT[f].ar} (${GENDER_NUMBER_DICT[f].en})`;
      }
    }

    // Determine primary POS label
    let posInfo = POS_DICT[posClass] || { ar: posClass, en: posClass };
    for (const f of features) {
      if (POS_DICT[f]) {
        posInfo = POS_DICT[f];
        break;
      }
    }

    return {
      arabic,
      posClass,
      posArabic: posInfo.ar,
      posEnglish: posInfo.en,
      lemma,
      root,
      features,
      grammarCase,
      genderNumber,
      isPrefix,
      isSuffix,
      isStem,
    };
  });

  return {
    location,
    root: mainRoot,
    lemma: mainLemma,
    segments,
  };
}
