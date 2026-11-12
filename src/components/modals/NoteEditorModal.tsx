"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Check, StickyNote, Tag, Palette } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNotes } from "@/context/NotesContext";

export interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "verse" | "word";
  verseKey: string;
  chapterId: number;
  verseNumber: number;
  chapterName?: string;
  wordLocation?: string;
  wordText?: string;
  noteId?: string | null;
}

const COLOR_OPTIONS: Array<{
  id: "emerald" | "amber" | "blue" | "rose" | "purple";
  labelEn: string;
  labelUr: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
}> = [
  { id: "emerald", labelEn: "Emerald", labelUr: "سبز", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/30", dotClass: "bg-emerald-500" },
  { id: "amber", labelEn: "Amber", labelUr: "سنہری", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/30", dotClass: "bg-amber-500" },
  { id: "blue", labelEn: "Sky Blue", labelUr: "نیلا", bgClass: "bg-sky-500/10", borderClass: "border-sky-500/30", dotClass: "bg-sky-500" },
  { id: "purple", labelEn: "Purple", labelUr: "جامنی", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/30", dotClass: "bg-purple-500" },
  { id: "rose", labelEn: "Rose", labelUr: "گلابی", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/30", dotClass: "bg-rose-500" },
];

const PRESET_TAGS_EN = ["Reflection", "Dua", "Action", "Vocabulary", "Tadabbur"];
const PRESET_TAGS_UR = ["تدبر", "دعاء", "عمل", "لغوی معنی", "فہم و نصیحت"];

export default function NoteEditorModal({
  isOpen,
  onClose,
  targetType,
  verseKey,
  chapterId,
  verseNumber,
  chapterName,
  wordLocation,
  wordText,
  noteId,
}: NoteEditorModalProps) {
  const { isUrdu } = useLanguage();
  const { notes, getVerseNote, getWordNote, saveVerseNote, saveWordNote, deleteNote } = useNotes();

  const [text, setText] = useState("");
  const [color, setColor] = useState<"emerald" | "amber" | "blue" | "rose" | "purple">(
    targetType === "word" ? "amber" : "emerald"
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);

  // Load existing note when modal opens or target changes
  useEffect(() => {
    if (!isOpen) return;

    if (noteId) {
      const specific = notes.find((n) => n.id === noteId);
      if (specific) {
        setText(specific.text);
        setColor(specific.color || (targetType === "word" ? "amber" : "emerald"));
        setTags(specific.tags || []);
        setExistingId(specific.id);
        setTagInput("");
        return;
      }
    }

    if (targetType === "verse") {
      const existing = getVerseNote(verseKey);
      if (existing) {
        setText(existing.text);
        setColor(existing.color || "emerald");
        setTags(existing.tags || []);
        setExistingId(existing.id);
      } else {
        setText("");
        setColor("emerald");
        setTags([]);
        setExistingId(null);
      }
    } else if (targetType === "word" && wordLocation) {
      const existing = getWordNote(wordLocation);
      if (existing) {
        setText(existing.text);
        setColor(existing.color || "amber");
        setTags(existing.tags || []);
        setExistingId(existing.id);
      } else {
        setText("");
        setColor("amber");
        setTags([]);
        setExistingId(null);
      }
    }
    setTagInput("");
  }, [isOpen, targetType, verseKey, wordLocation, noteId, notes, getVerseNote, getWordNote]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (targetType === "verse") {
      saveVerseNote({
        id: existingId || undefined,
        verseKey,
        chapterId,
        verseNumber,
        chapterName,
        text,
        color,
        tags,
      });
    } else if (targetType === "word" && wordLocation) {
      saveWordNote({
        id: existingId || undefined,
        location: wordLocation,
        wordText: wordText || "",
        verseKey,
        chapterId,
        verseNumber,
        chapterName,
        text,
        color,
        tags,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingId) {
      deleteNote(existingId);
    }
    onClose();
  };

  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const presetTags = isUrdu ? PRESET_TAGS_UR : PRESET_TAGS_EN;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface-card)] text-[var(--foreground)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={isUrdu ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                {targetType === "verse"
                  ? isUrdu
                    ? `آیت کے نوٹس و تدبر`
                    : `Verse Note & Reflection`
                  : isUrdu
                  ? `لفظ کا نوٹ`
                  : `Word Note`}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-emerald-500 border border-[var(--border-subtle)]">
                  {targetType === "verse" ? verseKey : `${wordLocation}`}
                </span>
              </h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                {targetType === "verse"
                  ? chapterName
                    ? `${chapterName} (${verseKey})`
                    : `Ayah ${verseKey}`
                  : `${wordText ? `"${wordText}" • ` : ""}${chapterName ? `${chapterName} ` : ""}${verseKey}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              {isUrdu ? "آپ کی ذاتی رائے، تدبر یا معنی" : "Your Personal Reflection or Notes"}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                targetType === "verse"
                  ? isUrdu
                    ? "اس آیت مبارکہ سے حاصل ہونے والا سبق، دعا یا تدبر یہاں تحریر کریں..."
                    : "Write your reflections, lessons, dua, or tadabbur for this verse..."
                  : isUrdu
                  ? "اس لفظ کے معنی، نحوی یا لغوی تشریح یہاں لکھیں..."
                  : "Write your notes, root meaning, or reflections for this word..."
              }
              rows={5}
              className="w-full px-3.5 py-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed resize-none"
              autoFocus
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
              <span>{isUrdu ? "محفوظ کرنے کے لیے Ctrl + Enter دبائیں" : "Press Ctrl + Enter to save"}</span>
              <span>{text.length} {isUrdu ? "حروف" : "chars"}</span>
            </div>
          </div>

          {/* Color Highlight Choice */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--foreground-muted)] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-500" />
              {isUrdu ? "نوٹ کا رنگ و پہچان" : "Note Color"}
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? `${c.bgClass} ${c.borderClass} ring-2 ring-emerald-500/50 text-[var(--foreground)] font-semibold`
                        : "bg-[var(--surface-hover)]/40 border-[var(--border-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dotClass}`} />
                    <span>{isUrdu ? c.labelUr : c.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--foreground-muted)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              {isUrdu ? "ٹیگز (موضوعات)" : "Tags"}
            </label>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {presetTags.map((pTag) => {
                const isAdded = tags.includes(pTag);
                return (
                  <button
                    key={pTag}
                    type="button"
                    onClick={() => (isAdded ? handleRemoveTag(pTag) : handleAddTag(pTag))}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                      isAdded
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                        : "bg-[var(--surface-hover)] text-[var(--foreground-muted)] border-[var(--border-subtle)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isAdded ? "✓ " : "+ "}
                    {pTag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input & Current Tags */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder={isUrdu ? "نیا ٹیگ شامل کریں..." : "Add custom tag..."}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--foreground)] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
              >
                {isUrdu ? "شامل کریں" : "Add"}
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--surface-hover)]/20 flex items-center justify-between">
          <div>
            {existingId && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isUrdu ? "نوٹ حذف کریں" : "Delete Note"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-xl transition-colors"
            >
              {isUrdu ? "منسوخ" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              {isUrdu ? "محفوظ کریں" : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

