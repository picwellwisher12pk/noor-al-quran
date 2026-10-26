import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
      <p className="font-arabic text-xl text-[var(--foreground)] mb-1">بِسْمِ ٱللَّهِ</p>
      <p className="text-xs text-[var(--muted-foreground)]">Loading authentic Quran verses...</p>
    </div>
  );
}
