"use client";

import React, { useState } from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useNotes } from "@/context/NotesContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSajdahInfo } from "@/utils/quranMeta";
import { SajdahGuideModal } from "@/components/modals/SajdahGuideModal";
import { Verse } from "@/types/quran";
import {
  Play,
  Pause,
  BookOpen,
  Bookmark as BookmarkIcon,
  Flag,
  StickyNote,
  Share2,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface MobileAyahActionDockProps {
  verses: Verse[];
  chapterId: number;
  chapterName: string;
  chapterArabic?: string;
  onOpenTafsir: (verseKey: string, arabicText: string) => void;
  onOpenNotes?: (verseKey: string, arabicText: string) => void;
}

export function MobileAyahActionDock({
  verses,
  chapterId,
  chapterName,
  chapterArabic,
  onOpenTafsir,
  onOpenNotes,
}: MobileAyahActionDockProps) {
  const {
    selectedAyahKey,
    setSelectedAyahKey,
    selectedAyahArabic,
    openNotesInInspector,
  } = useDesktopWorkspace();

  const {
    currentVerseKey,
    isPlaying,
    isLoading,
    playVerse,
    togglePlayPause,
  } = useAudio();

  const {
    isBookmarked,
    addBookmark,
    removeBookmark,
    lastRead,
    setLastReadPosition,
  } = useBookmarks();

  const { getNotesForVerse } = useNotes();
  const { isUrdu } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [pinnedSaved, setPinnedSaved] = useState(false);
  const [isSajdahOpen, setIsSajdahOpen] = useState(false);

  // Active key is selectedAyahKey, or falling back to current playing verse key if audio is active
  const activeKey = selectedAyahKey || (isPlaying ? currentVerseKey : null);
  if (!activeKey) return null;

  const currentVerse = verses.find((v) => v.verse_key === activeKey);
  const sajdahInfo = getSajdahInfo(activeKey);
  const isCurrentPlaying = currentVerseKey === activeKey;
  const isVerseLoading = isCurrentPlaying && isLoading;
  const bookmarked = isBookmarked(activeKey);
  const isLastRead = lastRead?.verseKey === activeKey;
  const verseNotes = getNotesForVerse(activeKey);
  const arabicText = currentVerse?.text_uthmani || selectedAyahArabic || "";

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      togglePlayPause();
    } else {
      playVerse(chapterId, activeKey);
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVerse) return;
    if (bookmarked) {
      removeBookmark(activeKey);
    } else {
      addBookmark({
        verse_key: activeKey,
        chapter_id: chapterId,
        verse_number: currentVerse.verse_number,
        chapter_name: chapterName,
        text_uthmani: arabicText,
        text_indopak: currentVerse.text_indopak,
        translation_text:
          currentVerse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || "",
      });
    }
  };

  const handlePinLastRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVerse) return;
    setLastReadPosition({
      chapterId,
      chapterName,
      chapterArabic,
      verseNumber: currentVerse.verse_number,
      verseKey: activeKey,
      juzNumber: currentVerse.juz_number,
    });
    setPinnedSaved(true);
    setTimeout(() => setPinnedSaved(false), 2000);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVerse) return;
    const translationText = currentVerse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || "";
    const copyContent = `${arabicText}\n\n${translationText}\n[Surah ${chapterName} ${activeKey}]`;
    navigator.clipboard.writeText(copyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentVerse) return;
    const translationText = currentVerse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || "";
    const shareData = {
      title: `Surah ${chapterName} - Ayah ${activeKey}`,
      text: `${arabicText}\n\n${translationText}\n[Surah ${chapterName} ${activeKey}]`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy(e);
    }
  };

  const handleOpenTafsirClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenTafsir(activeKey, arabicText);
  };

  const handleOpenNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenNotes) {
      onOpenNotes(activeKey, arabicText);
    } else {
      openNotesInInspector(activeKey, arabicText);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAyahKey(null);
  };

  return (
    <div
      className="md:hidden fixed z-30 inset-x-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      style={{
        bottom: isPlaying
          ? "calc(64px + env(safe-area-inset-bottom, 0px))"
          : "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto max-w-md rounded-2xl bg-[var(--surface-raised)]/95 backdrop-blur-md border border-[var(--card-border)] shadow-xl p-2.5 flex items-center justify-between gap-1 text-[var(--foreground)]">
        {/* Ayah Badge */}
        <div className="flex items-center gap-1.5 pl-1 shrink-0">
          <span className="flex items-center justify-center px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
            {activeKey}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={handlePlayToggle}
            disabled={isVerseLoading}
            aria-label={isCurrentPlaying && isPlaying ? "Pause verse" : "Play verse"}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isCurrentPlaying && isPlaying
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--foreground)] hover:bg-[var(--hover-bg)] bg-[var(--surface-card)]"
            }`}
            title={isCurrentPlaying && isPlaying ? "Pause" : "Play"}
          >
            {isVerseLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : isCurrentPlaying && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          {/* Tafseer */}
          <button
            type="button"
            onClick={handleOpenTafsirClick}
            aria-label="Read Tafseer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Tafseer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{isUrdu ? "تفسیر" : "Tafsir"}</span>
          </button>

          {/* Sajdah Guide Button (if active Ayah is a Sajdah verse) */}
          {sajdahInfo && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSajdahOpen(true);
              }}
              aria-label="Sajdah Tilawat Guide"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 animate-pulse"
              title={isUrdu ? `آیتِ سجدہ نمبر ${sajdahInfo.sajdahNumber}` : `Sajdah #${sajdahInfo.sajdahNumber} Guide`}
            >
              <span className="font-arabic font-bold text-sm leading-none">۩</span>
              <span>{isUrdu ? `سجدہ ${sajdahInfo.sajdahNumber}` : `Sajdah`}</span>
            </button>
          )}

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label="Bookmark verse"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              bookmarked
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
            }`}
            title="Bookmark"
          >
            <BookmarkIcon
              className={`h-4 w-4 ${bookmarked ? "fill-emerald-600 dark:fill-emerald-400" : ""}`}
            />
          </button>

          {/* Stopping Point (Last Read) */}
          <button
            type="button"
            onClick={handlePinLastRead}
            aria-label="Mark as last read"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLastRead || pinnedSaved
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
            }`}
            title="Mark as Stopping Point"
          >
            {pinnedSaved ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Flag
                className={`h-4 w-4 ${isLastRead ? "fill-emerald-600 dark:fill-emerald-400" : ""}`}
              />
            )}
          </button>

          {/* Reflection Note */}
          <button
            type="button"
            onClick={handleOpenNotesClick}
            aria-label="Add reflection note"
            className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
              verseNotes.length > 0
                ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30"
                : "text-[var(--muted-foreground)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--hover-bg)]"
            }`}
            title="Reflection Note"
          >
            <StickyNote
              className={`h-4 w-4 ${verseNotes.length > 0 ? "fill-amber-500/30" : ""}`}
            />
            {verseNotes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[12px] h-3 rounded-full bg-amber-500 text-slate-950 text-[8px] font-mono font-bold flex items-center justify-center leading-none">
                {verseNotes.length}
              </span>
            )}
          </button>

          {/* Copy / Share */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share verse"
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
            title="Share"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss active ayah bar"
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sajdah Tilawat Modal */}
      {sajdahInfo && (
        <SajdahGuideModal
          isOpen={isSajdahOpen}
          onClose={() => setIsSajdahOpen(false)}
          verseKey={activeKey}
          arabicText={arabicText}
        />
      )}
    </div>
  );
}
