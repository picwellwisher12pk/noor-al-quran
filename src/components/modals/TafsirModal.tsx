"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { fetchTafsirForAyah, AVAILABLE_TAFSIRS, TafsirOption } from "@/services/quranApi";
import { parseAndFormatTafsir } from "@/utils/tafsirFormatter";
import { useReadingPreferences } from "@/context/ReadingPreferencesContext";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, Loader2, Globe } from "lucide-react";

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string | null;
  arabicText?: string;
}

export function TafsirModal({ isOpen, onClose, verseKey, arabicText }: TafsirModalProps) {
  const { prefs, setSelectedTafsirId, setTafsirFontSize } = useReadingPreferences();
  const { isUrdu } = useLanguage();
  const [currentTafsirId, setCurrentTafsirId] = useState<number>(
    isUrdu && ![160, 159, 157, 818].includes(prefs.selectedTafsirId)
      ? 160
      : prefs.selectedTafsirId || 160
  );
  const [tafsirData, setTafsirData] = useState<{ text: string; author: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTafsirs = isUrdu
    ? AVAILABLE_TAFSIRS.filter((t) => t.language === "urdu")
    : AVAILABLE_TAFSIRS;

  const selectedTafsir = availableTafsirs.find((t) => t.id === currentTafsirId) || availableTafsirs[0] || AVAILABLE_TAFSIRS[0];
  const isRtl = selectedTafsir.language === "urdu" || selectedTafsir.language === "arabic";

  // Sync if language changes to Urdu
  useEffect(() => {
    if (isUrdu && ![160, 159, 157, 818].includes(currentTafsirId)) {
      setCurrentTafsirId(160);
      setSelectedTafsirId(160);
    }
  }, [isUrdu, currentTafsirId, setSelectedTafsirId]);

  useEffect(() => {
    if (!isOpen || !verseKey) return;
    setLoading(true);
    setError(null);
    setTafsirData(null);

    fetchTafsirForAyah(currentTafsirId, verseKey)
      .then((data) => {
        if (!data || !data.text) {
          setError(isUrdu ? "اس آیت کی تفسیر فی الحال دستیاب نہیں ہے۔" : "No authentic commentary found for this ayah in the selected Tafsir.");
        } else {
          setTafsirData({
            ...data,
            text: parseAndFormatTafsir(data.text, isUrdu),
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load tafsir:", err);
        setError(isUrdu ? "تفسیر لوڈ کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔" : "Unable to load Tafsir. Please check your network connection.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, verseKey, currentTafsirId, isUrdu]);

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
          <span>
            {isUrdu ? `آیت ${verseKey} کی مستند تفسیر` : `Ayah ${verseKey} Commentary (Tafseer)`}
          </span>
        </div>
      }
    >
      {/* Tafsir Selector Dropdown & Font Scaling */}
      <div className="mb-5 p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isUrdu ? "مستند تفسیر منتخب کریں" : "Select Authentic Tafseer Commentary"}</span>
          </label>

          {/* Tafseer Font Size Controls */}
          <div className="flex items-center rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs px-1.5 py-0.5 shadow-xs">
            <span className="text-[10px] text-[var(--muted-foreground)] mr-1.5 font-medium">
              {isUrdu ? "سائز:" : "Size:"}
            </span>
            <button
              type="button"
              onClick={() => setTafsirFontSize(Math.max(13, (prefs.tafsirFontSize || 18) - 1))}
              className="px-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
              title="Decrease Tafseer font size"
            >
              A-
            </button>
            <span className="px-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
              {prefs.tafsirFontSize || 18}px
            </span>
            <button
              type="button"
              onClick={() => setTafsirFontSize(Math.min(34, (prefs.tafsirFontSize || 18) + 1))}
              className="px-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
              title="Increase Tafseer font size"
            >
              A+
            </button>
          </div>
        </div>
        <select
          value={currentTafsirId}
          onChange={(e) => handleTafsirChange(Number(e.target.value))}
          className="w-full rounded-xl bg-[var(--surface-card)] px-3.5 py-2.5 text-sm text-[var(--foreground)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          {isUrdu ? (
            availableTafsirs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.author}
              </option>
            ))
          ) : (
            <>
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
            </>
          )}
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
            {isUrdu ? `${selectedTafsir.name} لوڈ ہو رہی ہے...` : `Loading ${selectedTafsir.name}...`}
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
            <span>{isUrdu ? `مصنف: ${tafsirData.author}` : `Author: ${tafsirData.author}`}</span>
            <span className="capitalize">{isUrdu ? `زبان: اردو` : `Language: ${selectedTafsir.language}`}</span>
          </div>
          <div
            className={`tafsir-rendered-content max-w-none text-[var(--foreground)] ${
              isRtl
                ? selectedTafsir.language === "urdu"
                  ? "font-urdu leading-[2.3] text-right"
                  : "font-arabic text-right"
                : "text-left leading-relaxed"
            }`}
            style={{ fontSize: `${prefs.tafsirFontSize || 18}px` }}
            dir={isRtl ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: tafsirData.text }}
          />
        </div>
      )}
    </Modal>
  );
}
