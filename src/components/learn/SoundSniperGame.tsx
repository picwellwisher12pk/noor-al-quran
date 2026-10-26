"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CheckCircle2, AlertCircle, HelpCircle, Sparkles } from "lucide-react";
import { SoundSniperPayload } from "../../lib/quiz-engine";
import { useLearningStore } from "../../store/useLearningStore";

export interface SoundSniperGameProps {
  payload: SoundSniperPayload;
  onAnswer: (isCorrect: boolean, selectedId: string) => void;
  disabled?: boolean;
  hintsAllowed?: boolean;
}

export function SoundSniperGame({
  payload,
  onAnswer,
  disabled = false,
  hintsAllowed = true
}: SoundSniperGameProps) {
  const { langPreference } = useLearningStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUrdu = langPreference === "urdu";
  const isBilingual = langPreference === "bilingual";

  const playAudio = () => {
    if (!payload.promptAudioUrl) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(payload.promptAudioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      setAudioError(false);

      audio.play().catch((err) => {
        // Autoplay policy prevented playback without prior user click; do not show error icon
        console.warn("Audio autoplay blocked or waiting for user tap:", err);
        setIsPlaying(false);
      });

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setAudioError(true);
      };
    } catch {
      setIsPlaying(false);
      setAudioError(true);
    }
  };

  // Play audio on mount when new question appears
  useEffect(() => {
    setSelectedId(null);
    setHasAnswered(false);
    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [payload.id]);

  const handleTileClick = (optId: string) => {
    if (disabled || hasAnswered) return;
    setSelectedId(optId);
    setHasAnswered(true);

    const targetOpt = payload.options.find((o) => o.isCorrect);
    const isCorrect = optId === targetOpt?.id;
    onAnswer(isCorrect, optId);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Audio Waveform / Pulse Button */}
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-sm text-center space-y-3 relative overflow-hidden transition-colors">
        {/* Animated Ripple Rings when Playing */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
            <span className="w-36 h-36 rounded-full bg-emerald-500/10 animate-ping delay-150" />
          </div>
        )}

        <button
          type="button"
          onClick={playAudio}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 ${
            isPlaying
              ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white scale-105 shadow-emerald-500/40"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-105"
          }`}
          title="Play Pronunciation Audio"
        >
          {audioError ? (
            <VolumeX className="w-8 h-8 text-rose-200" />
          ) : (
            <Volume2 className={`w-9 h-9 ${isPlaying ? "animate-pulse" : ""}`} />
          )}
        </button>

        <div className="relative z-10 space-y-0.5">
          <span className="text-xs font-bold text-[var(--foreground)] tracking-wide block">
            {isPlaying
              ? isUrdu
                ? "تلفظ ادا ہو رہا ہے..."
                : "Playing Pronunciation..."
              : isUrdu
              ? "دوبارہ سننے کے لیے ٹیپ کریں"
              : "Tap to Listen Again"}
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)] block">
            {isUrdu
              ? "قرآن پاک کی مستند صوتی تلاوت (Quran CDN)"
              : "Authentic Qari recitation from Quran CDN"}
          </span>
        </div>
      </div>

      {/* Instruction Banner */}
      <p className="text-xs text-center text-[var(--muted-foreground)] font-medium">
        {isUrdu
          ? (payload.instructionUrdu || "تلفظ کو غور سے سنیں اور درست قرآنی لفظ کا انتخاب کریں")
          : payload.instruction}
      </p>

      {/* 4 Snipe Arabic Tiles (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3.5">
        {payload.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.isCorrect;

          let tileStyle = "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--foreground)] hover:border-emerald-500/40";

          if (hasAnswered) {
            if (isCorrect) {
              tileStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-md shadow-emerald-500/20";
            } else if (isSelected && !isCorrect) {
              tileStyle = "bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 shadow-md shadow-rose-500/20 animate-shake";
            } else {
              tileStyle = "bg-[var(--surface-card)]/40 border-[var(--border-subtle)]/40 opacity-40 text-[var(--muted-foreground)]";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled || hasAnswered}
              onClick={() => handleTileClick(opt.id)}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm group relative min-h-[110px] ${tileStyle}`}
            >
              <span
                className="text-3xl sm:text-4xl font-black tracking-wide"
                style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                dir="rtl"
              >
                {opt.textArabic}
              </span>

              {/* Transliteration and Urdu meaning if revealed */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {opt.transliteration && (
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    {opt.transliteration}
                  </span>
                )}
                {hasAnswered && opt.translationUrdu && (isUrdu || isBilingual) && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400" dir="rtl">
                    • {opt.translationUrdu}
                  </span>
                )}
              </div>

              {hasAnswered && isCorrect && (
                <div className="absolute top-2.5 right-2.5 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
