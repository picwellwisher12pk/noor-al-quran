/**
 * Authentic Quranic Grammar (Nahw) & Verb Forms (Sarf) Dataset
 * 
 * Based on classical Arabic linguistics (Al-Ajrumiyyah, Qawa'id al-Lughah al-Arabiyyah,
 * and the Quranic Arabic Corpus morphology database).
 * All examples are genuine Quranic occurrences with exact Surah and Ayah citations.
 */

export type VerbFormNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface VerbConjugationTemplate {
  past: string;           // الماضي (e.g. فَعَلَ)
  present: string;        // المضارع (e.g. يَفْعَلُ)
  imperative: string;     // الأمر (e.g. اِفْعَلْ)
  masdar: string;         // المصدر / Verbal Noun (e.g. فَعْل / فِعَالَة)
  activeParticiple: string;  // اسم الفاعل (e.g. فَاعِل)
  passiveParticiple: string; // اسم المفعول (e.g. مَفْعُول)
}

export interface QuranicVerbExample {
  arabic: string;
  transliteration: string;
  root: string;
  english: string;
  urdu: string;
  formNumber: VerbFormNumber;
  tense: "past" | "present" | "imperative" | "masdar" | "participle";
  surah: number;
  ayah: number;
  surahName: string;
  verseText: string;
  highlightWord: string;
  audioVerseKey: string;
}

export interface QuranicVerbFormInfo {
  formNumber: VerbFormNumber;
  romanNumeral: string;
  arabicName: string;
  arabicNameFull: string;
  englishTitle: string;
  urduTitle: string;
  template: VerbConjugationTemplate;
  semanticMeaningEn: string;
  semanticMeaningUrdu: string;
  keyCharacteristicsEn: string;
  keyCharacteristicsUrdu: string;
  approximateQuranCount: number;
  examples: QuranicVerbExample[];
}

export type GrammarRulePillar =
  | "irab_cases"          // أقسام الكلمة والإعراب (رفع، نصب، جر، جزم)
  | "compounds_murakkab"  // المركبات (إضافي، توصيفي، إشاري، جاري)
  | "sentences_jumlah"    // الجمل (اسمية، فعلية، إنّ، كان)
  | "particles_harf";     // الحروف والأدوات (حروف الجر، النداء، النفي، الشرط)

export interface GrammarSampleAyah {
  surah: number;
  ayah: number;
  surahName: string;
  verseText: string;
  highlightWords: string[];
  roleExplanationEn: string;
  roleExplanationUrdu: string;
  englishTranslation: string;
  urduTranslation: string;
  audioVerseKey: string;
}

export interface GrammarRuleItem {
  id: string;
  pillar: GrammarRulePillar;
  titleEn: string;
  titleAr: string;
  titleUrdu: string;
  summaryEn: string;
  summaryUrdu: string;
  formulaEquation?: string;
  detailedRulesEn: string[];
  detailedRulesUrdu: string[];
  recognitionTipsEn: string;
  recognitionTipsUrdu: string;
  sampleAyahs: GrammarSampleAyah[];
}

export interface GrammarQuizQuestion {
  id: string;
  type: "verb_form" | "irab_case" | "compound_type" | "sentence_role";
  promptVerseAr: string;
  promptVerseEn: string;
  promptVerseUrdu: string;
  surahReference: string;
  highlightWord: string;
  questionEn: string;
  questionUrdu: string;
  options: {
    textEn: string;
    textUrdu: string;
    textAr?: string;
    isCorrect: boolean;
  }[];
  explanationEn: string;
  explanationUrdu: string;
}

// ============================================================================
// 1. THE 10 QURANIC VERB FORMS (أبواب الأفعال الصرفية)
// ============================================================================

