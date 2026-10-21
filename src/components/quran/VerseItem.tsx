"use client";

import React, { useRef, useEffect, useState } from "react";
import { Verse } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { getAbsoluteVerseIndex } from "@/utils/quranMeta";
import { WordByWord } from "./WordByWord";
import {
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  BookOpen,
  Copy,
  Check,
  Share2,
  CheckCircle2,
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

  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);

  const isCurrentPlaying = currentVerseKey === verse.verse_key;
  const bookmarked = isBookmarked(verse.verse_key);
  const isCompact = readingMode === "compact";

  const currentAyahAbsIndex = getAbsoluteVerseIndex(verse.chapter_id, verse.verse_number);
  const isReadInKhatmah = plan ? currentAyahAbsIndex <= plan.completedAyahsCount : false;

  // Font class mapping
  const arabicFontClass = {
    amiri: "font-arabic-amiri",
    "noto-sans-arabic": "font-arabic-noto",
    scheherazade: "font-arabic-scheherazade",
    nastaliq: "font-arabic-nastaliq",
  }[prefs.arabicFont] || "font-arabic-amiri";

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
      if (plan) {
        recordReadingProgress(verse.chapter_id, verse.verse_number);
      }
    }
  }, [isCurrentPlaying, prefs.autoScroll, verse, chapterName, setLastReadPosition, plan, recordReadingProgress]);

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
          : "bg-[var(--surface-raised,#141e1a)] border-[var(--card-border,#1e2c26)] hover:border-emerald-500/25"
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between border-b border-[var(--border-subtle,#1a2621)] ${
          isCompact ? "pb-1 mb-1.5" : "pb-2 mb-2.5"
        }`}
      >
        {/* Verse Badge */}
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[11px] font-mono font-semibold text-emerald-400">
            {verse.verse_key}
          </span>
          {verse.juz_number && (
            <span className="hidden sm:inline-block text-[10px] text-[var(--muted-foreground,#8e9b94)] px-1.5 py-0.5 rounded bg-[var(--surface-card,#182520)]">
              Juz {verse.juz_number}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Play Verse */}
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isCurrentPlaying && isPlaying ? "Pause verse" : "Play verse audio"}
            className={`p-1.5 rounded-lg transition-colors ${
              isCurrentPlaying && isPlaying
                ? "bg-emerald-600 text-white"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)]"
            }`}
            title="Play Audio"
          >
            {isCurrentPlaying && isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark verse"}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? "text-emerald-400 bg-emerald-950/50"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)]"
            }`}
            title="Bookmark Ayah"
          >
            <BookmarkIcon className={`h-3.5 w-3.5 ${bookmarked ? "fill-emerald-400" : ""}`} />
          </button>

          {/* Khatmah Progress Toggle */}
          {plan && (
            <button
              type="button"
              onClick={() => recordReadingProgress(verse.chapter_id, verse.verse_number)}
              title={isReadInKhatmah ? "Completed in your Khatmah plan" : "Mark as read in Khatmah"}
              className={`p-1.5 rounded-lg transition-colors ${
                isReadInKhatmah
                  ? "text-emerald-400 bg-emerald-950/40"
                  : "text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)]"
              }`}
            >
              <CheckCircle2 className={`h-3.5 w-3.5 ${isReadInKhatmah ? "fill-emerald-400/20" : ""}`} />
            </button>
          )}

          {/* Tafsir Dedicated Button (Opens Modal Directly) */}
          <button
            type="button"
            onClick={() => onOpenTafsir(verse.verse_key, verse.text_uthmani)}
            title="Read Commentary (تفسیر / Tafseer)"
            className="px-2 py-0.5 rounded-lg text-emerald-400 bg-emerald-950/40 hover:bg-emerald-600 hover:text-white border border-emerald-800/40 transition-all flex items-center gap-1 text-[11px] font-medium shadow-xs"
          >
            <BookOpen className="h-3 w-3" />
            <span>تفسیر / Tafseer</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy verse"}
            className="p-1.5 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)] transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            title="Share verse"
            className="p-1.5 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)] transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
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
          } border-t border-[var(--border-subtle,#1a2621)] text-right`}
          dir="rtl"
        >
          <p
            className="font-urdu text-[var(--urdu-color,#e2e8f0)] leading-relaxed select-text"
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
          } border-t border-[var(--border-subtle,#1a2621)]/50 text-left`}
          dir="ltr"
        >
          <p
            className="text-[var(--translation-color,#cbd5e1)] leading-relaxed select-text"
            style={{ fontSize: `${activeEnglishFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: englishTranslation.text }}
          />
        </div>
      )}
    </div>
  );
}
