"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { useBookmarks } from "@/context/BookmarksContext";
import { Bookmark as BookmarkIcon, Trash2, ArrowRight, History } from "lucide-react";
import Link from "next/link";

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarksModal({ isOpen, onClose }: BookmarksModalProps) {
  const { bookmarks, lastRead, removeBookmark, clearAllBookmarks } = useBookmarks();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5 text-emerald-500" />
          <span>Saved Bookmarks & Reading History</span>
        </div>
      }
    >
      {/* Last Read Section */}
      {lastRead && (
        <div className="mb-6 rounded-xl bg-emerald-950/30 border border-emerald-800/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <History className="h-4 w-4" />
              <span>Continue Where You Left Off</span>
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {new Date(lastRead.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">
            Surah {lastRead.chapterName} (Ayah {lastRead.verseNumber})
          </p>
          <Link
            href={`/surah/${lastRead.chapterId}?ayah=${lastRead.verseNumber}`}
            onClick={onClose}
            className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Resume Reading <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Bookmarked Verses ({bookmarks.length})
        </h4>
        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(!confirmClear)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {confirmClear ? "Click again to confirm" : "Clear All"}
          </button>
        )}
      </div>

      {confirmClear && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center justify-between text-xs">
          <span className="text-red-200">Are you sure you want to remove all saved bookmarks?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                clearAllBookmarks();
                setConfirmClear(false);
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
          No bookmarks saved yet. Click the bookmark icon next to any verse while reading to save it here.
        </div>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {bookmarks.map((b) => (
            <div
              key={b.verse_key}
              className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  {b.chapter_name} • Ayah {b.verse_number}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/surah/${b.chapter_id}?ayah=${b.verse_number}`}
                    onClick={onClose}
                    className="p-1 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    Go to Ayah <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeBookmark(b.verse_key)}
                    aria-label={`Remove bookmark for ayah ${b.verse_key}`}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="font-arabic text-lg text-right text-[var(--foreground)] leading-relaxed" dir="rtl">
                {b.text_uthmani}
              </p>

              {b.translation_text && (
                <p
                  className="text-xs text-[var(--muted-foreground)] line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: b.translation_text }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
