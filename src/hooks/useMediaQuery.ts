"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe hook using React 19's useSyncExternalStore to evaluate media queries.
 *
 * @param query CSS media query string, e.g. "(max-width: 767px)"
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false // server snapshot
  );
}

/**
 * Convenient shorthand to check if current viewport is a mobile device (< 768px).
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Convenient shorthand to check if current viewport is desktop/tablet (>= 768px).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

/**
 * Convenient shorthand to check if current viewport is a small phone (< 640px).
 */
export function useIsSmallPhone(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

