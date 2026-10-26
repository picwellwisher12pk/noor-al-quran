"use client";

import React from "react";
import {
  Trophy,
  AlertCircle,
  Zap,
  Sparkles,
  Flame,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";

export interface SessionSummaryModalProps {
  score: number;
  total: number;
  isTestMode: boolean;
  heartsRemaining: number;
  xpEarned: number;
  gemsEarned: number;
  missedWords: Array<{ id: string; textArabic: string; translationEn: string; translationUrdu?: string }>;
  nodeUnlocked?: boolean;
  onContinue: () => void;
  onRetry: () => void;
}

export function SessionSummaryModal({
  score,
  total,
  isTestMode,
  heartsRemaining,
  xpEarned,
  gemsEarned,
  missedWords,
  nodeUnlocked = false,
  onContinue,
  onRetry
}: SessionSummaryModalProps) {
  const { currentStreak, langPreference } = useLearningStore();
  const accuracyPct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPassed = !isTestMode || (heartsRemaining > 0 && accuracyPct >= 85);
  const isUrdu = langPreference === "urdu";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Top Trophy / Badge Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
            isPassed
              ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-emerald-500/30"
              : "bg-rose-500/20 border-2 border-rose-400 text-rose-400 shadow-rose-500/30"
          }`}
        >
          {isPassed ? <Trophy className="w-10 h-10 animate-bounce" /> : <AlertCircle className="w-10 h-10" />}
        </div>

        {/* Title & Feedback */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isPassed
              ? isUrdu
                ? "ماشاء الله! سیشن مکمل ہوا"
                : "Masha'Allah! Session Completed!"
              : isUrdu
              ? "امتحان نامکمل رہ گیا"
              : "Test Incomplete"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {isPassed
              ? isTestMode
                ? isUrdu
                  ? "مبارک ہو! آپ نے امتحانی معیار پر پورا اتر کر اگلا سبق انلاک کر لیا ہے۔"
                  : "Certified! You hit 85%+ accuracy under test pressure and unlocked the next node."
                : isUrdu
                ? "شاندار مشق! قرآنی الفاظ اور قواعد پر آپ کا فہم مزید پختہ ہو گیا ہے۔"
                : "Great practice round! Your Quranic vocabulary mastery has been updated."
              : isUrdu
              ? "۸۵٪ درستگی درکار تھی۔ دل دوبارہ بھرنے پر دوبارہ کوشش کریں۔"
              : "85% accuracy required to clear this certification gate. Regenerate hearts and try again!"}
          </p>
        </div>

        {/* Score & Rewards Matrix */}
        <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase block">
              {isUrdu ? "درستگی" : "Accuracy"}
            </span>
            <span className="text-xl font-black text-white font-mono">{accuracyPct}%</span>
          </div>

          <div className="border-x border-white/10">
            <span className="text-[10px] font-bold text-white/40 uppercase block">
              {isUrdu ? "حاصل شدہ XP" : "Total XP"}
            </span>
            <span className="text-xl font-black text-purple-400 font-mono">+{xpEarned}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase block">
              {isUrdu ? "جواہرات" : "Gems"}
            </span>
            <span className="text-xl font-black text-blue-400 font-mono">+{gemsEarned}</span>
          </div>
        </div>

        {/* Missed Words / SRS Warning */}
        {missedWords.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>{isUrdu ? "کمزور الفاظ ریویو والٹ میں محفوظ:" : "Missed Words (Added to Review Vault):"}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missedWords.map((w) => (
                <span
                  key={w.id}
                  className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-1"
                >
                  <span style={{ fontFamily: "Amiri, Scheherazade, serif" }}>{w.textArabic}</span>
                  <span className="text-[10px] text-white/40 font-normal">
                    ({w.translationUrdu || w.translationEn})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Unlocked Node Celebration */}
        {nodeUnlocked && isPassed && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUrdu ? "اگلا قرآنی سبق انلاک ہو گیا!" : "Next Node Unlocked on the Path of Light!"}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isPassed && (
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isUrdu ? "دوبارہ کوشش کریں" : "Retry Round"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>{isUrdu ? "جاری رکھیں" : "Continue Journey"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
