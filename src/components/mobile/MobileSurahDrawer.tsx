"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useLanguage } from "@/context/LanguageContext";
import { Chapter, Juz } from "@/types/quran";
import {
  X,
  Search,
  BookOpen,
  Layers,
  Bookmark,
  ChevronRight,
  Flame,
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
  } = useDesktopWorkspace();

  const { bookmarks } = useBookmarks();
  const { isUrdu } = useLanguage();

  const [activeTab, setActiveTab] = useState<"surahs" | "juz" | "bookmarks">("surahs");
  const [filterQuery, setFilterQuery] = useState("");

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

        {/* Tabs: Surahs, Juz, Bookmarks */}
        <div className="grid grid-cols-3 p-2 mx-4 mt-2 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("surahs")}
            className={`py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "surahs"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "سورتیں" : "Surahs"} ({chapters.length})
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
            {isUrdu ? "پارے" : "Juz"} (30)
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
            {isUrdu ? "بُک مارکس" : "Saved"} ({bookmarks.length})
          </button>
        </div>

        {/* Filter Input */}
        {activeTab === "surahs" && (
          <div className="px-4 mt-2">
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
          </div>
        )}

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {activeTab === "surahs" && (
            <>
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
              {juzs.map((juz) => (
                <button
                  key={juz.id}
                  type="button"
                  onClick={() => {
                    const firstChapterId = Object.keys(juz.verse_mapping)[0];
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
                    <span className="block text-[10px] text-[var(--muted-foreground)]">
                      {juz.verses_count} ayahs
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              ))}
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
                        {bm.text_uthmani}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] flex-none" />
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
