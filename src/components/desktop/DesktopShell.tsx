"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { DesktopTitleBar } from "./DesktopTitleBar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightInspector } from "./DesktopRightInspector";
import { DesktopStatusBar } from "./DesktopStatusBar";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { MobileSurahDrawer } from "@/components/mobile/MobileSurahDrawer";
import { MobileInspectorSheet } from "@/components/mobile/MobileInspectorSheet";
import { MobileAudioBar } from "@/components/mobile/MobileAudioBar";
import { AppMenuDrawer } from "./AppMenuDrawer";
import { DraggableSettingsPanel } from "@/components/modals/DraggableSettingsPanel";
import { SearchModal } from "@/components/modals/SearchModal";
import { DownloadManagerModal } from "@/components/modals/DownloadManagerModal";

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const pathname = usePathname();
  const isReadingPage = pathname === "/" || pathname.startsWith("/surah");
  const isMobile = useIsMobile();

  const {
    isSearchOpen,
    setIsSearchOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isDownloadManagerOpen,
    setIsDownloadManagerOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useDesktopWorkspace();

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--background)] text-[var(--foreground)] select-none">
      {/* Dynamic Layout Branching: Strictly isolate Desktop and Mobile navigation */}
      {isMobile ? (
        /* ================= MOBILE PHONE VIEWPORT (< 768px) ================= */
        <>
          {/* 1. Mobile Top App Header */}
          <MobileHeader />

          {/* 2. Main Mobile Canvas */}
          <main className="flex-1 h-full overflow-y-auto relative flex flex-col select-text pb-20">
            {children}
          </main>

          {/* 3. Mobile Docked Audio Player */}
          <MobileAudioBar />

          {/* 4. Mobile Bottom Tab Bar */}
          <MobileBottomNav />

          {/* 5. Mobile Drawers & Sheets */}
          <MobileSurahDrawer />
          <MobileInspectorSheet />
        </>
      ) : (
        /* ================= DESKTOP / TABLET VIEWPORT (>= 768px) ================= */
        <>
          {/* 1. Desktop Window Titlebar (40px) */}
          <DesktopTitleBar />

          {/* 2. Desktop Workspace / Canvas */}
          <div className="flex-1 w-full flex overflow-hidden relative">
            {/* Desktop Left Rail & Explorer (Collapsible) */}
            <DesktopSidebar />

            {/* Center Primary Reading & App Canvas */}
            <main className="flex-1 h-full overflow-y-auto relative flex flex-col select-text">
              {children}
            </main>

            {/* Desktop Right Linguistic & Tafseer Inspector (Collapsible) */}
            {isReadingPage && <DesktopRightInspector />}
          </div>

          {/* 3. Desktop Bottom Status Bar (28px) */}
          <DesktopStatusBar />
        </>
      )}

      {/* ================= SHARED GLOBAL MODALS & DRAWERS ================= */}
      {/* App Menu Drawer (Profile, Google Drive Sync, Age Tier, Keyboard Shortcuts) */}
      <AppMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Global Command Palette / Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Settings Panel */}
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
