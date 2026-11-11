"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDesktopWorkspace, InspectorTab } from "@/context/DesktopWorkspaceContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { getWordMorphology, WordMorphology } from "@/services/morphologyService";
import { getWordRoot, getRootByName, WordRootInfo } from "@/services/rootService";
import {
  getWordMultilingualTranslations,
  getAyahComparativeTranslations,
  WordTranslationItem,
  ScholarVerseTranslation,
} from "@/services/wordTranslationsService";
import { fetchTafsirForAyah, AVAILABLE_TAFSIRS } from "@/services/quranApi";
import { parseAndFormatTafsir } from "@/utils/tafsirFormatter";
import { TafsirModal } from "@/components/modals/TafsirModal";
import NoteEditorModal from "@/components/modals/NoteEditorModal";
import {
  X,
  BookOpen,
  Languages,
  ScrollText,
  Layers,
  Sparkles,
  Volume2,
  Copy,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ExternalLink,
  StickyNote,
  Plus,
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotes } from "@/context/NotesContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
import { useLearningStore } from "@/store/useLearningStore";
import { getPosLabel, getCaseEndingExplanation } from "@/services/terminologyService";
import { getWordComprehensiveMeanings } from "@/services/quranLexiconService";

function normalizePosClass(posClass?: string): "noun" | "verb" | "particle" | "pronoun" | "preposition" | "demonstrative" {
  if (!posClass) return "noun";
  const upper = posClass.toUpperCase();
  if (upper === "V") return "verb";
  if (upper === "P") return "preposition";
  if (upper === "PRON") return "pronoun";
  if (upper === "DEM") return "demonstrative";
  if (["CONJ", "DET", "NEG", "INTG", "SUB", "COND", "VOC", "RES", "EMPH"].includes(upper)) return "particle";
  return "noun";
}

function normalizeCaseType(caseStr?: string): "raf" | "nasb" | "jarr" | null {
  if (!caseStr) return null;
  const lower = caseStr.toLowerCase();
  if (lower.includes("nom") || lower.includes("مرفوع")) return "raf";
  if (lower.includes("acc") || lower.includes("منصوب")) return "nasb";
  if (lower.includes("gen") || lower.includes("مجرور")) return "jarr";
  return null;
}

