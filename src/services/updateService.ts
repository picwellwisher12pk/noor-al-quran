import { APP_CONFIG } from "@/config/version";

export interface AppUpdateAsset {
  name: string;
  downloadUrl: string;
  size: number;
  type: "apk" | "windows" | "mac" | "linux" | "other";
}

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  apkDownloadUrl?: string;
  windowsDownloadUrl?: string;
  assets: AppUpdateAsset[];
}

/**
 * Compares two semantic version strings (e.g. "1.37.0" and "1.36.2").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, "").split("-")[0];
  const clean2 = v2.replace(/^v/, "").split("-")[0];

  const parts1 = clean1.split(".").map(Number);
  const parts2 = clean2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Checks GitHub Releases API for the latest published release.
 */
export async function checkForAppUpdates(): Promise<AppUpdateInfo> {
  const currentVersion = APP_CONFIG.version;
  const repo = APP_CONFIG.githubRepo || "picwellwisher12pk/noor-al-quran";
  const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to check updates (HTTP ${response.status})`);
  }

  const release = await response.json();
  const latestTag = release.tag_name || "";
  const latestVersion = latestTag.replace(/^v/, "");
  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

  const rawAssets = Array.isArray(release.assets) ? release.assets : [];
  const assets: AppUpdateAsset[] = rawAssets.map((a: { name: string; browser_download_url: string; size: number }) => {
    let type: AppUpdateAsset["type"] = "other";
    const lower = a.name.toLowerCase();
    if (lower.endsWith(".apk")) type = "apk";
    else if (lower.endsWith(".exe") || lower.endsWith(".msi")) type = "windows";
    else if (lower.endsWith(".dmg")) type = "mac";
    else if (lower.endsWith(".appimage") || lower.endsWith(".deb")) type = "linux";

    return {
      name: a.name,
      downloadUrl: a.browser_download_url,
      size: a.size,
      type,
    };
  });

  // Prefer signed release APK, or any .apk
  const apkAsset =
    assets.find((a) => a.name.includes("-release.apk") || a.name.includes("-signed.apk")) ||
    assets.find((a) => a.type === "apk");

  // Prefer .exe installer on Windows
  const windowsAsset =
    assets.find((a) => a.name.endsWith(".exe")) ||
    assets.find((a) => a.type === "windows");

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    releaseName: release.name || latestTag,
    releaseNotes: release.body || "",
    publishedAt: release.published_at || "",
    htmlUrl: release.html_url || `https://github.com/${repo}/releases`,
    apkDownloadUrl: apkAsset?.downloadUrl,
    windowsDownloadUrl: windowsAsset?.downloadUrl,
    assets,
  };
}

/**
 * Safely opens a download or release URL using Tauri's opener plugin or browser window.
 */
export async function openAppUpdateLink(url: string) {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } catch {
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }
}
