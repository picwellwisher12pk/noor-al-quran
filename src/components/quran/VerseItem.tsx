"use client";

import React, { useRef, useEffect, useState } from "react";
import { Verse } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { useNotes } from "@/context/NotesContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
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
  Flag,
} from "lucide-react";

interface VerseItemProps {
  verse: Verse;
  chapterName: string;
  chapterArabic?: string;
  allVersesInSurah: Verse[];
  onOpenTafsir: (verseKey: string, arabicText: string) => void;
  readingMode?: "continuous" | "compact" | "mushaf";
}

export function VerseItem({
  verse,
  chapterName,
  chapterArabic,
  allVersesInSurah,
  onOpenTafsir,
  readingMode = "continuous",
}: VerseItemProps) {
  const { currentVerseKey, isPlaying, playVerse, togglePlayPause } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark, lastRead, setLastReadPosition } = useBookmarks();
  const { prefs } = useReadingPreferences();
  const { plan, recordReadingProgress } = useKhatmah();
  const { logVerseRead } = useReadingActivity();
  const { getNotesForVerse } = useNotes();
  const { openNotesInInspector, selectedAyahKey, openAyahInInspector } = useDesktopWorkspace();
  const { isUrdu } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [pinnedSaved, setPinnedSaved] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const verseRef = useRef<HTMLDivElement>(null);
  const hasLoggedPlaybackRef = useRef(false);

  const isSelected = selectedAyahKey === verse.verse_key;
  const verseNotes = getNotesForVerse(verse.verse_key);
  const isCurrentPlaying = currentVerseKey === verse.verse_key;
  const bookmarked = isBookmarked(verse.verse_key);
  const isLastRead = lastRead?.verseKey === verse.verse_key;
  const isCompact = readingMode === "compact";

  const currentAyahAbsIndex = getAbsoluteVerseIndex(verse.chapter_id, verse.verse_number);
  const isReadInKhatmah = plan ? currentAyahAbsIndex <= plan.completedAyahsCount : false;

  const isIndoPak = prefs.quranScript === "indopak";
  const activeArabicText = (isIndoPak && verse.text_indopak) ? verse.text_indopak : verse.text_uthmani;

  // Font class mapping
  const baseArabicFontClass = {
    amiri: "font-arabic-amiri",
    "amiri-quran": "font-arabic-amiri-quran",
    "noto-naskh-arabic": "font-arabic-noto-naskh",
    scheherazade: "font-arabic-scheherazade",
    lateef: "font-arabic-lateef",
    "noto-sans-arabic": "font-arabic-noto",
    cairo: "font-arabic-cairo",
    nastaliq: "font-arabic-nastaliq",
  }[prefs.arabicFont] || "font-arabic-amiri";

  const arabicFontClass = isIndoPak && prefs.arabicFont === "amiri"
    ? "font-arabic-nastaliq"
    : baseArabicFontClass;

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

  const isLearnMode = (prefs.quranStudyMode || "read") === "learn";
  const showWbwInVerse = isLearnMode && Boolean(verse.words && verse.words.length > 0);
  const showUrduInVerse = isLearnMode
    ? prefs.showUrduTranslation && Boolean(urduTranslation)
    : isUrdu
    ? Boolean(urduTranslation)
    : !englishTranslation && Boolean(urduTranslation);
  const showEnglishInVerse = isLearnMode
    ? prefs.showTranslation && Boolean(englishTranslation)
    : !isUrdu && Boolean(englishTranslation);

  // Reset logged playback guard when this verse stops playing
  useEffect(() => {
    if (!isCurrentPlaying) {
      hasLoggedPlaybackRef.current = false;
    }
  }, [isCurrentPlaying]);

  // Auto-scroll and update last read when this verse starts playing
  useEffect(() => {
    if (!isCurrentPlaying) return;

    if (prefs.autoScroll && verseRef.current) {
      verseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    setLastReadPosition({
      chapterId: verse.chapter_id,
      chapterName,
      chapterArabic,
      verseNumber: verse.verse_number,
      verseKey: verse.verse_key,
      juzNumber: verse.juz_number,
    });

    // Guard to ensure reading progress is logged only once per playback activation
    if (!hasLoggedPlaybackRef.current) {
      hasLoggedPlaybackRef.current = true;
      logVerseRead(verse.chapter_id, verse.verse_number);
      if (plan) {
        recordReadingProgress(verse.chapter_id, verse.verse_number);
      }
    }
  }, [isCurrentPlaying, prefs.autoScroll, verse.chapter_id, verse.verse_number, verse.verse_key, verse.juz_number, chapterName, chapterArabic, setLastReadPosition, plan, recordReadingProgress, logVerseRead]);

  const handlePinLastRead = () => {
    logVerseRead(verse.chapter_id, verse.verse_number);
    setLastReadPosition({
      chapterId: verse.chapter_id,
      chapterName,
      chapterArabic,
      verseNumber: verse.verse_number,
      verseKey: verse.verse_key,
      juzNumber: verse.juz_number,
    });
    setPinnedSaved(true);
    setTimeout(() => setPinnedSaved(false), 1800);
  };

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
        text_uthmani: activeArabicText,
        text_indopak: verse.text_indopak,
        translation_text: englishTranslation?.text || urduTranslation?.text,
      });
    }
  };

  const handleCopy = () => {
    const textToCopy = [
      activeArabicText,
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
      text: `${activeArabicText}\n\n${englishTranslation?.text || ""}\n[Surah ${chapterName} ${verse.verse_key}]`,
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

  const handleVerseClick = (e: React.MouseEvent) => {
    // Avoid re-selecting if the user clicked an interactive control inside the card
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button']")) {
      return;
    }
    openAyahInInspector(verse.verse_key, activeArabicText);
  };

  return (
    <div
      ref={verseRef}
      id={`ayah-${verse.verse_number}`}
      data-ayah-number={verse.verse_number}
      onClick={handleVerseClick}
      className={`relative transition-all duration-200 border cursor-pointer ${
        isCompact
          ? "rounded-xl p-2.5 sm:p-3"
          : "rounded-2xl p-4 sm:p-5 shadow-sm"
      } ${
        isCurrentPlaying
          ? "bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/50"
          : isSelected
          ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40 shadow-md"
          : isLastRead
          ? "bg-[var(--surface-raised)] border-emerald-500/45 ring-1 ring-emerald-500/15"
          : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5"
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
          {isLastRead && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <Flag className="h-2.5 w-2.5 fill-current" />
              <span>{isUrdu ? "آخری تلاوت" : "Last Read"}</span>
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

          {/* Mark as Stopping Point (Last Read) */}
          <button
            type="button"
            onClick={handlePinLastRead}
            aria-label={isUrdu ? "یہاں روکنے کی علامت لگائیں" : "Mark as stopping point"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLastRead || pinnedSaved
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/30"
                : "text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[var(--hover-bg)]"
            }`}
            title={
              pinnedSaved
                ? isUrdu
                  ? "محفوظ ہو گیا!"
                  : "Stopping point saved!"
                : isUrdu
                ? "تلاوت یہاں روکیں (آخری پڑھی گئی آیت)"
                : "Set as stopping point (Last Read)"
            }
          >
            {pinnedSaved ? (
              <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-emerald-500" />
            ) : (
              <Flag className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isLastRead ? "fill-emerald-600 dark:fill-emerald-400" : ""}`} />
            )}
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
            onClick={() => {
              openNotesInInspector(verse.verse_key, activeArabicText);
            }}
            aria-label={verseNotes.length > 0 ? "View or edit personal notes" : "Add personal note"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              verseNotes.length > 0
                ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/50 border border-amber-500/30"
                : "text-[var(--muted-foreground)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--hover-bg)]"
            }`}
            title={
              verseNotes.length > 0
                ? isUrdu
                  ? `${verseNotes.length} نوٹس دیکھیں یا نیا شامل کریں`
                  : `View ${verseNotes.length} note(s) in Right Panel`
                : isUrdu
                ? "نوٹ یا تدبر لکھیں"
                : "Add reflection note"
            }
          >
            <StickyNote className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${verseNotes.length > 0 ? "fill-amber-500/30" : ""}`} />
            {verseNotes.length > 1 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center leading-none">
                {verseNotes.length}
              </span>
            )}
          </button>

          {/* Khatmah Progress Toggle */}
          {plan && (
            <button
              type="button"
              onClick={() => {
                logVerseRead(verse.chapter_id, verse.verse_number);
                recordReadingProgress(verse.chapter_id, verse.verse_number);
                setLastReadPosition({
                  chapterId: verse.chapter_id,
                  chapterName,
                  chapterArabic,
                  verseNumber: verse.verse_number,
                  verseKey: verse.verse_key,
                  juzNumber: verse.juz_number,
                });
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
            onClick={() => onOpenTafsir(verse.verse_key, activeArabicText)}
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
        {showWbwInVerse && verse.words ? (
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
            {activeArabicText}
            <span className="inline-flex items-center justify-center text-emerald-500 font-arabic text-lg px-2 select-none">
              ۝
            </span>
          </p>
        )}
      </div>

      {/* Urdu Translation */}
      {showUrduInVerse && urduTranslation && (
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
      {showEnglishInVerse && englishTranslation && (
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

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNoteId(null);
        }}
        targetType="verse"
        verseKey={verse.verse_key}
        chapterId={verse.chapter_id}
        verseNumber={verse.verse_number}
        chapterName={chapterName}
        noteId={editingNoteId}
      />
    </div>
  );
}
