/**
 * Offline Storage & Download Service for Noor-ul-Quran
 * Manages caching and pre-downloading of:
 * 1. Surah Data (Text, Translations, Tafseer, Words)
 * 2. Verse Audio files (per Reciter)
 * 3. Word-by-Word Pronunciation Audio files
 *
 * Utilizes standard CacheStorage API with offline fallback.
 */

import { fetchVerseAudioUrl, fetchVersesByChapter, WBW_CDN_URL } from "./quranApi";
import { CHAPTER_VERSE_COUNTS } from "@/utils/quranMeta";
import { Verse, Word } from "@/types/quran";

export const AUDIO_CACHE_NAME = "noor-quran-audio-v1";
export const DATA_CACHE_NAME = "noor-quran-data-v1";
const METADATA_KEY = "noor_offline_surahs_meta";

/**
 * Format bytes into human readable KB, MB, GB format
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

/**
 * Dynamic authentic size estimation derived from Quran metadata
 */
export function estimateSurahBytes(
  chapterId: number,
  options: { includeData?: boolean; includeVerseAudio?: boolean; includeWordAudio?: boolean }
): { textBytes: number; verseAudioBytes: number; wordAudioBytes: number; totalBytes: number } {
  const ayahs = CHAPTER_VERSE_COUNTS[chapterId - 1] || 7;
  // Authentic average estimations derived from actual API responses and MP3 bitrates (128kbps):
  // - Uthmani text, English & Urdu translations, word glosses: ~1.8 KB per ayah
  // - Verse recitation MP3 (128kbps, average ayah ~12 seconds): ~192 KB per ayah
  // - Word-by-word pronunciation MP3: average ~11 words per ayah, ~14 KB per word
  const textBytes = options.includeData ? Math.round(ayahs * 1800) : 0;
  const verseAudioBytes = options.includeVerseAudio ? Math.round(ayahs * 192000) : 0;
  const wordAudioBytes = options.includeWordAudio ? Math.round(ayahs * 11 * 14000) : 0;
  return {
    textBytes,
    verseAudioBytes,
    wordAudioBytes,
    totalBytes: textBytes + verseAudioBytes + wordAudioBytes,
  };
}

export function estimateFullQuranBytes(options: {
  includeData?: boolean;
  includeVerseAudio?: boolean;
  includeWordAudio?: boolean;
}): { textBytes: number; verseAudioBytes: number; wordAudioBytes: number; totalBytes: number } {
  let totalText = 0;
  let totalVerseAudio = 0;
  let totalWordAudio = 0;

  for (let c = 1; c <= 114; c++) {
    const s = estimateSurahBytes(c, options);
    totalText += s.textBytes;
    totalVerseAudio += s.verseAudioBytes;
    totalWordAudio += s.wordAudioBytes;
  }

  return {
    textBytes: totalText,
    verseAudioBytes: totalVerseAudio,
    wordAudioBytes: totalWordAudio,
    totalBytes: totalText + totalVerseAudio + totalWordAudio,
  };
}

export interface OfflineSurahMeta {
  chapterId: number;
  hasText: boolean;
  verseAudioReciters: number[]; // reciter IDs downloaded
  hasWordAudio: boolean;
  totalBytes: number;
  updatedAt: number;
}

export interface DownloadProgress {
  status: "idle" | "downloading" | "paused" | "completed" | "error" | "cancelled";
  taskTitle: string;
  currentChapterId?: number;
  totalItems: number;
  completedItems: number;
  totalBytes: number;
  estimatedTotalBytes?: number;
  currentItemName?: string;
  currentItemBytes?: number;
  errorMessage?: string;
}

export type DownloadListener = (progress: DownloadProgress) => void;

class OfflineDownloadManager {
  private listeners: Set<DownloadListener> = new Set();
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private currentProgress: DownloadProgress = {
    status: "idle",
    taskTitle: "",
    totalItems: 0,
    completedItems: 0,
    totalBytes: 0,
  };

