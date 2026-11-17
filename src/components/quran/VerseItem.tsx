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
import { WaqfInteractiveText } from "./WaqfInteractiveText";
import NoteEditorModal from "@/components/modals/NoteEditorModal";
import { useIsMobile } from "@/hooks/useMediaQuery";
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
  Loader2,
  X,
  MoreHorizontal,
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
  const {
    currentVerseKey,
    isPlaying,
    isLoading,
    isPlayingTranslation,
    isTranslationLoading,
    currentTime,
    duration,
    translationCurrentTime,
    translationDuration,
    playVerse,
    togglePlayPause,
    toggleTranslationPlayPause,
    seek,
    seekTranslation,
    stopAudio,
    stopTranslationAudio,
    currentReciter,
  } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark, lastRead, setLastReadPosition } = useBookmarks();
  const { prefs } = useReadingPreferences();
  const { plan, recordReadingProgress } = useKhatmah();
  const { logVerseRead } = useReadingActivity();
  const { getNotesForVerse } = useNotes();
  const {
    openNotesInInspector,
    selectedAyahKey,
    setSelectedAyahKey,
    setSelectedAyahArabic,
    openAyahInInspector,
    setActiveAyahFromPlayback,
  } = useDesktopWorkspace();
  const { isUrdu } = useLanguage();
  const isMobile = useIsMobile();

  const [copied, setCopied] = useState(false);
  const [pinnedSaved, setPinnedSaved] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const verseRef = useRef<HTMLDivElement>(null);
  const hasLoggedPlaybackRef = useRef(false);

  const isSelected = selectedAyahKey === verse.verse_key;
  const verseNotes = getNotesForVerse(verse.verse_key);
  const isCurrentPlaying = currentVerseKey === verse.verse_key;
  const isVerseLoading = isCurrentPlaying && isLoading;
  const bookmarked = isBookmarked(verse.verse_key);
  const isLastRead = lastRead?.verseKey === verse.verse_key;
  const isCompact = readingMode === "compact";

  const currentAyahAbsIndex = getAbsoluteVerseIndex(verse.chapter_id, verse.verse_number);
  const isReadInKhatmah = plan ? currentAyahAbsIndex <= plan.completedAyahsCount : false;

  const isIndoPak = prefs.quranScript === "indopak";
  const activeArabicText = (isIndoPak && verse.text_indopak) ? verse.text_indopak : verse.text_uthmani;
  const showStopHelp = prefs.showStopSignsHelp !== false;

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

    setActiveAyahFromPlayback(verse.verse_key, activeArabicText);

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
  }, [
    isCurrentPlaying,
    prefs.autoScroll,
    verse.chapter_id,
    verse.verse_number,
    verse.verse_key,
    verse.juz_number,
    chapterName,
    chapterArabic,
    setLastReadPosition,
    plan,
    recordReadingProgress,
    logVerseRead,
    setActiveAyahFromPlayback,
    activeArabicText,
  ]);

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
      if (isPlayingTranslation) {
        toggleTranslationPlayPause();
      } else {
        togglePlayPause();
      }
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

  const formatAudioTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const audioProgressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const translationProgressPercent =
    translationDuration > 0
      ? Math.min(100, Math.max(0, (translationCurrentTime / translationDuration) * 100))
      : 0;

  const activeVoiceId = isUrdu
    ? prefs.urduTranslationAudioVoice || "urdu_shamshad_ali_khan_46kbps"
    : prefs.englishTranslationAudioVoice || "Sahih_Intnl_Ibrahim_Walk_192kbps";

  const translationVoiceLabel = isUrdu
    ? activeVoiceId === "urdu_farhat_hashmi"
      ? "ڈاکٹر فرحت ہاشمی"
      : "شمشاد علی خان"
    : "Ibrahim Walk";

  const handleVerseClick = (e: React.MouseEvent) => {
    // Avoid re-selecting if the user clicked an interactive control inside the card
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button']")) {
      return;
    }
    if (isMobile) {
      // On mobile, tap selects the ayah to surface the active action dock,
      // without opening the heavy bottom inspector sheet.
      setSelectedAyahKey(isSelected ? null : verse.verse_key);
      setSelectedAyahArabic(activeArabicText);
    } else {
      openAyahInInspector(verse.verse_key, activeArabicText);
    }
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
          ? "bg-[var(--primary)]/10 border-[var(--primary)] ring-2 ring-[var(--primary)]/50"
          : isSelected
          ? "bg-[var(--primary)]/10 border-[var(--primary)] ring-2 ring-[var(--primary)]/40 shadow-md"
          : isLastRead
          ? "bg-[var(--surface-raised)] border-[var(--primary)]/45 ring-1 ring-[var(--primary)]/15"
          : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
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
          <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[11px] font-mono font-bold text-[var(--primary)]">
            {verse.verse_key}
          </span>
          {verse.juz_number && (
            <span className="hidden sm:inline-block text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] font-medium">
              Juz {verse.juz_number}
            </span>
          )}
          {isLastRead && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
              <Flag className="h-2.5 w-2.5 fill-current" />
              <span>{isUrdu ? "آخری تلاوت" : "Last Read"}</span>
            </span>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {/* Play Verse */}
          <button
            type="button"
            onClick={handlePlayToggle}
            disabled={isVerseLoading}
            aria-label={
              isVerseLoading
                ? isUrdu
                  ? "آڈیو ڈاؤن لوڈ ہو رہی ہے..."
                  : "Downloading recitation audio..."
                : isCurrentPlaying && isPlaying
                ? isUrdu
                  ? "تلاوت روکیں"
                  : "Pause verse"
                : isUrdu
                ? "آیت کی تلاوت سنیں"
                : "Play verse audio"
            }
            className={`p-2 sm:p-1.5 rounded-lg transition-all cursor-pointer ${
              isVerseLoading
                ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/40 animate-pulse"
                : isCurrentPlaying && isPlaying
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)]"
            }`}
            title={
              isVerseLoading
                ? isUrdu
                  ? "آڈیو ڈاؤن لوڈ ہو رہی ہے..."
                  : "Downloading recitation audio..."
                : isCurrentPlaying && isPlaying
                ? isUrdu
                  ? "تلاوت روکیں"
                  : "Pause verse"
                : isUrdu
                ? "آیت کی تلاوت سنیں"
                : "Play verse audio"
            }
          >
            {isVerseLoading ? (
              <Loader2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : isCurrentPlaying && isPlaying ? (
              <Pause className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            ) : (
              <Play className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            )}
          </button>

          {/* Mark as Stopping Point (Last Read) */}
          <button
            type="button"
            onClick={handlePinLastRead}
            aria-label={isUrdu ? "یہاں روکنے کی علامت لگائیں" : "Mark as stopping point"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLastRead || pinnedSaved
                ? "text-[var(--primary)] bg-[var(--primary)]/15 border border-[var(--primary)]/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)]"
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
              <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[var(--primary)]" />
            ) : (
              <Flag className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isLastRead ? "fill-[var(--primary)]" : ""}`} />
            )}
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark verse"}
            className={`p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              bookmarked
                ? "text-[var(--primary)] bg-[var(--primary)]/15 border border-[var(--primary)]/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)]"
            }`}
            title="Bookmark Ayah"
          >
            <BookmarkIcon className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${bookmarked ? "fill-[var(--primary)]" : ""}`} />
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
              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-[var(--warning,#f59e0b)] text-[var(--warning-fg,#0f172a)] text-[9px] font-mono font-bold flex items-center justify-center leading-none">
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
                  ? "text-[var(--primary)] bg-[var(--primary)]/15 border border-[var(--primary)]/30"
                  : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)]"
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isReadInKhatmah ? "fill-[var(--primary)]/20" : ""}`} />
            </button>
          )}

          {/* Tafsir Dedicated Button (Opens Modal Directly) */}
          <button
            type="button"
            onClick={() => onOpenTafsir(verse.verse_key, activeArabicText)}
            title={isUrdu ? "تفسیر قرآن دیکھیں" : "Read Commentary (Tafseer)"}
            aria-label={isUrdu ? "تفسیر قرآن دیکھیں" : "Read Commentary (Tafseer)"}
            className="p-2 sm:p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
          >
            <BookOpen className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy verse"}
            className="p-2 sm:p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[var(--primary)]" /> : <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            title="Share verse"
            className="p-2 sm:p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* Mobile Minimal Indicators & Quick Action Trigger */}
        <div className="flex sm:hidden items-center gap-1.5">
          {bookmarked && (
            <BookmarkIcon className="h-3.5 w-3.5 fill-[var(--primary)] text-[var(--primary)]" />
          )}
          {verseNotes.length > 0 && (
            <StickyNote className="h-3.5 w-3.5 fill-amber-500/40 text-amber-600 dark:text-amber-400" />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAyahKey(isSelected ? null : verse.verse_key);
              setSelectedAyahArabic(activeArabicText);
            }}
            aria-label="Ayah actions"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSelected
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
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
          <WaqfInteractiveText
            arabicText={activeArabicText}
            fontSize={activeArabicFontSize}
            fontClass={`${arabicFontClass} ${isCompact ? "leading-[1.7]" : "leading-[2.0]"}`}
            isPlaying={isCurrentPlaying}
            showWaqfHelp={showStopHelp}
          />
        )}
      </div>

      {/* Arabic Recitation Audio Player (Directly Below Arabic Script) */}
      {isCurrentPlaying && (duration > 0 || isPlaying || currentTime > 0 || isVerseLoading) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 mb-1.5 pt-1.5 pb-1.5 border border-[var(--primary)]/25 flex flex-col gap-1.5 px-2.5 sm:px-3 rounded-xl bg-[var(--primary)]/5 transition-all duration-200 select-none shadow-2xs"
        >
          {isVerseLoading && duration === 0 ? (
            <div className="flex items-center justify-between text-[11px] text-[var(--primary)] font-medium py-0.5 animate-pulse">
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-[var(--primary)]" />
                <span>
                  {isUrdu ? "تلاوت آڈیو ڈاؤن لوڈ ہو رہی ہے..." : "Downloading recitation audio..."}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                {currentReciter?.reciter_name || "Audio"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                disabled={isVerseLoading}
                aria-label={isPlaying ? "Pause Arabic recitation" : "Play Arabic recitation"}
                className="h-6 w-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title={
                  currentReciter?.reciter_name
                    ? `${currentReciter.reciter_name} - ${isPlaying ? "Pause" : "Play"}`
                    : isPlaying ? "Pause Arabic" : "Play Arabic"
                }
              >
                {isVerseLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3 ml-0.5" />
                )}
              </button>

              {/* Language & Reciter Badge */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] font-sans">
                  {isUrdu ? "عربی تلاوت" : "Arabic"}
                </span>
                <span
                  className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[85px] sm:max-w-[130px] hidden sm:inline"
                  title={currentReciter?.reciter_name}
                >
                  {currentReciter?.reciter_name?.split(" ")[0] || "Reciter"}
                </span>
              </div>

              {/* Interactive Ultra-Thin Seekbar Track + Playhead Knob */}
              <div className="relative flex-1 flex items-center group py-1 min-w-[60px]">
                {/* Ultra-Thin Track (2.5px) */}
                <div className="w-full h-[2.5px] rounded-full bg-[var(--card-border)]/70 dark:bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-[width] duration-75"
                    style={{ width: `${audioProgressPercent}%` }}
                  />
                </div>

                {/* Draggable Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white dark:bg-white border-[1.5px] border-[var(--primary)] shadow-xs pointer-events-none transition-transform group-hover:scale-125"
                  style={{ left: `${audioProgressPercent}%` }}
                />

                {/* Transparent Native Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : 100}
                  step={0.05}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  aria-label="Seek Arabic recitation time"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Timestamps */}
              <div className="text-[10px] font-mono font-medium text-[var(--foreground)] shrink-0 flex items-center gap-0.5 whitespace-nowrap">
                <span>{formatAudioTime(currentTime)}</span>
                <span className="text-[var(--muted-foreground)]/60">/</span>
                <span className="text-[var(--muted-foreground)]">{formatAudioTime(duration)}</span>
              </div>

              {/* Stop Arabic Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stopAudio();
                }}
                aria-label="Stop playback"
                className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer shrink-0"
                title="Stop playback"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Urdu Translation */}
      {showUrduInVerse && urduTranslation && (
        <div
          className={`${
            isCompact ? "mt-1.5 pt-1.5" : "mt-2 pt-2"
          } border-t border-[var(--border-subtle)] text-right`}
          dir="rtl"
        >
          <p
            className={`${urduFontClass} text-[var(--urdu-color)] select-text`}
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

      {/* Translation Audio Player (Directly Below Translation) */}
      {isCurrentPlaying &&
        (translationDuration > 0 ||
          isPlayingTranslation ||
          translationCurrentTime > 0 ||
          isTranslationLoading) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 pt-1.5 pb-1.5 border border-teal-500/25 flex flex-col gap-1.5 px-2.5 sm:px-3 rounded-xl bg-teal-500/5 dark:bg-teal-950/25 transition-all duration-200 select-none shadow-2xs"
        >
          {isTranslationLoading && translationDuration === 0 ? (
            <div className="flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-300 font-medium py-0.5 animate-pulse">
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-teal-600 dark:text-teal-400" />
                <span>
                  {isUrdu ? "ترجمہ آڈیو ڈاؤن لوڈ ہو رہی ہے..." : "Downloading translation audio..."}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                {translationVoiceLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={toggleTranslationPlayPause}
                disabled={isTranslationLoading}
                aria-label={isPlayingTranslation ? "Pause translation audio" : "Play translation audio"}
                className="h-6 w-6 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title={
                  translationVoiceLabel
                    ? `${translationVoiceLabel} - ${isPlayingTranslation ? "Pause" : "Play"}`
                    : isPlayingTranslation ? "Pause Translation" : "Play Translation"
                }
              >
                {isTranslationLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isPlayingTranslation ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3 ml-0.5" />
                )}
              </button>

              {/* Language & Voice Badge */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-800 dark:text-teal-300 font-sans">
                  {isUrdu ? "ترجمہ آڈیو" : "Translation"}
                </span>
                <span
                  className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[85px] sm:max-w-[130px] hidden sm:inline"
                  title={translationVoiceLabel}
                >
                  {translationVoiceLabel}
                </span>
              </div>

              {/* Interactive Ultra-Thin Seekbar Track + Playhead Knob */}
              <div className="relative flex-1 flex items-center group py-1 min-w-[60px]">
                {/* Ultra-Thin Track (2.5px) */}
                <div className="w-full h-[2.5px] rounded-full bg-[var(--card-border)]/70 dark:bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 transition-[width] duration-75"
                    style={{ width: `${translationProgressPercent}%` }}
                  />
                </div>

                {/* Draggable Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white dark:bg-teal-200 border-[1.5px] border-teal-600 dark:border-teal-400 shadow-xs pointer-events-none transition-transform group-hover:scale-125"
                  style={{ left: `${translationProgressPercent}%` }}
                />

                {/* Transparent Native Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={translationDuration > 0 ? translationDuration : 100}
                  step={0.05}
                  value={translationCurrentTime}
                  onChange={(e) => seekTranslation(parseFloat(e.target.value))}
                  aria-label="Seek translation time"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Timestamps */}
              <div className="text-[10px] font-mono font-medium text-[var(--foreground)] shrink-0 flex items-center gap-0.5 whitespace-nowrap">
                <span>{formatAudioTime(translationCurrentTime)}</span>
                <span className="text-[var(--muted-foreground)]/60">/</span>
                <span className="text-[var(--muted-foreground)]">
                  {translationDuration > 0 ? formatAudioTime(translationDuration) : "--:--"}
                </span>
              </div>

              {/* Stop Translation Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stopTranslationAudio();
                }}
                aria-label="Stop translation audio"
                className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer shrink-0"
                title="Stop translation audio"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
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
