/**
 * Gamified Quranic Arabic Learning Module - Core Type Definitions & Data Architecture
 * 
 * Defines strict TypeScript models for:
 * 1. Curriculum Hierarchy: Stages (1 to 5) -> Units -> Lessons
 * 2. Linguistic Data: Uthmani Arabic script, transliterations, translations,
 *    triliteral roots (Jathr), parts of speech, morphology, and audio CDNs.
 * 3. Interactive Mini-Game Payloads:
 *    - Root Tree Builder (Sarf)
 *    - Ayah Puzzle (Syntax / Word Reconstruction)
 *    - Color-Code the Verse (Nahw / Grammar classification)
 *    - Tajweed Rhythm Tap (Madd, Qalqalah, Ghunnah)
 *    - Voice Match (Phonetic pronunciation scoring)
 *    - Memory Matrix (Bilingual card matching)
 * 4. Dual-Mode Mechanics: Practice Mode (Sandbox / Chill) vs. Test Mode (Arena / 3 Hearts)
 * 5. Spaced Repetition System (SRS): SM-2 algorithm schedule, mastery levels (0-5),
 *    XP economy, Barakah Gems, daily Istiqamah streaks, and heart regeneration.
 */

// ============================================================================
// 1. CURRICULUM HIERARCHY
// ============================================================================

export type LearningLanguagePreference = "bilingual" | "english" | "urdu";

export type CurriculumPhaseNumber = 1 | 2 | 3 | 4 | 5;

export type CurriculumPhaseId =
  | "stage_1_foundation"
  | "stage_2_high_frequency"
  | "stage_3_nahw_syntax"
  | "stage_4_sarf_morphology"
  | "stage_5_immersion_fluency";

export type LessonType =
  | "concept_intro"        // Visual & audio theory overview (3-5 min)
  | "word_drill"           // Rapid word vocabulary acquisition
  | "grammar_rule"         // Syntax or inflection rule breakdown
  | "interactive_game"     // Game-based mechanics (Tree, Puzzle, Classifier, etc.)
  | "unit_checkpoint"      // 15-question fast-paced unit assessment
  | "boss_battle"          // Surah mastery challenge (e.g. Al-Asr, Al-Falaq)
  | "certification_exam";   // 50-question comprehensive stage qualification exam

export interface LessonUnlockRequirement {
  previousLessonId?: string;
  minPhaseXP?: number;
  requiredStars?: number;
}

export interface CurriculumLesson {
  id: string;                               // e.g. 'stage2_u1_l1_golden_particles'
  unitId: string;                           // e.g. 'stage2_u1_particles'
  phaseNumber: CurriculumPhaseNumber;        // 1 to 5
  lessonIndex: number;                      // 1-based index within unit
  title: string;                            // e.g. 'Prepositions of Movement'
  titleArabic: string;                      // e.g. 'حروف الجر الحركية'
  titleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  lessonType: LessonType;
  estimatedMinutes: number;                 // Typically 3-5 minutes
  xpReward: number;                         // Base XP reward on completion
  gemReward: number;                        // Barakah Gems awarded
  targetWordIds: string[];                  // Word nodes taught or reinforced
  miniGamePayloads: MiniGamePayload[];       // Interactive questions / mini-game items
  audioIntroUrl?: string;                   // Pronunciation / teacher guidance audio
  isCheckpoint?: boolean;
  bossBattleAyahRange?: {
    chapterId: number;
    fromAyah: number;
    toAyah: number;
    surahNameEn: string;
    surahNameAr: string;
  };
  unlockRequirement?: LessonUnlockRequirement;
}

export interface CurriculumUnit {
  id: string;                               // e.g. 'stage2_u1_particles'
  phaseNumber: CurriculumPhaseNumber;        // 1 to 5
  unitIndex: number;                        // 1-based index within phase
  title: string;                            // e.g. 'Golden Particles'
  titleArabic: string;                      // e.g. 'حروف الجر والعطف الذهبية'
  titleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  lessons: CurriculumLesson[];
  checkpointLessonId: string;               // Node ID for final unit checkpoint
  unlockRequirement?: {
    previousUnitId?: string;
    minPhaseXP?: number;
  };
}

export interface CurriculumPhase {
  phaseNumber: CurriculumPhaseNumber;        // 1 to 5
  id: CurriculumPhaseId;
  title: string;                            // e.g. 'Stage 2: The 50% Milestone'
  titleArabic: string;                      // e.g. 'المرحلة الثانية: محطة الخمسين بالمئة'
  titleUrdu?: string;
  subtitle: string;                         // e.g. 'High-Frequency Words & Essential Particles'
  subtitleUrdu?: string;
  goal: string;
  goalUrdu?: string;                             // e.g. 'Understand 50% of the words on any page of the Quran'
  targetComprehensionPercentage: number;    // e.g. 50 (representing 50.0%)
  colorTheme: string;                       // Tailwind / CSS token
  iconName: string;                         // Icon identifier
  units: CurriculumUnit[];
  orderIndex: number;
}

