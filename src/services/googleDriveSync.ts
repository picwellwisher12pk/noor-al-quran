"use client";

import { QuranNote } from "@/types/quran";

/**
 * Google Drive AppData Sync Service
 * 
 * Secure, zero-backend, client-side cloud backup using Google Drive's
 * dedicated 'appDataFolder'.
 * 
 * - Privacy: Stores data only in the user's hidden AppData folder. The app cannot
 *   view or access any of the user's personal Google Drive files.
 * - Reliability: Local-first architecture. All app reads/writes remain instant (local).
 *   Synchronization runs asynchronously in the background.
 */

export interface GoogleDriveUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CloudBackupPayload {
  version: number;
  updatedAt: string;
  learningStore?: {
    totalXP: number;
    barakahGems: number;
    currentStreak: number;
    lastActiveDate: string;
    completedNodeIds: string[];
    unlockedNodeIds: string[];
    nodeStars: Record<string, number>;
    activeNodeId: string;
    srsWords?: Record<string, any>;
    masteredWordIds?: string[];
    reviewWordIds?: string[];
    gameStats?: any;
    langPreference?: string;
    learnerProfile?: any;
  };
  readingActivity?: {
    currentStreak?: number;
    totalVersesRead?: number;
    sessions?: any[];
  };
  bookmarks?: any[];
  lastRead?: any;
  notes?: QuranNote[];
}

const BACKUP_FILENAME = "noor_al_quran_backup.json";
const GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const DRIVE_API_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_API_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export const STORAGE_KEY_TOKEN = "naq_gdrive_access_token";
export const STORAGE_KEY_TOKEN_EXPIRY = "naq_gdrive_token_expiry";
export const STORAGE_KEY_USER = "naq_gdrive_user_profile";
export const STORAGE_KEY_LAST_SYNCED = "naq_gdrive_last_synced";
export const STORAGE_KEY_CLIENT_ID = "naq_gdrive_client_id";

/**
 * Returns the effective Google Client ID (from environment or user-customized setting).
 */
export function getGoogleClientId(): string {
  if (typeof window !== "undefined") {
    const customId = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    if (customId && customId.trim()) return customId.trim();
  }
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

/**
 * Dynamically loads the Google Identity Services SDK script if not already present.
 */
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.accounts?.oauth2) return resolve();

    const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services SDK"));
    document.head.appendChild(script);
  });
}

/**
 * Fetches the user profile info from Google's userinfo endpoint using the access token.
 */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleDriveUser> {
  const res = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google profile (status ${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.sub || data.id,
    name: data.name || "Quran Learner",
    email: data.email || "",
    avatarUrl: data.picture,
  };
}

/**
 * Finds the backup file in the Google Drive appDataFolder.
 */
export async function findDriveBackupFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const url = `${DRIVE_API_FILES}?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("AUTH_EXPIRED");
    }
    throw new Error(`Drive file search failed (${res.status})`);
  }

  const data = await res.json();
  const file = data.files && data.files[0];
  return file ? file.id : null;
}

/**
 * Downloads the current cloud backup JSON from Google Drive appDataFolder.
 */
export async function downloadCloudBackup(accessToken: string): Promise<CloudBackupPayload | null> {
  const fileId = await findDriveBackupFileId(accessToken);
  if (!fileId) return null;

  const url = `${DRIVE_API_FILES}/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup file (${res.status})`);
  }

  return (await res.json()) as CloudBackupPayload;
}

/**
 * Uploads (creates or updates) the cloud backup JSON in Google Drive appDataFolder.
 */
export async function uploadCloudBackup(
  accessToken: string,
  payload: CloudBackupPayload
): Promise<string> {
  const existingFileId = await findDriveBackupFileId(accessToken);
  const boundary = "-------NoorAlQuranMultipartBoundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = existingFileId
    ? { name: BACKUP_FILENAME, mimeType: "application/json" }
    : { name: BACKUP_FILENAME, mimeType: "application/json", parents: ["appDataFolder"] };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(payload) +
    closeDelimiter;

  const url = existingFileId
    ? `${DRIVE_API_UPLOAD}/${existingFileId}?uploadType=multipart`
    : `${DRIVE_API_UPLOAD}?uploadType=multipart`;

  const res = await fetch(url, {
    method: existingFileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload backup to Google Drive (${res.status})`);
  }

  const result = await res.json();
  return result.id;
}

/**
 * Reconciles local progress with cloud progress to ensure no user progress is lost.
 * 
 * Rules:
 * - XP & Gems: Math.max(local, cloud)
 * - Streaks: Math.max(local, cloud)
 * - Completed & Unlocked Nodes: Mathematical union
 * - Stars: Math.max per node
 * - SRS Words: Latest reviewed timestamp wins
 */
