"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Heart, Clock, HelpCircle, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";
import { useLearningStore } from "../../store/useLearningStore";
import {
  SoundSniperPayload,
  RootRadarPayload,
  GrammarSortPayload,
  AyahPuzzlePayload
} from "../../lib/quiz-engine";
import { SoundSniperGame } from "./SoundSniperGame";
import { GrammarSortBucket } from "./GrammarSortBucket";
import { AyahPuzzleBuilder } from "./AyahPuzzleBuilder";
import { SessionSummaryModal } from "./SessionSummaryModal";

export function SessionRunner() {
  const {
    activeSession,
    activeSessionMode,
    endSession,
    consumeHeart,
    completeNode,
    recordWordReview,
    selectedNode,
    startSession,
    langPreference
  } = useLearningStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hearts, setHearts] = useState(3);
  const [userScore, setUserScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nodeUnlocked, setNodeUnlocked] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const isUrdu = langPreference === "urdu";

  // Prevent accidental tab closure or browser refresh mid-session
  useEffect(() => {
    if (!activeSession) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeSession]);

  // Missed words tracker for Spaced Repetition queue
  const [missedWords, setMissedWords] = useState<
    Array<{ id: string; textArabic: string; translationEn: string; translationUrdu?: string }>
  >([]);

  // State for Root Radar question within runner
  const [selectedRadarIds, setSelectedRadarIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Reset runner internal state whenever a new session starts
  const activeSessionId = activeSession?.sessionId;
  useEffect(() => {
    if (activeSessionId) {
      setCurrentIndex(0);
      setTimeLeft(15);
      setHearts(3);
      setUserScore(0);
      setShowFeedback(false);
      setIsLastAnswerCorrect(false);
      setIsCompleted(false);
      setNodeUnlocked(false);
      setMissedWords([]);
      setSelectedRadarIds([]);
      setShowHint(false);
      setShowQuitConfirm(false);
    }
  }, [activeSessionId]);

  const questions = activeSession?.questions ?? [];
  const total = questions.length;
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, total - 1)));
  const currentQuestion = questions[safeIndex];
  const isTest = activeSession?.mode === "test";

  const handleTimeExpired = useCallback(() => {
    if (!activeSession || !currentQuestion || showFeedback || isCompleted) return;
    consumeHeart();
    setHearts((h) => Math.max(0, h - 1));
    setIsLastAnswerCorrect(false);
    setShowFeedback(true);

    // Queue missed word into SRS
    if (currentQuestion.type === "sound_sniper") {
      const q = currentQuestion as SoundSniperPayload;
      recordWordReview(q.target.id, 1);
      setMissedWords((prev) => [
        ...prev,
        { id: q.target.id, textArabic: q.target.textArabic, translationEn: q.target.translationEn || q.target.transliteration, translationUrdu: q.target.translationUrdu }
      ]);
    }
  }, [activeSession, currentQuestion, showFeedback, isCompleted, consumeHeart, recordWordReview]);

  // Reset countdown to 15 when currentIndex changes in Test mode
  useEffect(() => {
    if (isTest) {
      setTimeLeft(15);
    }
  }, [currentIndex, isTest]);

  // Countdown timer for Test mode (pauses while quit confirmation modal is open)
  useEffect(() => {
    if (!activeSession || !isTest || showFeedback || isCompleted || showQuitConfirm) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, isTest, showFeedback, isCompleted, showQuitConfirm, handleTimeExpired]);

  if (!activeSession || !currentQuestion || total === 0) return null;

  const handleSoundSniperAnswer = (correct: boolean, selectedId: string) => {
    const q = currentQuestion as SoundSniperPayload;
    if (correct) {
      setUserScore((s) => s + 1);
      setIsLastAnswerCorrect(true);
      recordWordReview(q.target.id, 5);
    } else {
      setIsLastAnswerCorrect(false);
      recordWordReview(q.target.id, 1);
      setMissedWords((prev) => [
        ...prev,
        { id: q.target.id, textArabic: q.target.textArabic, translationEn: q.target.translationEn || q.target.transliteration, translationUrdu: q.target.translationUrdu }
      ]);
      if (isTest) {
        consumeHeart();
        setHearts((h) => Math.max(0, h - 1));
      }
    }
    setShowFeedback(true);
  };

  const handleGrammarSortAnswer = (correct: boolean) => {
    if (correct) {
      setUserScore((s) => s + 1);
      setIsLastAnswerCorrect(true);
    } else {
      setIsLastAnswerCorrect(false);
      if (isTest) {
        consumeHeart();
        setHearts((h) => Math.max(0, h - 1));
      }
    }
    setShowFeedback(true);
  };

  const handleAyahPuzzleAnswer = (correct: boolean) => {
    if (correct) {
      setUserScore((s) => s + 1);
      setIsLastAnswerCorrect(true);
    } else {
      setIsLastAnswerCorrect(false);
      if (isTest) {
        consumeHeart();
        setHearts((h) => Math.max(0, h - 1));
      }
    }
    setShowFeedback(true);
  };

  const checkRootRadarAnswer = () => {
    const radar = currentQuestion as RootRadarPayload;
    const validIds = radar.options.filter((o) => o.isDerivative).map((o) => o.id);
    const correct =
      selectedRadarIds.length === 3 &&
      selectedRadarIds.every((id) => validIds.includes(id));

    if (correct) {
      setUserScore((s) => s + 1);
      setIsLastAnswerCorrect(true);
    } else {
      setIsLastAnswerCorrect(false);
      if (isTest) {
        consumeHeart();
        setHearts((h) => Math.max(0, h - 1));
      }
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedRadarIds([]);
    setShowHint(false);
    setShowFeedback(false);

    // If out of hearts in test mode, finish session immediately
    if (isTest && hearts <= 0) {
      finishSession(false);
      return;
    }

    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1);
    } else {
      const accuracy = (userScore + (isLastAnswerCorrect ? 1 : 0)) / total;
      const passed = !isTest || (hearts > 0 && accuracy >= 0.85);
      finishSession(passed);
    }
  };

  const finishSession = (passed: boolean) => {
    setIsCompleted(true);
    if (selectedNode && passed) {
      const accuracy = userScore / total;
      const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
      completeNode(selectedNode.id, stars as 1 | 2 | 3, activeSession.mode);
      setNodeUnlocked(true);
    }
  };

  const xpEarned = isTest
    ? (selectedNode?.xpReward || 30) * 3
    : (selectedNode?.xpReward || 30);
  const gemsEarned = isTest
    ? (selectedNode?.gemReward || 5) * 2
    : (selectedNode?.gemReward || 5);

  if (isCompleted) {
    return (
      <SessionSummaryModal
        score={userScore}
        total={total}
        isTestMode={isTest}
        heartsRemaining={hearts}
        xpEarned={xpEarned}
        gemsEarned={gemsEarned}
        missedWords={missedWords}
        nodeUnlocked={nodeUnlocked}
        onContinue={endSession}
        onRetry={() => {
          endSession();
          startSession(activeSessionMode || "practice", selectedNode || undefined);
        }}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
        <div
          className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl border border-[var(--card-border)] p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-left overflow-y-auto custom-scrollbar transition-colors"
          style={{ backgroundColor: "var(--modal-bg, var(--surface-raised, #181d24))" }}
        >
          {/* Top Session Progress Bar & Controls */}
          <div className="space-y-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    isTest
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {isTest
                    ? isUrdu ? "امتحان (وقت محدود)" : "Test Arena (Timed)"
                    : isUrdu ? "مشق موڈ" : "Practice Sandbox"}
                </span>

                <span className="text-xs font-mono font-bold text-[var(--muted-foreground)]">
                  {currentIndex + 1} / {total}
                </span>

                {selectedNode && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] border-l border-[var(--border-subtle)] pl-2.5">
                    <span className="font-semibold text-[var(--foreground)]">
                      {isUrdu ? selectedNode.titleUrdu || selectedNode.title : selectedNode.title}
                    </span>
                    <span
                      className="text-emerald-600 dark:text-emerald-400 font-bold"
                      style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                    >
                      ({selectedNode.titleArabic})
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Hearts in Test Mode */}
                {isTest && (
                  <div className="flex items-center gap-1 text-rose-500 font-bold text-xs bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-xl">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{hearts}/3</span>
                  </div>
                )}

                {/* Timer in Test Mode */}
                {isTest && (
                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                      timeLeft <= 5
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-200 font-black animate-pulse"
                        : "bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--foreground)]"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{timeLeft}s</span>
                  </div>
                )}

                {/* Exit */}
                <button
                  type="button"
                  onClick={() => setShowQuitConfirm(true)}
                  className="p-1.5 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  title={isUrdu ? "سیشن ختم کریں" : "Exit Session"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Line */}
            <div className="w-full h-1.5 bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Question Canvas */}
          <div className="py-6 flex-1 space-y-6">
            {/* 1. SOUND SNIPER COMPONENT */}
            {currentQuestion.type === "sound_sniper" && (
              <SoundSniperGame
                payload={currentQuestion as SoundSniperPayload}
                onAnswer={handleSoundSniperAnswer}
                disabled={showFeedback}
                hintsAllowed={!isTest}
              />
            )}

            {/* 2. ROOT RADAR COMPONENT */}
            {currentQuestion.type === "root_radar" && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-1">
                  <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold block">
                    {isUrdu ? "ہدف ثلاثی مادہ (جڑ):" : "Target Triliteral Root:"}
                  </span>
                  <div
                    className="text-2xl font-bold text-[var(--foreground)] tracking-widest"
                    style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                  >
                    [ {(currentQuestion as RootRadarPayload).root} ]
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] block">
                    "{(currentQuestion as RootRadarPayload).rootMeaning}"
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] text-center">
                  {isUrdu
                    ? `تین درست قرآنی مشتقات کا انتخاب کریں (${selectedRadarIds.length}/3 منتخب):`
                    : `Select the 3 authentic Quranic derivatives (${selectedRadarIds.length}/3 chosen):`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(currentQuestion as RootRadarPayload).options.map((opt) => {
                    const isSelected = selectedRadarIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={showFeedback}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRadarIds((prev) => prev.filter((id) => id !== opt.id));
                          } else if (selectedRadarIds.length < 3) {
                            setSelectedRadarIds((prev) => [...prev, opt.id]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-purple-500/25 border-purple-500 text-[var(--foreground)] shadow-md shadow-purple-500/10"
                            : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] border-[var(--border-subtle)] text-[var(--foreground)]"
                        }`}
                      >
                        <div>
                          <span
                            className="text-lg font-bold block text-[var(--foreground)]"
                            style={{ fontFamily: "Amiri, Scheherazade, Arial, serif" }}
                          >
                            {opt.wordArabic}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)] block">
                            {opt.translationEn}
                          </span>
                        </div>
                        {opt.formNote && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--muted-foreground)]">
                            {opt.formNote}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!showFeedback && selectedRadarIds.length === 3 && (
                  <button
                    type="button"
                    onClick={checkRootRadarAnswer}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    {isUrdu ? "مشتق کلمات کی تصدیق کریں" : "Lock in Root Derivatives"}
                  </button>
                )}
              </div>
            )}

            {/* 3. GRAMMAR SORT COMPONENT */}
            {currentQuestion.type === "grammar_sort" && (
              <GrammarSortBucket
                payload={currentQuestion as GrammarSortPayload}
                onAnswer={handleGrammarSortAnswer}
                disabled={showFeedback}
                hintsAllowed={!isTest}
              />
            )}

            {/* 4. AYAH PUZZLE BUILDER COMPONENT */}
            {currentQuestion.type === "ayah_puzzle" && (
              <AyahPuzzleBuilder
                payload={currentQuestion as AyahPuzzlePayload}
                onAnswer={handleAyahPuzzleAnswer}
                disabled={showFeedback}
                hintsAllowed={!isTest}
              />
            )}

            {/* Hint Box in Practice Mode */}
            {!isTest && showHint && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-[var(--foreground)] flex items-start gap-2.5 animate-in fade-in">
                <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Bottom Feedback / Continue Bar */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
            {!isTest && (
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="px-3.5 py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>{isUrdu ? (showHint ? "اشارہ چھپائیں" : "اشارہ دیکھیں") : (showHint ? "Hide Hint" : "Hint")}</span>
              </button>
            )}

            {showFeedback && (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{isUrdu ? "اگلا سوال" : "Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quit Session In-App Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--card-border)] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-left transition-colors"
            style={{ backgroundColor: "var(--modal-bg, var(--surface-raised, #181d24))" }}
            dir={isUrdu ? "rtl" : "ltr"}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  isTest
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-500"
                    : "bg-amber-500/15 border border-amber-500/30 text-amber-500"
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {isTest
                    ? isUrdu
                      ? "کیا آپ ٹیسٹ سیشن چھوڑنا چاہتے ہیں؟"
                      : "Leave Test Arena?"
                    : isUrdu
                    ? "کیا آپ مشق سیشن چھوڑنا چاہتے ہیں؟"
                    : "Leave Practice Session?"}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {isTest
                    ? isUrdu
                      ? "اگر آپ ابھی باہر نکلتے ہیں تو آپ کا ٹیسٹ اسکور ضائع ہو جائے گا اور آپ کا 1 دل (Heart) کم ہو جائے گا۔"
                      : "Leaving now will forfeit this timed test session and consume 1 Heart. Your progress in this test will not be recorded."
                    : isUrdu
                    ? "آپ نے جن الفاظ کی مشق کی ہے وہ محفوظ ہو چکے ہیں۔ آپ جب چاہیں دوبارہ شروع کر سکتے ہیں۔"
                    : "Your spaced repetition progress on reviewed words has already been saved. You can resume practicing anytime."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)] text-xs font-semibold transition-colors cursor-pointer"
              >
                {isTest
                  ? isUrdu
                    ? "ٹیسٹ جاری رکھیں"
                    : "Resume Test"
                  : isUrdu
                  ? "مشق جاری رکھیں"
                  : "Keep Practicing"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isTest) {
                    consumeHeart();
                  }
                  endSession();
                  setShowQuitConfirm(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isTest
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/30"
                    : "bg-[var(--surface-card)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] border border-[var(--border-subtle)]"
                }`}
              >
                {isTest
                  ? isUrdu
                    ? "چھوڑ دیں (1 دل منفی)"
                    : "Forfeit & Quit (1 Heart)"
                  : isUrdu
                  ? "سیشن ختم کریں"
                  : "Quit Practice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
