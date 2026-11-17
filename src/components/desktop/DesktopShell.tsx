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
import { SettingsModal } from "@/components/modals/SettingsModal";
import { DraggableSettingsPanel } from "@/components/modals/DraggableSettingsPanel";
import { SearchModal } from "@/components/modals/SearchModal";
import { DownloadManagerModal } from "@/components/modals/DownloadManagerModal";
import { VerseIdentifierModal } from "@/components/modals/VerseIdentifierModal";
import { UpdateNotificationBanner } from "@/components/common/UpdateNotificationBanner";

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const pathname = usePathname();
  const isSurahReadingPage = pathname.startsWith("/surah");
  const isReadingPage = pathname === "/" || isSurahReadingPage;
  const isMobile = useIsMobile();

  const {
    isSearchOpen,
    setIsSearchOpen,
    isVerseIdentifierOpen,
    setIsVerseIdentifierOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isLiveSettingsOpen,
    setIsLiveSettingsOpen,
    isDownloadManagerOpen,
    setIsDownloadManagerOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useDesktopWorkspace();

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col bg-[var(--background)] text-[var(--foreground)] select-none">
      {/* Background Update Notification Banner */}
      <UpdateNotificationBanner />

      {/* Dynamic Layout Branching: Strictly isolate Desktop and Mobile navigation */}
      {isMobile ? (
        /* ================= MOBILE PHONE VIEWPORT (< 768px) ================= */
        <>
          {/* 1. Mobile Top App Header (Only on Non-Surah Pages; SurahReader provides its own unified header) */}
          {!isSurahReadingPage && <MobileHeader />}

          {/* 2. Main Mobile Canvas: single container scrolling without nested conflicts */}
          <main
            className={`flex-1 w-full h-full relative flex flex-col select-text ${
              isSurahReadingPage ? "overflow-hidden" : "overflow-y-auto pb-24"
            }`}
          >
            {children}
          </main>

          {/* 3. Mobile Docked Audio Player */}
          <MobileAudioBar />

          {/* 4. Mobile Bottom Tab Bar (Only on Non-Surah Pages for maximum reading immersion) */}
          {!isSurahReadingPage && <MobileBottomNav />}

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
      {/* Global Command Palette / Search Modal (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Recite to Identify / Verse Finder Modal */}
      <VerseIdentifierModal
        isOpen={isVerseIdentifierOpen}
        onClose={() => setIsVerseIdentifierOpen(false)}
      />

      {/* Unified Master Settings & App Menu Modal */}
      <SettingsModal
        isOpen={isSettingsOpen || isMobileMenuOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setIsMobileMenuOpen(false);
        }}
        onOpenLiveSettings={() => {
          setIsSettingsOpen(false);
          setIsMobileMenuOpen(false);
          setIsLiveSettingsOpen(true);
        }}
      />

      {/* Floating Draggable Live Settings Panel */}
      <DraggableSettingsPanel
        isOpen={isLiveSettingsOpen}
        onClose={() => setIsLiveSettingsOpen(false)}
        onOpenFullSettings={() => {
          setIsLiveSettingsOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Offline Storage & Pre-download Manager Modal */}
      <DownloadManagerModal
        isOpen={isDownloadManagerOpen}
        onClose={() => setIsDownloadManagerOpen(false)}
      />
    </div>
  );
}