export function reconcileProgress(
  localState: CloudBackupPayload,
  cloudState: CloudBackupPayload | null
): CloudBackupPayload {
  if (!cloudState) return localState;

  const localLearn = localState.learningStore || ({} as any);
  const cloudLearn = cloudState.learningStore || ({} as any);

  // Union of completed and unlocked nodes
  const completedSet = new Set<string>([
    ...(Array.isArray(localLearn.completedNodeIds) ? localLearn.completedNodeIds : []),
    ...(Array.isArray(cloudLearn.completedNodeIds) ? cloudLearn.completedNodeIds : []),
  ]);
  const unlockedSet = new Set<string>([
    ...(Array.isArray(localLearn.unlockedNodeIds) ? localLearn.unlockedNodeIds : []),
    ...(Array.isArray(cloudLearn.unlockedNodeIds) ? cloudLearn.unlockedNodeIds : []),
    "s1_u1_n1",
  ]);

  // Merge node stars (highest star level per node)
  const mergedStars: Record<string, number> = { ...(cloudLearn.nodeStars || {}) };
  for (const [nodeId, stars] of Object.entries(localLearn.nodeStars || {})) {
    mergedStars[nodeId] = Math.max(stars as number, mergedStars[nodeId] || 0);
  }

  // Merge SRS missed words
  const mergedSrs: Record<string, any> = { ...(cloudLearn.srsWords || {}) };
  for (const [wordId, localWord] of Object.entries(localLearn.srsWords || {})) {
    const cloudWord = mergedSrs[wordId];
    if (!cloudWord) {
      mergedSrs[wordId] = localWord;
    } else {
      const localTime = new Date((localWord as any).lastReviewedAt || 0).getTime();
      const cloudTime = new Date((cloudWord as any).lastReviewedAt || 0).getTime();
      mergedSrs[wordId] = localTime >= cloudTime ? localWord : cloudWord;
    }
  }

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    learningStore: {
      totalXP: Math.max(localLearn.totalXP || 0, cloudLearn.totalXP || 0),
      barakahGems: Math.max(localLearn.barakahGems || 0, cloudLearn.barakahGems || 0),
      currentStreak: Math.max(localLearn.currentStreak || 0, cloudLearn.currentStreak || 0),
      lastActiveDate: localLearn.lastActiveDate || cloudLearn.lastActiveDate || "",
      completedNodeIds: Array.from(completedSet),
      unlockedNodeIds: Array.from(unlockedSet),
      nodeStars: mergedStars,
      activeNodeId: localLearn.activeNodeId || cloudLearn.activeNodeId || "s1_u1_n1",
      srsWords: mergedSrs,
      masteredWordIds: Array.from(
        new Set([...(localLearn.masteredWordIds || []), ...(cloudLearn.masteredWordIds || [])])
      ),
      reviewWordIds: Array.from(
        new Set([...(localLearn.reviewWordIds || []), ...(cloudLearn.reviewWordIds || [])])
      ),
      gameStats: {
        ...(cloudLearn.gameStats || {}),
        ...(localLearn.gameStats || {}),
      },
      langPreference: localLearn.langPreference || cloudLearn.langPreference || "bilingual",
      learnerProfile: localLearn.learnerProfile || cloudLearn.learnerProfile,
    },
    readingActivity: {
      currentStreak: Math.max(
        localState.readingActivity?.currentStreak || 0,
        cloudState.readingActivity?.currentStreak || 0
      ),
      totalVersesRead: Math.max(
        localState.readingActivity?.totalVersesRead || 0,
        cloudState.readingActivity?.totalVersesRead || 0
      ),
      sessions: [
        ...(cloudState.readingActivity?.sessions || []),
        ...(localState.readingActivity?.sessions || []),
      ],
    },
    bookmarks: localState.bookmarks || cloudState.bookmarks || [],
    lastRead: localState.lastRead || cloudState.lastRead || null,
    notes: (() => {
      const notesMap = new Map<string, QuranNote>();
      for (const n of cloudState.notes || []) {
        notesMap.set(n.id, n);
      }
      for (const n of localState.notes || []) {
        const existing = notesMap.get(n.id);
        if (!existing) {
          notesMap.set(n.id, n);
        } else {
          const localTime = new Date(n.updatedAt || n.createdAt || 0).getTime();
          const cloudTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          notesMap.set(n.id, localTime >= cloudTime ? n : existing);
        }
      }
      return Array.from(notesMap.values());
    })(),
  };
}

