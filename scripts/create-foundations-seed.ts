import fs from "fs";
import path from "path";

const phase1Data = {
  version: "1.0.0",
  phase: 1,
  title: "The Foundation: Reading, Tajweed Basics & Core Particles",
  titleArabic: "المرحلة الأولى: الأساس، التجويد، والحروف الأساسية",
  description: "From zero knowledge to reading Quranic words accurately with Tajweed rules and understanding the top 30 highest frequency particles and pronouns.",

  makharijCategories: [
    {
      id: "al_jawf",
      nameArabic: "الجَوف",
      nameEnglish: "Al-Jawf (Oral & Throat Cavity)",
      description: "The open empty space inside the mouth and throat. The letters of elongation (Huroof al-Madd) originate here without the tongue or lips making active obstruction.",
      letters: ["ا", "و", "ي"],
      guidance: "Pronounced by sustaining airflow with soft vibration. Elongate smoothly for 2 counts by default."
    },
    {
      id: "al_halq",
      nameArabic: "الحَلْق",
      nameEnglish: "Al-Halq (The Throat)",
      description: "The throat is partitioned into three distinct sub-regions, housing 6 clear throat letters (Huroof al-Halq).",
      subRegions: [
        {
          name: "Aqsa al-Halq (Deepest Throat)",
          letters: ["ء", "هـ"],
          description: "Bottom of the throat nearest the chest / vocal cords."
        },
        {
          name: "Wasat al-Halq (Middle Throat)",
          letters: ["ع", "ح"],
          description: "Center of the throat around the epiglottis. Requires deliberate contraction."
        },
        {
          name: "Adna al-Halq (Closest Throat)",
          letters: ["غ", "خ"],
          description: "Top of the throat nearest the uvula and root of the mouth."
        }
      ],
      guidance: "Crucial for Izhar Halqi in Tajweed. Ensure Hamzah and Ha come from deep in the chest."
    },
    {
      id: "al_lisan",
      nameArabic: "اللِّسَان",
      nameEnglish: "Al-Lisan (The Tongue)",
      description: "The most comprehensive articulation organ, containing 10 specific articulation points producing 18 letters.",
      subRegions: [
        {
          name: "Aqsa al-Lisan (Deepest Tongue)",
          letters: ["ق", "ك"],
          description: "Back of tongue against the soft palate (Qaf) and hard palate (Kaf)."
        },
        {
          name: "Wasat al-Lisan (Middle Tongue)",
          letters: ["ج", "ش", "ي"],
          description: "Middle of tongue against the upper palate (Huroof ash-Shajariyyah)."
        },
        {
          name: "Hafah al-Lisan (Edge of Tongue)",
          letters: ["ض", "ل"],
          description: "Sides of tongue against upper molars (Dad) and front edge (Lam)."
        },
        {
          name: "Taraf al-Lisan (Tip of Tongue)",
          letters: ["ن", "ر", "ط", "د", "ت", "ص", "س", "ز", "ظ", "ذ", "ث"],
          description: "Tip touching gums, back of upper incisors, or edges of front teeth."
        }
      ],
      guidance: "Distinguish emphatic heavy letters (Mufakhkham: ط, ض, ص, ظ, ق) from light letters (Muraqqaq)."
    },
    {
      id: "ash_shafatan",
      nameArabic: "الشَّفَتَان",
      nameEnglish: "Ash-Shafatan (The Two Lips)",
      description: "The two lips articulate 4 letters: Fa (tip of upper teeth on wet edge of lower lip), and Ba, Meem, Waw (interaction of both lips).",
      letters: ["ف", "ب", "م", "و"],
      guidance: "Keep lips rounded for Waw without full closure; press firmly for Ba, softly for Meem."
    },
    {
      id: "al_khayshum",
      nameArabic: "الخَيْشُوم",
      nameEnglish: "Al-Khayshum (The Nasal Passage)",
      description: "The internal nasal cavity where the nasal resonant sound (Ghunnah) resonates during Noon and Meem pronunciation.",
      letters: ["نّ", "مّ"],
      guidance: "The duration of Ghunnah is held for 2 full counts when Noon or Meem have a Shaddah."
    }
  ],

  alphabet: [
    { id: "alif", letter: "ا", name: "Alif", nameArabic: "أَلِف", transliteration: "a", makhrajCategory: "al_jawf", forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/alif.mp3" },
    { id: "baa", letter: "ب", name: "Baa", nameArabic: "بَاء", transliteration: "b", makhrajCategory: "ash_shafatan", forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/baa.mp3" },
    { id: "taa", letter: "ت", name: "Taa", nameArabic: "تَاء", transliteration: "t", makhrajCategory: "al_lisan", forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/taa.mp3" },
    { id: "thaa", letter: "ث", name: "Thaa", nameArabic: "ثَاء", transliteration: "th", makhrajCategory: "al_lisan", forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/thaa.mp3" },
    { id: "jeem", letter: "ج", name: "Jeem", nameArabic: "جِيم", transliteration: "j", makhrajCategory: "al_lisan", forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/jeem.mp3" },
    { id: "haa_throat", letter: "ح", name: "Haa", nameArabic: "حَاء", transliteration: "ḥ", makhrajCategory: "al_halq", forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/haa.mp3" },
    { id: "khaa", letter: "خ", name: "Khaa", nameArabic: "خَاء", transliteration: "kh", makhrajCategory: "al_halq", forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/khaa.mp3" },
    { id: "daal", letter: "د", name: "Daal", nameArabic: "دَال", transliteration: "d", makhrajCategory: "al_lisan", forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/daal.mp3" },
    { id: "dhaal", letter: "ذ", name: "Dhaal", nameArabic: "ذَال", transliteration: "dh", makhrajCategory: "al_lisan", forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/dhaal.mp3" },
    { id: "raa", letter: "ر", name: "Raa", nameArabic: "رَاء", transliteration: "r", makhrajCategory: "al_lisan", forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/raa.mp3" },
    { id: "zaay", letter: "ز", name: "Zaay", nameArabic: "زَاي", transliteration: "z", makhrajCategory: "al_lisan", forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/zaay.mp3" },
    { id: "seen", letter: "س", name: "Seen", nameArabic: "سِين", transliteration: "s", makhrajCategory: "al_lisan", forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/seen.mp3" },
    { id: "sheen", letter: "ش", name: "Sheen", nameArabic: "شِين", transliteration: "sh", makhrajCategory: "al_lisan", forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/sheen.mp3" },
    { id: "saad", letter: "ص", name: "Saad", nameArabic: "صَاد", transliteration: "ṣ", makhrajCategory: "al_lisan", forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/saad.mp3" },
    { id: "daad", letter: "ض", name: "Daad", nameArabic: "ضَاد", transliteration: "ḍ", makhrajCategory: "al_lisan", forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/daad.mp3" },
    { id: "taa_heavy", letter: "ط", name: "Taa (Heavy)", nameArabic: "طَاء", transliteration: "ṭ", makhrajCategory: "al_lisan", forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/taa_heavy.mp3" },
    { id: "dhaa_heavy", letter: "ظ", name: "Zhaa (Heavy)", nameArabic: "ظَاء", transliteration: "ẓ", makhrajCategory: "al_lisan", forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/zhaa.mp3" },
    { id: "ayn", letter: "ع", name: "Ayn", nameArabic: "عَيْن", transliteration: "ʿ", makhrajCategory: "al_halq", forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/ayn.mp3" },
    { id: "ghayn", letter: "غ", name: "Ghayn", nameArabic: "غَيْن", transliteration: "gh", makhrajCategory: "al_halq", forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/ghayn.mp3" },
    { id: "faa", letter: "ف", name: "Faa", nameArabic: "فَاء", transliteration: "f", makhrajCategory: "ash_shafatan", forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/faa.mp3" },
    { id: "qaaf", letter: "ق", name: "Qaaf", nameArabic: "قَاف", transliteration: "q", makhrajCategory: "al_lisan", forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/qaaf.mp3" },
    { id: "kaaf", letter: "ك", name: "Kaaf", nameArabic: "كَاف", transliteration: "k", makhrajCategory: "al_lisan", forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/kaaf.mp3" },
    { id: "laam", letter: "ل", name: "Laam", nameArabic: "لَام", transliteration: "l", makhrajCategory: "al_lisan", forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/laam.mp3" },
    { id: "meem", letter: "م", name: "Meem", nameArabic: "مِيم", transliteration: "m", makhrajCategory: "ash_shafatan", forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/meem.mp3" },
    { id: "noon", letter: "ن", name: "Noon", nameArabic: "نُون", transliteration: "n", makhrajCategory: "al_lisan", forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/noon.mp3" },
    { id: "haa_chest", letter: "ه", name: "Haa", nameArabic: "هَاء", transliteration: "h", makhrajCategory: "al_halq", forms: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/haa_chest.mp3" },
    { id: "waaw", letter: "و", name: "Waaw", nameArabic: "وَاو", transliteration: "w", makhrajCategory: "ash_shafatan", forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/waaw.mp3" },
    { id: "yaa", letter: "ي", name: "Yaa", nameArabic: "يَاء", transliteration: "y", makhrajCategory: "al_lisan", forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" }, audioUrl: "https://audio.qurancdn.com/wbw_letter/yaa.mp3" }
  ],

  harakatAndTashkeel: [
    {
      id: "fatha",
      nameArabic: "فَتْحَة",
      nameEnglish: "Fatha (Short vowel 'a')",
      symbol: "ـَ",
      soundDescription: "Short open vowel sound 'a' as in 'cup'. Open mouth vertically.",
      exampleWord: { arabic: "كَتَبَ", transliteration: "kataba", translation: "he wrote" }
    },
    {
      id: "kasra",
      nameArabic: "كَسْرَة",
      nameEnglish: "Kasra (Short vowel 'i')",
      symbol: "ـِ",
      soundDescription: "Short low vowel sound 'i' as in 'sit'. Lower jaw slightly.",
      exampleWord: { arabic: "عِلْمٍ", transliteration: "'ilmin", translation: "knowledge" }
    },
    {
      id: "damma",
      nameArabic: "ضَمَّة",
      nameEnglish: "Damma (Short vowel 'u')",
      symbol: "ـُ",
      soundDescription: "Short rounded vowel sound 'u' as in 'put'. Round lips clearly.",
      exampleWord: { arabic: "كُتُبٌ", transliteration: "kutubun", translation: "books" }
    },
    {
      id: "sukoon",
      nameArabic: "سُكُون",
      nameEnglish: "Sukoon (Vowel silence / Stop)",
      symbol: "ـْ",
      soundDescription: "Signifies absence of a vowel; a crisp stop on the consonant.",
      exampleWord: { arabic: "أَنْعَمْتَ", transliteration: "an'amta", translation: "You bestowed favor" }
    },
    {
      id: "shaddah",
      nameArabic: "شَدَّة",
      nameEnglish: "Shaddah (Consonant Gemination)",
      symbol: "ـّ",
      soundDescription: "Doubles the consonant length. The first occurrence holds sukoon, the second carries a vowel.",
      exampleWord: { arabic: "رَبِّ", transliteration: "rabbi", translation: "my Lord" }
    },
    {
      id: "tanween_damm",
      nameArabic: "تَنْوِين ضَمّ",
      nameEnglish: "Tanween Damm (-un)",
      symbol: "ـٌ",
      soundDescription: "Double damma producing the indefinite nominative ending '-un'.",
      exampleWord: { arabic: "نُورٌ", transliteration: "nūrun", translation: "a light" }
    },
    {
      id: "tanween_fath",
      nameArabic: "تَنْوِين فَتْح",
      nameEnglish: "Tanween Fath (-an)",
      symbol: "ـً",
      soundDescription: "Double fatha producing the accusative/adverbial ending '-an'.",
      exampleWord: { arabic: "هُدًى", transliteration: "hudan", translation: "guidance" }
    },
    {
      id: "tanween_kasr",
      nameArabic: "تَنْوِين كَسْر",
      nameEnglish: "Tanween Kasr (-in)",
      symbol: "ـٍ",
      soundDescription: "Double kasra producing the genitive ending '-in'.",
      exampleWord: { arabic: "رَحْمَةٍ", transliteration: "raḥmatin", translation: "mercy" }
    }
  ],

  top30ParticlesAndPronouns: [
    {
      id: "p_min",
      textUthmani: "مِنْ",
      transliteration: "min",
      translationEn: "from / of",
      translationUrdu: "سے",
      partOfSpeech: "harf",
      posDetail: "preposition",
      posLabelArabic: "حرف جر",
      frequencyInQuran: 3226,
      sampleAyah: {
        verseKey: "2:4",
        textUthmani: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ",
        translationEn: "And who believe in what has been revealed to you, and what was revealed before you"
      }
    },
    {
      id: "p_fi",
      textUthmani: "فِي",
      transliteration: "fī",
      translationEn: "in / into / concerning",
      translationUrdu: "میں",
      partOfSpeech: "harf",
      posDetail: "preposition",
      posLabelArabic: "حرف جر",
      frequencyInQuran: 1701,
      sampleAyah: {
        verseKey: "2:2",
        textUthmani: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ",
        translationEn: "This is the Book about which there is no doubt, guidance for those conscious of Allah"
      }
    },
    {
      id: "p_ma",
      textUthmani: "مَا",
      transliteration: "mā",
      translationEn: "not / what / whatever",
      translationUrdu: "جو / نہیں / کیا",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "حرف نفي / اسم موصول",
      frequencyInQuran: 2615,
      sampleAyah: {
        verseKey: "2:20",
        textUthmani: "إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌۭ",
        translationEn: "Indeed, Allah is over all things competent"
      }
    },
    {
      id: "p_la",
      textUthmani: "لَا",
      transliteration: "lā",
      translationEn: "no / not",
      translationUrdu: "نہیں / مت",
      partOfSpeech: "harf",
      posDetail: "negative_particle",
      posLabelArabic: "حرف نفي ونهي",
      frequencyInQuran: 1734,
      sampleAyah: {
        verseKey: "2:255",
        textUthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
        translationEn: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence"
      }
    },
    {
      id: "p_inna",
      textUthmani: "إِنَّ",
      transliteration: "inna",
      translationEn: "indeed / surely / truly",
      translationUrdu: "بے شک / یقیناً",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "حرف توكيد ونصب",
      frequencyInQuran: 1533,
      sampleAyah: {
        verseKey: "103:2",
        textUthmani: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ",
        translationEn: "Indeed, mankind is in loss"
      }
    },
    {
      id: "p_ala",
      textUthmani: "عَلَىٰ",
      transliteration: "'alā",
      translationEn: "upon / on / over",
      translationUrdu: "پر",
      partOfSpeech: "harf",
      posDetail: "preposition",
      posLabelArabic: "حرف جر",
      frequencyInQuran: 1445,
      sampleAyah: {
        verseKey: "1:7",
        textUthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
        translationEn: "The path of those upon whom You have bestowed favor"
      }
    },
    {
      id: "p_anna",
      textUthmani: "أَنَّ",
      transliteration: "anna",
      translationEn: "that",
      translationUrdu: "کہ",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "حرف توكيد ومصدري",
      frequencyInQuran: 686,
      sampleAyah: {
        verseKey: "2:223",
        textUthmani: "وَٱعْلَمُوٓا۟ أَنَّ ٱللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌۭ",
        translationEn: "And know that Allah is Seeing of whatever you do"
      }
    },
    {
      id: "p_ila",
      textUthmani: "إِلَىٰ",
      transliteration: "ilā",
      translationEn: "to / towards",
      translationUrdu: "کی طرف",
      partOfSpeech: "harf",
      posDetail: "preposition",
      posLabelArabic: "حرف جر",
      frequencyInQuran: 742,
      sampleAyah: {
        verseKey: "2:28",
        textUthmani: "ثُمَّ إِلَيْهِ تُرْجَعُونَ",
        translationEn: "Then to Him you will be returned"
      }
    },
    {
      id: "p_alladhi",
      textUthmani: "ٱلَّذِى",
      transliteration: "alladhī",
      translationEn: "who / which / the one who",
      translationUrdu: "جو شخص / وہ جو",
      partOfSpeech: "ism",
      posDetail: "relative_pronoun",
      posLabelArabic: "اسم موصول",
      frequencyInQuran: 1442,
      sampleAyah: {
        verseKey: "2:21",
        textUthmani: "ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ",
        translationEn: "Worship your Lord, who created you"
      }
    },
    {
      id: "p_alladhina",
      textUthmani: "ٱلَّذِينَ",
      transliteration: "alladhīna",
      translationEn: "those who",
      translationUrdu: "وہ لوگ جو",
      partOfSpeech: "ism",
      posDetail: "relative_pronoun",
      posLabelArabic: "اسم موصول للجمع",
      frequencyInQuran: 1080,
      sampleAyah: {
        verseKey: "2:3",
        textUthmani: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ",
        translationEn: "Who believe in the unseen"
      }
    },
    {
      id: "p_huwa",
      textUthmani: "هُوَ",
      transliteration: "huwa",
      translationEn: "He / It",
      translationUrdu: "وہ (مرد / واحد)",
      partOfSpeech: "ism",
      posDetail: "pronoun",
      posLabelArabic: "ضمير منفصل للغائب",
      frequencyInQuran: 481,
      sampleAyah: {
        verseKey: "112:1",
        textUthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        translationEn: "Say: He is Allah, [who is] One"
      }
    },
    {
      id: "p_hum",
      textUthmani: "هُمْ",
      transliteration: "hum",
      translationEn: "they / them",
      translationUrdu: "وہ سب",
      partOfSpeech: "ism",
      posDetail: "pronoun",
      posLabelArabic: "ضمير منفصل لجمع الغائبين",
      frequencyInQuran: 442,
      sampleAyah: {
        verseKey: "2:5",
        textUthmani: "وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
        translationEn: "And it is those who are the successful"
      }
    },
    {
      id: "p_antum",
      textUthmani: "أَنتُمْ",
      transliteration: "antum",
      translationEn: "you (plural)",
      translationUrdu: "تم سب",
      partOfSpeech: "ism",
      posDetail: "pronoun",
      posLabelArabic: "ضمير منفصل للمخاطبين",
      frequencyInQuran: 135,
      sampleAyah: {
        verseKey: "109:3",
        textUthmani: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ",
        translationEn: "Nor are you worshippers of what I worship"
      }
    },
    {
      id: "p_nahnu",
      textUthmani: "نَحْنُ",
      transliteration: "naḥnu",
      translationEn: "we",
      translationUrdu: "ہم",
      partOfSpeech: "ism",
      posDetail: "pronoun",
      posLabelArabic: "ضمير منفصل للمتكلمين",
      frequencyInQuran: 86,
      sampleAyah: {
        verseKey: "15:9",
        textUthmani: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ",
        translationEn: "Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian"
      }
    },
    {
      id: "p_ana",
      textUthmani: "أَنَا۠",
      transliteration: "anā",
      translationEn: "I / Me",
      translationUrdu: "میں",
      partOfSpeech: "ism",
      posDetail: "pronoun",
      posLabelArabic: "ضمير منفصل للمتكلم",
      frequencyInQuran: 68,
      sampleAyah: {
        verseKey: "20:14",
        textUthmani: "إِنَّنِىٓ أَنَا ٱللَّهُ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدْنِى",
        translationEn: "Indeed, I am Allah. There is no deity except Me, so worship Me"
      }
    },
    {
      id: "p_hadha",
      textUthmani: "هَـٰذَا",
      transliteration: "hādhā",
      translationEn: "this (masculine)",
      translationUrdu: "یہ",
      partOfSpeech: "ism",
      posDetail: "demonstrative",
      posLabelArabic: "اسم إشارة للقريب",
      frequencyInQuran: 471,
      sampleAyah: {
        verseKey: "106:3",
        textUthmani: "فَلْيَعْبُدُوا۟ رَبَّ هَـٰذَا ٱلْبَيْتِ",
        translationEn: "Let them worship the Lord of this House"
      }
    },
    {
      id: "p_dhalika",
      textUthmani: "ذَٰلِكَ",
      transliteration: "dhālika",
      translationEn: "that (masculine)",
      translationUrdu: "وہ",
      partOfSpeech: "ism",
      posDetail: "demonstrative",
      posLabelArabic: "اسم إشارة للبعيد",
      frequencyInQuran: 471,
      sampleAyah: {
        verseKey: "2:2",
        textUthmani: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ",
        translationEn: "That is the Book about which there is no doubt"
      }
    },
    {
      id: "p_ulaika",
      textUthmani: "أُو۟لَـٰٓئِكَ",
      transliteration: "ulā'ika",
      translationEn: "those (people)",
      translationUrdu: "وہی لوگ",
      partOfSpeech: "ism",
      posDetail: "demonstrative",
      posLabelArabic: "اسم إشارة للجمع البعيد",
      frequencyInQuran: 206,
      sampleAyah: {
        verseKey: "2:5",
        textUthmani: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ",
        translationEn: "Those are upon guidance from their Lord"
      }
    },
    {
      id: "p_wa",
      textUthmani: "وَ",
      transliteration: "wa",
      translationEn: "and / by (oath)",
      translationUrdu: "اور / قسم ہے",
      partOfSpeech: "harf",
      posDetail: "conjunction",
      posLabelArabic: "حرف عطف وقسم",
      frequencyInQuran: 9600,
      sampleAyah: {
        verseKey: "103:1",
        textUthmani: "وَٱلْعَصْرِ",
        translationEn: "By time"
      }
    },
    {
      id: "p_fa",
      textUthmani: "فَ",
      transliteration: "fa",
      translationEn: "so / then / and thus",
      translationUrdu: "پس / تو",
      partOfSpeech: "harf",
      posDetail: "conjunction",
      posLabelArabic: "حرف عطف وسببية",
      frequencyInQuran: 2900,
      sampleAyah: {
        verseKey: "110:3",
        textUthmani: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ",
        translationEn: "Then exalt [Him] with praise of your Lord and ask forgiveness of Him"
      }
    },
    {
      id: "p_thumma",
      textUthmani: "ثُمَّ",
      transliteration: "thumma",
      translationEn: "then / thereafter",
      translationUrdu: "پھر",
      partOfSpeech: "harf",
      posDetail: "conjunction",
      posLabelArabic: "حرف عطف للترتيب مع التراخي",
      frequencyInQuran: 338,
      sampleAyah: {
        verseKey: "102:4",
        textUthmani: "ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ",
        translationEn: "Then no! You are going to know"
      }
    },
    {
      id: "p_hatta",
      textUthmani: "حَتَّىٰ",
      transliteration: "ḥattā",
      translationEn: "until / even to",
      translationUrdu: "یہاں تک کہ",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "حرف غاية وجر",
      frequencyInQuran: 142,
      sampleAyah: {
        verseKey: "97:5",
        textUthmani: "سَلَـٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ",
        translationEn: "Peace it is until the emergence of dawn"
      }
    },
    {
      id: "p_an",
      textUthmani: "عَن",
      transliteration: "'an",
      translationEn: "about / from / away from",
      translationUrdu: "سے / کے بارے میں",
      partOfSpeech: "harf",
      posDetail: "preposition",
      posLabelArabic: "حرف جر للمجاوزة",
      frequencyInQuran: 465,
      sampleAyah: {
        verseKey: "107:5",
        textUthmani: "ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
        translationEn: "Those who are heedless of their prayer"
      }
    },
    {
      id: "p_maa_with",
      textUthmani: "مَعَ",
      transliteration: "ma'a",
      translationEn: "with / alongside",
      translationUrdu: "ساتھ",
      partOfSpeech: "ism",
      posDetail: "preposition",
      posLabelArabic: "ظرف مكان للمصاحبة",
      frequencyInQuran: 162,
      sampleAyah: {
        verseKey: "94:6",
        textUthmani: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
        translationEn: "Indeed, with hardship [will be] ease"
      }
    },
    {
      id: "p_bal",
      textUthmani: "بَلْ",
      transliteration: "bal",
      translationEn: "rather / nay / but",
      translationUrdu: "بلکہ",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "حرف إضراب",
      frequencyInQuran: 126,
      sampleAyah: {
        verseKey: "87:16",
        textUthmani: "بَلْ تُؤْثِرُونَ ٱلْحَيَوٰةَ ٱلدُّنْيَا",
        translationEn: "Rather, you prefer the worldly life"
      }
    },
    {
      id: "p_in_cond",
      textUthmani: "إِن",
      transliteration: "in",
      translationEn: "if",
      translationUrdu: "اگر",
      partOfSpeech: "harf",
      posDetail: "conditional_particle",
      posLabelArabic: "حرف شرط جازم",
      frequencyInQuran: 688,
      sampleAyah: {
        verseKey: "87:9",
        textUthmani: "فَذَكِّرْ إِن نَّفَعَتِ ٱلذِّكْرَىٰ",
        translationEn: "So remind, if the reminder should benefit"
      }
    },
    {
      id: "p_law",
      textUthmani: "لَوْ",
      transliteration: "law",
      translationEn: "if (hypothetical / had)",
      translationUrdu: "اگر / کاش",
      partOfSpeech: "harf",
      posDetail: "conditional_particle",
      posLabelArabic: "حرف شرط غير جازم لامتناع",
      frequencyInQuran: 211,
      sampleAyah: {
        verseKey: "89:24",
        textUthmani: "يَقُولُ يَـٰلَيْتَنِى قَدَّمْتُ لِحَيَاتِى",
        translationEn: "He will say: Oh, I wish I had sent ahead [some good] for my life"
      }
    },
    {
      id: "p_idha",
      textUthmani: "إِذَا",
      transliteration: "idhā",
      translationEn: "when / whenever",
      translationUrdu: "جب",
      partOfSpeech: "harf",
      posDetail: "conditional_particle",
      posLabelArabic: "ظرف لما يستقبل من الزمان يتضمن معنى الشرط",
      frequencyInQuran: 414,
      sampleAyah: {
        verseKey: "110:1",
        textUthmani: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ",
        translationEn: "When the victory of Allah has come and the conquest"
      }
    },
    {
      id: "p_idh",
      textUthmani: "إِذْ",
      transliteration: "idh",
      translationEn: "when / and remember when",
      translationUrdu: "جبکہ / یاد کرو جب",
      partOfSpeech: "harf",
      posDetail: "particle",
      posLabelArabic: "ظرف لما مضى من الزمان",
      frequencyInQuran: 166,
      sampleAyah: {
        verseKey: "8:48",
        textUthmani: "وَإِذْ زَيَّنَ لَهُمُ ٱلشَّيْطَـٰنُ أَعْمَـٰلَهُمْ",
        translationEn: "And [remember] when Satan made their deeds pleasing to them"
      }
    },
    {
      id: "p_kull",
      textUthmani: "كُلّ",
      transliteration: "kull",
      translationEn: "every / all / each",
      translationUrdu: "ہر / تمام",
      partOfSpeech: "ism",
      posDetail: "noun",
      posLabelArabic: "اسم لاستغراق الأفراد",
      frequencyInQuran: 405,
      sampleAyah: {
        verseKey: "2:20",
        textUthmani: "إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌۭ",
        translationEn: "Indeed, Allah is over all things competent"
      }
    }
  ]
};

const jsonStr = JSON.stringify(phase1Data, null, 2);

fs.writeFileSync(path.resolve("data/phase1-foundations.json"), jsonStr, "utf8");
fs.writeFileSync(path.resolve("src/data/learning/phase1-foundations.json"), jsonStr, "utf8");

console.log("Successfully generated:");
console.log("- data/phase1-foundations.json (" + Buffer.byteLength(jsonStr) + " bytes)");
console.log("- src/data/learning/phase1-foundations.json (" + Buffer.byteLength(jsonStr) + " bytes)");
console.log("Alphabet letters: " + phase1Data.alphabet.length);
console.log("Makharij categories: " + phase1Data.makharijCategories.length);
console.log("Harakat & Tashkeel items: " + phase1Data.harakatAndTashkeel.length);
console.log("Top 30 particles & pronouns: " + phase1Data.top30ParticlesAndPronouns.length);