// ============================================================================
// 2. LINGUISTIC DATA & MORPHOLOGY
// ============================================================================

/**
 * Three foundational parts of speech in Classical Quranic Arabic (Nahw):
 * - Ism: Noun, pronoun, adjective, adverb
 * - Fi'l: Verb (past, present/future, imperative)
 * - Harf: Particle (preposition, conjunction, negation, emphasis, etc.)
 */
export type QuranPartOfSpeech = "ism" | "fil" | "harf";

export type QuranPartOfSpeechDetail =
  | "noun"
  | "proper_noun"
  | "pronoun"
  | "demonstrative"
  | "relative_pronoun"
  | "adjective"
  | "past_verb"
  | "present_verb"
  | "imperative_verb"
  | "preposition"
  | "conjunction"
  | "particle"
  | "interrogative"
  | "negative_particle"
  | "conditional_particle"
  | "vocative_particle"
  | "quranic_initials";

export interface MorphologicalForm {
  formNumber?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  formRoman?: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X";
  tense?: "madi" | "mudari" | "amr";
  voice?: "active" | "passive";
  grammarCase?: "marfoo" | "mansoob" | "majroor" | "majzoom";
  caseArabic?: "مرفوع" | "منصوب" | "مجرور" | "مجزوم";
  gender?: "masculine" | "feminine";
  number?: "singular" | "dual" | "plural";
  person?: "first" | "second" | "third";
  pattern?: string;                         // e.g. 'فَعَلَ', 'فَاعِل', 'مَفْعُول', 'تَفْعِيل'
  patternMeaning?: string;                  // e.g. 'Active Participle / The Doer'
}

export interface SampleAyahReference {
  verseKey: string;                         // e.g. '1:1'
  chapterId: number;
  verseNumber: number;
  surahNameEn: string;
  surahNameAr: string;
  textUthmani: string;
  translationEn: string;
  translationUrdu?: string;
  highlightWordIndex: number;               // 0-based index of the target word in the verse
}

export interface QuranWordNode {
  id: string;                               // Unique ID, e.g. 'quran_w_1_1_2'
  textUthmani: string;                      // Sacred Uthmani script with full diacritics
  textSimple: string;                       // Clean search-friendly Arabic
  transliteration: string;                  // Phonetic transliteration (e.g. 'Al-Rahman')
  translationEn: string;                    // Primary English gloss
  translationUrdu: string;                  // Authentic Urdu gloss
  additionalMeanings?: string[];            // Nuanced contextual translations
  root: string;                             // Triliteral / quadriliteral root (e.g. 'ع ل م')
  rootTransliteration?: string;             // e.g. ''A-L-M'
  partOfSpeech: QuranPartOfSpeech;          // Primary: 'ism' | 'fil' | 'harf'
  posDetail: QuranPartOfSpeechDetail;       // Granular grammatical class
  posLabelArabic: string;                   // e.g. 'اسم', 'فعل ماض', 'حرف جر'
  posLabelEnglish: string;                  // e.g. 'Noun', 'Past Verb', 'Preposition'
  morphologicalForm?: MorphologicalForm;    // Derivation and inflectional attributes
  frequencyInQuran: number;                 // Genuine occurrences in Quran (e.g. Allah = 2699)
  audioCdnUrl: string;                      // Direct CDN pronunciation MP3
  sampleAyah: SampleAyahReference;          // Authentic verse citation
  semanticTags?: string[];                  // Clusters like 'theology', 'nature', 'guidance'
}

// ============================================================================
// 3. INTERACTIVE MINI-GAME PAYLOADS
// ============================================================================

export type MiniGameType =
  | "root_tree_builder"
  | "ayah_puzzle"
  | "color_code_grammar"
  | "tajweed_rhythm_tap"
  | "voice_match"
  | "memory_matrix";

/**
 * Game 1: Root Tree Builder (Sarf Morphology Game)
 * Visual tree trunk with 3 root letters; users grow branches with derived words.
 */
export interface DerivedWordLeaf {
  id: string;
  wordArabic: string;
  transliteration: string;
  translationEn: string;
  translationUrdu: string;
  morphologyNote: string;                   // e.g. 'Form X: Seeking forgiveness'
  formRoman?: string;                       // e.g. 'Form X'
  pattern: string;                          // e.g. 'اسْتِفْعَال'
  audioUrl?: string;
}

