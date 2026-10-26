"use client";

import React from "react";
import { FlashcardDeck } from "@/components/learn/FlashcardDeck";
import { QURAN_70_VOCABULARY } from "@/data/quranVocabularyData";

export default function FlashcardsPage() {
  return (
    <main className="flex-1 py-8 px-4">
      <FlashcardDeck words={QURAN_70_VOCABULARY} />
    </main>
  );
}
