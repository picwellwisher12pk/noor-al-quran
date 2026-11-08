"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MeaningQuizGame } from "@/components/learn/MeaningQuizGame";

function MeaningQuizContent() {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");
  const rangeLimit = rangeParam ? parseInt(rangeParam, 10) : undefined;

  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/learn/arcade"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Mini Games
        </Link>
        {rangeLimit && (
          <Link
            href="/learn/word-bank"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            ← Back to Frequency Graph
          </Link>
        )}
      </div>
      <MeaningQuizGame
        rangeLimit={rangeLimit && !isNaN(rangeLimit) ? rangeLimit : undefined}
      />
    </main>
  );
}

export default function MeaningQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
          Loading quiz...
        </div>
      }
    >
      <MeaningQuizContent />
    </Suspense>
  );
}
