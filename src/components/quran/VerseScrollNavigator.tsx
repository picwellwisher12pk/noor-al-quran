"use client";

import React, { useMemo, useState, useRef } from "react";

interface VerseScrollNavigatorProps {
  totalVerses: number;
  currentVerse: number;
  onSelectVerse: (verseNumber: number) => void;
  isUrdu?: boolean;
}

export function VerseScrollNavigator({
  totalVerses,
  currentVerse,
  onSelectVerse,
  isUrdu = false,
}: VerseScrollNavigatorProps) {
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number>(0);
  const [scrubPreviewAyah, setScrubPreviewAyah] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Determine tick interval dynamically based on total verses in the Surah
  // e.g. Al-Kawthar (3 verses) -> step 1
  // Al-Ikhlas (4 verses) -> step 1
  // Al-Fatihah (7 verses) -> step 1
  // Yasin (83 verses) -> step 5
  // Al-Baqarah (286 verses) -> step 10 or 15
  const step = useMemo(() => {
    if (totalVerses <= 12) return 1;
    if (totalVerses <= 30) return 2;
    if (totalVerses <= 60) return 5;
    if (totalVerses <= 120) return 10;
    if (totalVerses <= 200) return 15;
    return 20;
  }, [totalVerses]);

  // Generate milestone ticks: always include 1 and the last verse
  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= totalVerses; i += step) {
      list.push(i);
    }
    if (list[list.length - 1] !== totalVerses) {
      list.push(totalVerses);
    }
    return list;
  }, [totalVerses, step]);

  const calculateAyahFromY = (clientY: number): { ayah: number; relativeY: number } => {
    if (!navRef.current) return { ayah: 1, relativeY: 0 };
    const rect = navRef.current.getBoundingClientRect();
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

  return (
    <div
      ref={navRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (!isDraggingRef.current) {
          setHoveredAyah(null);
          setScrubPreviewAyah(null);
        }
      }}
      className="hidden sm:flex absolute right-0.5 sm:right-1 top-14 bottom-6 w-9 z-20 flex-col items-center justify-between select-none py-2 pointer-events-auto cursor-ns-resize group"
      aria-label="Quran Verse Scroll Navigator"
    >
      {/* Background Track Rail: Simple thin single line */}
      <div className="absolute top-2 bottom-2 w-px bg-[var(--border-subtle)] group-hover:bg-emerald-500/40 transition-colors pointer-events-none" />

      {/* Active Position Indicator Dot on the Rail */}
      <div
        className="absolute w-2 h-2 -translate-x-1/2 left-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-xs ring-1 ring-[var(--surface-raised)] transition-all duration-150 pointer-events-none z-10"
        style={{ top: `calc(${activePercent}% + 4px)` }}
      />

      {/* Numbered Milestone Cues */}
      <div className="w-full h-full flex flex-col justify-between items-center relative pointer-events-none z-0">
        {ticks.map((num) => {
          const isExact = num === currentVerse;
          return (
            <button
              key={num}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVerse(num);
              }}
              className={`pointer-events-auto px-1 py-0.2 rounded font-mono text-[9px] font-bold transition-all cursor-pointer ${
                isExact
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold scale-110"
                  : "text-[var(--muted-foreground)] hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-[var(--surface-card)]"
              }`}
              title={isUrdu ? `آیت ${num}` : `Jump to Ayah ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Floating Hover / Scrub Ayah Bubble Indicator */}
      {(hoveredAyah !== null || scrubPreviewAyah !== null) && (
        <div
          className="absolute right-10 -translate-y-1/2 pointer-events-none z-30 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white shadow-xl text-xs font-semibold whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          style={{ top: `${hoverY}px` }}
        >
          <span>{isUrdu ? `آیت ${hoveredAyah || scrubPreviewAyah}` : `Ayah ${hoveredAyah || scrubPreviewAyah}`}</span>
          <span className="text-[10px] opacity-75">/ {totalVerses}</span>
          {/* Arrow pointing right towards the scroll rail */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-emerald-700 dark:bg-emerald-600" />
        </div>
      )}
    </div>
  );
}
