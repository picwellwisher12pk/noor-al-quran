"use client";

import React from "react";
import { useLearningStore } from "@/store/useLearningStore";
import { useLanguage } from "@/context/LanguageContext";
import { LearnerAgeGroup, AGE_TIER_META } from "@/types/learnerProfile";

interface LearnerTierSwitcherProps {
  compact?: boolean;
}

export function LearnerTierSwitcher({ compact = false }: LearnerTierSwitcherProps) {
  const { isUrdu } = useLanguage();
  const { learnerProfile, setLearnerAgeGroup } = useLearningStore();
  const currentTier = learnerProfile?.ageGroup || "standard";

  const tiers: LearnerAgeGroup[] = ["kids", "standard", "advanced"];

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-xs text-xs">
      {!compact && (
        <span className="text-[11px] text-[var(--muted-foreground)] px-2 font-medium hidden sm:inline">
          {isUrdu ? "عمر / درجہ:" : "Learner Tier:"}
        </span>
      )}

      {tiers.map((tier) => {
        const meta = AGE_TIER_META[tier];
        const isActive = currentTier === tier;

        return (
          <button
            key={tier}
            type="button"
            onClick={() => setLearnerAgeGroup(tier)}
            title={isUrdu ? `${meta.titleUr} (${meta.descUr})` : `${meta.titleEn} (${meta.descEn})`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-card)]"
            }`}
          >
            <span className="text-xs">{meta.iconEmoji}</span>
            <span className="text-[11px] whitespace-nowrap">
              {isUrdu ? meta.titleUr.split(" ")[0] : meta.titleEn.split(" ")[0]}
            </span>
            {tier === "kids" && (
              <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono hidden md:inline">
                7-12
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

