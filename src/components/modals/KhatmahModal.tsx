"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { useKhatmah } from "@/context/KhatmahContext";
import { TOTAL_QURAN_VERSES } from "@/utils/quranMeta";
import { Calendar, CheckCircle2, Flame, Award, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface KhatmahModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KhatmahModal({ isOpen, onClose }: KhatmahModalProps) {
  const { plan, targetInfo, startKhatmahPlan, resetKhatmahPlan } = useKhatmah();

  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>("30");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const presets = [
    { days: 7, label: "7 Days (Sunnah Manzil)", note: "Authentic Prophetic pace (Fami Bi-Shawq) • ~891 ayahs/day" },
    { days: 10, label: "10 Days", note: "~624 ayahs/day (3 Juz/day)" },
    { days: 14, label: "14 Days", note: "~446 ayahs/day (2.1 Juz/day)" },
    { days: 30, label: "30 Days (Standard Month)", note: "1 Juz/day • ~208 ayahs/day" },
  ];

  const handleSelectPreset = (days: number) => {
    setSelectedDays(days);
    setIsCustom(false);
    setErrorMessage(null);
  };

  const handleCustomChange = (val: string) => {
    setCustomDays(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setSelectedDays(num);
      if (num < 7) {
        setErrorMessage("As per authentic Prophetic guidance, the Quran must not be completed in less than 7 days.");
      } else {
        setErrorMessage(null);
      }
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays < 7) {
      setErrorMessage("Minimum completion time is 7 days as instructed in the Sunnah.");
      return;
    }
    const res = startKhatmahPlan(selectedDays);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || "Failed to create plan.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-500" />
          <span>Khatmah & Daily Reading Goal (ختمة القرآن)</span>
        </div>
      }
    >
      {/* If Plan is Active */}
      {plan && targetInfo ? (
        <div className="space-y-6">
          {/* Active Summary Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[var(--surface-raised,#141e1a)] to-emerald-950/20 border border-emerald-800/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Active Khatmah
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                  Day {targetInfo.dayNumber} of {targetInfo.totalDays}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>{plan.currentStreak} Day Streak</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[var(--muted-foreground,#8e9b94)] mb-1.5 font-medium">
                <span>Progress: {plan.completedAyahsCount} of {TOTAL_QURAN_VERSES} Ayahs</span>
                <span className="text-emerald-400">{targetInfo.percentageCompleted.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--surface-card,#182520)] rounded-full overflow-hidden border border-[var(--border-subtle,#24362e)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${targetInfo.percentageCompleted}%` }}
                />
              </div>
            </div>

            {/* Today's Target Details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--surface-card,#182520)]/80 border border-[var(--border-subtle,#24362e)] text-xs">
              <div>
                <span className="text-[var(--muted-foreground,#8e9b94)] block mb-1">Today&apos;s Target:</span>
                <span className="font-semibold text-emerald-400">
                  Surah {targetInfo.targetStart.chapterId}:{targetInfo.targetStart.verseNumber} → {targetInfo.targetEnd.chapterId}:{targetInfo.targetEnd.verseNumber}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground,#8e9b94)] block mb-1">Pace Status:</span>
                <span className={`font-semibold capitalize ${
                  targetInfo.paceStatus === "ahead" ? "text-emerald-400" : targetInfo.paceStatus === "behind" ? "text-amber-400" : "text-teal-300"
                }`}>
                  {targetInfo.paceStatus === "ahead" ? "Ahead of Schedule" : targetInfo.paceStatus === "behind" ? "Slightly Behind" : "On Track"}
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-5 flex gap-2">
              <Link
                href={`/surah/${targetInfo.targetStart.chapterId}?ayah=${targetInfo.targetStart.verseNumber}`}
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <span>Read Today&apos;s Portion</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Reset Confirmation */}
          {confirmReset ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 space-y-2 text-xs">
              <p className="text-red-200 font-medium">Are you sure you want to cancel and reset this Khatmah plan?</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetKhatmahPlan();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-[var(--muted-foreground,#8e9b94)] hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset or Change Plan
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Create New Plan Form */
        <form onSubmit={handleStart} className="space-y-6">
          {/* Prophetic Guidance Alert */}
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-4 text-xs leading-relaxed text-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <Award className="h-4 w-4" />
              <span>Prophetic Rule: Minimum 7 Days</span>
            </div>
            <p className="text-[var(--muted-foreground,#8e9b94)]">
              Narrated Abdullah ibn Amr: The Prophet (ﷺ) said:
              <em className="text-emerald-300"> &ldquo;Do not finish reading the Quran in less than seven days.&rdquo;</em>
              — <span className="font-mono text-[11px]">Sahih al-Bukhari 5052, Sahih Muslim 1159</span>.
            </p>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground,#8e9b94)] block mb-3">
              Choose Target Completion Duration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((p) => {
                const isSelected = !isCustom && selectedDays === p.days;
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => handleSelectPreset(p.days)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500"
                        : "border-[var(--border-subtle,#24362e)] bg-[var(--surface-raised,#141e1a)] hover:border-emerald-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm text-[var(--foreground)]">{p.label}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-[var(--muted-foreground,#8e9b94)] leading-tight">{p.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration Option */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--border-subtle,#24362e)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--foreground)]">Or enter custom days (≥ 7):</span>
              <input
                type="number"
                min={7}
                max={365}
                value={customDays}
                onChange={(e) => {
                  setIsCustom(true);
                  handleCustomChange(e.target.value);
                }}
                className="w-24 px-3 py-1.5 rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs text-right text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
              />
            </div>
            {isCustom && selectedDays >= 7 && (
              <p className="text-[11px] text-emerald-400">
                Pace: ~{Math.ceil(TOTAL_QURAN_VERSES / selectedDays)} Ayahs per day
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={selectedDays < 7}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Start {selectedDays}-Day Khatmah Plan
          </button>
        </form>
      )}
    </Modal>
  );
}
