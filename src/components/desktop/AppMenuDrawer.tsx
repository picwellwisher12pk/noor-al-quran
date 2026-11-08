"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/common/Modal";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { useLearningStore } from "@/store/useLearningStore";
import { APP_CONFIG } from "@/config/version";
import { reconcileProgress } from "@/services/googleDriveSync";
import { LearnerAgeGroup, LEARNER_AVATARS, AGE_TIER_META } from "@/types/learnerProfile";
import {
  BookOpen,
  Compass,
  Sparkles,
  Gamepad2,
  CalendarDays,
  Settings,
  CloudDownload,
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Layers,
  GraduationCap,
  Download,
  Upload,
  BookMarked
} from "lucide-react";

interface AppMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppMenuDrawer({ isOpen, onClose }: AppMenuDrawerProps) {
  const {
    user,
    isSignedIn,
    isSyncing,
    lastSyncedAt,
    syncError,
    signInWithGoogle,
    signOut,
    syncNow
  } = useGoogleAuth();

  const { themeMode, themeStyle, toggleThemeMode, setThemeStyle } = useTheme();
  const { isUrdu } = useLanguage();
  const { setIsSettingsOpen, setIsDownloadManagerOpen } = useDesktopWorkspace();
  const { currentStreak } = useReadingActivity();
  const { totalXP, learnerProfile, setLearnerAgeGroup, setLearnerProfile } = useLearningStore();

