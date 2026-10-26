"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { AudioProvider } from "@/context/AudioContext";
import { ReadingPreferencesProvider } from "@/context/ReadingPreferencesContext";
import { KhatmahProvider } from "@/context/KhatmahContext";
import { ReadingActivityProvider } from "@/context/ReadingActivityContext";
import { DesktopWorkspaceProvider } from "@/context/DesktopWorkspaceContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Consolidated top-level application context providers.
 * Encapsulates theme, language, audio, reading preferences, bookmarks,
 * activity tracking, and desktop workspace layout state.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BookmarksProvider>
          <AudioProvider>
            <ReadingPreferencesProvider>
              <KhatmahProvider>
                <ReadingActivityProvider>
                  <DesktopWorkspaceProvider>
                    {children}
                  </DesktopWorkspaceProvider>
                </ReadingActivityProvider>
              </KhatmahProvider>
            </ReadingPreferencesProvider>
          </AudioProvider>
        </BookmarksProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
