"use client";

import React, { useState, useMemo } from "react";
import { Chapter } from "@/types/quran";
import Link from "next/link";
import { Search, BookOpen, Volume2, X } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSurahUrduMeta } from "@/data/surahNamesUrdu";

interface SurahListProps {
  chapters: Chapter[];
}

export function SurahList({ chapters }: SurahListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const { playVerse } = useAudio();
  const { isUrdu } = useLanguage();

  const filteredChapters = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter((c) => {
      const urduMeta = getSurahUrduMeta(c.id);
      return (
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        urduMeta.name_urdu.includes(q) ||
        urduMeta.name_urdu_short.includes(q) ||
        c.translated_name.name.toLowerCase().includes(q) ||
        (c.translated_name_urdu?.name && c.translated_name_urdu.name.includes(q)) ||
        urduMeta.meaning_urdu.includes(q) ||
        String(c.id) === q
      );
    });
  }, [chapters, filterQuery]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="relative mb-6 max-w-xl mx-auto">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder={
            isUrdu
              ? "سورت کے نام، نمبر، عربی، اردو یا انگریزی ترجمہ سے تلاش کریں..."
              : "Search by Surah name (EN/UR/AR), number, or translation..."
          }
          className="w-full rounded-2xl bg-[var(--surface-raised)] px-4 py-3.5 pl-11 pr-10 text-sm text-[var(--foreground)] border border-[var(--card-border)] focus:outline-none focus:border-emerald-500 placeholder-[var(--muted-foreground)] shadow-xs transition-colors"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-3.5 p-1 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter) => {
          const urduMeta = getSurahUrduMeta(chapter.id);
          const urduMeaning = chapter.translated_name_urdu?.name || urduMeta.meaning_urdu;
          const isMakkah = chapter.revelation_place === "makkah";

          return (
            <div
              key={chapter.id}
              className="group relative rounded-2xl p-4 sm:p-5 bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-emerald-500/50 hover:bg-[var(--hover-bg)] transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                {/* Top Row: Surah Number Badge + Revelation Place & Ayah Count + Arabic Name */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {/* Left: Number + Revelation info */}
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">
                      {chapter.id}
                    </span>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block leading-tight">
                        {isMakkah ? (isUrdu ? "مکی" : "Makkah") : (isUrdu ? "مدنی" : "Madinah")}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--muted-foreground)] leading-tight">
                        {chapter.verses_count} {isUrdu ? "آیات" : "Ayahs"}
                      </span>
                    </div>
                  </div>

                  {/* Right: Authentic Arabic Name in Arabic Calligraphy Typography */}
                  <div className="text-right">
                    <span
                      className="font-arabic text-2xl sm:text-3xl text-[var(--foreground)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-none font-bold"
                      dir="rtl"
                    >
                      {chapter.name_arabic}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Surah Names in English & Urdu */}
                <div className="flex items-baseline justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--border-subtle)]">
                  {/* English Name */}
                  <h3 className="font-bold text-[var(--foreground)] text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {chapter.name_simple}
                  </h3>

                  {/* Urdu Name */}
                  <span
                    className="font-urdu text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-400 shrink-0"
                    dir="rtl"
                  >
                    {urduMeta.name_urdu}
                  </span>
                </div>

                {/* Translations Beneath: English & Urdu */}
                <div className="space-y-1 mb-3 bg-[var(--surface-card)]/40 p-2 sm:p-2.5 rounded-xl border border-[var(--border-subtle)]/60 text-xs">
                  {/* English Translation */}
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      EN:
                    </span>
                    <span className="font-medium text-[var(--foreground)] text-right truncate text-[11px] sm:text-xs">
                      {chapter.translated_name.name}
                    </span>
                  </div>

                  {/* Urdu Translation */}
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <span className="text-[10px] font-sans font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      اردو:
                    </span>
                    <span
                      className="font-urdu text-xs text-[var(--foreground)] text-right truncate font-medium"
                      dir="rtl"
                    >
                      {urduMeaning}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Metadata & Quick Actions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => playVerse(chapter.id, `${chapter.id}:1`)}
                  title={`Listen to ${chapter.name_simple} recitation`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors cursor-pointer text-xs active:scale-95"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isUrdu ? "تلاوت سنیں" : "Recitation"}</span>
                </button>

                <Link
                  href={`/surah/${chapter.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isUrdu ? "تلاوت کریں" : "Read Surah"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)] text-sm">
          {isUrdu
            ? `کوئی سورت "${filterQuery}" کے مطابق نہیں ملی۔`
            : `No surahs matching "${filterQuery}".`}
        </div>
      )}
    </div>
  );
}
