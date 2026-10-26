"use client";

import React, { useState } from "react";
import {
  X,
  Compass,
  Trophy,
  Zap,
  Clock,
  Heart,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";
import { SkillNode } from "../../data/learning/curriculumData";

export function ModeSelectorModal() {
  const {
    selectedNode,
    isModeSelectorOpen,
    closeModeSelector,
    startSession,
    getHeartCount,
    nodeStars,
    langPreference
  } = useLearningStore();

  const [selectedMode, setSelectedMode] = useState<"practice" | "test" | "blitz">("practice");

  if (!isModeSelectorOpen || !selectedNode) return null;

  const currentHearts = getHeartCount();
  const stars = nodeStars[selectedNode.id] || 0;
  const isTestDisabled = currentHearts <= 0;

  const handleLaunch = () => {
    startSession(selectedMode, selectedNode);
  };

  const isUrdu = langPreference === "urdu";
  const isBilingual = langPreference === "bilingual";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--modal-bg)] border border-[var(--card-border)] p-6 sm:p-8 shadow-2xl space-y-6 text-left transition-colors">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModeSelector}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Node Header Banner */}
        <div className="space-y-1 pr-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isUrdu ? `مرحلہ ${selectedNode.phaseNumber}` : `Stage ${selectedNode.phaseNumber}`}
            </span>
            <span className="text-[var(--muted-foreground)]/40">•</span>
            <span className="text-xs text-[var(--muted-foreground)] font-mono">~{selectedNode.estimatedMinutes}m</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            {isUrdu ? (selectedNode.titleUrdu || selectedNode.title) : selectedNode.title}
          </h2>
          {isBilingual && selectedNode.titleUrdu && (
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300" dir="rtl">
              {selectedNode.titleUrdu}
            </p>
          )}
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {isUrdu ? (selectedNode.descriptionUrdu || selectedNode.description) : selectedNode.description}
          </p>
        </div>

        {/* 3 Play Modes Selection Cards */}
        <div className="space-y-3">
          {/* Option 1: Practice Mode (Sandbox) */}
          <div
            onClick={() => setSelectedMode("practice")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedMode === "practice"
                ? "bg-emerald-500/10 border-emerald-500 text-[var(--foreground)] shadow-sm"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    {isUrdu ? "مشق کا موڈ (Sandbox)" : "Practice Mode (Sandbox)"}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isUrdu
                      ? "لامحدود زندگیاں، اشارے، اور فوری صوتی و گرامر فیڈ بیک"
                      : "Untimed, infinite lives, instant grammar hints & pronunciation"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">1x XP</span>
            </div>
          </div>

          {/* Option 2: Test Mode (Arena) */}
          <div
            onClick={() => {
              if (!isTestDisabled) setSelectedMode("test");
            }}
            className={`p-4 rounded-2xl border-2 transition-all ${
              isTestDisabled
                ? "opacity-40 cursor-not-allowed bg-[var(--surface-card)] border-[var(--border-subtle)]"
                : selectedMode === "test"
                ? "bg-amber-500/10 border-amber-500 text-[var(--foreground)] shadow-sm cursor-pointer"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--foreground)] cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">
                      {isUrdu ? "امتحانی میدان (Certification)" : "Test Mode (Certification)"}
                    </h4>
                    {isTestDisabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                        {isUrdu ? "دل درکار ہیں" : "Need Hearts"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isUrdu
                      ? "۱۵ سیکنڈ وقت، ۳ قلوب، ۸۵٪ کامیابی کی شرط اور ۳ گنا XP"
                      : "15s timer, 3 hearts max, 85%+ required to unlock next node"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400">3x XP</span>
            </div>
          </div>

          {/* Option 3: SRS Weak-Word Blitz */}
          <div
            onClick={() => setSelectedMode("blitz")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedMode === "blitz"
                ? "bg-purple-500/10 border-purple-500 text-[var(--foreground)] shadow-sm"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--foreground)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    {isUrdu ? "کمزور الفاظ کا فوری جائزہ (Weak-Word Blitz)" : "SRS Weak-Word Blitz"}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isUrdu
                      ? "سابقہ غلطیوں کا جائزہ اور یادداشت کو پختہ بنانا"
                      : "5-question blitz focused strictly on previously missed items"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-purple-700 dark:text-purple-400">2x XP</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>
              {isUrdu
                ? selectedMode === "test"
                  ? "امتحان شروع کریں"
                  : selectedMode === "blitz"
                  ? "بلٹز سیشن شروع کریں"
                  : "مشق شروع کریں"
                : `Start ${selectedMode.toUpperCase()} Session`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
