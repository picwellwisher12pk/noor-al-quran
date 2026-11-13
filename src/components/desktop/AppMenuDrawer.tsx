"use client";

import React from "react";
import { SettingsModal } from "@/components/modals/SettingsModal";

interface AppMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AppMenuDrawer
 * Re-exports the unified Master Settings & Navigation Modal to ensure
 * consistency across all entry points.
 */
export function AppMenuDrawer({ isOpen, onClose }: AppMenuDrawerProps) {
  return <SettingsModal isOpen={isOpen} onClose={onClose} initialTab="navigation" />;
}
