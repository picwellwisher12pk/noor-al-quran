"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleDriveUser,
  CloudBackupPayload,
  getGoogleClientId,
  loadGsiScript,
  fetchGoogleProfile,
  downloadCloudBackup,
  uploadCloudBackup,
  reconcileProgress,
  STORAGE_KEY_TOKEN,
  STORAGE_KEY_TOKEN_EXPIRY,
  STORAGE_KEY_USER,
  STORAGE_KEY_LAST_SYNCED,
  STORAGE_KEY_CLIENT_ID,
} from "@/services/googleDriveSync";
import { useLearningStore } from "@/store/useLearningStore";

interface GoogleAuthContextType {
  user: GoogleDriveUser | null;
  isSignedIn: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  clientId: string;
  setCustomClientId: (id: string) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  syncNow: () => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleDriveUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const isSyncInProgressRef = useRef(false);

  // Initialize saved session & clientId on mount
  useEffect(() => {
    try {
      const activeClientId = getGoogleClientId();
      setClientId(activeClientId);

      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const tokenExpiry = localStorage.getItem(STORAGE_KEY_TOKEN_EXPIRY);
      const savedLastSynced = localStorage.getItem(STORAGE_KEY_LAST_SYNCED);

      if (savedLastSynced) {
        setLastSyncedAt(savedLastSynced);
      }

      if (savedToken && tokenExpiry && Date.now() < Number(tokenExpiry)) {
        setAccessToken(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } else {
        // Token expired; clear stale credentials
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
      }
    } catch (e) {
      console.warn("Failed to restore Google Drive session:", e);
    }
  }, []);

  const setCustomClientId = useCallback((newId: string) => {
    const trimmed = newId.trim();
    setClientId(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_CLIENT_ID, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
      }
    } catch {}
  }, []);

