"use client";

import React, { useState } from "react";
import { useDesktopWorkspace, SidebarTab } from "@/context/DesktopWorkspaceContext";
import { useBookmarks } from "@/context/BookmarksContext";
import { useKhatmah } from "@/context/KhatmahContext";
import { useReadingActivity } from "@/context/ReadingActivityContext";
import {
  BookOpen,
  Layers,
  Calendar,
  Bookmark,
  Search,
  CheckCircle2,
  ChevronRight,
  Flame,
  Compass,
  PanelLeftClose,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DesktopSidebar() {
  const router = useRouter();
  const {
    isLeftSidebarOpen,
    setLeftSidebarOpen,
    toggleLeftSidebar,
    activeSidebarTab,
    setActiveSidebarTab,
    chapters,
    juzs,
    loadingMeta,
    activeChapterId,
    setActiveChapterId,
  } = useDesktopWorkspace();

  const { bookmarks, removeBookmark } = useBookmarks();
  const { plan, targetInfo } = useKhatmah();
  const { currentStreak } = useReadingActivity();

  const [searchQuery, setSearchQuery] = useState("");
  const [revelationFilter, setRevelationFilter] = useState<"all" | "makkah" | "madinah">("all");

  const handleTabClick = (tab: SidebarTab) => {
    if (activeSidebarTab === tab && isLeftSidebarOpen) {
      setLeftSidebarOpen(false);
    } else {
      setActiveSidebarTab(tab);
      setLeftSidebarOpen(true);
    }
  };

  // Filter Surahs
  const filteredChapters = chapters.filter((c) => {
    const matchesSearch =
      c.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name_arabic.includes(searchQuery) ||
      c.id.toString() === searchQuery.trim();

    const matchesRev =
      revelationFilter === "all" || c.revelation_place.toLowerCase() === revelationFilter;

    return matchesSearch && matchesRev;
  });

  return (
    <aside
      className={`h-full flex-none flex bg-[var(--surface-raised,#141e1a)] border-r border-[var(--border-subtle,#1e2c26)] select-none z-30 transition-all duration-200 overflow-hidden ${
        isLeftSidebarOpen ? "w-80" : "w-12"
      }`}
    >
      {/* 1. Leftmost Mini Activity Dock (48px / w-12) */}
      <div className="w-12 h-full flex-none flex flex-col items-center py-3 bg-[var(--surface-sunken,#0e1512)] border-r border-[var(--border-subtle,#1e2c26)] space-y-3">
        <button
          type="button"
          onClick={() => handleTabClick("surahs")}
          className={`p-2 rounded-xl transition-all ${
            activeSidebarTab === "surahs" && isLeftSidebarOpen
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
          }`}
          title="Surahs Directory (1..114)"
        >
          <BookOpen className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("juz")}
          className={`p-2 rounded-xl transition-all ${
            activeSidebarTab === "juz" && isLeftSidebarOpen
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
          }`}
          title="Juz / Siparah Directory (1..30)"
        >
          <Layers className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("khatmah")}
          className={`p-2 rounded-xl transition-all ${
            activeSidebarTab === "khatmah" && isLeftSidebarOpen
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
          }`}
          title="Khatmah Sunnah Goal (7-day minimum)"
        >
          <Calendar className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("bookmarks")}
          className={`p-2 rounded-xl transition-all ${
            activeSidebarTab === "bookmarks" && isLeftSidebarOpen
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
          }`}
          title="Bookmarks & Saved Verses"
        >
          <Bookmark className="h-4 w-4" />
        </button>

        <Link
          href="/calendar"
          className="relative p-2 rounded-xl text-[var(--muted-foreground,#8e9b94)] hover:text-amber-400 hover:bg-[var(--surface-card,#182520)] transition-all"
          title={currentStreak > 0 ? `Reading Streak & Calendar (${currentStreak} Days)` : "Reading Streak & Calendar"}
        >
          <CalendarDays className="h-4 w-4" />
          {currentStreak > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </Link>

        <Link
          href="/learn"
          className="p-2 rounded-xl text-[var(--muted-foreground,#8e9b94)] hover:text-emerald-400 hover:bg-[var(--surface-card,#182520)] transition-all"
          title="Learn 70% Quran Words, Flashcards & Games"
        >
          <GraduationCap className="h-4 w-4" />
        </Link>
      </div>

      {/* 2. Explorer Panel Content (268px) - Collapsible */}
      {isLeftSidebarOpen && (
        <div className="w-68 flex-1 h-full flex flex-col overflow-hidden">
          {/* Tab Header & Search */}
          <div className="p-3 border-b border-[var(--border-subtle,#1e2c26)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                {activeSidebarTab === "surahs" && "Surahs (السور)"}
                {activeSidebarTab === "juz" && "Juz (الأجزاء)"}
                {activeSidebarTab === "khatmah" && "Khatmah Goal (الختمة)"}
                {activeSidebarTab === "bookmarks" && "Bookmarks (العلامات)"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-card,#182520)] text-[var(--muted-foreground,#8e9b94)]">
                  {activeSidebarTab === "surahs" && `${filteredChapters.length}/114`}
                  {activeSidebarTab === "juz" && "30 Parts"}
                  {activeSidebarTab === "bookmarks" && `${bookmarks.length} Saved`}
                </span>
                <button
                  type="button"
                  onClick={toggleLeftSidebar}
                  className="p-1 rounded text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card,#182520)]"
                  title="Collapse Sidebar (Ctrl+B)"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Filter Input (Surahs view) */}
            {activeSidebarTab === "surahs" && (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground,#8e9b94)]" />
                  <input
                    type="text"
                    placeholder="Filter Surah name or number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setRevelationFilter("all")}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      revelationFilter === "all"
                        ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-[var(--muted-foreground,#8e9b94)] hover:bg-[var(--surface-card,#182520)]"
                    }`}
                  >
                    All (114)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevelationFilter("makkah")}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      revelationFilter === "makkah"
                        ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-[var(--muted-foreground,#8e9b94)] hover:bg-[var(--surface-card,#182520)]"
                    }`}
                  >
                    Makki (86)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevelationFilter("madinah")}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      revelationFilter === "madinah"
                        ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
                        : "text-[var(--muted-foreground,#8e9b94)] hover:bg-[var(--surface-card,#182520)]"
                    }`}
                  >
                    Madani (28)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tab Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* TAB 1: SURAHS LIST */}
            {activeSidebarTab === "surahs" && (
              loadingMeta ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground,#8e9b94)] animate-pulse">
                  Loading Surah catalogue...
                </div>
              ) : filteredChapters.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-foreground,#8e9b94)]">
                  No matching Surahs found.
                </div>
              ) : (
                filteredChapters.map((chap) => {
                  const isActive = chap.id === activeChapterId;
                  return (
                    <Link
                      key={chap.id}
                      href={`/surah/${chap.id}`}
                      onClick={() => setActiveChapterId(chap.id)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all group ${
                        isActive
                          ? "bg-emerald-600/15 border border-emerald-500/40 text-[var(--foreground)] font-semibold shadow-sm"
                          : "hover:bg-[var(--surface-card,#182520)] text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono flex-shrink-0 ${
                            isActive
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-[var(--muted-foreground,#8e9b94)]"
                          }`}
                        >
                          {chap.id}
                        </span>
                        <div className="truncate">
                          <div className="text-xs truncate font-medium text-[var(--foreground)]">
                            {chap.name_simple}
                          </div>
                          <div className="text-[10px] text-[var(--muted-foreground,#8e9b94)] truncate">
                            {chap.verses_count} Ayahs • {chap.revelation_place}
                          </div>
                        </div>
                      </div>

                      <div className="font-arabic text-sm text-emerald-400/90 flex-shrink-0 ml-1" dir="rtl">
                        {chap.name_arabic}
                      </div>
                    </Link>
                  );
                })
              )
            )}

            {/* TAB 2: JUZ LIST */}
            {activeSidebarTab === "juz" && (
              <div className="space-y-1">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                  return (
                    <div
                      key={juzNum}
                      className="p-2.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:border-emerald-500/40 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                          {juzNum}
                        </span>
                        <div>
                          <span className="font-medium text-[var(--foreground)] block">
                            Juz {juzNum} (الجزء {juzNum})
                          </span>
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)]">
                            Siparah / Para {juzNum}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/surah/1?juz=${juzNum}`}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/15 hover:bg-emerald-600 hover:text-white text-emerald-300 font-medium transition-colors"
                      >
                        Read
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: KHATMAH SUNNAH GOAL */}
            {activeSidebarTab === "khatmah" && (
              <div className="space-y-3 p-1">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600/15 via-emerald-900/10 to-transparent border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                    <Flame className="h-4 w-4" />
                    <span>Sunnah 7-Day Minimum Pacing</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground,#8e9b94)] leading-relaxed">
                    Strictly aligned with Sahih al-Bukhari 5052: &ldquo;Read the Quran in a month, or in seven days, and do not read it in less than three.&rdquo;
                  </p>

                  {plan && (
                    <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Current Pace:</span>
                        <span className="font-bold text-emerald-300">{plan.targetDays} Days Khatmah</span>
                      </div>
                      {targetInfo && (
                        <div className="text-right">
                          <span className="text-[10px] text-[var(--muted-foreground,#8e9b94)] block">Daily Target:</span>
                          <span className="font-bold text-amber-300">{targetInfo.dailyQuota} Ayahs / Day</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                {targetInfo && (
                  <div className="p-3 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted-foreground,#8e9b94)]">Overall Completion:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {targetInfo.percentageCompleted.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--surface-raised,#141e1a)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${targetInfo.percentageCompleted}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground,#8e9b94)]">
                      <span>Day {targetInfo.dayNumber} of {targetInfo.totalDays}</span>
                      <span className="capitalize">{targetInfo.paceStatus.replace("_", " ")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BOOKMARKS */}
            {activeSidebarTab === "bookmarks" && (
              <div className="space-y-1.5">
                {bookmarks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--muted-foreground,#8e9b94)] space-y-1">
                    <Bookmark className="h-5 w-5 mx-auto text-emerald-400/60 mb-1" />
                    <p className="font-medium text-[var(--foreground)]">No Bookmarks Saved</p>
                    <p className="text-[10px]">Click the bookmark ribbon on any Ayah to save it here.</p>
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.verse_key}
                      className="p-2.5 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] hover:border-emerald-500/40 transition-colors space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/surah/${bm.chapter_id}?ayah=${bm.verse_number}`}
                          className="font-semibold text-emerald-400 hover:underline"
                        >
                          Surah {bm.chapter_name} • Ayah {bm.verse_number}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeBookmark(bm.verse_key)}
                          className="text-[10px] text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                      {bm.text_uthmani && (
                        <div className="font-arabic text-sm text-[var(--foreground)] truncate" dir="rtl">
                          {bm.text_uthmani}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
