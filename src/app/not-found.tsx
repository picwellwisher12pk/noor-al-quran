import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-6 shadow-lg">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Page Not Found</h1>
      <p className="text-sm text-[var(--muted-foreground,#8e9b94)] max-w-md mb-8">
        The requested chapter or ayah could not be located. Please check the number or return to the main index.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
      >
        <Home className="h-4 w-4" /> Return to Noble Quran
      </Link>
    </div>
  );
}
