"use client";

import React, { useEffect, useState } from "react";
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
import { TafsirModal } from "@/components/modals/TafsirModal";
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
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";

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

  const { prefs, setSelectedTafsirId } = useReadingPreferences();
  const { playWord } = useAudio();

  // Inspector Data States
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [rootInfo, setRootInfo] = useState<WordRootInfo | null>(null);
  const [multilingual, setMultilingual] = useState<WordTranslationItem[]>([]);
  const [scholarTranslations, setScholarTranslations] = useState<ScholarVerseTranslation[]>([]);
  const [tafsirText, setTafsirText] = useState<string>("");
  const [tafsirAuthor, setTafsirAuthor] = useState<string>("");
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

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
        if (data) {
          setTafsirText(data.text);
          setTafsirAuthor(data.author);
        } else {
          setTafsirText("Tafseer commentary is currently unavailable for this Ayah.");
          setTafsirAuthor("");
        }
      })
      .catch((err) => {
        console.error("Error loading tafsir:", err);
        setTafsirText("Unable to load Tafseer commentary at this time.");
      })
      .finally(() => setLoadingTafsir(false));
  }, [isRightInspectorOpen, selectedAyahKey, prefs.selectedTafsirId]);

  if (!isRightInspectorOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const effectiveRoot = morphology?.root || rootInfo?.root;

  const widthClass = {
    default: "w-96",
    expanded: "w-[560px]",
    maximized: "w-[780px]",
  }[inspectorWidth] || "w-96";

  return (
    <>
      <aside
        className={`${widthClass} h-full flex-none flex flex-col bg-[var(--surface-raised,#141e1a)] border-l border-[var(--border-subtle,#1e2c26)] select-none z-30 transition-all duration-200 overflow-hidden shadow-2xl`}
      >
        {/* Inspector Header */}
        <div className="p-3 border-b border-[var(--border-subtle,#1e2c26)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Linguistic & Tafseer Inspector
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Expand / Collapse Width Button */}
            <button
              type="button"
              onClick={toggleExpandInspector}
              className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
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
              className="p-1 rounded-md text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)] transition-colors"
              title="Close Inspector (Ctrl+\)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Token Hero Banner */}
        <div className="p-3.5 bg-[var(--surface-sunken,#0e1512)] border-b border-[var(--border-subtle,#1e2c26)] text-center relative overflow-hidden">
          <div className="text-[10px] text-[var(--muted-foreground,#8e9b94)] mb-1">
            {selectedWord ? `Ayah ${selectedWord.verse_key} • Word ${selectedWord.position}` : `Ayah ${selectedAyahKey}`}
          </div>
          <div className="font-arabic text-3xl text-emerald-400 py-0.5 leading-relaxed" dir="rtl">
            {selectedWord?.text_uthmani || selectedWord?.text || selectedAyahArabic || "ٱلْقُرْءَان"}
          </div>
          {selectedWord?.transliteration?.text && (
            <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)] mt-0.5">
              {selectedWord.transliteration.text}
            </div>
          )}
          {selectedWord?.audio_url && (
            <button
              type="button"
              onClick={() => playWord(selectedWord.audio_url!)}
              className="mt-2 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="h-3 w-3" /> Listen
            </button>
          )}
        </div>

        {/* Inspector Tabs */}
        <div className="flex items-center p-1 bg-[var(--surface-card,#182520)] border-b border-[var(--border-subtle,#1e2c26)] gap-1 text-[11px] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveInspectorTab("morphology")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeInspectorTab === "morphology"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <BookOpen className="h-3 w-3" /> Grammar
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("translations")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeInspectorTab === "translations"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <Languages className="h-3 w-3" /> Word (7)
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("tafseer")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeInspectorTab === "tafseer"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <ScrollText className="h-3 w-3" /> Tafseer
          </button>

          <button
            type="button"
            onClick={() => setActiveInspectorTab("scholars")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              activeInspectorTab === "scholars"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            <Layers className="h-3 w-3" /> Scholars
          </button>
        </div>

        {/* Inspector Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* TAB 1: MORPHOLOGY & GRAMMAR */}
          {activeInspectorTab === "morphology" && (
            <div className="space-y-3">
              {/* Root summary card */}
              {effectiveRoot && (
                <div className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">3-Letter Arabic Root:</span>
                    <span className="font-arabic text-lg font-bold text-emerald-400" dir="rtl">
                      {effectiveRoot.split("").join(" - ")} ({effectiveRoot})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Total Quran Count:</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {rootInfo?.count || "—"} times
                    </span>
                  </div>
                </div>
              )}

              {loadingMorph ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                  Parsing morphological segments...
                </div>
              ) : !morphology || morphology.segments.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-card,#182520)] rounded-xl">
                  Click any word in the Quran text to inspect its grammatical segments.
                </div>
              ) : (
                morphology.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                        Segment {idx + 1} • {seg.isPrefix ? "Prefix" : seg.isSuffix ? "Suffix" : "Stem"}
                      </span>
                      <span className="font-arabic text-xl text-emerald-400" dir="rtl">
                        {seg.arabic}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] border-t border-[var(--border-subtle,#24362e)]">
                      <div>
                        <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Part of Speech:</span>
                        <span className="font-medium text-[var(--foreground)]">{seg.posArabic} • {seg.posEnglish}</span>
                      </div>
                      {seg.grammarCase && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Case (إعراب):</span>
                          <span className="font-medium text-emerald-300">{seg.grammarCase}</span>
                        </div>
                      )}
                      {seg.genderNumber && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Gender/Number:</span>
                          <span className="font-medium text-[var(--foreground)]">{seg.genderNumber}</span>
                        </div>
                      )}
                      {seg.lemma && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Lemma:</span>
                          <span className="font-arabic text-sm text-[var(--foreground)]" dir="rtl">{seg.lemma}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: WORD MULTILINGUAL TRANSLATIONS */}
          {activeInspectorTab === "translations" && (
            <div className="space-y-2">
              {loadingLangs ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                  Loading 7-language word translations...
                </div>
              ) : multilingual.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-card,#182520)] rounded-xl">
                  Click any word in the Quran text to inspect all translations.
                </div>
              ) : (
                multilingual.map((item) => {
                  const isRTL = item.direction === "rtl";
                  const isCopied = copiedId === item.code;
                  return (
                    <div
                      key={item.code}
                      className="p-2.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:border-emerald-500/40 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 flex-1 pr-2">
                        <span className="text-[10px] font-semibold text-emerald-400 block">
                          {item.nativeName} ({item.languageName})
                        </span>
                        <div
                          dir={item.direction}
                          className={
                            isRTL
                              ? "font-urdu text-sm text-[var(--urdu-color,#e2e8f0)] text-right"
                              : "text-xs text-[var(--translation-color,#cbd5e1)] text-left"
                          }
                        >
                          {item.translation}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.translation, item.code)}
                        className="p-1 rounded text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
                        title="Copy"
                      >
                        {isCopied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: TAFSEER COMMENTARY */}
          {activeInspectorTab === "tafseer" && (
            <div className="space-y-3">
              {/* Tafsir Selector Dropdown & Open in Modal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-[var(--muted-foreground,#8e9b94)] uppercase">
                    Active Tafseer:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFullModalOpen(true)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--surface-card,#182520)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle,#24362e)] text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
                    title="Open in full modal dialog"
                  >
                    <ExternalLink className="h-3 w-3" /> Full Modal
                  </button>
                </div>
                <select
                  value={prefs.selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs text-[var(--foreground)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {AVAILABLE_TAFSIRS.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.language.toUpperCase()}] {t.name} - {t.author}
                    </option>
                  ))}
                </select>
              </div>

              {loadingTafsir ? (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                  Fetching authentic Tafseer text...
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-2 text-xs leading-relaxed">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle,#24362e)] pb-1.5 text-[10px] text-[var(--muted-foreground,#8e9b94)]">
                    <span>Author: {tafsirAuthor || "Scholar"}</span>
                    <span>Ayah {selectedAyahKey}</span>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-[var(--foreground)]"
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
                <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                  Loading comparative translations for Ayah {selectedAyahKey}...
                </div>
              ) : scholarTranslations.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground,#8e9b94)] bg-[var(--surface-card,#182520)] rounded-xl">
                  No comparative translations found.
                </div>
              ) : (
                scholarTranslations.map((item, idx) => {
                  const isUrdu = item.language === "urdu";
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-emerald-400">{item.authorName}</span>
                        <span className="uppercase text-[var(--muted-foreground,#8e9b94)]">{item.language}</span>
                      </div>
                      <div
                        dir={isUrdu ? "rtl" : "ltr"}
                        className={
                          isUrdu
                            ? "font-urdu text-sm text-[var(--urdu-color,#e2e8f0)] text-right leading-relaxed"
                            : "text-xs text-[var(--translation-color,#cbd5e1)] text-left leading-relaxed"
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
    </>
  );
}
