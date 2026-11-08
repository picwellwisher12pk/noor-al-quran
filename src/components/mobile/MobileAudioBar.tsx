"use client";

import React, { useState } from "react";
import { useAudio, RepeatMode } from "@/context/AudioContext";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  X,
  Gauge,
  Repeat,
  Repeat1,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

export function MobileAudioBar() {
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
    reciters,
    setReciter,
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentVerseKey && !isPlaying) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
    <>
      {/* 1. Collapsed Mini Player Bar */}
      <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 bg-[var(--surface-raised)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] shadow-lg select-none">
        {/* Progress Line */}
        <div className="w-full h-1 bg-[var(--surface-card)] overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="h-13 px-3.5 flex items-center justify-between gap-2">
          {/* Left: Ayah info & Tap to expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
          >
            <div className="flex-none h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Volume2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] truncate">
                Ayah {currentVerseKey}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                {currentReciter?.reciter_name || "Reciter"}
              </div>
            </div>
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 flex-none">
            <button
              type="button"
              onClick={playPreviousVerse}
              aria-label="Previous Ayah"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNextVerse}
              aria-label="Next Ayah"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-label="Expand player settings"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={stopAudio}
              aria-label="Stop audio"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Expanded Audio Sheet */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Sheet */}
          <div className="relative w-full bg-[var(--modal-bg)] rounded-t-3xl border-t border-[var(--card-border)] shadow-2xl p-5 space-y-5 z-10 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">
                  Audio Studio &amp; Reciter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Currently Playing Track */}
            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-[var(--foreground)]">
                Ayah {currentVerseKey}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {currentReciter?.reciter_name} ({currentReciter?.style})
              </div>
            </div>

            {/* Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={playPreviousVerse}
                className="p-2.5 rounded-full text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)]"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={playNextVerse}
                className="p-2.5 rounded-full text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)]"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Secondary Controls: Repeat, Speed */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  repeatMode !== "none"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-[var(--border-subtle)] text-[var(--muted-foreground)]"
                }`}
              >
                {repeatMode === "verse" ? (
                  <>
                    <Repeat1 className="h-4 w-4" />
                    <span>3x Memorize</span>
                  </>
                ) : repeatMode === "infinite" ? (
                  <>
                    <Repeat className="h-4 w-4 text-emerald-400" />
                    <span>Infinite</span>
                  </>
                ) : (
                  <>
                    <Repeat className="h-4 w-4" />
                    <span>Repeat Off</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] text-[var(--foreground)]"
              >
                <Gauge className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>{playbackRate}x Speed</span>
              </button>
            </div>

            {/* Reciter Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                Change Reciter
              </label>
              <select
                value={currentReciter?.id}
                onChange={(e) => {
                  const r = reciters.find((rec) => rec.id === Number(e.target.value));
                  if (r) setReciter(r);
                }}
                className="w-full p-2.5 rounded-xl text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reciter_name} ({r.style})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

