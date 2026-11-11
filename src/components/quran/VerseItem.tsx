"use client";

import React, { useRef, useEffect, useState } from "react";
import { Verse } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { useNotes } from "@/context/NotesContext";
import { useLanguage } from "@/context/LanguageContext";
import { getAbsoluteVerseIndex } from "@/utils/quranMeta";
import { WordByWord } from "./WordByWord";
import NoteEditorModal from "@/components/modals/NoteEditorModal";
import {
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  BookOpen,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  StickyNote,
} from "lucide-react";

interface VerseItemProps {
  verse: Verse;
  chapterName: string;
  allVersesInSurah: Verse[];
  onOpenTafsir: (verseKey: string, arabicText: string) => void;
  readingMode?: "continuous" | "compact" | "mushaf";
}

export function VerseItem({
  verse,
  chapterName,
  allVersesInSurah,
  onOpenTafsir,
  readingMode = "continuous",
}: VerseItemProps) {
  const { currentVerseKey, isPlaying, playVerse, togglePlayPause } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark, setLastReadPosition } = useBookmarks();
  const { prefs } = useReadingPreferences();
  const { plan, recordReadingProgress } = useKhatmah();
  const { logVerseRead } = useReadingActivity();
  const { getVerseNote } = useNotes();
  const { isUrdu } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);
  const hasLoggedPlaybackRef = useRef(false);

  const verseNote = getVerseNote(verse.verse_key);
  const isCurrentPlaying = currentVerseKey === verse.verse_key;
  const bookmarked = isBookmarked(verse.verse_key);
  const isCompact = readingMode === "compact";

  const currentAyahAbsIndex = getAbsoluteVerseIndex(verse.chapter_id, verse.verse_number);
  const isReadInKhatmah = plan ? currentAyahAbsIndex <= plan.completedAyahsCount : false;

  // Font class mapping
  const arabicFontClass = {
    amiri: "font-arabic-amiri",
    "amiri-quran": "font-arabic-amiri-quran",
    "noto-naskh-arabic": "font-arabic-noto-naskh",
    scheherazade: "font-arabic-scheherazade",
    lateef: "font-arabic-lateef",
    "noto-sans-arabic": "font-arabic-noto",
    cairo: "font-arabic-cairo",
    nastaliq: "font-arabic-nastaliq",
  }[prefs.arabicFont] || "font-arabic-amiri";

  const urduFontClass = {
    nastaliq: "font-urdu-nastaliq",
    "noto-sans-arabic": "font-urdu-noto",
    scheherazade: "font-urdu-scheherazade",
    amiri: "font-urdu-amiri",
  }[prefs.urduFont || "nastaliq"] || "font-urdu-nastaliq";

  // Distinguish English and Urdu translations
  const urduTranslation = verse.translations?.find(
    (t) =>
      t.resource_id === prefs.selectedUrduTranslationId ||
      [234, 97, 54, 158, 151].includes(t.resource_id) ||
      /[\u0600-\u06FF]/.test(t.text)
  );

  const englishTranslation = verse.translations?.find(
    (t) => t !== urduTranslation && /[a-zA-Z]/.test(t.text)
  );

  // Reset logged playback guard when this verse stops playing
  useEffect(() => {
    if (!isCurrentPlaying) {
      hasLoggedPlaybackRef.current = false;
    }
  }, [isCurrentPlaying]);

  // Auto-scroll when this verse starts playing
  useEffect(() => {
    if (isCurrentPlaying && prefs.autoScroll && verseRef.current) {
      verseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setLastReadPosition({
        chapterId: verse.chapter_id,
        chapterName,
        verseNumber: verse.verse_number,
        verseKey: verse.verse_key,
      });

      // Guard to ensure reading progress is logged only once per playback activation
      if (!hasLoggedPlaybackRef.current) {
        hasLoggedPlaybackRef.current = true;
        logVerseRead(verse.chapter_id, verse.verse_number);
        if (plan) {
          recordReadingProgress(verse.chapter_id, verse.verse_number);
        }
      }
    }
  }, [isCurrentPlaying, prefs.autoScroll, verse.chapter_id, verse.verse_number, verse.verse_key, chapterName, setLastReadPosition, plan, recordReadingProgress, logVerseRead]);

  const handlePlayToggle = () => {
    if (isCurrentPlaying) {
      togglePlayPause();
    } else {
      playVerse(verse.chapter_id, verse.verse_key, allVersesInSurah);
    }
  };

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark({
        verse_key: verse.verse_key,
        chapter_id: verse.chapter_id,
        verse_number: verse.verse_number,
        chapter_name: chapterName,
        text_uthmani: verse.text_uthmani,
        translation_text: englishTranslation?.text || urduTranslation?.text,
      });
    }
  };

  const handleCopy = () => {
    const textToCopy = [
      verse.text_uthmani,
      urduTranslation ? `Urdu: ${urduTranslation.text.replace(/<[^>]+>/g, "")}` : "",
      englishTranslation ? `English: ${englishTranslation.text.replace(/<[^>]+>/g, "")}` : "",
      `[Surah ${chapterName} ${verse.verse_key}]`,
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Surah ${chapterName} - Ayah ${verse.verse_key}`,
      text: `${verse.text_uthmani}\n\n${englishTranslation?.text || ""}\n[Surah ${chapterName} ${verse.verse_key}]`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const activeArabicFontSize = isCompact
    ? Math.max(20, prefs.arabicFontSize - 4)
    : prefs.arabicFontSize;

  const activeUrduFontSize = isCompact
    ? Math.max(14, prefs.urduFontSize - 2)
    : prefs.urduFontSize;

  const activeEnglishFontSize = isCompact
    ? Math.max(12, prefs.englishFontSize - 2)
    : prefs.englishFontSize;

  return (
    <div
      ref={verseRef}
      id={`ayah-${verse.verse_number}`}
      className={`relative transition-all duration-200 border ${
        isCompact
          ? "rounded-xl p-2.5 sm:p-3"
          : "rounded-2xl p-4 sm:p-5 shadow-sm"
      } ${
        isCurrentPlaying
          ? "bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/40"
          : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/25"
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between gap-1.5 flex-wrap border-b border-[var(--border-subtle)] ${
          isCompact ? "pb-1 mb-1.5" : "pb-2 mb-2.5"
        }`}
      >
        {/* Verse Badge */}
        <div className="flex items-center gap-1.5 flex-none">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
            {verse.verse_key}
          </span>
          {verse.juz_number && (
            <span className="hidden sm:inline-block text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] font-medium">
              Juz {verse.juz_number}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Play Verse */}
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isCurrentPlaying && isPlaying ? "Pause verse" : "Play verse audio"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              isCurrentPlaying && isPlaying
                ? "bg-emerald-600 text-white"
                : "text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)]"
            }`}
            title="Play Audio"
          >
            {isCurrentPlaying && isPlaying ? <Pause className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Play className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark verse"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              bookmarked
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/30"
                : "text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)]"
            }`}
            title="Bookmark Ayah"
          >
            <BookmarkIcon className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${bookmarked ? "fill-emerald-600 dark:fill-emerald-400" : ""}`} />
          </button>

          {/* Note / Tadabbur Button */}
          <button
            type="button"
            onClick={() => setIsNoteModalOpen(true)}
            aria-label={verseNote ? "View or edit personal note" : "Add personal note"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              verseNote
                ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/50 border border-amber-500/30"
                : "text-[var(--muted-foreground)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--hover-bg)]"
            }`}
            title={verseNote ? (isUrdu ? "نوٹ دیکھیں یا تبدیل کریں" : "View or edit note") : (isUrdu ? "نوٹ یا تدبر لکھیں" : "Add reflection note")}
          >
            <StickyNote className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${verseNote ? "fill-amber-500/30" : ""}`} />
          </button>

          {/* Khatmah Progress Toggle */}
          {plan && (
            <button
              type="button"
              onClick={() => {
                logVerseRead(verse.chapter_id, verse.verse_number);
                recordReadingProgress(verse.chapter_id, verse.verse_number);
              }}
              title={isReadInKhatmah ? "Completed in your Khatmah plan" : "Mark as read in Khatmah"}
              className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                isReadInKhatmah
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/30"
                  : "text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)]"
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isReadInKhatmah ? "fill-emerald-500/20" : ""}`} />
            </button>
          )}

          {/* Tafsir Dedicated Button (Opens Modal Directly) */}
          <button
            type="button"
            onClick={() => onOpenTafsir(verse.verse_key, verse.text_uthmani)}
            title="Read Commentary (تفسیر / Tafseer)"
            className="px-2.5 py-1 sm:py-0.5 rounded-lg text-emerald-800 dark:text-emerald-200 bg-emerald-500/15 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-500/30 dark:border-emerald-700/50 transition-all flex items-center gap-1.5 text-[11px] font-semibold shadow-xs cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-emerald-700 dark:text-emerald-300" />
            <span>تفسیر / Tafseer</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy verse"}
            className="p-2 sm:p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            title="Share verse"
            className="p-2 sm:p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </div>

      {/* Arabic Script Display */}
      <div className="py-1 text-right" dir="rtl">
        {prefs.showWordByWord && verse.words && verse.words.length > 0 ? (
          <WordByWord
            words={verse.words}
            arabicFontSize={activeArabicFontSize}
            arabicFontClass={arabicFontClass}
            chapterName={chapterName}
          />
        ) : (
          <p
            className={`${arabicFontClass} text-[var(--foreground)] ${
              isCompact ? "leading-[1.7]" : "leading-[2.0]"
            } select-text`}
            style={{ fontSize: `${activeArabicFontSize}px` }}
          >
            {verse.text_uthmani}
            <span className="inline-flex items-center justify-center text-emerald-500 font-arabic text-lg px-2 select-none">
              ۝
            </span>
          </p>
        )}
      </div>

      {/* Urdu Translation */}
      {prefs.showUrduTranslation && urduTranslation && (
        <div
          className={`${
            isCompact ? "mt-1.5 pt-1.5" : "mt-2 pt-2"
          } border-t border-[var(--border-subtle)] text-right`}
          dir="rtl"
        >
          <p
            className={`${urduFontClass} text-[var(--urdu-color)] leading-relaxed select-text`}
            style={{ fontSize: `${activeUrduFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: urduTranslation.text }}
          />
        </div>
      )}

      {/* English Translation */}
      {prefs.showTranslation && englishTranslation && (
        <div
          className={`${
            isCompact ? "mt-1 pt-1" : "mt-1.5 pt-1.5"
          } border-t border-[var(--border-subtle)]/50 text-left`}
          dir="ltr"
        >
          <p
            className="text-[var(--translation-color)] leading-relaxed select-text"
            style={{ fontSize: `${activeEnglishFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: englishTranslation.text }}
          />
        </div>
      )}

      {/* Inline Personal Reflection Note Card */}
      {verseNote && (
        <div
          className={`mt-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 text-xs transition-all flex flex-col gap-1.5`}
          dir={isUrdu ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
              <StickyNote className="w-3.5 h-3.5" />
              <span>{isUrdu ? "ذاتی نوٹ و تدبر:" : "Personal Reflection & Note:"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(true)}
              className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {isUrdu ? "تبدیل کریں" : "Edit"}
            </button>
          </div>
          <p className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed select-text">
            {verseNote.text}
          </p>
          {verseNote.tags && verseNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {verseNote.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        targetType="verse"
        verseKey={verse.verse_key}
        chapterId={verse.chapter_id}
        verseNumber={verse.verse_number}
        chapterName={chapterName}
      />
    </div>
  );
}
