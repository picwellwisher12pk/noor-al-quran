"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Reciter, Verse } from "@/types/quran";
import { fetchReciters, fetchVerseAudioUrl, WBW_CDN_URL, getTranslationAudioUrl } from "@/services/quranApi";
import { normalizeAudioUrl } from "@/utils/audioResolver";
import { CHAPTER_VERSE_COUNTS } from "@/utils/quranMeta";
import { offlineStorage } from "@/services/offlineStorage";
import { ReadingPreferencesContext } from "@/context/ReadingPreferencesContext";
import { LanguageContext } from "@/context/LanguageContext";

export type RepeatMode = "none" | "verse" | "infinite";

export interface PlayVerseOptions {
  skipBismillah?: boolean;
}

interface AudioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  isPlayingBismillah: boolean;
  isPlayingTranslation: boolean;
  isTranslationLoading: boolean;
  currentVerseKey: string | null;
  currentChapterId: number | null;
  currentReciter: Reciter | null;
  reciters: Reciter[];
  currentTime: number;
  duration: number;
  translationCurrentTime: number;
  translationDuration: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  playVerse: (chapterId: number, verseKey: string, versesList?: Verse[], options?: PlayVerseOptions) => Promise<void>;
  playSurah: (chapterId: number, startAyah?: number, versesList?: Verse[]) => Promise<void>;
  updateVersesQueue: (verses: Verse[]) => void;
  playWord: (audioUrl: string) => void;
  togglePlayPause: () => void;
  toggleTranslationPlayPause: () => void;
  playNextVerse: () => void;
  playPreviousVerse: () => void;
  seek: (time: number) => void;
  seekTranslation: (time: number) => void;
  setReciter: (reciter: Reciter) => void;
  setPlaybackRate: (rate: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  stopAudio: () => void;
  stopTranslationAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingBismillah, setIsPlayingBismillah] = useState(false);
  const [isPlayingTranslation, setIsPlayingTranslation] = useState(false);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [currentReciter, setCurrentReciter] = useState<Reciter | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [translationCurrentTime, setTranslationCurrentTime] = useState(0);
  const [translationDuration, setTranslationDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>("none");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const translationAudioRef = useRef<HTMLAudioElement | null>(null);
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
  const isPlayingBismillahRef = useRef<boolean>(false);
  const bismillahTargetRef = useRef<{ chapterId: number; verseKey: string } | null>(null);
  const isPlayingTranslationRef = useRef<boolean>(false);
  const handleVerseEndedRef = useRef<() => void>(() => {});
  const handleTranslationEndedRef = useRef<() => void>(() => {});

  const readingPrefsCtx = useContext(ReadingPreferencesContext);
  const languageCtx = useContext(LanguageContext);

  const prefs = readingPrefsCtx?.prefs;
  const language = languageCtx?.language || "bilingual";

  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

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
    // If Bismillah just finished playing before a midway verse, immediately start the target verse
    if (isPlayingBismillahRef.current && bismillahTargetRef.current) {
      const target = bismillahTargetRef.current;
      isPlayingBismillahRef.current = false;
      setIsPlayingBismillah(false);
      bismillahTargetRef.current = null;
      playVerse(target.chapterId, target.verseKey, undefined, { skipBismillah: true });
      return;
    }

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

    // Check if translation audio playback is enabled in preferences
    const activePrefs = prefsRef.current;
    if (activePrefs?.playTranslationAudio && translationAudioRef.current?.src) {
      translationAudioRef.current.playbackRate = playbackRateRef.current;
      translationAudioRef.current.play().then(() => {
        setIsPlayingTranslation(true);
        isPlayingTranslationRef.current = true;
      }).catch((err) => {
        console.warn("Failed to play translation audio, advancing to next verse:", err);
        playNextVerse();
      });
      return;
    }

    // Automatically advance to the next verse in the Surah
    playNextVerse();
  };

  const handleTranslationEnded = () => {
    setIsPlayingTranslation(false);
    isPlayingTranslationRef.current = false;
    setTranslationCurrentTime(0);
    // When translation finishes, advance to next verse if continuous playback is active
    playNextVerse();
  };

  // Keep ended handler refs current on every render
  useEffect(() => {
    handleVerseEndedRef.current = handleVerseEnded;
    handleTranslationEndedRef.current = handleTranslationEnded;
  });

  // Initialize audio elements and reciters
  useEffect(() => {
    audioRef.current = new Audio();
    translationAudioRef.current = new Audio();
    wordAudioRef.current = new Audio();

    const audio = audioRef.current;
    const trAudio = translationAudioRef.current;

    // --- Arabic Audio Listeners ---
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    const handlePause = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    const handleEnded = () => {
      handleVerseEndedRef.current();
    };

    const handleError = (e: Event) => {
      console.error("Arabic recitation audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      isPlayingBismillahRef.current = false;
      setIsPlayingBismillah(false);
      bismillahTargetRef.current = null;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // --- Translation Audio Listeners ---
    const handleTrTimeUpdate = () => {
      setTranslationCurrentTime(trAudio.currentTime);
    };

    const handleTrLoadedMetadata = () => {
      setTranslationDuration(trAudio.duration || 0);
      setIsTranslationLoading(false);
    };

    const handleTrWaiting = () => {
      setIsTranslationLoading(true);
    };

    const handleTrCanPlay = () => {
      setIsTranslationLoading(false);
    };

    const handleTrPlaying = () => {
      setIsTranslationLoading(false);
      setIsPlayingTranslation(true);
      isPlayingTranslationRef.current = true;
    };

    const handleTrPause = () => {
      setIsPlayingTranslation(false);
      isPlayingTranslationRef.current = false;
    };

    const handleTrEnded = () => {
      handleTranslationEndedRef.current();
    };

    const handleTrError = (e: Event) => {
      console.warn("Translation audio error:", e);
      setIsTranslationLoading(false);
      setIsPlayingTranslation(false);
      isPlayingTranslationRef.current = false;
    };

    trAudio.addEventListener("timeupdate", handleTrTimeUpdate);
    trAudio.addEventListener("loadedmetadata", handleTrLoadedMetadata);
    trAudio.addEventListener("waiting", handleTrWaiting);
    trAudio.addEventListener("canplay", handleTrCanPlay);
    trAudio.addEventListener("playing", handleTrPlaying);
    trAudio.addEventListener("pause", handleTrPause);
    trAudio.addEventListener("ended", handleTrEnded);
    trAudio.addEventListener("error", handleTrError);

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
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);

      trAudio.pause();
      trAudio.removeEventListener("timeupdate", handleTrTimeUpdate);
      trAudio.removeEventListener("loadedmetadata", handleTrLoadedMetadata);
      trAudio.removeEventListener("waiting", handleTrWaiting);
      trAudio.removeEventListener("canplay", handleTrCanPlay);
      trAudio.removeEventListener("playing", handleTrPlaying);
      trAudio.removeEventListener("pause", handleTrPause);
      trAudio.removeEventListener("ended", handleTrEnded);
      trAudio.removeEventListener("error", handleTrError);
    };
  }, []);

  const preloadedNextAudioRef = useRef<{ verseKey: string; url: string; element?: HTMLAudioElement } | null>(null);
  const preloadedTranslationAudioRef = useRef<{ verseKey: string; url: string; element?: HTMLAudioElement } | null>(null);

  // Proactively download/buffer translation audio for the current verse so it is ready the instant Arabic recitation ends
  const preloadCurrentTranslationAudio = (chapId: number, currentKey: string) => {
    try {
      const activePrefs = prefsRef.current;
      if (!activePrefs?.playTranslationAudio || !currentKey) return;

      const parts = currentKey.split(":");
      const chapter = chapId || Number(parts[0]) || 1;
      const ayahNum = Number(parts[1]) || 1;
      const activeLanguage = languageRef.current;

      let voice = activePrefs.urduTranslationAudioVoice || "urdu_shamshad_ali_khan_46kbps";
      if (activeLanguage === "english" || (!activePrefs.showUrduTranslation && activePrefs.showTranslation)) {
        voice = activePrefs.englishTranslationAudioVoice || "Sahih_Intnl_Ibrahim_Walk_192kbps";
      }

      const translationUrl = getTranslationAudioUrl(chapter, ayahNum, voice);
      if (translationUrl) {
        const preAudio = new Audio();
        preAudio.preload = "auto";
        preAudio.src = translationUrl;
        preAudio.load();
        preloadedTranslationAudioRef.current = {
          verseKey: currentKey,
          url: translationUrl,
          element: preAudio,
        };
      }
    } catch (e) {
      console.warn("Failed to preload translation audio:", e);
    }
  };

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

  const resolveVerseAudioUrl = async (reciterId: number, key: string): Promise<string | null> => {
    let url = await offlineStorage.getVerseAudioUrl(reciterId, key);

    if (!url && preloadedNextAudioRef.current?.verseKey === key && preloadedNextAudioRef.current?.url) {
      url = preloadedNextAudioRef.current.url;
    }

    if (!url) {
      url = await fetchVerseAudioUrl(reciterId, key);
      if (url) {
        offlineStorage.cacheVerseAudio(reciterId, key, url).catch(() => {});
      }
    }

    return url;
  };

  const preloadTargetVerse = async (reciterId: number, targetKey: string) => {
    try {
      const url = await resolveVerseAudioUrl(reciterId, targetKey);
      if (url) {
        const preAudio = new Audio();
        preAudio.preload = "auto";
        preAudio.src = url;
        preAudio.load();
        preloadedNextAudioRef.current = { verseKey: targetKey, url, element: preAudio };
      }
    } catch (e) {
      console.warn("Preload target verse audio skipped:", e);
    }
  };

  const playVerse = async (
    chapterId: number,
    verseKey: string,
    versesList?: Verse[],
    options?: PlayVerseOptions
  ) => {
    if (versesList && versesList.length > 0) {
      versesQueueRef.current = versesList;
    }

    const verseNumber = Number(verseKey.split(":")[1]) || 1;
    const isFreshSession =
      currentChapterIdRef.current !== chapterId ||
      !currentVerseKeyRef.current ||
      isPlayingBismillahRef.current;
    const shouldPrependBismillah =
      !options?.skipBismillah &&
      chapterId !== 9 &&
      verseNumber > 1 &&
      isFreshSession;

    setCurrentChapterId(chapterId);
    currentChapterIdRef.current = chapterId;
    setCurrentVerseKey(verseKey);
    currentVerseKeyRef.current = verseKey;
    setIsPlayingTranslation(false);
    isPlayingTranslationRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    setTranslationCurrentTime(0);
    setIsLoading(true);
    repeatCountRef.current = 0;

    // Stop and buffer translation audio into translationAudioRef so duration is immediately known & ready to play
    if (translationAudioRef.current) {
      translationAudioRef.current.pause();
      translationAudioRef.current.currentTime = 0;

      try {
        const activePrefs = prefsRef.current;
        const activeLanguage = languageRef.current;
        let voice = activePrefs?.urduTranslationAudioVoice || "urdu_shamshad_ali_khan_46kbps";
        if (activeLanguage === "english" || (!activePrefs?.showUrduTranslation && activePrefs?.showTranslation)) {
          voice = activePrefs?.englishTranslationAudioVoice || "Sahih_Intnl_Ibrahim_Walk_192kbps";
        }
        const parts = verseKey.split(":");
        const chap = chapterId || Number(parts[0]) || 1;
        const ayah = Number(parts[1]) || 1;
        const trUrl = getTranslationAudioUrl(chap, ayah, voice);
        if (trUrl) {
          translationAudioRef.current.src = trUrl;
          translationAudioRef.current.playbackRate = playbackRateRef.current;
          translationAudioRef.current.preload = "auto";
          translationAudioRef.current.load();
        }
      } catch (e) {
        console.warn("Failed to preload translation audio:", e);
      }
    }

    const reciterId = currentReciterRef.current ? currentReciterRef.current.id : 7;

    if (shouldPrependBismillah) {
      const bismillahUrl = await resolveVerseAudioUrl(reciterId, "1:1");
      if (bismillahUrl && audioRef.current) {
        isPlayingBismillahRef.current = true;
        setIsPlayingBismillah(true);
        bismillahTargetRef.current = { chapterId, verseKey };
        try {
          audioRef.current.src = bismillahUrl;
          audioRef.current.playbackRate = playbackRateRef.current;
          await audioRef.current.play();
          setIsPlaying(true);
          isPlayingRef.current = true;
          setIsLoading(false);

          // Preload the target verse while Bismillah plays for zero-gap transition
          preloadTargetVerse(reciterId, verseKey);
          return;
        } catch (e) {
          console.error("Bismillah playback error:", e);
          isPlayingBismillahRef.current = false;
          setIsPlayingBismillah(false);
          bismillahTargetRef.current = null;
          setIsLoading(false);
          setIsPlaying(false);
          isPlayingRef.current = false;
          return;
        }
      }
    }

    isPlayingBismillahRef.current = false;
    setIsPlayingBismillah(false);
    bismillahTargetRef.current = null;

    const audioUrl = await resolveVerseAudioUrl(reciterId, verseKey);

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

      // Immediately buffer/preload next Arabic verse
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
        fullUrl = normalizeAudioUrl(relativeAudioUrl) || relativeAudioUrl;
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
      // Pause translation if it was playing so both don't overlap
      if (translationAudioRef.current && isPlayingTranslationRef.current) {
        translationAudioRef.current.pause();
        setIsPlayingTranslation(false);
        isPlayingTranslationRef.current = false;
      }

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

  const toggleTranslationPlayPause = () => {
    if (!translationAudioRef.current) return;
    if (isPlayingTranslationRef.current) {
      translationAudioRef.current.pause();
      setIsPlayingTranslation(false);
      isPlayingTranslationRef.current = false;
    } else {
      // Pause Arabic recitation if it was playing so both don't overlap
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
      }

      if (translationAudioRef.current.src) {
        translationAudioRef.current.playbackRate = playbackRateRef.current;
        translationAudioRef.current.play().then(() => {
          setIsPlayingTranslation(true);
          isPlayingTranslationRef.current = true;
        }).catch(console.error);
      } else if (currentChapterIdRef.current && currentVerseKeyRef.current) {
        const parts = currentVerseKeyRef.current.split(":");
        const chap = currentChapterIdRef.current || Number(parts[0]) || 1;
        const ayah = Number(parts[1]) || 1;
        const activePrefs = prefsRef.current;
        const activeLanguage = languageRef.current;
        let voice = activePrefs?.urduTranslationAudioVoice || "urdu_shamshad_ali_khan_46kbps";
        if (activeLanguage === "english" || (!activePrefs?.showUrduTranslation && activePrefs?.showTranslation)) {
          voice = activePrefs?.englishTranslationAudioVoice || "Sahih_Intnl_Ibrahim_Walk_192kbps";
        }
        const url = getTranslationAudioUrl(chap, ayah, voice);
        if (url) {
          translationAudioRef.current.src = url;
          translationAudioRef.current.playbackRate = playbackRateRef.current;
          translationAudioRef.current.play().then(() => {
            setIsPlayingTranslation(true);
            isPlayingTranslationRef.current = true;
          }).catch(console.error);
        }
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
        playVerse(chapId, nextVerse.verse_key, undefined, { skipBismillah: true });
        return;
      }
    }

    // 2. Continuous numerical progression for the whole Surah
    if (currentAyah < totalAyahs) {
      const nextKey = `${chapId}:${currentAyah + 1}`;
      playVerse(chapId, nextKey, undefined, { skipBismillah: true });
    } else {
      // Completed full Surah recitation
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsPlayingTranslation(false);
      isPlayingTranslationRef.current = false;
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
        playVerse(chapId, prevVerse.verse_key, undefined, { skipBismillah: true });
        return;
      }
    }

    if (currentAyah > 1) {
      const prevKey = `${chapId}:${currentAyah - 1}`;
      playVerse(chapId, prevKey, undefined, { skipBismillah: true });
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekTranslation = (time: number) => {
    if (translationAudioRef.current) {
      translationAudioRef.current.currentTime = time;
      setTranslationCurrentTime(time);
    }
  };

  const setReciter = (reciter: Reciter) => {
    setCurrentReciter(reciter);
    currentReciterRef.current = reciter;
    if (currentChapterIdRef.current && currentVerseKeyRef.current && isPlayingRef.current) {
      playVerse(currentChapterIdRef.current, currentVerseKeyRef.current, undefined, {
        skipBismillah: !isPlayingBismillahRef.current,
      });
    }
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    playbackRateRef.current = rate;
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (translationAudioRef.current) {
      translationAudioRef.current.playbackRate = rate;
    }
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setRepeatModeState(mode);
    repeatModeRef.current = mode;
  };

  const stopTranslationAudio = () => {
    if (translationAudioRef.current) {
      translationAudioRef.current.pause();
      translationAudioRef.current.currentTime = 0;
    }
    setIsPlayingTranslation(false);
    isPlayingTranslationRef.current = false;
    setTranslationCurrentTime(0);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (translationAudioRef.current) {
      translationAudioRef.current.pause();
      translationAudioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    isPlayingBismillahRef.current = false;
    setIsPlayingBismillah(false);
    bismillahTargetRef.current = null;
    setIsPlayingTranslation(false);
    isPlayingTranslationRef.current = false;
    setCurrentTime(0);
    setTranslationCurrentTime(0);
    setCurrentVerseKey(null);
    currentVerseKeyRef.current = null;
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isLoading,
        isPlayingBismillah,
        isPlayingTranslation,
        isTranslationLoading,
        currentVerseKey,
        currentChapterId,
        currentReciter,
        reciters,
        currentTime,
        duration,
        translationCurrentTime,
        translationDuration,
        playbackRate,
        repeatMode,
        playVerse,
        playSurah,
        updateVersesQueue,
        playWord,
        togglePlayPause,
        toggleTranslationPlayPause,
        playNextVerse,
        playPreviousVerse,
        seek,
        seekTranslation,
        setReciter,
        setPlaybackRate,
        setRepeatMode,
        stopAudio,
        stopTranslationAudio,
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
