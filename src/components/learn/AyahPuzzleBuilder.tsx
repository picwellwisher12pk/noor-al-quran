"use client";

import React, { useState } from "react";
import { Volume2, CheckCircle2, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import { AyahPuzzlePayload } from "../../lib/quiz-engine";
import { useLearningStore } from "../../store/useLearningStore";

export interface AyahPuzzleBuilderProps {
  payload: AyahPuzzlePayload;
  onAnswer: (isCorrect: boolean, placedIds: string[]) => void;
  disabled?: boolean;
  hintsAllowed?: boolean;
}

export function AyahPuzzleBuilder({
  payload,
  onAnswer,
  disabled = false,
  hintsAllowed = true
}: AyahPuzzleBuilderProps) {
  const { langPreference } = useLearningStore();
  const [placedBlockIds, setPlacedBlockIds] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [mode, setMode] = useState<"arabic" | "urdu" | "english">("arabic");

  const totalRequired = payload.correctSequenceWordIds.length;
  const blocksMap = new Map(payload.scrambledBlocks.map((b) => [b.id, b]));

  const playRecitation = () => {
    if (!payload.audioRecitationUrl) return;
    setIsAudioPlaying(true);
    const audio = new Audio(payload.audioRecitationUrl);
    audio.play().catch(() => setIsAudioPlaying(false));
    audio.onended = () => setIsAudioPlaying(false);
    audio.onerror = () => setIsAudioPlaying(false);
  };

  const playWordAudio = (url?: string) => {
    if (!url) return;
    const a = new Audio(url);
    a.play().catch(() => {});
  };

  const handleBlockSelect = (blockId: string) => {
    if (disabled || hasSubmitted) return;
    const block = blocksMap.get(blockId);
    if (block?.audioUrl) playWordAudio(block.audioUrl);

    setPlacedBlockIds((prev) => [...prev, blockId]);
  };

  const handleBlockRemove = (blockId: string) => {
    if (disabled || hasSubmitted) return;
    setPlacedBlockIds((prev) => prev.filter((id) => id !== blockId));
  };

  const handleReset = () => {
    if (disabled || hasSubmitted) return;
    setPlacedBlockIds([]);
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;
    setHasSubmitted(true);

    const isCorrect =
      placedBlockIds.length === payload.correctSequenceWordIds.length &&
      placedBlockIds.every((id, idx) => id === payload.correctSequenceWordIds[idx]);

    onAnswer(isCorrect, placedBlockIds);
  };

  const availableBlocks = payload.scrambledBlocks.filter(
    (b) => !placedBlockIds.includes(b.id)
  );

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 animate-in fade-in duration-200 text-left">
      {/* Header Context & Audio Trigger */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            {payload.surahNameEn} ({payload.surahNameAr}) • Ayah {payload.verseKey}
          </span>
          {payload.fullTranslationUrdu && (langPreference === "urdu" || langPreference === "bilingual") ? (
            <p className="text-xs text-white/90 font-medium line-clamp-1" dir="rtl">
              "{payload.fullTranslationUrdu}"
            </p>
          ) : (
            <p className="text-xs text-white/70 font-medium line-clamp-1">
              "{payload.fullTranslationEn}"
            </p>
          )}
          {langPreference === "bilingual" && payload.fullTranslationUrdu && (
            <p className="text-[10px] text-white/50 font-medium line-clamp-1">
              {payload.fullTranslationEn}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={playRecitation}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isAudioPlaying
              ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 animate-pulse"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-emerald-400"
          }`}
          title="Listen to Verse Recitation"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher: Arabic Assembly (RTL) vs Urdu (RTL) vs English (LTR) */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
          {langPreference === "urdu"
            ? `ترتیب شدہ الفاظ (${placedBlockIds.length}/${totalRequired}):`
            : `Assembled Ayah (${placedBlockIds.length}/${totalRequired} words):`}
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/5 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("arabic")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "arabic"
                ? "bg-emerald-600 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            عربی (RTL)
          </button>
          <button
            type="button"
            onClick={() => setMode("urdu")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "urdu"
                ? "bg-emerald-600 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            اردو (RTL)
          </button>
          <button
            type="button"
            onClick={() => setMode("english")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === "english"
                ? "bg-emerald-600 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Drop Target Assembly Bay */}
      <div
        className={`min-h-[110px] p-4 rounded-3xl border-2 border-dashed transition-all flex flex-wrap items-center gap-2 relative ${
          placedBlockIds.length === totalRequired
            ? "bg-emerald-500/10 border-emerald-500/50"
            : "bg-white/5 border-white/15"
        }`}
        dir={mode === "english" ? "ltr" : "rtl"}
      >
        {placedBlockIds.length === 0 ? (
          <div className="w-full text-center py-4 text-xs text-white/40 font-medium">
            {langPreference === "urdu"
              ? "نیچے موجود قرآنی الفاظ کے کارڈز کو صحیح ترتیب میں ٹیپ کریں"
              : "Tap available word blocks below in correct grammatical sequence"}
          </div>
        ) : (
          placedBlockIds.map((blockId, index) => {
            const block = blocksMap.get(blockId);
            if (!block) return null;

            return (
              <button
                key={blockId}
                type="button"
                disabled={disabled || hasSubmitted}
                onClick={() => handleBlockRemove(blockId)}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-b from-white/15 to-white/10 hover:from-rose-500/20 hover:to-rose-500/30 border border-white/20 hover:border-rose-400 text-white transition-all cursor-pointer active:scale-95 text-center shadow-md group"
              >
                {mode === "arabic" ? (
                  <span
                    className="text-xl font-bold block"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    {block.text}
                  </span>
                ) : mode === "urdu" ? (
                  <span className="text-sm font-bold block text-emerald-300">
                    {block.translationUrdu || block.translation}
                  </span>
                ) : (
                  <span className="text-xs font-semibold block text-emerald-300">
                    {block.translation}
                  </span>
                )}
                <span className="text-[9px] text-white/40 block group-hover:text-rose-300 transition-colors">
                  #{index + 1} • tap to remove
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Word Bank Scrambled Tiles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider">
          <span>{langPreference === "urdu" ? "دستیاب الفاظ:" : "Available Word Tiles:"}</span>
          {hintsAllowed && (
            <span className="text-emerald-400 lowercase font-normal">
              {langPreference === "urdu" ? "درست تلفظ سننے کے لیے لفظ دبائیں" : "tap to hear authentic audio"}
            </span>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10"
          dir={mode === "english" ? "ltr" : "rtl"}
        >
          {availableBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              disabled={disabled || hasSubmitted}
              onClick={() => handleBlockSelect(block.id)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/15 hover:border-emerald-400/50 text-white transition-all cursor-pointer active:scale-95 text-center shadow-md hover:scale-105"
            >
              {mode === "arabic" ? (
                <>
                  <span
                    className="text-xl font-bold block"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    {block.text}
                  </span>
                  {(langPreference === "urdu" || langPreference === "bilingual") && block.translationUrdu ? (
                    <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                      {block.translationUrdu}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      {block.translation}
                    </span>
                  )}
                </>
              ) : mode === "urdu" ? (
                <>
                  <span className="text-sm font-bold block text-emerald-300">
                    {block.translationUrdu || block.translation}
                  </span>
                  <span
                    className="text-xs text-white/50 block mt-0.5"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    {block.text}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold block text-emerald-300">
                    {block.translation}
                  </span>
                  <span
                    className="text-xs text-white/50 block mt-0.5"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    {block.text}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer: Reset & Submit Check */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={placedBlockIds.length === 0 || disabled || hasSubmitted}
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {langPreference === "urdu" ? "دوبارہ ترتیب دیں" : "Reset Blocks"}
        </button>

        <button
          type="button"
          disabled={placedBlockIds.length === 0 || disabled || hasSubmitted}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 active:scale-95"
        >
          <span>{langPreference === "urdu" ? "آیت کی تصدیق کریں" : "Verify Ayah"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
