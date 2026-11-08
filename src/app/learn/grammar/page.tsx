"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { VerbFormsMatrix } from "@/components/learn/grammar/VerbFormsMatrix";
import { GrammarRulesBrowser } from "@/components/learn/grammar/GrammarRulesBrowser";
import { VerbFormQuizGame } from "@/components/learn/grammar/VerbFormQuizGame";
import { GrammarRuleQuizGame } from "@/components/learn/grammar/GrammarRuleQuizGame";
import { LearnerTierSwitcher } from "@/components/learn/LearnerTierSwitcher";
import {
  Layers,
  BookMarked,
  Zap,
  Sliders,
  ChevronLeft,
} from "lucide-react";

type StudioTab = "verbs" | "rules" | "verb-quiz" | "grammar-quiz";

function GrammarStudioContent() {
  const searchParams = useSearchParams();
  const { isUrdu } = useLanguage();
  const initialTab = (searchParams.get("tab") as StudioTab) || "verbs";
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Back Navigation & Tab Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{isUrdu ? "مرکزِ تعلیم پر واپس جائیں" : "Back to Learning Hub"}</span>
          </Link>
          <LearnerTierSwitcher />
        </div>

        {/* 4 Studio Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] text-xs shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("verbs")}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "verbs"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isUrdu ? "۱۰ قرآنی ابواب (صرف)" : "10 Verb Forms (Sarf)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "rules"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span>{isUrdu ? "قرآنی قواعد (نحو)" : "Grammar Rules (Nahw)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verb-quiz")}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "verb-quiz"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{isUrdu ? "ٹیسٹ: افعال و ابواب" : "Quiz: Verb Forms"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("grammar-quiz")}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "grammar-quiz"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{isUrdu ? "ٹیسٹ: اعراب و قواعد" : "Quiz: Grammar Rules"}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Views */}
      {activeTab === "verbs" && (
        <VerbFormsMatrix onStartQuiz={() => setActiveTab("verb-quiz")} />
      )}

      {activeTab === "rules" && (
        <GrammarRulesBrowser onStartQuiz={() => setActiveTab("grammar-quiz")} />
      )}

      {activeTab === "verb-quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("verbs")}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              ← {isUrdu ? "ابواب کی مصفوفہ پر واپس جائیں" : "Back to Verb Forms Matrix"}
            </button>
          </div>
          <VerbFormQuizGame />
        </div>
      )}

      {activeTab === "grammar-quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              ← {isUrdu ? "قواعد لائبریری پر واپس جائیں" : "Back to Grammar Rules Library"}
            </button>
          </div>
          <GrammarRuleQuizGame />
        </div>
      )}
    </main>
  );
}

export default function GrammarStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
          Loading Grammar & Verb Forms Studio...
        </div>
      }
    >
      <GrammarStudioContent />
    </Suspense>
  );
}

