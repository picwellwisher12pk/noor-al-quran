"use client";

import React, { useState } from "react";
import { Word } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { WordDetailsModal } from "@/components/modals/WordDetailsModal";
import { Volume2, Info } from "lucide-react";

interface WordByWordProps {
  words: Word[];
  arabicFontSize: number;
  arabicFontClass?: string;
  chapterName?: string;
}

export function WordByWord({
  words,
  arabicFontSize,
  arabicFontClass = "font-arabic-amiri",
  chapterName,
}: WordByWordProps) {
  const { playWord } = useAudio();
  const { prefs } = useReadingPreferences();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  return (
    <>
      <div
        className="flex flex-wrap items-start justify-start gap-y-3 gap-x-1.5 my-2 select-text"
        dir="rtl"
      >
        {words.map((word) => {
          const isEndMarker = word.char_type_name === "end";

          if (isEndMarker) {
            return (
              <div
                key={word.id}
                className="inline-flex items-center justify-center text-emerald-500 font-arabic text-lg px-1 pt-1 select-none"
              >
                ۝
              </div>
            );
          }

          const urduText = word.translation_urdu?.text;
          const englishText = word.translation?.text;

          return (
            <div
              key={word.id}
              onClick={() => setSelectedWord(word)}
              title="Click for Word Roots & Details"
              className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all border border-transparent hover:border-emerald-500/40 hover:bg-emerald-950/25 cursor-pointer"
            >
              {/* Arabic Word Token */}
              <span
                className={`${arabicFontClass} text-[var(--foreground)] group-hover:text-emerald-400 transition-colors leading-tight`}
                style={{ fontSize: `${arabicFontSize}px` }}
              >
                {word.text_uthmani || word.text}
              </span>

              {/* Transliteration */}
              {prefs.showTransliteration && word.transliteration?.text && (
                <span
                  className="text-[10px] font-sans text-emerald-400/80 group-hover:text-emerald-300 mt-0.5 leading-none"
                  dir="ltr"
                >
                  {word.transliteration.text}
                </span>
              )}

              {/* Urdu Translation */}
              {(prefs.wbwLanguage === "urdu" || prefs.wbwLanguage === "both") && urduText && (
                <span
                  className="text-[11px] font-urdu text-[var(--urdu-color,#e2e8f0)] group-hover:text-emerald-300 text-center max-w-[85px] truncate mt-0.5"
                  dir="rtl"
                  title={urduText}
                >
                  {urduText}
                </span>
              )}

              {/* English Translation */}
              {(prefs.wbwLanguage === "english" || prefs.wbwLanguage === "both") && englishText && (
                <span
                  className="text-[10px] font-sans text-[var(--muted-foreground,#8e9b94)] group-hover:text-[var(--foreground)] text-center max-w-[85px] truncate mt-0.5 leading-none"
                  dir="ltr"
                  title={englishText}
                >
                  {englishText}
                </span>
              )}

              {/* Hover Controls: Audio Pronunciation */}
              {word.audio_url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playWord(word.audio_url!);
                  }}
                  title="Listen to pronunciation"
                  aria-label="Play pronunciation"
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-1 shadow"
                >
                  <Volume2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Word Details Modal */}
      <WordDetailsModal
        isOpen={!!selectedWord}
        onClose={() => setSelectedWord(null)}
        word={selectedWord}
        chapterName={chapterName}
      />
    </>
  );
}
