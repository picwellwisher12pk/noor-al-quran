"use client";

import React, { useMemo, useState, useRef } from "react";
import { SAJDAH_VERSES } from "@/utils/quranMeta";

interface VerseScrollNavigatorProps {
  totalVerses: number;
  currentVerse: number;
  onSelectVerse: (verseNumber: number) => void;
  chapterId?: number;
  isUrdu?: boolean;
}

export function VerseScrollNavigator({
  totalVerses,
  currentVerse,
  onSelectVerse,
  chapterId,
  isUrdu = false,
}: VerseScrollNavigatorProps) {
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number>(0);
  const [scrubPreviewAyah, setScrubPreviewAyah] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Determine tick interval dynamically based on total verses in the Surah
  const step = useMemo(() => {
    if (totalVerses <= 12) return 1;
    if (totalVerses <= 30) return 2;
    if (totalVerses <= 60) return 5;
    if (totalVerses <= 120) return 10;
    if (totalVerses <= 200) return 15;
    return 20;
  }, [totalVerses]);

  // Generate milestone ticks:
  // Starts with 1. Intermediate ticks at round multiples of step. Always ends with totalVerses.
  // Avoids adding a milestone tick too close to totalVerses to prevent visual collisions.
  const ticks = useMemo(() => {
    if (totalVerses <= 1) return [1];
    if (totalVerses <= 12) {
      return Array.from({ length: totalVerses }, (_, i) => i + 1);
    }

    const list: number[] = [1];
    let current = step;
    while (current < totalVerses) {
      // Don't place a tick too close to the end (at least 45% of step away from totalVerses)
      if (totalVerses - current >= Math.max(2, Math.floor(step * 0.45))) {
        list.push(current);
      }
      current += step;
    }
    if (list[list.length - 1] !== totalVerses) {
      list.push(totalVerses);
    }
    return list;
  }, [totalVerses, step]);

  const calculateAyahFromY = (clientY: number): { ayah: number; relativeY: number } => {
    if (!trackRef.current) return { ayah: 1, relativeY: 0 };
    const rect = trackRef.current.getBoundingClientRect();
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const ratio = rect.height > 0 ? clampedY / rect.height : 0;
    const ayah = Math.max(1, Math.min(totalVerses, Math.round(1 + ratio * (totalVerses - 1))));
    return { ayah, relativeY: clampedY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { ayah, relativeY } = calculateAyahFromY(e.clientY);
    setScrubPreviewAyah(ayah);
    setHoveredAyah(ayah);
    setHoverY(relativeY);
    onSelectVerse(ayah);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { ayah, relativeY } = calculateAyahFromY(e.clientY);
    setHoverY(relativeY);
    setHoveredAyah(ayah);
    if (isDraggingRef.current) {
      setScrubPreviewAyah(ayah);
      onSelectVerse(ayah);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      setScrubPreviewAyah(null);
    }
  };

  // Current active verse indicator position (0% to 100%)
  const activePercent = useMemo(() => {
    if (totalVerses <= 1) return 0;
    return Math.max(0, Math.min(100, ((currentVerse - 1) / (totalVerses - 1)) * 100));
  }, [currentVerse, totalVerses]);

  const sajdahVersesInSurah = useMemo(() => {
    if (!chapterId) return [];
    return Object.values(SAJDAH_VERSES).filter((s) => s.chapterId === chapterId);
  }, [chapterId]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (!isDraggingRef.current) {
          setHoveredAyah(null);
          setScrubPreviewAyah(null);
        }
      }}
      className="hidden sm:flex absolute right-0.5 sm:right-1 top-14 bottom-6 w-9 z-20 flex-col items-center select-none py-3 pointer-events-auto cursor-ns-resize group"
      aria-label="Quran Verse Scroll Navigator"
    >
      {/* Inner Track Rail Area: defines the exact 0% to 100% active coordinate range */}
      <div ref={trackRef} className="relative w-full h-full">
        {/* Background Track Rail: Simple thin single line from top (0%) to bottom (100%) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[var(--border-subtle)] group-hover:bg-emerald-500/40 transition-colors pointer-events-none" />

        {/* Active Position Indicator Dot on the Rail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-sm ring-2 ring-[var(--surface-raised)] transition-all duration-150 pointer-events-none z-10"
          style={{ top: `${activePercent}%` }}
          title={isUrdu ? `موجودہ آیت ${currentVerse}` : `Current Ayah ${currentVerse}`}
        />

        {/* Sajdah Markers on Rail */}
        {sajdahVersesInSurah.map((s) => {
          const sajdahPercent =
            totalVerses <= 1
              ? 0
              : Math.max(0, Math.min(100, ((s.verseNumber - 1) / (totalVerses - 1)) * 100));
          return (
            <button
              key={s.verseKey}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVerse(s.verseNumber);
              }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-400 font-arabic font-bold text-xs pointer-events-auto cursor-pointer z-10 transition-transform hover:scale-125 select-none"
              style={{ top: `${sajdahPercent}%` }}
              title={
                isUrdu
                  ? `آیتِ سجدہ نمبر ${s.sajdahNumber} (آیت ${s.verseNumber})`
                  : `Ayah of Sajdah #${s.sajdahNumber} (Ayah ${s.verseNumber})`
              }
            >
              ۩
            </button>
          );
        })}

        {/* Numbered Milestone Cues positioned precisely along the true percentage rail */}
        {ticks.map((num) => {
          const isExact = num === currentVerse;
          const tickPercent =
            totalVerses <= 1 ? 0 : Math.max(0, Math.min(100, ((num - 1) / (totalVerses - 1)) * 100));
          return (
            <button
              key={num}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVerse(num);
              }}
              className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto px-1 py-0.5 rounded font-mono text-[9px] font-bold transition-all cursor-pointer select-none ${
                isExact
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold scale-110 bg-[var(--surface-raised)] shadow-xs ring-1 ring-emerald-500/40 z-20"
                  : "text-[var(--muted-foreground)] hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-[var(--surface-card)] z-0"
              }`}
              style={{ top: `${tickPercent}%` }}
              title={isUrdu ? `آیت ${num}` : `Jump to Ayah ${num}`}
            >
              {num}
            </button>
          );
        })}

        {/* Floating Hover / Scrub Ayah Bubble Indicator */}
        {(hoveredAyah !== null || scrubPreviewAyah !== null) && (
          <div
            className="absolute right-10 -translate-y-1/2 pointer-events-none z-30 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white shadow-xl text-xs font-semibold whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
            style={{ top: `${hoverY}px` }}
          >
            <span>
              {isUrdu
                ? `آیت ${hoveredAyah || scrubPreviewAyah}`
                : `Ayah ${hoveredAyah || scrubPreviewAyah}`}
            </span>
            <span className="text-[10px] opacity-75">/ {totalVerses}</span>
            {/* Arrow pointing right towards the scroll rail */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-emerald-700 dark:bg-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}
