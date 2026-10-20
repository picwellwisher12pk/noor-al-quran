"use client";

import React, { useRef, useEffect, useState } from "react";
import { Verse } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { WordByWord } from "./WordByWord";
import {
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  BookOpen,
  Copy,
  Check,
  Share2,
} from "lucide-react";

interface VerseItemProps {
  verse: Verse;
  chapterName: string;
  allVersesInSurah: Verse[];
  onOpenTafsir: (verseKey: string, arabicText: string) => void;
}

export function VerseItem({
  verse,
  chapterName,
  allVersesInSurah,
  onOpenTafsir,
}: VerseItemProps) {
  const { currentVerseKey, isPlaying, playVerse, togglePlayPause } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark, setLastReadPosition } = useBookmarks();
  const { prefs } = useReadingPreferences();

  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);

  const isCurrentPlaying = currentVerseKey === verse.verse_key;
  const bookmarked = isBookmarked(verse.verse_key);

  // Auto-scroll when this verse starts playing
  useEffect(() => {
    if (isCurrentPlaying && prefs.autoScroll && verseRef.current) {
      verseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Also update last read position
      setLastReadPosition({
        chapterId: verse.chapter_id,
        chapterName,
        verseNumber: verse.verse_number,
        verseKey: verse.verse_key,
      });
    }
  }, [isCurrentPlaying, prefs.autoScroll, verse, chapterName, setLastReadPosition]);

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
        translation_text: verse.translations?.[0]?.text,
      });
    }
  };

  const handleCopy = async () => {
    const textToCopy = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || ""}\n\n[Quran ${verse.verse_key} - ${chapterName}]`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy verse:", e);
    }
  };

  const handleShare = async () => {
    const text = `${verse.text_uthmani}\n\n[Surah ${chapterName} ${verse.verse_key}]`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Quran ${verse.verse_key}`,
          text: text,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      ref={verseRef}
      id={`ayah-${verse.verse_number}`}
      className={`relative rounded-2xl p-5 md:p-6 transition-all duration-300 border ${
        isCurrentPlaying
          ? "bg-emerald-950/25 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50"
          : "bg-[var(--surface-raised,#141e1a)] border-[var(--card-border,#1e2c26)] hover:border-emerald-500/30"
      }`}
    >
      {/* Top Bar: Verse Key & Quick Actions */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle,#1a2621)]">
        {/* Verse Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center px-2.5 py-1 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs font-mono font-semibold text-emerald-400">
            {verse.verse_key}
          </span>
          {verse.juz_number && (
            <span className="hidden sm:inline-block text-[11px] text-[var(--muted-foreground,#8e9b94)] px-2 py-0.5 rounded-md bg-[var(--surface-card,#182520)]">
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
            className={`p-2 rounded-lg transition-colors ${
              isCurrentPlaying && isPlaying
                ? "bg-emerald-600 text-white"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)]"
            }`}
          >
            {isCurrentPlaying && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark verse"}
            className={`p-2 rounded-lg transition-colors ${
              bookmarked
                ? "text-emerald-400 bg-emerald-950/50"
                : "text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)]"
            }`}
          >
            <BookmarkIcon className={`h-4 w-4 ${bookmarked ? "fill-emerald-400" : ""}`} />
          </button>

          {/* Tafsir */}
          <button
            type="button"
            onClick={() => onOpenTafsir(verse.verse_key, verse.text_uthmani)}
            title="Read Tafsir Ibn Kathir"
            className="p-2 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy verse"}
            className="p-2 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)] transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            title="Share verse"
            className="p-2 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--hover-bg,#1f2d27)] transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Arabic Script Display */}
      <div className="py-2 text-right" dir="rtl">
        {prefs.showWordByWord && verse.words && verse.words.length > 0 ? (
          <WordByWord words={verse.words} arabicFontSize={prefs.arabicFontSize} />
        ) : (
          <p
            className="font-arabic text-[var(--foreground)] leading-[2.4] select-text"
            style={{ fontSize: `${prefs.arabicFontSize}px` }}
          >
            {verse.text_uthmani}
            <span className="inline-flex items-center justify-center text-emerald-500 font-arabic text-xl px-2 select-none">
              ۝
            </span>
          </p>
        )}
      </div>

      {/* English Translation */}
      {prefs.showTranslation && verse.translations && verse.translations[0] && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle,#1a2621)]">
          <p
            className="text-[var(--translation-color,#c2cec7)] leading-relaxed select-text"
            style={{ fontSize: `${prefs.englishFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
          />
        </div>
      )}
    </div>
  );
}
