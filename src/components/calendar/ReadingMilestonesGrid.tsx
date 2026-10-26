"use client";

import React from "react";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  Star,
  Award,
} from "lucide-react";
import { ReadingStreakSummary } from "@/services/readingActivityService";

interface ReadingMilestonesGridProps {
  summary: ReadingStreakSummary;
}

interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "streak" | "verses" | "study";
  isUnlocked: boolean;
  progressText: string;
}

export function ReadingMilestonesGrid({ summary }: ReadingMilestonesGridProps) {
  const {
    currentStreak,
    longestStreak,
    totalAyahsRead,
    totalWordsStudied,
  } = summary;

  const milestones: MilestoneDef[] = [
    {
      id: "first_ayah",
      title: "First Step to Light",
      description: "Recite or read your very first Ayah",
      icon: <BookOpen className="h-5 w-5 text-emerald-400" />,
      category: "verses",
      isUnlocked: totalAyahsRead >= 1,
      progressText: totalAyahsRead >= 1 ? "Completed" : `${totalAyahsRead}/1 Ayah`,
    },
    {
      id: "streak_3",
      title: "Three Days of Noor",
      description: "Maintain a 3-day continuous daily streak",
      icon: <Flame className="h-5 w-5 text-amber-400" />,
      category: "streak",
      isUnlocked: longestStreak >= 3,
      progressText: longestStreak >= 3 ? "Achieved" : `${Math.min(3, currentStreak)}/3 Days`,
    },
    {
      id: "streak_7",
      title: "Sunnah Consistency",
      description: "Achieve a full 7-day devotion streak",
      icon: <Star className="h-5 w-5 text-amber-400" />,
      category: "streak",
      isUnlocked: longestStreak >= 7,
      progressText: longestStreak >= 7 ? "Achieved" : `${Math.min(7, currentStreak)}/7 Days`,
    },
    {
      id: "ayahs_100",
      title: "Century of Verses",
      description: "Read 100 Ayahs across your holy journey",
      icon: <Award className="h-5 w-5 text-emerald-300" />,
      category: "verses",
      isUnlocked: totalAyahsRead >= 100,
      progressText: totalAyahsRead >= 100 ? "Completed" : `${totalAyahsRead}/100 Ayahs`,
    },
    {
      id: "streak_30",
      title: "Monthly Devotion",
      description: "Persevere for 30 consecutive days",
      icon: <Trophy className="h-5 w-5 text-amber-300" />,
      category: "streak",
      isUnlocked: longestStreak >= 30,
      progressText: longestStreak >= 30 ? "Achieved" : `${Math.min(30, currentStreak)}/30 Days`,
    },
    {
      id: "words_50",
      title: "Vocabulary Explorer",
      description: "Master 50 most frequent Quranic words in Learn Studio",
      icon: <Sparkles className="h-5 w-5 text-teal-300" />,
      category: "study",
      isUnlocked: totalWordsStudied >= 50,
      progressText: totalWordsStudied >= 50 ? "Completed" : `${totalWordsStudied}/50 Words`,
    },
  ];

  const unlockedCount = milestones.filter((m) => m.isUnlocked).length;

  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-5 sm:p-7 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-1.5">
            <Trophy className="h-3 w-3" />
            <span>Spiritual Milestones</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            Consistency Achievements
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Badges earned purely through your authentic reading records
          </p>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {unlockedCount} / {milestones.length}
          </span>
          <div className="text-[10px] text-[var(--muted-foreground)]">Unlocked</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-5">
        {milestones.map((m) => {
          return (
            <div
              key={m.id}
              className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                m.isUnlocked
                  ? "bg-[var(--surface-card)] border-emerald-500/30 shadow-sm"
                  : "bg-[var(--surface-card)]/50 border-[var(--border-subtle)] opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                    {m.icon}
                  </div>
                  {m.isUnlocked ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      <CheckCircle2 className="h-3 w-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-raised)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]">
                      <Lock className="h-2.5 w-2.5" /> Locked
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[var(--foreground)] mb-1">{m.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--muted-foreground)]">Progress</span>
                <span
                  className={m.isUnlocked ? "text-emerald-400 font-bold" : "text-[var(--muted-foreground)]"}
                >
                  {m.progressText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
