/**
 * Platform Detection & Fail-Safe Runtime Environment Bridge
 *
 * Ensures all native Tauri and Desktop APIs gracefully fallback to standard
 * Web browser capabilities (Fullscreen API, location routing, Web Share)
 * when running as a web application.
 */

export function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

/**
 * Safely closes the application window in Tauri,
 * or navigates to the root home route in web browser mode.
 */
export async function safeCloseWindow(): Promise<void> {
  if (isTauri()) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      // Fallback
      if (typeof window !== "undefined") window.location.href = "/";
    }
  } else if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Safely minimizes the window in Tauri desktop mode.
 */
export async function safeMinimizeWindow(): Promise<void> {
  if (isTauri()) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      // No-op on web
    }
  }
}

/**
 * Safely toggles fullscreen / maximize across Tauri desktop
 * and standard modern web browsers using the Fullscreen API.
 */
export async function safeToggleMaximize(): Promise<void> {
  if (isTauri()) {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch {
      // Fallback to web fullscreen
      toggleWebFullscreen();
    }
  } else {
    toggleWebFullscreen();
  }
}

function toggleWebFullscreen(): void {
  if (typeof document === "undefined") return;
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/**
 * Safely copies text to clipboard with modern Clipboard API
 * and textarea fallback for restricted web contexts.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to fallback
    }
  }

  if (typeof document !== "undefined") {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand("copy");
      document.body.removeChild(el);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
