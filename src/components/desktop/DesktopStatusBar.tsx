"use client";

import React from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { APP_CONFIG } from "@/config/version";
import {
  Play,
  Pause,
  Volume2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";

export function DesktopStatusBar() {
  const { chapters, activeChapterId, activeAyahNumber } = useDesktopWorkspace();
  const { isPlaying, currentVerseKey, togglePlayPause, currentReciter } = useAudio();
  const { plan, targetInfo } = useKhatmah();
  const { prefs } = useReadingPreferences();

  const activeChapter = chapters.find((c) => c.id === activeChapterId);
  const reciterName = currentReciter?.reciter_name || "Mishari Rashid";

  return (
    <footer className="h-7 w-full flex-none flex items-center justify-between px-3 bg-[var(--surface-sunken,#0e1512)] border-t border-[var(--border-subtle,#1e2c26)] select-none z-40 text-[11px] text-[var(--muted-foreground,#8e9b94)] font-mono">
      {/* Left: Active Reading Position */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[var(--foreground)]">
          <BookOpen className="h-3 w-3 text-emerald-400" />
          <span className="font-semibold">
            {activeChapter ? `${activeChapter.id}. ${activeChapter.name_simple}` : "Al-Fatihah"}
          </span>
          <span>: Ayah {activeAyahNumber || 1}</span>
        </div>

        <span className="text-[var(--border-subtle,#24362e)]">|</span>

        <div className="hidden sm:flex items-center gap-2">
          <span>{activeChapter?.revelation_place || "makkah"}</span>
          <span>•</span>
          <span>{activeChapter?.verses_count || 7} Verses</span>
        </div>
      </div>

      {/* Center: Audio Quick Mini-Player */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayPause}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[var(--surface-card,#182520)] text-[var(--foreground)] hover:text-emerald-400 transition-colors"
          title={isPlaying ? "Pause Recitation (Space)" : "Play Recitation (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 text-emerald-400" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {isPlaying ? `Playing: ${currentVerseKey || "Verse"}` : reciterName.split(" ")[0]}
          </span>
        </button>
      </div>

      {/* Right: Khatmah & Specs */}
      <div className="flex items-center gap-3">
        {/* Khatmah Pace Badge */}
        {plan && targetInfo && (
          <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
            <Calendar className="h-3 w-3" />
            <span>
              Khatmah: Day {targetInfo.dayNumber}/{targetInfo.totalDays} ({targetInfo.percentageCompleted.toFixed(0)}%)
            </span>
          </div>
        )}

        <span className="hidden md:inline text-[var(--border-subtle,#24362e)]">|</span>

        {/* Font Info */}
        <span className="hidden sm:inline capitalize">
          {prefs.arabicFont} ({prefs.arabicFontSize}px)
        </span>

        <span className="text-[var(--border-subtle,#24362e)]">|</span>

        {/* App Version */}
        <span className="text-emerald-400/80">v{APP_CONFIG.version}</span>
      </div>
    </footer>
  );
}
