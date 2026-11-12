"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { QuranNote, QuranNoteTargetType } from "@/types/quran";

interface NotesContextType {
  notes: QuranNote[];
  getVerseNote: (verseKey: string) => QuranNote | undefined;
  getWordNote: (location: string) => QuranNote | undefined;
  getNotesForVerse: (verseKey: string) => QuranNote[];
  getNotesForWord: (location: string) => QuranNote[];
  hasVerseNote: (verseKey: string) => boolean;
  hasWordNote: (location: string) => boolean;
  saveVerseNote: (params: {
    id?: string;
    verseKey: string;
    chapterId: number;
    verseNumber: number;
    text: string;
    chapterName?: string;
    color?: "emerald" | "amber" | "blue" | "rose" | "purple";
    tags?: string[];
  }) => void;
  saveWordNote: (params: {
    id?: string;
    location: string;
    wordText: string;
    verseKey: string;
    chapterId: number;
    verseNumber: number;
    text: string;
    chapterName?: string;
    color?: "emerald" | "amber" | "blue" | "rose" | "purple";
    tags?: string[];
  }) => void;
  deleteNote: (id: string) => void;
  clearAllNotes: () => void;
}

const STORAGE_KEY_NOTES = "naq_quran_notes_v1";

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<QuranNote[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load Quran notes from storage:", e);
    }
    setMounted(true);
  }, []);

  // Persist notes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("naq_notes_updated", { detail: notes }));
      }
    } catch (e) {
      console.error("Failed to persist Quran notes:", e);
    }
  }, [notes, mounted]);

  // Cross-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_NOTES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotes(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const getVerseNote = useCallback(
    (verseKey: string) => {
      return notes.find((n) => n.targetType === "verse" && n.verseKey === verseKey);
    },
    [notes]
  );

  const getWordNote = useCallback(
    (location: string) => {
      return notes.find((n) => n.targetType === "word" && n.wordLocation === location);
    },
    [notes]
  );

  const getNotesForVerse = useCallback(
    (verseKey: string) => {
      return notes.filter((n) => n.targetType === "verse" && n.verseKey === verseKey);
    },
    [notes]
  );

  const getNotesForWord = useCallback(
    (location: string) => {
      return notes.filter((n) => n.targetType === "word" && n.wordLocation === location);
    },
    [notes]
  );

  const hasVerseNote = useCallback(
    (verseKey: string) => {
      return notes.some((n) => n.targetType === "verse" && n.verseKey === verseKey);
    },
    [notes]
  );

  const hasWordNote = useCallback(
    (location: string) => {
      return notes.some((n) => n.targetType === "word" && n.wordLocation === location);
    },
    [notes]
  );

  const saveVerseNote = useCallback(
    ({
      id,
      verseKey,
      chapterId,
      verseNumber,
      text,
      chapterName,
      color = "emerald",
      tags = [],
    }: {
      id?: string;
      verseKey: string;
      chapterId: number;
      verseNumber: number;
      text: string;
      chapterName?: string;
      color?: "emerald" | "amber" | "blue" | "rose" | "purple";
      tags?: string[];
    }) => {
      const trimmed = text.trim();
      const targetId = id || `note_v_${verseKey}_${Date.now()}`;

      if (!trimmed) {
        // Empty text deletes the note if editing an existing note
        if (id) {
          setNotes((prev) => prev.filter((n) => n.id !== id));
        }
        return;
      }

      setNotes((prev) => {
        const existingIdx = id ? prev.findIndex((n) => n.id === id) : -1;
        const now = new Date().toISOString();

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            text: trimmed,
            color,
            tags,
            chapterName: chapterName || updated[existingIdx].chapterName,
            updatedAt: now,
          };
          return updated;
        }

        const newNote: QuranNote = {
          id: targetId,
          targetType: "verse",
          verseKey,
          chapterId,
          verseNumber,
          chapterName,
          text: trimmed,
          color,
          tags,
          createdAt: now,
          updatedAt: now,
        };

        return [newNote, ...prev];
      });
    },
    []
  );

  const saveWordNote = useCallback(
    ({
      id,
      location,
      wordText,
      verseKey,
      chapterId,
      verseNumber,
      text,
      chapterName,
      color = "amber",
      tags = [],
    }: {
      id?: string;
      location: string;
      wordText: string;
      verseKey: string;
      chapterId: number;
      verseNumber: number;
      text: string;
      chapterName?: string;
      color?: "emerald" | "amber" | "blue" | "rose" | "purple";
      tags?: string[];
    }) => {
      const trimmed = text.trim();
      const targetId = id || `note_w_${location}_${Date.now()}`;

      if (!trimmed) {
        if (id) {
          setNotes((prev) => prev.filter((n) => n.id !== id));
        }
        return;
      }

      setNotes((prev) => {
        const existingIdx = id ? prev.findIndex((n) => n.id === id) : -1;
        const now = new Date().toISOString();

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            wordText: wordText || updated[existingIdx].wordText,
            text: trimmed,
            color,
            tags,
            chapterName: chapterName || updated[existingIdx].chapterName,
            updatedAt: now,
          };
          return updated;
        }

        const newNote: QuranNote = {
          id: targetId,
          targetType: "word",
          verseKey,
          chapterId,
          verseNumber,
          chapterName,
          wordLocation: location,
          wordText,
          text: trimmed,
          color,
          tags,
          createdAt: now,
          updatedAt: now,
        };

        return [newNote, ...prev];
      });
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotes = useCallback(() => {
    setNotes([]);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        getVerseNote,
        getWordNote,
        getNotesForVerse,
        getNotesForWord,
        hasVerseNote,
        hasWordNote,
        saveVerseNote,
        saveWordNote,
        deleteNote,
        clearAllNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}

