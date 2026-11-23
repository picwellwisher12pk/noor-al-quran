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
import { useLearningStore } from "@/store/useLearningStore";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
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

function getLocalizedGrammarNote(word: QuranVocabWord, isUrdu: boolean): string {
  if (!isUrdu) return word.grammarNotes || "";
  const gn = word.grammarNotes || "";
  if (gn.includes("Proper name of the Creator")) return "اسمِ جلالت، خالق کائنات کا ذاتی نام؛ یکتا و بے مثال۔";
  if (gn.includes("ownership, care, nurturing")) return "اسم برائے ربوبیت، پرورش اور کامل اختیار و ملکیت۔";
  if (gn.includes("boundless, universal mercy")) return "صفتِ مشبہ برائے رحمتِ عامہ جو تمام مخلوقات کو محیط ہے۔";
  if (gn.includes("perpetual and specialized mercy")) return "صفتِ دائمہ برائے رحمتِ خاصہ جو مومنین کے لیے مخصوص ہے۔";
  if (gn.includes("Verbal noun (masdar)")) return "مصدر (رحمت اور فضلِ الہی کا مظہر)۔";
  if (gn.includes("Intensive form (sighat mubalaghah)")) return "صیغہ مبالغہ برائے کثرت و دوامِ مغفرت و بخشش۔";
  if (gn.includes("Adjective indicating infinite, complete knowledge")) return "صفتِ علمِ کامل، غیب و شہادت کے تمام احوال کا جاننے والا۔";
  if (gn.includes("Demonstrative pronoun")) return "اسمِ اشارہ (دور یا نزدیک کی طرف اشارہ کرنے والا کلمہ)۔";
  if (gn.includes("Relative pronoun")) return "اسمِ موصول (صلہ کے ذریعے جملے کو جوڑنے والا اسم)۔";
  if (gn.includes("Preposition")) return "حرفِ جار (جو اپنے مابعد اسم کو حالتِ جر دیتا ہے)۔";
  if (gn.includes("Personal pronoun")) return "ضمیر (جو متکلم، مخاطب یا غائب پر دلالت کرے)۔";
  if (gn.includes("Negation particle")) return "حرفِ نفی (نفی کے مفہوم کے لیے مستعمل)۔";
  if (gn.includes("Conditional particle")) return "حرفِ شرط (شرط اور جزا کو جوڑنے والا حرف)۔";
  if (gn.includes("Past tense verb")) return "فعل ماضی (گزرے ہوئے زمانے میں کام کا واقع ہونا)۔";
  if (gn.includes("Present/imperfect verb") || gn.includes("Present tense")) return "فعل مضارع (حال یا استقبال میں کام کا واقع ہونا)۔";
  if (gn.includes("Imperative verb")) return "فعل امر (کسی کام کے کرنے کا حکم یا طلب)۔";
  return word.posLabelAr || "نحوی کلمہ";
}