  // Assemble full local state snapshot for synchronization
  const collectLocalSnapshot = useCallback((): CloudBackupPayload => {
    const learnState = useLearningStore.getState();
    let bookmarks = [];
    let lastRead = null;
    let readingActivity: any = {};

    try {
      const rawBm = localStorage.getItem("naq_bookmarks");
      if (rawBm) bookmarks = JSON.parse(rawBm);
      const rawLr = localStorage.getItem("naq_last_read");
      if (rawLr) lastRead = JSON.parse(rawLr);
      const rawAct = localStorage.getItem("naq_reading_activity_v1");
      if (rawAct) readingActivity = JSON.parse(rawAct);
    } catch {}

    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      learningStore: {
        totalXP: learnState.totalXP || 0,
        barakahGems: learnState.barakahGems || 0,
        currentStreak: learnState.currentStreak || 0,
        lastActiveDate: learnState.lastActiveDate || "",
        completedNodeIds: learnState.completedNodeIds || [],
        unlockedNodeIds: learnState.unlockedNodeIds || ["s1_u1_n1"],
        nodeStars: learnState.nodeStars || {},
        activeNodeId: learnState.activeNodeId || "s1_u1_n1",
        srsWords: learnState.srsWords || {},
        masteredWordIds: learnState.masteredWordIds || [],
        reviewWordIds: learnState.reviewWordIds || [],
        gameStats: learnState.gameStats || {},
        langPreference: learnState.langPreference || "bilingual",
      },
      readingActivity: {
        currentStreak: readingActivity.currentStreak || 0,
        totalVersesRead: readingActivity.totalVersesRead || 0,
        sessions: readingActivity.sessions || [],
      },
      bookmarks,
      lastRead,
    };
  }, []);

  // Execute bi-directional synchronization with Google Drive
  const executeSync = useCallback(
    async (token: string) => {
      if (isSyncInProgressRef.current) return;
      isSyncInProgressRef.current = true;
      setIsSyncing(true);
      setSyncError(null);

      try {
        const localSnapshot = collectLocalSnapshot();
        const cloudSnapshot = await downloadCloudBackup(token);
        const reconciled = reconcileProgress(localSnapshot, cloudSnapshot);

        // Apply reconciled learning state to local store
        if (reconciled.learningStore) {
          useLearningStore.setState({
            totalXP: reconciled.learningStore.totalXP,
            barakahGems: reconciled.learningStore.barakahGems,
            currentStreak: reconciled.learningStore.currentStreak,
            lastActiveDate: reconciled.learningStore.lastActiveDate,
            completedNodeIds: reconciled.learningStore.completedNodeIds,
            unlockedNodeIds: reconciled.learningStore.unlockedNodeIds,
            nodeStars: (reconciled.learningStore.nodeStars || {}) as Record<string, 1 | 2 | 3>,
            activeNodeId: reconciled.learningStore.activeNodeId,
            srsWords: reconciled.learningStore.srsWords,
            masteredWordIds: reconciled.learningStore.masteredWordIds,
            reviewWordIds: reconciled.learningStore.reviewWordIds,
            gameStats: reconciled.learningStore.gameStats,
          });
        }

        // Apply reconciled bookmarks & reading activity
        try {
          if (reconciled.bookmarks) {
            localStorage.setItem("naq_bookmarks", JSON.stringify(reconciled.bookmarks));
          }
          if (reconciled.readingActivity) {
            localStorage.setItem(
              "naq_reading_activity_v1",
              JSON.stringify(reconciled.readingActivity)
            );
          }
        } catch {}

        // Upload unified snapshot back to Google Drive appDataFolder
        await uploadCloudBackup(token, reconciled);

        const nowIso = new Date().toISOString();
        setLastSyncedAt(nowIso);
        try {
          localStorage.setItem(STORAGE_KEY_LAST_SYNCED, nowIso);
        } catch {}
      } catch (err: any) {
        console.error("Google Drive sync failed:", err);
        if (err.message === "AUTH_EXPIRED") {
          // Token expired, clear auth session so user can reconnect
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
          setSyncError("Session expired. Please reconnect Google Drive.");
        } else {
          setSyncError(err.message || "Failed to sync with Google Drive");
        }
      } finally {
        setIsSyncing(false);
        isSyncInProgressRef.current = false;
      }
    },
    [collectLocalSnapshot]
  );

  const syncNow = useCallback(async () => {
    if (!accessToken) {
      setSyncError("Sign in to Google Drive first");
      return;
    }
    await executeSync(accessToken);
  }, [accessToken, executeSync]);

  const signInWithGoogle = useCallback(async () => {
    const activeClientId = clientId || getGoogleClientId();
    if (!activeClientId) {
      throw new Error(
        "NO_CLIENT_ID: Please provide a Google Client ID in settings to enable Google Drive sync."
      );
    }

    await loadGsiScript();
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      throw new Error("Google Identity Services failed to initialize.");
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: "https://www.googleapis.com/auth/drive.appdata profile email",
          callback: async (resp: any) => {
            if (resp.error) {
              setSyncError(resp.error_description || resp.error);
              reject(new Error(resp.error));
              return;
            }

            const token = resp.access_token;
            const expiresIn = (Number(resp.expires_in) || 3600) * 1000;
            const expiryTimestamp = Date.now() + expiresIn;

            setAccessToken(token);
            try {
              localStorage.setItem(STORAGE_KEY_TOKEN, token);
              localStorage.setItem(STORAGE_KEY_TOKEN_EXPIRY, String(expiryTimestamp));
            } catch {}

            try {
              const profile = await fetchGoogleProfile(token);
              setUser(profile);
              try {
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
              } catch {}

              // Run initial sync
              await executeSync(token);
              resolve();
            } catch (err: any) {
              console.error("Failed post-auth profile fetch / sync:", err);
              reject(err);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch (e) {
        reject(e);
      }
    });
  }, [clientId, executeSync]);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setSyncError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
  }, []);

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        isSignedIn: !!user && !!accessToken,
        isSyncing,
        lastSyncedAt,
        syncError,
        clientId,
        setCustomClientId,
        signInWithGoogle,
        signOut,
        syncNow,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext);
  if (!ctx) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return ctx;
}
