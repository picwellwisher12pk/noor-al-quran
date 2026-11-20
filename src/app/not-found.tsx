import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 flex items-center justify-center text-[var(--primary)] mb-6 shadow-lg">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Page Not Found</h1>
      <p className="text-sm text-[var(--muted-foreground)] max-w-md mb-8">
        The requested chapter or ayah could not be located. Please check the number or return to the main index.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/app"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" /> Return to Quran Reader
        </Link>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-[var(--foreground)] font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}

