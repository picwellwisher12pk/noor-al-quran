"use client";

import React, { useState } from "react";
import { Layers, Zap, Compass, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { GrammarSortPayload, GrammarSortToken } from "../../lib/quiz-engine";
import { useLearningStore } from "../../store/useLearningStore";

export interface GrammarSortBucketProps {
  payload: GrammarSortPayload;
  onAnswer: (isCorrect: boolean, assignments: Record<string, "ism" | "fil" | "harf">) => void;
  disabled?: boolean;
  hintsAllowed?: boolean;
}

export function GrammarSortBucket({
  payload,
  onAnswer,
  disabled = false,
  hintsAllowed = true
}: GrammarSortBucketProps) {
  const { langPreference } = useLearningStore();
  const [assignments, setAssignments] = useState<Record<string, "ism" | "fil" | "harf">>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeTokenIndex, setActiveTokenIndex] = useState(0);

  const tokens = payload.tokens;
  const currentToken: GrammarSortToken | undefined = tokens[activeTokenIndex];
  const allAssigned = tokens.every((t) => Boolean(assignments[t.id]));

  const handleAssignCurrent = (cat: "ism" | "fil" | "harf") => {
    if (disabled || hasSubmitted || !currentToken) return;

    setAssignments((prev) => ({
      ...prev,
      [currentToken.id]: cat
    }));

    // Auto-advance to next unassigned token if available
    const nextUnassigned = tokens.findIndex((t, idx) => idx > activeTokenIndex && !assignments[t.id]);
    if (nextUnassigned !== -1) {
      setActiveTokenIndex(nextUnassigned);
    } else if (activeTokenIndex + 1 < tokens.length) {
      setActiveTokenIndex(activeTokenIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (!allAssigned || hasSubmitted || disabled) return;
    setHasSubmitted(true);

    const isCorrect = tokens.every((t) => assignments[t.id] === t.correctCategory);
    onAnswer(isCorrect, assignments);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-in fade-in duration-200 text-left">
      {/* Verse Context Quote if available */}
      {payload.verseText && (
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
            {langPreference === "urdu" ? `قرآنی آیت کا سیاق (${payload.verseKey})` : `Quranic Context (${payload.verseKey})`}
          </span>
          <p
            className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-wide leading-relaxed"
            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
            dir="rtl"
          >
            {payload.verseText}
          </p>
        </div>
      )}

      {/* Active Token Card Showcase */}
      {currentToken && !hasSubmitted && (
        <div className="p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-center space-y-2 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {langPreference === "urdu"
              ? `کلمہ ${activeTokenIndex + 1} از ${tokens.length}`
              : `Token ${activeTokenIndex + 1} of ${tokens.length}`}
          </span>
          <div
            className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-wide"
            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
            dir="rtl"
          >
            {currentToken.textArabic}
          </div>

          <div className="space-y-0.5">
            {(langPreference === "urdu" || langPreference === "bilingual") && currentToken.translationUrdu ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-bold" dir="rtl">
                "{currentToken.translationUrdu}"
              </p>
            ) : null}
            {langPreference !== "urdu" && (
              <p className="text-xs text-[var(--muted-foreground)] font-medium">
                "{currentToken.translationEn || currentToken.transliteration}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3 Interactive Color-Coded Buckets with Authentic Urdu & English Terminology */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Bucket 1: Ism (Noun) */}
        <button
          type="button"
          disabled={disabled || hasSubmitted || !currentToken}
          onClick={() => handleAssignCurrent("ism")}
          className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1.5 cursor-pointer active:scale-95 ${
            currentToken && assignments[currentToken.id] === "ism"
              ? "bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-200 shadow-md shadow-blue-500/20 scale-102 font-bold"
              : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300"
          }`}
        >
          <Layers className="w-5 h-5 mx-auto text-blue-500" />
          <span
            className="text-lg font-bold block"
            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
          >
            اسم
          </span>
          <span className="text-xs font-bold block">
            {langPreference === "urdu" ? "اسم (Ism)" : "Ism (Noun)"}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] block leading-tight">
            {langPreference === "urdu"
              ? "شخص، جگہ، چیز یا صفت"
              : langPreference === "bilingual"
              ? "Noun / صفت / ضمیر"
              : "Person, thing, or attribute"}
          </span>
        </button>

        {/* Bucket 2: Fi'l (Verb) */}
        <button
          type="button"
          disabled={disabled || hasSubmitted || !currentToken}
          onClick={() => handleAssignCurrent("fil")}
          className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1.5 cursor-pointer active:scale-95 ${
            currentToken && assignments[currentToken.id] === "fil"
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-md shadow-emerald-500/20 scale-102 font-bold"
              : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <Zap className="w-5 h-5 mx-auto text-emerald-500" />
          <span
            className="text-lg font-bold block"
            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
          >
            فعل
          </span>
          <span className="text-xs font-bold block">
            {langPreference === "urdu" ? "فعل (Fi'l)" : "Fi'l (Verb)"}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] block leading-tight">
            {langPreference === "urdu"
              ? "زمانہ سے جڑا کام یا عمل"
              : langPreference === "bilingual"
              ? "Verb / کام و زمانہ"
              : "Action with tense"}
          </span>
        </button>

        {/* Bucket 3: Harf (Particle) */}
        <button
          type="button"
          disabled={disabled || hasSubmitted || !currentToken}
          onClick={() => handleAssignCurrent("harf")}
          className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1.5 cursor-pointer active:scale-95 ${
            currentToken && assignments[currentToken.id] === "harf"
              ? "bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 shadow-md shadow-rose-500/20 scale-102 font-bold"
              : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <Compass className="w-5 h-5 mx-auto text-rose-500" />
          <span
            className="text-lg font-bold block"
            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
          >
            حرف
          </span>
          <span className="text-xs font-bold block">
            {langPreference === "urdu" ? "حرف (Harf)" : "Harf (Particle)"}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] block leading-tight">
            {langPreference === "urdu"
              ? "حرفِ جر، عطف یا ربط"
              : langPreference === "bilingual"
              ? "Particle / کلمہ ربط"
              : "Preposition or particle"}
          </span>
        </button>
      </div>

      {/* Tokens Review List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">
          {langPreference === "urdu" ? "آیت کے کلمات کی درجہ بندی:" : "Tokens Classification:"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tokens.map((token, idx) => {
            const assigned = assignments[token.id];
            const isTarget = idx === activeTokenIndex && !hasSubmitted;

            let badgeColor = "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)]";
            if (assigned === "ism") badgeColor = "bg-blue-500/15 border-blue-400 text-blue-700 dark:text-blue-300 font-bold";
            if (assigned === "fil") badgeColor = "bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold";
            if (assigned === "harf") badgeColor = "bg-rose-500/15 border-rose-400 text-rose-700 dark:text-rose-300 font-bold";

            return (
              <button
                key={token.id}
                type="button"
                disabled={hasSubmitted || disabled}
                onClick={() => setActiveTokenIndex(idx)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${badgeColor} ${
                  isTarget ? "ring-2 ring-emerald-500 scale-102 shadow-sm" : ""
                }`}
              >
                <span
                  className="font-bold text-sm text-[var(--foreground)]"
                  style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  dir="rtl"
                >
                  {token.textArabic}
                </span>
                <span className="text-[10px] uppercase font-bold font-mono">
                  {assigned || "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!allAssigned || hasSubmitted || disabled}
          onClick={handleSubmit}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 active:scale-98"
        >
          {langPreference === "urdu" ? "درجہ بندی کی تصدیق کریں" : "Verify Grammatical Classification"}
        </button>
      </div>
    </div>
  );
}
