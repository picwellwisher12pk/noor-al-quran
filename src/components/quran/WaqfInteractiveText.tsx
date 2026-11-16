"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  getWaqfRuleInfo,
  WaqfRuleInfo,
  WAQF_CLUSTER_REGEX,
  isWaqfCluster,
} from "@/utils/quranWaqfMarks";
import { useLanguage } from "@/context/LanguageContext";
import { WaqfGuideModal } from "@/components/modals/WaqfGuideModal";
import { BookOpen, X } from "lucide-react";

interface WaqfInteractiveTextProps {
  arabicText: string;
  fontSize: number;
  fontClass: string;
  isPlaying?: boolean;
  showWaqfHelp?: boolean;
}

type TooltipStage = "brief" | "detailed";

interface ActiveTooltipState {
  key: string;
  rule: WaqfRuleInfo;
  stage: TooltipStage;
  coords: {
    top?: number;
    bottom?: number;
    left: number;
  };
}

export function WaqfInteractiveText({
  arabicText,
  fontSize,
  fontClass,
  isPlaying,
  showWaqfHelp = true,
}: WaqfInteractiveTextProps) {
  const { isUrdu } = useLanguage();
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltipState | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Timers
  const hoverDetailedTimer = useRef<NodeJS.Timeout | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (hoverDetailedTimer.current) clearTimeout(hoverDetailedTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Dismiss on outside click or scroll to avoid floating detached tooltips
  useEffect(() => {
    if (!activeTooltip) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest("[data-waqf-container]") && !target.closest("[data-waqf-popup]")) {
        setActiveTooltip(null);
      }
    };

    const handleScroll = () => {
      setActiveTooltip(null);
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [activeTooltip]);

  if (!arabicText) return null;

  // Split text by recognized Waqf character clusters
  const parts = arabicText.split(WAQF_CLUSTER_REGEX);

  // Viewport-relative fixed coordinates calculation (PREVENTS ALL CONTAINER CROPPING)
  const calculateCoords = (
    el: HTMLElement,
    isDetailed: boolean
  ): { top?: number; bottom?: number; left: number } => {
    const rect = el.getBoundingClientRect();
    const tooltipWidth = isDetailed ? 320 : 220;
    const padding = 12;

    const showBelow = rect.top < 160;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    return {
      left,
      top: showBelow ? Math.round(rect.bottom + 8) : undefined,
      bottom: !showBelow ? Math.round(window.innerHeight - rect.top + 8) : undefined,
    };
  };

  // Hover: Immediately show minimal guidance, after 1000ms expand to full details if cursor stays
  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    tooltipKey: string,
    rule: WaqfRuleInfo
  ) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (hoverDetailedTimer.current) clearTimeout(hoverDetailedTimer.current);

    const targetEl = e.currentTarget;
    const coords = calculateCoords(targetEl, false);

    // Initial minimal hover (instant concise action pill)
    setActiveTooltip({
      key: tooltipKey,
      rule,
      stage: "brief",
      coords,
    });

    // After 1000ms (1 second), expand to detailed view if cursor is still on it
    hoverDetailedTimer.current = setTimeout(() => {
      setActiveTooltip((prev) => {
        if (prev?.key !== tooltipKey) return prev;
        const detailedCoords = calculateCoords(targetEl, true);
        return {
          ...prev,
          stage: "detailed",
          coords: detailedCoords,
        };
      });
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverDetailedTimer.current) clearTimeout(hoverDetailedTimer.current);

    closeTimer.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 220);
  };

  // Touch handlers for mobile
  const handleTouchStart = (
    e: React.TouchEvent<HTMLElement>,
    tooltipKey: string,
    rule: WaqfRuleInfo
  ) => {
    clearAllTimers();

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    const targetEl = e.currentTarget;
    const coords = calculateCoords(targetEl, false);

    // Long press (450ms) triggers vibration and opens brief help
    longPressTimer.current = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setActiveTooltip({
        key: tooltipKey,
        rule,
        stage: "brief",
        coords,
      });
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const diff = Math.hypot(
      touch.clientX - touchStartPos.current.x,
      touch.clientY - touchStartPos.current.y
    );
    if (diff > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      touchStartPos.current = null;
    }
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLElement>,
    tooltipKey: string,
    rule: WaqfRuleInfo
  ) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    if (touchStartPos.current) {
      const targetEl = e.currentTarget;

      // Tap toggles: open brief -> open detailed -> close
      if (!activeTooltip || activeTooltip.key !== tooltipKey) {
        const coords = calculateCoords(targetEl, false);
        setActiveTooltip({
          key: tooltipKey,
          rule,
          stage: "brief",
          coords,
        });
      } else if (activeTooltip.stage === "brief") {
        const coords = calculateCoords(targetEl, true);
        setActiveTooltip({
          key: tooltipKey,
          rule,
          stage: "detailed",
          coords,
        });
      } else {
        setActiveTooltip(null);
      }
    }
    touchStartPos.current = null;
  };

  // Color code the characters directly without any artificial circle/border
  const getWaqfColorClass = (rule: WaqfRuleInfo) => {
    switch (rule.category) {
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
    <>
      <p
        dir="rtl"
        className={`text-right text-[var(--foreground)] font-arabic leading-relaxed ${fontClass} ${
          isPlaying ? "text-emerald-700 dark:text-emerald-300" : ""
        } select-text`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {parts.map((part, idx) => {
          // STRICT CHECK: Only process genuine Waqf clusters!
          if (!isWaqfCluster(part) || !showWaqfHelp) {
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          }

          const rule = getWaqfRuleInfo(part);
          if (!rule) {
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          }

          const tooltipKey = `${rule.code}-${idx}`;
          const isTooltipActive = activeTooltip?.key === tooltipKey;
          const stage = activeTooltip?.stage || "brief";
          const coords = activeTooltip?.coords;

          const defaultBrowserTooltip = isUrdu
            ? `${rule.nameUrdu}: ${rule.shortAdviceUrdu}`
            : `${rule.nameEnglish}: ${rule.shortAdviceEnglish}`;

          return (
            <span
              key={tooltipKey}
              data-waqf-container="true"
              className="relative inline-block"
              onMouseEnter={(e) => handleMouseEnter(e, tooltipKey, rule)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={(e) => handleTouchStart(e, tooltipKey, rule)}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => handleTouchEnd(e, tooltipKey, rule)}
            >
              {/* Color-Coded Waqf Character with Comfortable Hit Box */}
              <span
                title={defaultBrowserTooltip}
                className={`inline-flex items-center justify-center min-w-[0.9em] px-0.5 py-0.5 font-arabic font-bold transition-all duration-150 cursor-pointer select-none hover:scale-125 ${getWaqfColorClass(
                  rule
                )}`}
              >
                {part}
              </span>

              {/* Viewport-Fixed Tooltip Overlay (CANNOT BE CROPPED BY ANY CONTAINER) */}
              {isTooltipActive && coords && (
                <div
                  data-waqf-popup="true"
                  onMouseEnter={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                  }}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => e.stopPropagation()}
                  dir={isUrdu ? "rtl" : "ltr"}
                  style={{
                    position: "fixed",
                    top: coords.top !== undefined ? `${coords.top}px` : undefined,
                    bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                    left: `${coords.left}px`,
                    zIndex: 99999,
                  }}
                  className={`text-[var(--foreground)] animate-in fade-in zoom-in-95 duration-150 cursor-default select-text normal-case font-sans ${
                    stage === "detailed"
                      ? "w-72 sm:w-80 p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-2xl pointer-events-auto"
                      : "whitespace-nowrap px-3 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--card-border)] shadow-lg pointer-events-none"
                  }`}
                >
                  {/* STAGE 1: Minimal Initial Hover (Brief Action Pill - as little info as possible) */}
                  {stage === "brief" && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${rule.badgeBg} border ${rule.badgeBorder}`}
                      />
                      <span>{isUrdu ? rule.nameUrdu : rule.nameEnglish}:</span>
                      <span className={rule.badgeText}>
                        {isUrdu ? rule.shortAdviceUrdu : rule.shortAdviceEnglish}
                      </span>
                    </div>
                  )}

                  {/* STAGE 2: Detailed Helping Card (After 1s or tap) */}
                  {stage === "detailed" && (
                    <div className="block space-y-2.5">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] gap-2">
                        <span className="font-bold text-xs truncate">
                          {isUrdu ? rule.nameUrdu : rule.nameEnglish}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${rule.badgeBg} ${rule.badgeText} border ${rule.badgeBorder}`}
                        >
                          {isUrdu ? rule.shortAdviceUrdu : rule.shortAdviceEnglish}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(null);
                          }}
                          className="sm:hidden p-0.5 rounded-md hover:bg-neutral-500/15 text-[var(--muted-foreground)]"
                          aria-label="Close"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Explanation */}
                      <div className="text-xs text-[var(--foreground)] leading-relaxed bg-[var(--surface-sunken)] p-2 rounded-xl border border-[var(--border-subtle)]">
                        {isUrdu ? rule.ruleUrdu : rule.ruleEnglish}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsGuideOpen(true);
                            setActiveTooltip(null);
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{isUrdu ? "مکمل تجوید گائیڈ" : "Full Waqf Guide"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(null);
                          }}
                          className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-0.5 rounded-lg border border-[var(--card-border)] hover:bg-[var(--surface-sunken)] transition-colors"
                        >
                          {isUrdu ? "بند کریں" : "Close"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </span>
          );
        })}

        {/* End of Ayah Ornament */}
        <span className="inline-flex items-center justify-center text-emerald-500 font-arabic text-lg px-2 select-none">
          ۝
        </span>
      </p>

      {/* Complete Tajweed Waqf Guide Modal */}
      <WaqfGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
