"use client";

import React, { useState } from "react";
import { Word } from "@/types/quran";
import { useAudio } from "@/context/AudioContext";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useNotes } from "@/context/NotesContext";
import { WordDetailsModal } from "@/components/modals/WordDetailsModal";
import { Volume2, Info, StickyNote } from "lucide-react";

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
  const { openWordInInspector, selectedWord: currentSelectedWord } = useDesktopWorkspace();
  const { getNotesForWord } = useNotes();
  const [modalWord, setModalWord] = useState<Word | null>(null);

  const handleWordClick = (word: Word) => {
    // Open in desktop right inspector
    openWordInInspector(word);
  };

  return (
    <>
      <div
        className="flex flex-wrap items-start justify-start gap-y-2.5 gap-x-1.5 my-1.5 select-text"
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
          const isSelectedInInspector = currentSelectedWord?.id === word.id;
          const wordNotes = getNotesForWord(word.location);
          const hasNote = wordNotes.length > 0;

          return (
            <div
              key={word.id}
              onClick={() => handleWordClick(word)}
              title={
                hasNote
                  ? `${wordNotes.length} personal note(s) • Click to inspect`
                  : "Click to inspect Root, Grammar & Translations in Right Inspector"
              }
              className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all border cursor-pointer ${isSelectedInInspector
                  ? "border-emerald-500/60 bg-emerald-500/15 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/30"
                  : "border-transparent hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30"
                }`}
            >
              {/* Note Indicator Pin */}
              {hasNote && (
                <span
                  className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-[var(--surface-raised)] z-10"
                  title={`${wordNotes.length} note(s)`}
                >
                  {wordNotes.length > 1 ? wordNotes.length : ""}
                </span>
              )}
              {/* Arabic Word Token */}
              <span
                className={`${arabicFontClass} text-[var(--foreground)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight`}
                style={{ fontSize: `${arabicFontSize}px` }}
              >
                {word.text_uthmani || word.text}
              </span>

              {/* Transliteration (Hidden when English Translation is disabled) */}
              {prefs.showTransliteration && prefs.showTranslation && word.transliteration?.text && (
                <span
                  className="text-[10px] font-sans text-emerald-700 dark:text-emerald-400 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-300 mt-0.5 leading-none"
                  dir="ltr"
                >
                  {word.transliteration.text}
                </span>
              )}

              {/* Urdu Translation */}
              {(prefs.wbwLanguage === "urdu" || prefs.wbwLanguage === "both") && urduText && (
                <span
                  className="text-[11px] font-urdu text-[var(--urdu-color)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300 text-center max-w-[85px] truncate mt-0.5 font-medium"
                  dir="rtl"
                  title={urduText}
                >
                  {urduText}
                </span>
              )}

              {/* English Translation */}
              {(prefs.wbwLanguage === "english" || prefs.wbwLanguage === "both") && englishText && (
                <span
                  className="text-[10px] font-sans text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] text-center max-w-[85px] truncate mt-0.5 leading-none"
                  dir="ltr"
                  title={englishText}
                >
                  {englishText}
                </span>
              )}

              {/* Hover Controls: Audio Pronunciation */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const audio = getWordAudioUrl(word);
                  if (audio) {
                    playWord(audio);
                  } else {
                    playAudioSafely(undefined, word.text_uthmani || word.text);
                  }
                }}
                className="absolute -top-1.5 -left-1.5 p-1 rounded-full bg-emerald-600 text-white shadow opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10 cursor-pointer"
                title="Pronounce Word"
              >
                <Volume2 className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Fallback modal if opened explicitly */}
      <WordDetailsModal
        isOpen={!!modalWord}
        onClose={() => setModalWord(null)}
        word={modalWord}
        chapterName={chapterName}
      />
    </>
  );
}