export const QURANIC_VERB_FORMS: QuranicVerbFormInfo[] = [
  {
    formNumber: 1,
    romanNumeral: "Form I",
    arabicName: "فَعَلَ",
    arabicNameFull: "الثلاثي المجرد",
    englishTitle: "Basic Unaugmented Triliteral",
    urduTitle: "ثلاثی مجرد (بنیادی باب)",
    template: {
      past: "فَعَلَ",
      present: "يَفْعَلُ",
      imperative: "اِفْعَلْ",
      masdar: "فَعْل / فُعُول",
      activeParticiple: "فَاعِل",
      passiveParticiple: "مَفْعُول",
    },
    semanticMeaningEn: "The fundamental base meaning of the root. Most common verb pattern in the Quran.",
    semanticMeaningUrdu: "مادے کا بنیادی اور اصلی مفہوم۔ قرآن مجید میں سب سے زیادہ کثرت سے مستعمل باب۔",
    keyCharacteristicsEn: "Pure 3-letter root without augmented non-radical letters. Patterns vary (fa'ala, fa'ila, fa'ula).",
    keyCharacteristicsUrdu: "تینوں اصلی حروف بغیر کسی زائد حرف کے۔ بنیادی حرکات کے ساتھ۔",
    approximateQuranCount: 9500,
    examples: [
      {
        arabic: "خَلَقَ",
        transliteration: "khalaqa",
        root: "خ ل ق",
        english: "He created",
        urdu: "اس نے پیدا کیا",
        formNumber: 1,
        tense: "past",
        surah: 96,
        ayah: 1,
        surahName: "Al-Alaq",
        verseText: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ",
        highlightWord: "خَلَقَ",
        audioVerseKey: "96:1",
      },
      {
        arabic: "يَعْلَمُ",
        transliteration: "ya'lamu",
        root: "ع ل م",
        english: "He knows",
        urdu: "وہ جانتا ہے",
        formNumber: 1,
        tense: "present",
        surah: 2,
        ayah: 77,
        surahName: "Al-Baqarah",
        verseText: "أَوَلَا يَعْلَمُونَ أَنَّ ٱللَّهَ يَعْلَمُ مَا يُسِرُّونَ وَمَا يُعْلِنُونَ",
        highlightWord: "يَعْلَمُ",
        audioVerseKey: "2:77",
      },
      {
        arabic: "ٱعْبُدُوا۟",
        transliteration: "u'budū",
        root: "ع ب د",
        english: "Worship! [plural]",
        urdu: "عبادت کرو",
        formNumber: 1,
        tense: "imperative",
        surah: 2,
        ayah: 21,
        surahName: "Al-Baqarah",
        verseText: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ",
        highlightWord: "ٱعْبُدُوا۟",
        audioVerseKey: "2:21",
      },
    ],
  },
  {
    formNumber: 2,
    romanNumeral: "Form II",
    arabicName: "فَعَّلَ",
    arabicNameFull: "باب التفعيل",
    englishTitle: "Intensive / Causative / Gradual",
    urduTitle: "باب التفعیل (شدت، کثرت، یا تدریج)",
    template: {
      past: "فَعَّلَ",
      present: "يُفَعِّلُ",
      imperative: "فَعِّلْ",
      masdar: "تَفْعِيل",
      activeParticiple: "مُفَعِّل",
      passiveParticiple: "مُفَعَّل",
    },
    semanticMeaningEn: "Doubling of middle root letter (Shaddah). Imparts intensification, repeated action, or gradual step-by-step causation.",
    semanticMeaningUrdu: "درمیانی حرف پر تشدید (تضعیف)۔ مفہوم میں کثرت، شدت، یا مرحلہ وار تدریجی کیفیت پیدا کرتا ہے۔",
    keyCharacteristicsEn: "Shaddah on the 'Ayn radical. Distinctive Masdar pattern 'Taf'eel' (e.g. Tanzīl, Ta'līm).",
    keyCharacteristicsUrdu: "عین کلمہ پر تشدید؛ مصدر 'تفعیل' کے وزن پر آتا ہے (جیسے تنزیل، تعلیم، تسبیح)۔",
    approximateQuranCount: 1650,
    examples: [
      {
        arabic: "نَزَّلَ",
        transliteration: "nazzala",
        root: "ن ز ل",
        english: "He revealed gradually (stage-by-stage)",
        urdu: "اس نے تھوڑا تھوڑا کر کے نازل فرمایا",
        formNumber: 2,
        tense: "past",
        surah: 25,
        ayah: 1,
        surahName: "Al-Furqan",
        verseText: "تَبَارَكَ ٱلَّذِى نَزَّلَ ٱلْفُرْقَانَ عَلَىٰ عَبْدِهِۦ",
        highlightWord: "نَزَّلَ",
        audioVerseKey: "25:1",
      },
      {
        arabic: "يُسَبِّحُ",
        transliteration: "yusabbihu",
        root: "س ب ح",
        english: "Glorifies / praises continuously",
        urdu: "مسلسل تسبیح بیان کرتا ہے",
        formNumber: 2,
        tense: "present",
        surah: 62,
        ayah: 1,
        surahName: "Al-Jumu'ah",
        verseText: "يُسَبِّحُ لِلَّهِ مَا فِى ٱلسَّمَـٰوَاتِ وَمَا فِى ٱلْأَرْضِ",
        highlightWord: "يُسَبِّحُ",
        audioVerseKey: "62:1",
      },
      {
        arabic: "عَلَّمَ",
        transliteration: "'allama",
        root: "ع ل م",
        english: "He taught (caused someone to know systematically)",
        urdu: "اس نے سکھایا (علم دیا)",
        formNumber: 2,
        tense: "past",
        surah: 96,
        ayah: 4,
        surahName: "Al-Alaq",
        verseText: "ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ",
        highlightWord: "عَلَّمَ",
        audioVerseKey: "96:4",
      },
    ],
  },
  {
    formNumber: 3,
    romanNumeral: "Form III",
    arabicName: "فَاعَلَ",
    arabicNameFull: "باب المفاعلة",
    englishTitle: "Associative / Mutual Effort / Directional",
    urduTitle: "باب المفاعلہ (باہمی کوشش و جدوجہد)",
    template: {
      past: "فَاعَلَ",
      present: "يُفَاعِلُ",
      imperative: "فَاعِلْ",
      masdar: "مُفَاعَلَة / فِعَال",
      activeParticiple: "مُفَاعِل",
      passiveParticiple: "مُفَاعَل",
    },
    semanticMeaningEn: "Long Alif after first letter. Indicates reciprocal effort, interaction with others, or striving towards an objective.",
    semanticMeaningUrdu: "پہلے حرف کے بعد الفِ زائدہ۔ مفہوم میں باہمی اشتراک، مقابلے یا مسلسل جدوجہد کی دلالت ہوتی ہے۔",
    keyCharacteristicsEn: "Alif elongation after first radical (Fā'). Masdar often ends with Tā Marbūta (e.g. Mujāhadah, Munāz'ah) or Fi'āl (Jihād, Qitāl).",
    keyCharacteristicsUrdu: "فا کلمہ کے بعد الف؛ مصدر 'مفاعلة' یا 'فِعال' جیسے جہاد، قتال۔",
    approximateQuranCount: 420,
    examples: [
      {
        arabic: "جَـٰهَدُوا۟",
        transliteration: "jāhadū",
        root: "ج ه د",
        english: "They strove / struggled with effort",
        urdu: "انہوں نے جہاد اور سخت کوشش کی",
        formNumber: 3,
        tense: "past",
        surah: 2,
        ayah: 218,
        surahName: "Al-Baqarah",
        verseText: "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَٱلَّذِينَ هَاجَرُوا۟ وَجَـٰهَدُوا۟ فِى سَبِيلِ ٱللَّهِ",
        highlightWord: "وَجَـٰهَدُوا۟",
        audioVerseKey: "2:218",
      },
      {
        arabic: "يُخَـٰدِعُونَ",
        transliteration: "yukhādi'ūna",
        root: "خ د ع",
        english: "They attempt to deceive",
        urdu: "وہ دھوکہ دینے کی کوشش کرتے ہیں",
        formNumber: 3,
        tense: "present",
        surah: 2,
        ayah: 9,
        surahName: "Al-Baqarah",
        verseText: "يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟",
        highlightWord: "يُخَـٰدِعُونَ",
        audioVerseKey: "2:9",
      },
    ],
  },
  {
    formNumber: 4,
    romanNumeral: "Form IV",
    arabicName: "أَفْعَلَ",
    arabicNameFull: "باب الإفعال",
    englishTitle: "Causative / Transitive Instantaneous",
    urduTitle: "باب الإفعال (تعدیہ اور دفعی نازل کرنا)",
    template: {
      past: "أَفْعَلَ",
      present: "يُفْعِلُ",
      imperative: "أَفْعِلْ",
      masdar: "إِفْعَال",
      activeParticiple: "مُفْعِل",
      passiveParticiple: "مُفْعَل",
    },
    semanticMeaningEn: "Hamzah prefix (أَ). Makes an intransitive verb transitive (causative: to cause something to happen all at once or definitively).",
    semanticMeaningUrdu: "شروع میں ہمزۂ مفتوحہ۔ لازم کو متعدی بناتا ہے، اور کسی کام کے یکبارگی یا حتمی واقع ہونے کو ظاہر کرتا ہے۔",
    keyCharacteristicsEn: "Hamzah on past, Dammah prefix on present (yu-), and distinctive Masdar 'If'āl' (e.g. Islām, Inzāl, Irsāl).",
    keyCharacteristicsUrdu: "ماضی کے شروع میں ہمزہ، مضارع میں پیش (يُفْعِلُ)، اور مصدر 'افعال' جیسے اسلام، انزال، احسان۔",
    approximateQuranCount: 3800,
    examples: [
      {
        arabic: "أَنزَلْنَـٰهُ",
        transliteration: "anzalnāhu",
        root: "ن ز ل",
        english: "We sent it down (decisively / as a complete whole)",
        urdu: "ہم نے اسے (یکبارگی لوح محفوظ سے) نازل کیا",
        formNumber: 4,
        tense: "past",
        surah: 97,
        ayah: 1,
        surahName: "Al-Qadr",
        verseText: "إِنَّآ أَنزَلْنَـٰهُ فِى لَيْلَةِ ٱلْقَدْرِ",
        highlightWord: "أَنزَلْنَـٰهُ",
        audioVerseKey: "97:1",
      },
      {
        arabic: "أَسْلَمْتُ",
        transliteration: "aslamtu",
        root: "س ل م",
        english: "I have submitted / surrendered in peace",
        urdu: "میں نے سر تسلیم خم کیا (فرمانبردار ہوا)",
        formNumber: 4,
        tense: "past",
        surah: 2,
        ayah: 131,
        surahName: "Al-Baqarah",
        verseText: "قَالَ أَسْلَمْتُ لِرَبِّ ٱلْعَـٰلَمِينَ",
        highlightWord: "أَسْلَمْتُ",
        audioVerseKey: "2:131",
      },
      {
        arabic: "يُنفِقُونَ",
        transliteration: "yunfiqūna",
        root: "ن ف ق",
        english: "They spend / expend out of provision",
        urdu: "وہ خرچ کرتے ہیں",
        formNumber: 4,
        tense: "present",
        surah: 2,
        ayah: 3,
        surahName: "Al-Baqarah",
        verseText: "وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
        highlightWord: "يُنفِقُونَ",
        audioVerseKey: "2:3",
      },
    ],
  },
  {
    formNumber: 5,
    romanNumeral: "Form V",
    arabicName: "تَفَعَّلَ",
    arabicNameFull: "باب التفعّل",
    englishTitle: "Reflexive of Form II / Gradual Assimilation",
    urduTitle: "باب التفعّل (قبولِ اثر اور تامل و تدبر)",
    template: {
      past: "تَفَعَّلَ",
      present: "يَتَفَعَّلُ",
      imperative: "تَفَعَّلْ",
      masdar: "تَفَعُّل",
      activeParticiple: "مُتَفَعِّل",
      passiveParticiple: "مُتَفَعَّل",
    },
    semanticMeaningEn: "Prefix Ta- + Shaddah. Represents accepting the action of Form II (learning something yourself, adopting a quality step-by-step, contemplating deeply).",
    semanticMeaningUrdu: "باب تفعیل کا اثر قبول کرنا؛ کسی کام کو خود اپنے اوپر لاگو کرنا، سیکھنا، یا بار بار غور و فکر کرنا۔",
    keyCharacteristicsEn: "Ta- prefix with Shaddah on second root letter. Masdar 'Tafa''ul' (e.g. Tadabbur, Tawakkul).",
    keyCharacteristicsUrdu: "شروع میں ت اور عین پر تشدید؛ مصدر 'تَفَعُّل' جیسے تدبر، توکل، تذکر۔",
    approximateQuranCount: 1250,
    examples: [
      {
        arabic: "تَوَكَّلْ",
        transliteration: "tawakkal",
        root: "و ك ل",
        english: "Rely / place your trust completely",
        urdu: "توکل اور بھروسہ کرو",
        formNumber: 5,
        tense: "imperative",
        surah: 33,
        ayah: 3,
        surahName: "Al-Ahzab",
        verseText: "وَتَوَكَّلْ عَلَى ٱللَّهِ وَكَفَىٰ بِٱللَّهِ وَكِيلًا",
        highlightWord: "وَتَوَكَّلْ",
        audioVerseKey: "33:3",
      },
      {
        arabic: "يَتَدَبَّرُونَ",
        transliteration: "yatadabbarūna",
        root: "د ب ر",
        english: "Do they contemplate / reflect deeply?",
        urdu: "کیا وہ گہرائی سے غور و تدبر نہیں کرتے؟",
        formNumber: 5,
        tense: "present",
        surah: 4,
        ayah: 82,
        surahName: "An-Nisa",
        verseText: "أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ",
        highlightWord: "يَتَدَبَّرُونَ",
        audioVerseKey: "4:82",
      },
    ],
  },
  {
    formNumber: 6,
    romanNumeral: "Form VI",
    arabicName: "تَفَاعَلَ",
    arabicNameFull: "باب التفاعل",
    englishTitle: "Mutual Reciprocity / Feigning",
    urduTitle: "باب التفاعل (طرفین کا باہمی اشتراک)",
    template: {
      past: "تَفَاعَلَ",
      present: "يَتَفَاعَلُ",
      imperative: "تَفَاعَلْ",
      masdar: "تَفَاعُل",
      activeParticiple: "مُتَفَاعِل",
      passiveParticiple: "مُتَفَاعَل",
    },
    semanticMeaningEn: "Prefix Ta- + Alif elongation. Represents two or more parties participating mutually in the action together.",
    semanticMeaningUrdu: "دونوں فریقین کا ایک دوسرے کے ساتھ باہمی طور پر عمل میں حصہ لینا۔",
    keyCharacteristicsEn: "Ta- followed by Fā' and Alif. Masdar 'Tafā'ul' (e.g. Ta'āwun, Tanāzu').",
    keyCharacteristicsUrdu: "ت کے بعد الف؛ مصدر 'تَفَاعُل' جیسے تعاون، تنازع۔",
    approximateQuranCount: 280,
    examples: [
      {
        arabic: "تَعَاوَنُوا۟",
        transliteration: "ta'āwanū",
        root: "ع و ن",
        english: "Cooperate mutually with one another",
        urdu: "ایک دوسرے کے ساتھ باہم مدد کرو",
        formNumber: 6,
        tense: "imperative",
        surah: 5,
        ayah: 2,
        surahName: "Al-Ma'idah",
        verseText: "وَتَعَاوَنُوا۟ عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ",
        highlightWord: "وَتَعَاوَنُوا۟",
        audioVerseKey: "5:2",
      },
    ],
  },
  {
    formNumber: 7,
    romanNumeral: "Form VII",
    arabicName: "اِنْفَعَلَ",
    arabicNameFull: "باب الانفعال",
    englishTitle: "Passive / Involuntary Reflexive of Form I",
    urduTitle: "باب الانفعال (مطاوعت اور غیر ارادی کیفیت)",
    template: {
      past: "اِنْفَعَلَ",
      present: "يَنْفَعِلُ",
      imperative: "اِنْفَعِلْ",
      masdar: "اِنْفِعَال",
      activeParticiple: "مُنْفَعِل",
      passiveParticiple: "مُنْفَعَل",
    },
    semanticMeaningEn: "Prefix In- (اِنْـ). Always intransitive; the subject yields unconditionally to an action (splitting, turning back, cleaving).",
    semanticMeaningUrdu: "شروع میں 'اِن'؛ یہ باب ہمیشہ لازم ہوتا ہے اور اس میں فاعل بغیر کسی مزاحمت کے اثر کو قبول کرتا ہے (جیسے پھٹنا، پلٹنا)۔",
    keyCharacteristicsEn: "Begins with In- prefix. No passive voice because it is inherently passive in meaning.",
    keyCharacteristicsUrdu: "شروع میں الف اور نون؛ اس کا کوئی مجہول صیغہ نہیں آتا کیونکہ اس کا مفہوم خود بخود مطاوعت کا ہوتا ہے۔",
    approximateQuranCount: 160,
    examples: [
      {
        arabic: "ٱنشَقَّتِ",
        transliteration: "inshaqqat",
        root: "ش ق ق",
        english: "It cleaved / split open completely",
        urdu: "وہ پھٹ گئی (دو ٹکڑے ہو گئی)",
        formNumber: 7,
        tense: "past",
        surah: 84,
        ayah: 1,
        surahName: "Al-Inshiqaq",
        verseText: "إِذَا ٱلسَّمَآءُ ٱنشَقَّتْ",
        highlightWord: "ٱنشَقَّتْ",
        audioVerseKey: "84:1",
      },
      {
        arabic: "تَنقَلِبُوا۟",
        transliteration: "tanqalibū",
        root: "ق ل ب",
        english: "You turn back on your heels",
        urdu: "تم الٹے پاؤں پھر جاؤ",
        formNumber: 7,
        tense: "present",
        surah: 3,
        ayah: 144,
        surahName: "Ali 'Imran",
        verseText: "أَفَإِيْن مَّاتَ أَوْ قُتِلَ ٱنقَلَبْتُمْ عَلَىٰٓ أَعْقَـٰبِكُمْ",
        highlightWord: "ٱنقَلَبْتُمْ",
        audioVerseKey: "3:144",
      },
    ],
  },
  {
    formNumber: 8,
    romanNumeral: "Form VIII",
    arabicName: "اِفْتَعَلَ",
    arabicNameFull: "باب الافتعال",
    englishTitle: "Reflexive with Effort / Earnest Pursuit",
    urduTitle: "باب الافتعال (کوشش، اہتمام اور کسب)",
    template: {
      past: "اِفْتَعَلَ",
      present: "يَفْتَعِلُ",
      imperative: "اِفْتَعِلْ",
      masdar: "اِفْتِعَال",
      activeParticiple: "مُفْتَعِل",
      passiveParticiple: "مُفْتَعَل",
    },
    semanticMeaningEn: "Hamzah prefix + Ta- infixed between 1st & 2nd radicals. Indicates deliberate personal exertion, acquiring something for oneself, or choosing an earnest path.",
    semanticMeaningUrdu: "فا اور عین کے درمیان 'ت' کا اضافہ۔ اپنے نفع کے لیے کوشش کرنا، کسی عمل کو جان بوجھ کر اختیار کرنا (جیسے اکتساب، اہتداء)۔",
    keyCharacteristicsEn: "Infixed Ta-. Look for 'If-ta-' in past and 'Yaf-ta-' in present.",
    keyCharacteristicsUrdu: "پہلے حرف کے بعد ت؛ مصدر 'افتعال' جیسے اختلاف، اہتداء، اقتراب۔",
    approximateQuranCount: 1350,
    examples: [
      {
        arabic: "ٱهْتَدَىٰ",
        transliteration: "ihtadā",
        root: "ه د ي",
        english: "He accepts and pursues guidance for himself",
        urdu: "اس نے خود ہدایت کا راستہ اپنایا",
        formNumber: 8,
        tense: "past",
        surah: 17,
        ayah: 15,
        surahName: "Al-Isra",
        verseText: "مَّنِ ٱهْتَدَىٰ فَإِنَّمَا يَهْتَدِى لِنَفْسِهِۦ",
        highlightWord: "ٱهْتَدَىٰ",
        audioVerseKey: "17:15",
      },
      {
        arabic: "ٱتَّبِعُوا۟",
        transliteration: "ittabi'ū",
        root: "ت ب ع",
        english: "Follow closely and intentionally!",
        urdu: "پیروی کرو (اختیار کرو)",
        formNumber: 8,
        tense: "imperative",
        surah: 2,
        ayah: 170,
        surahName: "Al-Baqarah",
        verseText: "وَإِذَا قِيلَ لَهُمُ ٱتَّبِعُوا۟ مَآ أَنزَلَ ٱللَّهُ",
        highlightWord: "ٱتَّبِعُوا۟",
        audioVerseKey: "2:170",
      },
    ],
  },
  {
    formNumber: 9,
    romanNumeral: "Form IX",
    arabicName: "اِفْعَلَّ",
    arabicNameFull: "باب الافعلال",
    englishTitle: "Colors and Physical Bodily States",
    urduTitle: "باب الافعلال (رنگوں اور مستقل اوصاف کی شدت)",
    template: {
      past: "اِفْعَلَّ",
      present: "يَفْعَلُّ",
      imperative: "اِفْعَلَّ",
      masdar: "اِفْعِلَال",
      activeParticiple: "مُفْعَلّ",
      passiveParticiple: "مُفْعَلّ",
    },
    semanticMeaningEn: "Shaddah on the final consonant. Exclusive to intensifying colors or permanent physical descriptions (e.g. turning bright white or pitch black on the Day of Judgment).",
    semanticMeaningUrdu: "آخری حرف پر تشدید؛ یہ باب صرف رنگوں یا جسمانی کیفیات کے گہرے ہونے کے لیے مخصوص ہے (جیسے چہروں کا سفید یا سیاہ ہونا)۔",
    keyCharacteristicsEn: "Doubled third radical. Very rare in the Quran, primarily used in apocalyptic descriptions.",
    keyCharacteristicsUrdu: "لام کلمہ پر تشدید؛ قرآن میں شاذ اور قیامت کے ہولناک احوال کے ضمن میں آتا ہے۔",
    approximateQuranCount: 15,
    examples: [
      {
        arabic: "تَبْيَضُّ",
        transliteration: "tabyaddu",
        root: "ب ي ض",
        english: "Faces will turn luminous white",
        urdu: "چہرے روشن و سفید ہو جائیں گے",
        formNumber: 9,
        tense: "present",
        surah: 3,
        ayah: 106,
        surahName: "Ali 'Imran",
        verseText: "يَوْمَ تَبْيَضُّ وُجُوهٌۭ وَتَسْوَدُّ وُجُوهٌۭ",
        highlightWord: "تَبْيَضُّ",
        audioVerseKey: "3:106",
      },
    ],
  },
  {
    formNumber: 10,
    romanNumeral: "Form X",
    arabicName: "اِسْتَفْعَلَ",
    arabicNameFull: "باب الاستفعال",
    englishTitle: "Seeking / Requesting / Deeming",
    urduTitle: "باب الاستفعال (طلب، دعا، یا کسی کو کچھ سمجھنا)",
    template: {
      past: "اِسْتَفْعَلَ",
      present: "يَسْتَفْعِلُ",
      imperative: "اِسْتَفْعِلْ",
      masdar: "اِسْتِفْعَال",
      activeParticiple: "مُسْتَفْعِل",
      passiveParticiple: "مُسْتَفْعَل",
    },
    semanticMeaningEn: "Prefix Ista- (اِسْتَـ). Primary meaning is 'seeking' (Talab) the root action (e.g. Istighfār = seeking forgiveness; Isti'ānah = seeking divine assistance) or deeming something as having that quality (Istikbār = deeming oneself great).",
    semanticMeaningUrdu: "شروع میں 'است'؛ اصل مفہوم 'طلب' (مانگنا) ہے جیسے استغفار (بخشش مانگنا)، استعانت (مدد مانگنا)، یا تکبر کرنا (اپنے آپ کو بڑا سمجھنا)۔",
    keyCharacteristicsEn: "Prefix Ista- (اِسْتَـ) on past, Yasta- (يَسْتَـ) on present. Masdar pattern 'Istif'āl'.",
    keyCharacteristicsUrdu: "شروع میں 'است' کی علامت؛ مصدر 'استفعال' جیسے استغفار، استکبار۔",
    approximateQuranCount: 880,
    examples: [
      {
        arabic: "ٱسْتَغْفِرُوا۟",
        transliteration: "istaghfirū",
        root: "غ ف ر",
        english: "Seek forgiveness from your Lord!",
        urdu: "اپنے رب سے بخشش اور مغفرت طلب کرو",
        formNumber: 10,
        tense: "imperative",
        surah: 71,
        ayah: 10,
        surahName: "Nuh",
        verseText: "فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًۭا",
        highlightWord: "ٱسْتَغْفِرُوا۟",
        audioVerseKey: "71:10",
      },
      {
        arabic: "نَسْتَعِينُ",
        transliteration: "nasta'īnu",
        root: "ع و ن",
        english: "We seek help / ask for assistance",
        urdu: "ہم مدد طلب کرتے ہیں",
        formNumber: 10,
        tense: "present",
        surah: 1,
        ayah: 5,
        surahName: "Al-Fatihah",
        verseText: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        highlightWord: "نَسْتَعِينُ",
        audioVerseKey: "1:5",
      },
      {
        arabic: "ٱسْتَكْبَرُوا۟",
        transliteration: "istakbarū",
        root: "ك ب ر",
        english: "They became arrogant / considered themselves great",
        urdu: "انہوں نے تکبر کیا اور بڑائی چاہی",
        formNumber: 10,
        tense: "past",
        surah: 7,
        ayah: 75,
        surahName: "Al-A'raf",
        verseText: "قَالَ ٱلْمَلَأُ ٱلَّذِينَ ٱسْتَكْبَرُوا۟ مِن قَوْمِهِۦ",
        highlightWord: "ٱسْتَكْبَرُوا۟",
        audioVerseKey: "7:75",
      },
    ],
  },
];

