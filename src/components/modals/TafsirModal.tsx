"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { fetchTafsirForAyah } from "@/services/quranApi";
import { BookOpen, Loader2 } from "lucide-react";

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string | null;
  arabicText?: string;
}

export function TafsirModal({ isOpen, onClose, verseKey, arabicText }: TafsirModalProps) {
  const [tafsirData, setTafsirData] = useState<{ text: string; author: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !verseKey) return;
    setLoading(true);
    setError(null);
    setTafsirData(null);

    fetchTafsirForAyah(169, verseKey)
      .then((data) => {
        if (!data || !data.text) {
          setError("No authentic Tafsir found for this ayah.");
        } else {
          setTafsirData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load tafsir:", err);
        setError("Unable to load Tafsir. Please check your internet connection.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, verseKey]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <span>Tafsir Ibn Kathir (Ayah {verseKey})</span>
        </div>
      }
    >
      {arabicText && (
        <div className="mb-6 rounded-xl bg-[var(--surface-raised,#16211d)] p-4 text-right border border-[var(--border-subtle,#22332c)]">
          <p className="font-arabic text-2xl text-[var(--foreground)] leading-loose" dir="rtl">
            {arabicText}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
          <p className="text-sm text-[var(--muted-foreground,#8e9b94)]">Fetching authentic Tafsir from Quran.com...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-800/40 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && tafsirData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground,#8e9b94)] border-b border-[var(--border-subtle,#1e2925)] pb-2">
            <span>Author: {tafsirData.author}</span>
            <span>Source: Quran Foundation (Abridged)</span>
          </div>
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--foreground)] font-normal tafsir-html"
            dangerouslySetInnerHTML={{ __html: tafsirData.text }}
          />
        </div>
      )}
    </Modal>
  );
}