export interface RootTreeBuilderPayload {
  type: "root_tree_builder";
  root: string;                             // e.g. 'غ ف ر'
  rootTransliteration: string;              // 'Gh-F-R'
  rootCoreMeaning: string;                  // 'To cover, protect, forgive'
  treeTrunkLabel: string;
  derivatives: DerivedWordLeaf[];
  distractors?: Array<{
    id: string;
    wordArabic: string;
    translationEn: string;
    explanationWhyIncorrect: string;
  }>;
}

/**
 * Game 2: Ayah Puzzle (Syntax & Translation Game)
 * Scrambled blocks rearranged to reconstruct an authentic verse or its meaning.
 */
export interface PuzzleToken {
  id: string;
  content: string;                          // Arabic word or translation phrase
  expectedIndex: number;                    // 0-based correct sequence position
  audioWordUrl?: string;
}

export interface AyahPuzzlePayload {
  type: "ayah_puzzle";
  verseKey: string;                         // e.g. '103:1'
  audioRecitationUrl: string;
  textUthmani: string;
  translationEn: string;
  translationUrdu?: string;
  mode: "arrange_arabic" | "arrange_translation";
  scrambledTokens: PuzzleToken[];
}

/**
 * Game 3: Color-Code the Verse (Nahw / Grammar Game)
 * Users highlight words by tapping correct grammatical colors:
 * Blue = Ism, Green = Fi'l, Red = Harf
 */
export interface ColorCodeToken {
  id: string;
  textArabic: string;
  correctCategory: QuranPartOfSpeech;       // 'ism' | 'fil' | 'harf'
  posArabicLabel: string;                   // 'اسم', 'فعل', 'حرف'
  posEnglishLabel: string;
  explanation: string;                      // Why this word belongs to this category
}

export interface ColorCodeGrammarPayload {
  type: "color_code_grammar";
  verseKey: string;
  audioRecitationUrl?: string;
  instruction: string;
  tokens: ColorCodeToken[];
}

/**
 * Game 4: Tajweed Rhythm Tap (Audio Reading Game)
 * Rhythmic tap & hold for exact elongation (Madd 2, 4, 6 counts) or double-tap for Qalqalah.
 */
export interface TajweedRhythmTarget {
  id: string;
  timestampMs: number;                      // When in the audio recitation this rule occurs
  durationMs: number;                       // Duration of the count
  wordArabic: string;
  ruleType: "madd_2" | "madd_4" | "madd_6" | "qalqalah_bounce" | "ghunnah_hold";
  ruleLabel: string;                        // e.g. 'Madd Lazim (6 Counts)'
  action: "tap_and_hold" | "double_tap" | "single_tap";
}

export interface TajweedRhythmTapPayload {
  type: "tajweed_rhythm_tap";
  verseKey: string;
  audioRecitationUrl: string;
  durationTotalMs: number;
  targets: TajweedRhythmTarget[];
}

/**
 * Game 5: Voice Match (Pronunciation AI Scoring)
 * Compares user voice input with master Qari audio waveform.
 */
export interface VoiceMatchPayload {
  type: "voice_match";
  targetWordArabic: string;
  targetTransliteration: string;
  referenceAudioUrl: string;
  minAccuracyScore: number;                 // e.g. 75 for 75% match
  phoneticBreakdown: string[];              // e.g. ['Qaf', 'Alif', 'Lam']
  makhrajGuidance: string;                  // Vocal tract placement explanation
}

/**
 * Game 6: Memory Matrix (Bilingual Pair Matching)
 * 8-12 card grid of Arabic words matched against their translations.
 */
export interface MemoryMatrixCardPair {
  pairId: string;
  arabicCard: {
    id: string;
    textArabic: string;
    transliteration: string;
    audioUrl?: string;
  };
  translationCard: {
    id: string;
    textTranslation: string;
    language: "en" | "ur";
  };
}

export interface MemoryMatrixPayload {
  type: "memory_matrix";
  pairs: MemoryMatrixCardPair[];
}

export type MiniGamePayload =
  | RootTreeBuilderPayload
  | AyahPuzzlePayload
  | ColorCodeGrammarPayload
  | TajweedRhythmTapPayload
  | VoiceMatchPayload
  | MemoryMatrixPayload;

// ============================================================================
// 4. DUAL-MODE SYSTEM (PRACTICE VS. ACTUAL TEST MODE)
// ============================================================================

export type LearningMode = "practice" | "test";