// ============================================================================
// 2. CORE QURANIC GRAMMAR RULES (قواعد النحو الأساسية)
// ============================================================================

export const QURANIC_GRAMMAR_RULES: GrammarRuleItem[] = [
  // --- PILLAR 1: I'RAB & CASE ENDINGS ---
  {
    id: "rule_irab_raf",
    pillar: "irab_cases",
    titleEn: "Raf' (The Nominative Case) - The Doer & Subject",
    titleAr: "حالة الرفع (الضمة)",
    titleUrdu: "حالتِ رفع (پیش / ضمہ) - فاعل اور مبتدا",
    summaryEn: "Words in Raf' are marked by a Dammah (ـُ / ـٌ). They represent the Doer (Fā'il), the Subject (Mubtada), or the Predicate (Khabar).",
    summaryUrdu: "رفع کی علامت بنیادی طور پر پیش (ضمہ) ہے۔ یہ فاعل (کام کرنے والے) یا جملے کے اصل مبتدا و خبر کو ظاہر کرتا ہے۔",
    formulaEquation: "فاعل / مبتدا / خبر = مَرْفُوع (ضمة / و)",
    detailedRulesEn: [
      "Default state: Every Arabic noun starts in the state of Raf' unless acted upon by a governing particle.",
      "The Fā'il (Doer of the verb) is always Marfū'. Example: خَلَقَ ٱللَّهُ (Allah created - Allah has Dammah).",
      "Sound masculine plural is marked with Wāw: مُسْلِمُونَ / مُؤْمِنُونَ.",
      "Dual nouns are marked with Alif: مُسْلِمَانِ.",
    ],
    detailedRulesUrdu: [
      "عربی میں اسم کی اصل حالت رفع ہوتی ہے جب تک کوئی عامل اسے تبدیل نہ کرے۔",
      "فعل کا فاعل ہمیشہ مرفوع ہوتا ہے جیسے: 'خَلَقَ ٱللَّهُ' (اللہ نے پیدا کیا)۔",
      "جمع مذکر سالم میں رفع کی علامت 'و' ہے جیسے: مُسْلِمُونَ۔",
      "تثنیہ میں رفع کی علامت 'الف' ہے جیسے: رَجُلَانِ۔",
    ],
    recognitionTipsEn: "Look for the Dammah on the final letter, or the 'ūn' suffix on plural nouns.",
    recognitionTipsUrdu: "کلمے کے آخری حرف پر پیش (ضمہ) یا جمع میں 'ونَ' کی آواز تلاش کریں۔",
    sampleAyahs: [
      {
        surah: 112,
        ayah: 1,
        surahName: "Al-Ikhlas",
        verseText: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        highlightWords: ["ٱللَّهُ", "أَحَدٌ"],
        roleExplanationEn: "ٱللَّهُ is the Subject (Mubtada) with Dammah; أَحَدٌ is the Predicate (Khabar) with Dammatayn.",
        roleExplanationUrdu: "لفظِ جلالہ 'ٱللَّهُ' مبتدا مرفوع ہے، اور 'أَحَدٌ' اس کی خبر مرفوع ہے۔",
        englishTranslation: "Say, 'He is Allah, [who is] One.'",
        urduTranslation: "آپ فرما دیجیے: وہ اللہ ایک ہے۔",
        audioVerseKey: "112:1",
      },
    ],
  },
  {
    id: "rule_irab_nasb",
    pillar: "irab_cases",
    titleEn: "Nasb (The Accusative Case) - The Object & Details",
    titleAr: "حالة النصب (الفتحة)",
    titleUrdu: "حالتِ نصب (زبر / فتحہ) - مفعول اور تفصیلات",
    summaryEn: "Words in Nasb are marked by a Fathah (ـَ / ـً). They answer: 'What?', 'Whom?', 'When?', 'Where?', or 'How?'",
    summaryUrdu: "نصب کی علامت بنیادی طور پر زبر (فتحہ) ہے۔ یہ مفعول بہ (جس پر کام واقع ہوا)، وقت، جگہ یا کیفیت کو ظاہر کرتا ہے۔",
    formulaEquation: "مفعول به / حال / ظرف = مَنْصُوب (فتحة / ي)",
    detailedRulesEn: [
      "The Maf'ūl Bih (direct object) is always Mansūb: عَبَدُوا ٱللَّهَ (They worshipped Allah - Allah has Fathah).",
      "Words after Inna (إِنَّ) become Mansūb: إِنَّ ٱللَّهَ غَفُورٌ.",
      "Sound masculine plural in Nasb is marked with Yā: مُسْلِمِينَ / مُؤْمِنِينَ.",
    ],
    detailedRulesUrdu: [
      "مفعول بہ (جس پر کام کیا گیا) ہمیشہ منصوب ہوتا ہے جیسے: 'ٱعْبُدُوا۟ ٱللَّهَ'۔",
      "حرفِ مشبہ بالفعل 'إِنَّ' کے بعد آنے والا اسم منصوب ہوتا ہے جیسے: 'إِنَّ ٱللَّهَ عَلِيمٌ'۔",
      "جمع مذکر سالم میں نصب کی علامت 'ی' ہے جیسے: مُسْلِمِينَ۔",
    ],
    recognitionTipsEn: "Look for the Fathah on the final letter, Tanwīn Fath (ـً), or the 'īn' suffix on plural nouns.",
    recognitionTipsUrdu: "آخری حرف پر زبر، دو زبر، یا جمع میں 'يْنَ' کی آواز تلاش کریں۔",
    sampleAyahs: [
      {
        surah: 1,
        ayah: 5,
        surahName: "Al-Fatihah",
        verseText: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        highlightWords: ["إِيَّاكَ"],
        roleExplanationEn: "إِيَّاكَ is a detached object pronoun placed first for exclusive restriction (You alone we worship).",
        roleExplanationUrdu: "إِيَّاكَ ضمیرِ مفعولی ہے جو حصر کے لیے مقدم کی گئی ہے۔",
        englishTranslation: "It is You we worship and You we ask for help.",
        urduTranslation: "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔",
        audioVerseKey: "1:5",
      },
    ],
  },
  {
    id: "rule_irab_jarr",
    pillar: "irab_cases",
    titleEn: "Jarr (The Genitive Case) - Prepositions & Possession",
    titleAr: "حالة الجر (الكسرة)",
    titleUrdu: "حالتِ جر (زیر / کسرہ) - اضافت اور حروفِ جارہ",
    summaryEn: "Words in Jarr are marked by a Kasrah (ـِ / ـٍ). A noun ONLY enters Jarr if it follows a Preposition (Harf Jarr) or is possessed (Mudāf Ilayh).",
    summaryUrdu: "جر کی بنیادی علامت زیر (کسرہ) ہے۔ کوئی اسم صرف دو صورتوں میں مجرور ہوتا ہے: حرفِ جر کے بعد آئے، یا مضاف الیہ ہو۔",
    formulaEquation: "حرف جر + اسم مجرور / مضاف إليه = مَجْرُور (كسرة / ي)",
    detailedRulesEn: [
      "Cause 1: Following a preposition like بِ, لِ, مِنْ, إِلَىٰ, عَلَىٰ, فِي, عَنْ: فِي ٱلسَّمَاءِ.",
      "Cause 2: The second word in a possessive phrase (Mudāf Ilayh): كِتَابُ ٱللَّهِ (Book of Allah).",
      "Sound masculine plural takes Yā in Jarr: لِلْمُؤْمِنِينَ.",
    ],
    detailedRulesUrdu: [
      "پہلا سبب: حروفِ جارہ (ب، ل، من، إلى، على، في، عن) کے بعد آنا جیسے 'فِي سَبِيلِ ٱللَّهِ'۔",
      "دوسرا سبب: مضاف الیہ بننا جیسے 'رَسُولُ ٱللَّهِ'۔",
      "جمع مذکر سالم میں جر کی علامت 'ی' ہے جیسے 'لِلْمُحْسِنِينَ'۔",
    ],
    recognitionTipsEn: "Spot prepositions right before the noun, or look for the 'of' possessive relationship.",
    recognitionTipsUrdu: "اسم سے پہلے حرفِ جر دیکھیں، یا ملکیت و نسبت کا رشتہ تلاش کریں۔",
    sampleAyahs: [
      {
        surah: 1,
        ayah: 1,
        surahName: "Al-Fatihah",
        verseText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        highlightWords: ["بِسْمِ", "ٱللَّهِ"],
        roleExplanationEn: "بِ (Preposition) makes ٱسْمِ Majrūr with Kasrah; ٱللَّهِ is Mudāf Ilayh, so it also carries Kasrah.",
        roleExplanationUrdu: "حرفِ جر 'ب' نے 'اسم' کو مجرور کیا، اور 'ٱللَّهِ' مضاف الیہ ہونے کی وجہ سے مجرور ہے۔",
        englishTranslation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        urduTranslation: "اللہ کے نام سے جو نہایت مہربان، ہمیشہ رحم فرمانے والا ہے۔",
        audioVerseKey: "1:1",
      },
    ],
  },

  // --- PILLAR 2: COMPOUNDS (المركبات) ---
  {
    id: "rule_murakkab_idafi",
    pillar: "compounds_murakkab",
    titleEn: "Murakkab Idāfi (The Possessive Construct / Idafah)",
    titleAr: "المركب الإضافي (المضاف والمضاف إليه)",
    titleUrdu: "مرکب اضافی (مضاف اور مضاف الیہ)",
    summaryEn: "A 2-part compound showing belonging, origin, or association ('The X of Y').",
    summaryUrdu: "دو اسماء کا ایسا مرکب جو ملکیت، نسبت یا تعلق کو ظاہر کرے (جیسے 'اللہ کی کتاب')۔",
    formulaEquation: "مُضَاف (بدون ال / تنوين) + مُضَاف إِلَيْهِ (مجرور)",
    detailedRulesEn: [
      "The First Word (Mudāf / Possessed): CANNOT have 'Al-' (ٱلْ) and CANNOT have Tanwīn (ـٌ ـً ـٍ). Its case ending is determined by its role in the sentence.",
      "The Second Word (Mudāf Ilayh / Possessor): Is ALWAYS Majrūr (carrying Kasrah or Yā).",
      "No word can be inserted between Mudāf and Mudāf Ilayh.",
    ],
    detailedRulesUrdu: [
      "پہلا جز (مضاف): اس پر کبھی 'ال' نہیں آتا اور نہ ہی تنوین آتی ہے۔ اس کا اعراب جملے کی ضرورت کے مطابق ہوتا ہے۔",
      "دوسرا جز (مضاف الیہ): ہمیشہ مجرور (زیر والا) ہوتا ہے۔",
      "مضاف اور مضاف الیہ کے درمیان کوئی تیسرا لفظ داخل نہیں ہو سکتا۔",
    ],
    recognitionTipsEn: "First word is naked (no Al, no Tanwin), immediately followed by a noun in Kasrah.",
    recognitionTipsUrdu: "پہلا لفظ بغیر ال اور تنوین کے ہو، اور اس کے فوراً بعد والا اسم زیر (کسرہ) لیے ہوئے ہو۔",
    sampleAyahs: [
      {
        surah: 1,
        ayah: 2,
        surahName: "Al-Fatihah",
        verseText: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        highlightWords: ["رَبِّ", "ٱلْعَـٰلَمِينَ"],
        roleExplanationEn: "رَبِّ is the Mudāf; ٱلْعَـٰلَمِينَ is the Mudāf Ilayh (in Jarr with Yā). Together: 'Lord of the Worlds'.",
        roleExplanationUrdu: "'رَبِّ' مضاف ہے اور 'ٱلْعَـٰلَمِينَ' مضاف الیہ مجرور (ی کے ساتھ) ہے۔ دونوں مل کر مرکب اضافی ہیں۔",
        englishTranslation: "[All] praise is [due] to Allah, Lord of the worlds.",
        urduTranslation: "تمام تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا رب ہے۔",
        audioVerseKey: "1:2",
      },
    ],
  },
  {
    id: "rule_murakkab_tawsifi",
    pillar: "compounds_murakkab",
    titleEn: "Murakkab Tawsīfi (Noun-Adjective Phrase)",
    titleAr: "المركب التوصيفي (الصفة والموصوف)",
    titleUrdu: "مرکب توصیفی (صفت اور موصوف)",
    summaryEn: "A phrase where an adjective describes a noun. The adjective (Sifah) MUST follow the noun (Mawsūf) and match it in 4 dimensions.",
    summaryUrdu: "ایسا مرکب جس میں ایک اسم دوسرے اسم کی خوبی یا صفت بیان کرے۔ صفت اپنے موصوف کے ۴ امور میں مکمل تابع ہوتی ہے۔",
    formulaEquation: "مَوْصُوف + صِفَة (تطابق تام في 4 أمور)",
    detailedRulesEn: [
      "The Sifah must match the Mawsūf in: (1) Definiteness (both have Al- or both have Tanwin), (2) Gender (both Masc or Fem), (3) Number (Singular, Dual, Plural), and (4) I'rab (both Marfū', Mansūb, or Majrūr).",
      "Example: ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ (Both are definite with Al-, both masculine singular, both Mansūb with Fathah).",
    ],
    detailedRulesUrdu: [
      "صفت اپنے موصوف کے ۴ امور میں مطابقت رکھتی ہے: (۱) معرفہ یا نکرہ ہونا، (۲) تذکیر و تانیث، (۳) عدد (واحد، تثنیہ، جمع)، اور (۴) اعراب (رفع، نصب، جر)۔",
      "مثال: 'ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ' (دونوں پر ال ہے، دونوں مذکر واحد ہیں، اور دونوں پر زبر ہے)۔",
    ],
    recognitionTipsEn: "Look for two consecutive nouns that look like twins: same Al-, same ending vowel.",
    recognitionTipsUrdu: "دو ایسے مسلسل کلمات جن کی شکلیں ملتی جلتی ہوں: دونوں پر ال ہو اور دونوں کے آخری اعراب یکساں ہوں۔",
    sampleAyahs: [
      {
        surah: 1,
        ayah: 6,
        surahName: "Al-Fatihah",
        verseText: "ٱهْدِنَا ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ",
        highlightWords: ["ٱلصِّرَاطَ", "ٱلْمُسْتَقِيمَ"],
        roleExplanationEn: "ٱلصِّرَاطَ is the Mawsūf (The Path); ٱلْمُسْتَقِيمَ is the Sifah (The Straight). Both are Mansūb with Fathah.",
        roleExplanationUrdu: "'ٱلصِّرَاطَ' موصوف ہے اور 'ٱلْمُسْتَقِيمَ' صفت۔ دونوں منصوب بالفتحہ ہیں۔",
        englishTranslation: "Guide us to the straight path.",
        urduTranslation: "ہمیں سیدھے راستے پر چلا۔",
        audioVerseKey: "1:6",
      },
    ],
  },

  // --- PILLAR 3: SENTENCES (الجمل) ---
  {
    id: "rule_inna_sisters",
    pillar: "sentences_jumlah",
    titleEn: "Inna and Her Sisters (إنّ وأخواتها)",
    titleAr: "إنّ وأخواتها (الحروف الناسخة)",
    titleUrdu: "إنّ اور اس کی بہنیں (حروفِ مشبہ بالفعل)",
    summaryEn: "Emphatic particles that enter a nominal sentence: they change the Subject (Ism Inna) to Mansūb (Fathah), while the Predicate (Khabar Inna) remains Marfū' (Dammah).",
    summaryUrdu: "وہ تاکیدی حروف جو جملہ اسمیہ پر داخل ہو کر مبتدا کو 'اسمِ إنّ' بنا کر منصوب (زبر) کر دیتے ہیں، اور خبر کو مرفوع (پیش) رہنے دیتے ہیں۔",
    formulaEquation: "إِنَّ + اِسْم إِنَّ (منصوب) + خَبَر إِنَّ (مرفوع)",
    detailedRulesEn: [
      "The Sisters of Inna: إِنَّ (Indeed), أَنَّ (That), كَأَنَّ (As if), لَـٰكِنَّ (However), لَيْتَ (If only), لَعَلَّ (Perhaps/Hoping).",
      "Classic Quranic formula: إِنَّ ٱللَّهَ عَلِيمٌ حَكِيمٌ (Allah has Fathah, 'Alīmun has Dammah).",
    ],
    detailedRulesUrdu: [
      "اخواتِ إنّ: إِنَّ (بے شک)، أَنَّ (کہ)، كَأَنَّ (گویا کہ)، لَـٰكِنَّ (لیکن)، لَيْتَ (کاش)، لَعَلَّ (شاید کہ / تاکہ)۔",
      "قرآنی ضابطہ: 'إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ' میں لفظ اللہ پر زبر ہے جبکہ غفور پر پیش ہے۔",
    ],
    recognitionTipsEn: "Whenever you see إِنَّ or أَنَّ, expect the very next noun to carry a Fathah.",
    recognitionTipsUrdu: "جہاں بھی 'إِنَّ' یا 'أَنَّ' دیکھیں، اس کے بعد والے اسم پر لازماً زبر (فتحہ) کی توقع رکھیں۔",
    sampleAyahs: [
      {
        surah: 2,
        ayah: 153,
        surahName: "Al-Baqarah",
        verseText: "إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
        highlightWords: ["إِنَّ", "ٱللَّهَ"],
        roleExplanationEn: "إِنَّ is the emphatic particle; ٱللَّهَ is Ism Inna (Mansūb with Fathah).",
        roleExplanationUrdu: "'إِنَّ' حرفِ مشبہ بالفعل ہے، اور 'ٱللَّهَ' اس کا اسم ہونے کی بنا پر منصوب بالفتحہ ہے۔",
        englishTranslation: "Indeed, Allah is with the patient.",
        urduTranslation: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔",
        audioVerseKey: "2:153",
      },
    ],
  },
  {
    id: "rule_kaana_sisters",
    pillar: "sentences_jumlah",
    titleEn: "Kāna and Her Sisters (كان وأخواتها)",
    titleAr: "كان وأخواتها (الأفعال الناسخة)",
    titleUrdu: "کان اور اس کی بہنیں (افعالِ ناقصہ)",
    summaryEn: "Auxiliary verbs that enter a nominal sentence: they keep the Subject (Ism Kāna) Marfū' (Dammah), and change the Predicate (Khabar Kāna) to Mansūb (Fathah).",
    summaryUrdu: "افعالِ ناقصہ جو جملہ اسمیہ پر داخل ہو کر مبتدا کو 'اسمِ کان' (مرفوع) رکھتے ہیں اور خبر کو 'خبرِ کان' بنا کر منصوب (زبر) کر دیتے ہیں۔",
    formulaEquation: "كَانَ + اِسْم كَانَ (مرفوع) + خَبَر كَانَ (منصوب)",
    detailedRulesEn: [
      "The Sisters of Kāna: كَانَ (Was/Is continuously), أَصْبَحَ (Became in morning), أَمْسَىٰ (Became in evening), ظَلَّ (Remained), بَاتَ (Spent night), لَيْسَ (Is not).",
      "Classic Quranic formula: وَكَانَ ٱللَّهُ عَلِيمًا حَكِيمًا (Allah has Dammah, 'Alīman Hakīman have Tanwīn Fathah).",
    ],
    detailedRulesUrdu: [
      "اخواتِ کان: كَانَ (تھا / ہمیشہ سے ہے)، أَصْبَحَ (ہو گیا)، لَيْسَ (نہیں ہے) وغیرہ۔",
      "قرآنی ضابطہ: 'وَكَانَ ٱللَّهُ غَفُورًا رَّحِيمًا' میں لفظ اللہ مرفوع ہے جبکہ غفوراً رحیماً پر دو زبر (تنوین نصب) ہیں۔",
    ],
    recognitionTipsEn: "Notice the exact opposite of Inna: Kāna keeps the noun in Dammah and pushes the description into Fathah.",
    recognitionTipsUrdu: "یہ 'إنّ' کا بالکل الٹ عمل ہے: کان اپنے اسم کو پیش اور خبر کو زبر دیتا ہے۔",
    sampleAyahs: [
      {
        surah: 4,
        ayah: 96,
        surahName: "An-Nisa",
        verseText: "وَكَانَ ٱللَّهُ غَفُورًۭا رَّحِيمًۭا",
        highlightWords: ["وَكَانَ", "ٱللَّهُ", "غَفُورًۭا"],
        roleExplanationEn: "كَانَ acts on the sentence: ٱللَّهُ is Ism Kāna (Marfū'); غَفُورًۭا is Khabar Kāna (Mansūb).",
        roleExplanationUrdu: "'كَانَ' فعلِ ناقص ہے؛ 'ٱللَّهُ' اس کا اسم مرفوع اور 'غَفُورًۭا' اس کی خبر منصوب ہے۔",
        englishTranslation: "And Allah is ever Forgiving and Merciful.",
        urduTranslation: "اور اللہ ہمیشہ سے بخشنے والا، نہایت رحم فرمانے والا ہے۔",
        audioVerseKey: "4:96",
      },
    ],
  },
];

