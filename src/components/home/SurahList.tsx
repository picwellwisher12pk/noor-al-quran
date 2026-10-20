"use client";

import React, { useState, useMemo } from "react";
import { Chapter } from "@/types/quran";
import Link from "next/link";
import { Search, Sparkles, BookOpen, Volume2 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface SurahListProps {
  chapters: Chapter[];
}

export function SurahList({ chapters }: SurahListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const { playVerse } = useAudio();

  const filteredChapters = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        c.translated_name.name.toLowerCase().includes(q) ||
        String(c.id) === q
    );
  }, [chapters, filterQuery]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="relative mb-6 max-w-xl mx-auto">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by Surah name, number, or translation..."
          className="w-full rounded-2xl bg-[var(--surface-raised,#141e1a)] px-4 py-3.5 pl-11 text-sm text-[var(--foreground)] border border-[var(--card-border,#1e2c26)] focus:outline-none focus:border-emerald-500 placeholder-[var(--muted-foreground,#8e9b94)] shadow-sm"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground,#8e9b94)] pointer-events-none" />
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className="group relative rounded-2xl p-5 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] hover:border-emerald-500/50 hover:bg-[var(--hover-bg,#1a2621)] transition-all duration-200 flex flex-col justify-between shadow-sm"
          >
            {/* Top Row: Number & Arabic Name */}
            <div className="flex items-start justify-between mb-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] text-xs font-mono font-semibold text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {chapter.id}
              </span>
              <span className="font-arabic text-2xl text-[var(--foreground)] group-hover:text-emerald-400 transition-colors" dir="rtl">
                {chapter.name_arabic}
              </span>
            </div>

            {/* Middle: English Name & Translation */}
            <div className="mb-4">
              <h3 className="font-semibold text-[var(--foreground)] text-base group-hover:text-emerald-400 transition-colors">
                {chapter.name_simple}
              </h3>
              <p className="text-xs text-[var(--muted-foreground,#8e9b94)] line-clamp-1 mt-0.5">
                {chapter.translated_name.name}
              </p>
            </div>

            {/* Bottom Row: Metadata & Quick Links */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle,#1a2621)] text-xs text-[var(--muted-foreground,#8e9b94)]">
              <span className="capitalize text-[11px]">
                {chapter.revelation_place} • {chapter.verses_count} ayahs
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => playVerse(chapter.id, `${chapter.id}:1`)}
                  title={`Listen to ${chapter.name_simple}`}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </button>

                <Link
                  href={`/surah/${chapter.id}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" /> Read
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground,#8e9b94)] text-sm">
          No surahs matching &quot;{filterQuery}&quot;.
        </div>
      )}
    </div>
  );
}
