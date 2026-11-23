"use client";

import React from "react";
import { ArcadeBackLink } from "@/components/learn/ArcadeBackLink";
import { RootFamilyGame } from "@/components/learn/RootFamilyGame";

export default function WordFamiliesPage() {
  return (
    <main className="flex-1 py-6 px-4 max-w-4xl mx-auto space-y-4">
      <ArcadeBackLink />
      <RootFamilyGame />
    </main>
  );
}
