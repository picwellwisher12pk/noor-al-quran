/**
 * Verse Identifier Service for Noor Al-Quran
 * Enables users to recite audio or type/paste Arabic text to identify verses in the Quran.
 * Supports:
 * 1. Fast local ArabicMatcher over 6,236 verses.
 * 2. Web Speech API (Free, zero-config live browser dictation).
 * 3. AI Cloud Speech-to-Text (Groq Whisper Large v3, Google Gemini Flash, OpenAI Whisper).
 */

import { ArabicMatcher, RawVerseRecord, VerseMatchResult } from "./arabicMatcher";

export const QURANIC_VOCABULARY_PROMPT =
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. " +
  "تلاوة آيات وسور من القرآن الكريم بالرسم العثماني المصحف الشريف ترتيل وتجويد.";

export type STTEngineType = "browser" | "groq" | "gemini" | "openai";

export interface TranscribeResult {
  text: string;
  engine: string;
  durationMs: number;
}

let matcherInstance: ArabicMatcher | null = null;
let initPromise: Promise<ArabicMatcher> | null = null;

export async function getVerseMatcher(): Promise<ArabicMatcher> {
  if (matcherInstance) return matcherInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Dynamic import to keep initial bundle light
    const corpusModule = await import("@/data/quranVersesCorpus.json");
    const corpus: RawVerseRecord[] = corpusModule.default as unknown as RawVerseRecord[];
    const matcher = new ArabicMatcher(async () => corpus);
    await matcher.initialize();
    matcherInstance = matcher;
    return matcher;
  })();

  return initPromise;
}

/**
 * Match Arabic recitation transcript against Quran verses
 */
export async function identifyVerseFromText(
  transcript: string,
  limit = 5,
  minConfidence = 0.35
): Promise<VerseMatchResult[]> {
  const matcher = await getVerseMatcher();
  return matcher.matchText(transcript, limit, minConfidence);
}

/**
 * Local storage keys for user API keys
 */
export const VERSE_ID_KEYS = {
  ENGINE: "noor_verse_id_engine",
  GROQ_KEY: "noor_verse_id_groq_key",
  GEMINI_KEY: "noor_verse_id_gemini_key",
  OPENAI_KEY: "noor_verse_id_openai_key",
};

export function getSavedSTTConfig(): {
  engine: STTEngineType;
  groqKey: string;
  geminiKey: string;
  openAiKey: string;
} {
  if (typeof window === "undefined") {
    return { engine: "browser", groqKey: "", geminiKey: "", openAiKey: "" };
  }
  return {
    engine: (localStorage.getItem(VERSE_ID_KEYS.ENGINE) as STTEngineType) || "browser",
    groqKey: localStorage.getItem(VERSE_ID_KEYS.GROQ_KEY) || "",
    geminiKey: localStorage.getItem(VERSE_ID_KEYS.GEMINI_KEY) || "",
    openAiKey: localStorage.getItem(VERSE_ID_KEYS.OPENAI_KEY) || "",
  };
}

export function saveSTTConfig(config: {
  engine?: STTEngineType;
  groqKey?: string;
  geminiKey?: string;
  openAiKey?: string;
}) {
  if (typeof window === "undefined") return;
  if (config.engine !== undefined) localStorage.setItem(VERSE_ID_KEYS.ENGINE, config.engine);
  if (config.groqKey !== undefined) localStorage.setItem(VERSE_ID_KEYS.GROQ_KEY, config.groqKey);
  if (config.geminiKey !== undefined) localStorage.setItem(VERSE_ID_KEYS.GEMINI_KEY, config.geminiKey);
  if (config.openAiKey !== undefined) localStorage.setItem(VERSE_ID_KEYS.OPENAI_KEY, config.openAiKey);
}

/**
 * Transcribe audio blob using Groq Whisper Large v3 Turbo
 */
export async function transcribeWithGroq(
  audioBlob: Blob,
  apiKey: string
): Promise<TranscribeResult> {
  const startTime = Date.now();
  const formData = new FormData();
  formData.append("file", audioBlob, "recitation.webm");
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("language", "ar");
  formData.append("temperature", "0.0");
  formData.append("response_format", "verbose_json");
  formData.append("prompt", QURANIC_VOCABULARY_PROMPT);

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    text: (data.text || "").trim(),
    engine: "Groq Whisper Large v3",
    durationMs: Date.now() - startTime,
  };
}

/**
 * Convert Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Transcribe audio blob using Google Gemini Flash
 */
export async function transcribeWithGemini(
  audioBlob: Blob,
  apiKey: string
): Promise<TranscribeResult> {
  const startTime = Date.now();
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || "audio/webm";

  const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Audio,
                },
              },
              {
                text:
                  "You are an expert Quran recitation transcription system. " +
                  "Transcribe this Arabic recitation audio directly into accurate classical Arabic Quranic text (using standard or Uthmani Arabic script). " +
                  "Strict instruction: Output ONLY the transcribed Arabic text. " +
                  "Do NOT output English translation, explanations, verse numbers, surrounding notes, markdown, or commentary. Output just the raw Arabic recitation text.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 1000,
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 404 || res.status === 400) {
          lastError = new Error(`Gemini (${model}): ${errText}`);
          continue;
        }
        throw new Error(`Google Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const text = rawText.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").replace(/^["']|["']$/g, "").trim();

      return {
        text,
        engine: `Google ${model}`,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Failed to transcribe with Google Gemini models.");
}

/**
 * Transcribe audio blob using OpenAI Whisper
 */
export async function transcribeWithOpenAI(
  audioBlob: Blob,
  apiKey: string
): Promise<TranscribeResult> {
  const startTime = Date.now();
  const formData = new FormData();
  formData.append("file", audioBlob, "recitation.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "ar");
  formData.append("prompt", QURANIC_VOCABULARY_PROMPT);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    text: (data.text || "").trim(),
    engine: "OpenAI Whisper",
    durationMs: Date.now() - startTime,
  };
}

/**
 * Check if Web Speech Recognition is supported in the current environment
 */
export function isBrowserSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}