export function FlashcardDeck({
  masteredIds: propMasteredIds,
  reviewIds: propReviewIds,
  langPreference: propLangPreference,
  onProgressUpdate: propOnProgressUpdate,
  words = QURAN_70_VOCABULARY,
}: FlashcardDeckProps = {}) {
  const { language, isUrdu } = useLanguage();
  const langPreference: VocabLangPreference = propLangPreference || language;
  const activeIsUrdu = isUrdu || langPreference === "urdu";

  const storeMasteredIds = useLearningStore((s) => s.masteredWordIds);
  const storeReviewIds = useLearningStore((s) => s.reviewWordIds);
  const storeMarkMastered = useLearningStore((s) => s.markWordMastered);
  const storeMarkReview = useLearningStore((s) => s.markWordForReview);
  const storeResetStatus = useLearningStore((s) => s.resetWordStatus);

  const [internalProgress, setInternalProgress] = useState(() => loadUserVocabProgress());

  const masteredIds = propMasteredIds || (Array.isArray(storeMasteredIds) && storeMasteredIds.length > 0 ? storeMasteredIds : internalProgress.masteredWordIds);
  const reviewIds = propReviewIds || (Array.isArray(storeReviewIds) && storeReviewIds.length > 0 ? storeReviewIds : internalProgress.reviewWordIds);

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

  const handleMarkMastered = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentWord) return;
    try {
      storeMarkMastered(currentWord.id);
    } catch {}
    markWordMastered(currentWord.id);
    logVocabularyStudy(1);
    onProgressUpdate();
    if (deck.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setIsFlipped(false);
    }
  };

  const handleMarkReview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentWord) return;
    try {
      storeMarkReview(currentWord.id);
    } catch {}
    markWordForReview(currentWord.id);
    logVocabularyStudy(1);
    onProgressUpdate();
    if (deck.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setIsFlipped(false);
    }
  };

  const handleToggleStatus = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentWord) return;
    if (isMastered) {
      try {
        storeResetStatus(currentWord.id);
      } catch {}
      resetWordStatus(currentWord.id);
    } else {
      try {
        storeMarkMastered(currentWord.id);
      } catch {}
      markWordMastered(currentWord.id);
    }
    onProgressUpdate();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    const audioUrl = getWordAudioUrl(currentWord);
    if (audioUrl) {
      playWord(audioUrl);
    } else {
      playAudioSafely(undefined, currentWord.arabic);
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
              {activeIsUrdu ? `تمام (${filteredWords.length})` : `All (${filteredWords.length})`}
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
              {activeIsUrdu ? "سیکھنے کیلئے" : "To Learn"}
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
              {activeIsUrdu ? "یاد شدہ" : "Mastered"}
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
              <span>{showAdvancedFilters ? (activeIsUrdu ? "فلٹرز چھپائیں" : "Hide Filters") : (activeIsUrdu ? "اقسام" : "Categories")}</span>
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
              title={activeIsUrdu ? "کارڈز کی ترتیب بدلیں" : "Shuffle Deck Order"}
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
              <option value="all">
                {activeIsUrdu ? `تمام گروپس (${words.length} الفاظ)` : `All Groups (${words.length} Words)`}
              </option>
              {VOCAB_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {activeIsUrdu ? cat.labelAr : `${cat.labelEn} (${cat.labelAr})`}
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
              <option value="all">{activeIsUrdu ? "تمام معنوی موضوعات" : "All Meaning Themes"}</option>
              {SEMANTIC_CLUSTERS.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {activeIsUrdu ? cl.titleAr : cl.title}
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
                {activeIsUrdu ? "گروپ فلٹرز ختم کریں" : "Clear Group Filters"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. CARD INDEX & OCCURRENCE PILL */}
      <div className="w-full flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)]">
            {activeIsUrdu ? `کارڈ ${safeIndex + 1} از ${deck.length}` : `Card ${safeIndex + 1} of ${deck.length}`}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 dark:bg-emerald-950/70 border border-emerald-500/20 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400">
            {activeIsUrdu
              ? `قرآن میں ${currentWord.frequency.toLocaleString()} مرتبہ`
              : `${currentWord.frequency.toLocaleString()} occurrences in Quran`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMastered && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" /> {activeIsUrdu ? "یاد شدہ" : "Mastered"}
            </span>
          )}
          {isReview && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <RotateCw className="h-3 w-3" /> {activeIsUrdu ? "دہرائی کیلئے" : "Due for Review"}
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
          aria-label={activeIsUrdu ? "فلیش کارڈ - پلٹنے کیلئے کلک کریں یا Space دبائیں" : "Flashcard - Click or press Space to flip"}
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
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />

            {/* Front Header */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-950/70 border border-emerald-500/20 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300">
                  {activeIsUrdu ? currentWord.posLabelAr : `${currentWord.posLabelAr} (${currentWord.posLabelEn})`}
                </span>
                {currentWord.root && (
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)]">
                    {activeIsUrdu ? `مادہ: ${currentWord.root}` : `Root: ${currentWord.root}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-sm cursor-pointer"
                  title={activeIsUrdu ? "عربی لفظ کا تلفظ سنیں" : "Pronounce Arabic Word"}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleStatus(e)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isMastered
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-400"
                  }`}
                  title={isMastered ? (activeIsUrdu ? "یاد شدہ کا نشان ختم کریں" : "Unmark Mastered") : (activeIsUrdu ? "یاد شدہ کا نشان لگائیں" : "Mark as Mastered")}
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
              {!activeIsUrdu && currentWord.transliteration && (
                <p className="text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
                  {currentWord.transliteration}
                </p>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
                >
                  <RotateCw className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{activeIsUrdu ? "معنی دیکھنے کیلئے کلک کریں یا Space دبائیں" : "Click or press Space to reveal meaning"}</span>
                </button>
              </div>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] relative z-10">
              {!activeIsUrdu && <span>{currentWord.categoryLabelEn}</span>}
              <span className="font-arabic ml-auto" dir="rtl">{currentWord.categoryLabelAr}</span>
            </div>
          </div>

          {/* ==================== BACK FACE ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-[var(--surface-raised)] border-2 border-[var(--card-border)] hover:border-emerald-500/40 shadow-2xl flex flex-col justify-between p-6 md:p-8 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              pointerEvents: isFlipped ? "auto" : "none",
            }}
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

            {/* Back Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-arabic-amiri text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 font-bold" dir="rtl">
                  {currentWord.arabic}
                </span>
                {!activeIsUrdu && currentWord.transliteration && (
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    ({currentWord.transliteration})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-sm cursor-pointer"
                  title={activeIsUrdu ? "عربی لفظ کا تلفظ سنیں" : "Pronounce Arabic Word"}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Back Body: Meanings & Context */}
            <div className="my-auto py-2.5 space-y-2.5 relative z-10">
              {/* Meanings Cards */}
              <div className={`grid gap-2.5 ${showEnglish && showUrdu ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {showEnglish && (
                  <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      English Meaning
                    </span>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {currentWord.english}
                    </p>
                  </div>
                )}
                {showUrdu && (
                  <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      اردو ترجمہ
                    </span>
                    <p className="font-urdu-nastaliq text-base text-[var(--foreground)] leading-relaxed" dir="rtl">
                      {currentWord.urdu}
                    </p>
                  </div>
                )}
              </div>

              {/* Semantic Group & Grammar Notes */}
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 dark:border-emerald-800/40 flex items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    {activeIsUrdu ? "ہم معنی الفاظ / جھرمٹ:" : "Similar Meaning Cluster:"}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {activeIsUrdu
                      ? currentWord.semanticClusterTitleAr
                      : `${currentWord.semanticClusterTitle} (${currentWord.semanticClusterTitleAr})`}
                  </span>
                </div>
                {(currentWord.grammarNotes || activeIsUrdu) && (
                  <div className="text-right max-w-xs">
                    <span className="text-[10px] text-[var(--muted-foreground)] block">
                      {activeIsUrdu ? "نحوی / صرفی نوٹ" : "Grammar Note"}
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]">
                      {getLocalizedGrammarNote(currentWord, activeIsUrdu)}
                    </span>
                  </div>
                )}
              </div>

              {/* Authentic Sample Verse */}
              <div className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {activeIsUrdu
                      ? `نمونہ آیت: سورۃ ${currentWord.sampleAyah.surahNameAr || currentWord.sampleAyah.surahName} [${currentWord.sampleAyah.surah}:${currentWord.sampleAyah.ayah}]`
                      : `Sample Verse: Surah ${currentWord.sampleAyah.surahName} [${currentWord.sampleAyah.surah}:${currentWord.sampleAyah.ayah}]`}
                  </span>
                  {!activeIsUrdu && (
                    <span className="font-arabic text-xs text-[var(--muted-foreground)]" dir="rtl">
                      سورة {currentWord.sampleAyah.surahNameAr}
                    </span>
                  )}
                </div>
                <p className="font-arabic-amiri text-base text-[var(--foreground)] leading-relaxed text-right" dir="rtl">
                  {currentWord.sampleAyah.verseText}
                </p>
                {showUrdu && currentWord.sampleAyah.urduText && (
                  <p className="font-urdu-nastaliq text-xs text-[var(--foreground)]/90 leading-relaxed text-right" dir="rtl">
                    &ldquo;{currentWord.sampleAyah.urduText}&rdquo;
                  </p>
                )}
                {showEnglish && currentWord.sampleAyah.englishText && (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    &ldquo;{currentWord.sampleAyah.englishText}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium cursor-pointer"
              >
                <RotateCw className="h-3 w-3" />
                <span>{activeIsUrdu ? "واپس پلٹنے کیلئے کلک کریں یا Space دبائیں" : "Click or press Space to rotate back"}</span>
              </button>
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
          className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:bg-[var(--surface-card)] text-[var(--foreground)] transition-colors shadow-sm cursor-pointer active:scale-95"
          title={activeIsUrdu ? "پچھلا کارڈ (بایاں تیر)" : "Previous Card (Left Arrow)"}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Review Later Button */}
          <button
            type="button"
            onClick={(e) => handleMarkReview(e)}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{activeIsUrdu ? "بعد میں دہرائیں (1)" : "Review Later (1)"}</span>
          </button>

          {/* Mastered Button */}
          <button
            type="button"
            onClick={(e) => handleMarkMastered(e)}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{activeIsUrdu ? "مجھے یاد ہے! (2)" : "I Know This! (2)"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:bg-[var(--surface-card)] text-[var(--foreground)] transition-colors shadow-sm cursor-pointer active:scale-95"
          title={activeIsUrdu ? "اگلا کارڈ (دایاں تیر)" : "Next Card (Right Arrow)"}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
