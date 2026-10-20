"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Bookmark } from "@/types/quran";

interface LastRead {
  chapterId: number;
  chapterName: string;
  verseNumber: number;
  verseKey: string;
  updatedAt: string;
}

interface BookmarksContextType {
  bookmarks: Bookmark[];
  lastRead: LastRead | null;
  addBookmark: (bookmark: Omit<Bookmark, "created_at">) => void;
  removeBookmark: (verseKey: string) => void;
  isBookmarked: (verseKey: string) => boolean;
  setLastReadPosition: (pos: Omit<LastRead, "updatedAt">) => void;
  clearAllBookmarks: () => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem("naq_bookmarks");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const savedLastRead = localStorage.getItem("naq_last_read");
      if (savedLastRead) {
        setLastRead(JSON.parse(savedLastRead));
      }
    } catch (e) {
      console.error("Failed to load bookmarks from storage:", e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("naq_bookmarks", JSON.stringify(bookmarks));
    } catch (e) {
      console.error("Failed to persist bookmarks:", e);
    }
  }, [bookmarks, mounted]);

  useEffect(() => {
    if (!mounted || !lastRead) return;
    try {
      localStorage.setItem("naq_last_read", JSON.stringify(lastRead));
    } catch (e) {
      console.error("Failed to persist last read:", e);
    }
  }, [lastRead, mounted]);

  const addBookmark = (bookmark: Omit<Bookmark, "created_at">) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.verse_key === bookmark.verse_key)) return prev;
      return [
        {
          ...bookmark,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const removeBookmark = (verseKey: string) => {
    setBookmarks((prev) => prev.filter((b) => b.verse_key !== verseKey));
  };

  const isBookmarked = (verseKey: string) => {
    return bookmarks.some((b) => b.verse_key === verseKey);
  };

  const setLastReadPosition = (pos: Omit<LastRead, "updatedAt">) => {
    setLastRead({
      ...pos,
      updatedAt: new Date().toISOString(),
    });
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        lastRead,
        addBookmark,
        removeBookmark,
        isBookmarked,
        setLastReadPosition,
        clearAllBookmarks,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
