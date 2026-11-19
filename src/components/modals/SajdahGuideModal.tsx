"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSajdahInfo,
  SAJDAH_VERSES,
  SAJDAH_DUAS,
  SAJDAH_METHOD_GUIDE,
  isSajdahPerformed,
  toggleSajdahPerformed,
  getPerformedSajdahs,
  SajdahVerseData,
} from "@/utils/quranMeta";
import {
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
  BookOpen,
  Info,
  ExternalLink,
} from "lucide-react";

interface SajdahGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string;
  arabicText?: string;
}

export function SajdahGuideModal({
  isOpen,
  onClose,
  verseKey,
  arabicText,
}: SajdahGuideModalProps) {
  const { isUrdu } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPerformed, setIsPerformed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"duas" | "method" | "all_verses">("duas");

  const sajdahInfo = getSajdahInfo(verseKey);

  useEffect(() => {
    if (isOpen && verseKey) {
      setIsPerformed(isSajdahPerformed(verseKey));
    }
  }, [isOpen, verseKey]);

  // Keep in sync with storage updates
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ verseKey: string; isNowDone: boolean }>;
      if (customEvent.detail && customEvent.detail.verseKey === verseKey) {
        setIsPerformed(customEvent.detail.isNowDone);
      } else {
        setIsPerformed(isSajdahPerformed(verseKey));
      }
    };
    window.addEventListener("naq:sajdah-updated", handleUpdate);
    return () => window.removeEventListener("naq:sajdah-updated", handleUpdate);
  }, [verseKey]);

  const handleTogglePerformed = () => {
    const nowDone = toggleSajdahPerformed(verseKey);
    setIsPerformed(nowDone);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-arabic text-lg font-bold">
            ۩
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[var(--foreground)]">
                {isUrdu ? "سجدۂ تلاوت کی رہنمائی و مسنون دعائیں" : "Sajdah Tilawat Guide & Supplications"}
              </span>
              {sajdahInfo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  {isUrdu ? `سجدہ ${sajdahInfo.sajdahNumber} از ۱۵` : `Sajdah ${sajdahInfo.sajdahNumber} of 15`}
                </span>
              )}
            </div>
            <span className="block text-[11px] text-[var(--muted-foreground)] font-normal">
              {isUrdu
                ? "تلاوت قرآن کے دوران سجدہ کرنے کا طریقہ اور دعائیں"
                : "Supplications & step-by-step method for the Prostration of Recitation"}
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4" dir={isUrdu ? "rtl" : "ltr"}>
        {/* Ayah Reference & Sajdah Performed Action Bar */}
        <div className="p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-[var(--foreground)]">
                {isUrdu
                  ? `سورت ${sajdahInfo?.urduSurahName || sajdahInfo?.arabicSurahName || ""} (آیت ${sajdahInfo?.verseNumber || ""})`
                  : `Surah ${sajdahInfo?.englishSurahName || ""} (Ayah ${verseKey})`}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] font-medium">
                {isUrdu ? `پارہ ${sajdahInfo?.juzNumber || 1}` : `Juz ${sajdahInfo?.juzNumber || 1}`}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold">
                {isUrdu ? "واجب / سنت مؤکدہ" : "Wajib / Sunnah Mu'akkadah"}
              </span>
            </div>
            {sajdahInfo?.arabicSajdahWord && (
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {isUrdu ? "موضعِ سجدہ (کلمۂ سجدہ): " : "Trigger word: "}
                <span className="font-arabic font-bold text-emerald-700 dark:text-emerald-300">
                  {sajdahInfo.arabicSajdahWord}
                </span>
              </p>
            )}
          </div>

          {/* Mark as Performed Button */}
          <button
            type="button"
            onClick={handleTogglePerformed}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs ${
              isPerformed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[var(--surface-card)] hover:bg-[var(--primary)]/10 text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40"
            }`}
          >
            {isPerformed ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white fill-current" />
                <span>{isUrdu ? "سجدہ ادا ہو گیا ✓" : "Sajdah Completed ✓"}</span>
              </>
            ) : (
              <>
                <span className="font-arabic text-base leading-none">۩</span>
                <span>{isUrdu ? "سجدہ ادا کیا؟ نشان لگائیں" : "Mark as Performed"}</span>
              </>
            )}
          </button>
        </div>

        {/* Arabic Ayah Snippet if provided */}
        {arabicText && (
          <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-right" dir="rtl">
            <p className="font-arabic text-base sm:text-lg text-[var(--foreground)] leading-relaxed">
              {arabicText}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5 text-xl">۩</span>
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab("duas")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "duas"
                ? "bg-[var(--surface-raised)] text-[var(--primary)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "مسنون دعائیں" : "Sunnah Supplications"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("method")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "method"
                ? "bg-[var(--surface-raised)] text-[var(--primary)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "طریقۂ سجدہ (فقہی رہنمائی)" : "How to Perform"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all_verses")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "all_verses"
                ? "bg-[var(--surface-raised)] text-[var(--primary)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isUrdu ? "قرآن کے تمام ۱۵ سجدے" : "All 15 Sajdahs"}
          </button>
        </div>

        {/* Tab 1: Sunnah Du'as */}
        {activeTab === "duas" && (
          <div className="space-y-3">
            {SAJDAH_DUAS.map((dua, idx) => (
              <div
                key={dua.id}
                className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--card-border)] space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-[var(--foreground)]">
                      {isUrdu ? dua.titleUrdu : dua.titleEnglish}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${dua.arabic}\n\n${dua.transliteration}\n\n${dua.english}`, dua.id)}
                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                    title={isUrdu ? "دعا کاپی کریں" : "Copy supplication"}
                  >
                    {copiedId === dua.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Arabic Text */}
                <div className="text-right py-1" dir="rtl">
                  <p className="font-arabic text-base sm:text-lg text-[var(--foreground)] leading-relaxed font-semibold">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="text-left" dir="ltr">
                  <p className="text-[11px] font-mono text-[var(--muted-foreground)] italic leading-relaxed">
                    {dua.transliteration}
                  </p>
                </div>

                {/* Translation: Urdu or English */}
                {isUrdu ? (
                  <div className="text-right border-t border-[var(--border-subtle)]/60 pt-2" dir="rtl">
                    <p className="text-xs font-urdu text-[var(--urdu-color)] leading-relaxed">
                      {dua.urdu}
                    </p>
                  </div>
                ) : (
                  <div className="text-left border-t border-[var(--border-subtle)]/60 pt-2" dir="ltr">
                    <p className="text-xs text-[var(--translation-color)] leading-relaxed">
                      {dua.english}
                    </p>
                  </div>
                )}

                {/* Hadith Source */}
                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-1" dir="ltr">
                  <span>Source: {dua.source}</span>
                </div>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[var(--foreground)] leading-relaxed">
                {isUrdu ? (
                  <span>
                    اگر سجدے میں یہ مخصوص دعائیں یاد نہ ہوں تو سجدے کی عام تسبیح{" "}
                    <strong className="font-arabic font-bold text-sm">سُبْحَانَ رَبِّيَ الأَعْلَى</strong>{" "}
                    کم از کم تین بار پڑھ لینا بھی کافی اور مسنون ہے۔
                  </span>
                ) : (
                  <span>
                    If you do not have these specific supplications memorized, reciting the regular prostration glorification{" "}
                    <strong className="font-arabic font-bold text-sm">سُبْحَانَ رَبِّيَ الأَعْلَى</strong>{" "}
                    (at least 3 times) is completely valid and fulfills the Sunnah.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Method of Sajdah Tilawat */}
        {activeTab === "method" && (
          <div className="space-y-3">
            <div className="space-y-2">
              {(isUrdu ? SAJDAH_METHOD_GUIDE.urdu : SAJDAH_METHOD_GUIDE.english).map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--card-border)]"
                >
                  <div className="h-6 w-6 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 font-mono mt-0.5">
                    {item.step}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="font-bold text-xs text-[var(--foreground)]">{item.title}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-[var(--foreground)] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isUrdu ? "اہم فقہی نکات" : "Key Rulings & Best Practices"}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {isUrdu ? (
                  <>
                    <li>سجدۂ تلاوت قاری (پڑھنے والے) اور سامع (سننے والے) دونوں پر عائد ہوتا ہے۔</li>
                    <li>اگر فوری طور پر سجدہ ممکن نہ ہو (مثلاً دورانِ سفر یا بے وضو)، تو بعد میں قضا کیا جا سکتا ہے۔</li>
                    <li>ایک ہی نشست میں ایک آیت کو بار بار دہرایا جائے تو صرف ایک ہی سجدہ واجب ہوتا ہے۔</li>
                  </>
                ) : (
                  <>
                    <li>Sajdah Tilawat applies both to the one who recites the verse and to the one who hears it attentively.</li>
                    <li>If you cannot perform it immediately (e.g. while commuting or without wudhu), you may make it up later.</li>
                    <li>If the same verse is repeated multiple times in a single sitting, one prostration suffices for all of them.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: All 15 Sajdah Verses in Quran */}
        {activeTab === "all_verses" && (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {Object.values(SAJDAH_VERSES).map((item: SajdahVerseData) => {
              const performedMap = getPerformedSajdahs();
              const isThisDone = Boolean(performedMap[item.verseKey]);
              const isCurrent = item.verseKey === verseKey;

              return (
                <div
                  key={item.verseKey}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    isCurrent
                      ? "bg-[var(--primary)]/10 border-[var(--primary)]/50 ring-1 ring-[var(--primary)]/30"
                      : "bg-[var(--surface-raised)] border-[var(--card-border)] hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                      {item.sajdahNumber}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-[var(--foreground)] truncate flex items-center gap-1.5">
                        <span>{isUrdu ? item.urduSurahName : item.englishSurahName}</span>
                        <span className="font-mono text-[10px] text-[var(--primary)]">[{item.verseKey}]</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--primary)] text-white font-semibold">
                            {isUrdu ? "موجودہ" : "Current"}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-2">
                        <span>{isUrdu ? `پارہ ${item.juzNumber}` : `Juz ${item.juzNumber}`}</span>
                        <span>•</span>
                        <span className="font-arabic text-emerald-700 dark:text-emerald-300" dir="rtl">{item.arabicSajdahWord}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isThisDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <Check className="h-3 w-3" />
                        <span>{isUrdu ? "ادا ہوا" : "Done"}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                        {isUrdu ? "باقی" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <span>{isUrdu ? "۱۵ آیاتِ سجدہ (۱۴ متفق علیہ + ۱ سورت الحج)" : "15 Sajdah Verses in the Holy Quran"}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] font-semibold transition-colors cursor-pointer"
          >
            {isUrdu ? "بند کریں" : "Close"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
