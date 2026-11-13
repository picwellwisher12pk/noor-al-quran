"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { NotesProvider } from "@/context/NotesContext";
import { AudioProvider } from "@/context/AudioContext";
import { ReadingPreferencesProvider } from "@/context/ReadingPreferencesContext";
import { KhatmahProvider } from "@/context/KhatmahContext";
import { ReadingActivityProvider } from "@/context/ReadingActivityContext";
import { DesktopWorkspaceProvider } from "@/context/DesktopWorkspaceContext";
import { GoogleAuthProvider } from "@/context/GoogleAuthContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Consolidated top-level application context providers.
 * Encapsulates theme, language, audio, reading preferences, bookmarks,
 * activity tracking, desktop workspace layout, and Google Drive cloud sync state.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BookmarksProvider>
          <NotesProvider>
            <AudioProvider>
              <ReadingPreferencesProvider>
                <KhatmahProvider>
                  <ReadingActivityProvider>
                    <DesktopWorkspaceProvider>
                      <GoogleAuthProvider>
                        {children}
                      </GoogleAuthProvider>
                    </DesktopWorkspaceProvider>
                  </ReadingActivityProvider>
                </KhatmahProvider>
              </ReadingPreferencesProvider>
            </AudioProvider>
          </NotesProvider>
        </BookmarksProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
