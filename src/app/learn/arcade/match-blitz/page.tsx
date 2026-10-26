import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VocabMatchBlitz } from "@/components/learn/VocabMatchBlitz";

export const metadata = {
  title: "Speed Match Blitz | Noor-ul-Quran Arcade",
  description: "Rapidly match Quranic Arabic vocabulary pairs against the clock to build instant recall.",
};

export default function MatchBlitzPage() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Link
        href="/learn/arcade"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Mini Games Arcade
      </Link>
      <VocabMatchBlitz />
    </div>
  );
}
