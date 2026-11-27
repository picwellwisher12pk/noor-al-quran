"use client";

import React, { useSyncExternalStore } from "react";
import { APP_CONFIG } from "@/config/version";
import { useLanguage } from "@/context/LanguageContext";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { HandHeart, Heart, X, Info } from "lucide-react";

const STORAGE_KEY = "naq_sadqa_notice_dismissed_v1";
const DISMISS_EVENT = "naq-sadqa-notice-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(DISMISS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DISMISS_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

/**
 * Gentle, dismissible Sadaqah Jariyah & Credits notification toast.
 * Appears until the user acknowledges/dismisses it, with one-click access to AboutModal.
 */
export function SadqaJariyaBanner() {
  const { isUrdu } = useLanguage();
  const { setIsAboutOpen } = useDesktopWorkspace();
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      window.dispatchEvent(new Event(DISMISS_EVENT));
    } catch {
      // Ignore storage access errors
    }
  };

  const handleOpenAbout = () => {
    handleDismiss();
    setIsAboutOpen(true);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Sadaqah Jariyah dedication notice"
      dir={isUrdu ? "rtl" : "ltr"}
      className="fixed bottom-16 right-3 left-3 sm:left-auto sm:bottom-9 sm:right-4 sm:max-w-sm z-40 rounded-2xl bg-[var(--modal-bg)] border border-amber-500/35 shadow-xl p-3.5 text-[var(--foreground)] animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
          <HandHeart className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1">
              <span>{isUrdu ? APP_CONFIG.sadaqahJariyah.titleUr : "Sadaqah Jariyah"}</span>
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500/40" />
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss Sadaqah Jariyah notice"
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {isUrdu ? APP_CONFIG.sadaqahJariyah.shortUr : APP_CONFIG.sadaqahJariyah.shortEn}
          </p>

          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleOpenAbout}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Info className="h-3 w-3" />
              <span>{isUrdu ? "مکمل تفصیل اور دعا" : "Read About & Du'a"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
