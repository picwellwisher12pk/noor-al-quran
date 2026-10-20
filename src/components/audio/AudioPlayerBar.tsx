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
    currentVerseKey,
    currentReciter,
    currentTime,
    duration,
    playbackRate,
    repeatMode,
    togglePlayPause,
    playNextVerse,
    playPreviousVerse,
    seek,
    setPlaybackRate,
    setRepeatMode,
    stopAudio,
  } = useAudio();

  if (!currentVerseKey && !isPlaying) return null;

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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--surface-raised,#121a17)]/95 backdrop-blur-md border-t border-[var(--card-border,#1e2b25)] px-4 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Volume2 className="h-5 w-5" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-[var(--foreground)] truncate">
              Ayah {currentVerseKey}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground,#8e9b94)] truncate">
              {currentReciter ? currentReciter.reciter_name : "Reciter"}
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
              className="p-1.5 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg,#1f2924)] transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNextVerse}
              aria-label="Next verse"
              className="p-1.5 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg,#1f2924)] transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] font-mono text-[var(--muted-foreground,#8e9b94)] w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-[var(--card-border,#22332c)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] font-mono text-[var(--muted-foreground,#8e9b94)] w-8">
              {formatTime(duration)}
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
                ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                : "border-transparent text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
            }`}
          >
            {repeatMode === "verse" ? (
              <>
                <Repeat1 className="h-3.5 w-3.5" />
                <span className="text-[10px]">3x</span>
              </>
            ) : repeatMode === "infinite" ? (
              <>
                <Repeat className="h-3.5 w-3.5 text-emerald-400" />
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] transition-colors"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono">{playbackRate}x</span>
          </button>

          <button
            type="button"
            onClick={stopAudio}
            aria-label="Close audio player"
            className="p-1.5 rounded-lg text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg,#1f2924)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
