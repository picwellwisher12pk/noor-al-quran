/**
 * Canonical Curriculum Roadmap for Gamified Quranic Arabic Learning
 * 5 Stages ("Path of Light" / Sirat) from Alphabet to Ayah Immersion
 * Complete with authentic English, Arabic, and Urdu localized metadata.
 */

export interface SkillNode {
  id: string;
  unitId: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  titleArabic: string;
  titleUrdu?: string;
  subtitle: string;
  subtitleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  nodeType: "lesson" | "checkpoint" | "boss_gate";
  estimatedMinutes: number;
  xpReward: number;
  gemReward: number;
  iconName: string;
  surahReference?: string;
  prerequisiteNodeId?: string;
}

export interface SkillUnit {
  id: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  unitIndex: number;
  title: string;
  titleArabic: string;
  titleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  nodes: SkillNode[];
}

export interface SkillPhase {
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  id: string;
  title: string;
  titleArabic: string;
  titleUrdu?: string;
  subtitle: string;
  subtitleUrdu?: string;
  goal: string;
  goalUrdu?: string;
  targetComprehensionPct: number;
  colorTheme: {
    primary: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
  units: SkillUnit[];
}

export const CURRICULUM_PHASES: SkillPhase[] = [
  {
    phaseNumber: 1,
    id: "stage_1_foundation",
    title: "Stage 1: The Script & Sound",
    titleArabic: "المرحلة الأولى: الأساس والحروف",
    titleUrdu: "مرحلہ ۱: رسم الخط اور صوتیات",
    subtitle: "Reading & Tajweed Basics",
    subtitleUrdu: "قرآنی حروف، مخارج اور تجویدی قواعد",
    goal: "Go from zero knowledge to reading Quranic words accurately with Tajweed rules.",
    goalUrdu: "قرآنی کلمات کو درست مخارج اور بنیادی تجویدی اصولوں کے ساتھ روانی سے پڑھنا سیکھیں۔",
    targetComprehensionPct: 15,
    colorTheme: {
      primary: "emerald",
      border: "border-emerald-500/30 dark:border-emerald-500/40",
      bg: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-teal-950/20",
      text: "text-emerald-700 dark:text-emerald-400",
      glow: "shadow-emerald-500/20"
    },
    units: [
      {
        id: "u1_alphabet_makharij",
        phaseNumber: 1,
        unitIndex: 1,
        title: "Unit 1: Alphabet & Articulation Points",
        titleArabic: "الوحدة الأولى: الحروف ومخارجها",
        titleUrdu: "یونٹ ۱: حروفِ تہجی اور ان کے مخارج",
        description: "Master all 28 letter glyphs, forms, and throat/tongue articulation points.",
        descriptionUrdu: "تمام ۲۸ قرآنی حروف، ان کی اشکال اور حلق و زبان کے مخارج پر مکمل دسترس حاصل کریں۔",
        nodes: [
          {
            id: "s1_u1_n1",
            unitId: "u1_alphabet_makharij",
            phaseNumber: 1,
            title: "The 28 Letters & Shapes",
            titleArabic: "حروف الهجاء وأشكالها",
            titleUrdu: "۲۸ قرآنی حروف اور ان کی اشکال",
            subtitle: "Isolated, initial, medial & final forms",
            subtitleUrdu: "الگ، ابتدائی، درمیانی اور آخری اشکال",
            description: "Learn to recognize and pronounce every Arabic consonant from Alif to Yaa.",
            descriptionUrdu: "الف سے ی تک تمام عربی حروف کی شناخت اور درست تلفظ سیکھیں۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 30,
            gemReward: 5,
            iconName: "SpellCheck"
          },
          {
            id: "s1_u1_n2",
            unitId: "u1_alphabet_makharij",
            phaseNumber: 1,
            title: "Makharij Articulation",
            titleArabic: "مخارج الحروف الصوتية",
            titleUrdu: "حروف کے مخارج کی پہچان",
            subtitle: "Throat, tongue, lips & nasal cavity",
            subtitleUrdu: "حلق، زبان، ہونٹ اور خیشوم",
            description: "Visual and audio guidance on where distinct sounds originate in the vocal tract.",
            descriptionUrdu: "حروف کے ادا ہونے کی اصل جگہوں کی صوتی اور تصویری رہنمائی۔",
            nodeType: "lesson",
            estimatedMinutes: 5,
            xpReward: 35,
            gemReward: 5,
            iconName: "Mic",
            prerequisiteNodeId: "s1_u1_n1"
          },
          {
            id: "s1_u1_n3",
            unitId: "u1_alphabet_makharij",
            phaseNumber: 1,
            title: "Harakat & Short Vowels",
            titleArabic: "الحركات والتشكيل",
            titleUrdu: "حرکات اور اعراب (زبر، زیر، پیش)",
            subtitle: "Fatha (ـَ), Kasra (ـِ), Damma (ـُ)",
            subtitleUrdu: "فتحه (ـَ)، کسره (ـِ)، ضمه (ـُ)",
            description: "Vowelizing consonants with crisp vertical opening, lowering, and lip rounding.",
            descriptionUrdu: "حروف کو حرکات کے ساتھ صوتی توازن کے ساتھ ادا کرنے کی مشق۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 30,
            gemReward: 5,
            iconName: "Volume2",
            prerequisiteNodeId: "s1_u1_n2"
          },
          {
            id: "s1_u1_checkpoint",
            unitId: "u1_alphabet_makharij",
            phaseNumber: 1,
            title: "Sound Sniper Checkpoint",
            titleArabic: "بوابة فحص الحروف والأصوات",
            titleUrdu: "چیک پوائنٹ: صوتی امتحانی مقابلہ",
            subtitle: "15 Rapid-Fire Pronunciation Questions",
            subtitleUrdu: "۱۵ تیز رفتار سوالات کا صوتی ٹیسٹ",
            description: "Prove your ear and eye coordination under the 15-second pressure timer.",
            descriptionUrdu: "محدود وقت میں آواز سن کر درست عربی حرف کی فوری شناخت کریں۔",
            nodeType: "checkpoint",
            estimatedMinutes: 5,
            xpReward: 100,
            gemReward: 20,
            iconName: "ShieldAlert",
            prerequisiteNodeId: "s1_u1_n3"
          }
        ]
      },
      {
        id: "u2_word_joining_tajweed",
        phaseNumber: 1,
        unitIndex: 2,
        title: "Unit 2: Word Joining & Flow",
        titleArabic: "الوحدة الثانية: وصل الحروف والتجويد",
        titleUrdu: "یونٹ ۲: حروف کا جوڑ اور تجوید کا بہاؤ",
        description: "Connect letters into actual Quranic words with Sukoon, Shaddah, and Madd.",
        descriptionUrdu: "سکون، تشدید اور مد کے ساتھ قرآنی الفاظ کی باہم روانی اور ادائیگی۔",
        nodes: [
          {
            id: "s1_u2_n1",
            unitId: "u2_word_joining_tajweed",
            phaseNumber: 1,
            title: "Sukoon & Tanween",
            titleArabic: "السكون والتنوين",
            titleUrdu: "سکون اور تنوین کے احکام",
            subtitle: "Vowel stops and -un, -an, -in endings",
            subtitleUrdu: "جزم (ـْ) اور دو زبر، دو زیر، دو پیش (ـً ـٍ ـٌ)",
            description: "Learn how silence (Sukoon) and indefinite nunation (Tanween) change word rhythm.",
            descriptionUrdu: "سکون اور تنوین کی آواز اور ادغام، اخفاء اور اظہار کی بنیادی سمجھ۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 35,
            gemReward: 5,
            iconName: "Sparkles",
            prerequisiteNodeId: "s1_u1_checkpoint"
          },
          {
            id: "s1_u2_n2",
            unitId: "u2_word_joining_tajweed",
            phaseNumber: 1,
            title: "Shaddah & Doubling",
            titleArabic: "الشَّدَّة وإدغام الحروف",
            titleUrdu: "تشدید اور حروف کا ادغام",
            subtitle: "Holding consonants with power",
            subtitleUrdu: "حروف کی دگنی اور پرزور ادائیگی",
            description: "Master geminated consonants where the first letter holds sukoon and the second is vocalized.",
            descriptionUrdu: "مشدد حروف کی خوبصورت اور پختہ ادائیگی پر مکمل مہارت۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 35,
            gemReward: 5,
            iconName: "Zap",
            prerequisiteNodeId: "s1_u2_n1"
          },
          {
            id: "s1_u2_boss",
            unitId: "u2_word_joining_tajweed",
            phaseNumber: 1,
            title: "Boss Gate: Surah Al-Fatihah",
            titleArabic: "تحدي الزعيم: سورة الفاتحة",
            titleUrdu: "بوس گیٹ: سورة الفاتحة کا مکمل امتحان",
            subtitle: "Read & construct all 7 verses perfectly",
            subtitleUrdu: "تمام ۷ آیات کی تلاوت اور لفظ بہ لفظ ترتیب",
            description: "The ultimate Foundation exam: reconstruct the Mother of the Book Ayah by Ayah.",
            descriptionUrdu: "ام الکتاب سورة الفاتحة کو آیت بہ آیت مکمل جوڑ کر سند حاصل کریں۔",
            nodeType: "boss_gate",
            estimatedMinutes: 6,
            xpReward: 250,
            gemReward: 50,
            iconName: "Crown",
            surahReference: "1:1-7",
            prerequisiteNodeId: "s1_u2_n2"
          }
        ]
      }
    ]
  },
  {
    phaseNumber: 2,
    id: "stage_2_high_frequency",
    title: "Stage 2: The 50% Milestone",
    titleArabic: "المرحلة الثانية: محطة الخمسين بالمئة",
    titleUrdu: "مرحلہ ۲: قرآنی ذخیرہ الفاظ اور ۵۰٪ تک کا سنگِ میل",
    subtitle: "High-Frequency Words & Essential Particles",
    subtitleUrdu: "قرآن کے سب سے زیادہ کثرت سے آنے والے کلمات اور حروف",
    goal: "Understand 50% of the words on any page of the Quran within the first month.",
    goalUrdu: "قرآن مجید کے ہر صفحے پر آنے والے ۵۰٪ الفاظ کا فہم حاصل کریں۔",
    targetComprehensionPct: 50,
    colorTheme: {
      primary: "amber",
      border: "border-amber-500/30 dark:border-amber-500/40",
      bg: "from-amber-500/10 to-yellow-500/5 dark:from-amber-950/40 dark:to-yellow-950/20",
      text: "text-amber-700 dark:text-amber-400",
      glow: "shadow-amber-500/20"
    },
    units: [
      {
        id: "u3_golden_particles",
        phaseNumber: 2,
        unitIndex: 1,
        title: "Unit 1: The Golden Particles",
        titleArabic: "الوحدة الأولى: حروف الجر والعطف الذهبية",
        titleUrdu: "یونٹ ۱: سنہرے حروفِ جارہ و عاطفہ",
        description: "The glue of the Arabic language: prepositions and connectors appearing 10,000+ times.",
        descriptionUrdu: "قرآن میں ۱۰،۰۰۰ سے زائد بار آنے والے کلماتِ ربط اور حروفِ جر۔",
        nodes: [
          {
            id: "s2_u1_n1",
            unitId: "u3_golden_particles",
            phaseNumber: 2,
            title: "Prepositions: Min, Fi, 'Ala, Ila",
            titleArabic: "حروف الجر: مِنْ، فِي، عَلَى، إِلَى",
            titleUrdu: "حروفِ جر: مِنْ، فِي، عَلَى، إِلَى",
            subtitle: "Locations, origins, and directions",
            subtitleUrdu: "مقامات، سمتیں اور نسبتیں (سے، میں، پر، طرف)",
            description: "Understand the 4 most frequent prepositions in the Quran with instant context.",
            descriptionUrdu: "قرآن کے ۴ کثیر الاستعمال حروفِ جر کا فوری اور سیاقی فہم۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 40,
            gemReward: 8,
            iconName: "Compass",
            prerequisiteNodeId: "s1_u2_boss"
          },
          {
            id: "s2_u1_n2",
            unitId: "u3_golden_particles",
            phaseNumber: 2,
            title: "Connectors: Wa, Fa, Thumma",
            titleArabic: "حروف العطف: وَ، فَـ، ثُمَّ",
            titleUrdu: "حروفِ عطف: وَ، فَـ، ثُمَّ",
            subtitle: "And, so, then & sequence",
            subtitleUrdu: "اور، پس، پھر (تسلسل اور تعقیب)",
            description: "Recognize how the Quran links clauses with speed (Fa) or deliberate delay (Thumma).",
            descriptionUrdu: "قرآنی جملوں کے باہمی ربط اور فوری یا تاخیری تسلسل کو سمجھیں۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 40,
            gemReward: 8,
            iconName: "GitMerge",
            prerequisiteNodeId: "s2_u1_n1"
          },
          {
            id: "s2_u1_checkpoint",
            unitId: "u3_golden_particles",
            phaseNumber: 2,
            title: "Particles Rapid Checkpoint",
            titleArabic: "بوابة فحص الحروف الذهبية",
            titleUrdu: "چیک پوائنٹ: سنہرے حروف کا جائزہ",
            subtitle: "15-Question timed particles audit",
            subtitleUrdu: "۱۵ وقتی سوالات پر مشتمل تیز رفتار امتحان",
            description: "Demonstrate instant recall of prepositional nuances without hints.",
            descriptionUrdu: "بغیر اشاروں کے حروف کے معانی اور استعمال کی فوری جانچ۔",
            nodeType: "checkpoint",
            estimatedMinutes: 5,
            xpReward: 120,
            gemReward: 25,
            iconName: "ShieldAlert",
            prerequisiteNodeId: "s2_u1_n2"
          }
        ]
      },
      {
        id: "u4_pronouns_pointers",
        phaseNumber: 2,
        unitIndex: 2,
        title: "Unit 2: Pronouns & Demonstrative Pointers",
        titleArabic: "الوحدة الثانية: الضمائر وأسماء الإشارة",
        titleUrdu: "یونٹ ۲: ضمائر اور اسمائے اشارہ",
        description: "Master Huwa, Hum, Antum, Hadha, Dhalika and attached possessive pronouns.",
        descriptionUrdu: "ہُوَ، ہُمْ، أَنْتُمْ، ہٰذَا، ذٰلِكَ اور متصل ضمائر پر مکمل تسلط۔",
        nodes: [
          {
            id: "s2_u2_n1",
            unitId: "u4_pronouns_pointers",
            phaseNumber: 2,
            title: "Detached Pronouns",
            titleArabic: "الضمائر المنفصلة",
            titleUrdu: "ضمائرِ منفصلہ (وہ، تم، ہم)",
            subtitle: "Huwa (He), Hum (They), Nahnu (We)",
            subtitleUrdu: "ہُوَ (وہ)، ہُمْ (وہ سب)، نَحْنُ (ہم)",
            description: "The core identity markers used throughout prophetic and theological dialogues.",
            descriptionUrdu: "ایمانی اور توحیدی بیانات میں استعمال ہونے والے بنیادی ضمائر۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 45,
            gemReward: 10,
            iconName: "Users",
            prerequisiteNodeId: "s2_u1_checkpoint"
          },
          {
            id: "s2_u2_n2",
            unitId: "u4_pronouns_pointers",
            phaseNumber: 2,
            title: "Pointers: Hadha & Dhalika",
            titleArabic: "أسماء الإشارة: هَـٰذَا وذَٰلِكَ",
            titleUrdu: "اسمائے اشارہ: ہٰذَا اور ذٰلِكَ",
            subtitle: "Pointing near and far",
            subtitleUrdu: "قریب اور دور کا اشارہ (یہ، وہ)",
            description: "Discover why the Quran says 'Dhalika al-Kitab' (That is the Book) instead of 'Hadha'.",
            descriptionUrdu: "قرآن مجید میں 'ذٰلِكَ الْكِتَابُ' کی تعظیمی بلاغت اور حکمت کا فہم۔",
            nodeType: "lesson",
            estimatedMinutes: 4,
            xpReward: 45,
            gemReward: 10,
            iconName: "Navigation",
            prerequisiteNodeId: "s2_u2_n1"
          },
          {
            id: "s2_u2_boss",
            unitId: "u4_pronouns_pointers",
            phaseNumber: 2,
            title: "Boss Gate: Surah Al-Ikhlas & Al-Kawthar",
            titleArabic: "تحدي الزعيم: الإخلاص والكوثر",
            titleUrdu: "بوس گیٹ: سورة الإخلاص اور الکوثر",
            subtitle: "Pure Monotheism & Divine Abundance",
            subtitleUrdu: "خالص توحید اور خیرِ کثیر کا قرآنی فہم",
            description: "Grammatically deconstruct Surah Al-Ikhlas and Al-Kawthar with zero heart loss.",
            descriptionUrdu: "سورة الإخلاص اور سورة الکوثر کا لفظ بہ لفظ اور نحوی جائزہ۔",
            nodeType: "boss_gate",
            estimatedMinutes: 6,
            xpReward: 300,
            gemReward: 60,
            iconName: "Crown",
            surahReference: "112:1-4 & 108:1-3",
            prerequisiteNodeId: "s2_u2_n2"
          }
        ]
      }
    ]
  },
  {
    phaseNumber: 3,
    id: "stage_3_nahw_syntax",
    title: "Stage 3: The Grammar Engine",
    titleArabic: "المرحلة الثالثة: محرك النحو والتركيب",
    titleUrdu: "مرحلہ ۳: قرآنی گرامر اور نحو کا انجن",
    subtitle: "Nahw - Sentence Structure & Case Endings",
    subtitleUrdu: "نحو: جملے کی ساخت اور اعراب کی تبدیلیاں",
    goal: "Understand how words interact to form meaning and why word endings change.",
    goalUrdu: "سمجھیں کہ قرآنی کلمات کیسے مل کر مکمل مفہوم بناتے ہیں اور ان کے اعراب کیوں بدلتے ہیں۔",
    targetComprehensionPct: 70,
    colorTheme: {
      primary: "blue",
      border: "border-blue-500/30 dark:border-blue-500/40",
      bg: "from-blue-500/10 to-sky-500/5 dark:from-blue-950/40 dark:to-sky-950/20",
      text: "text-blue-700 dark:text-blue-400",
      glow: "shadow-blue-500/20"
    },
    units: [
      {
        id: "u5_word_types_irab",
        phaseNumber: 3,
        unitIndex: 1,
        title: "Unit 1: The Three Word Types & I'rab",
        titleArabic: "الوحدة الأولى: أقسام الكلمة والإعراب",
        titleUrdu: "یونٹ ۱: کلمہ کی تین اقسام اور اعراب",
        description: "Ism vs. Fi'l vs. Harf, and understanding Raf' (Doer), Nasb (Detail), Jarr (After preposition).",
        descriptionUrdu: "اسم، فعل اور حرف کی تمیز؛ رفع (فاعل)، نصب (مفعول) اور جر (اضافت/حرف جر)۔",
        nodes: [
          {
            id: "s3_u1_n1",
            unitId: "u5_word_types_irab",
            phaseNumber: 3,
            title: "Ism, Fi'l, and Harf",
            titleArabic: "اسم، فعل، وحرف",
            titleUrdu: "اسم، فعل اور حرف کی تمیز",
            subtitle: "The 3 universal categories",
            subtitleUrdu: "کلام کے ۳ بنیادی اجزاء",
            description: "Learn foolproof tests to identify whether any Quranic word is an Ism, Fi'l, or Harf.",
            descriptionUrdu: "قرآن کے کسی بھی کلمے کو اسم، فعل یا حرف میں پرکھنے کی قطعی علامات۔",
            nodeType: "lesson",
            estimatedMinutes: 5,
            xpReward: 50,
            gemReward: 10,
            iconName: "Layers",
            prerequisiteNodeId: "s2_u2_boss"
          },
          {
            id: "s3_u1_n2",
            unitId: "u5_word_types_irab",
            phaseNumber: 3,
            title: "The Case System: Raf', Nasb, Jarr",
            titleArabic: "علامات الإعراب: الرفع، النصب، الجر",
            titleUrdu: "اعراب کا نظام: رفع، نصب اور جر",
            subtitle: "Who did it? What happened? Where?",
            subtitleUrdu: "فاعل (پیش)، مفعول (زبر) اور مضاف الیہ/مجرور (زیر)",
            description: "Understand why word endings change without memorizing complicated dry jargon.",
            descriptionUrdu: "پیش، زبر اور زیر کی تبدیلیوں سے بدلتے ہوئے مفاہیم کو سمجھیں۔",
            nodeType: "lesson",
            estimatedMinutes: 5,
            xpReward: 50,
            gemReward: 10,
            iconName: "Sliders",
            prerequisiteNodeId: "s3_u1_n1"
          },
          {
            id: "s3_u1_boss",
            unitId: "u5_word_types_irab",
            phaseNumber: 3,
            title: "Boss Gate: Surah Al-Asr Mastery",
            titleArabic: "تحدي الزعيم: سورة العصر",
            titleUrdu: "بوس گیٹ: سورة العصر کی نحوی تفہیم",
            subtitle: "Grammar breakdown of Surah Al-Asr",
            subtitleUrdu: "سورة العصر کا مکمل گرامر تجزیہ",
            description: "Classify all nouns, verbs, and particles in Surah Al-Asr with perfect accuracy.",
            descriptionUrdu: "سورة العصر کے تمام اسماء، افعال اور حروف کی درست درجہ بندی کریں۔",
            nodeType: "boss_gate",
            estimatedMinutes: 6,
            xpReward: 350,
            gemReward: 70,
            iconName: "Crown",
            surahReference: "103:1-3",
            prerequisiteNodeId: "s3_u1_n2"
          }
        ]
      }
    ]
  },
  {
    phaseNumber: 4,
    id: "stage_4_sarf_morphology",
    title: "Stage 4: Root & Pattern Matrix",
    titleArabic: "المرحلة الرابعة: مصفوفة الجذور والصرف",
    titleUrdu: "مرحلہ ۴: مادہ اور اوزان کی مصفوفہ (صرف)",
    subtitle: "Sarf - Derivations & The 10 Verb Forms",
    subtitleUrdu: "صرف: مشتقات اور ۱۰ قرآنی ابواب",
    goal: "Unlock the secret of Arabic: deriving dozens of words from a single 3-letter root.",
    goalUrdu: "عربی زبان کے راز کو کھولیں: ایک ۳ حروفی مادے سے درجنوں بامعنی کلمات بنانا۔",
    targetComprehensionPct: 85,
    colorTheme: {
      primary: "purple",
      border: "border-purple-500/30 dark:border-purple-500/40",
      bg: "from-purple-500/10 to-indigo-500/5 dark:from-purple-950/40 dark:to-indigo-950/20",
      text: "text-purple-700 dark:text-purple-400",
      glow: "shadow-purple-500/20"
    },
    units: [
      {
        id: "u6_roots_and_patterns",
        phaseNumber: 4,
        unitIndex: 1,
        title: "Unit 1: The Triliteral Root System",
        titleArabic: "الوحدة الأولى: نظام الجذور الثلاثية",
        titleUrdu: "یونٹ ۱: ثلاثی مجرد کا نظام",
        description: "How 'A-L-M and Gh-F-R multiply into an entire universe of meanings.",
        descriptionUrdu: "کس طرح 'ع-ل-م' اور 'غ-ف-ر' سے علم، عالم، معلوم، علیم اور غفور بنتے ہیں۔",
        nodes: [
          {
            id: "s4_u1_n1",
            unitId: "u6_roots_and_patterns",
            phaseNumber: 4,
            title: "The 3-Letter Root Family",
            titleArabic: "عائلة الجذر الثلاثي",
            titleUrdu: "۳ حروفی مادے کا خاندان",
            subtitle: "F-'-L as the golden scale",
            subtitleUrdu: "ف-ع-ل کا سنہرا پیمانہ اور اوزان",
            description: "Unlock the core DNA behind Arabic words using root trees and pattern scales.",
            descriptionUrdu: "روٹ ٹری اور اوزان کے ذریعے قرآنی الفاظ کی اصل جڑ کو پہچانیں۔",
            nodeType: "lesson",
            estimatedMinutes: 5,
            xpReward: 55,
            gemReward: 12,
            iconName: "GitFork",
            prerequisiteNodeId: "s3_u1_boss"
          },
          {
            id: "s4_u1_boss",
            unitId: "u6_roots_and_patterns",
            phaseNumber: 4,
            title: "Boss Gate: Root Radar Matrix",
            titleArabic: "تحدي الزعيم: رادار الجذور",
            titleUrdu: "بوس گیٹ: رڈارِ مادّہ و اوزان",
            subtitle: "Match roots to 20 Quranic verses",
            subtitleUrdu: "۲۰ قرآنی آیات سے مادے نکالیں",
            description: "Extract the exact 3-letter roots from high-frequency Quranic verses.",
            descriptionUrdu: "قرآنی آیات میں کلمات کے اصل ثلاثی حروف کو تلاش کریں۔",
            nodeType: "boss_gate",
            estimatedMinutes: 7,
            xpReward: 400,
            gemReward: 80,
            iconName: "Crown",
            prerequisiteNodeId: "s4_u1_n1"
          }
        ]
      }
    ]
  },
  {
    phaseNumber: 5,
    id: "stage_5_immersion_fluency",
    title: "Stage 5: Full Immersion & Fluency",
    titleArabic: "المرحلة الخامسة: التلاوة والفهم الكامل",
    titleUrdu: "مرحلہ ۵: مکمل تفہیم، روانی اور بلاغت",
    subtitle: "Ayah-by-Ayah Mastery & Balaghah Nuance",
    subtitleUrdu: "آیت بہ آیت فہم اور بلاغتی لطائف",
    goal: "Translate and grammatically analyze complete Surahs independently.",
    goalUrdu: "مکمل قرآنی سورتوں کا آزادانہ ترجمہ اور نحوی تجزیہ کرنے کے قابل بنیں۔",
    targetComprehensionPct: 100,
    colorTheme: {
      primary: "rose",
      border: "border-rose-500/30 dark:border-rose-500/40",
      bg: "from-rose-500/10 to-pink-500/5 dark:from-rose-950/40 dark:to-pink-950/20",
      text: "text-rose-700 dark:text-rose-400",
      glow: "shadow-rose-500/20"
    },
    units: [
      {
        id: "u7_surah_championship",
        phaseNumber: 5,
        unitIndex: 1,
        title: "Unit 1: The Surah Championship",
        titleArabic: "الوحدة الأولى: بطولة السور القرآنية",
        titleUrdu: "یونٹ ۱: قرآنی سورتوں کی چیمپئن شپ",
        description: "Translate, analyze, and retain the entirety of Juz Amma's crowning Surahs.",
        descriptionUrdu: "جزء عمّ کی اہم سورتوں کا مکمل فہم، ترجمہ اور حفظ۔",
        nodes: [
          {
            id: "s5_u1_n1",
            unitId: "u7_surah_championship",
            phaseNumber: 5,
            title: "Surah Al-Alaq & First Revelation",
            titleArabic: "سورة العلق والوحي الأول",
            titleUrdu: "سورة العلق اور پہلی وحی",
            subtitle: "Read in the name of your Lord",
            subtitleUrdu: "اپنے رب کے نام سے پڑھیے",
            description: "Deep verse-by-verse translation and linguistic breakdown of the first revelation.",
            descriptionUrdu: "پہلی وحی کا گہرا آیت بہ آیت ترجمہ اور لسانی جائزہ۔",
            nodeType: "lesson",
            estimatedMinutes: 6,
            xpReward: 60,
            gemReward: 15,
            iconName: "BookOpen",
            prerequisiteNodeId: "s4_u1_boss"
          },
          {
            id: "s5_u1_boss",
            unitId: "u7_surah_championship",
            phaseNumber: 5,
            title: "Final Capstone: Master Certification Exam",
            titleArabic: "الامتحان النهائي: شهادة ختم الجزء الثلاثين",
            titleUrdu: "فائنل کیپ اسٹون: ماسٹر سرٹیفیکیشن امتحان",
            subtitle: "Comprehensive 50-Question Assessment",
            subtitleUrdu: "۵۰ جامع سوالات پر مشتمل حتمی امتحان",
            description: "Earn your Certified Quranic Arabic Pioneer badge and unlock the Magic Learner Lens.",
            descriptionUrdu: "قرآنی عربی کے سرٹیفائیڈ پاینیر کا تمغہ اور سند حاصل کریں۔",
            nodeType: "boss_gate",
            estimatedMinutes: 12,
            xpReward: 1000,
            gemReward: 200,
            iconName: "Trophy",
            prerequisiteNodeId: "s5_u1_n1"
          }
        ]
      }
    ]
  }
];

export function getAllSkillNodes(): SkillNode[] {
  const nodes: SkillNode[] = [];
  for (const phase of CURRICULUM_PHASES) {
    for (const unit of phase.units) {
      nodes.push(...unit.nodes);
    }
  }
  return nodes;
}
