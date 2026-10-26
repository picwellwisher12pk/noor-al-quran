"use client";

import React from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { APP_CONFIG } from "@/config/version";
import { useLearningStore } from "@/store/useLearningStore";
import {
  Play,
  Pause,
  Volume2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Flame,
  Zap,
  Heart,
} from "lucide-react";

export function DesktopStatusBar() {
  const { chapters, activeChapterId, activeAyahNumber } = useDesktopWorkspace();
  const { isPlaying, currentVerseKey, togglePlayPause, currentReciter } = useAudio();
  const { plan, targetInfo } = useKhatmah();
  const { prefs } = useReadingPreferences();
  const {
    totalXP,
    barakahGems,
    currentStreak,
    hearts,
    syncHearts,
    getHeartCount,
  } = useLearningStore();

  const [heartCountdown, setHeartCountdown] = React.useState<string>("");
  const HEART_REGEN_INTERVAL_MS = 30 * 60 * 1000;

  React.useEffect(() => {
    syncHearts();
    const updateCountdown = () => {
      syncHearts();
      if (hearts.current < hearts.max) {
        const elapsed = Date.now() - hearts.lastRegenTimestamp;
        const remainder = HEART_REGEN_INTERVAL_MS - (elapsed % HEART_REGEN_INTERVAL_MS);
        const mins = Math.max(1, Math.ceil(remainder / 60000));
        setHeartCountdown(`${mins}m`);
      } else {
        setHeartCountdown("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 15000);
    return () => clearInterval(interval);
  }, [hearts.current, hearts.lastRegenTimestamp, hearts.max, syncHearts]);

  const currentHearts = getHeartCount();
  const activeChapter = chapters.find((c) => c.id === activeChapterId);
  const reciterName = currentReciter?.reciter_name || "Mishari Rashid";

  return (
    <footer className="h-7 w-full flex-none flex items-center justify-between px-3 bg-[var(--surface-sunken)] border-t border-[var(--border-subtle)] select-none z-40 text-[11px] text-[var(--muted-foreground)] font-mono">
      {/* Left: Active Reading Position */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[var(--foreground)]">
          <BookOpen className="h-3 w-3 text-emerald-400" />
          <span className="font-semibold">
            {activeChapter ? `${activeChapter.id}. ${activeChapter.name_simple}` : "Al-Fatihah"}
          </span>
          <span>: Ayah {activeAyahNumber || 1}</span>
        </div>

        <span className="text-[var(--border-subtle)]">|</span>

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
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[var(--surface-card)] text-[var(--foreground)] hover:text-emerald-400 transition-colors"
          title={isPlaying ? "Pause Recitation (Space)" : "Play Recitation (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 text-emerald-400" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {isPlaying ? `Playing: ${currentVerseKey || "Verse"}` : (reciterName || "Reciter").split(" ")[0]}
          </span>
        </button>
      </div>

      {/* Center-Right: Learning Gamification Economy & Heart Pool */}
      <div className="hidden lg:flex items-center gap-2 text-[10px]">
        {/* Streak */}
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
            currentStreak > 0
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-[var(--muted-foreground)]"
          }`}
          title="Daily Istiqamah Streak (Active Days)"
        >
          <Flame className="h-3 w-3 text-amber-400" />
          <span>{currentStreak}d</span>
        </span>

        {/* XP */}
        <span
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-purple-400 bg-purple-500/10 border border-purple-500/20"
          title="Total Experience Points"
        >
          <Zap className="h-3 w-3 text-purple-400" />
          <span>{totalXP.toLocaleString()} XP</span>
        </span>

        {/* Gems */}
        <span
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-blue-400 bg-blue-500/10 border border-blue-500/20"
          title="Barakah Gems"
        >
          <Sparkles className="h-3 w-3 text-blue-400" />
          <span>{barakahGems}</span>
        </span>

        {/* Hearts + Live Regeneration Countdown */}
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
            currentHearts <= 1
              ? "text-rose-400 bg-rose-500/20 border border-rose-500/30 animate-pulse"
              : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
          }`}
          title={heartCountdown ? `Regenerating heart in ~${heartCountdown}` : "Hearts full (5/5)"}
        >
          <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
          <span>
            {currentHearts}/5{heartCountdown ? ` · ${heartCountdown}` : ""}
          </span>
        </span>
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

        <span className="hidden md:inline text-[var(--border-subtle)]">|</span>

        {/* Font Info */}
        <span className="hidden sm:inline capitalize">
          {prefs.arabicFont} ({prefs.arabicFontSize}px)
        </span>

        <span className="text-[var(--border-subtle)]">|</span>

        {/* App Version */}
        <span className="text-emerald-400/80">v{APP_CONFIG.version}</span>
      </div>
    </footer>
  );
}
