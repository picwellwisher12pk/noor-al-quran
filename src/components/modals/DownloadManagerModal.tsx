"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useAudio } from "@/context/AudioContext";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import {
  offlineStorage,
  DownloadProgress,
  OfflineSurahMeta,
  formatBytes,
  estimateSurahBytes,
  estimateFullQuranBytes,
} from "@/services/offlineStorage";
import {
  Download,
  CloudDownload,
  HardDrive,
  Trash2,
  Pause,
  Play,
  XCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Volume2,
  Sparkles,
  Layers,
  Search,
  Check,
} from "lucide-react";

interface DownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadManagerModal({ isOpen, onClose }: DownloadManagerModalProps) {
  const { chapters, activeChapterId } = useDesktopWorkspace();
  const { currentReciter, reciters, setReciter } = useAudio();
  const { prefs } = useReadingPreferences();

  const [activeTab, setActiveTab] = useState<"current" | "catalog" | "full">("current");
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>(offlineStorage.getProgress());
  const [offlineMeta, setOfflineMeta] = useState<Record<number, OfflineSurahMeta>>({});
  const [storageUsage, setStorageUsage] = useState<{ usageMB: number; quotaMB: number }>({ usageMB: 0, quotaMB: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  // Download options
  const [includeVerseAudio, setIncludeVerseAudio] = useState(true);
  const [includeWordAudio, setIncludeWordAudio] = useState(true);
  const [includeData, setIncludeData] = useState(true);

  // App-based confirm dialog state for clearing cache
  const [showClearConfirm, setShowClearConfirm] = useState<"audio" | "all" | null>(null);

  // Refresh storage and metadata
  const refreshStorageInfo = async () => {
    setOfflineMeta(offlineStorage.getOfflineMeta());
    const stats = await offlineStorage.getStorageUsage();
    setStorageUsage(stats);
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshStorageInfo();
    const unsubscribe = offlineStorage.subscribe((prog) => {
      setDownloadProgress(prog);
      if (prog.status === "completed" || prog.status === "idle") {
        refreshStorageInfo();
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0] || {
    id: 1,
    name_simple: "Al-Fatihah",
    name_arabic: "الفاتحة",
    verses_count: 7,
  };

  const activeMeta = offlineMeta[activeChapter.id];
  const isDownloading = downloadProgress.status === "downloading" || downloadProgress.status === "paused";

  const currentEst = estimateSurahBytes(activeChapter.id, {
    includeData,
    includeVerseAudio,
    includeWordAudio,
  });

  const fullEst = estimateFullQuranBytes({
    includeData,
    includeVerseAudio,
    includeWordAudio,
  });

  const handleDownloadActiveSurah = async () => {
    try {
      await offlineStorage.downloadSurah(activeChapter.id, {
        reciterId: currentReciter?.id || 7,
        includeVerseAudio,
        includeWordAudio,
        includeData,
        urduTranslationId: prefs.selectedUrduTranslationId,
      });
    } catch (e: any) {
      console.error("Failed to start download:", e);
    }
  };

  const handleDownloadSpecificSurah = async (chapterId: number) => {
    try {
      await offlineStorage.downloadSurah(chapterId, {
        reciterId: currentReciter?.id || 7,
        includeVerseAudio,
        includeWordAudio,
        includeData,
        urduTranslationId: prefs.selectedUrduTranslationId,
      });
    } catch (e: any) {
      console.error("Failed to start download:", e);
    }
  };

  const handleDownloadFullQuran = async () => {
    try {
      await offlineStorage.downloadFullQuran({
        reciterId: currentReciter?.id || 7,
        includeVerseAudio,
        includeWordAudio,
        includeData,
        urduTranslationId: prefs.selectedUrduTranslationId,
      });
    } catch (e: any) {
      console.error("Failed full Quran download:", e);
    }
  };

  const handleConfirmClear = async () => {
    if (showClearConfirm === "audio") {
      await offlineStorage.clearAudioOnly();
    } else if (showClearConfirm === "all") {
      await offlineStorage.clearAll();
    }
    setShowClearConfirm(null);
    await refreshStorageInfo();
  };

  const filteredChapters = chapters.filter(
    (c) =>
      c.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name_arabic.includes(searchQuery) ||
      String(c.id).includes(searchQuery)
  );

  const progressPercent =
    downloadProgress.totalItems > 0
      ? Math.min(100, Math.round((downloadProgress.completedItems / downloadProgress.totalItems) * 100))
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <CloudDownload className="h-5 w-5 text-emerald-400" />
          <span>Offline Storage & Downloads Manager</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Storage Bar & Disk Info */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)]">
                Offline Cache: <span className="text-emerald-400 font-mono">{storageUsage.usageMB} MB</span>
                {storageUsage.quotaMB > 0 && (
                  <span className="text-[var(--muted-foreground)] font-normal text-[11px]">
                    {" "}
                    (of ~{Math.round(storageUsage.quotaMB / 1024)} GB available)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                Reciter: {currentReciter?.reciter_name || "Mishari Rashid"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setShowClearConfirm("audio")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-amber-400 transition-colors"
            >
              Clear Audio
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm("all")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-rose-400 transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>

        {/* Live Active Download Monitor Card (Sticky if active) */}
        {isDownloading && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 ring-1 ring-emerald-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-semibold text-emerald-300">
                  {downloadProgress.taskTitle}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {formatBytes(downloadProgress.totalBytes)}
                {downloadProgress.estimatedTotalBytes ? ` / ~${formatBytes(downloadProgress.estimatedTotalBytes)}` : ""} ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[var(--surface-raised)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
              <span className="truncate max-w-[320px] text-zinc-300 font-medium">
                {downloadProgress.currentItemName || "Downloading audio & text..."}
              </span>
              <span className="font-mono text-[10px]">
                {downloadProgress.completedItems} / {downloadProgress.totalItems} files
              </span>
            </div>

            {/* Controls: Pause / Resume / Cancel */}
            <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
              {downloadProgress.status === "paused" ? (
                <button
                  type="button"
                  onClick={() => offlineStorage.resume()}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="h-3 w-3" /> Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => offlineStorage.pause()}
                  className="px-3 py-1 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--foreground)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Pause className="h-3 w-3 text-amber-400" /> Pause
                </button>
              )}
              <button
                type="button"
                onClick={() => offlineStorage.cancel()}
                className="px-3 py-1 rounded-lg bg-[var(--surface-card)] hover:bg-rose-950/40 border border-[var(--border-subtle)] text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="h-3 w-3 text-rose-400" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Global Download Options Checkboxes */}
        <div className="p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Download Content Package
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeData}
                onChange={(e) => setIncludeData(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Text & Translations</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeVerseAudio}
                onChange={(e) => setIncludeVerseAudio(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Verse Recitations</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeWordAudio}
                onChange={(e) => setIncludeWordAudio(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Word-by-Word Audio</span>
            </label>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={`py-2 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === "current"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Current Surah ({activeChapter.id})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`py-2 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === "catalog"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Surah Catalog (1..114)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("full")}
            className={`py-2 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === "full"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Full Quran (All at once)
          </button>
        </div>

        {/* Tab 1: Current Surah */}
        {activeTab === "current" && (
          <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">
                  Surah {activeChapter.id}. {activeChapter.name_simple}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {activeChapter.verses_count} Ayahs &bull; {activeChapter.revelation_place || "makkah"}
                </p>
              </div>
              <div className="text-right">
                <span className="font-arabic text-2xl text-emerald-400 font-semibold" dir="rtl">
                  {activeChapter.name_arabic}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                  Package Size: ~{formatBytes(currentEst.totalBytes)}
                </span>
              </div>
            </div>

            {/* Offline Status Details with File Sizes */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                <span className="text-[var(--muted-foreground)] block">Text & Words:</span>
                <span className={activeMeta?.hasText ? "text-emerald-400 font-semibold font-mono" : "text-zinc-400 font-mono"}>
                  {activeMeta?.hasText ? `✓ Ready (~${formatBytes(currentEst.textBytes)})` : `~${formatBytes(currentEst.textBytes)}`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                <span className="text-[var(--muted-foreground)] block">Verse Recitation:</span>
                <span
                  className={
                    activeMeta?.verseAudioReciters?.includes(currentReciter?.id || 7)
                      ? "text-emerald-400 font-semibold font-mono"
                      : "text-zinc-400 font-mono"
                  }
                >
                  {activeMeta?.verseAudioReciters?.includes(currentReciter?.id || 7)
                    ? `✓ Ready (~${formatBytes(currentEst.verseAudioBytes)})`
                    : `~${formatBytes(currentEst.verseAudioBytes)}`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                <span className="text-[var(--muted-foreground)] block">Word Audios:</span>
                <span className={activeMeta?.hasWordAudio ? "text-emerald-400 font-semibold font-mono" : "text-zinc-400 font-mono"}>
                  {activeMeta?.hasWordAudio
                    ? `✓ Ready (~${formatBytes(currentEst.wordAudioBytes)})`
                    : `~${formatBytes(currentEst.wordAudioBytes)}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadActiveSurah}
              disabled={isDownloading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              <span>
                {activeMeta?.totalBytes
                  ? `Re-download Surah ${activeChapter.name_simple} (${formatBytes(activeMeta.totalBytes)} on disk)`
                  : `Download Surah ${activeChapter.name_simple} (~${formatBytes(currentEst.totalBytes)})`}
              </span>
            </button>
          </div>
        )}

        {/* Tab 2: Surah Catalog List */}
        {activeTab === "catalog" && (
          <div className="space-y-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search Surah by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Catalog Grid/List with Sizes */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredChapters.map((ch) => {
                const meta = offlineMeta[ch.id];
                const isDownloaded = meta?.hasText && meta?.verseAudioReciters?.includes(currentReciter?.id || 7);
                const chEst = estimateSurahBytes(ch.id, {
                  includeData,
                  includeVerseAudio,
                  includeWordAudio,
                });

                return (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[var(--surface-card)] flex items-center justify-center font-mono text-[11px] text-emerald-400 font-semibold">
                        {ch.id}
                      </span>
                      <div>
                        <div className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                          <span>{ch.name_simple}</span>
                          <span className="font-arabic text-sm text-emerald-400" dir="rtl">
                            {ch.name_arabic}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-2">
                          <span>{ch.verses_count} Ayahs</span>
                          <span>&bull;</span>
                          <span className="font-mono text-zinc-400">
                            {meta?.totalBytes
                              ? `On disk: ${formatBytes(meta.totalBytes)}`
                              : `Est: ~${formatBytes(chEst.totalBytes)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDownloaded ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 font-mono">
                          <Check className="h-3 w-3" /> Ready ({formatBytes(meta.totalBytes)})
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDownloadSpecificSurah(ch.id)}
                          disabled={isDownloading}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-card)] hover:bg-emerald-600 hover:text-white border border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)] transition-all flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download (~{formatBytes(chEst.totalBytes)})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Full Quran (All 114 Surahs at Once) */}
        {activeTab === "full" && (
          <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CloudDownload className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                Pre-download Entire Noble Quran (114 Surahs)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto mt-1 leading-relaxed">
                Download all 6,236 verses, authentic Arabic text, English & Urdu translations, Tafseer,
                and recitation audio directly to local storage. Read and listen anytime without an internet connection.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] max-w-md mx-auto text-left text-[11px] space-y-1.5">
              <div className="flex justify-between font-semibold text-xs border-b border-[var(--border-subtle)] pb-1.5">
                <span className="text-[var(--foreground)]">Total Package Download:</span>
                <span className="text-emerald-400 font-mono">~{formatBytes(fullEst.totalBytes)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Verse Recitations ({currentReciter?.reciter_name || "Mishari Rashid"}):</span>
                <span className="font-mono text-zinc-300">~{formatBytes(fullEst.verseAudioBytes)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Word-by-Word Pronunciation Audio:</span>
                <span className="font-mono text-zinc-300">~{formatBytes(fullEst.wordAudioBytes)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Uthmani Text & Translations:</span>
                <span className="font-mono text-zinc-300">~{formatBytes(fullEst.textBytes)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)] pt-1 border-t border-[var(--border-subtle)]">
                <span>Chapters & Verses Count:</span>
                <span className="font-semibold text-[var(--foreground)]">114 Chapters &bull; 6,236 Ayahs</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadFullQuran}
              disabled={isDownloading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Start Complete 114-Surah Download (~{formatBytes(fullEst.totalBytes)})</span>
            </button>
          </div>
        )}

        {/* Clear Confirmation Sub-Modal (App-based modal, NO native browser alert) */}
        {showClearConfirm && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2.5 animate-fadeIn">
            <div className="text-xs font-semibold text-rose-300">
              {showClearConfirm === "audio"
                ? "Are you sure you want to delete all cached audio files?"
                : "Are you sure you want to delete all offline data (text, translations, and audio)?"}
            </div>
            <p className="text-[11px] text-rose-200/80">
              This will free up disk space. You can re-download anytime.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(null)}
                className="px-3 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
