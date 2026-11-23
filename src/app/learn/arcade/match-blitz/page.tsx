import React from "react";
import { ArcadeBackLink } from "@/components/learn/ArcadeBackLink";
import { VocabMatchBlitz } from "@/components/learn/VocabMatchBlitz";

export const metadata = {
  title: "Speed Match Blitz | Noor-ul-Quran Arcade",
  description: "Rapidly match Quranic Arabic vocabulary pairs against the clock to build instant recall.",
};

export default function MatchBlitzPage() {
  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <ArcadeBackLink />
      <VocabMatchBlitz />
    </main>
  );
}
