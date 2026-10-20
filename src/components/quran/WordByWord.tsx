"use client";

import React from "react";
import { Word } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { Volume2 } from "lucide-react";

interface WordByWordProps {
  words: Word[];
  arabicFontSize: number;
}

export function WordByWord({ words, arabicFontSize }: WordByWordProps) {
  const { playWord } = useAudio();

  // Filter out the end marker symbol if it doesn't have translation
  return (
    <div
      className="flex flex-wrap items-start justify-start gap-y-6 gap-x-2 my-4 select-text"
      dir="rtl"
    >
      {words.map((word) => {
        const isEndMarker = word.char_type_name === "end";

        if (isEndMarker) {
          return (
            <div
              key={word.id}
              className="inline-flex items-center justify-center text-emerald-500 font-arabic text-xl px-1 pt-1"
            >
              ۝
            </div>
          );
        }

        return (
          <div
            key={word.id}
            onClick={() => {
              if (word.audio_url) {
                playWord(word.audio_url);
              }
            }}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all border border-transparent hover:border-emerald-500/40 hover:bg-emerald-950/20 ${
              word.audio_url ? "cursor-pointer" : ""
            }`}
          >
            {/* Arabic Word */}
            <span
              className="font-arabic text-[var(--foreground)] group-hover:text-emerald-400 transition-colors leading-relaxed"
              style={{ fontSize: `${arabicFontSize}px` }}
            >
              {word.text_uthmani || word.text}
            </span>

            {/* Transliteration */}
            {word.transliteration?.text && (
              <span
                className="text-[11px] font-sans text-emerald-400/80 group-hover:text-emerald-300 mt-1"
                dir="ltr"
              >
                {word.transliteration.text}
              </span>
            )}

            {/* Translation */}
            {word.translation?.text && (
              <span
                className="text-[11px] font-sans text-[var(--muted-foreground,#8e9b94)] group-hover:text-[var(--foreground)] text-center max-w-[80px] truncate"
                dir="ltr"
                title={word.translation.text}
              >
                {word.translation.text}
              </span>
            )}

            {/* Audio Indicator */}
            {word.audio_url && (
              <div
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white rounded-full p-0.5"
                title="Listen to word"
              >
                <Volume2 className="h-2.5 w-2.5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
