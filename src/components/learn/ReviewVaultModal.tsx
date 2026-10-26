"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Volume2,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen
} from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";
import phase1Foundations from "../../data/learning/phase1-foundations.json";
import { getWordUrduGloss } from "../../lib/quiz-engine";
import { buildSafeWordAudioUrl, isSafeAudioUrl } from "@/utils/security";

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

  const wordRecords = Object.values(srsWords);
  const now = new Date().toISOString();
  const weakWords = wordRecords.filter(
    (w) => w.masteryLevel <= 2 || w.nextReviewAt <= now
  );

  const handlePlayAudio = (audioUrl: string | null, id: string) => {
    if (!audioUrl || !isSafeAudioUrl(audioUrl)) return;
    setPlayingAudioId(id);
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
  };

  const handleStartBlitz = () => {
    startSession("blitz");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[var(--modal-bg)] border border-[var(--card-border)] p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 text-left transition-colors">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => toggleReviewVault(false)}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
              <span>{isUrdu ? "سپیسڈ ریپیٹیشن والٹ" : "Spaced Repetition Review Vault"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono font-bold">
                {weakWords.length} {isUrdu ? "زیرِ نظر" : "Due"}
              </span>
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {isUrdu
                ? "سوپر میمو SM-2 الگورتھم: جو الفاظ آپ سے چھوٹ جاتے ہیں، وہ پختہ یادداشت تک ترجیحی بنیاد پر دہرائے جاتے ہیں۔"
                : "SuperMemo SM-2 interval scheduling: words you miss recur with priority until permanently mastered."}
            </p>
          </div>
        </div>

        {/* Quick Action Banner */}
        {weakWords.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                {isUrdu ? "کمزور الفاظ کا بلٹز ٹیسٹ دستیاب ہے" : "Weak-Word Blitz Available"}
              </span>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {isUrdu
                  ? `آپ کے پاس ${weakWords.length} الفاظ ہیں جن کی دہرائی ضروری ہے۔`
                  : `You have ${weakWords.length} words needing memory reinforcement.`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartBlitz}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isUrdu ? "۵ الفاظ کا بلٹز شروع کریں" : "Start 5-Word Blitz"}
            </button>
          </div>
        )}

        {/* Word List Scroll Container */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[48vh] custom-scrollbar">
          {wordRecords.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted-foreground)] space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">
                {isUrdu
                  ? "آپ کا والٹ فی الحال خالی ہے! اسباق مکمل کر کے قرآنی الفاظ شامل کریں۔"
                  : "Your review vault is currently clear! Complete lessons to register vocabulary."}
              </p>
            </div>
          ) : (
            wordRecords.map((record) => {
              const particle = particlesMap.get(record.wordId);
              const arabicText = particle?.textUthmani || record.wordId;
              const transliteration = particle?.transliteration || "";
              const translationEn = particle?.translationEn || "Quranic vocabulary";
              const translationUrdu = particle?.translationUrdu || getWordUrduGloss(arabicText);
              const isDue = record.masteryLevel <= 2 || record.nextReviewAt <= now;

              return (
                <div
                  key={record.wordId}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDue
                      ? "bg-amber-500/10 border-amber-500/30 text-[var(--foreground)]"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--foreground)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!particle?.id}
                      onClick={() => handlePlayAudio(particle ? buildSafeWordAudioUrl(particle.id) : null, record.wordId)}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-colors"
                      title="Pronounce Word"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-bold"
                          style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                          dir="rtl"
                        >
                          {arabicText}
                        </span>
                        {transliteration && (
                          <span className="text-xs text-[var(--muted-foreground)] font-mono">
                            ({transliteration})
                          </span>
                        )}
                      </div>

                      {/* Translations in Urdu and/or English */}
                      <div className="flex items-center gap-2 text-xs">
                        {translationUrdu && (isUrdu || isBilingual) && (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400" dir="rtl">
                            {translationUrdu}
                          </span>
                        )}
                        {!isUrdu && (
                          <span className="text-[var(--muted-foreground)]">
                            {translationEn}
                          </span>
                        )}
                      </div>
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
    </div>
  );
}
