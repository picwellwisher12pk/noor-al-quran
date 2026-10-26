"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  QuranVocabWord,
  QURAN_70_VOCABULARY,
  VOCAB_CATEGORIES,
  SEMANTIC_CLUSTERS,
  QuranVocabCategory,
} from "@/data/quranVocabularyData";
import {
  markWordMastered,
  markWordForReview,
  resetWordStatus,
  VocabLangPreference,
  loadUserVocabProgress,
} from "@/services/vocabularyStorage";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import {
  Volume2,
  RotateCw,
  CheckCircle,
  HelpCircle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface FlashcardDeckProps {
  masteredIds?: string[];
  reviewIds?: string[];
  langPreference?: VocabLangPreference;
  onProgressUpdate?: () => void;
  words?: QuranVocabWord[];
}

export function FlashcardDeck({
  masteredIds: propMasteredIds,
  reviewIds: propReviewIds,
  langPreference: propLangPreference,
  onProgressUpdate: propOnProgressUpdate,
  words = QURAN_70_VOCABULARY,
}: FlashcardDeckProps = {}) {
  const { language } = useLanguage();
  const langPreference: VocabLangPreference = propLangPreference || language;

  const [internalProgress, setInternalProgress] = useState(() => loadUserVocabProgress());

  const masteredIds = propMasteredIds || internalProgress.masteredWordIds;
  const reviewIds = propReviewIds || internalProgress.reviewWordIds;

  const onProgressUpdate = () => {
    setInternalProgress(loadUserVocabProgress());
    propOnProgressUpdate?.();
  };
  const { playWord } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState<QuranVocabCategory | "all">("all");
  const [selectedCluster, setSelectedCluster] = useState<string | "all">("all");
  const [filterMode, setFilterMode] = useState<"all" | "learning" | "mastered">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      if (selectedCategory !== "all" && word.category !== selectedCategory) return false;
      if (selectedCluster !== "all" && word.semanticClusterId !== selectedCluster) return false;
      if (filterMode === "mastered" && !masteredIds.includes(word.id)) return false;
      if (filterMode === "learning" && masteredIds.includes(word.id)) return false;
      return true;
    });
  }, [words, selectedCategory, selectedCluster, filterMode, masteredIds]);

  const deck = useMemo(() => {
    if (!isShuffled) return filteredWords;
    const shuffled = [...filteredWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [filteredWords, isShuffled, shuffleSeed]);

  const safeIndex = deck.length > 0 ? Math.min(currentIndex, deck.length - 1) : 0;
  const currentWord = deck[safeIndex];
  const isMastered = currentWord ? masteredIds.includes(currentWord.id) : false;
  const isReview = currentWord ? reviewIds.includes(currentWord.id) : false;

  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % deck.length);
    setIsFlipped(false);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    setIsFlipped(false);
  }, [deck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const { logVocabularyStudy } = useReadingActivity();

  const handleMarkMastered = () => {
    if (!currentWord) return;
    markWordMastered(currentWord.id);
    logVocabularyStudy(1);
    onProgressUpdate();
    if (deck.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setIsFlipped(false);
    }
  };

  const handleMarkReview = () => {
    if (!currentWord) return;
    markWordForReview(currentWord.id);
    logVocabularyStudy(1);
    onProgressUpdate();
    if (deck.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setIsFlipped(false);
    }
  };

  const handleToggleStatus = () => {
    if (!currentWord) return;
    if (isMastered) {
      resetWordStatus(currentWord.id);
    } else {
      markWordMastered(currentWord.id);
    }
    onProgressUpdate();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    const { surah, ayah } = currentWord.sampleAyah;
    const sStr = String(surah).padStart(3, "0");
    const aStr = String(ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(currentWord.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "1") {
        handleMarkReview();
      } else if (e.key === "2") {
        handleMarkMastered();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkMastered, handleMarkReview]);

  if (!currentWord) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] max-w-xl mx-auto shadow-lg">
        <Sparkles className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1">No Words Found In This Filter</h3>
        <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mb-4">
          All words in this category have been marked or no words match your current filters.
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("all");
            setSelectedCluster("all");
            setFilterMode("all");
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  const showEnglish = langPreference === "bilingual" || langPreference === "english";
  const showUrdu = langPreference === "bilingual" || langPreference === "urdu";

  return (
    <div className="space-y-4 max-w-2xl mx-auto flex flex-col items-center">
      {/* 1. COMPACT TOP DECK FILTER TOOLBAR */}
      <div className="w-full p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-xs shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Mode Tabs */}
          <div className="p-0.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex text-[11px]">
            <button
              type="button"
              onClick={() => {
                setFilterMode("all");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === "all" ? "bg-emerald-600 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              All ({filteredWords.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("learning");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === "learning" ? "bg-amber-600 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              To Learn
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("mastered");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === "mastered" ? "bg-emerald-700 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Mastered
            </button>
          </div>

          {/* Right Tools: Shuffle & Advanced Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                showAdvancedFilters || selectedCategory !== "all" || selectedCluster !== "all"
                  ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-400"
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Filter className="h-3 w-3" />
              <span>{showAdvancedFilters ? "Hide Filters" : "Categories"}</span>
              {(selectedCategory !== "all" || selectedCluster !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsShuffled((prev) => !prev);
                setShuffleSeed((s) => s + 1);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isShuffled
                  ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Shuffle Deck Order"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progressive Disclosure: Category & Semantic Cluster Selectors */}
        {showAdvancedFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--border-subtle)]">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as any);
                setSelectedCluster("all");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="all">All Groups ({words.length} Words)</option>
              {VOCAB_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.labelEn} ({cat.labelAr})
                </option>
              ))}
            </select>

            <select
              value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 text-xs max-w-[200px] truncate"
            >
              <option value="all">All Meaning Themes</option>
              {SEMANTIC_CLUSTERS.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.title}
                </option>
              ))}
            </select>

            {(selectedCategory !== "all" || selectedCluster !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedCluster("all");
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 ml-auto cursor-pointer"
              >
                Clear Group Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. CARD INDEX & OCCURRENCE PILL */}
      <div className="w-full flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">
            Card {safeIndex + 1} of {deck.length}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
            {currentWord.frequency.toLocaleString()} occurrences in Quran
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMastered && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Mastered
            </span>
          )}
          {isReview && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
              <RotateCw className="h-3 w-3" /> Due for Review
            </span>
          )}
        </div>
      </div>

      {/* 3. 3D FLIP CARD CONTAINER WITH EXPLICIT PIXEL HEIGHT (PREVENTS COLLAPSE) */}
      <div
        className="w-full select-none"
        style={{
          perspective: "1200px",
          height: "440px",
          maxWidth: "640px",
        }}
      >
        <div
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label="Flashcard - Click or press Space to flip"
          className="w-full h-full relative cursor-pointer focus:outline-none"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* ==================== FRONT FACE ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] hover:border-emerald-500/40 shadow-2xl flex flex-col justify-between p-6 md:p-8 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />

            {/* Front Header */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
                  {currentWord.posLabelAr} ({currentWord.posLabelEn})
                </span>
                {currentWord.root && (
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)]">
                    Root: {currentWord.root}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-sm"
                  title="Pronounce Arabic Word"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus();
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    isMastered
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-400"
                  }`}
                  title={isMastered ? "Unmark Mastered" : "Mark as Mastered"}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Front Center: Large Arabic Calligraphy */}
            <div className="my-auto py-4 text-center relative z-10 space-y-3">
              <h2
                className="font-arabic-amiri text-5xl sm:text-6xl md:text-7xl text-[var(--foreground)] tracking-wide font-bold leading-relaxed"
                dir="rtl"
              >
                {currentWord.arabic}
              </h2>
              <p className="text-base sm:text-lg text-emerald-400 font-medium tracking-wide">
                {currentWord.transliteration}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                  <RotateCw className="h-3 w-3 text-emerald-400" /> Click or press Space to reveal meaning
                </span>
              </div>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] relative z-10">
              <span>{currentWord.categoryLabelEn}</span>
              <span className="font-arabic" dir="rtl">{currentWord.categoryLabelAr}</span>
            </div>
          </div>

          {/* ==================== BACK FACE ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] hover:border-emerald-500/40 shadow-2xl flex flex-col justify-between p-6 md:p-8 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

            {/* Back Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-arabic-amiri text-2xl sm:text-3xl text-emerald-400 font-bold" dir="rtl">
                  {currentWord.arabic}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                  ({currentWord.transliteration})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-sm"
                  title="Pronounce Arabic Word"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Back Body: Meanings & Context */}
            <div className="my-auto py-2.5 space-y-2.5 relative z-10">
              {/* Meanings Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {showEnglish && (
                  <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      English Meaning
                    </span>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {currentWord.english}
                    </p>
                  </div>
                )}
                {showUrdu && (
                  <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      اردو ترجمہ
                    </span>
                    <p className="font-urdu-nastaliq text-base text-[var(--foreground)] leading-relaxed" dir="rtl">
                      {currentWord.urdu}
                    </p>
                  </div>
                )}
              </div>

              {/* Semantic Group & Grammar Notes */}
              <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">
                    Similar Meaning Cluster:
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {currentWord.semanticClusterTitle} ({currentWord.semanticClusterTitleAr})
                  </span>
                </div>
                {currentWord.grammarNotes && (
                  <div className="text-right max-w-xs">
                    <span className="text-[10px] text-[var(--muted-foreground)] block">Grammar Note</span>
                    <span className="text-[11px] text-[var(--foreground)]">{currentWord.grammarNotes}</span>
                  </div>
                )}
              </div>

              {/* Authentic Sample Verse */}
              <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Sample Verse: Surah {currentWord.sampleAyah.surahName} [{currentWord.sampleAyah.surah}:{currentWord.sampleAyah.ayah}]
                  </span>
                  <span className="font-arabic text-xs text-[var(--muted-foreground)]" dir="rtl">
                    سورة {currentWord.sampleAyah.surahNameAr}
                  </span>
                </div>
                <p className="font-arabic-amiri text-base text-[var(--foreground)] leading-relaxed text-right" dir="rtl">
                  {currentWord.sampleAyah.verseText}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] italic">
                  &ldquo;{currentWord.sampleAyah.englishText}&rdquo;
                </p>
              </div>
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] relative z-10">
              <span className="flex items-center gap-1 text-emerald-400">
                <RotateCw className="h-3 w-3" /> Click or press Space to rotate back
              </span>
              <span className="font-arabic" dir="rtl">{currentWord.categoryLabelAr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ACTION CONTROLS */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:bg-[var(--surface-card)] text-[var(--foreground)] transition-colors shadow-sm"
          title="Previous Card (Left Arrow)"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Review Later Button */}
          <button
            type="button"
            onClick={handleMarkReview}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Review Later (1)</span>
          </button>

          {/* Mastered Button */}
          <button
            type="button"
            onClick={handleMarkMastered}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>I Know This! (2)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:bg-[var(--surface-card)] text-[var(--foreground)] transition-colors shadow-sm"
          title="Next Card (Right Arrow)"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
