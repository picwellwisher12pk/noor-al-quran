"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/common/Modal";
import { useTheme } from "@/context/ThemeContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useDesktopWorkspace, SettingsModalTab } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import { useLearningStore } from "@/store/useLearningStore";
import { AVAILABLE_TRANSLATIONS, AVAILABLE_TAFSIRS } from "@/services/quranApi";
import { ArabicFontFamily, UrduFontFamily, ThemeStyle } from "@/types/quran";
import { LearnerAgeGroup, LEARNER_AVATARS, AGE_TIER_META } from "@/types/learnerProfile";
import { reconcileProgress } from "@/services/googleDriveSync";
import { APP_CONFIG } from "@/config/version";
import {
  Settings,
  Sparkles,
  Moon,
  Sun,
  Type,
  BookOpen,
  Languages,
  ScrollText,
  Volume2,
  Sliders,
  CloudDownload,
  GripHorizontal,
  AlignJustify,
  LayoutList,
  Check,
  Eye,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Download,
  Upload,
  GraduationCap,
  Compass,
  Layers,
  Gamepad2,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Command,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveSettings?: () => void;
  initialTab?: SettingsModalTab;
}

export function SettingsModal({
  isOpen,
  onClose,
  onOpenLiveSettings,
  initialTab,
}: SettingsModalProps) {
  const { settingsTab, setSettingsTab, readingMode, setReadingMode, setIsDownloadManagerOpen } =
    useDesktopWorkspace();

  const [activeTab, setActiveTab] = useState<SettingsModalTab>(initialTab || settingsTab || "theme");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (settingsTab) {
      setActiveTab(settingsTab);
    }
  }, [initialTab, settingsTab, isOpen]);

  const { themeStyle, themeMode, setThemeStyle, toggleThemeMode } = useTheme();
  const { isUrdu, language, setLanguage } = useLanguage();

  const {
    prefs,
    setArabicFontSize,
    setEnglishFontSize,
    setUrduFontSize,
    setTafsirFontSize,
    setArabicFont,
    setUrduFont,
    setWbwLanguage,
    toggleShowTranslation,
    toggleShowUrduTranslation,
    toggleShowTransliteration,
    toggleShowWordByWord,
    toggleAutoScroll,
    setSelectedUrduTranslationId,
    setSelectedTafsirId,
  } = useReadingPreferences();

  const { reciters, currentReciter, setReciter } = useAudio();

  // Google Auth & Sync
  const {
    user,
    isSignedIn,
    isSyncing,
    lastSyncedAt,
    syncError,
    signInWithGoogle,
    signOut,
    syncNow,
  } = useGoogleAuth();

  // Learning Store & Profile
  const { totalXP, learnerProfile, setLearnerAgeGroup, setLearnerProfile } = useLearningStore();
  const { currentStreak } = useReadingActivity();

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
        bookmarks,
        lastRead,
        readingActivity,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `noor-al-quran-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Failed to export backup: " + e.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
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

        setImportSuccess(
          isUrdu
            ? "بیک اپ کامیابی کے ساتھ بحال کر دیا گیا!"
            : "Data successfully restored from file!"
        );
      } catch (err: any) {
        alert("Invalid backup file: " + err.message);
      }
    };
    reader.readAsText(file);
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

  const fontOptions: { id: ArabicFontFamily; name: string; sample: string; fontClass: string }[] = [
    { id: "amiri", name: "Amiri (Medina Classical)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-amiri" },
    { id: "amiri-quran", name: "Amiri Quran (Uthmani Script)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-amiri-quran" },
    { id: "noto-naskh-arabic", name: "Noto Naskh (Standard Quranic)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-noto-naskh" },
    { id: "lateef", name: "Lateef (Easy South Asian)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-lateef" },
    { id: "scheherazade", name: "Scheherazade New (Classical)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-scheherazade" },
    { id: "noto-sans-arabic", name: "Noto Sans (Clean Modern)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-noto" },
    { id: "cairo", name: "Cairo (Geometric Modern)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-cairo" },
    { id: "nastaliq", name: "Noto Nastaliq (Indo-Pak Script)", sample: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", fontClass: "font-arabic-nastaliq" },
  ];

  const urduFontOptions: { id: UrduFontFamily; name: string; sample: string; fontClass: string }[] = [
    { id: "nastaliq", name: "Noto Nastaliq (Classic Calligraphic)", sample: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", fontClass: "font-urdu-nastaliq" },
    { id: "noto-sans-arabic", name: "Noto Sans (Modern Naskh)", sample: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", fontClass: "font-urdu-noto" },
    { id: "scheherazade", name: "Scheherazade (Classical Script)", sample: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", fontClass: "font-urdu-scheherazade" },
    { id: "amiri", name: "Amiri (Traditional Naskh)", sample: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", fontClass: "font-urdu-amiri" },
  ];

  const themes: { id: ThemeStyle; name: string; note: string; colorPreview: string }[] = [
    { id: "hadith", name: "Hadith Theme", note: "Teal accents & warm parchment / navy", colorPreview: "from-teal-600 to-cyan-800" },
    { id: "emerald", name: "Emerald & Gold", note: "Deep Islamic emerald & warm gold", colorPreview: "from-emerald-600 to-amber-700" },
    { id: "monochrome", name: "Monochrome OLED", note: "Pure contrast dark / crisp white", colorPreview: "from-zinc-700 to-zinc-950" },
  ];

  const urduTranslations = AVAILABLE_TRANSLATIONS.filter((t) => t.language === "urdu");

  // Show ONLY Urdu tafseers when language is Urdu
  const availableTafsirs = isUrdu
    ? AVAILABLE_TAFSIRS.filter((t) => t.language === "urdu")
    : AVAILABLE_TAFSIRS;

  const navItems = [
    {
      href: "/",
      labelEn: "Noble Quran Reader",
      labelUrdu: "مصحف قرآن کریم",
      descEn: "114 Surahs with Uthmani script & Tafsir",
      descUrdu: "۱۱۴ سورتیں، عثمانی رسم الخط اور تفاسیر",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      href: "/learn",
      labelEn: "Learning Platform Hub",
      labelUrdu: "الفاظ و تعلیم کا مرکز",
      descEn: "Track 70% Quran vocabulary & daily goals",
      descUrdu: "قرآنی الفاظ، سنگ ہائے میل اور یومیہ اہداف",
      icon: GraduationCap,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    },
    {
      href: "/learn/sirat",
      labelEn: "Sirat Path Roadmap",
      labelUrdu: "صراطِ نور روڈ میپ",
      descEn: "5-stage skill tree from Alphabet to Surahs",
      descUrdu: "حروفِ تہجی سے فہمِ قرآن تک ۵ مراحل",
      icon: Compass,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      href: "/learn/flashcards",
      labelEn: "Spaced Practice Cards",
      labelUrdu: "فلیش کارڈز مشق",
      descEn: "Leitner spaced repetition for high-frequency words",
      descUrdu: "تکرارِ یادداشت کے ذریعے الفاظ پختہ کریں",
      icon: Layers,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      href: "/learn/arcade",
      labelEn: "Quranic Mini Games",
      labelUrdu: "قرآنی منی گیمز",
      descEn: "Ayah Puzzle, Root Radar & Match Blitz",
      descUrdu: "آیت پزل، روٹ راڈار اور میچ بلٹز گیمز",
      icon: Gamepad2,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    {
      href: "/learn/word-bank",
      labelEn: "Vocabulary Explorer",
      labelUrdu: "ذخیرہ الفاظ کا جائزہ",
      descEn: "Browse all 1,200+ distinct Quran words",
      descUrdu: "قرآن کے ۱۲۰۰+ منتخب الفاظ و تراجم",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      href: "/learn/grammar",
      labelEn: "Grammar & Verbs Studio",
      labelUrdu: "قواعد و صرف سٹوڈیو",
      descEn: "10 Verb Forms (Sarf), I'rab cases & syntax rules",
      descUrdu: "۱۰ قرآنی ابواب، اعراب، مرکبات اور نحوی قواعد",
      icon: BookMarked,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      href: "/calendar",
      labelEn: "Reading Calendar & Heatmap",
      labelUrdu: "مطالعہ کیلنڈر اور ہاٹ میپ",
      descEn: "Daily reading logs, consistency streaks & milestones",
      descUrdu: "روزانہ تلاوت کا ریکارڈ، تسلسل اور اسباق",
      icon: CalendarDays,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
  ];

  const tabs: Array<{ id: SettingsModalTab; labelEn: string; labelUr: string; icon: React.ElementType }> = [
    { id: "navigation", labelEn: "Navigation Hub", labelUr: "مینو و صفحات", icon: Compass },
    { id: "account", labelEn: "Account & Cloud Sync", labelUr: "کلاؤڈ بیک اپ", icon: ShieldCheck },
    { id: "learner", labelEn: "Learner Tier & Profile", labelUr: "طلبہ زمرہ", icon: GraduationCap },
    { id: "theme", labelEn: "Theme & Mode", labelUr: "ظاہری شکل و تھیم", icon: Sparkles },
    { id: "typography", labelEn: "Fonts & Script", labelUr: "رسم الخط و فونٹس", icon: Type },
    { id: "languages", labelEn: "Language & Translations", labelUr: "زبان و تراجم", icon: Languages },
    { id: "tafseer", labelEn: "Tafseer Commentary", labelUr: "تفسیر قرآن", icon: ScrollText },
    { id: "audio", labelEn: "Audio & Reciters", labelUr: "تلاوت و قاری", icon: Volume2 },
    { id: "shortcuts", labelEn: "Shortcuts Cheat Sheet", labelUr: "شارٹ کٹس", icon: Command },
    { id: "live", labelEn: "Live Settings Panel", labelUr: "لائیو ترتیبات", icon: Sliders },
    { id: "storage", labelEn: "Storage & Offline", labelUr: "آف لائن ڈیٹا", icon: CloudDownload },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                {isUrdu ? "نور القرآن مینو و سیٹنگز" : "Noor Al-Quran Hub & Settings"}
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] -mt-0.5 font-normal">
                {isUrdu ? "کلاؤڈ بیک اپ، نیویگیشن، رسم الخط اور تفاسیر" : "Cloud Backup, Navigation, Fonts & Preferences"}
              </span>
            </div>
          </div>

          {/* Quick Action: Float Live Settings on Screen */}
          {onOpenLiveSettings && (
            <button
              type="button"
              onClick={onOpenLiveSettings}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title={isUrdu ? "تیرتی لائیو ترتیبات اسکرین پر کھولیں" : "Open floating live settings widget while reading"}
            >
              <GripHorizontal className="h-3.5 w-3.5" />
              <span>{isUrdu ? "لائیو پینل 🪟" : "Float Live Panel 🪟"}</span>
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col md:flex-row gap-4 min-h-[500px] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
        {/* Left Column: Vertical Tabs Rail */}
        <div className="w-full md:w-56 flex-none border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--surface-raised)]/40 p-2 sm:p-2.5 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  setSettingsTab(t.id);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm font-bold scale-[1.01]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                <span className="truncate">{isUrdu ? t.labelUr : t.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Tab Content Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[64vh] space-y-5">
          {/* ================= TAB 0: NAVIGATION MATRIX ================= */}
          {activeTab === "navigation" && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2 px-1">
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
                        className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-emerald-500/30 transition-all shadow-xs group cursor-pointer"
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
              </div>
            </div>
          )}

          {/* ================= TAB 1: GOOGLE CLOUD SYNC & BACKUP ================= */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      {isUrdu ? "گوگل ڈرائیو پرائیویٹ کلاؤڈ بیک اپ" : "Google Drive Private Cloud Sync"}
                    </span>
                  </div>
                  {isSignedIn && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {isUrdu ? "منسلک ہے" : "Connected"}
                    </span>
                  )}
                </div>

                {isSignedIn && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full border border-emerald-500/40" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{user.name}</h4>
                          <p className="text-[11px] text-[var(--muted-foreground)] truncate">{user.email}</p>
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

                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">{isUrdu ? "آخری ہم آہنگی:" : "Last Synced:"}</span>
                        <span className="font-semibold text-[var(--foreground)]">{formatLastSynced(lastSyncedAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={syncNow}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
                        ? "اپنے سیکھنے کی رفتار، XP، اسباق اور بُک مارکس کو اپنے ذاتی گوگل ڈرائیو میں محفوظ رکھیں تاکہ کسی بھی ڈیوائس پر ڈیٹا ضائع نہ ہو۔"
                        : "Sync your learning streak, XP, milestones, and reading bookmarks privately into your own personal Google Drive AppData folder."}
                    </p>

                    {authActionError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                        {authActionError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSignIn}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{isUrdu ? "گوگل ڈرائیو کے ساتھ منسلک کریں" : "Connect Google Drive"}</span>
                    </button>
                  </div>
                )}

                {/* Offline File Export/Import */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    {isUrdu ? "آف لائن فائل بیک اپ:" : "Offline JSON File Backup:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isUrdu ? "ایکسپورٹ فائل" : "Export JSON"}</span>
                    </button>

                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] text-[11px] font-semibold transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{isUrdu ? "ریسٹور فائل" : "Restore JSON"}</span>
                      <input type="file" accept=".json,application/json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>
                </div>

                {importSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                    {importSuccess}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: LEARNER TIER & AVATAR ================= */}
          {activeTab === "learner" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      {isUrdu ? "تعلیمی پروفائل اور عمر کا انتخاب" : "Learner Profile & Age Level"}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${AGE_TIER_META[learnerProfile?.ageGroup || "standard"].badgeColor}`}>
                    {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].ageLabelUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].ageLabelEn}
                  </span>
                </div>

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

                {/* Active Tier Description */}
                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)] space-y-1">
                  <span className="font-semibold text-[var(--foreground)] block">
                    {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].titleUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].titleEn}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {isUrdu ? AGE_TIER_META[learnerProfile?.ageGroup || "standard"].descUr : AGE_TIER_META[learnerProfile?.ageGroup || "standard"].descEn}
                  </p>
                </div>

                {/* Avatar Picker */}
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
            </div>
          )}

          {/* ================= TAB 3: THEME & MODE ================= */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2.5">
                  {isUrdu ? "تھیم اور رنگوں کی بناوٹ" : "Theme Architecture & Color Palette"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {themes.map((t) => {
                    const active = themeStyle === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeStyle(t.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          active
                            ? "border-emerald-500 bg-emerald-500/10 text-[var(--foreground)] ring-1 ring-emerald-500 shadow-sm"
                            : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--foreground)] hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs">{t.name}</span>
                          <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${t.colorPreview} shadow-xs`} />
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] leading-tight">{t.note}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light / Dark Mode Toggle */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">
                  {isUrdu ? "ڈارک اور لائٹ موڈ" : "Appearance Mode"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => themeMode !== "light" && toggleThemeMode()}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "light"
                        ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>{isUrdu ? "لائٹ موڈ (دن)" : "Light Mode"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => themeMode !== "dark" && toggleThemeMode()}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "dark"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Moon className="h-4 w-4 text-emerald-500" />
                    <span>{isUrdu ? "ڈارک موڈ (رات)" : "Dark Mode"}</span>
                  </button>
                </div>
              </div>

              {/* Verse Stream Reading Layout */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <LayoutList className="h-4 w-4 text-emerald-500" />
                  <span>{isUrdu ? "آیات کی ترتیب کا انداز" : "Verse Stream Layout"}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingMode("compact")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      readingMode === "compact"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <AlignJustify className="h-3.5 w-3.5" />
                    <span>{isUrdu ? "مختصر ترتیب (کمپیکٹ)" : "Compact (Default)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingMode("continuous")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      readingMode === "continuous"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    <span>{isUrdu ? "کارڈز موڈ" : "Cards Mode"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: FONTS & TYPOGRAPHY ================= */}
          {activeTab === "typography" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">
                  {isUrdu ? "قرآنی عربی رسم الخط" : "Quranic Arabic Script"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fontOptions.map((f) => {
                    const isSelected = prefs.arabicFont === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setArabicFont(f.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                            : "border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[var(--foreground)] mb-1 flex items-center justify-between">
                          <span>{f.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <div className={`text-right text-base text-[var(--foreground)] ${f.fontClass}`} dir="rtl">
                          {f.sample}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">
                  {isUrdu ? "اردو ترجمہ فونٹ" : "Urdu Translation Script"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {urduFontOptions.map((f) => {
                    const isSelected = (prefs.urduFont || "nastaliq") === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUrduFont(f.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                            : "border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[var(--foreground)] mb-1 flex items-center justify-between">
                          <span>{f.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <div className={`text-right text-sm text-[var(--foreground)] ${f.fontClass}`} dir="rtl">
                          {f.sample}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography Scaling Sliders */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  {isUrdu ? "فونٹ سائز ایڈجسٹمنٹ" : "Typography Scaling Sliders"}
                </label>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{isUrdu ? "عربی فونٹ سائز" : "Arabic Script Size"}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{prefs.arabicFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={54}
                    step={2}
                    value={prefs.arabicFontSize}
                    onChange={(e) => setArabicFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{isUrdu ? "اردو ترجمہ سائز" : "Urdu Translation Size"}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{prefs.urduFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={32}
                    step={1}
                    value={prefs.urduFontSize}
                    onChange={(e) => setUrduFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{isUrdu ? "تفسیر فونٹ سائز" : "Tafseer Commentary Font Size"}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{prefs.tafsirFontSize || 18}px</span>
                  </div>
                  <input
                    type="range"
                    min={13}
                    max={34}
                    step={1}
                    value={prefs.tafsirFontSize || 18}
                    onChange={(e) => setTafsirFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{isUrdu ? "انگریزی ترجمہ سائز" : "English Translation Size"}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{prefs.englishFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={24}
                    step={1}
                    value={prefs.englishFontSize}
                    onChange={(e) => setEnglishFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Interactive Live Typography Preview Box */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{isUrdu ? "براہ راست پیش نظارہ (Live Preview)" : "Live Typography Preview"}</span>
                </div>
                <div className="text-right text-[var(--foreground)]" dir="rtl" style={{ fontSize: `${prefs.arabicFontSize}px` }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </div>
                <div className="text-right font-urdu text-[var(--urdu-color)] leading-relaxed" dir="rtl" style={{ fontSize: `${prefs.urduFontSize}px` }}>
                  شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: LANGUAGES & TRANSLATIONS ================= */}
          {activeTab === "languages" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">
                  {isUrdu ? "ایپلی کیشن زبان کا انتخاب" : "Global Application Language"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "bilingual" as const,
                      title: "Bilingual (دو لسانی)",
                      badge: "EN + اردو",
                      desc: "Show Urdu & English together everywhere",
                    },
                    {
                      id: "urdu" as const,
                      title: "صرف اردو (Urdu Only)",
                      badge: "اردو",
                      desc: "Urdu translations, Tafseer & headings exclusively",
                    },
                    {
                      id: "english" as const,
                      title: "English Only",
                      badge: "EN",
                      desc: "English translations and interface across views",
                    },
                  ].map((opt) => {
                    const isSelected = language === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLanguage(opt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500 shadow-sm"
                            : "border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[var(--foreground)]">{opt.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isUrdu ? "اردو ترجمہ دکھائیں" : "Show Urdu Translation (اردو ترجمہ)"}
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs.showUrduTranslation}
                    onChange={toggleShowUrduTranslation}
                    className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {prefs.showUrduTranslation && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                    <span className="text-[11px] text-[var(--muted-foreground)] block">
                      {isUrdu ? "مستند اردو مترجم / عالم کا انتخاب:" : "Select Authentic Urdu Scholar / Translator:"}
                    </span>
                    <select
                      value={prefs.selectedUrduTranslationId}
                      onChange={(e) => setSelectedUrduTranslationId(Number(e.target.value))}
                      className="w-full rounded-xl bg-[var(--surface-card)] px-3 py-2 text-xs text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {urduTranslations.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.author}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isUrdu ? "انگریزی ترجمہ دکھائیں" : "Show English Translation"}
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs.showTranslation}
                    onChange={toggleShowTranslation}
                    className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {prefs.showTranslation && (
                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {isUrdu ? "انگریزی تلفظ (Transliteration)" : "Include English Transliteration"}
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs.showTransliteration}
                      onChange={toggleShowTransliteration}
                      className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isUrdu ? "لفظ بہ لفظ (WBW) ترجمہ" : "Word-By-Word (WBW) Translation"}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-xs text-[var(--muted-foreground)]">Enabled</span>
                    <input
                      type="checkbox"
                      checked={prefs.showWordByWord}
                      onChange={toggleShowWordByWord}
                      className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {prefs.showWordByWord && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setWbwLanguage("urdu")}
                      className={`py-1.5 rounded-xl text-xs font-semibold font-urdu border transition-all cursor-pointer ${
                        prefs.wbwLanguage === "urdu"
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      اردو (Urdu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWbwLanguage("english")}
                      className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        prefs.wbwLanguage === "english"
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setWbwLanguage("both")}
                      className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        prefs.wbwLanguage === "both"
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      Both (دونوں)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 6: TAFSEER COMMENTARY ================= */}
          {activeTab === "tafseer" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  {isUrdu ? "منتخب مستند تفسیر" : "Default Authentic Tafseer Commentary"}
                </span>
                <select
                  value={prefs.selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="w-full rounded-xl bg-[var(--surface-card)] px-3.5 py-2.5 text-xs text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {availableTafsirs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {isUrdu ? `${t.name} — ${t.author}` : `[${t.language.toUpperCase()}] ${t.name} — ${t.author}`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pt-1">
                  {isUrdu
                    ? "جب ایپ کی زبان اردو رکھی جاتی ہے، تو صرف مستند اردو تفاسیر ظاہر کی جاتی ہیں جن میں پیراگراف اور سطروں کے درمیان خوبصورت فاصلہ اور واضح رسم الخط موجود ہے۔"
                    : "Authentic classical commentaries providing linguistic context and wisdom."}
                </p>
              </div>

              {/* Tafseer Font Size Controls */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="uppercase tracking-wider text-[var(--muted-foreground)]">
                    {isUrdu ? "تفسیر فونٹ سائز" : "Tafseer Font Size"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTafsirFontSize(Math.max(13, (prefs.tafsirFontSize || 18) - 1))}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-card)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle)] font-bold text-xs"
                    >
                      A-
                    </button>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold px-1 text-sm">
                      {prefs.tafsirFontSize || 18}px
                    </span>
                    <button
                      type="button"
                      onClick={() => setTafsirFontSize(Math.min(34, (prefs.tafsirFontSize || 18) + 1))}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-card)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle)] font-bold text-xs"
                    >
                      A+
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={13}
                  max={34}
                  step={1}
                  value={prefs.tafsirFontSize || 18}
                  onChange={(e) => setTafsirFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sample Tafseer Typography Card */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{isUrdu ? "تفسیر فارمیٹنگ اور نمونہ پیش نظارہ" : "Tafseer Typography Sample"}</span>
                </span>
                <p
                  className="font-urdu leading-[2.3] text-right text-[var(--foreground)]"
                  dir="rtl"
                  style={{ fontSize: `${prefs.tafsirFontSize || 18}px` }}
                >
                  ساتوں قاری «اَلْحَمْدُ» کو دال پر پیش سے پڑھتے ہیں اور «اَلْحَمْدُ لِلَّہِ» کو مبتدا خبر مانتے ہیں۔ اول آخر اسی مالک کی پاک ذات ہر طرح کی تعریف اور حمد و شکر کے لائق ہے۔ [تفسیر ابن جریر: 125/1]
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 7: AUDIO & RECITATION ================= */}
          {activeTab === "audio" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  {isUrdu ? "قاری قرآن کا انتخاب" : "Quran Reciter Selection"}
                </span>
                <select
                  value={currentReciter?.id || 7}
                  onChange={(e) => {
                    const selected = reciters.find((r) => r.id === Number(e.target.value));
                    if (selected) setReciter(selected);
                  }}
                  className="w-full rounded-xl bg-[var(--surface-card)] px-3.5 py-2.5 text-xs text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {reciters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reciter_name} {r.style ? `(${r.style})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {isUrdu ? "تلاوت کے دوران خودکار اسکرول (Auto-scroll)" : "Auto-scroll to reciting verse"}
                  </span>
                  <input
                    type="checkbox"
                    checked={prefs.autoScroll}
                    onChange={toggleAutoScroll}
                    className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ================= TAB 8: KEYBOARD SHORTCUTS ================= */}
          {activeTab === "shortcuts" && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2 px-1">
                  {isUrdu ? "کی بورڈ شارٹ کٹس فہرست" : "Keyboard Shortcuts Cheat Sheet"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { keys: ["Ctrl", "K"], descEn: "Search Quran Verses & Words", descUr: "تلاش قرآن و الفاظ" },
                    { keys: ["Ctrl", "B"], descEn: "Toggle Left Navigation Sidebar", descUr: "بایاں نیویگیشن بار دکھائیں / چھپائیں" },
                    { keys: ["Ctrl", "\\"], descEn: "Toggle Linguistic / Tafseer Inspector", descUr: "دایاں معانی و تفسیر پینل دکھائیں" },
                    { keys: ["Space"], descEn: "Play / Pause Active Recitation", descUr: "تلاوت شروع / موقوف کریں" },
                    { keys: ["←", "→"], descEn: "Previous / Next Surah or Verse", descUr: "اگلی یا پچھلی سورت / آیت" },
                    { keys: ["Esc"], descEn: "Close Open Modals & Drawers", descUr: "کھلی ونڈو یا پینل بند کریں" },
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-[var(--foreground)] font-medium">
                        {isUrdu ? sc.descUr : sc.descEn}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 font-mono">
                        {sc.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 9: LIVE SETTINGS ================= */}
          {activeTab === "live" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[var(--surface-card)] to-teal-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-sm text-[var(--foreground)]">
                      {isUrdu ? "لائیو ترتیبات اور تیرتا پینل" : "Live Settings & Floating Draggable Panel"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Live Feedback
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {isUrdu
                    ? "آپ ترتیبات کو تیرتے ہوئے پینل کی صورت میں اسکرین پر گھما سکتے ہیں، تاکہ قرآن مجید پڑھتے ہوئے فوری اثرات ملاحظہ کر سکیں۔"
                    : "Open the floating Draggable Live Settings panel directly over your reading canvas to adjust font sizes, scripts, and colors in real-time while reading."}
                </p>

                {onOpenLiveSettings && (
                  <button
                    type="button"
                    onClick={onOpenLiveSettings}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <GripHorizontal className="h-4 w-4" />
                    <span>{isUrdu ? "تیرتا ہوا لائیو پینل کھولیں (Float on Screen)" : "Launch Floating Live Settings Panel"}</span>
                  </button>
                )}
              </div>

              {/* Quick Live Steppers */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  {isUrdu ? "فوری فونٹ اسکیلنگ بٹنز" : "Quick Font Steppers"}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setArabicFontSize(Math.max(20, prefs.arabicFontSize - 2))}
                    className="py-1.5 px-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold"
                  >
                    Arabic A- ({prefs.arabicFontSize - 2}px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrduFontSize(Math.max(14, prefs.urduFontSize - 1))}
                    className="py-1.5 px-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold"
                  >
                    Urdu U- ({prefs.urduFontSize - 1}px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTafsirFontSize(Math.max(13, (prefs.tafsirFontSize || 18) - 1))}
                    className="py-1.5 px-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold"
                  >
                    Tafseer T- ({(prefs.tafsirFontSize || 18) - 1}px)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 10: STORAGE & OFFLINE ================= */}
          {activeTab === "storage" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[var(--surface-raised)] to-teal-500/5 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                    <CloudDownload className="h-5 w-5 text-emerald-500" />
                    <span>{isUrdu ? "آف لائن آڈیو اور ڈیٹا اسٹوریج" : "Offline Audio & Storage"}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                    Offline Ready
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {isUrdu
                    ? "مکمل قرآنی سورتیں، تلاوت اور لفظ بہ لفظ ڈیٹا اپنے آلے میں محفوظ کریں تاکہ انٹرنیٹ کے بغیر بھی پڑھ اور سن سکیں۔"
                    : "Download full Surah recitations and word-by-word Quran data to your device for offline reading and listening without an active internet connection."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsDownloadManagerOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                >
                  <CloudDownload className="h-4 w-4" />
                  <span>{isUrdu ? "آف لائن ڈاؤنلوڈز کا انتظام کریں" : "Manage Offline Audios & Downloads"}</span>
                </button>
              </div>

              {/* App Version Info */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{APP_CONFIG.name} ({APP_CONFIG.nameArabic})</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono font-semibold">
                  v{APP_CONFIG.version}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
