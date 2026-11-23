"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function ArcadeBackLink() {
  const { isUrdu } = useLanguage();
  return (
    <Link
      href="/learn/arcade"
      className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
    >
      {isUrdu ? (
        <>
          <ChevronRight className="h-4 w-4" />
          <span>واپس گیمز آرکیڈ</span>
        </>
      ) : (
        <>
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Mini Games</span>
        </>
      )}
    </Link>
  );
}
