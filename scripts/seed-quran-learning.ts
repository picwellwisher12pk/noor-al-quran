/**
 * Real Quranic Learning Data Seeder
 * Fetches authentic word-by-word data from official Quran.com API v4
 * for Surah Al-Fatihah (Chapter 1) and Surah Al-Fajr to An-Nas (Chapters 89 to 114).
 * 
 * Generates:
 * 1. data/juz30-word-by-word.json
 * 2. src/data/learning/juz30-word-by-word.json
 * 3. data/quran_learning.db (SQLite database populated via bun:sqlite & schema.sql)
 */

import fs from "fs";
import path from "path";
import { Database } from "bun:sqlite";

const WBW_CDN_BASE = "https://audio.qurancdn.com";
const QURAN_API_BASE = "https://api.quran.com/api/v4";

// Chapter list: Al-Fatihah (1) + Al-Fajr through An-Nas (89 to 114)
const CHAPTERS_TO_SEED = [
  1,
  89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
];

const SURAH_NAMES: Record<number, { en: string; ar: string; revelation: string }> = {
  1: { en: "Al-Fatihah", ar: "الفاتحة", revelation: "makkah" },
  89: { en: "Al-Fajr", ar: "الفجر", revelation: "makkah" },
  90: { en: "Al-Balad", ar: "البلد", revelation: "makkah" },
  91: { en: "Ash-Shams", ar: "الشمس", revelation: "makkah" },
  92: { en: "Al-Layl", ar: "الليل", revelation: "makkah" },
  93: { en: "Ad-Duha", ar: "الضحى", revelation: "makkah" },
  94: { en: "Ash-Sharh", ar: "الشرح", revelation: "makkah" },
  95: { en: "At-Tin", ar: "التين", revelation: "makkah" },
  96: { en: "Al-Alaq", ar: "العلق", revelation: "makkah" },
  97: { en: "Al-Qadr", ar: "القدر", revelation: "makkah" },
  98: { en: "Al-Bayyinah", ar: "البينة", revelation: "madinah" },
  99: { en: "Az-Zalzalah", ar: "الزلزلة", revelation: "madinah" },
  100: { en: "Al-Adiyat", ar: "العاديات", revelation: "makkah" },
  101: { en: "Al-Qari'ah", ar: "القارعة", revelation: "makkah" },
  102: { en: "At-Takathur", ar: "التكاثر", revelation: "makkah" },
  103: { en: "Al-Asr", ar: "العصر", revelation: "makkah" },
  104: { en: "Al-Humazah", ar: "الهمزة", revelation: "makkah" },
  105: { en: "Al-Fil", ar: "الفيل", revelation: "makkah" },
  106: { en: "Quraysh", ar: "قريش", revelation: "makkah" },
  107: { en: "Al-Ma'un", ar: "الماعون", revelation: "makkah" },
  108: { en: "Al-Kawthar", ar: "الكوثر", revelation: "makkah" },
  109: { en: "Al-Kafirun", ar: "الكافرون", revelation: "makkah" },
  110: { en: "An-Nasr", ar: "النصر", revelation: "madinah" },
  111: { en: "Al-Masad", ar: "المسد", revelation: "makkah" },
  112: { en: "Al-Ikhlas", ar: "الإخلاص", revelation: "makkah" },
  113: { en: "Al-Falaq", ar: "الفلق", revelation: "makkah" },
  114: { en: "An-Nas", ar: "الناس", revelation: "makkah" }
};

export interface ProcessedWord {
  id: string;
  position: number;
  verseKey: string;
  chapterId: number;
  verseNumber: number;
  textUthmani: string;
  audioUrl: string;
  translationEn: string;
  transliterationEn: string;
}

export interface ProcessedVerse {
  id: number;
  verseKey: string;
  chapterId: number;
  verseNumber: number;
  textUthmani: string;
  words: ProcessedWord[];
}

export interface ProcessedSurah {
  chapterId: number;
  nameEn: string;
  nameAr: string;
  revelation: string;
  totalVerses: number;
  totalWords: number;
  verses: ProcessedVerse[];
}

export interface VocabularyDictionaryItem {
  id: string;
  textUthmani: string;
  transliterationEn: string;
  translationEn: string;
  audioUrl: string;
  frequencyInJuz30: number;
  firstOccurrenceVerseKey: string;
}

