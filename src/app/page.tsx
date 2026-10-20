import { fetchChapters, fetchJuzs } from "@/services/quranApi";
import { Chapter, Juz } from "@/types/quran";
import { SurahList } from "@/components/home/SurahList";
import { JuzList } from "@/components/home/JuzList";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] p-8 md:p-12 mb-10 text-center shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-amber-500/5 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Authentic Uthmani Script & Multi-Reciter Audio
        </div>

        <h1 className="font-arabic text-4xl sm:text-5xl md:text-6xl text-[var(--foreground)] mb-3 leading-relaxed" dir="rtl">
          إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground,#8e9b94)] max-w-2xl mx-auto mb-6">
          &ldquo;Indeed, this Qur&rsquo;an guides to that which is most suitable and gives good tidings to the believers.&rdquo;
          <span className="block text-xs text-emerald-400 mt-1 font-medium">Surah Al-Isra [17:9]</span>
        </p>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/surah/1"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" /> Start with Surah Al-Fatihah
          </Link>
          <Link
            href="/surah/18"
            className="px-5 py-2.5 rounded-xl bg-[var(--surface-card,#182520)] hover:bg-[var(--hover-bg,#1c2923)] border border-[var(--border-subtle,#24362e)] text-[var(--foreground)] font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <Compass className="h-4 w-4 text-emerald-400" /> Read Surah Al-Kahf
          </Link>
        </div>

        {/* Authenticity Badges */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle,#1a2621)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--muted-foreground,#8e9b94)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> 114 Verified Surahs
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> 30 Juzs (Parts)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Word-by-Word Pronunciation
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Tafsir Ibn Kathir
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
          {/* Tabs: Surahs vs Juzs */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-1 rounded-2xl bg-[var(--surface-raised,#141e1a)] border border-[var(--card-border,#1e2c26)] flex gap-1 shadow-inner">
              <Link
                href="/?tab=surah"
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === "surah"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-[var(--muted-foreground,#8e9b94)] hover:text-[var(--foreground)]"
                }`}
              >
                Surahs (114)
              </Link>
              <Link
                href="/?tab=juz"
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
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
