"use client";

import React, { useEffect, useState } from "react";
import {
  checkForAppUpdates,
  openAppUpdateLink,
  AppUpdateInfo,
} from "@/services/updateService";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, Download, X } from "lucide-react";

export function UpdateNotificationBanner() {
  const { isUrdu } = useLanguage();
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only check every 4 hours to avoid GitHub API rate limits
    const lastCheck = localStorage.getItem("naq_last_update_check_time");
    const dismissedVersion = localStorage.getItem("naq_dismissed_update_version");
    const now = Date.now();

    if (lastCheck && now - Number(lastCheck) < 4 * 60 * 60 * 1000) {
      // Check cached update info if available
      const cached = localStorage.getItem("naq_cached_update_info");
      if (cached) {
        try {
          const info: AppUpdateInfo = JSON.parse(cached);
          if (info.hasUpdate && info.latestVersion !== dismissedVersion) {
            setUpdateInfo(info);
          }
        } catch {
          // Ignore json parse error
        }
      }
      return;
    }

    // Run silent background update check
    checkForAppUpdates()
      .then((info) => {
        localStorage.setItem("naq_last_update_check_time", String(now));
        localStorage.setItem("naq_cached_update_info", JSON.stringify(info));
        if (info.hasUpdate && info.latestVersion !== dismissedVersion) {
          setUpdateInfo(info);
        }
      })
      .catch(() => {
        // Silent failure in background
      });
  }, []);

  const handleDismiss = () => {
    if (updateInfo) {
      localStorage.setItem("naq_dismissed_update_version", updateInfo.latestVersion);
    }
    setDismissed(true);
  };

  const handleUpdateClick = () => {
    if (!updateInfo) return;
    const downloadTarget = updateInfo.apkDownloadUrl || updateInfo.windowsDownloadUrl || updateInfo.htmlUrl;
    openAppUpdateLink(downloadTarget);
  };

  if (!updateInfo || !updateInfo.hasUpdate || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="App update announcement"
      className="w-full flex-none bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-3 py-2 text-xs shadow-md z-40 select-none animate-in fade-in slide-in-from-top-2"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-white/20 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          </div>
          <p className="truncate">
            <span className="font-bold">
              {isUrdu ? "نیا ورژن دستیاب ہے:" : "New Version Available:"}
            </span>{" "}
            <span className="font-mono bg-white/25 px-1.5 py-0.2 rounded font-semibold text-[11px]">
              v{updateInfo.latestVersion}
            </span>{" "}
            <span className="hidden sm:inline opacity-90">
              — {updateInfo.releaseName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUpdateClick}
            className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>{isUrdu ? "ابھی اپ ڈیٹ کریں" : "Update Now"}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss update notification"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
