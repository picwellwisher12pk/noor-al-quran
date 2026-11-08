"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Gamepad2,
  Sparkles,
  BookMarked,
  ShieldAlert,
  Flame,
  Zap,
  Heart,
} from "lucide-react";
import { useLearningStore } from "@/store/useLearningStore";
import { useLanguage } from "@/context/LanguageContext";

export function LearningNavBar() {
  const pathname = usePathname();
  const { isUrdu } = useLanguage();
  const {
    currentStreak,
    totalXP,
    getHeartCount,
    getWeakWords,
    toggleReviewVault
  } = useLearningStore();

  const weakWords = getWeakWords();
  const heartsCount = getHeartCount();

  const navItems = [
    {
      href: "/learn",
      labelEn: "Hub",
      labelUrdu: "مرکز",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/learn/sirat",
      labelEn: "My Path",
      labelUrdu: "صراطِ نور",
      icon: Compass,
      exact: false,
    },
    {
      href: "/learn/flashcards",
      labelEn: "Practice Cards",
      labelUrdu: "کارڈز",
      icon: BookOpen,
      exact: false,
    },
    {
      href: "/learn/arcade",
      labelEn: "Mini Games",
      labelUrdu: "گیمز",
      icon: Gamepad2,
      exact: false,
    },
    {
      href: "/learn/word-bank",
      labelEn: "Word Explorer",
      labelUrdu: "ذخیرہ الفاظ",
      icon: Sparkles,
      exact: false,
    },
    {
      href: "/learn/grammar",
      labelEn: "Grammar & Verbs",
      labelUrdu: "قواعد و صرف",
      icon: BookMarked,
      exact: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[var(--background)]/90 border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Links */}
        <nav
          aria-label="Learning Sections"
          className="p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] flex items-center gap-1 overflow-x-auto max-w-full"
        >
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{isUrdu ? item.labelUrdu : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Tools: Streak, XP, & SRS Review Vault */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              currentStreak > 0
                ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)]"
            }`}
            title="Daily Istiqamah Streak"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                currentStreak > 0 ? "text-amber-500 fill-amber-500" : "text-[var(--muted-foreground)]"
              }`}
            />
            <span>{currentStreak}d</span>
          </div>

          {/* XP Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold"
            title="Total Experience Points"
          >
            <Zap className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
            <span>{totalXP.toLocaleString()} XP</span>
          </div>

          {/* Hearts Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              heartsCount <= 1
                ? "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 animate-pulse"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
            title={`${heartsCount}/5 Hearts (Regenerates 1 every 30 mins)`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{heartsCount}/5</span>
          </div>

          {/* SRS Review Vault Badge */}
          <button
            type="button"
            onClick={() => toggleReviewVault(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              weakWords.length > 0
                ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-sm"
                : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
            }`}
            title="SRS Review Vault (Words due for practice)"
          >
            <ShieldAlert
              className={`w-3.5 h-3.5 ${
                weakWords.length > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-[var(--muted-foreground)]"
              }`}
            />
            <span>
              {isUrdu ? "دہرائی" : "Review"} ({weakWords.length})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
