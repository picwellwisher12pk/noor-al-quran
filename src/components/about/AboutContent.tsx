"use client";

import React from "react";
import { APP_CONFIG } from "@/config/version";
import { useLanguage } from "@/context/LanguageContext";
import {
  BookOpen,
  Heart,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  HandHeart,
} from "lucide-react";

interface AboutContentProps {
  onOpenUpdates?: () => void;
}

export function AboutContent({ onOpenUpdates }: AboutContentProps) {
  const { isUrdu } = useLanguage();
  const { sadaqahJariyah, credits } = APP_CONFIG;

  return (
    <div className="space-y-4" dir={isUrdu ? "rtl" : "ltr"}>
      {/* 1. App Brand & Version Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/12 via-[var(--surface-raised)] to-teal-500/10 border border-[var(--card-border)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] tracking-tight">
                  {APP_CONFIG.name}
                </h3>
                <span className="font-arabic text-base text-emerald-700 dark:text-emerald-400 font-semibold">
                  {APP_CONFIG.nameArabic}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                {isUrdu
                  ? "مستند عثمانی رسم الخط، لفظ بہ لفظ ترجمہ، تلاوت اور تفسیر کے ساتھ قرآنی ورک سٹیشن"
                  : APP_CONFIG.description}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
            v{APP_CONFIG.version}
          </span>
        </div>
      </div>

      {/* 2. Creator Credits Banner */}
      <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--card-border)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Heart className="h-5 w-5 fill-rose-500/30" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {isUrdu ? "تخلیق و پیشکش" : "Creator & Credits"}
            </p>
            <p className="text-sm font-bold text-[var(--foreground)]">
              {isUrdu ? credits.ur : credits.en}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--foreground)] self-start sm:self-center">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>{APP_CONFIG.author}</span>
        </span>
      </div>

      {/* 3. Sadaqah Jariyah & Sawab Dedication Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--surface-raised)] to-emerald-500/10 border border-amber-500/30 dark:border-amber-500/25 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <HandHeart className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">
              {isUrdu ? sadaqahJariyah.titleUr : sadaqahJariyah.titleEn}
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              {isUrdu ? "نیتِ ثواب و صدقہ جاریہ" : "Intention for Ongoing Reward (Thawab)"}
            </p>
          </div>
        </div>

        <p
          className="font-arabic text-center text-lg sm:text-xl text-emerald-700 dark:text-emerald-300 py-2 px-3 rounded-xl bg-[var(--surface-card)]/80 border border-[var(--border-subtle)]"
          dir="rtl"
        >
          {sadaqahJariyah.arabicDua}
        </p>

        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
          {isUrdu ? sadaqahJariyah.bodyUr : sadaqahJariyah.bodyEn}
        </p>

        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 italic">
          {isUrdu ? sadaqahJariyah.closingUr : sadaqahJariyah.closingEn}
        </p>
      </div>

      {/* 4. Authentic Sources & Open Credits */}
      <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isUrdu ? "مستند قرآنی مآخذ" : "Authentic Data Sources"}</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
          <li className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--foreground)] block">
              {isUrdu ? "قرآنی متن اور لفظ بہ لفظ" : "Quran Text & Word-by-Word"}
            </span>
            Quran.com API v4 • Medina Mushaf (Uthmani &amp; Indo-Pak)
          </li>
          <li className="p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--foreground)] block">
              {isUrdu ? "تراجم، تفسیر اور تلاوت" : "Translations, Tafsir & Audio"}
            </span>
            The Clear Quran, Tafsir Ibn Kathir &amp; Quranicaudio
          </li>
        </ul>
      </div>

      {/* 5. Footer Action Links */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <a
          href={APP_CONFIG.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--foreground)] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isUrdu ? "گٹ ہب ریپوزٹری" : "GitHub Repository"}</span>
        </a>

        {onOpenUpdates && (
          <button
            type="button"
            onClick={onOpenUpdates}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isUrdu ? "ایپ اپ ڈیٹس چیک کریں" : "Check for Updates"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
