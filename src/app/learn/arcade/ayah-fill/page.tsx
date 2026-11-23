"use client";

import React from "react";
import { ArcadeBackLink } from "@/components/learn/ArcadeBackLink";
import { AyahFillGame } from "@/components/learn/AyahFillGame";

export default function AyahFillPage() {
  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <ArcadeBackLink />
      <AyahFillGame />
    </main>
  );
}
