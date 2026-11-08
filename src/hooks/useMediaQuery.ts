"use client";

import { useState, useEffect } from "react";

/**
 * SSR-safe hook to evaluate responsive CSS media queries.
 *
 * @param query CSS media query string, e.g. "(max-width: 1023px)"
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // Legacy fallback
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Convenient shorthand to check if current viewport is mobile/tablet (< 1024px).
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/**
 * Convenient shorthand to check if current viewport is a small phone (< 640px).
 */
export function useIsSmallPhone(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

