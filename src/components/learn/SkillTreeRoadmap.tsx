"use client";

import React from "react";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Crown,
  ShieldAlert,
  Zap,
  BookOpen,
  Volume2,
  Mic,
  Compass,
  GitMerge,
  Users,
  Navigation,
  Layers,
  Sliders,
  GitFork,
  Trophy,
  Star
} from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";
import {
  CURRICULUM_PHASES,
  SkillNode,
  SkillUnit,
  SkillPhase,
  getAllSkillNodes
} from "../../data/learning/curriculumData";

const ICON_MAP: Record<string, React.ElementType> = {
  SpellCheck: BookOpen,
  Mic: Mic,
  Volume2: Volume2,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  Zap: Zap,
  Crown: Crown,
  Compass: Compass,
  GitMerge: GitMerge,
  Users: Users,
  Navigation: Navigation,
  Layers: Layers,
  Sliders: Sliders,
  GitFork: GitFork,
  Trophy: Trophy,
  BookOpen: BookOpen
};

export function SkillTreeRoadmap() {
  const {
    completedNodeIds,
    unlockedNodeIds,
    nodeStars,
    activeNodeId,
    langPreference,
    openModeSelector
  } = useLearningStore();

  const allNodes = React.useMemo(() => getAllSkillNodes(), []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-16">
      {CURRICULUM_PHASES.map((phase) => (
        <section key={phase.id} className="space-y-8 relative">
          {/* Phase Header Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${phase.colorTheme.bg} border ${phase.colorTheme.border} shadow-sm space-y-2 relative overflow-hidden transition-colors`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl font-black text-black dark:text-white font-serif">
              {phase.phaseNumber}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--surface-card)]/80 border border-[var(--border-subtle)] text-[var(--foreground)]">
                  {langPreference === "urdu"
                    ? `مرحلہ ${phase.phaseNumber} از ۵`
                    : `Stage ${phase.phaseNumber} of 5`}
                </span>
                <span className="text-xs font-bold text-[var(--muted-foreground)]">
                  {langPreference === "urdu"
                    ? `ہدف تفہیم: ~${phase.targetComprehensionPct}%`
                    : `Target Comprehension: ~${phase.targetComprehensionPct}%`}
                </span>
              </div>

              <span
                className="text-lg font-bold text-[var(--foreground)]/80"
                style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                dir="rtl"
              >
                {phase.titleArabic}
              </span>
            </div>

            <div className="relative z-10 pt-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                {langPreference === "urdu" ? (phase.titleUrdu || phase.title) : phase.title}
              </h2>
              {langPreference === "bilingual" && phase.titleUrdu && (
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5" dir="rtl">
                  {phase.titleUrdu}
                </p>
              )}
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl leading-relaxed">
                {langPreference === "urdu" ? (phase.goalUrdu || phase.goal) : phase.goal}
              </p>
            </div>
          </div>

          {/* Units Container */}
          <div className="space-y-10 pl-4 sm:pl-8 border-l-2 border-[var(--border-subtle)] ml-4 sm:ml-8 relative">
            {phase.units.map((unit) => (
              <div key={unit.id} className="space-y-6 relative">
                {/* Unit Subheader */}
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {langPreference === "urdu" ? (unit.titleUrdu || unit.title) : unit.title}
                    </h3>
                    {langPreference === "bilingual" && unit.titleUrdu && (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300" dir="rtl">
                        {unit.titleUrdu}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {langPreference === "urdu" ? (unit.descriptionUrdu || unit.description) : unit.description}
                    </p>
                  </div>
                  <span
                    className="text-xs text-[var(--muted-foreground)]/70 hidden sm:inline-block"
                    style={{ fontFamily: "Amiri, Scheherazade, serif" }}
                  >
                    {unit.titleArabic}
                  </span>
                </div>

                {/* Nodes Layout (Vertical Flow) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {unit.nodes.map((node) => {
                    const isCompleted = completedNodeIds.includes(node.id);
                    const isUnlocked = unlockedNodeIds.includes(node.id) || isCompleted;
                    const isActive = node.id === activeNodeId && !isCompleted;
                    const stars = nodeStars[node.id] || 0;
                    const IconComponent = ICON_MAP[node.iconName] || BookOpen;
                    const isBoss = node.nodeType === "boss_gate";
                    const isCheckpoint = node.nodeType === "checkpoint";
                    const prereqNode = node.prerequisiteNodeId
                      ? allNodes.find((n) => n.id === node.prerequisiteNodeId)
                      : null;

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          if (isUnlocked) {
                            openModeSelector(node);
                          }
                        }}
                        className={`group relative p-5 rounded-3xl border transition-all duration-300 text-left ${
                          !isUnlocked
                            ? "bg-[var(--surface-card)]/40 border-[var(--border-subtle)]/40 opacity-50 cursor-not-allowed"
                            : isCompleted
                            ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/5 dark:from-amber-950/20 dark:to-yellow-950/10 border-amber-500/40 hover:border-amber-500 shadow-sm cursor-pointer"
                            : isActive
                            ? "bg-gradient-to-br from-emerald-500/15 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-500 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30 cursor-pointer"
                            : "bg-[var(--surface-raised)] hover:bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-emerald-500/40 cursor-pointer shadow-sm"
                        }`}
                      >
                        {/* Status Beacon / Icon */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              !isUnlocked
                                ? "bg-[var(--surface-card)] text-[var(--muted-foreground)]"
                                : isCompleted
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/25"
                                : isActive
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-[var(--surface-card)] shadow-lg shadow-emerald-500/30"
                                : isBoss
                                ? "bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {!isUnlocked ? (
                              <Lock className="w-5 h-5" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <IconComponent className="w-6 h-6" />
                            )}
                          </div>

                          {/* Right Badges */}
                          <div className="flex flex-col items-end gap-1">
                            {isCompleted ? (
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= stars ? "fill-amber-500" : "opacity-30"
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-600 text-white shadow-sm">
                                {langPreference === "urdu" ? "موجودہ" : "Current"}
                              </span>
                            ) : isBoss ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                                {langPreference === "urdu" ? "بوس گیٹ" : "Boss Gate"}
                              </span>
                            ) : isCheckpoint ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                                {langPreference === "urdu" ? "چیک پوائنٹ" : "Checkpoint"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                                ~{node.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="mt-4 space-y-1">
                          <h4
                            className={`text-sm sm:text-base font-bold transition-colors ${
                              isCompleted
                                ? "text-amber-900 dark:text-amber-200"
                                : isActive
                                ? "text-emerald-700 dark:text-emerald-300 font-extrabold"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {langPreference === "urdu" ? (node.titleUrdu || node.title) : node.title}
                          </h4>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span
                              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                              style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                              dir="rtl"
                            >
                              {node.titleArabic}
                            </span>
                            {(langPreference === "bilingual" || langPreference === "urdu") && node.subtitleUrdu && (
                              <span className="text-[11px] text-[var(--muted-foreground)] font-medium" dir="rtl">
                                {node.subtitleUrdu}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed pt-0.5">
                            {langPreference === "urdu"
                              ? (node.descriptionUrdu || node.description)
                              : node.subtitle}
                          </p>

                          {!isUnlocked && prereqNode && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                              <Lock className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {langPreference === "urdu"
                                  ? `پہلے "${prereqNode.titleUrdu || prereqNode.title}" مکمل کریں`
                                  : `Complete "${prereqNode.title}" first`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rewards Pill */}
                        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-400">
                            <Zap className="w-3 h-3 fill-purple-600 dark:fill-purple-400" />
                            +{node.xpReward} XP
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
                            <Sparkles className="w-3 h-3" />
                            +{node.gemReward} Gems
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
