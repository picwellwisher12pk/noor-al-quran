"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Word } from "@/types/quran";
import { getWordRoot, getRootByName, WordRootInfo } from "@/services/rootService";
import { getWordMorphology, WordMorphology } from "@/services/morphologyService";
import {
  getWordMultilingualTranslations,
  getAyahComparativeTranslations,
  WordTranslationItem,
  ScholarVerseTranslation,
} from "@/services/wordTranslationsService";
import { useAudio } from "@/context/AudioContext";
import {
  BookOpen,
  Volume2,
  Sparkles,
  Layers,
  Languages,
  ScrollText,
  Compass,
  CheckCircle2,
  Copy,
} from "lucide-react";

interface WordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  chapterName?: string;
}

type TabType = "translations" | "morphology" | "root" | "scholars";

export function WordDetailsModal({
  isOpen,
  onClose,
  word,
  chapterName,
}: WordDetailsModalProps) {
  const { playWord } = useAudio();
  const [activeTab, setActiveTab] = useState<TabType>("translations");

  // State for all data points
  const [rootInfo, setRootInfo] = useState<WordRootInfo | null>(null);
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [multilingual, setMultilingual] = useState<WordTranslationItem[]>([]);
  const [scholarTranslations, setScholarTranslations] = useState<ScholarVerseTranslation[]>([]);

  // Loading states
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [loadingMorphology, setLoadingMorphology] = useState(false);
  const [loadingRoot, setLoadingRoot] = useState(false);
  const [loadingScholars, setLoadingScholars] = useState(false);

  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !word) {
      setRootInfo(null);
      setMorphology(null);
      setMultilingual([]);
      setScholarTranslations([]);
      setActiveTab("translations");
      return;
    }

    const [chapStr, verseStr, posStr] = word.location.split(":");
    const chapterId = Number(chapStr) || 1;
    const verseNumber = Number(verseStr) || 1;
    const wordPosition = Number(posStr) || word.position || 1;
    const verseKey = word.verse_key || `${chapterId}:${verseNumber}`;

    // 1. Fetch Multilingual Word Translations
    setLoadingTranslations(true);
    getWordMultilingualTranslations(
      verseKey,
      wordPosition,
      word.translation_urdu?.text,
      word.translation?.text
    )
      .then((items) => setMultilingual(items))
      .catch((err) => console.error("Error loading multilingual translations:", err))
      .finally(() => setLoadingTranslations(false));

    // 2. Fetch Grammar & Morphology (Quranic Arabic Corpus)
    setLoadingMorphology(true);
    getWordMorphology(word.location)
      .then((morph) => {
        setMorphology(morph);
        // If morphology has a root, look up occurrences count
        if (morph?.root) {
          getRootByName(morph.root).then((info) => {
            if (info) setRootInfo(info);
          });
        }
      })
      .catch((err) => console.error("Error loading morphology:", err))
      .finally(() => setLoadingMorphology(false));

    // 3. Fetch Root Occurrences from Tanzil/Zekr index
    setLoadingRoot(true);
    getWordRoot(chapterId, verseNumber, wordPosition)
      .then((info) => {
        if (info) setRootInfo(info);
      })
      .catch((err) => console.error("Error loading root info:", err))
      .finally(() => setLoadingRoot(false));

    // 4. Fetch Comparative Scholar Translations for this Ayah
    setLoadingScholars(true);
    getAyahComparativeTranslations(verseKey)
      .then((items) => setScholarTranslations(items))
      .catch((err) => console.error("Error loading scholar translations:", err))
      .finally(() => setLoadingScholars(false));
  }, [isOpen, word]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(id);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  if (!word) return null;

  const effectiveRoot = morphology?.root || rootInfo?.root;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">Word Linguistic & Translation Analysis</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Arabic Word Hero Banner */}
        <div className="rounded-2xl p-5 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Reference breadcrumb */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[11px] text-[var(--muted-foreground,#8e9b94)] mb-3">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">
              {chapterName ? `${chapterName} • ` : ""}
              Ayah {word.verse_key} • Word {word.position}
            </span>
          </div>

          {/* Arabic Text Display */}
          <div className="font-arabic text-4xl sm:text-5xl text-[var(--foreground)] py-1 leading-relaxed tracking-wide" dir="rtl">
            {word.text_uthmani || word.text}
          </div>

          {/* Transliteration */}
          {word.transliteration?.text && (
            <div className="text-xs sm:text-sm text-emerald-400 font-medium tracking-wide mt-1">
              {word.transliteration.text}
            </div>
          )}

          {/* Audio Pronunciation Button */}
          {word.audio_url && (
            <button
              type="button"
              onClick={() => playWord(word.audio_url!)}
              className="mt-3.5 px-4 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <Volume2 className="h-4 w-4" /> Listen Authentic Pronunciation
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("translations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "translations"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>All Translations ({multilingual.length || "..."})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("morphology")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "morphology"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Morphology & Grammar (إعراب وصرف)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("root")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "root"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Root (جذر الكلمة)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scholars")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === "scholars"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span>Contextual Scholar Translations</span>
          </button>
        </div>

        {/* Tab 1: All Translations */}
        {activeTab === "translations" && (
          <div className="space-y-3">
            <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)] flex items-center justify-between">
              <span>Authentic word-by-word translations across 7 global languages:</span>
              <span className="text-emerald-400 font-semibold">{multilingual.length} Languages Loaded</span>
            </div>

            {loadingTranslations ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                Fetching multi-language word translations from Quran.com API...
              </div>
            ) : multilingual.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-raised,#141e1a)] rounded-xl">
                No extra word translations found for this token.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {multilingual.map((item) => {
                  const isRTL = item.direction === "rtl";
                  const isCopied = copiedLang === item.code;

                  return (
                    <div
                      key={item.code}
                      className={`p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:border-emerald-500/40 transition-all flex flex-col justify-between ${
                        item.code === "ur" || item.code === "en" ? "ring-1 ring-emerald-500/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground,#8e9b94)] mb-1">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span>{item.nativeName}</span>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)]">({item.languageName})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(item.translation, item.code)}
                          className="hover:text-[var(--foreground)] p-1 rounded"
                          title="Copy translation"
                        >
                          {isCopied ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-stone-400" />
                          )}
                        </button>
                      </div>

                      <div
                        dir={item.direction}
                        className={`text-sm font-medium ${
                          isRTL
                            ? "font-urdu text-base text-[var(--urdu-color,#e2e8f0)] text-right"
                            : "text-[var(--translation-color,#cbd5e1)] text-left"
                        }`}
                      >
                        {item.translation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Morphology & Grammar */}
        {activeTab === "morphology" && (
          <div className="space-y-3">
            <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">
              Detailed part-of-speech & grammatical analysis from the authentic <strong>Quranic Arabic Corpus</strong>:
            </div>

            {loadingMorphology ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                Analyzing word segments, prefixes, stems & suffixes...
              </div>
            ) : !morphology || morphology.segments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-raised,#141e1a)] rounded-xl">
                Linguistic segment breakdown not available for this particle.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {/* Segments breakdown */}
                {morphology.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                          Segment {idx + 1}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground,#8e9b94)]">
                          {seg.isPrefix ? "Prefix (سابقة)" : seg.isSuffix ? "Suffix (لاحقة)" : "Stem / Root (أصل الكلمة)"}
                        </span>
                      </div>

                      {/* Segment Arabic display */}
                      <span className="font-arabic text-2xl text-emerald-400" dir="rtl">
                        {seg.arabic}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle,#24362e)]">
                      <div>
                        <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Part of Speech:</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {seg.posArabic} • {seg.posEnglish}
                        </span>
                      </div>

                      {seg.grammarCase && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Grammatical Case (إعراب):</span>
                          <span className="font-medium text-emerald-300">
                            {seg.grammarCase}
                          </span>
                        </div>
                      )}

                      {seg.genderNumber && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Gender & Number:</span>
                          <span className="font-medium text-[var(--foreground)]">
                            {seg.genderNumber}
                          </span>
                        </div>
                      )}

                      {seg.lemma && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Lemma (الكلمة المعجمية):</span>
                          <span className="font-arabic text-sm text-[var(--foreground)]" dir="rtl">
                            {seg.lemma}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Root (جذر الكلمة) */}
        {activeTab === "root" && (
          <div className="space-y-4">
            {loadingRoot ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                Locating root occurrences across Quranic corpus...
              </div>
            ) : effectiveRoot ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-center space-y-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)]">
                    3-Letter Arabic Trilateral Root (الجذر الثلاثي)
                  </span>
                  <div className="font-arabic text-4xl font-bold text-emerald-400 py-1" dir="rtl">
                    {effectiveRoot.split("").join(" - ")} ({effectiveRoot})
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-semibold">
                    <span>Total Quran Occurrences:</span>
                    <span className="font-mono text-sm">{rootInfo?.count || "—"} times</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--muted-foreground,#8e9b94)] space-y-1.5 leading-relaxed">
                  <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Linguistic Significance of Arabic Roots:</span>
                  </div>
                  <p>
                    In Classical Arabic lexicography, trilateral roots serve as the semantic foundation for a wide family of interconnected meanings. All derived nouns, active participles, and verb forms branching from this root share this core semantic foundation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-raised,#141e1a)] rounded-xl space-y-1">
                <p className="font-semibold text-[var(--foreground)]">Particle / Proper Noun (مبني / علم)</p>
                <p>This token is an uninflected grammatical particle (حرف) or proper noun without a trilateral derived root.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Scholar Translations in Context */}
        {activeTab === "scholars" && (
          <div className="space-y-3">
            <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)]">
              How major classical and contemporary scholars translated the Ayah ({word.verse_key}) containing this word:
            </div>

            {loadingScholars ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                Fetching comparative scholar translations...
              </div>
            ) : scholarTranslations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-raised,#141e1a)] rounded-xl">
                No comparative scholar translations found for this verse.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {scholarTranslations.map((item, idx) => {
                  const isUrdu = item.language === "urdu";
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-400">{item.authorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-raised,#141e1a)] text-[var(--muted-foreground,#8e9b94)] uppercase">
                          {item.language}
                        </span>
                      </div>
                      <div
                        dir={isUrdu ? "rtl" : "ltr"}
                        className={
                          isUrdu
                            ? "font-urdu text-base text-[var(--urdu-color,#e2e8f0)] leading-relaxed text-right"
                            : "text-xs text-[var(--translation-color,#cbd5e1)] leading-relaxed text-left"
                        }
                      >
                        {item.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
