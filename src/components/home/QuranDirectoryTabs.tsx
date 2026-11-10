"use client";

import React, { useState } from "react";
import { Chapter, Juz } from "@/types/quran";
import { SurahList } from "./SurahList";
import { JuzList } from "./JuzList";

interface QuranDirectoryTabsProps {
  chapters: Chapter[];
  juzs: Juz[];
}

export function QuranDirectoryTabs({ chapters, juzs }: QuranDirectoryTabsProps) {
  const [activeTab, setActiveTab] = useState<"surah" | "juz">("surah");

  return (
    <div className="space-y-4">
      {/* Tabs: Surahs vs Juzs */}
      <div className="flex items-center justify-center pt-2">
        <div className="p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--card-border)] flex gap-1 shadow-inner text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("surah")}
            className={`px-5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "surah"
                ? "bg-emerald-600 text-white shadow"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Surahs (114)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("juz")}
            className={`px-5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "juz"
                ? "bg-emerald-600 text-white shadow"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Juzs (30)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "surah" ? (
        <SurahList chapters={chapters} />
      ) : (
        <JuzList juzs={juzs} chapters={chapters} />
      )}
    </div>
  );
}

