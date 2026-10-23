"use client";

import React, { useState, useMemo } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
  SEMANTIC_CLUSTERS,
  VOCAB_CATEGORIES,
  TOTAL_QURAN_WORDS,
  SemanticClusterInfo,
} from "@/data/quranVocabularyData";
import {
  markWordMastered,
  resetWordStatus,
  VocabLangPreference,
} from "@/services/vocabularyStorage";
import { useAudio } from "@/context/AudioContext";
import {
  Search,
  Volume2,
  CheckCircle2,
  Layers,
  Sparkles,
  BookOpen,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface VocabularyGroupBrowserProps {
  masteredIds: string[];
  langPreference: VocabLangPreference;
  onProgressUpdate: () => void;
}

type GroupingMode = "semantic_clusters" | "categories" | "frequency_rank";

export function VocabularyGroupBrowser({
  masteredIds,
  langPreference,
  onProgressUpdate,
}: VocabularyGroupBrowserProps) {
  const { playWord } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("semantic_clusters");
  const [filterMasteredOnly, setFilterMasteredOnly] = useState(false);

  // Search filter
  const filteredWords = useMemo(() => {
    return QURAN_70_VOCABULARY.filter((w) => {
      if (filterMasteredOnly && !masteredIds.includes(w.id)) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        w.arabic.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        w.urdu.includes(q) ||
        (w.root && w.root.includes(q)) ||
        w.semanticClusterTitle.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, filterMasteredOnly, masteredIds]);

  const handleToggleMastered = (wordId: string) => {
    if (masteredIds.includes(wordId)) {
      resetWordStatus(wordId);
    } else {
      markWordMastered(wordId);
    }
    onProgressUpdate();
  };

  const handlePlayAudio = (e: React.MouseEvent, word: QuranVocabWord) => {
    e.stopPropagation();
    const { surah, ayah } = word.sampleAyah;
    const sStr = String(surah).padStart(3, "0");
    const aStr = String(ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(word.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const showEnglish = langPreference === "bilingual" || langPreference === "english";
  const showUrdu = langPreference === "bilingual" || langPreference === "urdu";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in Arabic, English, Urdu, or Root..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground,#8e9b94)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Grouping View Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs">
            <button
              type="button"
              onClick={() => setGroupingMode("semantic_clusters")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                groupingMode === "semantic_clusters"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Meaning Groups</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode("categories")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                groupingMode === "categories"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Grammar Classes</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode("frequency_rank")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                groupingMode === "frequency_rank"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Frequency Rank</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pill */}
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground,#8e9b94)] pt-1">
          <span>
            Showing <strong className="text-[var(--foreground)]">{filteredWords.length}</strong> words
          </span>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterMasteredOnly}
              onChange={(e) => setFilterMasteredOnly(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>Show Mastered Words Only</span>
          </label>
        </div>
      </div>

      {/* CONTENT STAGE ACCORDING TO GROUPING MODE */}
      {groupingMode === "semantic_clusters" ? (
        /* 1. SEMANTIC MEANING CLUSTERS (Similar words with same meaning grouped) */
        <div className="space-y-6">
          {SEMANTIC_CLUSTERS.map((cluster) => {
            const clusterWords = filteredWords.filter((w) => cluster.wordIds.includes(w.id));
            if (clusterWords.length === 0) return null;

            const totalOccurrences = clusterWords.reduce((acc, w) => acc + w.frequency, 0);
            const clusterPercent = ((totalOccurrences / TOTAL_QURAN_WORDS) * 100).toFixed(1);

            return (
              <div
                key={cluster.id}
                className="p-5 md:p-6 rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-sm space-y-4"
              >
                {/* Cluster Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle,#24362e)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base md:text-lg text-[var(--foreground)]">
                        {cluster.title}
                      </span>
                      <span className="font-arabic text-sm text-emerald-400 font-semibold" dir="rtl">
                        {cluster.titleAr}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-0.5">
                      {langPreference === "urdu" ? cluster.descriptionUrdu : cluster.description}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
                    {totalOccurrences.toLocaleString()} occurrences ({clusterPercent}% of Quran)
                  </span>
                </div>

                {/* Words Grid in this Cluster */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clusterWords.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isMastered={masteredIds.includes(word.id)}
                      showEnglish={showEnglish}
                      showUrdu={showUrdu}
                      onToggleMastered={() => handleToggleMastered(word.id)}
                      onPlayAudio={(e) => handlePlayAudio(e, word)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : groupingMode === "categories" ? (
        /* 2. GRAMMATICAL CLASSES (Verbs, Nouns, Particles, etc.) */
        <div className="space-y-6">
          {VOCAB_CATEGORIES.map((cat) => {
            const catWords = filteredWords.filter((w) => w.category === cat.id);
            if (catWords.length === 0) return null;

            const totalOccurrences = catWords.reduce((acc, w) => acc + w.frequency, 0);
            const catPercent = ((totalOccurrences / TOTAL_QURAN_WORDS) * 100).toFixed(1);

            return (
              <div
                key={cat.id}
                className="p-5 md:p-6 rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle,#24362e)]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base md:text-lg text-[var(--foreground)]">
                      {cat.labelEn}
                    </span>
                    <span className="font-arabic text-sm text-emerald-400 font-semibold" dir="rtl">
                      {cat.labelAr}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
                    {totalOccurrences.toLocaleString()} occurrences ({catPercent}% of Quran)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catWords.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isMastered={masteredIds.includes(word.id)}
                      showEnglish={showEnglish}
                      showUrdu={showUrdu}
                      onToggleMastered={() => handleToggleMastered(word.id)}
                      onPlayAudio={(e) => handlePlayAudio(e, word)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. FREQUENCY RANKED LIST (Highest to Lowest) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...filteredWords]
              .sort((a, b) => b.frequency - a.frequency)
              .map((word, rank) => (
                <WordCard
                  key={word.id}
                  word={word}
                  rank={rank + 1}
                  isMastered={masteredIds.includes(word.id)}
                  showEnglish={showEnglish}
                  showUrdu={showUrdu}
                  onToggleMastered={() => handleToggleMastered(word.id)}
                  onPlayAudio={(e) => handlePlayAudio(e, word)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface WordCardProps {
  word: QuranVocabWord;
  rank?: number;
  isMastered: boolean;
  showEnglish: boolean;
  showUrdu: boolean;
  onToggleMastered: () => void;
  onPlayAudio: (e: React.MouseEvent) => void;
}

function WordCard({
  word,
  rank,
  isMastered,
  showEnglish,
  showUrdu,
  onToggleMastered,
  onPlayAudio,
}: WordCardProps) {
  const percentContribution = ((word.frequency / TOTAL_QURAN_WORDS) * 100).toFixed(1);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none relative group ${
        isMastered
          ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
          : "bg-[var(--surface-card,#182520)] border-[var(--border-subtle,#24362e)] hover:border-emerald-500/30"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground,#8e9b94)] mb-2">
        <div className="flex items-center gap-1.5">
          {rank && (
            <span className="w-5 h-5 rounded-md bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] flex items-center justify-center font-mono font-bold text-emerald-400">
              #{rank}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)]">
            {word.posLabelAr}
          </span>
          {word.root && (
            <span className="font-mono text-[var(--foreground)]">
              Root: {word.root}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onPlayAudio}
          className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 transition-colors"
          title="Play pronunciation"
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Arabic Word & Transliteration */}
      <div className="text-center my-1">
        <h4 className="font-arabic-amiri text-3xl font-bold text-[var(--foreground)]" dir="rtl">
          {word.arabic}
        </h4>
        <p className="text-xs text-emerald-400 font-medium">
          {word.transliteration}
        </p>
      </div>

      {/* Translations */}
      <div className="my-2 space-y-1 text-center">
        {showEnglish && (
          <p className="text-xs font-semibold text-[var(--foreground)] leading-snug">
            {word.english}
          </p>
        )}
        {showUrdu && (
          <p className="font-urdu-nastaliq text-xs text-[var(--muted-foreground,#8e9b94)] leading-relaxed" dir="rtl">
            {word.urdu}
          </p>
        )}
      </div>

      {/* Card Footer: Frequency & Mastered Button */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle,#24362e)] text-[10px]">
        <span className="font-mono text-[var(--muted-foreground,#8e9b94)]">
          {word.frequency.toLocaleString()}x ({percentContribution}%)
        </span>

        <button
          type="button"
          onClick={onToggleMastered}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
            isMastered
              ? "bg-emerald-600 text-white border-emerald-500 font-semibold"
              : "bg-[var(--surface-raised,#141e1a)] border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400"
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>{isMastered ? "Mastered" : "Learn"}</span>
        </button>
      </div>
    </div>
  );
}
