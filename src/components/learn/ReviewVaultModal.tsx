"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Volume2,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { useLearningStore } from "../../store/useLearningStore";
import phase1Foundations from "../../data/learning/phase1-foundations.json";
import { getWordUrduGloss } from "../../lib/quiz-engine";
import { getWordAudioUrl, playAudioSafely } from "@/utils/audioResolver";

export function ReviewVaultModal() {
  const {
    isReviewVaultOpen,
    toggleReviewVault,
    srsWords,
    startSession,
    langPreference
  } = useLearningStore();

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  if (!isReviewVaultOpen) return null;

  const isUrdu = langPreference === "urdu";
  const isBilingual = langPreference === "bilingual";

  const particlesMap = new Map(
    phase1Foundations.top30ParticlesAndPronouns.map((p) => [p.id, p])
  );

  const wordRecords = Object.values(srsWords || {});
  const now = new Date().toISOString();
  const weakWords = wordRecords.filter(
    (w) => w && (w.masteryLevel <= 2 || (w.nextReviewAt && w.nextReviewAt <= now))
  );

  const handlePlayAudio = (audioUrl: string | null, id: string, fallbackArabic?: string) => {
    setPlayingAudioId(id);
    playAudioSafely(audioUrl, fallbackArabic).finally(() => setPlayingAudioId(null));
  };

  const handleStartBlitz = () => {
    startSession("blitz");
  };

  return (
    <Modal
      isOpen={isReviewVaultOpen}
      onClose={() => toggleReviewVault(false)}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span className="font-bold">
            {isUrdu ? "سپیسڈ ریپیٹیشن والٹ" : "Spaced Repetition Review Vault"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono font-bold">
            {weakWords.length} {isUrdu ? "زیرِ نظر" : "Due"}
          </span>
        </div>
      }
    >
      <div className="space-y-5 text-left">
        <p className="text-xs text-[var(--muted-foreground)]">
          {isUrdu
            ? "سوپر میمو SM-2 الگورتھم: جو الفاظ آپ سے چھوٹ جاتے ہیں، وہ پختہ یادداشت تک ترجیحی بنیاد پر دہرائے جاتے ہیں۔"
            : "SuperMemo SM-2 interval scheduling: words you miss recur with priority until permanently mastered."}
        </p>

        {/* Quick Action Banner */}
        {weakWords.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-[var(--foreground)]">
                {isUrdu ? "فوری ۵ سوالی جائزہ (SRS Blitz)" : "Launch 5-Question SRS Blitz"}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                {isUrdu
                  ? "صرف انہی الفاظ پر مشتمل تیز رفتار چیلنج تاکہ آپ کی کمزوری دور ہو"
                  : "Target strictly due & weak words to refresh memory intervals"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartBlitz}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{isUrdu ? "بلٹز شروع کریں" : "Start Blitz"}</span>
            </button>
          </div>
        )}

        {/* Word List Scroll Container */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {weakWords.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[var(--foreground)]">
                  {isUrdu ? "والٹ بالکل صاف ہے!" : "Review Vault is Clear!"}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                  {isUrdu
                    ? "ماشاء اللہ! آپ کے تمام سیکھے ہوئے الفاظ مستحکم ہیں۔ نئے اسباق یا ٹیسٹ کھیلیں تاکہ مزید ذخیرہ الفاظ والٹ میں شامل ہو۔"
                    : "All studied vocabulary items are currently fresh in memory. Continue playing arcade modes or lessons to expand your deck."}
                </p>
              </div>
            </div>
          ) : (
            weakWords.map((record) => {
              const particle = particlesMap.get(record.wordId);
              const arabicText = particle?.textUthmani || record.wordId;
              const englishMeaning = particle?.translationEn || "Quranic Word";
              const urduMeaning = particle?.translationUrdu || getWordUrduGloss(arabicText);
              const safeAudio = getWordAudioUrl(record.wordId);
              const isPlaying = playingAudioId === record.wordId;

              return (
                <div
                  key={record.wordId}
                  className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                >
                  {/* Left: Arabic & Audio */}
                  <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(safeAudio, record.wordId, arabicText)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-emerald-600 text-white animate-pulse"
                            : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)]"
                        }`}
                        title="Play Authentic Audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-lg font-bold text-emerald-700 dark:text-emerald-300"
                          style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                          dir="rtl"
                        >
                          {arabicText}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {isUrdu ? urduMeaning : englishMeaning}
                        </span>
                      </div>
                      {isBilingual && (
                        <span className="text-[11px] text-[var(--muted-foreground)]" dir="rtl">
                          {urduMeaning}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Mastery Level Pips & Reps */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((pip) => (
                        <div
                          key={pip}
                          className={`w-2 h-2 rounded-full ${
                            pip <= record.masteryLevel
                              ? "bg-emerald-500 shadow-sm"
                              : "bg-black/10 dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      Lvl {record.masteryLevel}/5 • {record.repetitionCount} {isUrdu ? "مرتبہ" : "reps"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
