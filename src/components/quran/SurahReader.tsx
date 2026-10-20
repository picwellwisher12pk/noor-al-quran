"use client";

import React, { useState, useEffect } from "react";
import { Chapter, Verse } from "@/types/quran";
import { fetchVersesByChapter } from "@/services/quranApi";
import { VerseItem } from "./VerseItem";
import { TafsirModal } from "@/components/modals/TafsirModal";
import { useBookmarks } from "@/context/BookmarksContext";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, ArrowUp } from "lucide-react";
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
  }, [chapter, targetAyah, setLastReadPosition]);

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
      const res = await fetchVersesByChapter(chapter.id, nextPage, 50);
      setVerses((prev) => [...prev, ...res.verses]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error("Failed to load more verses:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpenTafsir = (verseKey: string, arabicText: string) => {
    setTafsirAyahKey(verseKey);
    setTafsirArabicText(arabicText);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Surah 1 (Al-Fatihah) and Surah 9 (At-Tawbah) bismillah rules
  const showBismillah = chapter.id !== 1 && chapter.id !== 9;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Chapter Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] p-6 md:p-8 text-center shadow-xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Previous & Next Navigation */}
        <div className="flex items-center justify-between mb-4">
          {chapter.id > 1 ? (
            <Link
              href={`/surah/${chapter.id - 1}`}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Surah
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground,#8e9b94)]">
            <span className="capitalize px-2.5 py-0.5 rounded-full bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
              {chapter.revelation_place}
            </span>
            <span>•</span>
            <span>{chapter.verses_count} Ayahs</span>
          </div>

          {chapter.id < 114 ? (
            <Link
              href={`/surah/${chapter.id + 1}`}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]"
            >
              Next Surah <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Surah Title */}
        <h1 className="font-arabic text-4xl md:text-5xl text-[var(--foreground)] mb-3">
          {chapter.name_arabic}
        </h1>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {chapter.name_simple}
        </h2>
        <p className="text-sm text-emerald-400 mt-1">
          {chapter.translated_name.name}
        </p>

        {/* Bismillah Decoration */}
        {showBismillah && (
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle,#1a2621)]">
            <div className="font-arabic text-2xl md:text-3xl text-emerald-400/90 leading-relaxed" dir="rtl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
            <p className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-2">
              In the Name of Allah—the Most Compassionate, Most Merciful
            </p>
          </div>
        )}
      </div>

      {/* Verses List */}
      <div className="space-y-4">
        {verses.map((verse) => (
          <VerseItem
            key={verse.verse_key}
            verse={verse}
            chapterName={chapter.name_simple}
            allVersesInSurah={verses}
            onOpenTafsir={handleOpenTafsir}
          />
        ))}
      </div>

      {/* Pagination / Load More */}
      {currentPage < totalPages && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={loadMoreVerses}
            disabled={loadingMore}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading remaining ayahs...
              </>
            ) : (
              `Load More Ayahs (${verses.length} of ${chapter.verses_count})`
            )}
          </button>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-6 z-30 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition-all"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Tafsir Modal */}
      <TafsirModal
        isOpen={!!tafsirAyahKey}
        onClose={() => setTafsirAyahKey(null)}
        verseKey={tafsirAyahKey}
        arabicText={tafsirArabicText}
      />
    </div>
  );
}
