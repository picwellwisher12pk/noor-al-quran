"use client";

import React from "react";
import { VocabularyGroupBrowser } from "@/components/learn/VocabularyGroupBrowser";
import { QURAN_70_VOCABULARY } from "@/data/quranVocabularyData";

export default function WordBankPage() {
  return (
    <main className="flex-1 py-8 px-4">
      <VocabularyGroupBrowser words={QURAN_70_VOCABULARY} />
    </main>
  );
}
