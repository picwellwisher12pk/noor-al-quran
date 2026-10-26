-- ============================================================================
-- Gamified Quranic Arabic Learning Module - Relational / SQLite Schema
-- Architecture for Curriculum, Linguistic Word Corpus, and SRS User Progress
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. CURRICULUM HIERARCHY
-- ----------------------------------------------------------------------------

-- Phases (Stages 1 through 5 of the 'Path of Light' / Sirat)
CREATE TABLE IF NOT EXISTS learning_phases (
  phase_number INTEGER PRIMARY KEY CHECK(phase_number BETWEEN 1 AND 5),
  id TEXT NOT NULL UNIQUE,                       -- e.g. 'stage_1_foundation'
  title TEXT NOT NULL,                          -- e.g. 'Stage 1: The Foundation'
  title_arabic TEXT NOT NULL,                   -- e.g. 'المرحلة الأولى: الأساس والتجويد'
  subtitle TEXT NOT NULL,                       -- e.g. 'Reading & Tajweed Basics'
  goal TEXT NOT NULL,                           -- Pedagogical outcome
  target_comprehension_percentage REAL NOT NULL,-- e.g. 0.0, 50.0, 70.0, 85.0, 100.0
  color_theme TEXT NOT NULL,                    -- CSS/Tailwind token
  icon_name TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Units within a Phase
CREATE TABLE IF NOT EXISTS learning_units (
  id TEXT PRIMARY KEY,                          -- e.g. 'stage2_u1_particles'
  phase_number INTEGER NOT NULL,
  unit_index INTEGER NOT NULL,                  -- 1-based order in phase
  title TEXT NOT NULL,                          -- e.g. 'Golden Particles'
  title_arabic TEXT NOT NULL,                   -- e.g. 'حروف الجر والعطف الذهبية'
  description TEXT NOT NULL,
  checkpoint_lesson_id TEXT,                    -- Reference to the final unit checkpoint lesson
  previous_unit_id TEXT,                        -- Prerequisite unit for unlock gating
  min_phase_xp INTEGER DEFAULT 0,
  FOREIGN KEY (phase_number) REFERENCES learning_phases(phase_number) ON DELETE CASCADE,
  FOREIGN KEY (previous_unit_id) REFERENCES learning_units(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_units_phase ON learning_units(phase_number, unit_index);

-- Lessons (Bite-sized nodes: concept intro, word drill, grammar rule, game, checkpoint)
CREATE TABLE IF NOT EXISTS learning_lessons (
  id TEXT PRIMARY KEY,                          -- e.g. 'stage2_u1_l1'
  unit_id TEXT NOT NULL,
  phase_number INTEGER NOT NULL,
  lesson_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_arabic TEXT NOT NULL,
  description TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK(lesson_type IN (
    'concept_intro', 'word_drill', 'grammar_rule',
    'interactive_game', 'unit_checkpoint', 'boss_battle', 'certification_exam'
  )),
  estimated_minutes INTEGER NOT NULL DEFAULT 4,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  gem_reward INTEGER NOT NULL DEFAULT 5,
  audio_intro_url TEXT,
  is_checkpoint INTEGER NOT NULL DEFAULT 0 CHECK(is_checkpoint IN (0, 1)),
  boss_battle_ayah_range TEXT,                  -- JSON encoded: { chapterId, fromAyah, toAyah }
  unlock_requirement TEXT,                      -- JSON encoded: { previousLessonId, minPhaseXP, requiredStars }
  FOREIGN KEY (unit_id) REFERENCES learning_units(id) ON DELETE CASCADE,
  FOREIGN KEY (phase_number) REFERENCES learning_phases(phase_number) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lessons_unit ON learning_lessons(unit_id, lesson_index);

-- ----------------------------------------------------------------------------
-- 2. LINGUISTIC CORPUS & WORD NODES
-- ----------------------------------------------------------------------------

-- Word Nodes (High-frequency Quranic vocabulary and grammatical tokens)
CREATE TABLE IF NOT EXISTS learning_words (
  id TEXT PRIMARY KEY,                          -- e.g. 'quran_w_1_1_2'
  text_uthmani TEXT NOT NULL,                   -- Sacred Uthmani script with Tashkeel
  text_simple TEXT NOT NULL,                    -- Unvocalized / bare Arabic
  transliteration TEXT NOT NULL,                -- e.g. 'Al-Rahman'
  translation_en TEXT NOT NULL,                 -- English meaning
  translation_urdu TEXT NOT NULL,               -- Urdu meaning
  additional_meanings TEXT,                     -- JSON array of secondary meanings
  root TEXT NOT NULL,                           -- Triliteral/quadriliteral root (e.g. 'ع ل م')
  root_transliteration TEXT,                    -- e.g. ''A-L-M'
  part_of_speech TEXT NOT NULL CHECK(part_of_speech IN ('ism', 'fil', 'harf')),
  pos_detail TEXT NOT NULL,                     -- 'noun', 'past_verb', 'preposition', etc.
  pos_label_arabic TEXT NOT NULL,               -- e.g. 'اسم', 'فعل ماض', 'حرف جر'
  pos_label_english TEXT NOT NULL,
  morphological_form TEXT,                      -- JSON encoded: { formNumber, tense, case, gender, pattern }
  frequency_in_quran INTEGER NOT NULL DEFAULT 1,-- Authentic corpus count
  audio_cdn_url TEXT NOT NULL,                  -- Pronunciation audio URL
  sample_ayah TEXT NOT NULL,                    -- JSON encoded: { verseKey, chapterId, verseNumber, textUthmani, translationEn, highlightWordIndex }
  semantic_tags TEXT                            -- JSON array of cluster tags
);

CREATE INDEX IF NOT EXISTS idx_words_root ON learning_words(root);
CREATE INDEX IF NOT EXISTS idx_words_pos ON learning_words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_words_frequency ON learning_words(frequency_in_quran DESC);

-- Association between Lessons and Words (Which words are taught/tested in which lessons)
CREATE TABLE IF NOT EXISTS lesson_word_associations (
  lesson_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, word_id),
  FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES learning_words(id) ON DELETE CASCADE
);

-- Mini-Game Payloads associated with Lessons
CREATE TABLE IF NOT EXISTS lesson_mini_game_payloads (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN (
    'root_tree_builder', 'ayah_puzzle', 'color_code_grammar',
    'tajweed_rhythm_tap', 'voice_match', 'memory_matrix'
  )),
  payload_json TEXT NOT NULL,                   -- Strictly validated MiniGamePayload JSON
  order_index INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_payloads_lesson ON lesson_mini_game_payloads(lesson_id, order_index);

-- ----------------------------------------------------------------------------
-- 3. USER PROFILE & SRS PROGRESS
-- ----------------------------------------------------------------------------

-- User Gamification Profile
CREATE TABLE IF NOT EXISTS user_learning_profile (
  user_id TEXT PRIMARY KEY,                     -- 'local_user' or authenticated ID
  total_xp INTEGER NOT NULL DEFAULT 0,
  barakah_gems INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT NOT NULL,               -- 'YYYY-MM-DD'
  streak_freeze_count INTEGER NOT NULL DEFAULT 0,
  hearts_current INTEGER NOT NULL DEFAULT 5 CHECK(hearts_current BETWEEN 0 AND 5),
  hearts_max INTEGER NOT NULL DEFAULT 5,
  last_heart_regen_timestamp INTEGER NOT NULL,  -- Epoch timestamp
  current_phase INTEGER NOT NULL DEFAULT 1 CHECK(current_phase BETWEEN 1 AND 5),
  current_unit_id TEXT NOT NULL,
  current_lesson_id TEXT NOT NULL,
  unlocked_checkpoints TEXT NOT NULL DEFAULT '[]', -- JSON array of checkpoint lesson IDs
  total_words_learned INTEGER NOT NULL DEFAULT 0,
  total_words_mastered INTEGER NOT NULL DEFAULT 0,
  percent_of_quran_understood REAL NOT NULL DEFAULT 0.0,
  league_tier TEXT NOT NULL DEFAULT 'bronze' CHECK(league_tier IN ('bronze', 'silver', 'gold', 'pearl', 'jannah')),
  learner_lens_active INTEGER NOT NULL DEFAULT 0 CHECK(learner_lens_active IN (0, 1)),
  updated_at TEXT NOT NULL
);

-- Spaced Repetition System (SRS) Records per word
CREATE TABLE IF NOT EXISTS user_srs_words (
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK(mastery_level BETWEEN 0 AND 5),
  repetition_count INTEGER NOT NULL DEFAULT 0,
  interval_days REAL NOT NULL DEFAULT 0.0,
  ease_factor REAL NOT NULL DEFAULT 2.5 CHECK(ease_factor >= 1.3),
  last_reviewed_at TEXT NOT NULL,               -- ISO 8601 string
  next_review_at TEXT NOT NULL,               -- ISO 8601 string for query scheduling
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_mistakes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, word_id),
  FOREIGN KEY (user_id) REFERENCES user_learning_profile(user_id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES learning_words(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_srs_next_review ON user_srs_words(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_srs_mastery ON user_srs_words(user_id, mastery_level);

-- Lesson Completion History
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,                   -- ISO timestamp
  high_score INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 1 CHECK(stars_earned BETWEEN 1 AND 3),
  practice_completed INTEGER NOT NULL DEFAULT 0 CHECK(practice_completed IN (0, 1)),
  test_mode_passed INTEGER NOT NULL DEFAULT 0 CHECK(test_mode_passed IN (0, 1)),
  attempts_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES user_learning_profile(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES learning_lessons(id) ON DELETE CASCADE
);

-- Daily Activity Logs for Heatmap and Streak Tracking
CREATE TABLE IF NOT EXISTS user_daily_learning_logs (
  user_id TEXT NOT NULL,
  activity_date TEXT NOT NULL,                  -- 'YYYY-MM-DD'
  xp_gained INTEGER NOT NULL DEFAULT 0,
  words_reviewed INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date),
  FOREIGN KEY (user_id) REFERENCES user_learning_profile(user_id) ON DELETE CASCADE
);
