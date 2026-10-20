"use client";

import React from "react";
import Link from "next/link";
import { APP_CONFIG } from "@/config/version";
import { BookOpen, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--card-border,#1e2c26)] bg-[var(--surface-raised,#101715)] py-10 text-xs text-[var(--muted-foreground,#8e9b94)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-[var(--foreground)]">{APP_CONFIG.name}</span>
              <span className="font-arabic text-emerald-400">نور القرآن</span>
            </div>
            <p className="text-xs leading-relaxed max-w-md">
              {APP_CONFIG.description} All Quranic text, word-by-word data, recitations, and tafsir are directly powered by the authentic Quran.com API v4.
            </p>
            <div className="pt-1">
              <span className="px-2 py-0.5 rounded-md bg-[var(--surface-card,#182520)] border border-[var(--border-subtle,#24362e)] font-mono text-[11px] text-emerald-400">
                Release v{APP_CONFIG.version}
              </span>
            </div>
          </div>

          {/* Col 2: Popular Surahs */}
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-3 uppercase tracking-wider text-[11px]">
              Featured Surahs
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/surah/1" className="hover:text-emerald-400 transition-colors">
                  1. Al-Fatihah (The Opening)
                </Link>
              </li>
              <li>
                <Link href="/surah/18" className="hover:text-emerald-400 transition-colors">
                  18. Al-Kahf (The Cave)
                </Link>
              </li>
              <li>
                <Link href="/surah/36" className="hover:text-emerald-400 transition-colors">
                  36. Ya-Sin (Yaseen)
                </Link>
              </li>
              <li>
                <Link href="/surah/55" className="hover:text-emerald-400 transition-colors">
                  55. Ar-Rahman (The Beneficent)
                </Link>
              </li>
              <li>
                <Link href="/surah/67" className="hover:text-emerald-400 transition-colors">
                  67. Al-Mulk (The Sovereignty)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data & Authenticity */}
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-3 uppercase tracking-wider text-[11px]">
              Authentic Sources
            </h4>
            <ul className="space-y-2">
              <li>Uthmani Script (Medina Mushaf)</li>
              <li>The Clear Quran (Dr. Mustafa Khattab)</li>
              <li>Tafsir Ibn Kathir (Abridged)</li>
              <li>Recitations via Quranicaudio & Quran.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-subtle,#1a2621)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 {APP_CONFIG.name}. Built with authentic reverence.</p>
          <p className="flex items-center gap-1 text-[var(--muted-foreground,#8e9b94)]">
            Dedicated for seekers of knowledge and remembrance.
          </p>
        </div>
      </div>
    </footer>
  );
}
