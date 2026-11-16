"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { useLanguage } from "@/context/LanguageContext";
import { WAQF_RULES_REGISTRY, WaqfRuleInfo } from "@/utils/quranWaqfMarks";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface WaqfGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaqfGuideModal({ isOpen, onClose }: WaqfGuideModalProps) {
  const { isUrdu } = useLanguage();
  const rulesList = Object.values(WAQF_RULES_REGISTRY);

  const getGlyphColor = (category: WaqfRuleInfo["category"]) => {
    switch (category) {
      case "must-stop":
        return "text-amber-500 dark:text-amber-400";
      case "dont-stop":
        return "text-rose-600 dark:text-rose-400";
      case "stop":
        return "text-emerald-600 dark:text-emerald-400";
      case "continue":
        return "text-cyan-600 dark:text-cyan-400";
      case "special":
        return "text-purple-600 dark:text-purple-400";
      case "pause":
        return "text-orange-500 dark:text-orange-400";
      case "optional":
      default:
        return "text-sky-600 dark:text-sky-400";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-[var(--foreground)]">
              {isUrdu ? "رہنمائے رموزِ اوقاف (تجوید قواعد)" : "Quranic Waqf & Stop Rules Guide"}
            </span>
            <span className="block text-[10px] text-[var(--muted-foreground)] font-normal">
              {isUrdu ? "کب ٹھہریں اور کب ملا کر پڑھیں" : "Rules for Stopping and Continuing Recitation"}
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-3" dir={isUrdu ? "rtl" : "ltr"}>
        {/* Compact Sunnah Principle Header (1 clean line) */}
        <div className="px-3 py-2 rounded-xl bg-[var(--surface-raised)] border border-emerald-500/25 flex items-center gap-2 text-xs text-[var(--foreground)]">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-snug text-[11px] text-[var(--muted-foreground)]">
            <strong className="text-emerald-700 dark:text-emerald-300">
              {isUrdu ? "سنتِ نبوی ﷺ: " : "Prophetic Sunnah: "}
            </strong>
            {isUrdu
              ? "ہر آیت کے اختتام (۝) پر رکنا سنت ہے۔ آیت کے بیچ میں سانس ٹوٹنے پر ٹھہر سکتے ہیں مگر پچھلے لفظ سے ملا کر پڑھنا بہتر ہے۔"
              : "Pausing at the end of every Ayah (۝) is the Sunnah. Midway, pause if out of breath, then backtrack 1-2 words."}
          </span>
        </div>

        {/* Simplified 2-Column Rules Grid (Clean cards, ONLY letters colored) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {rulesList.map((rule) => {
            const letterColor = getGlyphColor(rule.category);

            return (
              <div
                key={rule.code}
                className="p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--card-border)] hover:border-emerald-500/35 transition-colors flex items-start gap-2.5"
              >
                {/* Prominent Colored Letter */}
                <span
                  className={`text-2xl font-arabic font-bold shrink-0 leading-none select-none min-w-[1.2em] text-center pt-0.5 ${letterColor}`}
                >
                  {rule.displayGlyph}
                </span>

                {/* Content: Name & 1-line crisp advice */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="font-bold text-xs text-[var(--foreground)] truncate">
                      {isUrdu ? rule.nameUrdu : rule.nameEnglish}
                    </h4>
                    <span
                      className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded-md shrink-0 border ${rule.badgeBg} ${rule.badgeText} ${rule.badgeBorder}`}
                    >
                      {isUrdu ? rule.shortAdviceUrdu : rule.shortAdviceEnglish}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    {isUrdu ? rule.ruleUrdu : rule.ruleEnglish}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Footer */}
        <div className="pt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            {isUrdu ? "سمجھ گیا ✓" : "Got it ✓"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
