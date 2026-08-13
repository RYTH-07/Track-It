-- Streak freeze tokens.
-- A "freeze" auto-protects a student's streak if they miss exactly one day.
-- Earned passively (1 per 500 XP), capped at 3 held at once so it stays a
-- safety net rather than something to hoard indefinitely.

ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS streak_freezes integer NOT NULL DEFAULT 0;

ALTER TABLE user_stats
  DROP CONSTRAINT IF EXISTS streak_freezes_range;

ALTER TABLE user_stats
  ADD CONSTRAINT streak_freezes_range CHECK (streak_freezes >= 0 AND streak_freezes <= 3);
