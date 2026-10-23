import { fetchChapters, fetchJuzs } from "@/services/quranApi";
import { Chapter, Juz } from "@/types/quran";
import { SurahList } from "@/components/home/SurahList";
import { JuzList } from "@/components/home/JuzList";
import { KhatmahWidget } from "@/components/home/KhatmahWidget";
import { BookOpen, Sparkles, Compass, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab === "juz" ? "juz" : "surah";

  let chapters: Chapter[] = [];
  let juzs: Juz[] = [];
  let error: string | null = null;

  try {
    [chapters, juzs] = await Promise.all([fetchChapters(), fetchJuzs()]);
  } catch (e) {
    console.error("Failed to load initial Quran data:", e);
    error = "Unable to connect to Quran.com API. Please check your network connection and reload.";
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      {/* Desktop Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] p-6 md:p-8 text-center shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-amber-500/5 pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Authentic Uthmani Script & Multi-Reciter Studio
        </div>

        <h1 className="font-arabic text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)] mb-2 leading-relaxed" dir="rtl">
          إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted-foreground,#8e9b94)] max-w-2xl mx-auto mb-5 leading-normal">
          &ldquo;Indeed, this Qur&rsquo;an guides to that which is most suitable and gives good tidings to the believers.&rdquo;
          <span className="block text-xs text-emerald-400 mt-0.5 font-medium">Surah Al-Isra [17:9]</span>
        </p>

        {/* Quick Launch Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/learn"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-300" /> Learn 70% Words & Games
          </Link>
          <Link
            href="/surah/1"
            className="px-4 py-2 rounded-xl bg-[var(--surface-card,#182520)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4 text-emerald-400" /> Start Reading: Surah Al-Fatihah
          </Link>
          <Link
            href="/surah/18"
            className="px-4 py-2 rounded-xl bg-[var(--surface-card,#182520)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <Compass className="h-4 w-4 text-emerald-400" /> Read Surah Al-Kahf
          </Link>
          <Link
            href="/surah/36"
            className="px-4 py-2 rounded-xl bg-[var(--surface-card,#182520)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-amber-400" /> Read Surah Ya-Sin
          </Link>
        </div>

        {/* Desktop Quick Specs */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle,#1a2621)] flex flex-wrap items-center justify-center gap-6 text-[11px] text-[var(--muted-foreground,#8e9b94)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> 114 Verified Chapters
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> 30 Juzs (Parts)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Authentic Word Roots & Morphology
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Sunnah 7-Day Minimum Pacing
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-950/40 border border-red-800/50 p-6 text-center text-red-200">
          <p className="font-semibold mb-1">Live Connection Issue</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Khatmah & Daily Goal Tracker */}
          <KhatmahWidget />

          {/* Tabs: Surahs vs Juzs */}
          <div className="flex items-center justify-center pt-2">
            <div className="p-1 rounded-xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] flex gap-1 shadow-inner text-xs">
              <Link
                href="/?tab=surah"
                className={`px-5 py-1.5 rounded-lg font-semibold transition-all ${
                  currentTab === "surah"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
                }`}
              >
                Surahs (114)
              </Link>
              <Link
                href="/?tab=juz"
                className={`px-5 py-1.5 rounded-lg font-semibold transition-all ${
                  currentTab === "juz"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
                }`}
              >
                Juzs (30)
              </Link>
            </div>
          </div>

          {/* Tab Content */}
          {currentTab === "surah" ? (
            <SurahList chapters={chapters} />
          ) : (
            <JuzList juzs={juzs} chapters={chapters} />
          )}
        </>
      )}
    </div>
  );
}
