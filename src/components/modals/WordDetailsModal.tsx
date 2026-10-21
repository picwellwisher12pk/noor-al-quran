"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Word } from "@/types/quran";
import { getWordRoot, WordRootInfo } from "@/services/rootService";
import { useAudio } from "@/context/AudioContext";
import { BookOpen, Volume2, Sparkles, Layers, Tag, Compass } from "lucide-react";

interface WordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  chapterName?: string;
}

export function WordDetailsModal({
  isOpen,
  onClose,
  word,
  chapterName,
}: WordDetailsModalProps) {
  const { playWord } = useAudio();
  const [rootInfo, setRootInfo] = useState<WordRootInfo | null>(null);
  const [loadingRoot, setLoadingRoot] = useState(false);

  useEffect(() => {
    if (!isOpen || !word) {
      setRootInfo(null);
      return;
    }

    const [chapStr, verseStr, posStr] = word.location.split(":");
    const chapterId = Number(chapStr) || 1;
    const verseNumber = Number(verseStr) || 1;
    const wordPosition = Number(posStr) || word.position || 1;

    setLoadingRoot(true);
    getWordRoot(chapterId, verseNumber, wordPosition)
      .then((info) => setRootInfo(info))
      .catch((err) => console.error("Error fetching root:", err))
      .finally(() => setLoadingRoot(false));
  }, [isOpen, word]);

  if (!word) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">Word Linguistic & Root Analysis</span>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Arabic Word Card */}
        <div className="rounded-2xl p-5 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

          {/* Reference pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[11px] text-[var(--muted-foreground,#8e9b94)] mb-3">
            <Compass className="h-3 w-3 text-emerald-400" />
            <span>
              {chapterName ? `${chapterName} • ` : ""}
              Ayah {word.verse_key} • Word {word.position}
            </span>
          </div>

          {/* Arabic Display */}
          <div className="font-arabic text-4xl text-[var(--foreground)] py-1 leading-relaxed" dir="rtl">
            {word.text_uthmani || word.text}
          </div>

          {/* Transliteration */}
          {word.transliteration?.text && (
            <div className="text-xs text-emerald-400 font-medium tracking-wide mt-1">
              {word.transliteration.text}
            </div>
          )}

          {/* Audio Replay Button */}
          {word.audio_url && (
            <button
              type="button"
              onClick={() => playWord(word.audio_url!)}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Volume2 className="h-3.5 w-3.5" /> Listen Pronunciation
            </button>
          )}
        </div>

        {/* Word Root & Morphology */}
        <div className="rounded-2xl p-4 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)]">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Arabic Root (جذر الكلمة)</span>
          </div>

          {loadingRoot ? (
            <div className="text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse py-2">
              Locating root occurrences across Quranic corpus...
            </div>
          ) : rootInfo?.root ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)]">
              <div>
                <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)] block">3-Letter Consonant Root:</span>
                <span className="font-arabic text-xl font-bold text-emerald-400" dir="rtl">
                  {rootInfo.root.split("").join(" - ")} ({rootInfo.root})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)] block">Total Quran Occurrences:</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-mono">
                  {rootInfo.count} times
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[var(--surface-card,#182520)] text-xs text-[var(--muted-foreground,#8e9b94)]">
              Particle / Proper Noun (مبني / علم) without derived trilateral root.
            </div>
          )}
        </div>

        {/* Translations in Context (Urdu & English) */}
        <div className="rounded-2xl p-4 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)]">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Contextual Word Translations</span>
          </div>

          {/* Urdu Meaning */}
          <div className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-right" dir="rtl">
            <span className="text-[10px] text-emerald-400/80 block mb-0.5 font-sans">لفظی اردو ترجمہ:</span>
            <span className="font-urdu text-lg text-[var(--urdu-color,#e2e8f0)] font-medium">
              {word.translation_urdu?.text || "ساتھ نام"}
            </span>
          </div>

          {/* English Meaning */}
          <div className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-left" dir="ltr">
            <span className="text-[10px] text-emerald-400/80 block mb-0.5">English Translation:</span>
            <span className="text-xs text-[var(--translation-color,#cbd5e1)] font-medium">
              {word.translation?.text || "In the name"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
