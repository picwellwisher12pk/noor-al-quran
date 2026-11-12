"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chapter, Verse } from "@/types/quran";
import { fetchVersesByChapter } from "@/services/quranApi";
import { VerseItem } from "./VerseItem";
import { VerseScrollNavigator } from "./VerseScrollNavigator";
import { TafsirModal } from "@/components/modals/TafsirModal";
import { useBookmarks } from "@/context/BookmarksContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { DesktopToolbar } from "@/components/desktop/DesktopToolbar";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowUp, History, X } from "lucide-react";

interface SurahReaderProps {
  chapter: Chapter;
  initialVerses: Verse[];
  totalPages: number;
}

export function SurahReader({ chapter, initialVerses, totalPages }: SurahReaderProps) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [jumpingToAyah, setJumpingToAyah] = useState<number | null>(null);
  const [dismissResumeBanner, setDismissResumeBanner] = useState(false);
  const [tafsirAyahKey, setTafsirAyahKey] = useState<string | null>(null);
  const [tafsirArabicText, setTafsirArabicText] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasUserScrolledRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const versesRef = useRef<Verse[]>(verses);
  const currentPageRef = useRef<number>(currentPage);

  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const searchParams = useSearchParams();
  const targetAyah = searchParams.get("ayah");
  const { lastRead } = useBookmarks();
  const { plan, targetInfo } = useKhatmah();
  const { prefs } = useReadingPreferences();
  const { isUrdu } = useLanguage();
  const { setActiveChapterId, setActiveAyahNumber, activeAyahNumber, readingMode } = useDesktopWorkspace();
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

  // Scroll smoothly to an ayah, loading any missing pages first if needed
  const jumpToAyah = useCallback(
    async (ayahNum: number) => {
      if (isNaN(ayahNum) || ayahNum < 1 || ayahNum > chapter.verses_count) return;

      const neededPage = Math.min(totalPages, Math.ceil(ayahNum / 50));
      const loadedPage = currentPageRef.current;

      isProgrammaticScrollRef.current = true;
      setJumpingToAyah(ayahNum);

      try {
        if (neededPage > loadedPage) {
          const pagesToFetch = Array.from(
            { length: neededPage - loadedPage },
            (_, idx) => loadedPage + 1 + idx
          );
          const results = await Promise.all(
            pagesToFetch.map((p) =>
              fetchVersesByChapter(chapter.id, p, 50, 20, prefs.selectedUrduTranslationId)
            )
          );

          const newlyFetched = results.flatMap((r) => r.verses || []);
          if (newlyFetched.length > 0) {
            setVerses((prev) => {
              const seen = new Set(prev.map((v) => v.verse_key));
              const merged = [...prev];
              for (const v of newlyFetched) {
                if (!seen.has(v.verse_key)) {
                  seen.add(v.verse_key);
                  merged.push(v);
                }
              }
              return merged;
            });
            setCurrentPage(neededPage);
          }
        }

        // Wait for DOM to paint newly loaded verses before scrolling
        setTimeout(() => {
          const el = document.getElementById(`ayah-${ayahNum}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          setActiveAyahNumber(ayahNum);

          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            setJumpingToAyah(null);
          }, 700);
        }, 120);
      } catch (err) {
        console.error("Failed to jump to ayah:", err);
        isProgrammaticScrollRef.current = false;
        setJumpingToAyah(null);
      }
    },
    [chapter.id, chapter.verses_count, totalPages, prefs.selectedUrduTranslationId, setActiveAyahNumber]
  );

  // Handle jump to ayah on initial load or query param change
  useEffect(() => {
    if (targetAyah) {
      const num = Number(targetAyah);
      if (!isNaN(num) && num >= 1) {
        const timer = setTimeout(() => {
          jumpToAyah(num);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [targetAyah, jumpToAyah]);

  // Track scroll container for Scroll-to-Top visibility and user-scroll activation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isProgrammaticScrollRef.current) {
        hasUserScrolledRef.current = true;
      }
      setShowScrollTop(container.scrollTop > 400);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Track visible Ayah in status bar without overwriting the user's saved resume point
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || verses.length === 0) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const visibleAyahs = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const num = Number((entry.target as HTMLElement).dataset.ayahNumber);
          if (!isNaN(num)) {
            if (entry.isIntersecting) {
              visibleAyahs.add(num);
            } else {
              visibleAyahs.delete(num);
            }
          }
        }

        if (!hasUserScrolledRef.current || isProgrammaticScrollRef.current) return;
        if (visibleAyahs.size === 0) return;

        const topVisibleAyah = Math.min(...Array.from(visibleAyahs));
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          setActiveAyahNumber(topVisibleAyah);
        }, 400);
      },
      {
        root: container,
        rootMargin: "-15% 0px -65% 0px",
        threshold: 0.05,
      }
    );

    const elements = container.querySelectorAll("[data-ayah-number]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [verses, setActiveAyahNumber]);

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
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Surah 1 (Al-Fatihah) and Surah 9 (At-Tawbah) bismillah rules
  const showBismillah = chapter.id !== 1 && chapter.id !== 9;
  const isCompact = readingMode === "compact";
  const showSameSurahResume =
    !targetAyah &&
    !dismissResumeBanner &&
    lastRead &&
    lastRead.chapterId === chapter.id &&
    lastRead.verseNumber > 1 &&
    jumpingToAyah === null;

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      {/* Desktop Sticky Workspace Toolbar */}
      <DesktopToolbar
        chapterId={chapter.id}
        chapterName={chapter.name_simple}
        chapterArabic={chapter.name_arabic}
        totalAyahs={chapter.verses_count}
        verses={verses}
        onJumpToAyah={jumpToAyah}
      />

      {/* Reading Canvas Container */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto w-full mx-auto pb-24 ${
          isCompact ? "max-w-4xl px-2 sm:px-4 py-2 space-y-2 pr-10 sm:pr-12" : "max-w-5xl px-3 sm:px-6 py-4 space-y-3 pr-10 sm:pr-12"
        }`}
      >
        {/* Jumping to Ayah Loading Banner */}
        {jumpingToAyah !== null && (
          <div className="sticky top-2 z-20 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-lg">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>
                {isUrdu ? `آیت ${jumpingToAyah} پر جا رہے ہیں...` : `Jumping to Ayah ${jumpingToAyah}...`}
              </span>
            </div>
          </div>
        )}

        {/* Same-Surah Resume Banner */}
        {showSameSurahResume && lastRead && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/30 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-medium">
              <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isUrdu
                  ? `آپ نے آخری بار آیت ${lastRead.verseNumber} پر تلاوت روکی تھی`
                  : `You last stopped at Ayah ${lastRead.verseNumber}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDismissResumeBanner(true);
                  jumpToAyah(lastRead.verseNumber);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
              >
                {isUrdu ? "وہیں سے جاری رکھیں" : "Resume"}
              </button>
              <button
                type="button"
                onClick={() => setDismissResumeBanner(true)}
                aria-label="Dismiss resume banner"
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        {/* Compact Chapter Banner */}
        <div
          className={`relative overflow-hidden bg-[var(--surface-raised)] border border-[var(--card-border)] text-center shadow-md ${
            isCompact ? "rounded-xl p-3 sm:p-4" : "rounded-2xl p-5"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Surah Title Calligraphy & Translations */}
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <h1
              className={`font-arabic text-[var(--foreground)] py-0.5 ${
                isCompact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
              }`}
              dir="rtl"
            >
              سُورَةُ {chapter.name_arabic}
            </h1>

            {/* Subtitle / Meaning: Urdu-only when Urdu is selected, else English */}
            {isUrdu ? (
              <h2 className="text-xs sm:text-sm font-urdu font-semibold text-[var(--foreground)]" dir="rtl">
                سورت {chapter.name_arabic} {chapter.translated_name_urdu?.name ? `• ${chapter.translated_name_urdu.name}` : ""}
              </h2>
            ) : (
              <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--foreground)]">
                Surah {chapter.name_simple} &bull;{" "}
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">{chapter.translated_name.name}</span>
              </h2>
            )}

            {/* Metadata Badges: Urdu-only when Urdu is selected, else English */}
            {isUrdu ? (
              <div className="flex items-center gap-2 text-[11px] font-urdu text-[var(--muted-foreground)] pt-0.5" dir="rtl">
                <span className="px-2 py-0.2 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] font-medium">
                  {chapter.revelation_place === "makkah" ? "مکیہ" : "مدنیہ"}
                </span>
                <span>&bull;</span>
                <span>{chapter.verses_count} آیات</span>
                <span>&bull;</span>
                <span>پارہ {chapter.pages?.[0] ? Math.ceil(chapter.pages[0] / 20) : 1}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] pt-0.5">
                <span className="capitalize px-2 py-0.2 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] font-medium">
                  {chapter.revelation_place}
                </span>
                <span>&bull;</span>
                <span>{chapter.verses_count} Ayahs</span>
                <span>&bull;</span>
                <span>Juz {chapter.pages?.[0] ? Math.ceil(chapter.pages[0] / 20) : 1}</span>
              </div>
            )}
          </div>

          {/* Bismillah Decoration */}
          {showBismillah && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
              <div
                className={`font-arabic text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed ${
                  isCompact ? "text-xl sm:text-2xl" : "text-2xl"
                }`}
                dir="rtl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>
              {isUrdu ? (
                <p className="text-[12px] font-urdu text-[var(--urdu-color)] mt-0.5" dir="rtl">
                  شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                </p>
              ) : (
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  In the Name of Allah—the Most Compassionate, Most Merciful
                </p>
              )}
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
              chapterArabic={chapter.name_arabic}
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

      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-14 right-6 z-30 p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all cursor-pointer"
          title={isUrdu ? "اوپر جائیں" : "Scroll to Top"}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* Verse Milestone Scroll Navigator alongside the scrollbar */}
      {chapter.verses_count > 1 && (
        <VerseScrollNavigator
          totalVerses={chapter.verses_count}
          currentVerse={activeAyahNumber || 1}
          onSelectVerse={(ayahNum) => jumpToAyah(ayahNum)}
          isUrdu={isUrdu}
        />
      )}

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
