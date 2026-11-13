"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useLanguage } from "@/context/LanguageContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { Chapter, Juz } from "@/types/quran";
import {
  X,
  Search,
  BookOpen,
  Layers,
  Bookmark,
  ChevronRight,
  Flame,
  History,
  Target,
} from "lucide-react";

export function MobileSurahDrawer() {
  const router = useRouter();
  const {
    isMobileSurahDrawerOpen,
    setIsMobileSurahDrawerOpen,
    chapters,
    juzs,
    activeChapterId,
    setActiveChapterId,
    setIsSettingsOpen,
  } = useDesktopWorkspace();

  const { bookmarks, lastRead } = useBookmarks();
  const { isUrdu } = useLanguage();
  const { plan, targetInfo } = useKhatmah();

  const [activeTab, setActiveTab] = useState<"surahs" | "juz" | "bookmarks" | "khatmah">("surahs");
  const [filterQuery, setFilterQuery] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<"all" | "makkah" | "madinah">("all");

  if (!isMobileSurahDrawerOpen) return null;

  const handleClose = () => {
    setIsMobileSurahDrawerOpen(false);
  };

  const handleSelectChapter = (chapterId: number) => {
    setActiveChapterId(chapterId);
    setIsMobileSurahDrawerOpen(false);
    router.push(`/surah/${chapterId}`);
  };

  const filteredChapters = chapters.filter((c) => {
    // Revelation filter
    if (revelationFilter !== "all" && c.revelation_place !== revelationFilter) return false;
    // Search filter
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(q) ||
      c.translated_name.name.toLowerCase().includes(q) ||
      (c.translated_name_urdu?.name && c.translated_name_urdu.name.includes(q)) ||
      String(c.id) === q
    );
  });

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-h-[85vh] h-[85vh] bg-[var(--modal-bg)] rounded-t-3xl border-t border-[var(--card-border)] shadow-2xl flex flex-col overflow-hidden z-10 transition-transform pb-[env(safe-area-inset-bottom,0px)]">
        {/* Drag handle / top bar */}
        <div className="pt-3 pb-1 flex items-center justify-center">
          <div className="h-1.5 w-12 rounded-full bg-[var(--border-subtle)]" />
        </div>

        {/* Drawer Header */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-base text-[var(--foreground)]">
              {isUrdu ? "قرآن پاک کی فہرست" : "Quran Directory"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close directory"
            className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs: Surahs, Juz, Bookmarks, Khatmah */}
        <div className="grid grid-cols-4 p-2 mx-4 mt-2 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("surahs")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "surahs"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "سورتیں" : "Surahs"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("juz")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "juz"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "پارے" : "Juz"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "bookmarks"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "بُک مارکس" : "Saved"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("khatmah")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "khatmah"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "ختمہ" : "Khatmah"}
          </button>
        </div>

        {/* Filter Input + Revelation Chips (Surahs tab only) */}
        {activeTab === "surahs" && (
          <div className="px-4 mt-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={isUrdu ? "سورت تلاش کریں..." : "Filter Surah by name or number..."}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-emerald-500"
              />
            </div>
            {/* Revelation filter chips */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { key: "all", label: "All (114)" },
                  { key: "makkah", label: "Makki (86)" },
                  { key: "madinah", label: "Madani (28)" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRevelationFilter(key)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all border ${
                    revelationFilter === key
                      ? "bg-emerald-600/20 text-emerald-300 font-semibold border-emerald-500/30 dark:text-emerald-300"
                      : "bg-[var(--surface-sunken)] text-[var(--muted-foreground)] border-[var(--border-subtle)] hover:border-emerald-500/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {activeTab === "surahs" && (
            <>
              {/* Resume Reading pill */}
              {lastRead && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSurahDrawerOpen(false);
                    router.push(`/surah/${lastRead.chapterId}?ayah=${lastRead.verseNumber}`);
                  }}
                  className="w-full flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs mb-2 text-left hover:bg-emerald-500/20 transition-all"
                >
                  <History className="h-3.5 w-3.5 text-emerald-500 flex-none" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">
                    {isUrdu
                      ? `دوبارہ شروع کریں: سورہ ${lastRead.chapterName} (آیت ${lastRead.verseNumber})`
                      : `Resume: Surah ${lastRead.chapterName} (Ayah ${lastRead.verseNumber})`}
                  </span>
                </button>
              )}

              {filteredChapters.map((chapter) => {
                const isCurrent = chapter.id === activeChapterId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between border transition-all text-left ${
                      isCurrent
                        ? "bg-emerald-500/15 border-emerald-500/40 text-[var(--foreground)]"
                        : "bg-[var(--surface-raised)] border-[var(--border-subtle)] hover:bg-[var(--surface-card)] text-[var(--foreground)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-none flex items-center justify-center h-8 w-8 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {chapter.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[var(--foreground)] truncate">
                          {chapter.name_simple}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                          {chapter.translated_name.name} • {chapter.verses_count} ayahs
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-arabic text-base text-emerald-600 dark:text-emerald-400" dir="rtl">
                        {chapter.name_arabic}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {activeTab === "juz" && (
            <div className="grid grid-cols-2 gap-2">
              {juzs.map((juz) => {
                const firstChapterId = Object.keys(juz.verse_mapping)[0];
                const firstChapter = firstChapterId
                  ? chapters.find((c) => c.id === Number(firstChapterId))
                  : undefined;
                return (
                  <button
                    key={juz.id}
                    type="button"
                    onClick={() => {
                      if (firstChapterId) {
                        handleSelectChapter(Number(firstChapterId));
                      }
                    }}
                    className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-emerald-500/40 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-[var(--foreground)]">
                        Juz {juz.juz_number}
                      </span>
                      {firstChapter && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                          {firstChapter.name_simple}
                        </span>
                      )}
                      <span className="block text-[10px] text-[var(--muted-foreground)]">
                        {juz.verses_count} ayahs
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "bookmarks" && (
            <>
              {bookmarks.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Bookmark className="h-8 w-8 text-[var(--muted-foreground)] mx-auto opacity-40" />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isUrdu ? "ابھی تک کوئی بُک مارک محفوظ نہیں ہے" : "No saved bookmarks yet."}
                  </p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <button
                    key={bm.verse_key}
                    type="button"
                    onClick={() => {
                      setIsMobileSurahDrawerOpen(false);
                      router.push(`/surah/${bm.chapter_id}?ayah=${bm.verse_number}`);
                    }}
                    className="w-full p-2.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between text-left hover:bg-[var(--surface-card)] transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-[var(--foreground)]">
                        Surah {bm.chapter_name} ({bm.verse_key})
                      </span>
                      <span className="block text-[10px] text-[var(--muted-foreground)] line-clamp-1">
                        {bm.text_indopak || bm.text_uthmani}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] flex-none" />
                  </button>
                ))
              )}
            </>
          )}

          {activeTab === "khatmah" && (
            <div className="py-2">
              {!plan ? (
                /* No plan state */
                <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-5 flex flex-col items-center text-center gap-3">
                  <Target className="h-10 w-10 text-emerald-500 opacity-60" />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {isUrdu
                      ? "کوئی ختمہ پلان نہیں ہے۔ ترتیبات → ختمہ میں جائیں۔"
                      : "No Khatmah plan set. Go to Settings → Khatmah to start."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(true);
                      handleClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    {isUrdu ? "ترتیبات کھولیں" : "Open Settings"}
                  </button>
                </div>
              ) : (
                /* Plan exists */
                <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-sm text-[var(--foreground)]">
                      {plan.targetDays}-{isUrdu ? "روزہ ختمہ" : "Day Khatmah"}
                    </span>
                  </div>

                  {targetInfo && (
                    <>
                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {isUrdu ? "پیشرفت" : "Progress"}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {targetInfo.percentageCompleted.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${targetInfo.percentageCompleted}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] p-2.5">
                          <div className="text-[10px] text-[var(--muted-foreground)]">
                            {isUrdu ? "روزانہ کوٹہ" : "Daily Quota"}
                          </div>
                          <div className="font-bold text-xs text-[var(--foreground)] mt-0.5">
                            {targetInfo.dailyQuota}{" "}
                            <span className="font-normal text-[var(--muted-foreground)]">
                              {isUrdu ? "آیات/دن" : "Ayahs/day"}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] p-2.5">
                          <div className="text-[10px] text-[var(--muted-foreground)]">
                            {isUrdu ? "رفتار" : "Pace"}
                          </div>
                          <div
                            className={`font-bold text-xs mt-0.5 ${
                              targetInfo.paceStatus === "ahead"
                                ? "text-emerald-500"
                                : targetInfo.paceStatus === "behind"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            {capitalize(targetInfo.paceStatus)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] p-2.5">
                          <div className="text-[10px] text-[var(--muted-foreground)]">
                            {isUrdu ? "دن" : "Day"}
                          </div>
                          <div className="font-bold text-xs text-[var(--foreground)] mt-0.5">
                            {targetInfo.dayNumber}{" "}
                            <span className="font-normal text-[var(--muted-foreground)]">
                              / {targetInfo.totalDays}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] p-2.5">
                          <div className="text-[10px] text-[var(--muted-foreground)]">
                            {isUrdu ? "باقی دن" : "Days Left"}
                          </div>
                          <div className="font-bold text-xs text-[var(--foreground)] mt-0.5">
                            {targetInfo.daysRemaining}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
