/**
 * Procedural Quiz & Game Engine Verification Suite
 * Validates randomization, payload schemas, distractor algorithms, and mode configurations.
 */

import {
  generateSoundSniper,
  generateRootRadar,
  generateGrammarSort,
  generateAyahPuzzle,
  generateSession
} from "../src/lib/quiz-engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

console.log("==================================================================");
console.log("🧪 Running Procedural Quiz & Game Engine Test Suite");
console.log("==================================================================");

// --- 1. Sound Sniper Tests ---
console.log("\n[Test 1] Sound Sniper Generator (Letter & Word Modes)");
{
  const letterPayload = generateSoundSniper({ mode: "letter" });
  assert(letterPayload.type === "sound_sniper", "Payload type is 'sound_sniper'");
  assert(typeof letterPayload.promptAudioUrl === "string" && letterPayload.promptAudioUrl.length > 0, "Prompt audio URL is present");
  assert(letterPayload.options.length === 4, "Generates exactly 4 options");
  
  const correctOptions = letterPayload.options.filter(o => o.isCorrect);
  assert(correctOptions.length === 1, "Has exactly 1 correct option");
  
  const uniqueOptionTexts = new Set(letterPayload.options.map(o => o.textArabic));
  assert(uniqueOptionTexts.size === 4, "All 4 options are distinct (no duplicates)");

  const wordPayload = generateSoundSniper({ mode: "word" });
  assert(wordPayload.target.textArabic.length > 0, "Word mode generates authentic Arabic word");
  assert(wordPayload.options.length === 4, "Word mode generates 4 options");
  assert(wordPayload.options.filter(o => o.isCorrect).length === 1, "Word mode has 1 correct option");
}

// --- 2. Root Radar Tests ---
console.log("\n[Test 2] Root Radar Generator (Sarf Morphology)");
{
  const rootPayload = generateRootRadar();
  assert(rootPayload.type === "root_radar", "Payload type is 'root_radar'");
  assert(typeof rootPayload.root === "string" && rootPayload.root.length >= 3, "Valid triliteral root selected");
  assert(rootPayload.options.length === 5, "Generates 5 total options (3 derivatives + 2 distractors)");
  
  const derivatives = rootPayload.options.filter(o => o.isDerivative);
  const distractors = rootPayload.options.filter(o => !o.isDerivative);
  assert(derivatives.length === 3, "Exactly 3 authentic derivatives included");
  assert(distractors.length === 2, "Exactly 2 distractors included");

  const uniqueWords = new Set(rootPayload.options.map(o => o.wordArabic));
  assert(uniqueWords.size === 5, "All 5 words are unique without duplicates");
  assert(distractors.every(d => d.root !== rootPayload.root), "Distractors belong to different root families");
}

// --- 3. Grammar Sort Tests ---
console.log("\n[Test 3] Grammar Sort Generator (Classical Nahw)");
{
  const grammarPayload = generateGrammarSort();
  assert(grammarPayload.type === "grammar_sort", "Payload type is 'grammar_sort'");
  assert(grammarPayload.tokens.length >= 3, "Contains at least 3 tokens from verse");
  assert(grammarPayload.categories.length === 3, "Defines all 3 Classical categories (Ism, Fi'l, Harf)");

  for (const token of grammarPayload.tokens) {
    assert(["ism", "fil", "harf"].includes(token.correctCategory), `Token '${token.textArabic}' has valid category: ${token.correctCategory}`);
  }

  const tokenIds = new Set(grammarPayload.tokens.map(t => t.id));
  assert(tokenIds.size === grammarPayload.tokens.length, "Token IDs are all unique");
}

// --- 4. Ayah Puzzle Tests ---
console.log("\n[Test 4] Ayah Puzzle Builder (Syntax & Alignment)");
{
  const puzzlePayload = generateAyahPuzzle();
  assert(puzzlePayload.type === "ayah_puzzle", "Payload type is 'ayah_puzzle'");
  assert(typeof puzzlePayload.verseKey === "string", `Generated verse key: ${puzzlePayload.verseKey}`);
  assert(puzzlePayload.scrambledBlocks.length > puzzlePayload.correctSequenceWordIds.length, "Includes distractor tiles alongside valid blocks");
  
  const validBlocks = puzzlePayload.scrambledBlocks.filter(b => !b.isDistractor);
  const distractorBlocks = puzzlePayload.scrambledBlocks.filter(b => b.isDistractor);
  assert(validBlocks.length === puzzlePayload.correctSequenceWordIds.length, "Valid blocks count matches solution sequence length");
  assert(distractorBlocks.length >= 1, "At least 1 distractor block added to prevent trivial elimination");

  assert(puzzlePayload.wbwPairs.length === validBlocks.length, "Word-by-word pairs align 1:1 with authentic verse words");
}

// --- 5. Session Generator Tests (Practice vs. Test Mode) ---
console.log("\n[Test 5] Adaptive Session Generator (Practice vs. Test Mode)");
{
  // Practice Mode
  const practiceSession = generateSession("practice", "unit_stage2_particles", { questionCount: 8 });
  assert(practiceSession.mode === "practice", "Session mode is 'practice'");
  assert(practiceSession.config.hintsAllowed === true, "Practice mode allows hints");
  assert(practiceSession.config.maxHearts === null, "Practice mode has infinite hearts");
  assert(practiceSession.config.timerSecondsPerQuestion === null, "Practice mode has no timer pressure");
  assert(practiceSession.config.immediateFeedback === true, "Practice mode shows immediate explanation feedback");
  assert(practiceSession.config.xpMultiplier === 1.0, "Practice mode uses base 1x XP");
  assert(practiceSession.questions.length === 8, "Generates requested 8 practice questions");

  // Test Mode
  const testSession = generateSession("test", "unit_stage2_particles");
  assert(testSession.mode === "test", "Session mode is 'test'");
  assert(testSession.config.hintsAllowed === false, "Test mode disallows hints");
  assert(testSession.config.maxHearts === 3, "Test mode enforces strictly 3 hearts / lives");
  assert(testSession.config.timerSecondsPerQuestion === 15, "Test mode enforces 15-second countdown timer");
  assert(testSession.config.passAccuracyThreshold === 0.85, "Test mode enforces strict 85% pass threshold");
  assert(testSession.config.xpMultiplier === 3.0, "Test mode awards 3x XP multiplier");
  assert(testSession.questions.length === 15, "Test mode generates 15 rapid-fire checkpoint questions");

  // Verify diversity of question types in session
  const questionTypes = new Set(testSession.questions.map(q => q.type));
  assert(questionTypes.size >= 4, "Session includes all 4 distinct interactive game formats");
}

console.log("\n==================================================================");
console.log("🎉 All 17 Quiz & Game Engine Verifications Passed Cleanly!");
console.log("==================================================================");
