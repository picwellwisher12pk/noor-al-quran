"use client";

import React from "react";
import { useAudio, RepeatMode } from "@/context/AudioContext";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  Volume2,
  X,
  Gauge,
  Loader2,
} from "lucide-react";

export function AudioPlayerBar() {
  const {
    isPlaying,
    isLoading,
    isPlayingTranslation,
    isTranslationLoading,
    currentVerseKey,
    currentReciter,
    currentTime,
    duration,
    translationCurrentTime,
    translationDuration,
    playbackRate,
    repeatMode,
    togglePlayPause,
    toggleTranslationPlayPause,
    playNextVerse,
    playPreviousVerse,
    seek,
    seekTranslation,
    setPlaybackRate,
    setRepeatMode,
    stopAudio,
  } = useAudio();

  if (!currentVerseKey && !isPlaying && !isPlayingTranslation) return null;

  const activeCurrentTime = isPlayingTranslation ? translationCurrentTime : currentTime;
  const activeDuration = isPlayingTranslation ? translationDuration : duration;
  const activeLoading = isPlayingTranslation ? isTranslationLoading : isLoading;
  const activePlaying = isPlaying || isPlayingTranslation;

  const handleActiveToggle = () => {
    if (isPlayingTranslation) {
      toggleTranslationPlayPause();
    } else {
      togglePlayPause();
    }
  };

  const handleSeek = (time: number) => {
    if (isPlayingTranslation) {
      seekTranslation(time);
    } else {
      seek(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ["none", "verse", "infinite"];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--surface-raised)]/95 backdrop-blur-md border-t border-[var(--card-border)] px-4 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
            <Volume2 className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-[var(--foreground)] truncate">
              Ayah {currentVerseKey}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] truncate">
              <span>{currentReciter ? currentReciter.reciter_name : "Reciter"}</span>
              <button
                type="button"
                onClick={toggleTranslationPlayPause}
                className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full border transition-all cursor-pointer ${
                  isPlayingTranslation
                    ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/40 font-bold"
                    : "bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-teal-600 border-[var(--border-subtle)]"
                }`}
                title={isPlayingTranslation ? "Translation playing (click to pause)" : "Click to play translation audio"}
              >
                {isPlayingTranslation ? "🗣️ Translation Audio" : "Play Translation"}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={playPreviousVerse}
              aria-label="Previous verse"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleActiveToggle}
              disabled={activeLoading}
              aria-label={activePlaying ? "Pause" : "Play"}
              className={`h-10 w-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 ${
                isPlayingTranslation
                  ? "bg-[var(--accent,oklch(60%_0.14_195))] hover:bg-[var(--accent,oklch(60%_0.14_195))]/80"
                  : "bg-[var(--primary)] hover:bg-[var(--primary)]/80"
              }`}
            >
              {activeLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : activePlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNextVerse}
              aria-label="Next verse"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Time Scrubber (Ultra-Thin 2.5px) */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] w-8 text-right">
              {formatTime(activeCurrentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={activeDuration || 100}
              value={activeCurrentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className={`w-full h-[2.5px] bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer transition-colors accent-[var(--primary)]`}
            />
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] w-8">
              {formatTime(activeDuration)}
            </span>
          </div>
        </div>

        {/* Right: Loop, Speed, Close */}
        <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
          <button
            type="button"
            onClick={cycleRepeatMode}
            title={
              repeatMode === "none"
                ? "Repeat: Off"
                : repeatMode === "verse"
                ? "Repeat: Loop 3x for Memorization"
                : "Repeat: Infinite"
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              repeatMode !== "none"
                ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {repeatMode === "verse" ? (
              <>
                <Repeat1 className="h-3.5 w-3.5" />
                <span className="text-[10px]">3x</span>
              </>
            ) : repeatMode === "infinite" ? (
              <>
                <Repeat className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span className="text-[10px]">∞</span>
              </>
            ) : (
              <Repeat className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={cyclePlaybackRate}
            title="Playback Speed"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono">{playbackRate}x</span>
          </button>

          <button
            type="button"
            onClick={stopAudio}
            aria-label="Close audio player"
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
