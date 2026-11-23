"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ArcadeBackLink } from "@/components/learn/ArcadeBackLink";
import { MeaningQuizGame } from "@/components/learn/MeaningQuizGame";

function MeaningQuizContent() {
  const searchParams = useSearchParams();
  const { isUrdu } = useLanguage();
  const rangeParam = searchParams.get("range");
  const rangeLimit = rangeParam ? parseInt(rangeParam, 10) : undefined;

  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <ArcadeBackLink />
        {rangeLimit && (
          <Link
            href="/learn/word-bank"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            {isUrdu ? "← فریکوئنسی گراف پر واپس" : "← Back to Frequency Graph"}
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
  const { isUrdu } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
          {isUrdu ? "کوئز لوڈ ہو رہا ہے..." : "Loading quiz..."}
        </div>
      }
    >
      <MeaningQuizContent />
    </Suspense>
  );
}
