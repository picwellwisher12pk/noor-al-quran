"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AyahFillGame } from "@/components/learn/AyahFillGame";

export default function AyahFillPage() {
  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <Link
        href="/learn/arcade"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Mini Games
      </Link>
      <AyahFillGame />
    </main>
  );
}
