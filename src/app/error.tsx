"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Quran App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 mb-6 shadow-lg">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Something went wrong</h2>
      <p className="text-sm text-[var(--muted-foreground,#8e9b94)] max-w-md mb-8">
        We encountered an error loading the authentic data. Please verify your internet connection and try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" /> Try Again
      </button>
    </div>
  );
}