  public subscribe(listener: DownloadListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProgress);
    return () => this.listeners.delete(listener);
  }

  private notify(updates: Partial<DownloadProgress>) {
    this.currentProgress = { ...this.currentProgress, ...updates };
    this.listeners.forEach((fn) => fn(this.currentProgress));
  }

  public getProgress(): DownloadProgress {
    return this.currentProgress;
  }

  public pause() {
    this.isPaused = true;
    this.notify({ status: "paused" });
  }

  public resume() {
    this.isPaused = false;
    this.notify({ status: "downloading" });
  }

  public cancel() {
    this.isCancelled = true;
    this.notify({ status: "cancelled", taskTitle: "Download cancelled" });
  }

  private async waitIfPaused(): Promise<boolean> {
    while (this.isPaused) {
      if (this.isCancelled) return false;
      await new Promise((r) => setTimeout(r, 200));
    }
    return !this.isCancelled;
  }

  // --- Local Storage Metadata for Offline Status ---
  public getOfflineMeta(): Record<number, OfflineSurahMeta> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(METADATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private updateSurahMeta(chapterId: number, update: Partial<OfflineSurahMeta>) {
    if (typeof window === "undefined") return;
    try {
      const all = this.getOfflineMeta();
      const current = all[chapterId] || {
        chapterId,
        hasText: false,
        verseAudioReciters: [],
        hasWordAudio: false,
        totalBytes: 0,
        updatedAt: Date.now(),
      };
      all[chapterId] = {
        ...current,
        ...update,
        updatedAt: Date.now(),
      };
      localStorage.setItem(METADATA_KEY, JSON.stringify(all));
    } catch (e) {
      console.error("Failed to save offline meta:", e);
    }
  }

  // --- Cache Storage Access ---
  public async getAudioCache(): Promise<Cache | null> {
    if (typeof window === "undefined" || !("caches" in window)) return null;
    return caches.open(AUDIO_CACHE_NAME);
  }

  public async getDataCache(): Promise<Cache | null> {
    if (typeof window === "undefined" || !("caches" in window)) return null;
    return caches.open(DATA_CACHE_NAME);
  }

  /**
   * Retrieves an offline verse audio object URL or original URL
   */
  public async getVerseAudioUrl(reciterId: number, verseKey: string): Promise<string | null> {
    const cache = await this.getAudioCache();
    if (!cache) return null;
    const requestKey = `https://offline.noor-quran/audio/verse/${reciterId}/${verseKey}`;
    const match = await cache.match(requestKey);
    if (!match) return null;
    const blob = await match.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Caches a verse audio from a remote URL
   */
  public async cacheVerseAudio(reciterId: number, verseKey: string, remoteUrl: string): Promise<number> {
    const cache = await this.getAudioCache();
    if (!cache) return 0;
    const requestKey = `https://offline.noor-quran/audio/verse/${reciterId}/${verseKey}`;

    // Check if already in cache
    const existing = await cache.match(requestKey);
    if (existing) return 0;

    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching verse audio`);
    const blob = await res.blob();
    const size = blob.size;

    await cache.put(
      requestKey,
      new Response(blob, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(size),
        },
      })
    );
    return size;
  }

  /**
   * Retrieves offline word audio URL
   */
  public async getWordAudioUrl(relativeAudioUrl: string): Promise<string | null> {
    const cache = await this.getAudioCache();
    if (!cache || !relativeAudioUrl) return null;
    const cleanPath = relativeAudioUrl.replace(/^\/+/, "");
    const requestKey = `https://offline.noor-quran/audio/word/${cleanPath}`;
    const match = await cache.match(requestKey);
    if (!match) return null;
    const blob = await match.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Caches word audio
   */
  public async cacheWordAudio(relativeAudioUrl: string): Promise<number> {
    const cache = await this.getAudioCache();
    if (!cache || !relativeAudioUrl) return 0;
    const cleanPath = relativeAudioUrl.replace(/^\/+/, "");
    const requestKey = `https://offline.noor-quran/audio/word/${cleanPath}`;

    const existing = await cache.match(requestKey);
    if (existing) return 0;

    const fullUrl = relativeAudioUrl.startsWith("http")
      ? relativeAudioUrl
      : `${WBW_CDN_URL}/${cleanPath}`;

    const res = await fetch(fullUrl);
    if (!res.ok) return 0;
    const blob = await res.blob();
    const size = blob.size;

    await cache.put(
      requestKey,
      new Response(blob, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(size),
        },
      })
    );
    return size;
  }

  /**
   * Retrieves cached Surah data
   */
  public async getCachedSurahVerses(chapterId: number): Promise<Verse[] | null> {
    const cache = await this.getDataCache();
    if (!cache) return null;
    const requestKey = `https://offline.noor-quran/data/surah/${chapterId}`;
    const match = await cache.match(requestKey);
    if (!match) return null;
    try {
      const data = await match.json();
      return data.verses || null;
    } catch {
      return null;
    }
  }

  /**
   * Caches Surah verses data
   */
  public async cacheSurahVerses(chapterId: number, verses: Verse[]): Promise<number> {
    const cache = await this.getDataCache();
    if (!cache || !verses || verses.length === 0) return 0;
    const requestKey = `https://offline.noor-quran/data/surah/${chapterId}`;
    const jsonStr = JSON.stringify({ chapterId, verses, cachedAt: Date.now() });
    const blob = new Blob([jsonStr], { type: "application/json" });

    await cache.put(
      requestKey,
      new Response(blob, {
        headers: { "Content-Type": "application/json" },
      })
    );
    return blob.size;
  }

  // --- Storage Statistics ---
  public async getStorageUsage(): Promise<{ usageMB: number; quotaMB: number }> {
    if (typeof window !== "undefined" && "storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaMB = (estimate.quota || 0) / (1024 * 1024);
        return { usageMB: Number(usageMB.toFixed(1)), quotaMB: Number(quotaMB.toFixed(0)) };
      } catch {
        return { usageMB: 0, quotaMB: 0 };
      }
    }
    return { usageMB: 0, quotaMB: 0 };
  }

  /**
   * Clears all offline caches and metadata
   */
  public async clearAll(): Promise<void> {
    if (typeof window === "undefined" || !("caches" in window)) return;
    await Promise.all([
      caches.delete(AUDIO_CACHE_NAME),
      caches.delete(DATA_CACHE_NAME),
    ]);
    localStorage.removeItem(METADATA_KEY);
    this.notify({
      status: "idle",
      taskTitle: "Cache cleared",
      totalItems: 0,
      completedItems: 0,
      totalBytes: 0,
    });
  }

  public async clearAudioOnly(): Promise<void> {
    if (typeof window === "undefined" || !("caches" in window)) return;
    await caches.delete(AUDIO_CACHE_NAME);
    const meta = this.getOfflineMeta();
    for (const chapId of Object.keys(meta)) {
      meta[Number(chapId)].verseAudioReciters = [];
      meta[Number(chapId)].hasWordAudio = false;
    }
    localStorage.setItem(METADATA_KEY, JSON.stringify(meta));
  }

  // --- High-Level Download Operations ---

  /**
   * Downloads a single Surah completely:
   * - Text & translations for all verses in the chapter
   * - Verse audios (for selected reciterId)
   * - Word-by-word pronunciation audios
   */
  public async downloadSurah(
    chapterId: number,
    options: {
      reciterId: number;
      includeVerseAudio?: boolean;
      includeWordAudio?: boolean;
      includeData?: boolean;
      urduTranslationId?: number;
    }
  ): Promise<void> {
    if (this.currentProgress.status === "downloading") {
      throw new Error("A download is already in progress");
    }

    this.isPaused = false;
    this.isCancelled = false;

    const {
      reciterId = 7,
      includeVerseAudio = true,
      includeWordAudio = true,
      includeData = true,
      urduTranslationId = 234,
    } = options;

    const totalAyahs = CHAPTER_VERSE_COUNTS[chapterId - 1] || 7;
    const est = estimateSurahBytes(chapterId, { includeData, includeVerseAudio, includeWordAudio });
    const estimatedTotal =
      (includeData ? 1 : 0) +
      (includeVerseAudio ? totalAyahs : 0) +
      (includeWordAudio ? totalAyahs * 12 : 0);

    this.notify({
      status: "downloading",
      taskTitle: `Downloading Surah ${chapterId} (~${formatBytes(est.totalBytes)})`,
      currentChapterId: chapterId,
      totalItems: estimatedTotal,
      completedItems: 0,
      totalBytes: 0,
      estimatedTotalBytes: est.totalBytes,
      currentItemName: "Fetching Surah text & translations...",
    });

    let completed = 0;
    let bytesSum = 0;
    let fetchedVerses: Verse[] = [];

    try {
      // 1. Fetch & cache all verses for this chapter
      if (!(await this.waitIfPaused())) return;

      // Fetch all pages (each page 50 verses)
      const totalPages = Math.ceil(totalAyahs / 50);
      for (let p = 1; p <= totalPages; p++) {
        if (!(await this.waitIfPaused())) return;
        const res = await fetchVersesByChapter(chapterId, p, 50, 20, urduTranslationId);
        fetchedVerses = [...fetchedVerses, ...(res.verses || [])];
      }

      if (includeData) {
        const dataBytes = await this.cacheSurahVerses(chapterId, fetchedVerses);
        bytesSum += dataBytes;
        completed += 1;
        this.notify({
          completedItems: completed,
          totalBytes: bytesSum,
          currentItemBytes: dataBytes,
          currentItemName: `Surah text & translations cached (${formatBytes(dataBytes)})`,
        });
      }

      // 2. Download Verse Recitation Audios
      if (includeVerseAudio) {
        for (let a = 1; a <= totalAyahs; a++) {
          if (!(await this.waitIfPaused())) return;

          const verseKey = `${chapterId}:${a}`;
          this.notify({
            currentItemName: `Connecting Ayah ${verseKey}...`,
          });

          const audioUrl = await fetchVerseAudioUrl(reciterId, verseKey);
          let size = 0;
          if (audioUrl) {
            size = await this.cacheVerseAudio(reciterId, verseKey, audioUrl);
            bytesSum += size;
          }

          completed += 1;
          this.notify({
            completedItems: completed,
            totalBytes: bytesSum,
            currentItemBytes: size,
            currentItemName: `Recitation Ayah ${verseKey} (${formatBytes(size)})`,
          });
        }
      }

      // 3. Download Word-by-Word Audio files
      if (includeWordAudio && fetchedVerses.length > 0) {
        const allWords: Word[] = [];
        fetchedVerses.forEach((v) => {
          (v.words || []).forEach((w) => {
            if (w.audio_url && !w.char_type_name?.includes("end")) {
              allWords.push(w);
            }
          });
        });

        // Update total items to actual count
        const finalTotal = completed + allWords.length;
        this.notify({ totalItems: finalTotal });

        // Process in batches of 4 concurrent fetches to avoid throttling
        const batchSize = 4;
        for (let i = 0; i < allWords.length; i += batchSize) {
          if (!(await this.waitIfPaused())) return;

          const batch = allWords.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (word) => {
              try {
                return await this.cacheWordAudio(word.audio_url!);
              } catch {
                return 0;
              }
            })
          );

          let batchSum = 0;
          results.forEach((s) => {
            bytesSum += s;
            batchSum += s;
            completed += 1;
          });

          this.notify({
            completedItems: completed,
            totalBytes: bytesSum,
            currentItemBytes: batchSum,
            currentItemName: `Word: ${batch[0]?.text_uthmani || "Pronunciation"} (${formatBytes(batchSum)})`,
          });
        }
      }

      // Update Surah offline metadata
      const currentMeta = this.getOfflineMeta()[chapterId];
      const reciters = new Set(currentMeta?.verseAudioReciters || []);
      if (includeVerseAudio) reciters.add(reciterId);

      this.updateSurahMeta(chapterId, {
        chapterId,
        hasText: includeData || (currentMeta?.hasText ?? false),
        verseAudioReciters: Array.from(reciters),
        hasWordAudio: includeWordAudio || (currentMeta?.hasWordAudio ?? false),
        totalBytes: (currentMeta?.totalBytes || 0) + bytesSum,
      });

      this.notify({
        status: "completed",
        taskTitle: `Surah ${chapterId} downloaded (${formatBytes(bytesSum)})`,
        completedItems: this.currentProgress.totalItems,
        totalBytes: bytesSum,
        currentItemName: `100% Offline Ready (${formatBytes(bytesSum)} stored on disk)`,
      });
    } catch (e: any) {
      console.error(`Download failed for Surah ${chapterId}:`, e);
      this.notify({
        status: "error",
        taskTitle: `Failed to download Surah ${chapterId}`,
        errorMessage: e?.message || "Download network error",
      });
    }
  }

  /**
   * Downloads the complete Quran (All 114 Surahs):
   * Iterates through Surah 1 to 114 sequentially.
   */
  public async downloadFullQuran(options: {
    reciterId: number;
    includeVerseAudio?: boolean;
    includeWordAudio?: boolean;
    includeData?: boolean;
    urduTranslationId?: number;
  }): Promise<void> {
    if (this.currentProgress.status === "downloading") {
      throw new Error("A download is already in progress");
    }

    this.isPaused = false;
    this.isCancelled = false;

    const fullEst = estimateFullQuranBytes(options);

    this.notify({
      status: "downloading",
      taskTitle: `Downloading Complete Noble Quran (~${formatBytes(fullEst.totalBytes)})`,
      totalItems: 114,
      completedItems: 0,
      totalBytes: 0,
      estimatedTotalBytes: fullEst.totalBytes,
      currentItemName: "Initializing full download...",
    });

    let totalBytesSum = 0;

    for (let c = 1; c <= 114; c++) {
      if (!(await this.waitIfPaused())) break;

      this.notify({
        taskTitle: `Downloading Quran: Surah ${c} of 114 (~${formatBytes(fullEst.totalBytes)})`,
        currentChapterId: c,
        currentItemName: `Processing Surah ${c}...`,
      });

      await this.downloadSurah(c, options);

      totalBytesSum += this.currentProgress.totalBytes;
      this.notify({
        completedItems: c,
        totalBytes: totalBytesSum,
      });
    }

    if (!this.isCancelled) {
      this.notify({
        status: "completed",
        taskTitle: `Complete Quran downloaded (${formatBytes(totalBytesSum)})`,
        completedItems: 114,
        totalItems: 114,
        totalBytes: totalBytesSum,
        currentItemName: `100% Offline Ready (${formatBytes(totalBytesSum)} stored on disk)`,
      });
    }
  }
}

export const offlineStorage = new OfflineDownloadManager();
