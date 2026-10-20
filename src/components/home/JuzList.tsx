"use client";

import React from "react";
import { Juz, Chapter } from "@/types/quran";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface JuzListProps {
  juzs: Juz[];
  chapters: Chapter[];
}

export function JuzList({ juzs, chapters }: JuzListProps) {
  // Helper to get chapter name by id
  const getChapterName = (idStr: string) => {
    const ch = chapters.find((c) => c.id === Number(idStr));
    return ch ? ch.name_simple : `Surah ${idStr}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {juzs.map((juz) => {
        const chapterIds = Object.keys(juz.verse_mapping);
        const firstChapterId = chapterIds[0];
        const firstChapterRange = juz.verse_mapping[firstChapterId];
        const [startAyah] = (firstChapterRange || "1").split("-");

        return (
          <div
            key={juz.juz_number}
            className="group relative rounded-2xl p-5 bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] hover:border-emerald-500/50 hover:bg-[var(--hover-bg,#1a2621)] transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-xs font-mono font-bold text-emerald-400">
                  {juz.juz_number}
                </span>
                <span className="text-xs text-[var(--muted-foreground,#8e9b94)] font-medium">
                  {juz.verses_count} Verses
                </span>
              </div>

              <h3 className="font-semibold text-[var(--foreground)] text-base group-hover:text-emerald-400 transition-colors">
                Juz {juz.juz_number}
              </h3>

              <div className="text-xs text-[var(--muted-foreground,#8e9b94)] mt-2 space-y-1">
                <p>
                  Starts at:{" "}
                  <span className="text-emerald-400 font-medium">
                    {getChapterName(firstChapterId)} ({firstChapterRange})
                  </span>
                </p>
                <p className="text-[11px] line-clamp-1">
                  Encompasses: {chapterIds.map((id) => getChapterName(id)).join(", ")}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle,#1a2621)] flex justify-end">
              <Link
                href={`/surah/${firstChapterId}?ayah=${startAyah}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" /> Read Juz {juz.juz_number}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
