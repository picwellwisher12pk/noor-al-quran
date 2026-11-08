"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useDesktopWorkspace } from "@/context/DesktopWorkspaceContext";
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
      {/* 1. TOP BARS */}
      {/* Desktop Window Titlebar (40px) - Desktop only (>= 1024px) */}
      <div className="hidden lg:block w-full flex-none">
        <DesktopTitleBar />
      </div>

      {/* Mobile Top Header (52px + safe-area-inset-top) - Mobile only (< 1024px) */}
      <MobileHeader />

      {/* 2. MAIN WORKSPACE / CANVAS */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Desktop Left Navigation Rail & Explorer (Collapsible) - Desktop only */}
        <div className="hidden lg:flex h-full flex-none">
          <DesktopSidebar />
        </div>

        {/* Center Primary Reading & App Canvas */}
        <main className="flex-1 h-full overflow-y-auto relative flex flex-col select-text pb-14 lg:pb-0">
          {children}
        </main>

        {/* Desktop Right Linguistic & Tafseer Inspector (Collapsible) - Desktop only on reading pages */}
        {isReadingPage && (
          <div className="hidden lg:flex h-full flex-none">
            <DesktopRightInspector />
          </div>
        )}
      </div>

      {/* 3. MOBILE AUDIO PLAYER (Docked right above bottom nav) */}
      <MobileAudioBar />

      {/* 4. BOTTOM BARS */}
      {/* Mobile Bottom Navigation (56px + safe-area-inset-bottom) - Mobile only (< 1024px) */}
      <MobileBottomNav />

      {/* Desktop Bottom Status Bar (28px) - Desktop only (>= 1024px) */}
      <div className="hidden lg:block w-full flex-none">
        <DesktopStatusBar />
      </div>

      {/* 5. MOBILE DRAWERS & SHEETS */}
      {/* Mobile Surahs, Juz & Bookmarks Drawer */}
      <MobileSurahDrawer />

      {/* Mobile Linguistic & Tafseer Bottom Sheet */}
      <MobileInspectorSheet />

      {/* Full App Menu Drawer (For Profile, Google Drive Sync, Age Tier) */}
      <AppMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 6. GLOBAL DIALOGS & MODALS */}
      {/* Global Command Search Palette (Ctrl+K) */}
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
