"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { fetchTafsirForAyah, AVAILABLE_TAFSIRS, TafsirOption } from "@/services/quranApi";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { BookOpen, Loader2, Globe } from "lucide-react";

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string | null;
  arabicText?: string;
}

export function TafsirModal({ isOpen, onClose, verseKey, arabicText }: TafsirModalProps) {
  const { prefs, setSelectedTafsirId } = useReadingPreferences();
  const [currentTafsirId, setCurrentTafsirId] = useState<number>(prefs.selectedTafsirId || 169);
  const [tafsirData, setTafsirData] = useState<{ text: string; author: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTafsir = AVAILABLE_TAFSIRS.find((t) => t.id === currentTafsirId) || AVAILABLE_TAFSIRS[0];
  const isRtl = selectedTafsir.language === "urdu" || selectedTafsir.language === "arabic";

  useEffect(() => {
    if (!isOpen || !verseKey) return;
    setLoading(true);
    setError(null);
    setTafsirData(null);

    fetchTafsirForAyah(currentTafsirId, verseKey)
      .then((data) => {
        if (!data || !data.text) {
          setError("No authentic commentary found for this ayah in the selected Tafsir.");
        } else {
          setTafsirData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load tafsir:", err);
        setError("Unable to load Tafsir. Please check your network connection.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, verseKey, currentTafsirId]);

  const handleTafsirChange = (newId: number) => {
    setCurrentTafsirId(newId);
    setSelectedTafsirId(newId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <span>Ayah {verseKey} Commentary (Tafseer)</span>
        </div>
      }
    >
      {/* Tafsir Selector Dropdown */}
      <div className="mb-5 p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5 mb-2">
          <Globe className="h-3.5 w-3.5 text-emerald-400" /> Select Authentic Tafseer Commentary
        </label>
        <select
          value={currentTafsirId}
          onChange={(e) => handleTafsirChange(Number(e.target.value))}
          className="w-full rounded-xl bg-[var(--surface-card)] px-3.5 py-2.5 text-sm text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <optgroup label="English Tafseer">
            {AVAILABLE_TAFSIRS.filter((t) => t.language === "english").map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.author}
              </option>
            ))}
          </optgroup>
          <optgroup label="اردو تفاسیر (Urdu)">
            {AVAILABLE_TAFSIRS.filter((t) => t.language === "urdu").map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.author}
              </option>
            ))}
          </optgroup>
          <optgroup label="التفاسير العربية (Arabic)">
            {AVAILABLE_TAFSIRS.filter((t) => t.language === "arabic").map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.author}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {arabicText && (
        <div className="mb-6 rounded-2xl bg-[var(--surface-card)] p-4 text-right border border-[var(--border-subtle)]">
          <p className="font-arabic text-2xl text-[var(--foreground)] leading-loose" dir="rtl">
            {arabicText}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Loading {selectedTafsir.name}...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-800/40 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && tafsirData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-b border-[var(--border-subtle)] pb-2">
            <span>Author: {tafsirData.author}</span>
            <span className="capitalize">Language: {selectedTafsir.language}</span>
          </div>
          <div
            className={`prose prose-invert max-w-none text-sm leading-relaxed text-[var(--foreground)] font-normal tafsir-html ${
              isRtl ? (selectedTafsir.language === "urdu" ? "font-urdu text-base text-right" : "font-arabic text-lg text-right") : "text-left"
            }`}
            dir={isRtl ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: tafsirData.text }}
          />
        </div>
      )}
    </Modal>
  );
}