export interface PracticeSessionState {
  mode: "practice";
  lessonId: string;
  unitId: string;
  startedAt: number;                        // Unix epoch ms
  hintsUsed: number;                        // Infinite hints available
  incorrectAttempts: Array<{
    wordId: string;
    timestamp: number;
    userSelectedAnswer: string;
  }>;
  elapsedSeconds: number;
  earnedBaseXP: number;
  isCompleted: boolean;
}

export interface TestSessionState {
  mode: "test";
  lessonId: string;
  unitId: string;
  startedAt: number;
  heartsRemaining: number;                  // Strictly 3 max; 0 = failed
  maxHearts: 3;                             // Constant 3 lives in test mode
  countdownPerQuestionSec: number;          // Typically 15-20 seconds per question
  currentQuestionTimeRemaining: number;     // Active countdown timer
  streakCount: number;                      // In-session correct answer combo
  totalCorrect: number;
  totalQuestions: number;
  multiplierXP: 3;                          // 3x XP reward for passing test mode
  earnedXP: number;
  earnedGems: number;
  isFailed: boolean;                        // True if hearts <= 0 or timer runs out
  isPassed: boolean;
  unlockedCheckpointId?: string;
}

// ============================================================================
// 5. USER PROGRESS & SPACED REPETITION (SRS)
// ============================================================================

/**
 * Mastery Levels:
 * 0: Unseen / New
 * 1: Learning (Introduced in concept/drill)
 * 2: Familiar (Practiced with hints)
 * 3: Competent (Answered without hints in Practice Mode)
 * 4: Mastered (Verified under pressure in Test Mode)
 * 5: Fluent (Retained across spaced intervals >= 30 days)
 */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * SuperMemo SM-2 Recall Quality Grade (0 to 5):
 * 5: Perfect recall without hesitation
 * 4: Correct recall after a slight hesitation
 * 3: Correct recall with difficulty
 * 2: Incorrect response; but upon seeing it, easy recall
 * 1: Incorrect response; remembered wrong
 * 0: Complete blackout
 */
export type SRSRecallGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface WordSRSRecord {
  wordId: string;                           // Foreign key to QuranWordNode.id
  masteryLevel: MasteryLevel;
  repetitionCount: number;                  // Total successful consecutive reviews
  intervalDays: number;                     // Current interval before next review
  easeFactor: number;                       // SM-2 multiplier (default 2.5, min 1.3)
  lastReviewedAt: string;                   // ISO 8601 date string
  nextReviewAt: string;                     // ISO 8601 date string for SRS scheduling
  consecutiveCorrect: number;
  totalReviews: number;
  totalMistakes: number;
}

export interface UserHeartSystem {
  currentHearts: number;                    // 0 to 5
  maxHearts: 5;                             // Maximum hearts in idle pool
  heartRegenIntervalMinutes: number;        // 30 minutes per regenerated heart
  lastRegenTimestamp: number;               // Epoch timestamp of last regeneration
}

export interface LessonCompletionRecord {
  lessonId: string;
  completedAt: string;                      // ISO timestamp
  highScore: number;
  starsEarned: 1 | 2 | 3;
  practiceCompleted: boolean;
  testModePassed: boolean;
  attemptsCount: number;
}

export type LeagueTier = "bronze" | "silver" | "gold" | "pearl" | "jannah";

export interface UserLearningProfile {
  userId: string;
  totalXP: number;                          // Cumulative Experience Points
  barakahGems: number;                      // In-game currency for freezes & customizations
  currentStreak: number;                    // Daily Istiqamah streak in days
  longestStreak: number;                    // All-time best streak
  lastActiveDate: string;                   // 'YYYY-MM-DD'
  streakFreezeCount: number;                // Equipped streak freeze shields
  hearts: UserHeartSystem;
  currentPhase: CurriculumPhaseNumber;      // 1 to 5
  currentUnitId: string;                    // Active unit pointer
  currentLessonId: string;                  // Active lesson pointer
  unlockedCheckpoints: string[];            // IDs of cleared checkpoints
  completedLessons: Record<string, LessonCompletionRecord>;
  srsWords: Record<string, WordSRSRecord>;   // Word ID -> SRS schedule
  totalWordsLearned: number;                // Unique words with mastery >= 1
  totalWordsMastered: number;               // Unique words with mastery >= 4
  percentOfQuranUnderstood: number;         // Dynamically computed from genuine token frequency
  leagueTier: LeagueTier;
  learnerLensActive: boolean;               // Magic Lens toggle for reading view
}

// ============================================================================
// 6. PERSISTENT STORAGE SCHEMA (SQLite / Local Data Shape)
// ============================================================================

export interface LearningStorageSchema {
  version: number;
  lastSyncedAt: string;
  profile: UserLearningProfile;
  srsRegistry: Record<string, WordSRSRecord>;
  customBookmarks: string[];
}
