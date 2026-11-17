"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAudio, RepeatMode } from "@/context/AudioContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Gauge,
  Repeat,
  Repeat1,
  ChevronUp,
  ChevronDown,
  Loader2,
  BookOpen,
} from "lucide-react";

export function MobileAudioBar() {
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
    reciters,
    setReciter,
  } = useAudio();

  const { chapters } = useDesktopWorkspace();
  const pathname = usePathname();
  const isSurahReading = pathname?.startsWith("/surah") ?? false;

  const [isExpanded, setIsExpanded] = useState(false);
  const [loopFrom, setLoopFrom] = useState(1);
  const [loopTo, setLoopTo] = useState(1);

  if (!currentVerseKey && !isPlaying && !isPlayingTranslation) return null;

  // ── Verse key parsing ──────────────────────────────────────────────────────
  const [rawChapterId, rawVerseNum] = (currentVerseKey ?? "1:1").split(":");
  const chapterId = Number(rawChapterId) || 1;
  const verseNum = Number(rawVerseNum) || 1;
  const chapter = chapters.find((c) => c.id === chapterId);
  const surahName = chapter?.name_simple ?? `Surah ${chapterId}`;
  const versesCount = chapter?.verses_count ?? null;

  const activeCurrentTime = isPlayingTranslation ? translationCurrentTime : currentTime;
  const activeDuration = isPlayingTranslation ? translationDuration : duration;
  const activeLoading = isPlayingTranslation ? isTranslationLoading : isLoading;
  const activePlaying = isPlaying || isPlayingTranslation;

  const progressPercent = activeDuration > 0 ? (activeCurrentTime / activeDuration) * 100 : 0;

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

  // Reciter initials badge text
  const reciterInitials =
    currentReciter?.reciter_name?.slice(0, 2).toUpperCase() ?? "Q";

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
      {/* ── 1. Collapsed Mini Player Bar ─────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-x-0 z-30 bg-[var(--surface-raised)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] shadow-lg select-none ${
          isSurahReading
            ? "bottom-0 pb-[env(safe-area-inset-bottom,0px)]"
            : "bottom-[calc(56px+env(safe-area-inset-bottom,0px))]"
        }`}
      >
        {/* Progress Line (Ultra-Thin 2px) */}
        <div className="w-full h-[2px] bg-[var(--surface-card)] overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              isPlayingTranslation ? "bg-[var(--accent,teal)]" : "bg-[var(--primary)]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="h-13 px-3.5 flex items-center justify-between gap-2">
          {/* Left: Surah info & tap-to-expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left active:scale-95 transition-all"
          >
            {/* Reciter initials badge */}
            <div className="flex-none h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
              {reciterInitials}
            </div>

            <div className="min-w-0">
              {/* Primary: Surah name */}
              <div className="text-xs font-bold text-[var(--foreground)] truncate">
                {surahName}
              </div>
              {/* Secondary: Ayah N of M • reciter */}
              <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                Ayah {verseNum}
                {versesCount ? ` of ${versesCount}` : ""} •{" "}
                {isPlayingTranslation ? "🗣️ Translation Audio" : (currentReciter?.reciter_name ?? "Reciter")}
              </div>
            </div>
          </button>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 flex-none">
            <button
              type="button"
              onClick={playPreviousVerse}
              aria-label="Previous Ayah"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleActiveToggle}
              disabled={activeLoading}
              aria-label={activePlaying ? "Pause" : "Play"}
              className={`h-9 w-9 rounded-full text-white flex items-center justify-center shadow-xs transition-all active:scale-95 ${
                isPlayingTranslation
                  ? "bg-teal-600 hover:bg-teal-500"
                  : "bg-[var(--primary)] hover:bg-[var(--primary)]/80"
              }`}
            >
              {activeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activePlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNextVerse}
              aria-label="Next Ayah"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Expand button — bounces when playing to hint swipe-up */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-label="Expand player settings"
              className={`p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all ${
                isPlaying && !isExpanded ? "animate-bounce" : ""
              }`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={stopAudio}
              aria-label="Stop audio"
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Expanded Audio Sheet ───────────────────────────────────────── */}
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
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">
                  Audio Studio &amp; Reciter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-95 transition-all"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Currently Playing Track — improved display */}
            <div className="text-center space-y-0.5">
              <div className="text-sm font-bold text-[var(--foreground)]">
                Surah {surahName} • Ayah {verseNum}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {currentReciter?.reciter_name} ({currentReciter?.style})
              </div>
            </div>

            {/* Dual Audio Mode Selector (Arabic Recitation vs Translation Audio) */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={togglePlayPause}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                    : "bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--primary)] border-[var(--border-subtle)]"
                }`}
              >
                🎙️ {currentReciter?.reciter_name?.split(" ")[0] || "Arabic"}
              </button>
              <button
                type="button"
                onClick={toggleTranslationPlayPause}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isPlayingTranslation
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-teal-600 border-[var(--border-subtle)]"
                }`}
              >
                🗣️ Translation Audio
              </button>
            </div>

            {/* Scrubber (Ultra-Thin 2.5px) */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={activeDuration || 100}
                value={activeCurrentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className={`w-full h-[2.5px] bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer ${
                  isPlayingTranslation ? "accent-teal-500" : "accent-[var(--primary)]"
                }`}
              />
              <div className="flex justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
                <span>{formatTime(activeCurrentTime)}</span>
                <span>{formatTime(activeDuration)}</span>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={playPreviousVerse}
                className="p-2.5 rounded-full text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] active:scale-95 transition-all"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={handleActiveToggle}
                disabled={activeLoading}
                className={`h-14 w-14 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  isPlayingTranslation
                    ? "bg-teal-600 hover:bg-teal-500"
                    : "bg-[var(--primary)] hover:bg-[var(--primary)]/80"
                }`}
              >
                {activeLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : activePlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={playNextVerse}
                className="p-2.5 rounded-full text-[var(--foreground)] bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] active:scale-95 transition-all"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Secondary Controls: Repeat, Speed */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  repeatMode !== "none"
                    ? "bg-emerald-500/15 border-emerald-500 text-[var(--primary)]"
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
                    <Repeat className="h-4 w-4 text-[var(--primary)]" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] text-[var(--foreground)] active:scale-95 transition-all"
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
                className="w-full p-2.5 rounded-xl text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reciter_name} ({r.style})
                  </option>
                ))}
              </select>
            </div>

            {/* ── Loop Range (Memorization) ─────────────────────────────── */}
            <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  Loop Range (Memorization)
                </label>
                {/* Coming soon badge */}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Coming Soon
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-0.5">
                  <label className="text-[10px] text-[var(--muted-foreground)]">
                    From Ayah
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={versesCount ?? 286}
                    value={loopFrom}
                    onChange={(e) => setLoopFrom(Math.max(1, Number(e.target.value)))}
                    disabled
                    className="w-full p-2 rounded-lg text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex-1 space-y-0.5">
                  <label className="text-[10px] text-[var(--muted-foreground)]">
                    To Ayah
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={versesCount ?? 286}
                    value={loopTo}
                    onChange={(e) => setLoopTo(Math.max(1, Number(e.target.value)))}
                    disabled
                    className="w-full p-2 rounded-lg text-xs bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex-none self-end">
                  <button
                    type="button"
                    disabled
                    title="Loop range feature coming soon"
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)]/40 text-white opacity-50 cursor-not-allowed active:scale-95 transition-all"
                  >
                    Start Loop
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-[var(--muted-foreground)] italic">
                Set a verse range to loop for memorization practice. Available in the next update.
                <br />
                اگلے اپڈیٹ میں حفظ کے لیے آیات کی رینج لوپ کریں۔
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