  const [authActionError, setAuthActionError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleSignIn = async () => {
    setAuthActionError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message?.includes("NO_CLIENT_ID")) {
        setAuthActionError(
          isUrdu
            ? "گوگل لاگ ان کلائنٹ آئی ڈی .env.local فائل میں سیٹ نہیں ہے۔"
            : "Google Client ID is not configured in .env.local yet."
        );
      } else {
        setAuthActionError(err.message || "Sign in failed");
      }
    }
  };

  const handleExportBackup = () => {
    try {
      const learnState = useLearningStore.getState();
      let bookmarks = [];
      let lastRead = null;
      let readingActivity: any = {};
      try {
        const rawBm = localStorage.getItem("naq_bookmarks");
        if (rawBm) bookmarks = JSON.parse(rawBm);
        const rawLr = localStorage.getItem("naq_last_read");
        if (rawLr) lastRead = JSON.parse(rawLr);
        const rawAct = localStorage.getItem("naq_reading_activity_v1");
        if (rawAct) readingActivity = JSON.parse(rawAct);
      } catch {}

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        learningStore: {
          totalXP: learnState.totalXP || 0,
          barakahGems: learnState.barakahGems || 0,
          currentStreak: learnState.currentStreak || 0,
          lastActiveDate: learnState.lastActiveDate || "",
          completedNodeIds: learnState.completedNodeIds || [],
          unlockedNodeIds: learnState.unlockedNodeIds || ["s1_u1_n1"],
          nodeStars: learnState.nodeStars || {},
          activeNodeId: learnState.activeNodeId || "s1_u1_n1",
          srsWords: learnState.srsWords || {},
          masteredWordIds: learnState.masteredWordIds || [],
          reviewWordIds: learnState.reviewWordIds || [],
          gameStats: learnState.gameStats || {},
          langPreference: learnState.langPreference || "bilingual",
        },
        readingActivity,
        bookmarks,
        lastRead,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `noor_al_quran_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setAuthActionError(e.message || "Export failed");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const learnState = useLearningStore.getState();
        const currentSnapshot = {
          version: 1,
          updatedAt: new Date().toISOString(),
          learningStore: {
            totalXP: learnState.totalXP || 0,
            barakahGems: learnState.barakahGems || 0,
            currentStreak: learnState.currentStreak || 0,
            lastActiveDate: learnState.lastActiveDate || "",
            completedNodeIds: learnState.completedNodeIds || [],
            unlockedNodeIds: learnState.unlockedNodeIds || ["s1_u1_n1"],
            nodeStars: learnState.nodeStars || {},
            activeNodeId: learnState.activeNodeId || "s1_u1_n1",
            srsWords: learnState.srsWords || {},
            masteredWordIds: learnState.masteredWordIds || [],
            reviewWordIds: learnState.reviewWordIds || [],
            gameStats: learnState.gameStats || {},
            langPreference: learnState.langPreference || "bilingual",
          },
        };

        const reconciled = reconcileProgress(currentSnapshot, parsed);
        if (reconciled.learningStore) {
          useLearningStore.setState({
            totalXP: reconciled.learningStore.totalXP,
            barakahGems: reconciled.learningStore.barakahGems,
            currentStreak: reconciled.learningStore.currentStreak,
            lastActiveDate: reconciled.learningStore.lastActiveDate,
            completedNodeIds: reconciled.learningStore.completedNodeIds,
            unlockedNodeIds: reconciled.learningStore.unlockedNodeIds,
            nodeStars: (reconciled.learningStore.nodeStars || {}) as Record<string, 1 | 2 | 3>,
            activeNodeId: reconciled.learningStore.activeNodeId,
            srsWords: reconciled.learningStore.srsWords,
            masteredWordIds: reconciled.learningStore.masteredWordIds,
            reviewWordIds: reconciled.learningStore.reviewWordIds,
            gameStats: reconciled.learningStore.gameStats,
          });
        }

        if (reconciled.bookmarks) {
          localStorage.setItem("naq_bookmarks", JSON.stringify(reconciled.bookmarks));
        }
        if (reconciled.readingActivity) {
          localStorage.setItem("naq_reading_activity_v1", JSON.stringify(reconciled.readingActivity));
        }

        setAuthActionError(null);
        setImportSuccess(
          isUrdu
            ? "بیک اپ فائل کامیابی کے ساتھ بحال اور ضم کر دی گئی!"
            : "Backup file restored and merged successfully!"
        );
        setTimeout(() => setImportSuccess(null), 5000);
      } catch (err: any) {
        setAuthActionError("Invalid backup file: " + (err.message || "Failed to parse JSON"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatLastSynced = (iso: string | null) => {
    if (!iso) return isUrdu ? "ابھی تک نہیں" : "Never";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  const navItems = [
    {
      href: "/",
      labelEn: "Noble Quran Reader",
      labelUrdu: "مصحف قرآن کریم",
      descEn: "114 Surahs with Uthmani script & Tafsir",
      descUrdu: "۱۱۴ سورتیں، عثمانی رسم الخط اور تفاسیر",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      href: "/learn",
      labelEn: "Learning Platform Hub",
      labelUrdu: "الفاظ و تعلیم کا مرکز",
      descEn: "Track 70% Quran vocabulary & daily goals",
      descUrdu: "قرآنی الفاظ، سنگ ہائے میل اور یومیہ اہداف",
      icon: GraduationCap,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20"
    },
    {
      href: "/learn/sirat",
      labelEn: "Sirat Path Roadmap",
      labelUrdu: "صراطِ نور روڈ میپ",
      descEn: "5-stage skill tree from Alphabet to Surahs",
      descUrdu: "حروفِ تہجی سے فہمِ قرآن تک ۵ مراحل",
      icon: Compass,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      href: "/learn/flashcards",
      labelEn: "Spaced Practice Cards",
      labelUrdu: "فلیش کارڈز مشق",
      descEn: "Leitner spaced repetition for high-frequency words",
      descUrdu: "تکرارِ یادداشت کے ذریعے الفاظ پختہ کریں",
      icon: Layers,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      href: "/learn/arcade",
      labelEn: "Quranic Mini Games",
      labelUrdu: "قرآنی منی گیمز",
      descEn: "Ayah Puzzle, Root Radar & Match Blitz",
      descUrdu: "آیت پزل، روٹ راڈار اور میچ بلٹز گیمز",
      icon: Gamepad2,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20"
    },
    {
      href: "/learn/word-bank",
      labelEn: "Vocabulary Explorer",
      labelUrdu: "ذخیرہ الفاظ کا جائزہ",
      descEn: "Browse all 1,200+ distinct Quran words",
      descUrdu: "قرآن کے ۱۲۰۰+ منتخب الفاظ و تراجم",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      href: "/learn/grammar",
      labelEn: "Grammar & Verbs Studio",
      labelUrdu: "قواعد و صرف سٹوڈیو",
      descEn: "10 Verb Forms (Sarf), I'rab cases & syntax rules",
      descUrdu: "۱۰ قرآنی ابواب، اعراب، مرکبات اور نحوی قواعد",
      icon: BookMarked,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      href: "/calendar",
      labelEn: "Reading Calendar & Heatmap",
      labelUrdu: "مطالعہ کیلنڈر اور ہاٹ میپ",
      descEn: "Daily reading logs, consistency streaks & milestones",
      descUrdu: "روزانہ تلاوت کا ریکارڈ، تسلسل اور اسباق",
      icon: CalendarDays,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              {isUrdu ? "نور القرآن مینو و سیٹنگز" : "Noor Al-Quran Menu & Hub"}
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu ? "کلاؤڈ بیک اپ، نیویگیشن اور ورک سٹیشن سیٹنگز" : "Cloud Backup, Navigation & Workstation Tools"}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* 1. Google Drive Cloud Backup & Profile Card */}
        <section className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                {isUrdu ? "گوگل ڈرائیو پرائیویٹ بیک اپ" : "Google Drive Private Backup"}
              </span>
            </div>
            {isSignedIn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {isUrdu ? "منسلک" : "Connected"}
              </span>
            )}
          </div>

          {isSignedIn && user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500/40 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-[var(--foreground)]">{user.name}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] truncate max-w-[220px] sm:max-w-xs">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign out of Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Sync Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted-foreground)]">
                    {isUrdu ? "آخری ہم آہنگی:" : "Last Synced:"}
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {formatLastSynced(lastSyncedAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={syncNow}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? (isUrdu ? "ہم آہنگ ہو رہا ہے..." : "Syncing...") : (isUrdu ? "ابھی ہم آہنگ کریں" : "Sync Now")}</span>
                </button>
              </div>

              {syncError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  {syncError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu
                  ? "اپنے سیکھنے کی رفتار، XP، اسباق اور بُک مارکس کو اپنے ذاتی گوگل ڈرائیو میں محفوظ رکھیں تاکہ کسی بھی ڈیوائس پر ڈیٹا ضائع نہ ہو۔ یہ ڈیٹا مکمل طور پر پرائیویٹ رہتا ہے۔"
                  : "Sync your learning streak, XP, milestones, and reading bookmarks privately into your own personal Google Drive AppData folder. Zero external servers; your data belongs entirely to you."}
              </p>

              {authActionError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  {authActionError}
                </p>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isUrdu ? "گوگل ڈرائیو کے ساتھ منسلک کریں" : "Connect Google Drive"}</span>
                </button>
              </div>
            </div>
          )}

          {/* File-Based Offline Backup & Restore */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu ? "یا آف لائن فائل بیک اپ:" : "Or Offline File Backup:"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] text-[11px] font-semibold transition-colors cursor-pointer"
                title="Download backup JSON file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isUrdu ? "ایکسپورٹ فائل" : "Export JSON"}</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] text-[11px] font-semibold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-cyan-500" />
                <span>{isUrdu ? "ریسٹور فائل" : "Restore JSON"}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
              {importSuccess}
            </p>
          )}
        </section>

        {/* 2. Learner Profile & Age Tier */}
        <section className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm">
                {LEARNER_AVATARS.find((a) => a.id === learnerProfile?.avatarId)?.emoji || "🧒"}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                {isUrdu ? "تعلیمی پروفائل اور عمر کا انتخاب" : "Learner Profile & Age Level"}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${AGE_TIER_META[learnerProfile?.ageGroup || "standard"].badgeColor}`}>
              {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].ageLabelUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].ageLabelEn}
            </span>
          </div>

          <div className="space-y-3">
            {/* 3 Age Tiers */}
            <div className="grid grid-cols-3 gap-2">
              {(["kids", "standard", "advanced"] as LearnerAgeGroup[]).map((tier) => {
                const meta = AGE_TIER_META[tier];
                const isSelected = (learnerProfile?.ageGroup || "standard") === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setLearnerAgeGroup(tier)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs"
                        : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="text-xl">{meta.iconEmoji}</span>
                    <span className="text-xs font-semibold">{isUrdu ? meta.titleUr.split(" ")[0] : meta.titleEn.split(" ")[0]}</span>
                    <span className="text-[10px] font-mono opacity-80">{isUrdu ? meta.ageLabelUr : meta.ageLabelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tier Description Banner */}
            <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)] space-y-1">
              <span className="font-semibold text-[var(--foreground)] block">
                {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].titleUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].titleEn}
              </span>
              <p className="text-[11px] leading-relaxed">
                {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].descUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].descEn}
              </p>
            </div>

            {/* Avatar Selector Strip */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
                {isUrdu ? "اوتار چنیں:" : "Choose Avatar:"}
              </span>
              <div className="flex items-center gap-1.5">
                {LEARNER_AVATARS.map((av) => {
                  const isAvSelected = (learnerProfile?.avatarId || "crescent") === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setLearnerProfile({ avatarId: av.id })}
                      title={isUrdu ? av.labelUr : av.labelEn}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                        isAvSelected
                          ? "bg-emerald-500/20 border-2 border-emerald-500 scale-110 shadow-xs"
                          : "bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:scale-105"
                      }`}
                    >
                      {av.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Fast Navigation Matrix */}
        <section className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block px-1">
            {isUrdu ? "قرآنی ورک سٹیشن نیویگیشن" : "Quick Workstation Navigation"}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/30 transition-all shadow-sm group cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                      <span>{isUrdu ? item.labelUrdu : item.labelEn}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50 group-hover:translate-x-0.5 transition-transform" />
                    </h4>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                      {isUrdu ? item.descUrdu : item.descEn}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. Appearance & Theme Controls */}
        <section className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              {isUrdu ? "ظاہری شکل اور تھیم" : "Appearance & Theme Style"}
            </span>

            <button
              type="button"
              onClick={toggleThemeMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {themeMode === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? "ڈارک موڈ" : "Dark Mode"}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isUrdu ? "لائٹ موڈ" : "Light Mode"}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "hadith", nameEn: "Hadith Classic", nameUrdu: "روایتی حدیث" },
              { id: "emerald", nameEn: "Emerald Oasis", nameUrdu: "زمردی نخلستان" },
              { id: "monochrome", nameEn: "OLED Noir", nameUrdu: "خالص سیاہ" }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeStyle(t.id as any)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                  themeStyle === t.id
                    ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {isUrdu ? t.nameUrdu : t.nameEn}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Reading Preferences & Offline Manager Shortcuts */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsSettingsOpen(true);
            }}
            className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  {isUrdu ? "قراءت و فونٹس سیٹنگز" : "Reading Preferences"}
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {isUrdu ? "فونٹ سائز، رسم الخط اور تراجم" : "Font sizes, script & translations"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsDownloadManagerOpen(true);
            }}
            className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <CloudDownload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  {isUrdu ? "آف لائن صوتی فائلیں" : "Offline Downloads"}
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {isUrdu ? "قراء تلاوتیں اور ڈاؤن لوڈ مینیجر" : "Reciter audio pre-caching"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </section>

        {/* 5. App Footer & Version */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <span>{APP_CONFIG.name}</span>
            <span>•</span>
            <span className="font-mono px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              v{APP_CONFIG.version}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentStreak > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {currentStreak}d Streak
              </span>
            )}
            {totalXP > 0 && (
              <span className="font-bold font-mono text-emerald-400">
                {totalXP} XP
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

