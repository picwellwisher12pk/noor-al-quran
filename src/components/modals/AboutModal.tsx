"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { AboutContent } from "@/components/about/AboutContent";
import { useLanguage } from "@/context/LanguageContext";
import { Info } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdates?: () => void;
}

export function AboutModal({ isOpen, onClose, onOpenUpdates }: AboutModalProps) {
  const { isUrdu } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      draggable={true}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base text-[var(--foreground)]">
              {isUrdu ? "نور القرآن کے بارے میں" : "About Noor Al-Quran"}
            </span>
            <span className="block text-[10px] text-[var(--muted-foreground)] -mt-0.5 font-normal">
              {isUrdu
                ? "تعارف، کریڈٹس اور صدقہ جاریہ کی نیت"
                : "App Credits, Authentic Sources & Sadaqah Jariyah"}
            </span>
          </div>
        </div>
      }
    >
      <AboutContent onOpenUpdates={onOpenUpdates} />
    </Modal>
  );
}
