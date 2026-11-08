"use client";

import React, { useState } from "react";
import {
  Compass,
  Trophy,
  Zap,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { useLearningStore } from "../../store/useLearningStore";

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

  const currentHearts = typeof getHeartCount === "function" ? getHeartCount() : 5;
  const isTestDisabled = currentHearts <= 0;

  const handleLaunch = () => {
    startSession(selectedMode, selectedNode);
  };

  const isUrdu = langPreference === "urdu";
  const isBilingual = langPreference === "bilingual";

  return (
    <Modal
      isOpen={isModeSelectorOpen}
      onClose={closeModeSelector}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <span className="font-bold">
            {isUrdu ? "طریقۂ کار کا انتخاب" : "Choose Learning Mode"}
          </span>
        </div>
      }
    >
      <div className="space-y-6 text-left">
        {/* Node Header Banner */}
        <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isUrdu ? `مرحلہ ${selectedNode.phaseNumber}` : `Stage ${selectedNode.phaseNumber}`}
            </span>
            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              ~{selectedNode.estimatedMinutes}m
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
            {isUrdu ? (selectedNode.titleUrdu || selectedNode.title) : selectedNode.title}
          </h2>

          <div className="flex items-center justify-between gap-2">
            {selectedNode.titleArabic && (
              <span
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                dir="rtl"
              >
                {selectedNode.titleArabic}
              </span>
            )}
            {isBilingual && selectedNode.titleUrdu && (
              <p className="text-xs font-bold text-[var(--muted-foreground)]" dir="rtl">
                {selectedNode.titleUrdu}
              </p>
            )}
          </div>

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pt-1">
            {isUrdu
              ? (selectedNode.descriptionUrdu || selectedNode.description)
              : selectedNode.description}
          </p>
        </div>

        {/* 3 Play Modes Selection Cards */}
        <div className="space-y-3">
          {/* Option 1: Practice Mode (Sandbox) */}
          <button
            type="button"
            onClick={() => setSelectedMode("practice")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedMode === "practice"
                ? "bg-emerald-500/10 border-emerald-500 shadow-sm"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
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
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 shrink-0 pl-2">
                1x XP
              </span>
            </div>
          </button>

          {/* Option 2: Test Mode (Arena) */}
          <button
            type="button"
            disabled={isTestDisabled}
            onClick={() => setSelectedMode("test")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              isTestDisabled
                ? "opacity-40 cursor-not-allowed bg-[var(--surface-card)] border-[var(--border-subtle)]"
                : selectedMode === "test"
                ? "bg-amber-500/10 border-amber-500 shadow-sm cursor-pointer"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
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
              <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 shrink-0 pl-2">
                3x XP
              </span>
            </div>
          </button>

          {/* Option 3: SRS Weak-Word Blitz */}
          <button
            type="button"
            onClick={() => setSelectedMode("blitz")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedMode === "blitz"
                ? "bg-purple-500/10 border-purple-500 shadow-sm"
                : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
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
              <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 shrink-0 pl-2">
                2x XP
              </span>
            </div>
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
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
    </Modal>
  );
}
