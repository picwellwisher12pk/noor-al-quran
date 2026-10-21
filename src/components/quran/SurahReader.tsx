"use client";

import React, { useState, useEffect } from "react";
import { Chapter, Verse } from "@/types/quran";
import { fetchVersesByChapter } from "@/services/quranApi";
import { VerseItem } from "./VerseItem";
import { TafsirModal } from "@/components/modals/TafsirModal";
import { useBookmarks } from "@/context/BookmarksContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { DesktopToolbar } from "@/components/desktop/DesktopToolbar";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, ArrowUp, Calendar } from "lucide-react";
import Link from "next/link";

interface SurahReaderProps {
  chapter: Chapter;
  initialVerses: Verse[];
  totalPages: number;
}

export function SurahReader({ chapter, initialVerses, totalPages }: SurahReaderProps) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tafsirAyahKey, setTafsirAyahKey] = useState<string | null>(null);
  const [tafsirArabicText, setTafsirArabicText] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const searchParams = useSearchParams();
  const targetAyah = searchParams.get("ayah");
  const { setLastReadPosition } = useBookmarks();
  const { plan, targetInfo } = useKhatmah();
  const { prefs } = useReadingPreferences();
  const { setActiveChapterId, setActiveAyahNumber, readingMode } = useDesktopWorkspace();
  const { currentVerseKey, currentChapterId, isPlaying, updateVersesQueue } = useAudio();

  // Sync loaded verses with audio queue
  useEffect(() => {
    if (verses && verses.length > 0) {
      updateVersesQueue(verses);
    }
  }, [verses, updateVersesQueue]);

  // Sync active chapter with global workspace
  useEffect(() => {
    setActiveChapterId(chapter.id);
    if (targetAyah) {
      setActiveAyahNumber(Number(targetAyah) || 1);
    }
  }, [chapter.id, targetAyah, setActiveChapterId, setActiveAyahNumber]);

  // When selected Urdu translation changes, reload verses with the chosen translation!
  useEffect(() => {
    let isCancelled = false;
    fetchVersesByChapter(chapter.id, 1, 50, 20, prefs.selectedUrduTranslationId)
      .then((res) => {
        if (!isCancelled && res.verses?.length > 0) {
          setVerses(res.verses);
          setCurrentPage(1);
        }
      })
      .catch(console.error);
    return () => {
      isCancelled = true;
    };
  }, [chapter.id, prefs.selectedUrduTranslationId]);

  // Handle jump to ayah on initial load if query param present
  useEffect(() => {
    if (targetAyah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [targetAyah]);

  // Track last read
  useEffect(() => {
    setLastReadPosition({
      chapterId: chapter.id,
      chapterName: chapter.name_simple,
      verseNumber: Number(targetAyah) || 1,
      verseKey: `${chapter.id}:${Number(targetAyah) || 1}`,
    });
  }, [chapter.id, chapter.name_simple, targetAyah, setLastReadPosition]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMoreVerses = async () => {
    if (currentPage >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetchVersesByChapter(chapter.id, nextPage, 50, 20, prefs.selectedUrduTranslationId);
      setVerses((prev) => [...prev, ...res.verses]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error("Failed to load more verses:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  // Auto-fetch more verses if audio playback advances near the end of loaded verses
  useEffect(() => {
    if (!isPlaying || currentChapterId !== chapter.id || !currentVerseKey) return;
    const parts = currentVerseKey.split(":");
    const ayahNum = Number(parts[1]) || 1;
    if (ayahNum >= verses.length - 2 && currentPage < totalPages && !loadingMore) {
      loadMoreVerses();
    }
  }, [currentVerseKey, currentChapterId, chapter.id, verses.length, currentPage, totalPages, loadingMore]);

  // Explicitly opens dedicated Tafseer modal WITHOUT touching the right inspector pane!
  const handleOpenTafsir = (verseKey: string, arabicText: string) => {
    setTafsirAyahKey(verseKey);
    setTafsirArabicText(arabicText);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Surah 1 (Al-Fatihah) and Surah 9 (At-Tawbah) bismillah rules
  const showBismillah = chapter.id !== 1 && chapter.id !== 9;
  const isCompact = readingMode === "compact";

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      {/* Desktop Sticky Workspace Toolbar */}
      <DesktopToolbar
        chapterId={chapter.id}
        chapterName={chapter.name_simple}
        chapterArabic={chapter.name_arabic}
        totalAyahs={chapter.verses_count}
        verses={verses}
      />

      {/* Reading Canvas Container */}
      <div
        className={`flex-1 overflow-y-auto w-full mx-auto pb-24 ${
          isCompact ? "max-w-4xl px-2 sm:px-4 py-2 space-y-2" : "max-w-5xl px-3 sm:px-6 py-4 space-y-3"
        }`}
      >
        {/* Compact Chapter Banner */}
        <div
          className={`relative overflow-hidden bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-center shadow-md ${
            isCompact ? "rounded-xl p-3 sm:p-4" : "rounded-2xl p-5"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Surah Title Calligraphy & English */}
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <h1
              className={`font-arabic text-[var(--foreground)] py-0.5 ${
                isCompact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
              }`}
              dir="rtl"
            >
              سُورَةُ {chapter.name_arabic}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--foreground)]">
              Surah {chapter.name_simple} &bull;{" "}
              <span className="text-emerald-400 font-normal">{chapter.translated_name.name}</span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--muted-foreground,#8e9b94)] pt-0.5">
              <span className="capitalize px-2 py-0.2 rounded-md bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
                {chapter.revelation_place}
              </span>
              <span>&bull;</span>
              <span>{chapter.verses_count} Ayahs</span>
              <span>&bull;</span>
              <span>Juz {chapter.pages?.[0] ? Math.ceil(chapter.pages[0] / 20) : 1}</span>
            </div>
          </div>

          {/* Bismillah Decoration */}
          {showBismillah && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle,#1a2621)]">
              <div
                className={`font-arabic text-emerald-400/90 leading-relaxed ${
                  isCompact ? "text-xl sm:text-2xl" : "text-2xl"
                }`}
                dir="rtl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
              <p className="text-[10px] text-[var(--muted-foreground,#8e9b94)] mt-0.5">
                In the Name of Allah—the Most Compassionate, Most Merciful
              </p>
            </div>
          )}
        </div>

        {/* Verses Stream */}
        <div className={`space-y-2 ${isCompact ? "space-y-1.5" : "space-y-3"}`}>
          {verses.map((verse) => (
            <VerseItem
              key={verse.verse_key}
              verse={verse}
              chapterName={chapter.name_simple}
              allVersesInSurah={verses}
              onOpenTafsir={handleOpenTafsir}
              readingMode={readingMode}
            />
          ))}
        </div>

        {/* Load More Pagination */}
        {currentPage < totalPages && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={loadMoreVerses}
              disabled={loadingMore}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading Ayahs...
                </>
              ) : (
                `Load More Ayahs (${verses.length} of ${chapter.verses_count})`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Dedicated Spacious Tafseer Modal Dialog */}
      {tafsirAyahKey && (
        <TafsirModal
          isOpen={!!tafsirAyahKey}
          onClose={() => setTafsirAyahKey(null)}
          verseKey={tafsirAyahKey}
          arabicText={tafsirArabicText}
        />
      )}
    </div>
  );
}
