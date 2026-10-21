"use client";

import React from "react";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { DesktopTitleBar } from "./DesktopTitleBar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightInspector } from "./DesktopRightInspector";
import { DesktopStatusBar } from "./DesktopStatusBar";
import { DraggableSettingsPanel } from "@/components/modals/DraggableSettingsPanel";
import { SearchModal } from "@/components/modals/SearchModal";

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const { isSearchOpen, setIsSearchOpen, isSettingsOpen, setIsSettingsOpen } =
    useDesktopWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--background,#0b100d)] text-[var(--foreground,#f1f5f9)] select-none">
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

        {/* Right Linguistic & Tafseer Inspector (Collapsible) */}
        <DesktopRightInspector />
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
    </div>
  );
}
