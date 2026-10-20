"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Reciter, Verse } from "@/types/quran";
import { fetchReciters, fetchVerseAudioUrl, WBW_CDN_URL } from "@/services/quranApi";

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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const versesQueueRef = useRef<Verse[]>([]);
  const repeatCountRef = useRef(0);

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
      handleVerseEnded();
    };

    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Fetch reciters
    fetchReciters()
      .then((list) => {
        setReciters(list);
        // Default to Mishary Rashid Alafasy (id 7) if present, else first
        const defaultReciter = list.find((r) => r.id === 7) || list[0] || null;
        setCurrentReciter(defaultReciter);
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

  const handleVerseEnded = () => {
    if (repeatMode === "infinite") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    if (repeatMode === "verse") {
      repeatCountRef.current += 1;
      if (repeatCountRef.current < 3) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
        return;
      }
      // reset count and continue
      repeatCountRef.current = 0;
    }

    // Otherwise play next verse in queue
    playNextVerse();
  };

  const playVerse = async (chapterId: number, verseKey: string, versesList?: Verse[]) => {
    if (versesList && versesList.length > 0) {
      versesQueueRef.current = versesList;
    }
    setCurrentChapterId(chapterId);
    setCurrentVerseKey(verseKey);
    setIsLoading(true);
    repeatCountRef.current = 0;

    const reciterId = currentReciter ? currentReciter.id : 7;
    const audioUrl = await fetchVerseAudioUrl(reciterId, verseKey);

    if (!audioUrl || !audioRef.current) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    try {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate;
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (e) {
      console.error("Playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const playWord = (relativeAudioUrl: string) => {
    if (!wordAudioRef.current || !relativeAudioUrl) return;
    try {
      const fullUrl = relativeAudioUrl.startsWith("http")
        ? relativeAudioUrl
        : `${WBW_CDN_URL}/${relativeAudioUrl}`;
      wordAudioRef.current.src = fullUrl;
      wordAudioRef.current.play().catch(console.error);
    } catch (e) {
      console.error("Error playing word audio:", e);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const playNextVerse = () => {
    if (!currentVerseKey || versesQueueRef.current.length === 0) {
      setIsPlaying(false);
      return;
    }
    const currentIndex = versesQueueRef.current.findIndex((v) => v.verse_key === currentVerseKey);
    if (currentIndex !== -1 && currentIndex < versesQueueRef.current.length - 1) {
      const nextVerse = versesQueueRef.current[currentIndex + 1];
      if (currentChapterId) {
        playVerse(currentChapterId, nextVerse.verse_key);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playPreviousVerse = () => {
    if (!currentVerseKey || versesQueueRef.current.length === 0) return;
    const currentIndex = versesQueueRef.current.findIndex((v) => v.verse_key === currentVerseKey);
    if (currentIndex > 0) {
      const prevVerse = versesQueueRef.current[currentIndex - 1];
      if (currentChapterId) {
        playVerse(currentChapterId, prevVerse.verse_key);
      }
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
    // If currently playing, restart current verse with new reciter
    if (currentChapterId && currentVerseKey && isPlaying) {
      playVerse(currentChapterId, currentVerseKey);
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentVerseKey(null);
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
