"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
  TOTAL_QURAN_WORDS,
  PartOfSpeechType,
} from "@/data/quranVocabularyData";
import {
  markWordMastered,
  resetWordStatus,
  VocabLangPreference,
  loadUserVocabProgress,
} from "@/services/vocabularyStorage";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
import { useLearningStore } from "@/store/useLearningStore";
import { LearnerTierSwitcher } from "./LearnerTierSwitcher";
import { getPosLabel } from "@/services/terminologyService";
import {
  BarChart3,
  Search,
  Volume2,
  CheckCircle2,
  TrendingUp,
  Zap,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";

interface FrequencyGraphViewProps {
  masteredIds?: string[];
  langPreference?: VocabLangPreference;
  onProgressUpdate?: () => void;
}

type RangeOption = 20 | 50 | 100 | 250 | "all";
type PosFilterOption = "all" | "noun" | "verb" | "particle";

export function FrequencyGraphView({
  masteredIds: propMasteredIds,
  langPreference: propLangPreference,
  onProgressUpdate: propOnProgressUpdate,
}: FrequencyGraphViewProps) {
  const { language, isUrdu } = useLanguage();
  const { learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";
  const langPreference: VocabLangPreference = propLangPreference || language;

  const [internalProgress, setInternalProgress] = useState(() => loadUserVocabProgress());
  const masteredIds = propMasteredIds || internalProgress.masteredWordIds;

  const onProgressUpdate = () => {
    setInternalProgress(loadUserVocabProgress());
    propOnProgressUpdate?.();
  };

  const { playWord } = useAudio();
  const [selectedRange, setSelectedRange] = useState<RangeOption>(50);
  const [posFilter, setPosFilter] = useState<PosFilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMasteredOnly, setShowMasteredOnly] = useState(false);

  // Sort full pool descending by frequency
  const sortedWords = useMemo(() => {
    return [...QURAN_70_VOCABULARY].sort((a, b) => b.frequency - a.frequency);
  }, []);

  const maxFrequency = sortedWords[0]?.frequency || 2699;

  // Compute Pareto Coverage Benchmarks across the authentic dataset
  const paretoStats = useMemo(() => {
    const top20Sum = sortedWords.slice(0, 20).reduce((acc, w) => acc + w.frequency, 0);
    const top70Sum = sortedWords.slice(0, 70).reduce((acc, w) => acc + w.frequency, 0);
    const totalPoolSum = sortedWords.reduce((acc, w) => acc + w.frequency, 0);

    const masteredSum = sortedWords
      .filter((w) => masteredIds.includes(w.id))
      .reduce((acc, w) => acc + w.frequency, 0);

    return {
      top20Pct: ((top20Sum / TOTAL_QURAN_WORDS) * 100).toFixed(1),
      top70Pct: ((top70Sum / TOTAL_QURAN_WORDS) * 100).toFixed(1),
      totalPoolPct: ((totalPoolSum / TOTAL_QURAN_WORDS) * 100).toFixed(1),
      masteredPct: ((masteredSum / TOTAL_QURAN_WORDS) * 100).toFixed(1),
      masteredSum,
      totalPoolSum,
    };
  }, [sortedWords, masteredIds]);

  // Apply Range slice first, then POS, search and mastered filter
  const rangeLimitedWords = useMemo(() => {
    if (selectedRange === "all") return sortedWords;
    return sortedWords.slice(0, selectedRange);
  }, [sortedWords, selectedRange]);

  const displayedWords = useMemo(() => {
    return rangeLimitedWords.filter((w) => {
      // Filter by POS
      if (posFilter !== "all") {
        if (posFilter === "particle") {
          if (w.pos !== "particle" && w.pos !== "preposition") return false;
        } else if (posFilter === "noun") {
          if (w.pos !== "noun" && w.pos !== "pronoun" && w.pos !== "demonstrative") return false;
        } else if (w.pos !== posFilter) {
          return false;
        }
      }

      // Filter mastered
      if (showMasteredOnly && !masteredIds.includes(w.id)) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        w.arabic.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        w.urdu.includes(q) ||
        (w.root && w.root.includes(q))
      );
    });
  }, [rangeLimitedWords, posFilter, showMasteredOnly, masteredIds, searchQuery]);

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
    const audioUrl = getWordAudioUrl(word);
    if (audioUrl) {
      playWord(audioUrl);
    } else {
      playAudioSafely(undefined, word.arabic);
    }
  };

  const showEnglish = langPreference === "bilingual" || langPreference === "english";
  const showUrdu = langPreference === "bilingual" || langPreference === "urdu";

  const getPosBadgeColor = (pos: PartOfSpeechType) => {
    switch (pos) {
      case "noun":
      case "pronoun":
      case "demonstrative":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20";
      case "verb":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      case "particle":
      case "preposition":
      default:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
    }
  };

  const getBarGradient = (pos: PartOfSpeechType) => {
    switch (pos) {
      case "noun":
      case "pronoun":
      case "demonstrative":
        return "from-sky-500/80 to-teal-500/90";
      case "verb":
        return "from-amber-500/80 to-orange-500/90";
      case "particle":
      case "preposition":
      default:
        return "from-purple-500/80 to-indigo-500/90";
    }
  };

  const quizRangeParam = selectedRange === "all" ? 100 : selectedRange;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. PARETO ANALYTICS BANNER & MILESTONES */}
      <div className="p-5 md:p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-950/70 border border-emerald-500/20 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{isUrdu ? "قرآنی الفاظ کی کثرت کا تجزیہ" : "Quranic Frequency & Pareto Curve"}</span>
              </div>
              <LearnerTierSwitcher />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[var(--foreground)]">
              {isUrdu
                ? "سب سے زیادہ استعمال ہونے والے الفاظ کا بصری گراف"
                : "Visual Frequency Distribution of Quranic Words"}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-2xl">
              {isUrdu
                ? "قرآن مجید کے 77,430 کلمات میں سے چند سو بنیادی الفاظ بار بار دہرائے جاتے ہیں۔ صرف 70 الفاظ یاد کرنے سے قرآن کا 50% اور 375 الفاظ سے 71% سے زیادہ حصہ سمجھ میں آنے لگتا ہے۔"
                : "The 80/20 Pareto principle in the Quran: Just 20 words cover ~25% of the entire Quranic text, 70 words cover ~50%, and these 375 words account for over 71% of all 77,430 words."}
            </p>
          </div>

          {/* Quick Action: Launch Quiz */}
          <Link
            href={`/learn/arcade/meaning-quiz?range=${quizRangeParam}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>{isUrdu ? `ٹاپ ${quizRangeParam} الفاظ کا ٹیسٹ دیں` : `Quiz Top ${quizRangeParam} Words`}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Pareto Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Milestone 1 */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{isUrdu ? "پہلے 20 الفاظ" : "Top 20 Words"}</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">~25% Coverage</span>
            </div>
            <div className="w-full bg-[var(--surface-raised)] h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: "25%" }} />
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu ? "~19,500 تکرارات پر مشتمل" : "Account for ~19,500 occurrences"}
            </p>
          </div>

          {/* Milestone 2 */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{isUrdu ? "پہلے 70 الفاظ" : "Top 70 Words"}</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">~50% Coverage</span>
            </div>
            <div className="w-full bg-[var(--surface-raised)] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "50%" }} />
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu ? "نصف قرآن کے مفہوم کی چابی" : "Unlock half of the total Quran text"}
            </p>
          </div>

          {/* Milestone 3: Full 375 Pool */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{isUrdu ? "مجموعی پول (375 الفاظ)" : "Full Pool (375 Words)"}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {paretoStats.totalPoolPct}% Coverage
              </span>
            </div>
            <div className="w-full bg-[var(--surface-raised)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Number(paretoStats.totalPoolPct))}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu
                ? `آپ نے ${paretoStats.masteredPct}% حصہ یاد کر لیا ہے`
                : `Your mastery: ${paretoStats.masteredPct}% of the Quran`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILTER & RANGE CONTROLS BAR */}
      <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Range Selection Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs">
            <span className="px-2 text-[var(--muted-foreground)] font-medium text-[11px] hidden sm:inline">
              {isUrdu ? "تعداد:" : "Range:"}
            </span>
            {([20, 50, 100, 250, "all"] as RangeOption[]).map((range) => (
              <button
                key={String(range)}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedRange === range
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {range === "all" ? (isUrdu ? "تمام 375" : "All (375)") : `Top ${range}`}
              </button>
            ))}
          </div>

          {/* POS Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setPosFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                posFilter === "all"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {isUrdu ? "سب" : "All Types"}
            </button>
            <button
              type="button"
              onClick={() => setPosFilter("noun")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                posFilter === "noun"
                  ? "bg-sky-600 text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {isUrdu ? "اسم / ضمیر" : "Nouns"}
            </button>
            <button
              type="button"
              onClick={() => setPosFilter("verb")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                posFilter === "verb"
                  ? "bg-amber-600 text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {isUrdu ? "افعال" : "Verbs"}
            </button>
            <button
              type="button"
              onClick={() => setPosFilter("particle")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                posFilter === "particle"
                  ? "bg-purple-600 text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {isUrdu ? "حروف" : "Particles"}
            </button>
          </div>
        </div>

        {/* Search & Mastered Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--border-subtle)]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? "عربی، اردو، انگریزی یا روٹ سے تلاش کریں..."
                  : "Search words by Arabic, English, Urdu, or root..."
              }
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>
              {isUrdu ? "دکھائے گئے:" : "Showing:"}{" "}
              <strong className="text-[var(--foreground)]">{displayedWords.length}</strong>
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMasteredOnly}
                onChange={(e) => setShowMasteredOnly(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span>{isUrdu ? "صرف حفظ شدہ" : "Mastered only"}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. COMPARATIVE FREQUENCY BAR GRAPH LIST */}
      <div className="space-y-2.5">
        {displayedWords.map((word, idx) => {
          const isMastered = masteredIds.includes(word.id);
          const percentOfMax = Math.max(4, Math.round((word.frequency / maxFrequency) * 100));
          const percentOfQuran = ((word.frequency / TOTAL_QURAN_WORDS) * 100).toFixed(2);
          const globalRank = sortedWords.findIndex((w) => w.id === word.id) + 1;

          return (
            <div
              key={word.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                isMastered
                  ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs"
                  : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/30"
              }`}
            >
              {/* Row Top: Metadata, Arabic, Translations & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                {/* Left: Rank, Audio, Word & Transliteration */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    #{globalRank}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handlePlayAudio(e, word)}
                    className="p-1.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Play pronunciation"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-arabic-amiri text-2xl font-bold text-[var(--foreground)]"
                      dir="rtl"
                    >
                      {word.arabic}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                      {word.transliteration}
                    </span>
                  </div>

                  {/* Word Type Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getPosBadgeColor(
                      word.pos
                    )}`}
                  >
                    {ageGroup === "kids"
                      ? getPosLabel(word.pos, ageGroup, isUrdu).label
                      : isUrdu
                      ? word.posLabelAr
                      : word.posLabelEn}
                  </span>

                  {word.root && (
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)] hidden md:inline">
                      Root: {word.root}
                    </span>
                  )}
                </div>

                {/* Right: Meanings & Mastered Button */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {showEnglish && (
                      <div className="text-xs font-semibold text-[var(--foreground)]">
                        {word.english}
                      </div>
                    )}
                    {showUrdu && (
                      <div
                        className="font-urdu-nastaliq text-xs text-[var(--muted-foreground)] leading-tight"
                        dir="rtl"
                      >
                        {word.urdu}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMastered(word.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isMastered
                        ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-xs"
                        : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                  >
                    {isMastered ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{isUrdu ? "حفظ شدہ" : "Mastered"}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isUrdu ? "یاد کریں" : "Learn"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Row Bottom: Scaled Comparative Horizontal Bar */}
              <div className="space-y-1">
                <div className="w-full bg-[var(--surface-card)] h-3 rounded-full overflow-hidden border border-[var(--border-subtle)] p-0.5 flex items-center">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getBarGradient(
                      word.pos
                    )}`}
                    style={{ width: `${percentOfMax}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-mono px-0.5">
                  <span className="font-semibold text-[var(--foreground)]">
                    {word.frequency.toLocaleString()} {isUrdu ? "مرتبہ قرآن میں" : "occurrences"}
                  </span>
                  <span>{percentOfQuran}% {isUrdu ? "پورے قرآن کا" : "of entire Quran"}</span>
                </div>
              </div>
            </div>
          );
        })}

        {displayedWords.length === 0 && (
          <div className="p-8 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-center space-y-2">
            <p className="text-sm text-[var(--muted-foreground)]">
              {isUrdu
                ? "آپ کی تلاش یا فلٹر کے مطابق کوئی لفظ نہیں ملا۔"
                : "No Quranic words match your search or filter criteria."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPosFilter("all");
                setShowMasteredOnly(false);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              {isUrdu ? "فلٹرز ختم کریں" : "Clear all filters"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

