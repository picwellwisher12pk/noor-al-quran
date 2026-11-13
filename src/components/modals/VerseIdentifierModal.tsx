"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { useAudio } from "@/context/AudioContext";
import { useLanguage } from "@/context/LanguageContext";
import { VerseMatchResult } from "@/services/arabicMatcher";
import {
  identifyVerseFromText,
  getSavedSTTConfig,
  saveSTTConfig,
  transcribeWithGroq,
  transcribeWithGemini,
  transcribeWithOpenAI,
  isBrowserSpeechSupported,
  STTEngineType,
} from "@/services/verseIdentifierService";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  ExternalLink,
  Volume2,
  Sparkles,
  Settings2,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Search,
  Key,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface VerseIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabMode = "recite" | "text" | "settings";

export function VerseIdentifierModal({ isOpen, onClose }: VerseIdentifierModalProps) {
  const router = useRouter();
  const { isUrdu } = useLanguage();
  const { playVerse } = useAudio();

  const [activeTab, setActiveTab] = useState<TabMode>("recite");
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to listen. Tap the microphone and recite.");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<VerseMatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);

  // Settings State
  const [engine, setEngine] = useState<STTEngineType>("browser");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Media & Recognition Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved STT config on mount
  useEffect(() => {
    if (isOpen) {
      const cfg = getSavedSTTConfig();
      setEngine(cfg.engine);
      setGroqKey(cfg.groqKey);
      setGeminiKey(cfg.geminiKey);
      setOpenAiKey(cfg.openAiKey);
      setStatusMessage("Ready to listen. Tap the microphone and recite any verse in Arabic.");
    } else {
      stopRecording();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setPlayingVerseKey(null);
    }
  }, [isOpen]);

  const handleSaveSettings = () => {
    saveSTTConfig({
      engine,
      groqKey: groqKey.trim(),
      geminiKey: geminiKey.trim(),
      openAiKey: openAiKey.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const executeMatch = useCallback(async (transcribedText: string) => {
    if (!transcribedText || transcribedText.trim().length < 2) {
      setStatusMessage("No clear speech detected. Please recite again clearly.");
      setIsProcessing(false);
      return;
    }

    setStatusMessage(`Searching 6,236 Ayahs for "${transcribedText}"...`);
    setIsProcessing(true);
    try {
      const matches = await identifyVerseFromText(transcribedText, 5, 0.35);
      setResults(matches);
      setHasSearched(true);
      if (matches.length > 0) {
        const top = matches[0];
        setStatusMessage(
          `Identified! Surah ${top.verse.surah_name_english} (${top.verse.surah_number}:${top.verse.ayah_span || top.verse.ayah_number}) with ${(top.confidence * 100).toFixed(0)}% confidence.`
        );
      } else {
        setStatusMessage("No matching verse found. Try reciting a longer or clearer portion.");
      }
    } catch (err) {
      console.error("Match error:", err);
      setStatusMessage("Failed to match verse. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Web Speech API Live Recognition
  const startBrowserDictation = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setStatusMessage("Browser speech recognition not supported. Switch to Cloud AI STT in settings.");
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let fullTranscript = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          fullTranscript += " " + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const combined = (fullTranscript + " " + interim).trim();
      setLiveTranscript(combined);
      if (combined) {
        setStatusMessage(`Transcribing recitation: "${combined}"`);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error !== "no-speech") {
        setStatusMessage(`Speech error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Automatically restart if user hasn't explicitly stopped
        try {
          recognition.start();
        } catch {
          // Ignore
        }
      }
    };

    recognition.start();
    speechRecognitionRef.current = recognition;
  };

  // Start MediaRecorder
  const startRecording = async () => {
    setResults([]);
    setHasSearched(false);
    setLiveTranscript("");
    setRecordDuration(0);
    setIsRecording(true);
    setStatusMessage("Listening... Recite any verse in Arabic clearly.");

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);

    // If browser mode, use Web Speech API
    if (engine === "browser" && isBrowserSpeechSupported()) {
      startBrowserDictation();
    }

    // Always record audio buffer for cloud AI fallback or audio processing
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatusMessage("Could not access microphone. Please allow microphone permissions.");
      stopRecording();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop Web Speech
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // Ignore
      }
      speechRecognitionRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });

        // Release mic stream tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());

        // Process audio
        await processRecordedAudio(audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else if (liveTranscript) {
      executeMatch(liveTranscript);
    }
  };

  const processRecordedAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    // 1. If browser engine and we already have transcript from Web Speech
    if (engine === "browser") {
      if (liveTranscript.trim().length > 1) {
        await executeMatch(liveTranscript.trim());
      } else {
        setStatusMessage("No speech recognized by browser. Try Cloud AI STT in settings for higher accuracy.");
        setIsProcessing(false);
      }
      return;
    }

    // 2. Cloud AI Engines
    try {
      let resultText = "";
      if (engine === "groq") {
        if (!groqKey) throw new Error("Groq API Key is missing. Configure it in Settings tab.");
        setStatusMessage("Transcribing audio with Groq Whisper Large v3...");
        const res = await transcribeWithGroq(audioBlob, groqKey);
        resultText = res.text;
      } else if (engine === "gemini") {
        if (!geminiKey) throw new Error("Gemini API Key is missing. Configure it in Settings tab.");
        setStatusMessage("Transcribing audio with Google Gemini Flash...");
        const res = await transcribeWithGemini(audioBlob, geminiKey);
        resultText = res.text;
      } else if (engine === "openai") {
        if (!openAiKey) throw new Error("OpenAI API Key is missing. Configure it in Settings tab.");
        setStatusMessage("Transcribing audio with OpenAI Whisper...");
        const res = await transcribeWithOpenAI(audioBlob, openAiKey);
        resultText = res.text;
      }

      setLiveTranscript(resultText);
      await executeMatch(resultText);
    } catch (err: unknown) {
      console.error("Transcription error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Transcription failed: ${msg}`);
      setIsProcessing(false);
    }
  };

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    executeMatch(textInput.trim());
  };

  const handlePlayRecitation = (result: VerseMatchResult) => {
    const key = `${result.verse.surah_number}:${result.verse.ayah_number}`;
    if (playingVerseKey === key) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setPlayingVerseKey(null);
      return;
    }

    // Play globally via AudioContext
    playVerse(result.verse.surah_number, key);
    setPlayingVerseKey(key);
  };

  const handleOpenVerse = (surahNumber: number, ayahNumber: number) => {
    onClose();
    router.push(`/surah/${surahNumber}?ayah=${ayahNumber}`);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                {isUrdu ? "تلاوت سے آیت تلاش کریں" : "Recite to Identify / Verse Finder"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI + Phonetics
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {isUrdu
                ? "قرآن پاک کی کوئی بھی آیت تلاوت کریں اور فوراً تلاش کریں"
                : "Recite or speak any Quranic Ayah to instantly find its Surah and location"}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab("recite")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "recite"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>{isUrdu ? "صوتی تلاوت" : "Recite Audio"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "text"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>{isUrdu ? "متن تلاش" : "Type / Paste Text"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
            title="Speech Engines & API Keys"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isUrdu ? "ترتیبات" : "Engines"}</span>
          </button>
        </div>

        {/* ================= TAB 1: RECITE AUDIO ================= */}
        {activeTab === "recite" && (
          <div className="flex flex-col items-center py-4 px-2 space-y-4">
            {/* Pulsing Recording Button */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div className="absolute h-28 w-28 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute h-24 w-24 rounded-full bg-emerald-500/30 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative z-10 h-20 w-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-300 dark:ring-red-900/50"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-200 dark:ring-emerald-950/50"
                } disabled:opacity-50`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-7 w-7 fill-white mb-1" />
                    <span className="text-[10px] font-mono font-bold tracking-wider">
                      {formatTimer(recordDuration)}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-8 w-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isUrdu ? "شروع" : "Tap"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Status & Live Transcript */}
            <div className="text-center max-w-md w-full space-y-2">
              <p className="text-xs font-medium text-[var(--foreground)] flex items-center justify-center gap-1.5">
                {isProcessing && <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                <span>{statusMessage}</span>
              </p>

              {liveTranscript && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Recognized Arabic Recitation:
                  </span>
                  <p className="font-arabic text-base sm:text-lg text-[var(--foreground)] font-semibold leading-relaxed" dir="rtl">
                    {liveTranscript}
                  </p>
                </div>
              )}

              {/* Engine Badge */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Active Engine:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--foreground)]">
                  {engine === "browser" && "Browser Live Dictation (Free)"}
                  {engine === "groq" && "Groq Whisper Large v3 (Turbo)"}
                  {engine === "gemini" && "Google Gemini Flash"}
                  {engine === "openai" && "OpenAI Whisper"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TYPE / PASTE TEXT ================= */}
        {activeTab === "text" && (
          <form onSubmit={handleManualSearch} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                {isUrdu ? "آیت کا متن یا عربی الفاظ درج کریں:" : "Enter Arabic verse text or phonetic words:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="مثلاً: الحمد لله رب العالمين، قل هو الله احد، الرحمن علم القران..."
                  className="w-full rounded-xl bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 font-arabic text-right placeholder-[var(--muted-foreground)]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[var(--muted-foreground)] mr-1">
                Quick recitations:
              </span>
              {[
                "الحمد لله رب العالمين",
                "قل هو الله احد",
                "مالك يوم الدين",
                "الرحمن علم القران",
                "انا اعطيناك الكوثر",
                "قل اعوذ برب الناس",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setTextInput(sample);
                    executeMatch(sample);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-arabic bg-[var(--surface-raised)] hover:bg-emerald-500/15 border border-[var(--border-subtle)] hover:border-emerald-500/30 text-[var(--foreground)] transition-colors cursor-pointer"
                  dir="rtl"
                >
                  {sample}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !textInput.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>{isUrdu ? "آیت تلاش کریں" : "Identify Verse"}</span>
            </button>
          </form>
        )}

        {/* ================= TAB 3: ENGINES & SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                Speech-to-Text Recognition Engine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: "browser" as const,
                    name: "Browser Dictation",
                    desc: "Free, built-in Web Speech API (zero setup)",
                    badge: "Free & Instant",
                  },
                  {
                    id: "groq" as const,
                    name: "Groq Whisper Large v3",
                    desc: "Sub-200ms ultra-fast cloud Whisper with Quran biasing",
                    badge: "Most Accurate",
                  },
                  {
                    id: "gemini" as const,
                    name: "Google Gemini Flash",
                    desc: "Multimodal AI (Free tier at aistudio.google.com)",
                    badge: "Free AI Tier",
                  },
                  {
                    id: "openai" as const,
                    name: "OpenAI Whisper-1",
                    desc: "Standard OpenAI Whisper audio model",
                    badge: "Cloud API",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEngine(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      engine === item.id
                        ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-[var(--surface-raised)] border-[var(--border-subtle)] hover:border-emerald-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* API Keys Configuration */}
            {engine !== "browser" && (
              <div className="space-y-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                  <Key className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Configure API Key for {engine.toUpperCase()}</span>
                </div>

                {engine === "groq" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--muted-foreground)]">
                      Groq API Key (starts with gsk_):
                    </label>
                    <input
                      type="password"
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full rounded-lg bg-[var(--background)] px-3 py-2 text-xs border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Get a free key at{" "}
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 underline"
                      >
                        console.groq.com
                      </a>
                    </p>
                  </div>
                )}

                {engine === "gemini" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--muted-foreground)]">
                      Google Gemini API Key (starts with AIzaSy...):
                    </label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full rounded-lg bg-[var(--background)] px-3 py-2 text-xs border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Free tier available at{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 underline"
                      >
                        aistudio.google.com
                      </a>
                    </p>
                  </div>
                )}

                {engine === "openai" && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--muted-foreground)]">
                      OpenAI API Key (starts with sk-...):
                    </label>
                    <input
                      type="password"
                      value={openAiKey}
                      onChange={(e) => setOpenAiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full rounded-lg bg-[var(--background)] px-3 py-2 text-xs border border-[var(--border-subtle)] text-[var(--foreground)] focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Keys are stored strictly locally in your browser/device.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {settingsSaved ? "Saved!" : "Save Engine Settings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= RESULTS SECTION ================= */}
        {results.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Identified Verses ({results.length} matches)</span>
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                Ranked by phonetic & orthographic similarity
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {results.map((r, idx) => {
                const confPercent = Math.round(r.confidence * 100);
                const isPlaying = playingVerseKey === `${r.verse.surah_number}:${r.verse.ayah_number}`;

                return (
                  <div
                    key={`${r.verse.surah_number}-${r.verse.ayah_number}-${idx}`}
                    className={`p-3.5 rounded-xl border transition-all ${
                      idx === 0
                        ? "bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/20"
                        : "bg-[var(--surface-raised)] border-[var(--border-subtle)] hover:border-emerald-500/30"
                    }`}
                  >
                    {/* Header: Location & Confidence */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          {r.verse.surah_number}:{r.verse.ayah_span || r.verse.ayah_number}
                        </span>
                        <div>
                          <span className="font-semibold text-xs text-[var(--foreground)] mr-1">
                            {r.verse.surah_name_english}
                          </span>
                          <span className="font-arabic text-xs text-emerald-600 dark:text-emerald-400" dir="rtl">
                            {r.verse.surah_name_arabic}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {r.is_ambiguous && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                            title={r.ambiguity_reason}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>Repeated Ayah</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            confPercent >= 85
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : confPercent >= 60
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30"
                          }`}
                        >
                          {confPercent}% Match
                        </span>
                      </div>
                    </div>

                    {/* Arabic Verse Text */}
                    <p
                      className="font-arabic text-base sm:text-lg text-[var(--foreground)] text-right leading-loose mb-2 select-text"
                      dir="rtl"
                    >
                      {r.verse.arabic_text}
                    </p>

                    {/* Translation */}
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-relaxed">
                      {isUrdu && r.verse.urdu_translation
                        ? r.verse.urdu_translation
                        : r.verse.english_translation}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => handlePlayRecitation(r)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isPlaying
                            ? "bg-emerald-600 text-white"
                            : "bg-[var(--surface-hover)] hover:bg-emerald-500/15 text-[var(--foreground)] hover:text-emerald-600"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>Playing</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen Qari</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenVerse(r.verse.surah_number, r.verse.ayah_number)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open in Quran</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isProcessing && hasSearched && results.length === 0 && (
          <div className="text-center py-6 text-[var(--muted-foreground)] text-xs">
            No authentic verses matched the recitation. Please try reciting more words clearly.
          </div>
        )}
      </div>
    </Modal>
  );
}
