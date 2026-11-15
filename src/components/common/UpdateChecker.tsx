"use client";

import React, { useState } from "react";
import { APP_CONFIG } from "@/config/version";
import {
  checkForAppUpdates,
  openAppUpdateLink,
  AppUpdateInfo,
} from "@/services/updateService";
import { useLanguage } from "@/context/LanguageContext";
import {
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Download,
  ExternalLink,
  AlertCircle,
  Smartphone,
  Laptop,
} from "lucide-react";

export function UpdateChecker() {
  const { isUrdu } = useLanguage();
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCheckUpdates = async () => {
    setStatus("checking");
    setErrorMessage("");
    try {
      const info = await checkForAppUpdates();
      setUpdateInfo(info);
      setStatus("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to update server";
      setErrorMessage(msg);
      setStatus("error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return "";
    const mb = bytes / (1024 * 1024);
    return `(${mb.toFixed(1)} MB)`;
  };

  return (
    <div className="w-full rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-4 sm:p-5 shadow-xs text-[var(--foreground)]">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <RefreshCw className={`h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[var(--foreground)] leading-tight">
              {isUrdu ? "ایپ اپ ڈیٹ مینیجر" : "App Updates & Releases"}
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-tight mt-0.5">
              {isUrdu ? "موجودہ ورژن:" : "Current version:"}{" "}
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                v{APP_CONFIG.version}
              </span>
            </p>
          </div>
        </div>

        {/* Check Button */}
        <button
          type="button"
          onClick={handleCheckUpdates}
          disabled={status === "checking"}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${status === "checking" ? "animate-spin" : ""}`} />
          <span>{status === "checking" ? (isUrdu ? "جانچ ہو رہی ہے..." : "Checking...") : (isUrdu ? "اپ ڈیٹ چیک کریں" : "Check for Updates")}</span>
        </button>
      </div>

      {/* State Displays */}
      {status === "checking" && (
        <div className="py-3 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
          {isUrdu
            ? "تازہ ترین ریلیز کے لیے گٹ ہب سرور سے رابطہ کیا جا رہا ہے..."
            : "Querying latest release from GitHub releases server..."}
        </div>
      )}

      {status === "error" && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{isUrdu ? "اپ ڈیٹ چیک کرنے میں ناکامی" : "Unable to check for updates"}</p>
            <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {status === "success" && updateInfo && (
        <div>
          {updateInfo.hasUpdate ? (
            /* Update Available Card */
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                      {isUrdu ? "نیا ورژن دستیاب ہے!" : "New Version Available!"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[11px]">
                      v{updateInfo.latestVersion}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                    {updateInfo.releaseName}
                  </p>
                </div>
              </div>

              {/* Direct Download Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Android APK Download Button */}
                {updateInfo.apkDownloadUrl && (
                  <button
                    type="button"
                    onClick={() => openAppUpdateLink(updateInfo.apkDownloadUrl!)}
                    className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-between gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Smartphone className="h-4 w-4 shrink-0" />
                      <div className="text-left truncate">
                        <div className="font-bold leading-tight">
                          {isUrdu ? "اینڈرائیڈ APK ڈاؤنلوڈ کریں" : "Download Android APK"}
                        </div>
                        <div className="text-[10px] opacity-80 leading-tight">
                          {isUrdu ? "براہ راست انسٹال اور اپ ڈیٹ" : "Direct in-place update"}
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 shrink-0" />
                  </button>
                )}

                {/* Windows Desktop Setup Download Button */}
                {updateInfo.windowsDownloadUrl && (
                  <button
                    type="button"
                    onClick={() => openAppUpdateLink(updateInfo.windowsDownloadUrl!)}
                    className="p-3 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-xs flex items-center justify-between gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Laptop className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="text-left truncate">
                        <div className="font-bold leading-tight">
                          {isUrdu ? "ونڈوز انسٹالر ڈاؤنلوڈ کریں" : "Download Windows Installer"}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] leading-tight">
                          .exe setup installer
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  </button>
                )}
              </div>

              {/* Android update helping instructions */}
              <div className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] space-y-1">
                <p className="font-semibold text-[var(--foreground)]">
                  {isUrdu ? "موبائل پر اپ ڈیٹ کا طریقہ کار:" : "How in-place mobile update works:"}
                </p>
                <p>
                  {isUrdu
                    ? "1. بٹن دبانے پر نیا APK فوری ڈاؤن لوڈ ہونا شروع ہو جائے گا۔"
                    : "1. Tapping 'Download Android APK' immediately starts downloading the package."}
                </p>
                <p>
                  {isUrdu
                    ? "2. نوٹیفکیشن بار سے فائل پر کلک کریں اور 'Update' کا بٹن دبائیں۔"
                    : "2. Tap the completed download in your notifications and tap 'Update'."}
                </p>
                <p>
                  {isUrdu
                    ? "3. آپ کے تمام بُک مارکس، نوٹس اور ڈیٹا مکمل محفوظ رہیں گے۔"
                    : "3. All your bookmarks, saved notes, and reading history will stay 100% intact."}
                </p>
              </div>

              {/* Full Changelog Link */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => openAppUpdateLink(updateInfo.htmlUrl)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  <span>{isUrdu ? "ریلیز نوٹس دیکھیں" : "View Full Release Notes on GitHub"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Up-to-Date Confirmation */
            <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                  {isUrdu ? "آپ کا ایپ بالکل اپ ٹو ڈیٹ ہے!" : "You are using the latest version!"}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  {isUrdu
                    ? `ورژن v${updateInfo.currentVersion} تازہ ترین مستحکم ورژن ہے۔`
                    : `Version v${updateInfo.currentVersion} is the most recent official release.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
