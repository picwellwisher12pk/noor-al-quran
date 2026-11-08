"use client";

import React, { useState } from "react";
import {
  QURANIC_GRAMMAR_RULES,
  GrammarRuleItem,
  GrammarRulePillar,
  GrammarSampleAyah,
} from "@/data/learning/quranGrammarData";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { useLearningStore } from "@/store/useLearningStore";
import { LearnerTierSwitcher } from "../LearnerTierSwitcher";
import {
  getCaseEndingExplanation,
  getCompoundExplanation,
} from "@/services/terminologyService";
import {
  BookMarked,
  Sparkles,
  Volume2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sliders,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface GrammarRulesBrowserProps {
  onStartQuiz?: () => void;
}

export function GrammarRulesBrowser({ onStartQuiz }: GrammarRulesBrowserProps) {
  const { isUrdu } = useLanguage();
  const { playWord } = useAudio();
  const { learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";

  const [activePillar, setActivePillar] = useState<GrammarRulePillar>("irab_cases");
  const [expandedRuleId, setExpandedRuleId] = useState<string>("rule_irab_raf");

  const filteredRules = QURANIC_GRAMMAR_RULES.filter((r) => r.pillar === activePillar);

  const getAdaptedRuleMeta = (rule: GrammarRuleItem) => {
    if (rule.id === "rule_irab_raf") return getCaseEndingExplanation("raf", ageGroup, isUrdu);
    if (rule.id === "rule_irab_nasb") return getCaseEndingExplanation("nasb", ageGroup, isUrdu);
    if (rule.id === "rule_irab_jarr") return getCaseEndingExplanation("jarr", ageGroup, isUrdu);
    if (rule.id === "rule_murakkab_idafi") return getCompoundExplanation("idafah", ageGroup, isUrdu);
    if (rule.id === "rule_murakkab_tawsifi") return getCompoundExplanation("tawsifi", ageGroup, isUrdu);
    return null;
  };

  const handlePlayAudio = (e: React.MouseEvent, ayah: GrammarSampleAyah) => {
    e.stopPropagation();
    const sStr = String(ayah.surah).padStart(3, "0");
    const aStr = String(ayah.ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(ayah.verseText);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const pillars: { id: GrammarRulePillar; labelEn: string; labelUr: string; icon: any }[] = [
    { id: "irab_cases", labelEn: "1. I'rab Case Endings", labelUr: "۱: اعراب اور علامات", icon: Sliders },
    { id: "compounds_murakkab", labelEn: "2. Quranic Compounds", labelUr: "۲: مرکبات (اضافی و توصیفی)", icon: Layers },
    { id: "sentences_jumlah", labelEn: "3. Sentence Architecture", labelUr: "۳: جملے کی ساخت اور ناسخات", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <BookMarked className="h-3.5 w-3.5" />
              <span>{isUrdu ? "علم النحو: قرآنی گرامر کے بنیادی اصول" : "Quranic Syntax & Grammar Engine (Nahw)"}</span>
            </div>
            <LearnerTierSwitcher />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            {isUrdu ? "اعراب، مرکبات اور جملوں کے قواعد کی تفہیم" : "Master the Structural Rules of the Quran"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {isUrdu
              ? "پیش، زبر اور زیر کی تبدیلیوں کا اصل راز سمجھیں۔ قرآنی آیات میں فاعل، مفعول، اضافت اور حروفِ عاملہ کی قطعی پہچان حاصل کریں۔"
              : "Demystify case endings (Raf', Nasb, Jarr), master possessive compounds (Idafah), and understand how governing particles like Inna and Kaana shape meaning."}
          </p>
        </div>

        {onStartQuiz && (
          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sliders className="h-4 w-4 fill-white" />
            <span>{isUrdu ? "قواعد کا ٹیسٹ دیں" : "Quiz Grammar Rules"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. PILLAR SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm">
        {pillars.map((p) => {
          const isActive = activePillar === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePillar(p.id);
                const first = QURANIC_GRAMMAR_RULES.find((r) => r.pillar === p.id);
                if (first) setExpandedRuleId(first.id);
              }}
              className={`flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{isUrdu ? p.labelUr : p.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3. RULES LIST & EXPANDED CARDS */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleId === rule.id;
          const adapted = getAdaptedRuleMeta(rule);
          const displayTitle = adapted?.label || (isUrdu ? rule.titleUrdu : rule.titleEn);
          const displaySummary = adapted?.subLabel || (isUrdu ? rule.summaryUrdu : rule.summaryEn);
          const displayFormula = adapted?.formulaBadge || rule.formulaEquation;

          return (
            <div
              key={rule.id}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "bg-[var(--surface-raised)] border-blue-500/50 shadow-md"
                  : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:border-blue-500/30"
              }`}
            >
              {/* Card Header (Clickable Accordion) */}
              <div
                onClick={() => setExpandedRuleId(isExpanded ? "" : rule.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {displayTitle}
                    </h3>
                    <span className="font-arabic-amiri text-base font-bold text-blue-600 dark:text-blue-400" dir="rtl">
                      {rule.titleAr}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {displaySummary}
                  </p>
                </div>

                {displayFormula && (
                  <div className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20" dir="rtl">
                    {displayFormula}
                  </div>
                )}
              </div>

              {/* Expanded Detailed Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[var(--border-subtle)] space-y-5 animate-in fade-in-50 duration-200">
                  {/* Bulleted Rules */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      <span>{isUrdu ? "بنیادی ضوابط" : "Core Linguistic Rules"}</span>
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {(isUrdu ? rule.detailedRulesUrdu : rule.detailedRulesEn).map((r, i) => (
                        <li
                          key={i}
                          className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-start gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-[var(--foreground)] leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recognition Tip or Junior Helping Tip */}
                  {adapted?.helpingTip ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">
                          {isUrdu ? "آسان ہیرو گائیڈ:" : "Junior Hero Guide:"}
                        </strong>
                        <span>{adapted.helpingTip}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">
                          {isUrdu ? "فوری پہچاننے کا سنہری اصول:" : "Pro Recognition Tip:"}
                        </strong>
                        <span>{isUrdu ? rule.recognitionTipsUrdu : rule.recognitionTipsEn}</span>
                      </div>
                    </div>
                  )}

                  {/* Sample Quranic Ayahs with Syntactic Highlight */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <BookMarked className="h-3.5 w-3.5 text-blue-500" />
                      <span>{isUrdu ? "قرآنی مثال اور نحوی تجزیہ" : "Quranic Ayah Demonstration"}</span>
                    </h4>

                    {rule.sampleAyahs.map((sample, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--foreground)]">
                            {sample.surahName} ({sample.surah}:{sample.ayah})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, sample)}
                            className="p-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title="Play verse audio"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Verse Text with Highlights */}
                        <div className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-right">
                          <p className="font-arabic-amiri text-2xl text-[var(--foreground)] leading-loose" dir="rtl">
                            {sample.verseText}
                          </p>
                        </div>

                        {/* Translation & Grammar Parsing */}
                        <div className="space-y-1.5 text-xs">
                          <p className="font-semibold text-[var(--foreground)]">
                            {sample.englishTranslation}
                          </p>
                          <p className="font-urdu-nastaliq text-[var(--muted-foreground)]" dir="rtl">
                            {sample.urduTranslation}
                          </p>
                          <div className="pt-2 border-t border-[var(--border-subtle)] text-blue-700 dark:text-blue-300 font-medium">
                            <span className="font-bold">{isUrdu ? "نحوی توضیح: " : "Grammar Breakdown: "}</span>
                            <span>{isUrdu ? sample.roleExplanationUrdu : sample.roleExplanationEn}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