async function fetchVersesForChapter(chapterId: number): Promise<ProcessedVerse[]> {
  const url = `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?words=true&word_fields=text_uthmani,audio_url,translation,transliteration&per_page=50`;
  
  let retries = 3;
  while (retries > 0) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const verses: ProcessedVerse[] = [];

      for (const rawVerse of data.verses || []) {
        const words: ProcessedWord[] = [];
        for (const rawWord of rawVerse.words || []) {
          // Skip ayah marker symbols
          if (rawWord.char_type_name === "end") continue;

          const rawAudio = rawWord.audio_url || "";
          const fullAudioUrl = rawAudio.startsWith("http")
            ? rawAudio
            : `${WBW_CDN_BASE}/${rawAudio.replace(/^\/+/, "")}`;

          words.push({
            id: `w_${rawVerse.verse_key.replace(":", "_")}_${rawWord.position}`,
            position: rawWord.position,
            verseKey: rawVerse.verse_key,
            chapterId,
            verseNumber: rawVerse.verse_number,
            textUthmani: rawWord.text_uthmani || rawWord.text || "",
            audioUrl: fullAudioUrl,
            translationEn: rawWord.translation?.text || "",
            transliterationEn: rawWord.transliteration?.text || ""
          });
        }

        verses.push({
          id: rawVerse.id,
          verseKey: rawVerse.verse_key,
          chapterId,
          verseNumber: rawVerse.verse_number,
          textUthmani: rawVerse.text_uthmani || "",
          words
        });
      }

      return verses;
    } catch (err: any) {
      retries--;
      console.warn(`[Retry ${3 - retries}] Failed to fetch Chapter ${chapterId}: ${err.message}`);
      if (retries === 0) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return [];
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 Starting Quranic Learning Data Seeder (Juz 30 + Surah Al-Fatihah)");
  console.log("==================================================================");

  const surahs: ProcessedSurah[] = [];
  const vocabularyMap = new Map<string, VocabularyDictionaryItem>();
  let totalWordsCount = 0;
  let totalVersesCount = 0;

  for (const chapterId of CHAPTERS_TO_SEED) {
    const info = SURAH_NAMES[chapterId] || { en: `Surah ${chapterId}`, ar: `سورة ${chapterId}`, revelation: "makkah" };
    process.stdout.write(`📥 Fetching Surah ${chapterId} (${info.en} / ${info.ar})... `);

    const verses = await fetchVersesForChapter(chapterId);
    let chapterWordCount = 0;

    for (const v of verses) {
      chapterWordCount += v.words.length;
      totalWordsCount += v.words.length;
      totalVersesCount++;

      for (const w of v.words) {
        const textKey = w.textUthmani.trim();
        const existing = vocabularyMap.get(textKey);
        if (existing) {
          existing.frequencyInJuz30 += 1;
        } else {
          vocabularyMap.set(textKey, {
            id: `vocab_${w.id}`,
            textUthmani: textKey,
            transliterationEn: w.transliterationEn,
            translationEn: w.translationEn,
            audioUrl: w.audioUrl,
            frequencyInJuz30: 1,
            firstOccurrenceVerseKey: w.verseKey
          });
        }
      }
    }

    surahs.push({
      chapterId,
      nameEn: info.en,
      nameAr: info.ar,
      revelation: info.revelation,
      totalVerses: verses.length,
      totalWords: chapterWordCount,
      verses
    });

    console.log(`✅ ${verses.length} verses, ${chapterWordCount} words.`);
    // Modest delay between chapters
    await new Promise(r => setTimeout(r, 120));
  }

  const vocabularyList = Array.from(vocabularyMap.values()).sort(
    (a, b) => b.frequencyInJuz30 - a.frequencyInJuz30
  );

  const datasetPayload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "Quran.com API v4 (Authentic Uthmani Script & Audio CDN)",
      chaptersCount: surahs.length,
      totalVersesCount,
      totalWordsCount,
      uniqueVocabularyCount: vocabularyList.length,
      chaptersList: CHAPTERS_TO_SEED
    },
    surahs,
    vocabularyIndex: vocabularyList
  };

  const outputJson = JSON.stringify(datasetPayload, null, 2);

  // 1. Write to data/juz30-word-by-word.json
  const dataPath = path.resolve("data/juz30-word-by-word.json");
  fs.writeFileSync(dataPath, outputJson, "utf8");
  console.log(`\n💾 Saved: ${dataPath} (${(Buffer.byteLength(outputJson) / 1024 / 1024).toFixed(2)} MB)`);

  // 2. Write to src/data/learning/juz30-word-by-word.json
  const srcDataPath = path.resolve("src/data/learning/juz30-word-by-word.json");
  fs.writeFileSync(srcDataPath, outputJson, "utf8");
  console.log(`💾 Saved: ${srcDataPath} (${(Buffer.byteLength(outputJson) / 1024 / 1024).toFixed(2)} MB)`);

  // 3. Populate SQLite database data/quran_learning.db using schema.sql
  console.log("\n🗄️ Initializing SQLite database (data/quran_learning.db)...");
  const dbPath = path.resolve("data/quran_learning.db");
  const db = new Database(dbPath);

  const schemaSqlPath = path.resolve("src/data/learning/schema.sql");
  const schemaSql = fs.readFileSync(schemaSqlPath, "utf8");
  db.exec(schemaSql);

  // Insert Phase records into learning_phases
  const phases = [
    { num: 1, id: "stage_1_foundation", title: "Stage 1: The Foundation", ar: "المرحلة الأولى: الأساس والتجويد", sub: "Reading & Tajweed Basics", goal: "Go from zero knowledge to reading Quranic words accurately with Tajweed.", pct: 0.0, color: "emerald", icon: "BookOpen" },
    { num: 2, id: "stage_2_high_frequency", title: "Stage 2: The 50% Milestone", ar: "المرحلة الثانية: محطة الخمسين بالمئة", sub: "High-Frequency Words & Essential Particles", goal: "Understand 50% of the words on any page of the Quran.", pct: 50.0, color: "amber", icon: "Sparkles" },
    { num: 3, id: "stage_3_nahw_syntax", title: "Stage 3: The Grammar Engine", ar: "المرحلة الثالثة: محرك النحو والتركيب", sub: "Nahw - Sentence Structure & Case Endings", goal: "Understand how words interact to form meaning and why word endings change.", pct: 70.0, color: "blue", icon: "Layers" },
    { num: 4, id: "stage_4_sarf_morphology", title: "Stage 4: Root & Pattern Matrix", ar: "المرحلة الرابعة: مصفوفة الجذور والصرف", sub: "Sarf - Derivation & The 10 Verb Forms", goal: "Derive dozens of meanings from single 3-letter roots.", pct: 85.0, color: "purple", icon: "GitFork" },
    { num: 5, id: "stage_5_immersion_fluency", title: "Stage 5: Full Immersion & Fluency", ar: "المرحلة الخامسة: التلاوة والفهم الكامل", sub: "Ayah-by-Ayah Analysis & Balaghah Nuance", goal: "Translate and analyze complete Surahs independently.", pct: 100.0, color: "rose", icon: "Trophy" }
  ];

  const insertPhase = db.prepare(`
    INSERT OR REPLACE INTO learning_phases 
    (phase_number, id, title, title_arabic, subtitle, goal, target_comprehension_percentage, color_theme, icon_name, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of phases) {
    insertPhase.run(p.num, p.id, p.title, p.ar, p.sub, p.goal, p.pct, p.color, p.icon, p.num);
  }

  // Insert unique words into learning_words
  const insertWord = db.prepare(`
    INSERT OR REPLACE INTO learning_words
    (id, text_uthmani, text_simple, transliteration, translation_en, translation_urdu, root, part_of_speech, pos_detail, pos_label_arabic, pos_label_english, frequency_in_quran, audio_cdn_url, sample_ayah)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const v of vocabularyList) {
      insertWord.run(
        v.id,
        v.textUthmani,
        v.textUthmani.replace(/[\u064B-\u065F\u0670]/g, ""),
        v.transliterationEn,
        v.translationEn,
        "",
        "",
        "ism",
        "noun",
        "اسم / كلمة قرآنية",
        "Quranic Vocabulary Token",
        v.frequencyInJuz30,
        v.audioUrl,
        JSON.stringify({ verseKey: v.firstOccurrenceVerseKey, textUthmani: v.textUthmani })
      );
    }
  })();

  const phaseCount = (db.query("SELECT COUNT(*) as c FROM learning_phases").get() as any)?.c;
  const wordCount = (db.query("SELECT COUNT(*) as c FROM learning_words").get() as any)?.c;

  console.log(`✅ SQLite Populated successfully!`);
  console.log(`   - learning_phases: ${phaseCount} records`);
  console.log(`   - learning_words: ${wordCount} records`);

  console.log("\n==================================================================");
  console.log("🎉 Seeding Completed Successfully!");
  console.log(`   Total Surahs: ${surahs.length}`);
  console.log(`   Total Verses: ${totalVersesCount}`);
  console.log(`   Total Quranic Tokens: ${totalWordsCount}`);
  console.log(`   Unique Word Nodes: ${vocabularyList.length}`);
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
