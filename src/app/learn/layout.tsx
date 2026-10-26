"use client";

import React from "react";
import { LearningNavBar } from "@/components/learn/LearningNavBar";
import { ModeSelectorModal } from "@/components/learn/ModeSelectorModal";
import { ReviewVaultModal } from "@/components/learn/ReviewVaultModal";
import { SessionRunner } from "@/components/learn/SessionRunner";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors">
      {/* Shared Learn Navigation Bar */}
      <LearningNavBar />

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Modals & Session Overlays Available Globally Across All Sub-Routes */}
      <ModeSelectorModal />
      <ReviewVaultModal />
      <SessionRunner />
    </div>
  );
}
