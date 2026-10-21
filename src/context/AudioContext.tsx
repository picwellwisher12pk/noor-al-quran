"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Reciter, Verse } from "@/types/quran";
import { fetchReciters, fetchVerseAudioUrl, WBW_CDN_URL } from "@/services/quranApi";
import { CHAPTER_VERSE_COUNTS } from "@/utils/quranMeta";
import { offlineStorage } from "@/services/offlineStorage";

export type RepeatMode = "none" | "verse" | "infinite";

interface AudioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  currentVerseKey: string | null;
  currentChapterId: number | null;
  currentReciter: Reciter | null;
  reciters: Reciter[];
  currentTime: number;
  duration: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  playVerse: (chapterId: number, verseKey: string, versesList?: Verse[]) => Promise<void>;
  playSurah: (chapterId: number, startAyah?: number, versesList?: Verse[]) => Promise<void>;
  updateVersesQueue: (verses: Verse[]) => void;
  playWord: (audioUrl: string) => void;
  togglePlayPause: () => void;
  playNextVerse: () => void;
  playPreviousVerse: () => void;
  seek: (time: number) => void;
  setReciter: (reciter: Reciter) => void;
  setPlaybackRate: (rate: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>("none");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const versesQueueRef = useRef<Verse[]>([]);
  const repeatCountRef = useRef(0);

  // Synchronous refs to prevent stale closure during playback
  const currentChapterIdRef = useRef<number | null>(null);
  const currentVerseKeyRef = useRef<string | null>(null);
  const repeatModeRef = useRef<RepeatMode>("none");
  const currentReciterRef = useRef<Reciter | null>(null);
  const playbackRateRef = useRef<number>(1);
  const isPlayingRef = useRef<boolean>(false);
  const handleVerseEndedRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentChapterIdRef.current = currentChapterId;
  }, [currentChapterId]);

  useEffect(() => {
    currentVerseKeyRef.current = currentVerseKey;
  }, [currentVerseKey]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleVerseEnded = () => {
    if (repeatModeRef.current === "infinite") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    if (repeatModeRef.current === "verse") {
      repeatCountRef.current += 1;
      if (repeatCountRef.current < 3) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
        return;
      }
      repeatCountRef.current = 0;
    }

    // Automatically advance to the next verse in the Surah
    playNextVerse();
  };

  // Keep handleVerseEndedRef current on every render
  useEffect(() => {
    handleVerseEndedRef.current = handleVerseEnded;
  });

  // Initialize audio element and reciters
  useEffect(() => {
    audioRef.current = new Audio();
    wordAudioRef.current = new Audio();

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleEnded = () => {
      handleVerseEndedRef.current();
    };

    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Fetch reciters
    fetchReciters()
      .then((list) => {
        setReciters(list);
        const defaultReciter = list.find((r) => r.id === 7) || list[0] || null;
        setCurrentReciter(defaultReciter);
        currentReciterRef.current = defaultReciter;
      })
      .catch((err) => console.error("Failed to load reciters:", err));

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const preloadedNextAudioRef = useRef<{ verseKey: string; url: string; element?: HTMLAudioElement } | null>(null);

  // Proactively buffer & preload the next verse audio to eliminate buffering stutter during continuous Surah play
  const preloadNextVerse = async (chapterId: number, currentKey: string) => {
    try {
      const parts = currentKey.split(":");
      const chapId = chapterId || Number(parts[0]) || 1;
      const currentAyah = Number(parts[1]) || 1;
      const totalAyahs = CHAPTER_VERSE_COUNTS[chapId - 1] || 7;

      let nextKey: string | null = null;
      if (versesQueueRef.current && versesQueueRef.current.length > 0) {
        const idx = versesQueueRef.current.findIndex((v) => v.verse_key === currentKey);
        if (idx !== -1 && idx < versesQueueRef.current.length - 1) {
          nextKey = versesQueueRef.current[idx + 1].verse_key;
        }
      }

      if (!nextKey && currentAyah < totalAyahs) {
        nextKey = `${chapId}:${currentAyah + 1}`;
      }

      if (!nextKey) return;

      const reciterId = currentReciterRef.current ? currentReciterRef.current.id : 7;

      // 1. Check if next verse is already cached in offline storage
      const cachedUrl = await offlineStorage.getVerseAudioUrl(reciterId, nextKey);
      if (cachedUrl) {
        preloadedNextAudioRef.current = { verseKey: nextKey, url: cachedUrl };
        return;
      }

      // 2. Otherwise fetch the audio URL and buffer it via background Audio instance
      const audioUrl = await fetchVerseAudioUrl(reciterId, nextKey);
      if (audioUrl) {
        const preAudio = new Audio();
        preAudio.preload = "auto";
        preAudio.src = audioUrl;
        preAudio.load();
        preloadedNextAudioRef.current = { verseKey: nextKey, url: audioUrl, element: preAudio };

        // Cache it in background for future zero-latency playback
        offlineStorage.cacheVerseAudio(reciterId, nextKey, audioUrl).catch(() => {});
      }
    } catch (e) {
      // Background preload error should never break playback
      console.warn("Preload next verse audio skipped:", e);
    }
  };

  const playVerse = async (chapterId: number, verseKey: string, versesList?: Verse[]) => {
    if (versesList && versesList.length > 0) {
      versesQueueRef.current = versesList;
    }
    setCurrentChapterId(chapterId);
    currentChapterIdRef.current = chapterId;
    setCurrentVerseKey(verseKey);
    currentVerseKeyRef.current = verseKey;
    setIsLoading(true);
    repeatCountRef.current = 0;

    const reciterId = currentReciterRef.current ? currentReciterRef.current.id : 7;

    // Check 1: Offline cached audio
    let audioUrl: string | null = await offlineStorage.getVerseAudioUrl(reciterId, verseKey);

    // Check 2: Preloaded memory audio
    if (!audioUrl && preloadedNextAudioRef.current?.verseKey === verseKey && preloadedNextAudioRef.current?.url) {
      audioUrl = preloadedNextAudioRef.current.url;
    }

    // Check 3: Fetch online
    if (!audioUrl) {
      audioUrl = await fetchVerseAudioUrl(reciterId, verseKey);
    }

    if (!audioUrl || !audioRef.current) {
      setIsLoading(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    try {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRateRef.current;
      await audioRef.current.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsLoading(false);

      // Immediately buffer/preload next verse
      preloadNextVerse(chapterId, verseKey);
    } catch (e) {
      console.error("Playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const playSurah = async (chapterId: number, startAyah: number = 1, versesList?: Verse[]) => {
    if (versesList && versesList.length > 0) {
      versesQueueRef.current = versesList;
    }
    await playVerse(chapterId, `${chapterId}:${startAyah}`, versesList);
  };

  const updateVersesQueue = (verses: Verse[]) => {
    if (verses && verses.length > 0) {
      versesQueueRef.current = verses;
    }
  };

  const playWord = async (relativeAudioUrl: string) => {
    if (!wordAudioRef.current || !relativeAudioUrl) return;
    try {
      let fullUrl = await offlineStorage.getWordAudioUrl(relativeAudioUrl);
      if (!fullUrl) {
        fullUrl = relativeAudioUrl.startsWith("http")
          ? relativeAudioUrl
          : `${WBW_CDN_URL}/${relativeAudioUrl.replace(/^\/+/, "")}`;
        offlineStorage.cacheWordAudio(relativeAudioUrl).catch(() => {});
      }
      wordAudioRef.current.src = fullUrl;
      wordAudioRef.current.play().catch(console.error);
    } catch (e) {
      console.error("Error playing word audio:", e);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlayingRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      if (audioRef.current.src) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
        }).catch(console.error);
      } else if (currentChapterIdRef.current && currentVerseKeyRef.current) {
        playVerse(currentChapterIdRef.current, currentVerseKeyRef.current);
      }
    }
  };

  const playNextVerse = () => {
    const activeKey = currentVerseKeyRef.current;
    if (!activeKey) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const parts = activeKey.split(":");
    const chapId = currentChapterIdRef.current || Number(parts[0]) || 1;
    const currentAyah = Number(parts[1]) || 1;
    const totalAyahs = CHAPTER_VERSE_COUNTS[chapId - 1] || 7;

    // 1. If loaded queue has next verse
    if (versesQueueRef.current && versesQueueRef.current.length > 0) {
      const currentIndex = versesQueueRef.current.findIndex((v) => v.verse_key === activeKey);
      if (currentIndex !== -1 && currentIndex < versesQueueRef.current.length - 1) {
        const nextVerse = versesQueueRef.current[currentIndex + 1];
        playVerse(chapId, nextVerse.verse_key);
        return;
      }
    }

    // 2. Continuous numerical progression for the whole Surah
    if (currentAyah < totalAyahs) {
      const nextKey = `${chapId}:${currentAyah + 1}`;
      playVerse(chapId, nextKey);
    } else {
      // Completed full Surah recitation
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentVerseKey(null);
      currentVerseKeyRef.current = null;
    }
  };

  const playPreviousVerse = () => {
    const activeKey = currentVerseKeyRef.current;
    if (!activeKey) return;

    const parts = activeKey.split(":");
    const chapId = currentChapterIdRef.current || Number(parts[0]) || 1;
    const currentAyah = Number(parts[1]) || 1;

    if (versesQueueRef.current && versesQueueRef.current.length > 0) {
      const currentIndex = versesQueueRef.current.findIndex((v) => v.verse_key === activeKey);
      if (currentIndex > 0) {
        const prevVerse = versesQueueRef.current[currentIndex - 1];
        playVerse(chapId, prevVerse.verse_key);
        return;
      }
    }

    if (currentAyah > 1) {
      const prevKey = `${chapId}:${currentAyah - 1}`;
      playVerse(chapId, prevKey);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    currentReciterRef.current = reciter;
    if (currentChapterIdRef.current && currentVerseKeyRef.current && isPlayingRef.current) {
      playVerse(currentChapterIdRef.current, currentVerseKeyRef.current);
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    playbackRateRef.current = rate;
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setRepeatModeState(mode);
    repeatModeRef.current = mode;
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentVerseKey(null);
    currentVerseKeyRef.current = null;
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isLoading,
        currentVerseKey,
        currentChapterId,
        currentReciter,
        reciters,
        currentTime,
        duration,
        playbackRate,
        repeatMode,
        playVerse,
        playSurah,
        updateVersesQueue,
        playWord,
        togglePlayPause,
        playNextVerse,
        playPreviousVerse,
        seek,
        setReciter,
        setPlaybackRate,
        setRepeatMode,
        stopAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
