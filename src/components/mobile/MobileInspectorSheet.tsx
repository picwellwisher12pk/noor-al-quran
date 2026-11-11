"use client";

import React, { useEffect, useState } from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useAudio } from "@/context/AudioContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
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
import { useLanguage } from "@/context/LanguageContext";
import { useNotes } from "@/context/NotesContext";
import NoteEditorModal from "@/components/modals/NoteEditorModal";
import {
  X,
  Sparkles,
  BookOpen,
  Languages,
  ScrollText,
  Volume2,
  Copy,
  CheckCircle2,
  StickyNote,
  Plus,
} from "lucide-react";

export function MobileInspectorSheet() {
  const {
    isMobileInspectorOpen,
    activeInspectorTab,
    setActiveInspectorTab,
    selectedWord,
    selectedAyahKey,
    selectedAyahArabic,
    closeInspector,
  } = useDesktopWorkspace();

  const { prefs, setSelectedTafsirId, setTafsirFontSize } = useReadingPreferences();
  const { playWord, playVerse } = useAudio();
  const { isUrdu } = useLanguage();
  const { getVerseNote, getWordNote } = useNotes();

  // Data states
  const [morphology, setMorphology] = useState<WordMorphology | null>(null);
  const [rootInfo, setRootInfo] = useState<WordRootInfo | null>(null);
  const [multilingual, setMultilingual] = useState<WordTranslationItem[]>([]);
  const [scholarTranslations, setScholarTranslations] = useState<ScholarVerseTranslation[]>([]);
  const [tafsirText, setTafsirText] = useState<string>("");
  const [tafsirAuthor, setTafsirAuthor] = useState<string>("");
  const [noteModalTarget, setNoteModalTarget] = useState<"verse" | "word" | null>(null);

  // Loading states
  const [loadingMorph, setLoadingMorph] = useState(false);
  const [loadingLangs, setLoadingLangs] = useState(false);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [loadingScholars, setLoadingScholars] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);

  // Fetch word-level details
  useEffect(() => {
    if (!isMobileInspectorOpen || !selectedWord) return;

    const parts = selectedWord.location.split(":");
    const chapterId = Number(parts[0]);
    const verseNumber = Number(parts[1]);
    const wordPosition = Number(parts[2]);
    const verseKey = `${chapterId}:${verseNumber}`;

    setLoadingMorph(true);
    setLoadingLangs(true);
    setMorphology(null);
    setRootInfo(null);

    // Multilingual translations
    getWordMultilingualTranslations(
      verseKey,
      wordPosition,
      selectedWord.translation_urdu?.text,
      selectedWord.translation?.text
    )
      .then((items) => setMultilingual(items))
      .catch(console.error)
      .finally(() => setLoadingLangs(false));

    // Morphology
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

    // Root occurrences
    getWordRoot(chapterId, verseNumber, wordPosition)
      .then((info) => {
        if (info) setRootInfo(info);
      })
      .catch(console.error);
  }, [isMobileInspectorOpen, selectedWord]);

  // Fetch Ayah-level details (Tafseer & Comparative Translations)
  useEffect(() => {
    if (!isMobileInspectorOpen || !selectedAyahKey) return;

    setLoadingScholars(true);
    getAyahComparativeTranslations(selectedAyahKey)
      .then((items) => setScholarTranslations(items))
      .catch(console.error)
      .finally(() => setLoadingScholars(false));

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
      .catch(() => {
        setTafsirText(isUrdu ? "تفسیر لوڈ کرنے میں مسئلہ پیش آیا۔" : "Unable to load Tafseer commentary. Please check your internet connection.");
        setTafsirAuthor("");
      })
      .finally(() => setLoadingTafsir(false));
  }, [isMobileInspectorOpen, selectedAyahKey, prefs.selectedTafsirId, isUrdu]);

  if (!isMobileInspectorOpen) return null;

  const handleCopyRoot = (root: string) => {
    navigator.clipboard?.writeText(root);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 1500);
  };

  const effectiveRoot = morphology?.root || rootInfo?.root;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={closeInspector}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[85vh] h-[85vh] bg-[var(--modal-bg)] rounded-t-3xl border-t border-[var(--card-border)] shadow-2xl flex flex-col overflow-hidden z-10 transition-transform pb-[env(safe-area-inset-bottom,0px)]">
        {/* Drag Handle */}
        <div className="pt-3 pb-1 flex items-center justify-center">
          <div className="h-1.5 w-12 rounded-full bg-[var(--border-subtle)]" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-sm text-[var(--foreground)]">
              {selectedWord
                ? `Word ${selectedWord.location}`
                : `Ayah ${selectedAyahKey} Inspector`}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeInspector}
            aria-label="Close inspector"
            className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Word or Ayah Banner */}
        <div className="px-4 py-3 bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {selectedWord ? (
              <div>
                <span className="font-arabic text-2xl text-[var(--foreground)] font-bold block" dir="rtl">
                  {selectedWord.text_uthmani || selectedWord.text}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                  {selectedWord.translation_urdu?.text || ""}
                  {prefs.showTranslation && selectedWord.translation?.text ? ` • ${selectedWord.translation.text}` : ""}
                </span>
              </div>
            ) : (
              <div>
                <span className="font-arabic text-lg text-[var(--foreground)] line-clamp-2" dir="rtl">
                  {selectedAyahArabic}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Ayah {selectedAyahKey}
                </span>
              </div>
            )}
          </div>

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
              aria-label="Play pronunciation"
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          ) : selectedAyahKey ? (
            <button
              type="button"
              onClick={() => {
                const [s] = selectedAyahKey.split(":");
                playVerse(Number(s) || 1, selectedAyahKey);
              }}
              aria-label="Play ayah recitation"
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-5 p-1 mx-2.5 mt-2 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveInspectorTab("morphology")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeInspectorTab === "morphology"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Grammar
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("translations")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeInspectorTab === "translations"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Meanings
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("tafseer")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeInspectorTab === "tafseer"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Tafseer
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("scholars")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeInspectorTab === "scholars"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Scholars
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("notes")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeInspectorTab === "notes"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Notes
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeInspectorTab === "morphology" && (
            <div className="space-y-3">
              {effectiveRoot && (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--muted-foreground)] block">Root Letters:</span>
                    <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                      {effectiveRoot.split("").join(" - ")} ({effectiveRoot})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rootInfo && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {rootInfo.count} times
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyRoot(effectiveRoot)}
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      title="Copy root letters"
                    >
                      {copiedRoot ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {loadingMorph ? (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)] animate-pulse">
                  Parsing morphological segments...
                </div>
              ) : !morphology || morphology.segments.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
                  Morphological analysis is available when tapping a word in Word-by-Word reading mode.
                </div>
              ) : (
                morphology.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Segment {idx + 1} • {seg.isPrefix ? "Prefix" : seg.isSuffix ? "Suffix" : "Stem"}
                      </span>
                      <span className="font-arabic text-xl text-emerald-600 dark:text-emerald-400 font-bold" dir="rtl">
                        {seg.arabic}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                      <div>
                        <span className="text-[10px] text-[var(--muted-foreground)] block">Part of Speech:</span>
                        <span className="font-semibold text-[var(--foreground)]">{seg.posArabic} • {seg.posEnglish}</span>
                      </div>
                      {seg.grammarCase && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground)] block">Case (إعراب):</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{seg.grammarCase}</span>
                        </div>
                      )}
                      {seg.genderNumber && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground)] block">Gender/Number:</span>
                          <span className="font-semibold text-[var(--foreground)]">{seg.genderNumber}</span>
                        </div>
                      )}
                      {seg.lemma && (
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground)] block">Lemma:</span>
                          <span className="font-arabic text-sm text-[var(--foreground)]" dir="rtl">{seg.lemma}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeInspectorTab === "translations" && (
            <div className="space-y-2">
              {loadingLangs ? (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)] animate-pulse">
                  Loading multilingual definitions...
                </div>
              ) : multilingual.length > 0 ? (
                multilingual.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                        {item.languageName} ({item.nativeName})
                      </span>
                      <p
                        className={`text-xs text-[var(--foreground)] mt-0.5 ${item.code === "ur" ? "font-urdu text-sm" : ""}`}
                        dir={item.direction}
                      >
                        {item.translation || "—"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
                  Select a word to view definitions across languages.
                </div>
              )}
            </div>
          )}

          {activeInspectorTab === "tafseer" && (
            <div className="space-y-3">
              {/* Tafseer Selector & Font Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                    {isUrdu ? "منتخب تفسیر" : "Select Commentary Source"}
                  </label>
                  {/* Tafseer Font Size Steppers */}
                  <div className="flex items-center rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[10px] px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => setTafsirFontSize(Math.max(13, (prefs.tafsirFontSize || 18) - 1))}
                      className="px-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
                    >
                      A-
                    </button>
                    <span className="px-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {prefs.tafsirFontSize || 18}px
                    </span>
                    <button
                      type="button"
                      onClick={() => setTafsirFontSize(Math.min(34, (prefs.tafsirFontSize || 18) + 1))}
                      className="px-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
                    >
                      A+
                    </button>
                  </div>
                </div>
                <select
                  value={prefs.selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                >
                  {(isUrdu
                    ? AVAILABLE_TAFSIRS.filter((t) => t.language === "urdu")
                    : AVAILABLE_TAFSIRS
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {isUrdu ? `${t.name} - ${t.author}` : `${t.name} (${t.language.toUpperCase()})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tafseer Text */}
              {loadingTafsir ? (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)] animate-pulse">
                  {isUrdu ? "مستند تفسیر لوڈ ہو رہی ہے..." : "Loading authentic commentary..."}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
                  {tafsirAuthor && (
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {isUrdu ? `مصنف: ${tafsirAuthor}` : `Author: ${tafsirAuthor}`}
                    </div>
                  )}
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

          {activeInspectorTab === "scholars" && (
            <div className="space-y-2.5">
              {loadingScholars ? (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)] animate-pulse">
                  Loading comparative translations...
                </div>
              ) : scholarTranslations.length > 0 ? (
                scholarTranslations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.authorName}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] uppercase">
                        {item.language}
                      </span>
                    </div>
                    <p
                      className={`text-xs text-[var(--foreground)] leading-relaxed ${item.language === "urdu" ? "font-urdu text-sm" : ""}`}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
                  Comparative scholar translations unavailable for this verse.
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Notes & Reflections */}
          {activeInspectorTab === "notes" && (() => {
            const currentAyahKey = selectedWord?.verse_key || selectedAyahKey || "1:1";
            const [chapStr, verseStr] = currentAyahKey.split(":");
            const chapterId = Number(chapStr) || 1;
            const verseNumber = Number(verseStr) || 1;
            const activeVerseNote = getVerseNote(currentAyahKey);
            const activeWordNote = selectedWord ? getWordNote(selectedWord.location) : undefined;

            return (
              <div className="space-y-3.5">
                {/* 1. Word Note Section */}
                {selectedWord ? (
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
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
                        <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed select-text bg-[var(--surface-sunken)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
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
                      <div className="text-center py-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)]/60">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {isUrdu
                            ? "اس لفظ پر کوئی نوٹ نہیں ہے۔"
                            : "No personal note attached to this word."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setNoteModalTarget("word")}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isUrdu ? "لفظ کا نوٹ شامل کریں" : "Add Word Note"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* 2. Verse Note Section */}
                <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2">
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
                      <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed select-text bg-[var(--surface-sunken)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
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
                    <div className="text-center py-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)]/60">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {isUrdu
                          ? "اس آیت مبارکہ پر ابھی کوئی تدبر یا ذاتی نوٹ نہیں ہے۔"
                          : "No personal reflection or note saved for this ayah."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setNoteModalTarget("verse")}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
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
      </div>

      {/* Note Editor Modal for Mobile */}
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
    </div>
  );
}
