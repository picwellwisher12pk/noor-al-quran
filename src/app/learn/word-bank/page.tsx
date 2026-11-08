"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VocabularyGroupBrowser, GroupingMode } from "@/components/learn/VocabularyGroupBrowser";
import { QURAN_70_VOCABULARY } from "@/data/quranVocabularyData";

function WordBankContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as GroupingMode | null;
  const initialMode =
    viewParam === "semantic_clusters" ||
    viewParam === "categories" ||
    viewParam === "frequency_rank" ||
    viewParam === "frequency_graph"
      ? viewParam
      : "frequency_graph";

  return (
    <main className="flex-1 py-8 px-4">
      <VocabularyGroupBrowser words={QURAN_70_VOCABULARY} initialMode={initialMode} />
    </main>
  );
}

export default function WordBankPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
          Loading vocabulary...
        </div>
      }
    >
      <WordBankContent />
    </Suspense>
  );
}