// ============================================================================
// 3. AUTHENTIC QUIZ QUESTIONS FOR TESTING & MEMORIZATION
// ============================================================================

export const GRAMMAR_QUIZ_QUESTIONS: GrammarQuizQuestion[] = [
  {
    id: "gq_1",
    type: "verb_form",
    promptVerseAr: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    promptVerseEn: "Who whispers into the breasts of mankind...",
    promptVerseUrdu: "جو لوگوں کے سینوں میں وسوسے ڈالتا ہے...",
    surahReference: "114:5",
    highlightWord: "يُوَسْوِسُ",
    questionEn: "What is the primary grammatical classification of 'يُوَسْوِسُ' in this verse?",
    questionUrdu: "اس آیت میں لفظ 'يُوَسْوِسُ' کی بنیادی نحوی حیثیت کیا ہے؟",
    options: [
      { textEn: "Present Tense Verb (فعل مضارع)", textUrdu: "فعل مضارع", textAr: "فعل مضارع", isCorrect: true },
      { textEn: "Past Tense Verb (فعل ماض)", textUrdu: "فعل ماضی", textAr: "فعل ماض", isCorrect: false },
      { textEn: "Verbal Noun / Masdar (مصدر)", textUrdu: "مصدر", textAr: "مصدر", isCorrect: false },
      { textEn: "Active Participle (اسم فاعل)", textUrdu: "اسم فاعل", textAr: "اسم فاعل", isCorrect: false },
    ],
    explanationEn: "يُوَسْوِسُ begins with the present tense prefix 'yu-' and denotes an ongoing action (whispering).",
    explanationUrdu: "'يُوَسْوِسُ' علامتِ مضارع 'ی' سے شروع ہوتا ہے اور مسلسل ہونے والے عمل پر دلالت کرتا ہے۔",
  },
  {
    id: "gq_2",
    type: "verb_form",
    promptVerseAr: "إِنَّآ أَنزَلْنَـٰهُ فِى لَيْلَةِ ٱلْقَدْرِ",
    promptVerseEn: "Indeed, We sent it down in the Night of Decree...",
    promptVerseUrdu: "بے شک ہم نے اسے شبِ قدر میں نازل فرمایا...",
    surahReference: "97:1",
    highlightWord: "أَنزَلْنَـٰهُ",
    questionEn: "Which augmented Verb Form does 'أَنزَلَ' belong to?",
    questionUrdu: "لفظ 'أَنزَلَ' کس قرآنی باب (Verb Form) سے تعلق رکھتا ہے؟",
    options: [
      { textEn: "Form IV (أَفْعَلَ - باب الإفعال)", textUrdu: "باب الإفعال (Form IV)", textAr: "أَفْعَلَ", isCorrect: true },
      { textEn: "Form II (فَعَّلَ - باب التفعيل)", textUrdu: "باب التفعیل (Form II)", textAr: "فَعَّلَ", isCorrect: false },
      { textEn: "Form I (فَعَلَ - الثلاثي المجرد)", textUrdu: "ثلاثی مجرد (Form I)", textAr: "فَعَلَ", isCorrect: false },
      { textEn: "Form X (اِسْتَفْعَلَ - باب الاستفعال)", textUrdu: "باب الاستفعال (Form X)", textAr: "اِسْتَفْعَلَ", isCorrect: false },
    ],
    explanationEn: "أَنْزَلَ matches the pattern أَفْعَلَ (Form IV), featuring a prefix Hamzah to make the intransitive 'nazala' (descend) causative (send down).",
    explanationUrdu: "'أَنْزَلَ' باب افعال (أَفْعَلَ) کے وزن پر ہے جس میں ہمزۂ تعدیہ کے ذریعے لازم کو متعدی بنایا گیا ہے۔",
  },
  {
    id: "gq_3",
    type: "verb_form",
    promptVerseAr: "فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًۭا",
    promptVerseEn: "And I said, 'Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver...'",
    promptVerseUrdu: "تو میں نے کہا کہ اپنے رب سے بخشش مانگو، بے شک وہ بڑا بخشنے والا ہے...",
    surahReference: "71:10",
    highlightWord: "ٱسْتَغْفِرُوا۟",
    questionEn: "What is the Verb Form and root of 'ٱسْتَغْفِرُوا۟'?",
    questionUrdu: "لفظ 'ٱسْتَغْفِرُوا۟' کا باب (Verb Form) اور مادہ (Root) کیا ہے؟",
    options: [
      { textEn: "Form X (اِسْتَفْعَلَ), Root: غ-ف-ر", textUrdu: "باب الاستفعال (Form X)، مادہ: غ-ف-ر", textAr: "Form X (غ-ف-ر)", isCorrect: true },
      { textEn: "Form VIII (اِفْتَعَلَ), Root: س-غ-ف", textUrdu: "باب الافتعال (Form VIII)، مادہ: س-غ-ف", textAr: "Form VIII", isCorrect: false },
      { textEn: "Form IV (أَفْعَلَ), Root: غ-ف-ر", textUrdu: "باب الإفعال (Form IV)، مادہ: غ-ف-ر", textAr: "Form IV", isCorrect: false },
      { textEn: "Form II (فَعَّلَ), Root: غ-ف-ر", textUrdu: "باب التفعیل (Form II)، مادہ: غ-ف-ر", textAr: "Form II", isCorrect: false },
    ],
    explanationEn: "The prefix 'Ista-' denotes seeking (Talab). Combined with root Gh-F-R, it means 'seek forgiveness' in Form X.",
    explanationUrdu: "شروع میں 'است' کی علامت طلب کے لیے ہے؛ غ-ف-ر مادے کے ساتھ مل کر یہ باب استفعال (طلبِ مغفرت) بنتا ہے۔",
  },
  {
    id: "gq_4",
    type: "compound_type",
    promptVerseAr: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
    promptVerseEn: "[All] praise is [due] to Allah, Lord of the worlds...",
    promptVerseUrdu: "سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا رب ہے...",
    surahReference: "1:2",
    highlightWord: "رَبِّ ٱلْعَـٰلَمِينَ",
    questionEn: "What type of compound phrase is 'رَبِّ ٱلْعَـٰلَمِينَ'?",
    questionUrdu: "'رَبِّ ٱلْعَـٰلَمِينَ' کس قسم کا مرکب ہے؟",
    options: [
      { textEn: "Murakkab Idāfi / Possessive Construct (مركب إضافي)", textUrdu: "مرکب اضافی (مضاف اور مضاف الیہ)", textAr: "مركب إضافي", isCorrect: true },
      { textEn: "Murakkab Tawsīfi / Adjective Phrase (مركب توصيفي)", textUrdu: "مرکب توصیفی (صفت و موصوف)", textAr: "مركب توصيفي", isCorrect: false },
      { textEn: "Murakkab Ishāri / Demonstrative (مركب إشاري)", textUrdu: "مرکب اشاری", textAr: "مركب إشاري", isCorrect: false },
      { textEn: "Jumlah Ismiyyah / Nominal Sentence (جملة اسمية)", textUrdu: "مکمل جملہ اسمیہ", textAr: "جملة اسمية", isCorrect: false },
    ],
    explanationEn: "رَبِّ is Mudāf (no Al, no Tanwin) and ٱلْعَـٰلَمِينَ is Mudāf Ilayh (in Jarr with Yā), forming a classic possessive relationship.",
    explanationUrdu: "'رَبِّ' مضاف ہے اور 'ٱلْعَـٰلَمِينَ' مضاف الیہ مجرور ہے۔ دونوں مل کر مرکب اضافی بناتے ہیں۔",
  },
  {
    id: "gq_5",
    type: "irab_case",
    promptVerseAr: "إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
    promptVerseEn: "Indeed, Allah is with the patient.",
    promptVerseUrdu: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔",
    surahReference: "2:153",
    highlightWord: "ٱللَّهَ",
    questionEn: "Why does the word 'ٱللَّهَ' carry a Fathah (ـَ) in this verse?",
    questionUrdu: "اس آیت میں لفظِ جلالہ 'ٱللَّهَ' پر زبر (فتحہ) کیوں ہے؟",
    options: [
      { textEn: "It is Ism Inna (اسم إنّ منصوب)", textUrdu: "کیونکہ یہ 'إنّ' کا اسم ہے اور اسمِ إنّ منصوب ہوتا ہے", textAr: "اسم إنّ منصوب", isCorrect: true },
      { textEn: "It is the Doer / Subject of a verb (فاعل)", textUrdu: "کیونکہ یہ فاعل ہے", textAr: "فاعل مرفوع", isCorrect: false },
      { textEn: "It comes after a Preposition (اسم مجرور)", textUrdu: "کیونکہ اس سے پہلے حرفِ جر ہے", textAr: "اسم مجرور", isCorrect: false },
      { textEn: "It is a Predicate / Khabar (خبر)", textUrdu: "کیونکہ یہ خبر ہے", textAr: "خبر", isCorrect: false },
    ],
    explanationEn: "The particle 'إِنَّ' changes its subject (Ism Inna) to the accusative case (Nasb), marked with Fathah.",
    explanationUrdu: "حرفِ مشبہ بالفعل 'إِنَّ' اپنے اسم پر داخل ہو کر اسے حالتِ نصب (زبر) دیتا ہے۔",
  },
  {
    id: "gq_6",
    type: "sentence_role",
    promptVerseAr: "وَكَانَ ٱللَّهُ غَفُورًۭا رَّحِيمًۭا",
    promptVerseEn: "And Allah is ever Forgiving and Merciful.",
    promptVerseUrdu: "اور اللہ ہمیشہ سے بڑا بخشنے والا، نہایت رحم والا ہے۔",
    surahReference: "4:96",
    highlightWord: "غَفُورًۭا",
    questionEn: "Why is 'غَفُورًۭا' in the state of Nasb with Tanwīn Fathah?",
    questionUrdu: "اس آیت میں 'غَفُورًۭا' دو زبر کے ساتھ حالتِ نصب میں کیوں ہے؟",
    options: [
      { textEn: "It is the Predicate of Kāna (خبر كان منصوب)", textUrdu: "کیونکہ یہ 'كان' کی خبر ہے اور خبرِ کان منصوب ہوتی ہے", textAr: "خبر كان", isCorrect: true },
      { textEn: "It is the Subject of Kāna (اسم كان)", textUrdu: "کیونکہ یہ کان کا اسم ہے", textAr: "اسم كان", isCorrect: false },
      { textEn: "It is Mudāf Ilayh (مضاف إليه)", textUrdu: "کیونکہ یہ مضاف الیہ ہے", textAr: "مضاف إليه", isCorrect: false },
      { textEn: "It is preceded by a Harf Jarr", textUrdu: "کیونکہ اس سے پہلے حرفِ جر ہے", textAr: "مجرور بحرف الجر", isCorrect: false },
    ],
    explanationEn: "Kāna keeps its subject in Raf' (ٱللَّهُ) and makes its predicate Mansūb (غَفُورًۭا).",
    explanationUrdu: "'کان' اپنے اسم کو مرفوع اور اپنی خبر کو حالتِ نصب (زبر) دیتا ہے۔",
  },
  {
    id: "gq_7",
    type: "compound_type",
    promptVerseAr: "ٱهْدِنَا ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ",
    promptVerseEn: "Guide us to the straight path.",
    promptVerseUrdu: "ہمیں سیدھے راستے پر چلا۔",
    surahReference: "1:6",
    highlightWord: "ٱلصِّرَاطَ ٱلْمُسْتَقِيمَ",
    questionEn: "Why do both 'ٱلصِّرَاطَ' and 'ٱلْمُسْتَقِيمَ' have 'Al-' and Fathah?",
    questionUrdu: "'ٱلصِّرَاطَ' اور 'ٱلْمُسْتَقِيمَ' دونوں پر 'ال' اور زبر کیوں ہے؟",
    options: [
      { textEn: "Murakkab Tawsīfi: Sifah matches Mawsūf in definiteness and case (مركب توصيفي)", textUrdu: "مرکب توصیفی: صفت اپنے موصوف کے اعراب اور معرفہ ہونے میں پیروی کرتی ہے", textAr: "مركب توصيفي", isCorrect: true },
      { textEn: "Murakkab Idāfi: One word owns the other", textUrdu: "مرکب اضافی: ایک اسم دوسرے کی ملکیت ہے", textAr: "مركب إضافي", isCorrect: false },
      { textEn: "Both words are separate verbs", textUrdu: "دونوں الگ الگ افعال ہیں", textAr: "أفعال", isCorrect: false },
      { textEn: "It is a Mubtada and Khabar sentence", textUrdu: "یہ مبتدا اور خبر کا مکمل جملہ ہے", textAr: "مبتدأ وخبر", isCorrect: false },
    ],
    explanationEn: "In an adjective phrase (Murakkab Tawsīfi), the adjective matches the noun in definiteness (both have Al-) and case (both are Mansūb with Fathah).",
    explanationUrdu: "مرکب توصیفی میں صفت (ٱلْمُسْتَقِيمَ) اپنے موصوف (ٱلصِّرَاطَ) کے معرفہ ہونے اور حالتِ نصب میں مکمل موافقت رکھتی ہے۔",
  },
];

