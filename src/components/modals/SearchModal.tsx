"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/common/Modal";
import { searchQuran } from "@/services/quranApi";
import { SearchResultItem } from "@/types/quran";
import { Search, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse?: (chapterId: number, verseNumber: number) => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchQuran(query.trim());
      setResults(data.results);
      setTotalResults(data.total);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-500" />
          <span>Search the Noble Quran</span>
        </div>
      }
    >
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, English translations, topics (e.g. 'patience', 'mercy', 'forgiveness')..."
            className="w-full rounded-xl bg-[var(--surface-raised,#16211d)] px-4 py-3 pl-11 text-sm text-[var(--foreground)] border border-[var(--border-subtle,#22332c)] focus:outline-none focus:border-emerald-500 placeholder-[var(--muted-foreground,#8e9b94)]"
          />
          <Search className="absolute left-3.5 h-4 w-4 text-[var(--muted-foreground,#8e9b94)] pointer-events-none" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-500 mb-2" />
          <p className="text-xs text-[var(--muted-foreground,#8e9b94)]">Searching authentic verses...</p>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-12 text-[var(--muted-foreground,#8e9b94)] text-sm">
          No matches found for &quot;{query}&quot;. Try different keywords or spelling.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--muted-foreground,#8e9b94)] pb-1">
            Found {totalResults} authentic verse matches:
          </div>
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {results.map((res) => {
              const [surahNum, ayahNum] = res.verse_key.split(":");
              return (
                <Link
                  key={res.verse_key}
                  href={`/surah/${surahNum}?ayah=${ayahNum}`}
                  onClick={onClose}
                  className="block p-4 rounded-xl bg-[var(--surface-raised,#16211d)] border border-[var(--border-subtle,#22332c)] hover:border-emerald-500/50 hover:bg-[var(--hover-bg,#1a2622)] transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      Surah {surahNum}, Ayah {ayahNum}
                    </span>
                    <span className="flex items-center text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">
                      Read ayah <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                  <p
                    className="font-arabic text-lg text-right text-[var(--foreground)] mb-2 leading-relaxed"
                    dir="rtl"
                  >
                    {res.text}
                  </p>
                  {res.translations && res.translations[0] && (
                    <p
                      className="text-xs text-[var(--muted-foreground,#8e9b94)] line-clamp-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: res.translations[0].text }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