export function DesktopRightInspector() {
  const {
    isRightInspectorOpen,
    closeInspector,
    activeInspectorTab,
    setActiveInspectorTab,
    selectedWord,
    selectedAyahKey,
    selectedAyahArabic,
    inspectorWidth,
    toggleExpandInspector,
  } = useDesktopWorkspace();

  const { prefs, setSelectedTafsirId, setTafsirFontSize } = useReadingPreferences();
  const { playWord, playVerse } = useAudio();
  const { isUrdu } = useLanguage();
  const { getVerseNote, getWordNote } = useNotes();

  // Inspector Data States
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [rootInfo, setRootInfo] = useState<WordRootInfo | null>(null);
  const [multilingual, setMultilingual] = useState<WordTranslationItem[]>([]);
  const [scholarTranslations, setScholarTranslations] = useState<ScholarVerseTranslation[]>([]);
  const [tafsirText, setTafsirText] = useState<string>("");
  const [tafsirAuthor, setTafsirAuthor] = useState<string>("");
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [noteModalTarget, setNoteModalTarget] = useState<"verse" | "word" | null>(null);

  // Loading States
  const [loadingMorph, setLoadingMorph] = useState(false);
  const [loadingLangs, setLoadingLangs] = useState(false);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [loadingScholars, setLoadingScholars] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // When selected word changes, load morphology, translations, root
  useEffect(() => {
    if (!isRightInspectorOpen) return;

    if (selectedWord) {
      const [chapStr, verseStr, posStr] = selectedWord.location.split(":");
      const chapterId = Number(chapStr) || 1;
      const verseNumber = Number(verseStr) || 1;
      const wordPosition = Number(posStr) || selectedWord.position || 1;
      const verseKey = selectedWord.verse_key || `${chapterId}:${verseNumber}`;

      // 1. Multilingual Translations
      setLoadingLangs(true);
      getWordMultilingualTranslations(
        verseKey,
        wordPosition,
        selectedWord.translation_urdu?.text,
        selectedWord.translation?.text
      )
        .then((items) => setMultilingual(items))
        .catch(console.error)
        .finally(() => setLoadingLangs(false));

      // 2. Morphology & Grammar
      setLoadingMorph(true);
      getWordMorphology(selectedWord.location)
        .then((morph) => {
          setMorphology(morph);
          if (morph?.root) {
            getRootByName(morph.root).then((info) => {
              if (info) setRootInfo(info);
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingMorph(false));

      // 3. Root Occurrences
      getWordRoot(chapterId, verseNumber, wordPosition)
        .then((info) => {
          if (info) setRootInfo(info);
        })
        .catch(console.error);
    }
  }, [isRightInspectorOpen, selectedWord]);

  // When selected ayah changes, load Tafseer & Scholar translations
  useEffect(() => {
    if (!isRightInspectorOpen || !selectedAyahKey) return;

    // 1. Fetch Comparative Scholar Translations
    setLoadingScholars(true);
    getAyahComparativeTranslations(selectedAyahKey)
      .then((items) => setScholarTranslations(items))
      .catch(console.error)
      .finally(() => setLoadingScholars(false));

    // 2. Fetch Tafseer
    setLoadingTafsir(true);
    fetchTafsirForAyah(prefs.selectedTafsirId, selectedAyahKey)
      .then((data) => {
        if (data && data.text) {
          setTafsirText(parseAndFormatTafsir(data.text, isUrdu));
          setTafsirAuthor(data.author);
        } else {
          setTafsirText(isUrdu ? "اس آیت کی تفسیر فی الحال دستیاب نہیں ہے۔" : "Tafseer commentary is currently unavailable for this Ayah.");
          setTafsirAuthor("");
        }
      })
      .catch((err) => {
        console.error("Error loading tafsir:", err);
        setTafsirText(isUrdu ? "تفسیر لوڈ کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔" : "Unable to load Tafseer commentary at this time.");
      })
      .finally(() => setLoadingTafsir(false));
  }, [isRightInspectorOpen, selectedAyahKey, prefs.selectedTafsirId, isUrdu]);

  const { learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";
  const isKids = ageGroup === "kids";
  const isAdv = ageGroup === "advanced";

  const effectiveRoot = morphology?.root || rootInfo?.root;

  const effectiveWordText = selectedWord?.text_uthmani || selectedWord?.text || selectedAyahArabic || "";
  const comprehensiveMeanings = useMemo(() => {
    return getWordComprehensiveMeanings(
      effectiveWordText,
      effectiveRoot || undefined,
      morphology?.lemma,
      selectedWord?.translation?.text,
      selectedWord?.translation_urdu?.text,
      ageGroup
    );
  }, [effectiveWordText, effectiveRoot, morphology?.lemma, selectedWord?.translation?.text, selectedWord?.translation_urdu?.text, ageGroup]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isRightInspectorOpen) return null;

  const widthClass = {
    default: "w-96",
    expanded: "w-[560px]",
    maximized: "w-[780px]",
  }[inspectorWidth] || "w-96";

  return (
    <>
      <aside
        className={`${widthClass} h-full flex-none flex flex-col bg-[var(--surface-raised)] border-l border-[var(--border-subtle)] select-none z-30 transition-all duration-200 overflow-hidden shadow-2xl`}
      >
        {/* Inspector Header */}
        <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {isKids
                ? (isUrdu ? "ننھے متلاشی انسپکٹر 🚀" : "Young Explorer Inspector 🚀")
                : isAdv
                ? (isUrdu ? "تحقیق صرفی ولغوی" : "Linguistic & Tafseer Lexicon")
                : (isUrdu ? "تحقیقِ الفاظ وتفسیر" : "Linguistic & Tafseer Inspector")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Expand / Collapse Width Button */}
            <button
              type="button"
              onClick={toggleExpandInspector}
              className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
              title={
                inspectorWidth === "default"
                  ? "Expand to Wider View"
                  : inspectorWidth === "expanded"
                  ? "Maximize Width"
                  : "Restore Default Width"
              }
            >
              {inspectorWidth === "default" ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            {/* Close Button */}
            <button
              type="button"
              onClick={closeInspector}
              className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
              title="Close Inspector (Ctrl+\)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Token Hero Banner */}
        <div className="p-3.5 bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)] text-center relative overflow-hidden">
          <div className="text-[10px] text-[var(--muted-foreground)] mb-1 flex items-center justify-center gap-2">
            <span>{selectedWord ? `Ayah ${selectedWord.verse_key} • Word ${selectedWord.position}` : `Ayah ${selectedAyahKey}`}</span>
            {isKids && (
              <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                {isUrdu ? "متلاشی موڈ ⭐" : "Explorer Mode ⭐"}
              </span>
            )}
          </div>
          <div className="font-arabic text-3xl font-bold text-emerald-700 dark:text-emerald-300 py-0.5 leading-relaxed" dir="rtl">
            {selectedWord?.text_uthmani || selectedWord?.text || selectedAyahArabic || "ٱلْقُرْءَان"}
          </div>
          {prefs.showTranslation && prefs.showTransliteration && selectedWord?.transliteration?.text && (
            <div className="text-[11px] text-[var(--muted-foreground)] font-medium mt-0.5">
              {selectedWord.transliteration.text}
            </div>
          )}
          {selectedWord ? (
            <button
              type="button"
              onClick={() => {
                const audio = getWordAudioUrl(selectedWord);
                if (audio) {
                  playWord(audio);
                } else {
                  playAudioSafely(undefined, selectedWord.text_uthmani || selectedWord.text);
                }
              }}
              className="mt-2 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-200 hover:text-white dark:hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30 shadow-xs"
            >
              <Volume2 className="h-3 w-3" /> {isUrdu ? "سنیں (لفظ)" : "Pronounce Word"}
            </button>
          ) : selectedAyahKey ? (
            <button
              type="button"
              onClick={() => {
                const [s] = selectedAyahKey.split(":");
                playVerse(Number(s) || 1, selectedAyahKey);
              }}
              className="mt-2 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-200 hover:text-white dark:hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30 shadow-xs"
            >
              <Volume2 className="h-3 w-3" /> {isUrdu ? "مکمل آیت سنیں" : "Recite Ayah"}
            </button>
          ) : null}
        </div>

        {/* Inspector Tabs */}
        <div className="flex items-center p-1 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] gap-1 text-[11px] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveInspectorTab("morphology")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeInspectorTab === "morphology"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>
              {isKids
                ? (isUrdu ? "لفظ کی کھوج 🔍" : "Word Detective 🔍")
                : isAdv
                ? (isUrdu ? "صرف ونحو" : "Morphology")
                : (isUrdu ? "صرف وگرامر" : "Grammar")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("translations")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeInspectorTab === "translations"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Languages className="h-3 w-3" />
            <span>
              {isKids
                ? (isUrdu ? "تمام معانی 💡" : "All Meanings 💡")
                : isAdv
                ? (isUrdu ? "معانی ومترادفات" : "Lexicon Senses")
                : (isUrdu ? "تمام معانی (معانی)" : "All Meanings")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("tafseer")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeInspectorTab === "tafseer"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <ScrollText className="h-3 w-3" />
            <span>
              {isKids
                ? (isUrdu ? "پیارا سبق 📖" : "Story & Lesson 📖")
                : (isUrdu ? "تفسیر" : "Tafseer")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("scholars")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeInspectorTab === "scholars"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>
              {isKids
                ? (isUrdu ? "اساتذہ 🎓" : "Wise Teachers 🎓")
                : (isUrdu ? "مترجمین" : "Scholars")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("notes")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeInspectorTab === "notes"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <StickyNote className="h-3 w-3" />
            <span>{isUrdu ? "نوٹس و تدبر" : "Notes"}</span>
          </button>
        </div>

        {/* Inspector Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* TAB 1: MORPHOLOGY & GRAMMAR */}
          {activeInspectorTab === "morphology" && (
            <div className="space-y-3">
              {/* Root summary card */}
              {effectiveRoot && (
                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                      {isKids
                        ? (isUrdu ? "حروف کی فیملی / جڑ 🌳" : "Word Family Letters 🌳")
                        : (isUrdu ? "۳ حروفی مادہ (Root):" : "3-Letter Arabic Root:")}
                    </span>
                    <span className="font-arabic text-xl font-bold text-emerald-700 dark:text-emerald-300" dir="rtl">
                      {effectiveRoot.split("").join(" - ")} ({effectiveRoot})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                      {isKids
                        ? (isUrdu ? "قرآن میں آیا ⭐" : "Appears in Quran ⭐")
                        : (isUrdu ? "قرآن میں تکرار:" : "Total Quran Count:")}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30">
                      {rootInfo?.count || "—"} {isUrdu ? "مرتبہ" : "times"}
                    </span>
                  </div>
                </div>
              )}

              {loadingMorph ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground)] font-medium animate-pulse">
                  {isUrdu ? "گرامر کے اجزاء کا تجزیہ ہو رہا ہے..." : "Parsing morphological segments..."}
                </div>
              ) : !morphology || morphology.segments.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground)] bg-[var(--surface-card)] rounded-xl font-medium">
                  {isUrdu
                    ? "کسی بھی قرآنی لفظ پر کلک کریں تاکہ اس کے گرامر کے حصے سامنے آئیں۔"
                    : "Click any word in the Quran text to inspect its grammatical segments."}
                </div>
              ) : (
                morphology.segments.map((seg, idx) => {
                  const adaptedPos = getPosLabel(normalizePosClass(seg.posClass), ageGroup, isUrdu);
                  const caseNormalized = normalizeCaseType(seg.grammarCase);
                  const adaptedCase = caseNormalized ? getCaseEndingExplanation(caseNormalized, ageGroup, isUrdu) : null;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30">
                          {isKids
                            ? `${isUrdu ? "ٹکڑا" : "Word Part"} ${idx + 1} • ${seg.isPrefix ? (isUrdu ? "شروع کا حصہ" : "Front Helper") : seg.isSuffix ? (isUrdu ? "آخر کا حصہ" : "End Helper") : (isUrdu ? "اصل لفظ" : "Core Word")}`
                            : `Segment ${idx + 1} • ${seg.isPrefix ? "Prefix" : seg.isSuffix ? "Suffix" : "Stem"}`}
                        </span>
                        <span className="font-arabic text-2xl text-emerald-700 dark:text-emerald-300 font-bold" dir="rtl">
                          {seg.arabic}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px] border-t border-[var(--border-subtle)]">
                        <div>
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                            {isKids ? (isUrdu ? "کس قسم کا لفظ ہے؟" : "What kind of word?") : (isUrdu ? "کلمہ کی قسم:" : "Part of Speech:")}
                          </span>
                          <span className="font-bold text-[var(--foreground)]">{adaptedPos.label}</span>
                          {adaptedPos.subLabel && (
                            <span className="text-[10px] text-[var(--muted-foreground)] block font-medium">{adaptedPos.subLabel}</span>
                          )}
                        </div>

                        {seg.grammarCase && (
                          <div>
                            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                              {isKids ? (isUrdu ? "حرکت کا راز (اعراب):" : "Vowel Magic (Case):") : (isUrdu ? "حالتِ اعراب:" : "Case (إعراب):")}
                            </span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {adaptedCase ? adaptedCase.label : seg.grammarCase}
                            </span>
                          </div>
                        )}

                        {seg.genderNumber && (
                          <div>
                            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                              {isUrdu ? "جنس وتعداد:" : "Gender/Number:"}
                            </span>
                            <span className="font-semibold text-[var(--foreground)]">{seg.genderNumber}</span>
                          </div>
                        )}

                        {seg.lemma && (
                          <div>
                            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block">
                              {isKids ? (isUrdu ? "اصل بنیادی لفظ:" : "Base Dictionary Word:") : (isUrdu ? "لغوی مادہ (Lemma):" : "Lemma:")}
                            </span>
                            <span className="font-arabic text-base text-[var(--foreground)] font-bold" dir="rtl">{seg.lemma}</span>
                          </div>
                        )}
                      </div>

                      {/* Kids Friendly Tip from Terminology Service */}
                      {isKids && adaptedPos.helpingTip && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]/50 text-[11px] text-amber-950 dark:text-amber-100 bg-amber-500/15 dark:bg-amber-950/50 border border-amber-500/30 dark:border-amber-700/40 p-2.5 rounded-lg leading-relaxed shadow-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-200">{isUrdu ? "نصیحت / ٹپ: " : "Detective Tip: "}</span>
                          {adaptedPos.helpingTip}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ALL POSSIBLE MEANINGS & LEXICON */}
          {activeInspectorTab === "translations" && (
            <div className="space-y-3">
              {/* 1. Contextual Verse Meaning */}
              <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span className="font-semibold uppercase tracking-wider">
                    {isKids ? (isUrdu ? "اس آیت میں مطلب" : "Meaning in this Ayah") : (isUrdu ? "سیاق وسباق کا مفہوم" : "Contextual Verse Translation")}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">1:1 Verse Context</span>
                </div>

                {/* Urdu Translation */}
                {selectedWord?.translation_urdu?.text && (
                  <div className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">اردو لفظی ترجمہ:</span>
                    <p className="font-urdu text-base text-[var(--urdu-color)] leading-relaxed">
                      {selectedWord.translation_urdu.text}
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {prefs.showTranslation && selectedWord?.translation?.text && (
                  <div className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-left">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">English Translation:</span>
                    <p className="text-xs text-[var(--translation-color)] font-medium">
                      {selectedWord.translation.text}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. All Possible Lexical Meanings & Senses */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[var(--surface-card)] to-teal-500/5 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isKids ? (isUrdu ? "اس لفظ کے تمام ممکنہ معانی" : "All Possible Meanings") : (isUrdu ? "تمام لغوی معانی ومفاہیم" : "All Possible Lexical Meanings")}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-500/30">
                    Lexicon Senses
                  </span>
                </div>

                {/* Meanings List (Urdu) */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[var(--foreground)] mb-1">
                    {isUrdu ? "اردو لغت کے مفاہیم:" : "Urdu Lexical Senses:"}
                  </div>
                  <div className="flex flex-wrap gap-1.5" dir="rtl">
                    {comprehensiveMeanings.allMeaningsUr.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11px] font-urdu text-[var(--urdu-color)] shadow-xs font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Meanings List (English) */}
                  {prefs.showTranslation && (
                    <>
                      <div className="text-[11px] font-semibold text-[var(--foreground)] mt-2 mb-1">
                        English Lexical Definitions:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {comprehensiveMeanings.allMeaningsEn.map((m, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11px] text-[var(--foreground)] shadow-xs font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Root Concept Explanation */}
                {comprehensiveMeanings.primaryRootConceptEn && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                      {isUrdu ? "بنیادی مادہ ومفہوم:" : "Primary Root Concept:"}
                    </span>
                    <p>{isUrdu && comprehensiveMeanings.primaryRootConceptUr ? comprehensiveMeanings.primaryRootConceptUr : comprehensiveMeanings.primaryRootConceptEn}</p>
                  </div>
                )}
              </div>

              {/* 3. Kids Detective Box (if young person) */}
              {isKids && comprehensiveMeanings.kidsDetective && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
                    <Sparkles className="h-4 w-4" />
                    <span>{isUrdu ? comprehensiveMeanings.kidsDetective.friendlyTitleUr : comprehensiveMeanings.kidsDetective.friendlyTitle}</span>
                  </div>
                  <p className="text-[var(--foreground)] leading-relaxed">
                    {isUrdu ? comprehensiveMeanings.kidsDetective.simpleMeaningUr : comprehensiveMeanings.kidsDetective.simpleMeaning}
                  </p>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-raised)] border border-amber-500/30 text-[11px] text-amber-950 dark:text-amber-100 font-medium">
                    <span className="font-bold block mb-0.5 text-amber-900 dark:text-amber-200">{isUrdu ? "ہماری روزمرہ زندگی میں:" : "In our daily life:"}</span>
                    {isUrdu ? comprehensiveMeanings.kidsDetective.whatItMeansDailyUr : comprehensiveMeanings.kidsDetective.whatItMeansDaily}
                  </div>
                  {comprehensiveMeanings.kidsDetective.funFact && (
                    <div className="text-[10px] text-[var(--muted-foreground)] italic font-medium">
                      ⭐ {isUrdu ? comprehensiveMeanings.kidsDetective.funFactUr : comprehensiveMeanings.kidsDetective.funFact}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Quranic Word Family / Derivatives */}
              {comprehensiveMeanings.derivativeFamily.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2 shadow-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
                    {isKids ? (isUrdu ? "اس لفظ کے خاندان کے دیگر قرآنی الفاظ 🌳" : "Related Family Words in Quran 🌳") : (isUrdu ? "قرآن میں اسی مادے سے مشتق الفاظ" : "Quranic Derivative Family")}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {comprehensiveMeanings.derivativeFamily.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-arabic text-base font-bold text-emerald-700 dark:text-emerald-300" dir="rtl">{item.arabic}</span>
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">({item.transliteration})</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-semibold">
                            {item.formOrType}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[var(--foreground)] text-right">
                          {isUrdu ? item.meaningUr : item.meaningEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Multilingual Translations Across 7 World Languages */}
              <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  {isUrdu ? "عالمی زبانوں میں تراجم (7 زبانیں)" : "Global Word Translations (7 Languages)"}
                </span>
                {loadingLangs ? (
                  <div className="p-4 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
                    Loading multilingual translations...
                  </div>
                ) : multilingual.length === 0 ? (
                  <div className="p-2 text-center text-xs text-[var(--muted-foreground)]">
                    Click any word in the Quran text to inspect all translations.
                  </div>
                ) : (
                  multilingual.map((item) => {
                    const isRTL = item.direction === "rtl";
                    const isCopied = copiedId === item.code;
                    return (
                      <div
                        key={item.code}
                        className="p-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 flex-1 pr-2">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                            {item.nativeName} ({item.languageName})
                          </span>
                          <div
                            dir={item.direction}
                            className={
                              isRTL
                                ? "font-urdu text-sm text-[var(--urdu-color)] text-right"
                                : "text-xs text-[var(--translation-color)] text-left"
                            }
                          >
                            {item.translation}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.translation, item.code)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                          title="Copy"
                        >
                          {isCopied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAFSEER COMMENTARY */}
          {activeInspectorTab === "tafseer" && (
            <div className="space-y-3">
              {/* Tafsir Selector Dropdown & Open in Modal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                    {isUrdu ? "منتخب تفسیر:" : "Active Tafseer:"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {/* Tafseer Font Size Steppers */}
                    <div className="flex items-center rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[10px] px-1 py-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setTafsirFontSize(Math.max(13, (prefs.tafsirFontSize || 18) - 1))}
                        className="px-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
                        title="Decrease Tafseer font size"
                      >
                        A-
                      </button>
                      <span className="px-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {prefs.tafsirFontSize || 18}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setTafsirFontSize(Math.min(34, (prefs.tafsirFontSize || 18) + 1))}
                        className="px-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
                        title="Increase Tafseer font size"
                      >
                        A+
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFullModalOpen(true)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--surface-card)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle)] text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      title={isUrdu ? "مکمل تفسیر الگ ونڈو میں دیکھیں" : "Open in full modal dialog"}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{isUrdu ? "مکمل تفسیر" : "Full Modal"}</span>
                    </button>
                  </div>
                </div>
                <select
                  value={prefs.selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--foreground)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {(isUrdu
                    ? AVAILABLE_TAFSIRS.filter((t) => t.language === "urdu")
                    : AVAILABLE_TAFSIRS
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {isUrdu ? `${t.name} - ${t.author}` : `[${t.language.toUpperCase()}] ${t.name} - ${t.author}`}
                    </option>
                  ))}
                </select>
              </div>

              {loadingTafsir ? (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
                  {isUrdu ? "مستند تفسیر لوڈ ہو رہی ہے..." : "Fetching authentic Tafseer text..."}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2 text-xs leading-relaxed">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5 text-[10px] text-[var(--muted-foreground)]">
                    <span>{isUrdu ? `مصنف: ${tafsirAuthor || "حافظ ابن کثیر"}` : `Author: ${tafsirAuthor || "Scholar"}`}</span>
                    <span>{isUrdu ? `آیت: ${selectedAyahKey}` : `Ayah ${selectedAyahKey}`}</span>
                  </div>
                  <div
                    className={`tafsir-rendered-content max-w-none text-[var(--foreground)] ${
                      isUrdu
                        ? "font-urdu leading-[2.3] text-right"
                        : "leading-relaxed text-left"
                    }`}
                    style={{ fontSize: `${prefs.tafsirFontSize || 18}px` }}
                    dir={isUrdu ? "rtl" : "ltr"}
                    dangerouslySetInnerHTML={{ __html: tafsirText }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHOLAR COMPARISON */}
          {activeInspectorTab === "scholars" && (
            <div className="space-y-2.5">
              {loadingScholars ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
                  Loading comparative translations for Ayah {selectedAyahKey}...
                </div>
              ) : scholarTranslations.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground)] bg-[var(--surface-card)] rounded-xl">
                  No comparative translations found.
                </div>
              ) : (
                scholarTranslations.map((item, idx) => {
                  const isUrdu = item.language === "urdu";
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.authorName}</span>
                        <span className="uppercase text-[var(--muted-foreground)] font-semibold">{item.language}</span>
                      </div>
                      <div
                        dir={isUrdu ? "rtl" : "ltr"}
                        className={
                          isUrdu
                            ? "font-urdu text-sm text-[var(--urdu-color)] text-right leading-relaxed"
                            : "text-xs text-[var(--translation-color)] text-left leading-relaxed"
                        }
                      >
                        {item.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 5: NOTES & REFLECTIONS */}
          {activeInspectorTab === "notes" && (() => {
            const currentAyahKey = selectedWord?.verse_key || selectedAyahKey || "1:1";
            const [chapStr, verseStr] = currentAyahKey.split(":");
            const chapterId = Number(chapStr) || 1;
            const verseNumber = Number(verseStr) || 1;
            const activeVerseNote = getVerseNote(currentAyahKey);
            const activeWordNote = selectedWord ? getWordNote(selectedWord.location) : undefined;

            return (
              <div className="space-y-3.5">
                {/* 1. Word Note Section (If word selected) */}
                {selectedWord ? (
                  <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                      <div className="flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-[var(--foreground)]">
                          {isUrdu ? "لفظ کا نوٹ" : "Word Note"}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                          {selectedWord.location}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoteModalTarget("word")}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {activeWordNote ? (isUrdu ? "تبدیل کریں" : "Edit") : (isUrdu ? "+ نیا نوٹ" : "+ Add Note")}
                      </button>
                    </div>

                    <div className="text-center py-1">
                      <span className="font-arabic text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {selectedWord.text_uthmani || selectedWord.text}
                      </span>
                    </div>

                    {activeWordNote ? (
                      <div className="space-y-1.5" dir={isUrdu ? "rtl" : "ltr"}>
                        <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed select-text bg-[var(--surface-sunken)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                          {activeWordNote.text}
                        </p>
                        {activeWordNote.tags && activeWordNote.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {activeWordNote.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-[var(--surface-sunken)] rounded-lg border border-[var(--border-subtle)]/60">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {isUrdu
                            ? "اس لفظ پر کوئی نوٹ نہیں ہے۔"
                            : "No personal note attached to this word."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setNoteModalTarget("word")}
                          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isUrdu ? "لفظ کا نوٹ شامل کریں" : "Add Word Note"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* 2. Verse Note Section */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <div className="flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {isUrdu ? "آیت کے نوٹس و تدبر" : "Ayah Reflection & Notes"}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        {currentAyahKey}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNoteModalTarget("verse")}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {activeVerseNote ? (isUrdu ? "تبدیل کریں" : "Edit") : (isUrdu ? "+ نیا نوٹ" : "+ Add Note")}
                    </button>
                  </div>

                  {activeVerseNote ? (
                    <div className="space-y-1.5" dir={isUrdu ? "rtl" : "ltr"}>
                      <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed select-text bg-[var(--surface-sunken)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                        {activeVerseNote.text}
                      </p>
                      {activeVerseNote.tags && activeVerseNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activeVerseNote.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-[var(--surface-sunken)] rounded-lg border border-[var(--border-subtle)]/60">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {isUrdu
                          ? "اس آیت مبارکہ پر ابھی کوئی تدبر یا ذاتی نوٹ نہیں ہے۔"
                          : "No personal reflection or note saved for this ayah."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setNoteModalTarget("verse")}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isUrdu ? "آیت کا نوٹ / تدبر شامل کریں" : "Add Ayah Note"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </aside>

      {/* Pop-out full Tafseer modal if requested from inspector */}
      {isFullModalOpen && (
        <TafsirModal
          isOpen={isFullModalOpen}
          onClose={() => setIsFullModalOpen(false)}
          verseKey={selectedAyahKey}
          arabicText={selectedAyahArabic}
        />
      )}

      {/* Note Editor Modal triggered from inspector */}
      {noteModalTarget && (
        <NoteEditorModal
          isOpen={!!noteModalTarget}
          onClose={() => setNoteModalTarget(null)}
          targetType={noteModalTarget}
          verseKey={selectedWord?.verse_key || selectedAyahKey || "1:1"}
          chapterId={Number((selectedWord?.verse_key || selectedAyahKey || "1:1").split(":")[0]) || 1}
          verseNumber={Number((selectedWord?.verse_key || selectedAyahKey || "1:1").split(":")[1]) || 1}
          wordLocation={noteModalTarget === "word" ? selectedWord?.location : undefined}
          wordText={noteModalTarget === "word" ? (selectedWord?.text_uthmani || selectedWord?.text) : undefined}
        />
      )}
    </>
  );
}
