"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { DesktopTitleBar } from "./DesktopTitleBar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightInspector } from "./DesktopRightInspector";
import { DesktopStatusBar } from "./DesktopStatusBar";
import { DraggableSettingsPanel } from "@/components/modals/DraggableSettingsPanel";
import { SearchModal } from "@/components/modals/SearchModal";
import { DownloadManagerModal } from "@/components/modals/DownloadManagerModal";

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const pathname = usePathname();
  const isReadingPage = pathname === "/" || pathname.startsWith("/surah");

  const {
    isSearchOpen,
    setIsSearchOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isDownloadManagerOpen,
    setIsDownloadManagerOpen,
  } = useDesktopWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--background)] text-[var(--foreground)] select-none">
      {/* 1. Desktop Window Titlebar (40px) */}
      <DesktopTitleBar />

      {/* 2. Main Desktop Multi-Pane Stage */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Left Navigation Rail & Explorer (Collapsible) */}
        <DesktopSidebar />

        {/* Center Primary Reading Canvas */}
        <main className="flex-1 h-full overflow-y-auto relative flex flex-col select-text">
          {children}
        </main>

        {/* Right Linguistic & Tafseer Inspector (Collapsible) - Only on Quran reading pages */}
        {isReadingPage && <DesktopRightInspector />}
      </div>

      {/* 3. Bottom Desktop Status Bar (28px) */}
      <DesktopStatusBar />

      {/* Global Command Search Palette (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Floating Live Settings Panel */}
      <DraggableSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Offline Storage & Pre-download Manager Modal */}
      <DownloadManagerModal
        isOpen={isDownloadManagerOpen}
        onClose={() => setIsDownloadManagerOpen(false)}
      />
    </div>
  );
}
