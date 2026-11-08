"use client";

import React, { useState } from "react";
import {
  QURANIC_VERB_FORMS,
  QuranicVerbFormInfo,
  VerbFormNumber,
  QuranicVerbExample,
} from "@/data/learning/quranGrammarData";
import { useLanguage } from "@/context/LanguageContext";
import { useAudio } from "@/context/AudioContext";
import { useLearningStore } from "@/store/useLearningStore";
import { LearnerTierSwitcher } from "../LearnerTierSwitcher";
import { getVerbFormLabel } from "@/services/terminologyService";
import {
  Layers,
  Sparkles,
  Volume2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  Info,
} from "lucide-react";

interface VerbFormsMatrixProps {
  onStartQuiz?: () => void;
}

type TenseMode = "past" | "present" | "imperative" | "masdar" | "activeParticiple" | "passiveParticiple";

export function VerbFormsMatrix({ onStartQuiz }: VerbFormsMatrixProps) {
  const { isUrdu } = useLanguage();
  const { playWord } = useAudio();
  const { learnerProfile } = useLearningStore();
  const ageGroup = learnerProfile?.ageGroup || "standard";

  const [selectedFormNum, setSelectedFormNum] = useState<VerbFormNumber>(1);
  const [selectedTense, setSelectedTense] = useState<TenseMode>("past");

  const selectedForm = QURANIC_VERB_FORMS.find((f) => f.formNumber === selectedFormNum) || QURANIC_VERB_FORMS[0];
  const adaptedLabel = getVerbFormLabel(selectedForm.formNumber, ageGroup, isUrdu);

  const handlePlayAudio = (e: React.MouseEvent, ex: QuranicVerbExample) => {
    e.stopPropagation();
    const sStr = String(ex.surah).padStart(3, "0");
    const aStr = String(ex.ayah).padStart(3, "0");
    const audioUrl = `https://audio.qurancdn.com/wbw/${sStr}_${aStr}_001.mp3`;
    try {
      playWord(audioUrl);
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(ex.arabic);
        utter.lang = "ar-SA";
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const getTenseLabel = (tense: TenseMode) => {
    switch (tense) {
      case "past":
        return { en: "Past Tense", ar: "الماضي", ur: "فعل ماضی" };
      case "present":
        return { en: "Present / Imperfect", ar: "المضارع", ur: "فعل مضارع" };
      case "imperative":
        return { en: "Command / Imperative", ar: "الأمر", ur: "فعل أمر" };
      case "masdar":
        return { en: "Verbal Noun (Masdar)", ar: "المصدر", ur: "مصدر" };
      case "activeParticiple":
        return { en: "Active Participle (Doer)", ar: "اسم الفاعل", ur: "اسم فاعل" };
      case "passiveParticiple":
        return { en: "Passive Participle (Done)", ar: "اسم المفعول", ur: "اسم مفعول" };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO & QUIZ TRIGGER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Layers className="h-3.5 w-3.5" />
              <span>{isUrdu ? "علم الصرف: ۱۰ قرآنی ابواب" : "Arabic Morphology: The 10 Verb Forms"}</span>
            </div>
            <LearnerTierSwitcher />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            {isUrdu ? "قرآنی افعال کے اوزان اور ابواب کی مصفوفہ" : "The 10 Quranic Verb Forms (Awzān) Matrix"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {isUrdu
              ? "قرآن مجید کے ہزاروں افعال بنیادی ۱۰ سانچوں (ابواب) پر ڈھلے ہوئے ہیں۔ ہر باب میں ایک خاص معنوی تبدیلی پیدا ہوتی ہے (جیسے تعدیہ، مبالغہ، طلب اور مطاوعت)۔"
              : "Arabic verbs multiply across 10 augmented patterns (Awzān). Mastering these 10 forms unlocks the exact nuance of thousands of Quranic verbs."}
          </p>
        </div>

        {onStartQuiz && (
          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>{isUrdu ? "ابواب کا ٹیسٹ دیں" : "Quiz Verb Forms"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. FORM SELECTOR STRIP (FORMS I TO X) */}
      <div className="p-2 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {QURANIC_VERB_FORMS.map((form) => {
            const isSelected = form.formNumber === selectedFormNum;
            return (
              <button
                key={form.formNumber}
                type="button"
                onClick={() => setSelectedFormNum(form.formNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border-subtle)]"
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{form.romanNumeral}</span>
                <span className="font-arabic font-semibold">{form.arabicName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE FORM DETAIL CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-sm space-y-6">
        {/* Form Header Info */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                {selectedForm.romanNumeral}
              </span>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {adaptedLabel.title}
              </h3>
              <span className="font-arabic-amiri text-xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                {selectedForm.arabicNameFull}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {adaptedLabel.meaning}
            </p>

            {adaptedLabel.helpingTip && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>{isUrdu ? "مددگار اشارہ: " : "Helping Tip: "}</strong>{adaptedLabel.helpingTip}</span>
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-right">
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">
              {isUrdu ? "تخمینہ قرآنی تکرار" : "Quranic Frequency"}
            </span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ~{selectedForm.approximateQuranCount.toLocaleString()} {isUrdu ? "مرتبہ" : "verbs"}
            </span>
          </div>
        </div>

        {/* Conjugation Paradigm (Six Scales) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isUrdu ? "تصریف (گردان کے اوزان)" : "Conjugation Scale (Paradigm)"}</span>
            </h4>

            {/* Quick Tense Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px]">
              {(["past", "present", "imperative", "masdar", "activeParticiple", "passiveParticiple"] as TenseMode[]).map((t) => {
                const isTenseActive = selectedTense === t;
                const lbl = getTenseLabel(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTense(t)}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      isTenseActive
                        ? "bg-emerald-600 text-white font-bold shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isUrdu ? lbl.ur : lbl.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Grid Cells for the Full Conjugation Scale */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(
              [
                { key: "past", val: selectedForm.template.past, label: getTenseLabel("past") },
                { key: "present", val: selectedForm.template.present, label: getTenseLabel("present") },
                { key: "imperative", val: selectedForm.template.imperative, label: getTenseLabel("imperative") },
                { key: "masdar", val: selectedForm.template.masdar, label: getTenseLabel("masdar") },
                { key: "activeParticiple", val: selectedForm.template.activeParticiple, label: getTenseLabel("activeParticiple") },
                { key: "passiveParticiple", val: selectedForm.template.passiveParticiple, label: getTenseLabel("passiveParticiple") },
              ] as const
            ).map((item) => {
              const isHighlighted = selectedTense === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedTense(item.key)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                    isHighlighted
                      ? "bg-emerald-500/15 border-emerald-500 shadow-xs"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-emerald-500/40"
                  }`}
                >
                  <span className="text-[10px] text-[var(--muted-foreground)] block mb-1">
                    {isUrdu ? item.label.ur : item.label.en}
                  </span>
                  <div className="font-arabic-amiri text-xl font-bold text-[var(--foreground)]" dir="rtl">
                    {item.val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authentic Quranic Examples in this Form */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
            <span>{isUrdu ? "قرآن مجید سے مستند مثالیں" : "Authentic Quranic Verse Examples"}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedForm.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-arabic-amiri text-2xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                      {ex.arabic}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium">
                      ({ex.transliteration})
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--foreground)]">
                      Root: {ex.root}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePlayAudio(e, ex)}
                    className="p-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Play verse audio"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Meanings */}
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-[var(--foreground)]">{ex.english}</p>
                  <p className="font-urdu-nastaliq text-[var(--muted-foreground)]" dir="rtl">{ex.urdu}</p>
                </div>

                {/* Verse Citation */}
                <div className="p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-semibold">
                    <span>{ex.surahName} ({ex.surah}:{ex.ayah})</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Form {ex.formNumber}</span>
                  </div>
                  <p className="font-arabic-amiri text-sm text-[var(--foreground)] text-right leading-relaxed" dir="rtl">
                    {ex.verseText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

