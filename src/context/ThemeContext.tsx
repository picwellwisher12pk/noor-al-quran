"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeStyle, ThemeMode } from "@/types/quran";

/** The resolved (applied) mode is always "dark" or "light". */
type ResolvedMode = "dark" | "light";

interface ThemeContextType {
  themeStyle: ThemeStyle;
  themeMode: ThemeMode; // user preference: "dark" | "light" | "system"
  resolvedMode: ResolvedMode; // the actual applied mode
  setThemeStyle: (style: ThemeStyle) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Detect the OS preference. SSR-safe. */
function getSystemPreference(): ResolvedMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** Resolve the effective mode from user preference. */
function resolveMode(mode: ThemeMode): ResolvedMode {
  return mode === "system" ? getSystemPreference() : mode;
}

/**
 * Applies theme classes & data attributes to <html> and updates
 * <meta name="theme-color"> for mobile status bar synchronisation.
 */
function applyThemeToDOM(style: ThemeStyle, resolved: ResolvedMode) {
  const root = document.documentElement;
  root.classList.remove(
    "theme-hadith",
    "theme-emerald",
    "theme-monochrome",
    "dark",
    "light",
  );
  root.classList.add(`theme-${style}`, resolved);
  root.dataset.theme = `${style}-${resolved}`;
  root.dataset.themeStyle = style;
  root.dataset.mode = resolved;

  // Sync <meta name="theme-color"> with the current header background.
  // Read the computed CSS variable so it matches any theme combination.
  try {
    const headerBg = getComputedStyle(root)
      .getPropertyValue("--header-bg")
      .trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && headerBg) {
      // Convert oklch to a usable value via a temporary element
      const tmp = document.createElement("div");
      tmp.style.color = headerBg;
      document.body.appendChild(tmp);
      const computed = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      if (computed) meta.setAttribute("content", computed);
    }
  } catch {
    // Non-critical – ignore
  }
}

const VALID_STYLES: ThemeStyle[] = ["hadith", "emerald", "monochrome"];
const VALID_MODES: ThemeMode[] = ["dark", "light", "system"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyleRaw] = useState<ThemeStyle>("hadith");
  const [themeMode, setThemeModeRaw] = useState<ThemeMode>("system");
  // Always initialize to "dark" on both server and client initial render to ensure 100% hydration matching.
  // The actual stored/system theme is synchronized immediately on mount in useEffect below.
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>("dark");
  const [mounted, setMounted] = useState(false);

  // ── Initialise from localStorage (runs once on mount) ──────────────
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem(
        "naq_theme_style",
      ) as ThemeStyle | null;
      const savedMode = localStorage.getItem(
        "naq_theme_mode",
      ) as ThemeMode | null;

      const style =
        savedStyle && VALID_STYLES.includes(savedStyle)
          ? savedStyle
          : "hadith";
      // Default to "system" when no preference is stored (respects OS).
      const mode =
        savedMode && VALID_MODES.includes(savedMode) ? savedMode : "system";

      setThemeStyleRaw(style);
      setThemeModeRaw(mode);
      setResolvedMode(resolveMode(mode));
    } catch {
      // localStorage unavailable – keep defaults
    }
    setMounted(true);
  }, []);

  // ── Listen for OS theme changes when in "system" mode ──────────────
  useEffect(() => {
    if (themeMode !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const newResolved: ResolvedMode = e.matches ? "dark" : "light";
      setResolvedMode(newResolved);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [themeMode]);

  // ── Apply to DOM whenever theme values change ──────────────────────
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem("naq_theme_style", themeStyle);
      localStorage.setItem("naq_theme_mode", themeMode);
    } catch {
      // ignore
    }

    applyThemeToDOM(themeStyle, resolvedMode);

    // Enable smooth transitions only after first mount to avoid FOUC animation
    document.documentElement.classList.add("theme-transition");
  }, [themeStyle, themeMode, resolvedMode, mounted]);

  // ── Setters ────────────────────────────────────────────────────────
  const setThemeStyle = useCallback((style: ThemeStyle) => {
    setThemeStyleRaw(style);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeRaw(mode);
    setResolvedMode(resolveMode(mode));
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeModeRaw((prev) => {
      // Cycle: dark → light → system → dark
      const next =
        prev === "dark" ? "light" : prev === "light" ? "system" : "dark";
      setResolvedMode(resolveMode(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      themeStyle,
      themeMode,
      resolvedMode,
      setThemeStyle,
      setThemeMode,
      toggleThemeMode,
    }),
    [
      themeStyle,
      themeMode,
      resolvedMode,
      setThemeStyle,
      setThemeMode,
      toggleThemeMode,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
