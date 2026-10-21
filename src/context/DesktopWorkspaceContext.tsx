"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Chapter, Juz, Word } from "@/types/quran";
import { fetchChapters, fetchJuzs } from "@/services/quranApi";

export type SidebarTab = "surahs" | "juz" | "khatmah" | "bookmarks";
export type InspectorTab = "morphology" | "translations" | "tafseer" | "scholars";
export type ReadingLayoutMode = "continuous" | "compact" | "mushaf";

interface DesktopWorkspaceContextType {
  // Sidebar state
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;

  // Inspector state
  isRightInspectorOpen: boolean;
  toggleRightInspector: () => void;
  setRightInspectorOpen: (open: boolean) => void;
  activeInspectorTab: InspectorTab;
  setActiveInspectorTab: (tab: InspectorTab) => void;

  // Reading layout mode
  readingMode: ReadingLayoutMode;
  setReadingMode: (mode: ReadingLayoutMode) => void;

  // Active word & ayah selection for inspector
  selectedWord: Word | null;
  selectedAyahKey: string | null;
  selectedAyahArabic: string;
  openWordInInspector: (word: Word) => void;
  openTafsirInInspector: (verseKey: string, arabicText: string) => void;
  openAyahInInspector: (verseKey: string, arabicText: string) => void;
  closeInspector: () => void;

  // Global Quran metadata
  chapters: Chapter[];
  juzs: Juz[];
  loadingMeta: boolean;
  activeChapterId: number;
  setActiveChapterId: (id: number) => void;
  activeAyahNumber: number;
  setActiveAyahNumber: (num: number) => void;

  // Modals & Panels
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const DesktopWorkspaceContext = createContext<DesktopWorkspaceContextType | undefined>(undefined);

export function DesktopWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isRightInspectorOpen, setRightInspectorOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("surahs");
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>("morphology");
  const [readingMode, setReadingMode] = useState<ReadingLayoutMode>("continuous");

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedAyahKey, setSelectedAyahKey] = useState<string | null>("1:1");
  const [selectedAyahArabic, setSelectedAyahArabic] = useState<string>("");

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(1);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load global chapters and juzs on launch
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchChapters(), fetchJuzs()])
      .then(([chaps, jzs]) => {
        if (!isMounted) return;
        setChapters(chaps);
        setJuzs(jzs);
      })
      .catch((err) => console.error("Error loading metadata:", err))
      .finally(() => {
        if (isMounted) setLoadingMeta(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Global desktop keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Cmd + K: Quick Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Ctrl + B or Cmd + B: Toggle Left Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setLeftSidebarOpen((prev) => !prev);
      }
      // Ctrl + \ or Cmd + \: Toggle Right Inspector
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setRightInspectorOpen((prev) => !prev);
      }
      // Escape closes inspector or search
      if (e.key === "Escape") {
        if (isSearchOpen) setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const toggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev);
  const toggleRightInspector = () => setRightInspectorOpen((prev) => !prev);

  const openWordInInspector = (word: Word) => {
    setSelectedWord(word);
    setSelectedAyahKey(word.verse_key);
    setSelectedAyahArabic(word.text_uthmani || word.text);
    setActiveInspectorTab("morphology");
    setRightInspectorOpen(true);
  };

  const openTafsirInInspector = (verseKey: string, arabicText: string) => {
    setSelectedAyahKey(verseKey);
    setSelectedAyahArabic(arabicText);
    setActiveInspectorTab("tafseer");
    setRightInspectorOpen(true);
  };

  const openAyahInInspector = (verseKey: string, arabicText: string) => {
    setSelectedAyahKey(verseKey);
    setSelectedAyahArabic(arabicText);
    setActiveInspectorTab("scholars");
    setRightInspectorOpen(true);
  };

  const closeInspector = () => {
    setRightInspectorOpen(false);
  };

  return (
    <DesktopWorkspaceContext.Provider
      value={{
        isLeftSidebarOpen,
        toggleLeftSidebar,
        setLeftSidebarOpen,
        activeSidebarTab,
        setActiveSidebarTab,

        isRightInspectorOpen,
        toggleRightInspector,
        setRightInspectorOpen,
        activeInspectorTab,
        setActiveInspectorTab,

        readingMode,
        setReadingMode,

        selectedWord,
        selectedAyahKey,
        selectedAyahArabic,
        openWordInInspector,
        openTafsirInInspector,
        openAyahInInspector,
        closeInspector,

        chapters,
        juzs,
        loadingMeta,
        activeChapterId,
        setActiveChapterId,
        activeAyahNumber,
        setActiveAyahNumber,

        isSearchOpen,
        setIsSearchOpen,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </DesktopWorkspaceContext.Provider>
  );
}

export function useDesktopWorkspace() {
  const context = useContext(DesktopWorkspaceContext);
  if (!context) {
    throw new Error("useDesktopWorkspace must be used within DesktopWorkspaceProvider");
  }
  return context;
}
